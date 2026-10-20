#if os(iOS) || os(macOS)
import Foundation

// Fixed same-origin read-only scope endpoint, no cookies/cache/redirects/login.
// Not activated by the preparation app. Real credential acquisition remains a
// separate reviewed integration. No JWT payload is decoded as an identity proof.
@available(iOS 15.0, macOS 12.0, *)
public actor HTTPSNativeScopeVerifier: NativeScopeVerifier {
    private let session: URLSession
    private let redirects: RefuseRedirects
    private static func make(_ configuration: URLSessionConfiguration) -> (URLSession, RefuseRedirects) {
        configuration.urlCache = nil; configuration.urlCredentialStorage = nil
        configuration.httpCookieStorage = nil; configuration.httpShouldSetCookies = false
        configuration.httpAdditionalHeaders = nil; configuration.requestCachePolicy = .reloadIgnoringLocalCacheData
        configuration.timeoutIntervalForRequest = 15; configuration.timeoutIntervalForResource = 20
        let delegate = RefuseRedirects()
        return (URLSession(configuration: configuration, delegate: delegate, delegateQueue: nil), delegate)
    }
    public init() { let pair = Self.make(.ephemeral); session = pair.0; redirects = pair.1 }
    // Internal test seam; production callers only receive the safe initializer.
    init(configuration: URLSessionConfiguration) { let pair = Self.make(configuration); session = pair.0; redirects = pair.1 }
    public func close() { session.invalidateAndCancel() }
    private struct Envelope: Decodable { let session: NativeVerifiedScope }
    public func verify(origin: APIOrigin, vehicleID: String, candidate: NativeCredentialCandidate) async throws -> NativeVerifiedScope {
        try Task.checkCancellation()
        guard validNativeIdentifier(vehicleID), validNativeHeaders(candidate.headers) else { throw NativeAPIError.invalidSessionGrant }
        let url = try origin.url(segments: ["api", "vehicles", vehicleID, "session"])
        guard origin.contains(url) else { throw NativeAPIError.invalidOrigin }
        var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData)
        request.httpMethod = "GET"; request.setValue("application/json", forHTTPHeaderField: "Accept")
        for (name, value) in candidate.headers { request.setValue(value, forHTTPHeaderField: name) }
        do {
            let (bytes, response) = try await session.bytes(for: request)
            defer { bytes.task.cancel() }
            guard let http = response as? HTTPURLResponse, let finalURL = http.url, origin.contains(finalURL) else { throw NativeAPIError.invalidResponse }
            switch http.statusCode {
            case 200: break
            case 300..<400: throw NativeAPIError.redirectRefused
            case 401: throw NativeAPIError.signInRequired
            case 403: throw NativeAPIError.accessDenied
            case 409: throw NativeAPIError.conflict
            case 503: throw NativeAPIError.unavailable
            default: throw NativeAPIError.requestRejected(http.statusCode)
            }
            guard http.value(forHTTPHeaderField: "Content-Type")?.split(separator: ";", maxSplits: 1).first?.trimmingCharacters(in: .whitespaces).lowercased() == "application/json",
                  http.value(forHTTPHeaderField: "Cache-Control")?.lowercased().split(separator: ",").contains(where: { $0.trimmingCharacters(in: .whitespaces) == "no-store" }) == true else { throw NativeAPIError.invalidResponse }
            let maximum = 8192
            guard response.expectedContentLength <= Int64(maximum) else { throw NativeAPIError.responseTooLarge }
            var data = Data()
            for try await byte in bytes {
                try Task.checkCancellation()
                guard data.count < maximum else { throw NativeAPIError.responseTooLarge }
                data.append(byte)
            }
            do { return try JSONDecoder().decode(Envelope.self, from: data).session }
            catch { throw NativeAPIError.invalidResponse }
        } catch let error as NativeAPIError { throw error }
        catch is CancellationError { throw CancellationError() }
        catch { throw NativeAPIError.connectionUncertain }
    }
}
#endif
