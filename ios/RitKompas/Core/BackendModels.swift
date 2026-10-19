import Foundation

// Wire models mirror existing server contracts. Device IDs are app-instance
// claims, never hardware attestation, session credentials or driver proof.
public enum DevicePlatform: String, Codable, Sendable { case ios, web }
public struct DeviceRegistration: Codable, Sendable {
    public let requestId: String
    public let id: String
    public let name: String
    public let platform: DevicePlatform

    public init(requestId: String, id: String, name: String, platform: DevicePlatform = .ios) {
        self.requestId = requestId
        self.id = id
        self.name = name
        self.platform = platform
    }
}
public struct DeviceDeactivation: Codable, Sendable {
    public let expectedRevision: Int64
    public let reason: String
    public init(expectedRevision: Int64, reason: String) {
        self.expectedRevision = expectedRevision
        self.reason = reason
    }
}
public struct RegisteredDevice: Codable, Sendable {
    public let id: String
    public let userID: String
    public let vehicleID: String
    public let name: String
    public let platform: DevicePlatform
    public let active: Int
    public let revision: Int64
    public let createdAt: Int64
    public let updatedAt: Int64
    public var isActive: Bool { active == 1 }
    enum CodingKeys: String, CodingKey {
        case id, name, platform, active, revision
        case userID = "user_id", vehicleID = "vehicle_id"
        case createdAt = "created_at", updatedAt = "updated_at"
    }
}
public struct DeviceEnvelope: Decodable, Sendable { public let device: RegisteredDevice }
public struct DevicesEnvelope: Decodable, Sendable { public let devices: [RegisteredDevice] }
public struct Vehicle: Codable, Sendable {
    public let id: String
    public let displayName: String
    public let registrationPlate: String?
    enum CodingKeys: String, CodingKey {
        case id
        case displayName = "display_name", registrationPlate = "registration_plate"
    }
}
public struct VehiclesEnvelope: Decodable, Sendable { public let vehicles: [Vehicle] }

// These types prepare the SERVER-SERVICE detection contract. No detection HTTP
// endpoint is assumed or called by this module. No sensor is started here.
public enum ObservationSource: String, Codable, Sendable { case gps, bluetooth, carplay, manual }
public enum ObservationKind: String, Codable, Sendable {
    case location, connection, disconnection
    case startCandidate = "start_candidate", endCandidate = "end_candidate"
}
public struct ObservationLocation: Codable, Sendable {
    public let latitude: Double
    public let longitude: Double
    public let accuracyMeters: Double
    public init(latitude: Double, longitude: Double, accuracyMeters: Double) {
        self.latitude = latitude
        self.longitude = longitude
        self.accuracyMeters = accuracyMeters
    }
}
public struct DetectionInput: Codable, Sendable {
    public let requestId: String
    public let eventId: String
    public let observedAt: Int64
    public let source: ObservationSource
    public let kind: ObservationKind
    public let detail: String?
    public let location: ObservationLocation?
    public init(requestId: String, eventId: String, observedAt: Int64, source: ObservationSource,
                kind: ObservationKind, detail: String? = nil, location: ObservationLocation? = nil) {
        self.requestId = requestId
        self.eventId = eventId
        self.observedAt = observedAt
        self.source = source
        self.kind = kind
        self.detail = detail
        self.location = location
    }
}
public struct DetectionObservation: Codable, Sendable {
    public let id: String
    public let vehicleID: String
    public let userID: String
    public let deviceID: String
    public let eventID: String
    public let observedAt: Int64
    public let receivedAt: Int64
    public let source: ObservationSource
    public let eventKind: ObservationKind
    public let uncertainty: String
    public let payloadJSON: String
    enum CodingKeys: String, CodingKey {
        case id, source, uncertainty
        case vehicleID = "vehicle_id", userID = "user_id", deviceID = "device_id", eventID = "event_id"
        case observedAt = "observed_at", receivedAt = "received_at"
        case eventKind = "event_kind", payloadJSON = "payload_json"
    }
}
