import Foundation
import XCTest
@testable import RitKompasCore

private enum NativeFixtureError: Error { case clearFailed }
private final class ScopeTestClock: @unchecked Sendable {
    private let lock = NSLock()
    private var value: Int64 = 1000000
    func now() -> Int64 { lock.lock(); defer { lock.unlock() }; return value }
    func expire() { lock.lock(); defer { lock.unlock() }; value = 2000000 }
}
private actor CandidateFixture: NativeCredentialSource {
    var value: NativeCredentialCandidate? = NativeCredentialCandidate(version: UUID(), headers: ["Cookie": "CF_Authorization=synthetic-not-a-token"])
    var failClear = false
    func candidate(for origin: APIOrigin) async throws -> NativeCredentialCandidate {
        guard let value else { throw NativeAPIError.signInRequired }; return value
    }
    func rotate(sameVersion: Bool = false) {
        value = NativeCredentialCandidate(version: sameVersion ? value!.version : UUID(), headers: ["Cookie": "CF_Authorization=synthetic-rotated-not-a-token"])
    }
    func clearFailure() { failClear = true }
    func expectViewer(_ id: String) {
        value = NativeCredentialCandidate(version: UUID(), headers: value!.headers, expectedViewerID: id)
    }
    func clear() async throws { if failClear { throw NativeFixtureError.clearFailed }; value = nil }
}
private actor ScopeFixture: NativeScopeVerifier {
    var scope = NativeVerifiedScope(viewerID: "server-viewer", vehicleID: "vehicle", expiresAt: 2000000)
    var failure: NativeAPIError?
    var calls = 0
    var hold = false, started = false
    var waiting: CheckedContinuation<Void, Never>?
    var observer: CheckedContinuation<Void, Never>?
    func set(_ scope: NativeVerifiedScope) { self.scope = scope }
    func deny() { failure = .accessDenied }
    func offline() { failure = .connectionUncertain }
    func count() -> Int { calls }
    func holdNext() { hold = true; started = false }
    func waitForHeld() async {
        if started { return }
        await withCheckedContinuation { observer = $0 }
    }
    func release() { waiting?.resume(); waiting = nil }
    func verify(origin: APIOrigin, vehicleID: String, candidate: NativeCredentialCandidate) async throws -> NativeVerifiedScope {
        calls += 1; let result = scope
        if let failure { throw failure }
        if hold {
            hold = false
            await withCheckedContinuation { continuation in
                waiting = continuation; started = true; observer?.resume(); observer = nil
            }
        }
        return result
    }
}
final class VerifiedNativeSessionTests: XCTestCase {
    private let origin = try! APIOrigin("https://native.example.invalid")
    private func make(_ credentials: CandidateFixture, _ verifier: ScopeFixture) -> VerifiedNativeSession {
        VerifiedNativeSession(origin: origin, vehicleID: "vehicle", credentials: credentials, verifier: verifier, clock: { 1000000 })
    }
    func testDefaultDenyAndWrongOriginOrVehicleNeverVerify() async throws {
        let closed = VerifiedNativeSession(origin: origin, vehicleID: "vehicle")
        do { _ = try await closed.grant(for: origin); XCTFail("Unconfigured source") } catch NativeAPIError.sessionNotConfigured {}
        let verifier = ScopeFixture(), sut = make(CandidateFixture(), verifier)
        do { _ = try await sut.grant(for: APIOrigin("https://other.example.invalid")); XCTFail("Origin") } catch NativeAPIError.invalidOrigin {}
        do { _ = try await sut.verifiedScope(vehicleID: "other"); XCTFail("Vehicle") } catch NativeAPIError.accessDenied {}
        let calls = await verifier.count(); XCTAssertEqual(calls, 0)
    }
    func testGrantAndQueueScopeUseFreshServerIdentityNotCandidateIdentity() async throws {
        let credentials = CandidateFixture(), verifier = ScopeFixture(), sut = make(credentials, verifier)
        let grant = try await sut.grant(for: origin)
        XCTAssertEqual(grant.expectedViewerID, "server-viewer")
        let scope = try await sut.verifiedScope(vehicleID: "vehicle")
        XCTAssertEqual(scope.viewerID, "server-viewer"); XCTAssertEqual(scope.vehicleID, "vehicle")
        let calls = await verifier.count(); XCTAssertEqual(calls, 1)
        _ = try await sut.grant(for: origin) // API access always re-verifies.
        await verifier.deny()
        do { _ = try await sut.grant(for: origin); XCTFail("Revoked membership") } catch NativeAPIError.accessDenied {}
        do { _ = try await sut.verifiedScope(vehicleID: "vehicle"); XCTFail("Known revocation clears queue proof") } catch NativeAPIError.signInRequired {}
    }
    func testUnknownExpiredAndWrongScopeCannotGrant() async throws {
        for scope in [NativeVerifiedScope(version: 2, viewerID: "u", vehicleID: "vehicle", expiresAt: 2000000),
                      NativeVerifiedScope(viewerID: "u", vehicleID: "vehicle", expiresAt: 1000000),
                      NativeVerifiedScope(viewerID: "", vehicleID: "vehicle", expiresAt: 2000000),
                      NativeVerifiedScope(viewerID: "u", vehicleID: "other", expiresAt: 2000000)] {
            let verifier = ScopeFixture(); await verifier.set(scope)
            do { _ = try await make(CandidateFixture(), verifier).grant(for: origin); XCTFail("Invalid scope") }
            catch NativeAPIError.invalidSessionGrant {}
        }
    }
    func testOfflineLocalQueueProofCannotAuthorizeAnotherAPIGrant() async throws {
        let verifier = ScopeFixture(), sut = make(CandidateFixture(), verifier)
        _ = try await sut.grant(for: origin)
        await verifier.offline()
        let scope = try await sut.verifiedScope(vehicleID: "vehicle")
        XCTAssertEqual(scope.viewerID, "server-viewer")
        do { _ = try await sut.grant(for: origin); XCTFail("Offline proof is not an API grant") } catch NativeAPIError.connectionUncertain {}
        let retained = try await sut.verifiedScope(vehicleID: "vehicle")
        XCTAssertEqual(retained.viewerID, "server-viewer")
        let calls = await verifier.count(); XCTAssertEqual(calls, 2)
    }
    func testExpiredLocalProofCannotBeUsedOffline() async throws {
        let credentials = CandidateFixture(), verifier = ScopeFixture(), clock = ScopeTestClock()
        let sut = VerifiedNativeSession(origin: origin, vehicleID: "vehicle", credentials: credentials, verifier: verifier, clock: { clock.now() })
        _ = try await sut.grant(for: origin)
        clock.expire(); await verifier.offline()
        do { _ = try await sut.verifiedScope(vehicleID: "vehicle"); XCTFail("Expired offline proof") } catch NativeAPIError.connectionUncertain {}
    }
    func testChangedViewerPermanentlyClosesThisBinding() async throws {
        let verifier = ScopeFixture(), sut = make(CandidateFixture(), verifier)
        _ = try await sut.grant(for: origin)
        await verifier.set(NativeVerifiedScope(viewerID: "other", vehicleID: "vehicle", expiresAt: 2000000))
        do { _ = try await sut.grant(for: origin); XCTFail("Must not switch account") } catch ChoiceQueueError.sessionChanged {}
        await verifier.set(NativeVerifiedScope(viewerID: "server-viewer", vehicleID: "vehicle", expiresAt: 2000000))
        do { _ = try await sut.grant(for: origin); XCTFail("Must stay closed") } catch NativeAPIError.signInRequired {}
    }
    func testAuthenticatedStatusAndVehicleScopeMustAgreeOnViewer() async throws {
        let credentials = CandidateFixture(), verifier = ScopeFixture()
        await credentials.expectViewer("different-status-viewer")
        let sut = make(credentials, verifier)
        do { _ = try await sut.grant(for: origin); XCTFail("Status and scope identity mismatch") }
        catch ChoiceQueueError.sessionChanged {}
        do { _ = try await sut.verifiedScope(vehicleID: "vehicle"); XCTFail("Mismatched account must stay closed") }
        catch NativeAPIError.signInRequired {}
    }
    func testCredentialRotationDuringResponseRejectsOldProofIncludingBrokenVersionSource() async throws {
        for sameVersion in [false, true] {
            let credentials = CandidateFixture(), verifier = ScopeFixture(), sut = make(credentials, verifier)
            await verifier.holdNext()
            let targetOrigin = origin
            let pending = Task { try await sut.grant(for: targetOrigin) }
            await verifier.waitForHeld(); await credentials.rotate(sameVersion: sameVersion); await verifier.release()
            do { _ = try await pending.value; XCTFail("Stale credentials") } catch ChoiceQueueError.sessionChanged {}
        }
    }
    func testLogoutDuringVerificationCannotReopenSession() async throws {
        let verifier = ScopeFixture(), sut = make(CandidateFixture(), verifier)
        await verifier.holdNext()
        let targetOrigin = origin
        let pending = Task { try await sut.grant(for: targetOrigin) }
        await verifier.waitForHeld(); try await sut.signOut(); await verifier.release()
        do { _ = try await pending.value; XCTFail("Late response after logout") } catch NativeAPIError.signInRequired {}
        do { _ = try await sut.verifiedScope(vehicleID: "vehicle"); XCTFail("Closed scope") } catch NativeAPIError.signInRequired {}
    }
    func testFailedCredentialDeletionStillClosesLocally() async throws {
        let credentials = CandidateFixture(), sut = make(credentials, ScopeFixture())
        _ = try await sut.grant(for: origin); await credentials.clearFailure()
        do { try await sut.signOut(); XCTFail("Deletion failure") } catch NativeFixtureError.clearFailed {}
        do { _ = try await sut.grant(for: origin); XCTFail("Closed even when disk fails") } catch NativeAPIError.signInRequired {}
    }
    func testVehicleBindingClosesWithoutDeletingSharedCredentialsOrAcceptingLateProof() async throws {
        let credentials = CandidateFixture(), verifier = ScopeFixture(), sut = make(credentials, verifier)
        await verifier.holdNext()
        let targetOrigin = origin
        let pending = Task { try await sut.grant(for: targetOrigin) }
        await verifier.waitForHeld(); await sut.close(); await verifier.release()
        do { _ = try await pending.value; XCTFail("Closed binding accepted late proof") }
        catch NativeAPIError.signInRequired {}
        _ = try await credentials.candidate(for: origin) // Vehicle switch is not logout.
        do { _ = try await sut.verifiedScope(vehicleID: "vehicle"); XCTFail("Closed queue binding reopened") }
        catch NativeAPIError.signInRequired {}
    }
    func testCancelledGrantMakesNoVerificationAndHeadersNeverDebugPrint() async throws {
        let verifier = ScopeFixture(), sut = make(CandidateFixture(), verifier)
        let targetOrigin = origin
        let cancelled = Task { withUnsafeCurrentTask { $0?.cancel() }; return try await sut.grant(for: targetOrigin) }
        do { _ = try await cancelled.value; XCTFail("Cancellation") } catch is CancellationError {}
        let calls = await verifier.count(); XCTAssertEqual(calls, 0)
        let candidate = NativeCredentialCandidate(version: UUID(), headers: ["Cookie": "synthetic-private-value"])
        XCTAssertFalse(String(describing: candidate).contains("synthetic-private-value"))
        XCTAssertFalse(String(reflecting: candidate).contains("synthetic-private-value"))
        XCTAssertFalse(validNativeHeaders(["Cookie": "x", "cookie": "y"]))
        XCTAssertFalse(validNativeHeaders(["Cookie": "x\r\nInjected: y"]))
        XCTAssertFalse(validNativeHeaders(["x-ritkompas-viewer": "u"]))
    }
}
