import XCTest
@testable import RitKompasCore

private actor CookieMemory: NativeSupabasePersistence {
    var value: NativeSupabaseCookies?
    var fail = false
    func load() -> NativeSupabaseCookies? { value }
    func save(_ cookies: NativeSupabaseCookies) throws { if fail { throw NativeAPIError.unavailable }; value = cookies }
    func remove() { value = nil }
    func stored() -> Bool { value != nil }
    func failing() { fail = true }
}
private actor CookieTransport: NativeSupabaseTransport {
    var status: NativeAuthStatus
    var rotation: NativeAuthRotation
    var refreshes = 0, logouts = 0
    var offline = false, paused = false, entered = false
    var continuation: CheckedContinuation<Void, Never>?
    init(status: NativeAuthStatus, rotation: NativeAuthRotation) { self.status = status; self.rotation = rotation }
    func inspect(origin: APIOrigin, cookies: NativeSupabaseCookies) async throws -> NativeAuthStatus {
        entered = true
        if paused { await withCheckedContinuation { continuation = $0 } }
        if offline { throw NativeAPIError.connectionUncertain }
        return status
    }
    func refresh(origin: APIOrigin, cookies: NativeSupabaseCookies) throws -> NativeAuthRotation { refreshes += 1; if offline { throw NativeAPIError.connectionUncertain }; return rotation }
    func logout(origin: APIOrigin, cookies: NativeSupabaseCookies) throws { logouts += 1; if offline { throw NativeAPIError.connectionUncertain } }
    func pause() { paused = true }
    func unavailable() { offline = true }
    func changeViewer(_ id: String) { status = NativeAuthStatus(authenticated: true, viewerId: id, expiresAt: 1_800_006_000_000) }
    func release() { paused = false; continuation?.resume(); continuation = nil }
    func hasEntered() -> Bool { entered }
    func counts() -> (Int, Int) { (refreshes, logouts) }
}
final class NativeSupabaseSessionTests: XCTestCase {
    private let origin = try! APIOrigin("https://example.invalid")
    private let now = Date(timeIntervalSince1970: 1_800_000_000)
    private func cookies(remember: Bool = false, token: String = "synthetic") throws -> NativeSupabaseCookies {
        let names = ["__Host-ritkompas-session", "__Host-ritkompas-binding", "__Host-ritkompas-refresh", "__Host-ritkompas-remember"]
        return try NativeSupabaseCookies(origin: origin, cookies: names.map { name in
            var p: [HTTPCookiePropertyKey: Any] = [.name: name, .value: name == names[3] ? (remember ? "yes" : "no") : token, .domain: "example.invalid", .path: "/", .secure: "TRUE", HTTPCookiePropertyKey("HttpOnly"): "TRUE"]
            if remember { p[.expires] = now.addingTimeInterval(3600) }; return HTTPCookie(properties: p)!
        }, now: now)
    }
    private func fixture(remember: Bool = false, authenticated: Bool = true) throws -> (NativeSupabaseSession, CookieMemory, CookieTransport) {
        let status = NativeAuthStatus(authenticated: authenticated, viewerId: authenticated ? "u" : nil, expiresAt: authenticated ? 1_800_003_000_000 : nil)
        let t = CookieTransport(status: status, rotation: NativeAuthRotation(cookies: try cookies(remember: remember, token: "rotated"), status: NativeAuthStatus(authenticated: true, viewerId: "u", expiresAt: 1_800_003_000_000)))
        let m = CookieMemory(), instant = now
        return (NativeSupabaseSession(origin: origin, transport: t, persistence: m, clock: { instant }), m, t)
    }
    func testRememberOffStaysMemoryOnlyAndCandidateStable() async throws {
        let (s,m,_) = try fixture(); try await s.stage(cookies())
        let a = try await s.candidate(for: origin), b = try await s.candidate(for: origin)
        XCTAssertEqual(a.version,b.version); XCTAssertEqual(a.headers,b.headers); XCTAssertEqual(a.expectedViewerID,"u")
        try await s.persistVerifiedCandidate(); let saved = await m.stored(); XCTAssertFalse(saved)
    }
    func testRememberOnPersistsOnlyAfterVerifiedStep() async throws {
        let (s,m,_) = try fixture(remember:true); try await s.stage(cookies(remember:true)); _ = try await s.candidate(for:origin)
        let before = await m.stored(); XCTAssertFalse(before)
        try await s.persistVerifiedCandidate(); let after = await m.stored(); XCTAssertTrue(after)
    }
    func testExpiredServerSessionRefreshesOnceWithoutJwtDecoding() async throws {
        let (s,_,t) = try fixture(authenticated:false); try await s.stage(cookies())
        let a = try await s.candidate(for:origin), b = try await s.candidate(for:origin)
        XCTAssertTrue(a.headers["Cookie"]!.contains("rotated")); XCTAssertEqual(a.version,b.version)
        let count = await t.counts(); XCTAssertEqual(count.0,1)
    }
    func testLogoutClosesEvenWhenServerFails() async throws {
        let (s,m,t) = try fixture(remember:true); try await s.stage(cookies(remember:true)); _ = try await s.candidate(for:origin); try await s.persistVerifiedCandidate(); await t.unavailable()
        do { try await s.logout(); XCTFail("failure hidden") } catch {}
        do { _ = try await s.candidate(for:origin); XCTFail("reopened") } catch {}
        let saved = await m.stored(); XCTAssertFalse(saved); let count = await t.counts(); XCTAssertEqual(count.1,1)
    }
    func testLateResultAfterClearCannotReopen() async throws {
        let (s,m,t) = try fixture(); try await s.stage(cookies()); await t.pause()
        let requestedOrigin = origin
        let pending = Task { try await s.candidate(for:requestedOrigin) }
        while !(await t.hasEntered()) { await Task.yield() }
        try await s.clear(); await t.release()
        do { _ = try await pending.value; XCTFail("late grant") } catch {}
        let saved = await m.stored(); XCTAssertFalse(saved)
    }
    func testWrongOriginOfflineAndMissingStoreFailClosed() async throws {
        let (s,_,t) = try fixture()
        do { _ = try await s.candidate(for:origin); XCTFail("missing accepted") } catch {}
        try await s.stage(cookies()); await t.unavailable()
        do { _ = try await s.candidate(for:origin); XCTFail("offline grant") } catch {}
        do { _ = try await s.candidate(for:APIOrigin("https://other.invalid")); XCTFail("cross-origin") } catch {}
    }
    func testRememberOffDeletesPreviousStoredAccount() async throws {
        let (s,m,_) = try fixture(remember:true); try await s.stage(cookies(remember:true)); _ = try await s.candidate(for:origin); try await s.persistVerifiedCandidate()
        try await s.stage(cookies()); let saved = await m.stored(); XCTAssertFalse(saved)
    }
    func testPersistenceFailureNotClaimedSuccessful() async throws {
        let (s,m,_) = try fixture(remember:true); try await s.stage(cookies(remember:true)); _ = try await s.candidate(for:origin); await m.failing()
        do { try await s.persistVerifiedCandidate(); XCTFail("keychain failure ignored") } catch {}
        let saved = await m.stored(); XCTAssertFalse(saved)
    }
    func testConcurrentCandidatesShareRefreshAndCommittedVersion() async throws {
        let (s,_,t) = try fixture(authenticated:false); try await s.stage(cookies()); await t.pause()
        let target = origin
        let first = Task { try await s.candidate(for:target) }
        while !(await t.hasEntered()) { await Task.yield() }
        let second = Task { try await s.candidate(for:target) }
        await Task.yield(); await t.release()
        let a = try await first.value, b = try await second.value
        XCTAssertEqual(a.version,b.version); XCTAssertEqual(a.headers,b.headers)
        let count = await t.counts(); XCTAssertEqual(count.0,1)
    }
    func testOldResultCannotCloseOrOverwriteNewExplicitLogin() async throws {
        let (s,_,t) = try fixture(); try await s.stage(cookies()); await t.pause()
        let target = origin, first = Task { try await s.candidate(for:target) }
        while !(await t.hasEntered()) { await Task.yield() }
        try await s.stage(cookies(token:"newaccount")); await t.release()
        do { _ = try await first.value; XCTFail("old login accepted") } catch {}
        let next = try await s.candidate(for:origin)
        XCTAssertTrue(next.headers["Cookie"]!.contains("newaccount"))
    }
}
