#if os(iOS) || os(macOS)
import Foundation

public enum NativeLoginProvider: String, Sendable { case access, supabase }

/// Fixed backend endpoints, system TLS, no redirect, shared cookies, caches or provider secrets.
public actor HTTPSNativeSupabaseTransport: NativeSupabaseTransport {
    private let session: URLSession
    private let redirects: RefuseRedirects
    public init() { self.init(configuration: .ephemeral) }
    // Internal URLProtocol test seam; public callers get the hardened ephemeral configuration.
    init(configuration config: URLSessionConfiguration) {
        config.urlCache = nil; config.urlCredentialStorage = nil; config.httpCookieStorage = nil
        config.httpShouldSetCookies = false; config.httpAdditionalHeaders = nil
        config.timeoutIntervalForRequest = 15; config.timeoutIntervalForResource = 20
        let delegate = RefuseRedirects(); redirects = delegate
        session = URLSession(configuration: config, delegate: delegate, delegateQueue: nil)
    }
    public func close() { session.invalidateAndCancel() }
    private func call(origin: APIOrigin, action: String, headers: [String: String], post: Bool) async throws -> (Data, HTTPURLResponse) {
        var request = URLRequest(url: try origin.url(segments: ["api", "auth", action]), cachePolicy: .reloadIgnoringLocalCacheData)
        request.httpMethod = post ? "POST" : "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        for (key, value) in headers { request.setValue(value, forHTTPHeaderField: key) }
        if post {
            request.httpBody = Data("{}".utf8)
            request.setValue(origin.value, forHTTPHeaderField: "Origin")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue("1", forHTTPHeaderField: "x-csrf-protection")
        }
        do {
            let (bytes, response) = try await session.bytes(for: request)
            defer { bytes.task.cancel() }
            guard let http = response as? HTTPURLResponse, let final = http.url, origin.contains(final),
                  final == request.url else { throw NativeAPIError.invalidResponse }
            if (300..<400).contains(http.statusCode) { throw NativeAPIError.redirectRefused }
            guard http.value(forHTTPHeaderField: "Content-Type")?.lowercased().hasPrefix("application/json") == true,
                  http.value(forHTTPHeaderField: "Cache-Control")?.lowercased().split(separator: ",").contains(where: { $0.trimmingCharacters(in: .whitespaces) == "no-store" }) == true,
                  response.expectedContentLength <= 16_384 else { throw NativeAPIError.invalidResponse }
            var data = Data()
            for try await byte in bytes {
                try Task.checkCancellation()
                guard data.count < 16_384 else { throw NativeAPIError.responseTooLarge }
                data.append(byte)
            }
            return (data, http)
        } catch let e as NativeAPIError { throw e }
        catch is CancellationError { throw CancellationError() }
        catch { throw NativeAPIError.connectionUncertain }
    }
    public func provider(origin: APIOrigin, accessHeaders: [String: String]) async throws -> NativeLoginProvider {
        let (data, http) = try await call(origin: origin, action: "status", headers: accessHeaders, post: false)
        struct Provider: Decodable { let provider: String }
        guard let value = try? JSONDecoder().decode(Provider.self, from: data) else { throw NativeAPIError.invalidResponse }
        if http.statusCode == 200, value.provider == "supabase" { return .supabase }
        if http.statusCode == 503, value.provider == "access" { return .access }
        throw NativeAPIError.signInRequired // Unknown/unavailable provider never falls back.
    }
    public func inspect(origin: APIOrigin, cookies: NativeSupabaseCookies) async throws -> NativeAuthStatus {
        let (data, http) = try await call(origin: origin, action: "status", headers: cookies.headers(for: origin), post: false)
        guard http.statusCode == 200, let status = try? JSONDecoder().decode(NativeAuthStatus.self, from: data), status.provider == "supabase" else { throw NativeAPIError.signInRequired }
        return status
    }
    public func refresh(origin: APIOrigin, cookies: NativeSupabaseCookies) async throws -> NativeAuthRotation {
        let (data, http) = try await call(origin: origin, action: "refresh", headers: cookies.headers(for: origin, refreshing: true), post: true)
        guard http.statusCode == 200 else { throw NativeAPIError.signInRequired }
        struct Result: Decodable { let viewerId: String; let expiresAt: Int64 }
        let result = try JSONDecoder().decode(Result.self, from: data)
        let headers = http.allHeaderFields.reduce(into: [String: String]()) { if let key = $1.key as? String, let value = $1.value as? String { $0[key] = value } }
        let rotated = try NativeSupabaseCookies(origin: origin, cookies: HTTPCookie.cookies(withResponseHeaderFields: headers, for: URL(string: origin.value)!))
        return NativeAuthRotation(cookies: rotated, status: NativeAuthStatus(authenticated: true, viewerId: result.viewerId, expiresAt: result.expiresAt))
    }
    public func logout(origin: APIOrigin, cookies: NativeSupabaseCookies) async throws {
        let (data, http) = try await call(origin: origin, action: "logout", headers: cookies.headers(for: origin, refreshing: true), post: true)
        struct Result: Decodable { let providerRevoked: Bool }
        guard http.statusCode == 200, let result = try? JSONDecoder().decode(Result.self, from: data), result.providerRevoked else { throw NativeAPIError.connectionUncertain }
    }
}
#endif
