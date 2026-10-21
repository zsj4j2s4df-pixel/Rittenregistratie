import Foundation
public enum NativeAddressKind: String, Codable, Sendable { case business, `private` }
public enum NativeBusinessRole: String, Codable, Sendable { case customer, supplier }
public struct NativeStoredAddress: Codable, Equatable, Sendable {
    public let id: String
    public let label: String
    public let address: String
    public let enabled: Bool
    public let note: String
    public let kind: NativeAddressKind?
    public let businessRole: NativeBusinessRole?
    public var effectiveKind: NativeAddressKind { kind ?? .business }
    public init(id: String, label: String, address: String, enabled: Bool = true, note: String = "", kind: NativeAddressKind? = nil, businessRole: NativeBusinessRole? = nil) {
        self.id = id; self.label = label; self.address = address; self.enabled = enabled
        self.note = note; self.kind = kind; self.businessRole = businessRole
    }
    public var isValid: Bool {
        id.range(of: "^[A-Za-z0-9_-]{1,128}$", options: .regularExpression) != nil
            && !label.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && label.count <= 100
            && !address.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && address.count <= 450
            && note.count <= 1000 && !(effectiveKind == .private && businessRole != nil)
    }
}
public struct NativeMileageRate: Codable, Equatable, Sendable {
    public let id: String
    public let microsPerKm: Int64
    public let validFrom: String
    public let validUntil: String?
    public init(id: String, microsPerKm: Int64, validFrom: String, validUntil: String? = nil) {
        self.id = id; self.microsPerKm = microsPerKm; self.validFrom = validFrom; self.validUntil = validUntil
    }
}
public struct NativeVehicleSettings: Codable, Sendable {
    public let revision: Int
    public let plate: String
    public let addresses: [NativeStoredAddress]
    public let rates: [NativeMileageRate]
    public init(revision: Int, plate: String, addresses: [NativeStoredAddress], rates: [NativeMileageRate]) {
        self.revision = revision; self.plate = plate; self.addresses = addresses; self.rates = rates
    }
}
// Keep this entire immutable input/requestId for exact retry after uncertainty.
// No implicit retry or background upload. The host may retain this exact input
// in the encrypted, account/vehicle-bound recovery outbox until acknowledged.
public struct NativeSettingsEdit: Codable, Equatable, Sendable {
    public let requestId: String
    public let revision: Int
    public let plate: String
    public let addresses: [NativeStoredAddress]
    public let rates: [NativeMileageRate]
    public let reason: String
    public init(requestId: String = UUID().uuidString, settings: NativeVehicleSettings, reason: String) {
        self.requestId = requestId; self.revision = settings.revision; self.plate = settings.plate
        self.addresses = settings.addresses; self.rates = settings.rates; self.reason = reason
    }
    public var isValid: Bool {
        UUID(uuidString: requestId) != nil && revision >= 0 && revision < 9_007_199_254_740_991
            && !reason.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && reason.count <= 500
            && addresses.count + rates.count <= 40 && addresses.allSatisfy(\.isValid)
            && Set(addresses.map(\.id)).count == addresses.count
    }
}
