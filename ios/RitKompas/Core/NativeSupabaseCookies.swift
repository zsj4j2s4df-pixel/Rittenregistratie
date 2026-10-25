import Foundation

/// Cookie candidates only: no JWT decoding or local identity/vehicle grant.
/// Integrated in native source; live activation and physical-device acceptance remain separate.
public struct NativeSupabaseCookies: Codable, Sendable, CustomStringConvertible, CustomDebugStringConvertible {
    private static let session = "__Host-ritkompas-session"
    private static let binding = "__Host-ritkompas-binding"
    private static let refresh = "__Host-ritkompas-refresh"
    private static let remember = "__Host-ritkompas-remember"
    private static let names = [session, binding, refresh, remember]
    private struct Value: Codable, Sendable { let value: String; let expires: Date? }
    private let origin: String
    private let values: [String: Value]

    public init(origin: APIOrigin, cookies: [HTTPCookie], now: Date = Date()) throws {
        guard let host = URL(string: origin.value)?.host, now.timeIntervalSince1970.isFinite,
              now.timeIntervalSince1970 >= 0 else { throw NativeAPIError.signInRequired }
        var selected: [String: Value] = [:]
        for name in Self.names {
            // Reject duplicates or bad attributes, never choose an arbitrary first cookie.
            let matches = cookies.filter { $0.name == name }
            guard matches.count == 1, let cookie = matches.first,
                  cookie.domain == host, cookie.path == "/", cookie.isSecure, cookie.isHTTPOnly,
                  cookie.expiresDate.map({ $0 > now }) ?? true else { throw NativeAPIError.signInRequired }
            selected[name] = Value(value: cookie.value, expires: cookie.expiresDate)
        }
        self.origin = origin.value; self.values = selected
        _ = try headers(for: origin, now: now, refreshing: true)
    }

    private func valid(_ value: String) -> Bool {
        !value.isEmpty && value.utf8.count <= 3800 && value.unicodeScalars.allSatisfy {
            (65...90).contains($0.value) || (97...122).contains($0.value) || (48...57).contains($0.value)
                || $0 == "_" || $0 == "-" || $0 == "."
        }
    }

    /// All four cookies must be valid even after Codable/Keychain restoration.
    /// Cookie lifetime is not proof of JWT expiry: each API still verifies online.
    public func headers(for origin: APIOrigin, now: Date = Date(), refreshing: Bool = false) throws -> [String: String] {
        guard self.origin == origin.value, now.timeIntervalSince1970.isFinite,
              now.timeIntervalSince1970 >= 0, Set(values.keys) == Set(Self.names),
              values.values.allSatisfy({ valid($0.value) && ($0.expires.map { $0 > now } ?? true) }),
              ["yes", "no"].contains(values[Self.remember]?.value ?? "") else { throw NativeAPIError.signInRequired }
        if values[Self.remember]?.value == "yes" {
            guard values.values.allSatisfy({ $0.expires != nil }) else { throw NativeAPIError.signInRequired }
        }
        let names = refreshing ? Self.names : [Self.session, Self.binding]
        return ["Cookie": names.map { $0 + "=" + values[$0]!.value }.joined(separator: "; ")]
    }

    /// Explicit remember opt-in plus bounded real cookie expiry, never inferred from a session cookie.
    public func mayPersist(for origin: APIOrigin, now: Date = Date()) throws -> Bool {
        _ = try headers(for: origin, now: now, refreshing: true)
        return values[Self.remember]?.value == "yes"
    }
    public var description: String { "NativeSupabaseCookies(redacted)" }
    public var debugDescription: String { description }
}
