#if canImport(Security)
import Foundation
import Security

public enum NativeLoginCredential: Sendable {
    case access(NativeAccessCookie)
    case supabase(NativeSupabaseCookies)
    public var provider: NativeLoginProvider { switch self { case .access: .access; case .supabase: .supabase } }
}
public protocol NativeAccountCredentialSource: NativeCredentialSource {
    func stageLogin(_ credential: NativeLoginCredential) async throws
    func persistVerifiedCandidate() async throws
    func logout() async throws
}
extension KeychainNativeCredentials: NativeAccountCredentialSource {
    public func stageLogin(_ credential: NativeLoginCredential) throws {
        guard case let .access(cookie) = credential else { throw NativeAPIError.signInRequired }
        try stage(cookie)
    }
    public func logout() throws { try clear() }
}
extension NativeSupabaseSession: NativeAccountCredentialSource {
    public func stageLogin(_ credential: NativeLoginCredential) async throws {
        guard case let .supabase(cookies) = credential else { throw NativeAPIError.signInRequired }
        try await stage(cookies)
    }
}

/// Separate namespace from Access, device-only/unlocked; no iCloud keychain sync.
public actor KeychainSupabasePersistence: NativeSupabasePersistence {
    private let origin: APIOrigin
    private let service: String
    public init(origin: APIOrigin, service: String) { self.origin = origin; self.service = service }
    private var query: [String: Any] {
        [kSecClass as String: kSecClassGenericPassword, kSecAttrService as String: service,
         kSecAttrAccount as String: origin.value, kSecAttrSynchronizable as String: false]
    }
    public func load() throws -> NativeSupabaseCookies? {
        var read = query; read[kSecReturnData as String] = true; read[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: CFTypeRef?; let status = SecItemCopyMatching(read as CFDictionary, &result)
        if status == errSecItemNotFound { return nil }
        guard status == errSecSuccess, let data = result as? Data, data.count <= 20_000 else { throw ChoiceStorageError.keychain(status) }
        let cookies = try JSONDecoder().decode(NativeSupabaseCookies.self, from: data)
        guard try cookies.mayPersist(for: origin) else { throw NativeAPIError.signInRequired }
        return cookies
    }
    public func save(_ cookies: NativeSupabaseCookies) throws {
        guard try cookies.mayPersist(for: origin) else { throw NativeAPIError.signInRequired }
        let data = try JSONEncoder().encode(cookies)
        var add = query; add[kSecValueData as String] = data
        add[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        let status = SecItemAdd(add as CFDictionary, nil)
        if status == errSecDuplicateItem {
            let updated = SecItemUpdate(query as CFDictionary, [kSecValueData as String: data, kSecAttrAccessible as String: kSecAttrAccessibleWhenUnlockedThisDeviceOnly] as CFDictionary)
            guard updated == errSecSuccess else { throw ChoiceStorageError.keychain(updated) }
        } else if status != errSecSuccess { throw ChoiceStorageError.keychain(status) }
    }
    public func remove() throws {
        let status = SecItemDelete(query as CFDictionary)
        guard status == errSecSuccess || status == errSecItemNotFound else { throw ChoiceStorageError.keychain(status) }
    }
}
#endif
