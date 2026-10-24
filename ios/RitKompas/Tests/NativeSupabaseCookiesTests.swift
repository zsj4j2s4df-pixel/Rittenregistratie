import XCTest
@testable import RitKompasCore

final class NativeSupabaseCookiesTests: XCTestCase {
    private let origin = try! APIOrigin("https://example.invalid")
    private let now = Date(timeIntervalSince1970: 1_800_000_000)
    private let names = ["__Host-ritkompas-session", "__Host-ritkompas-binding", "__Host-ritkompas-refresh", "__Host-ritkompas-remember"]
    private func cookie(_ name: String, value: String = "synthetic", domain: String = "example.invalid", path: String = "/", secure: Bool = true, httpOnly: Bool = true, expires: Date? = nil) -> HTTPCookie {
        var p: [HTTPCookiePropertyKey: Any] = [.name: name, .value: value, .domain: domain, .path: path]
        if secure { p[.secure] = "TRUE" }
        if httpOnly { p[HTTPCookiePropertyKey("HttpOnly")] = "TRUE" }
        if let expires { p[.expires] = expires }
        return HTTPCookie(properties: p)!
    }
    private func bundle(remember: Bool = false) -> [HTTPCookie] {
        names.map { cookie($0, value: $0 == names[3] ? (remember ? "yes" : "no") : "synthetic.signature", expires: remember ? now.addingTimeInterval(3600) : nil) }
    }
    func testSessionCookiesStayMemoryOnlyAndRedacted() throws {
        let value = try NativeSupabaseCookies(origin: origin, cookies: bundle(), now: now)
        XCTAssertFalse(try value.mayPersist(for: origin, now: now))
        XCTAssertFalse(String(reflecting: value).contains("synthetic.signature"))
        XCTAssertFalse(String(describing: value).contains("synthetic.signature"))
    }
    func testApiHeadersContainBothBindingAndSessionButNoRefresh() throws {
        let value = try NativeSupabaseCookies(origin: origin, cookies: bundle(), now: now)
        let header = try XCTUnwrap(value.headers(for: origin, now: now)["Cookie"])
        XCTAssertTrue(header.contains(names[0] + "=")); XCTAssertTrue(header.contains(names[1] + "="))
        XCTAssertFalse(header.contains(names[2])); XCTAssertFalse(header.contains("CF_Authorization"))
        XCTAssertTrue(try XCTUnwrap(value.headers(for: origin, now: now, refreshing: true)["Cookie"]).contains(names[2] + "="))
    }
    func testRememberRequiresRealUnexpiredCookieLifetimes() throws {
        let value = try NativeSupabaseCookies(origin: origin, cookies: bundle(remember: true), now: now)
        XCTAssertTrue(try value.mayPersist(for: origin, now: now))
        XCTAssertThrowsError(try value.headers(for: origin, now: now.addingTimeInterval(3600)))
        var missingExpiry = bundle(remember: true); missingExpiry[0] = cookie(names[0])
        XCTAssertThrowsError(try NativeSupabaseCookies(origin: origin, cookies: missingExpiry, now: now))
    }
    func testMissingBindingDuplicateAndLegacyOnlyAreRejected() {
        XCTAssertThrowsError(try NativeSupabaseCookies(origin: origin, cookies: bundle().filter { $0.name != names[1] }, now: now))
        XCTAssertThrowsError(try NativeSupabaseCookies(origin: origin, cookies: bundle() + [cookie(names[0])], now: now))
        XCTAssertThrowsError(try NativeSupabaseCookies(origin: origin, cookies: [cookie("CF_Authorization")], now: now))
    }
    func testWrongHostDomainPathAndSecurityFlagsAreRejected() {
        for replacement in [cookie(names[0], domain: "other.invalid"), cookie(names[0], domain: ".example.invalid"), cookie(names[0], path: "/login"), cookie(names[0], secure: false), cookie(names[0], httpOnly: false)] {
            var input = bundle(); input[0] = replacement
            XCTAssertThrowsError(try NativeSupabaseCookies(origin: origin, cookies: input, now: now))
        }
    }
    func testHeaderInjectionAndInvalidRememberAreRejected() throws {
        let baseline = try NativeSupabaseCookies(origin: origin, cookies: bundle(), now: now)
        for bad in ["", "with space", "x;other=1", "x,other", "x\r\nX-Bad:1", String(repeating: "a", count: 3801)] {
            // Foundation itself refuses some malformed HTTPCookies. Exercise
            // our own guard through the actual persisted-candidate decode path.
            var object = try XCTUnwrap(JSONSerialization.jsonObject(with: JSONEncoder().encode(baseline)) as? [String: Any])
            var values = try XCTUnwrap(object["values"] as? [String: [String: Any]])
            values[names[0]]?["value"] = bad; object["values"] = values
            let decoded = try JSONDecoder().decode(NativeSupabaseCookies.self, from: JSONSerialization.data(withJSONObject: object))
            XCTAssertThrowsError(try decoded.headers(for: origin, now: now))
        }
        var input = bundle(); input[3] = cookie(names[3], value: "true")
        XCTAssertThrowsError(try NativeSupabaseCookies(origin: origin, cookies: input, now: now))
    }
    func testCodableRestorationRechecksScopeAndExpiry() throws {
        let value = try NativeSupabaseCookies(origin: origin, cookies: bundle(remember: true), now: now)
        let decoded = try JSONDecoder().decode(NativeSupabaseCookies.self, from: JSONEncoder().encode(value))
        XCTAssertThrowsError(try decoded.headers(for: APIOrigin("https://other.invalid"), now: now))
        XCTAssertThrowsError(try decoded.headers(for: origin, now: now.addingTimeInterval(3601)))
        XCTAssertEqual(try decoded.headers(for: origin, now: now), try value.headers(for: origin, now: now))
    }
}
