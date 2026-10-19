#if canImport(CryptoKit) && canImport(Security)
import Foundation
import CryptoKit
import Security
public enum ChoiceStorageError: Error { case invalidKey, keychain(OSStatus), invalidFile, tooLarge }
public protocol ChoiceQueueKeyProvider: Actor { func keyBytes(createIfMissing: Bool) async throws -> Data }
// Dedicated local app Keychain item; never synchronized or sent to a provider.
public actor KeychainChoiceQueueKey: ChoiceQueueKeyProvider {
    private let service: String
    private let account = "ritkompas-choice-queue-v1"
    public init(service: String) { self.service = service }
    public func keyBytes(createIfMissing: Bool) async throws -> Data {
        guard !service.isEmpty, service.utf8.count <= 256 else { throw ChoiceStorageError.invalidKey }
        let query: [String: Any] = [kSecClass as String:kSecClassGenericPassword,kSecAttrService as String:service,kSecAttrAccount as String:account,kSecAttrSynchronizable as String:false]
        var read = query; read[kSecReturnData as String] = true; read[kSecMatchLimit as String] = kSecMatchLimitOne
        var result: CFTypeRef?
        let status = SecItemCopyMatching(read as CFDictionary, &result)
        if status == errSecSuccess { guard let bytes = result as? Data, bytes.count == 32 else { throw ChoiceStorageError.invalidKey }; return bytes }
        guard status == errSecItemNotFound, createIfMissing else { throw ChoiceStorageError.keychain(status) }
        var bytes = Data(count: 32)
        let generated = bytes.withUnsafeMutableBytes { (buffer: UnsafeMutableRawBufferPointer) in SecRandomCopyBytes(kSecRandomDefault, buffer.count, buffer.baseAddress!) }
        guard generated == errSecSuccess else { throw ChoiceStorageError.keychain(generated) }
        var create = query; create[kSecValueData as String] = bytes; create[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        let added = SecItemAdd(create as CFDictionary, nil)
        if added == errSecDuplicateItem {
            var existing: CFTypeRef?
            let checked = SecItemCopyMatching(read as CFDictionary, &existing)
            guard checked == errSecSuccess, let stored = existing as? Data, stored.count == 32 else { throw ChoiceStorageError.keychain(checked) }
            return stored
        }
        guard added == errSecSuccess else { throw ChoiceStorageError.keychain(added) }
        return bytes
    }
}
// Dedicated trusted sandbox directory only; not a hostile filesystem or shared
// extension store. Ciphertext only on disk, authenticated format version, atomic
// replacement. Missing/unavailable key or corrupt storage never resets data.
public actor EncryptedChoiceQueuePersistence: ChoiceQueuePersistence {
    private let directory: URL
    private let keyProvider: any ChoiceQueueKeyProvider
    private let header = Data("RITKOMPAS-CHOICE-QUEUE-V1\n".utf8)
    public init(directory: URL, keyProvider: any ChoiceQueueKeyProvider) { self.directory = directory; self.keyProvider = keyProvider }
    private func file() throws -> URL {
        guard directory.isFileURL else { throw ChoiceStorageError.invalidFile }
        let fm = FileManager.default
        if fm.fileExists(atPath: directory.path) {
            let values = try directory.resourceValues(forKeys: [.isSymbolicLinkKey,.isDirectoryKey])
            guard values.isSymbolicLink != true, values.isDirectory == true else { throw ChoiceStorageError.invalidFile }
        } else { try fm.createDirectory(at: directory, withIntermediateDirectories: true, attributes: [.posixPermissions:0o700]) }
        let path = directory.appendingPathComponent("choices-v1.enc", isDirectory: false)
        if fm.fileExists(atPath: path.path) {
            let values = try path.resourceValues(forKeys: [.isSymbolicLinkKey,.isRegularFileKey,.fileSizeKey])
            guard values.isSymbolicLink != true, values.isRegularFile == true else { throw ChoiceStorageError.invalidFile }
            guard (values.fileSize ?? 0) <= 262_144 else { throw ChoiceStorageError.tooLarge }
        }
        return path
    }
    public func load() async throws -> Data? {
        let path = try file()
        guard FileManager.default.fileExists(atPath: path.path) else { return nil }
        let bytes = try Data(contentsOf: path)
        guard bytes.count <= 262_144, bytes.starts(with: header) else { throw ChoiceStorageError.invalidFile }
        let keyData = try await keyProvider.keyBytes(createIfMissing: false); guard keyData.count == 32 else { throw ChoiceStorageError.invalidKey }
        let sealed = try AES.GCM.SealedBox(combined: Data(bytes.dropFirst(header.count)))
        let plaintext = try AES.GCM.open(sealed, using: SymmetricKey(data: keyData), authenticating: header)
        guard plaintext.count <= 65_536 else { throw ChoiceStorageError.tooLarge }; return plaintext
    }
    public func save(_ plaintext: Data) async throws {
        guard plaintext.count <= 65_536 else { throw ChoiceStorageError.tooLarge }
        let path = try file(), keyData = try await keyProvider.keyBytes(createIfMissing: !FileManager.default.fileExists(atPath: path.path))
        guard keyData.count == 32 else { throw ChoiceStorageError.invalidKey }
        let box = try AES.GCM.seal(plaintext, using: SymmetricKey(data: keyData), authenticating: header)
        guard let combined = box.combined else { throw ChoiceStorageError.invalidFile }
        try (header + combined).write(to: path, options: .atomic)
        try FileManager.default.setAttributes([.posixPermissions:0o600], ofItemAtPath: path.path)
        #if os(iOS)
        try FileManager.default.setAttributes([.protectionKey:FileProtectionType.completeUntilFirstUserAuthentication], ofItemAtPath: path.path)
        #endif
    }
}
#endif
