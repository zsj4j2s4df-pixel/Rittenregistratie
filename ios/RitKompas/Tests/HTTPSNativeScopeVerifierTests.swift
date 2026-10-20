#if os(iOS) || os(macOS)
import Foundation
import XCTest
@testable import RitKompasCore

// URLProtocol intercepts the entire synthetic session. No DNS, real TLS,
// Cloudflare, login or credentials; these tests exercise URLSession/byte parsing.
private struct ScopeHTTPFixture: Sendable {
    let status: Int
    let body: Data
    let headers: [String: String]
    let foreignResponse: Bool
}
private struct ScopeRequestObservation: Sendable {
    let method: String?
    let path: String?
    let authorization: String?
    let viewer: String?
}
private final class ScopeHTTPState: @unchecked Sendable {
    private let lock = NSLock()
    private var fixtures: [String: ScopeHTTPFixture] = [:]
    private var observations: [String: ScopeRequestObservation] = [:]
    func install(_ fixture: ScopeHTTPFixture, host: String) { lock.lock(); defer { lock.unlock() }; fixtures[host] = fixture }
    func read(_ request: URLRequest) -> ScopeHTTPFixture? {
        lock.lock(); defer { lock.unlock() }
        guard let host = request.url?.host else { return nil }
        observations[host] = ScopeRequestObservation(method: request.httpMethod, path: request.url?.path,
            authorization: request.value(forHTTPHeaderField: "Authorization"), viewer: request.value(forHTTPHeaderField: "x-ritkompas-viewer"))
        return fixtures[host]
    }
    func remove(_ host: String) -> ScopeRequestObservation? {
        lock.lock(); defer { lock.unlock() }; fixtures.removeValue(forKey: host); return observations.removeValue(forKey: host)
    }
}
private final class ScopeURLProtocol: URLProtocol, @unchecked Sendable {
    static let state = ScopeHTTPState()
    override class func canInit(with request: URLRequest) -> Bool { true }
    override class func canonicalRequest(for request: URLRequest) -> URLRequest { request }
    override func startLoading() {
        guard let fixture = Self.state.read(request), let url = request.url,
              let response = HTTPURLResponse(url: fixture.foreignResponse ? URL(string: "https://other.example.invalid/")! : url,
                 statusCode: fixture.status, httpVersion: "HTTP/1.1", headerFields: fixture.headers) else {
            client?.urlProtocol(self, didFailWithError: URLError(.cannotLoadFromNetwork)); return
        }
        client?.urlProtocol(self, didReceive: response, cacheStoragePolicy: .notAllowed)
        client?.urlProtocol(self, didLoad: fixture.body)
        client?.urlProtocolDidFinishLoading(self)
    }
    override func stopLoading() {}
}
final class HTTPSNativeScopeVerifierTests: XCTestCase {
    private func probe(status: Int = 200, body: Data = Data(#"{"session":{"version":1,"viewerId":"u","vehicleId":"v","expiresAt":2000000}}"#.utf8),
                       headers: [String: String] = ["Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store"],
                       foreignResponse: Bool = false) async throws -> (NativeVerifiedScope, ScopeRequestObservation?) {
        let host = "fixture-" + UUID().uuidString.lowercased() + ".example.invalid"
        ScopeURLProtocol.state.install(ScopeHTTPFixture(status: status, body: body, headers: headers, foreignResponse: foreignResponse), host: host)
        let configuration = URLSessionConfiguration.ephemeral; configuration.protocolClasses = [ScopeURLProtocol.self]
        let verifier = HTTPSNativeScopeVerifier(configuration: configuration)
        do {
            let scope = try await verifier.verify(origin: APIOrigin("https://" + host), vehicleID: "v",
                candidate: NativeCredentialCandidate(version: UUID(), headers: ["Authorization": "Bearer synthetic-not-a-token"]))
            await verifier.close(); return (scope, ScopeURLProtocol.state.remove(host))
        } catch {
            await verifier.close(); _ = ScopeURLProtocol.state.remove(host); throw error
        }
    }
    func testActualURLSessionBytesUseMinimalGETAndServerScope() async throws {
        let (scope, observed) = try await probe()
        XCTAssertEqual(scope, NativeVerifiedScope(viewerID: "u", vehicleID: "v", expiresAt: 2000000))
        XCTAssertEqual(observed?.method, "GET"); XCTAssertEqual(observed?.path, "/api/vehicles/v/session")
        XCTAssertEqual(observed?.authorization, "Bearer synthetic-not-a-token")
        XCTAssertNil(observed?.viewer) // Client does not invent its bootstrap identity.
    }
    func testHTTPRefusalStatusesNeverProduceScope() async throws {
        for status in [302, 401, 403, 409, 503] {
            do { _ = try await probe(status: status); XCTFail("Refusal must not produce scope") }
            catch let error as NativeAPIError {
                switch (status, error) {
                case (302, .redirectRefused), (401, .signInRequired), (403, .accessDenied), (409, .conflict), (503, .unavailable): break
                default: XCTFail("Wrong typed refusal")
                }
            }
        }
    }
    func testHTMLMalformedJSONAndCacheableResponseAreRejected() async throws {
        for (body, headers) in [
            (Data("<html>login</html>".utf8), ["Content-Type": "text/html", "Cache-Control": "no-store"]),
            (Data("invalid JSON".utf8), ["Content-Type": "application/json", "Cache-Control": "no-store"]),
            (Data("{}".utf8), ["Content-Type": "application/json", "Cache-Control": "public, max-age=60"])
        ] {
            do { _ = try await probe(body: body, headers: headers); XCTFail("Invalid scope response") }
            catch NativeAPIError.invalidResponse {}
        }
    }
    func testStreamingLimitAndForeignOriginFailClosed() async throws {
        do { _ = try await probe(body: Data(repeating: 32, count: 8193)); XCTFail("Unbounded stream") }
        catch NativeAPIError.responseTooLarge {}
        do { _ = try await probe(foreignResponse: true); XCTFail("Foreign origin") }
        catch NativeAPIError.invalidResponse {}
    }
}
#endif
