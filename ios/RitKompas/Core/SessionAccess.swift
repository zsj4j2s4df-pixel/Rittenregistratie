import Foundation

public enum NativeAPIError: Error, LocalizedError, Sendable {
    case invalidOrigin, invalidPath, sessionNotConfigured, invalidSessionGrant
    case requestTooLarge, responseTooLarge, redirectRefused, invalidResponse
    case signInRequired, accessDenied, conflict, unavailable, requestRejected(Int)
    case connectionUncertain
    public var errorDescription: String? {
        switch self {
        case .invalidOrigin: return "Configureer één exacte HTTPS-oorsprong."
        case .invalidPath: return "Ongeldig API-pad of ongeldige paginering."
        case .sessionNotConfigured: return "Native aanmelden is nog niet ingericht. Er wordt niets verzonden."
        case .invalidSessionGrant: return "De aanmeldkoppeling gaf geen bruikbare sessie."
        case .requestTooLarge: return "De aanvraag is te groot."
        case .responseTooLarge: return "De serverreactie is te groot; er zijn geen gegevens afgeknipt."
        case .redirectRefused: return "Aanmelden of een doorverwijzing is vereist. De aanvraag wordt niet doorgestuurd."
        case .invalidResponse: return "Geen geldige API-reactie ontvangen."
        case .signInRequired: return "Meld opnieuw aan via Centrale registratie."
        case .accessDenied: return "Geen actieve toegang tot dit voertuig of deze app-instantie."
        case .conflict: return "Gegevens, account of registratie zijn gewijzigd. Controleer de actuele gegevens."
        case .unavailable: return "De beveiligde backend is niet beschikbaar."
        case .requestRejected(let status): return "De aanvraag is geweigerd (HTTP \(status))."
        case .connectionUncertain: return "Verbinding onderbroken. Opslag kan al voltooid zijn. Herhaal alleen met dezelfde herhaalcode."
        }
    }
}

public struct APIOrigin: Sendable, Equatable {
    public let value: String
    public init(_ value: String) throws {
        guard let parts = URLComponents(string: value), parts.scheme == "https",
              let host = parts.host, !host.isEmpty,
              host.range(of: "^[A-Za-z0-9.-]+$", options: .regularExpression) != nil,
              parts.user == nil, parts.password == nil, parts.percentEncodedPath.isEmpty,
              parts.query == nil, parts.fragment == nil, parts.string == value,
              parts.port == nil || (1...65535).contains(parts.port!) else { throw NativeAPIError.invalidOrigin }
        self.value = value
    }
    public func url(segments: [String], query: [URLQueryItem] = []) throws -> URL {
        let allowed = CharacterSet(charactersIn: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_")
        let encoded = try segments.map { segment -> String in
            guard !segment.isEmpty, segment != ".", segment != "..", segment.count <= 128,
                  !segment.unicodeScalars.contains(where: { $0.value < 32 || $0.value == 127 || $0 == "/" || $0 == "\\" }),
                  let part = segment.addingPercentEncoding(withAllowedCharacters: allowed) else { throw NativeAPIError.invalidPath }
            return part
        }
        guard var parts = URLComponents(string: value) else { throw NativeAPIError.invalidOrigin }
        parts.percentEncodedPath = "/" + encoded.joined(separator: "/")
        parts.queryItems = query.isEmpty ? nil : query
        guard let url = parts.url else { throw NativeAPIError.invalidPath }
        return url
    }
    public func contains(_ url: URL) -> Bool {
        guard let actual = URLComponents(url: url, resolvingAgainstBaseURL: false),
              let expected = URLComponents(string: value) else { return false }
        return actual.scheme == expected.scheme && actual.host == expected.host && actual.port == expected.port
            && actual.user == nil && actual.password == nil
    }
}

// A future reviewed provider owns login, secure credential storage, refresh,
// logout and binding of the internal viewer ID to this SAME session. No default
// provider, service token, user header, embedded secret or fake identity exists.
public struct SessionGrant: Sendable {
    public let expectedViewerID: String
    public let headers: [String: String]
    public init(expectedViewerID: String, headers: [String: String]) {
        self.expectedViewerID = expectedViewerID
        self.headers = headers
    }
}
public protocol SessionAccess: Actor {
    func grant(for origin: APIOrigin) async throws -> SessionGrant
}
public actor UnconfiguredSessionAccess: SessionAccess {
    public init() {}
    public func grant(for origin: APIOrigin) async throws -> SessionGrant {
        throw NativeAPIError.sessionNotConfigured
    }
}
