#if canImport(Security)
import XCTest
@testable import RitKompasCore
final class NativeCredentialTests: XCTestCase {
    func testCookieIsExactOriginBoundAndRedacted() throws {
        let origin = try APIOrigin("https://example.invalid")
        let cookie = try NativeAccessCookie(origin: origin, value: "synthetic.signature", expiresAt: Int64.max)
        XCTAssertEqual(try cookie.headers(for: origin, now: 1), ["Cookie": "CF_Authorization=synthetic.signature"])
        XCTAssertThrowsError(try cookie.headers(for: APIOrigin("https://other.invalid"), now: 1))
        XCTAssertThrowsError(try cookie.headers(for: origin, now: Int64.max))
        XCTAssertFalse(String(reflecting: cookie).contains("synthetic.signature"))
    }
    func testCookieRefusesHeaderInjectionAndExpiredCandidate() throws {
        let origin = try APIOrigin("https://example.invalid")
        for token in ["", "token; extra=1", "token\r\nX-Test: bad", "with space", "token,other", String(repeating: "a", count: 16_001)] {
            XCTAssertThrowsError(try NativeAccessCookie(origin: origin, value: token, expiresAt: Int64.max))
        }
        XCTAssertThrowsError(try NativeAccessCookie(origin: origin, value: "synthetic", expiresAt: 1))
    }
    func testStagingNeverPersistsOrGrantsIdentityAndClearClosesActor() async throws {
        let origin = try APIOrigin("https://example.invalid")
        // Stage/candidate uses memory only; clear deletes this unique synthetic
        // test namespace. No real keychain item is read, added or overwritten.
        let credentials = KeychainNativeCredentials(origin: origin, service: "test.ritkompas." + UUID().uuidString)
        let cookie = try NativeAccessCookie(origin: origin, value: "synthetic", expiresAt: Int64.max)
        try await credentials.stage(cookie)
        let first = try await credentials.candidate(for: origin)
        let second = try await credentials.candidate(for: origin)
        XCTAssertEqual(first.version, second.version)
        try await credentials.stage(cookie)
        let rotated = try await credentials.candidate(for: origin)
        XCTAssertNotEqual(first.version, rotated.version)
        try await credentials.clear()
        do { _ = try await credentials.candidate(for: origin); XCTFail("closed actor reopened") } catch {}
        do { try await credentials.stage(cookie); XCTFail("closed actor restaged") } catch {}
    }
}
#endif
