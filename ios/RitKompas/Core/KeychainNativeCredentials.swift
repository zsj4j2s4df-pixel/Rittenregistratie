#if canImport(Security)
import Foundation
import Security

// Credentials are candidates, never identity. The server verifies signature,
// issuer, audience, expiry and existing vehicle membership on every API grant.
public struct NativeAccessCookie: Codable, Sendable, CustomStringConvertible, CustomDebugStringConvertible {
    public let origin: String
    private let value: String
    private let expiresAt: Int64
    public init(origin: APIOrigin, value: String, expiresAt: Int64) throws {
        self.origin = origin.value; self.value = value; self.expiresAt = expiresAt
        _ = try headers(for: origin, now: Int64(Date().timeIntervalSince1970 * 1000))
    }
    public func headers(for origin: APIOrigin, now: Int64) throws -> [String: String] {
        guard self.origin == origin.value, now >= 0, expiresAt > now,
              !value.isEmpty, value.utf8.count <= 16_000,
              value.unicodeScalars.allSatisfy({ $0.value > 32 && $0.value < 127 && $0 != ";" && $0 != "," }) else {
            throw NativeAPIError.signInRequired
        }
        return ["Cookie": "CF_Authorization=" + value]
    }
    public var description: String { "NativeAccessCookie(redacted)" }
    public var debugDescription: String { description }
}

public actor KeychainNativeCredentials: NativeCredentialSource {
    private let origin: APIOrigin
    private let service: String
    private var version = UUID()
    private var staged: NativeAccessCookie?
    private var closed = false
    public init(origin: APIOrigin, service: String) { self.origin = origin; self.service = service }
    private var query: [String: Any] {
        [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service,
         kSecAttrAccount as String: origin.value, kSecAttrSynchronizable as String: false]
    }
    public func stage(_ cookie: NativeAccessCookie) throws {
        guard !closed else { throw NativeAPIError.signInRequired }
        _ = try cookie.headers(for: origin, now: Int64(Date().timeIntervalSince1970 * 1000))
        version = UUID(); staged = cookie
    }
    // Explicitly called only after the staged cookie's server scope was verified.
    public func persistVerifiedCandidate() throws {
        guard !closed, let staged else { throw NativeAPIError.signInRequired }
        _ = try staged.headers(for: origin, now: Int64(Date().timeIntervalSince1970 * 1000))
        let bytes = try JSONEncoder().encode(staged)
        var add = query; add[kSecValueData as String] = bytes
        add[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        let status = SecItemAdd(add as CFDictionary, nil)
        if status == errSecDuplicateItem {
            let updated = SecItemUpdate(query as CFDictionary,
                [kSecValueData as String: bytes, kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly] as CFDictionary)
            guard updated == errSecSuccess else { throw ChoiceStorageError.keychain(updated) }
        } else if status != errSecSuccess { throw ChoiceStorageError.keychain(status) }
    }
    public func candidate(for requested: APIOrigin) throws -> NativeCredentialCandidate {
        guard !closed, requested == origin else { throw NativeAPIError.signInRequired }
        if staged == nil {
            var read = query; read[kSecReturnData as String] = true; read[kSecMatchLimit as String] = kSecMatchLimitOne
            var result: CFTypeRef?
            let status = SecItemCopyMatching(read as CFDictionary, &result)
            guard status == errSecSuccess, let bytes = result as? Data, bytes.count <= 20_000 else {
                if status == errSecItemNotFound { throw NativeAPIError.signInRequired }
                throw ChoiceStorageError.keychain(status)
            }
            staged = try JSONDecoder().decode(NativeAccessCookie.self, from: bytes)
        }
        guard let staged else { throw NativeAPIError.signInRequired }
        return NativeCredentialCandidate(version: version,
            headers: try staged.headers(for: origin, now: Int64(Date().timeIntervalSince1970 * 1000)))
    }
    public func clear() throws {
        closed = true; staged = nil; version = UUID() // close before touching Keychain
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else { throw ChoiceStorageError.keychain(status) }
    }
}
#endif
