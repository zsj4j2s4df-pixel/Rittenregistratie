import Foundation

public protocol NativeCaptureTransport: Actor {
    func registerCapture(vehicleID: String, input: DeviceRegistration, expectedViewerID: String) async throws -> RegisteredDevice
    func ingestCapture(vehicleID: String, deviceID: String, input: DetectionInput, expectedViewerID: String) async throws -> DetectionObservation
}
private struct CapturePayload: Decodable, Equatable {
    let observedAt: Int64
    let source: ObservationSource
    let kind: ObservationKind
    let detail: String?
    let location: ObservationLocation?
}
public actor NativeCaptureOutbox {
    private struct Record: Codable {
        var version = 1
        let viewerID: String
        let vehicleID: String
        let registration: DeviceRegistration
        var inputs: [DetectionInput] = []
    }
    private let persistence: any ChoiceQueuePersistence
    private let binding: any ChoiceSessionBinding
    private let viewerID: String, vehicleID: String
    private var working = false, closed = false
    private var waiters: [CheckedContinuation<Void, Never>] = []
    public init(persistence: any ChoiceQueuePersistence, binding: any ChoiceSessionBinding,
                viewerID: String, vehicleID: String) {
        self.persistence = persistence; self.binding = binding; self.viewerID = viewerID; self.vehicleID = vehicleID
    }
    private func begin() throws {
        guard !closed else { throw NativeAPIError.signInRequired }
        guard !working else { throw ChoiceQueueError.busy }
        working = true
    }
    private func finish() {
        working = false; let waiting = waiters; waiters = []
        for waiter in waiting { waiter.resume() }
    }
    public func close() async {
        closed = true
        if working { await withCheckedContinuation { waiters.append($0) } }
    }
    private func verify() async throws {
        try Task.checkCancellation()
        guard !closed else { throw NativeAPIError.signInRequired }
        let scope = try await binding.verifiedScope(vehicleID: vehicleID)
        try Task.checkCancellation()
        guard !closed, scope.vehicleID == vehicleID, scope.viewerID == viewerID else { throw ChoiceQueueError.sessionChanged }
    }
    private func valid(_ input: DetectionInput) -> Bool {
        guard UUID(uuidString: input.requestId) != nil, UUID(uuidString: input.eventId) != nil,
              input.observedAt >= 0, input.observedAt <= 253_402_300_799, input.source == .gps,
              [.location,.startCandidate,.endCandidate].contains(input.kind),
              input.detail == "foreground_gps_test_unverified", let location = input.location else { return false }
        return location.latitude.isFinite && abs(location.latitude) <= 90
            && location.longitude.isFinite && abs(location.longitude) <= 180
            && location.accuracyMeters.isFinite && (0...30).contains(location.accuracyMeters)
    }
    private func read() async throws -> Record {
        if let bytes = try await persistence.load() {
            guard bytes.count <= 65_536 else { throw ChoiceQueueError.invalidStorage }
            let record = try JSONDecoder().decode(Record.self, from: bytes)
            guard record.version == 1, record.viewerID == viewerID, record.vehicleID == vehicleID,
                  UUID(uuidString: record.registration.id) != nil, UUID(uuidString: record.registration.requestId) != nil,
                  record.registration.platform == .ios, record.registration.name == "RitKompas iPhone test",
                  record.inputs.count <= 96, record.inputs.allSatisfy(valid),
                  Set(record.inputs.map(\.eventId)).count == record.inputs.count,
                  Set(record.inputs.map(\.requestId)).count == record.inputs.count else { throw ChoiceQueueError.invalidStorage }
            return record
        }
        return Record(viewerID: viewerID, vehicleID: vehicleID,
            registration: DeviceRegistration(requestId: UUID().uuidString, id: UUID().uuidString, name: "RitKompas iPhone test"))
    }
    private func write(_ record: Record) async throws {
        let bytes = try JSONEncoder().encode(record)
        guard bytes.count <= 65_536 else { throw ChoiceQueueError.storageFull }
        try await verify(); try await persistence.save(bytes)
    }
    public func count() async throws -> Int {
        try begin(); defer { finish() }; try await verify()
        let record = try await read(); try await verify(); return record.inputs.count
    }
    public func append(sample: NativeMotionSample, boundary: ObservationKind?, now: Int64) async throws -> Int {
        try begin(); defer { finish() }; try await verify()
        guard sample.valid(now: now), boundary == nil || boundary == .startCandidate || boundary == .endCandidate else { throw NativeAPIError.invalidPath }
        var record = try await read()
        guard record.inputs.count + (boundary == nil ? 1 : 2) <= 96 else { throw ChoiceQueueError.storageFull }
        for kind in [.location] + (boundary.map { [$0] } ?? []) {
            record.inputs.append(DetectionInput(requestId: UUID().uuidString, eventId: UUID().uuidString,
                observedAt: sample.time, source: .gps, kind: kind, detail: "foreground_gps_test_unverified", location: sample.location))
        }
        try await write(record); return record.inputs.count
    }
    // Foreground, explicit user action. No timers/background retry. Failed or
    // uncertain response keeps the entire exact request, including registration.
    public func flush(using transport: any NativeCaptureTransport) async throws -> Int {
        try begin(); defer { finish() }; try await verify()
        var record = try await read()
        guard !record.inputs.isEmpty else { return 0 }
        try await write(record) // stable app ID and registration before first POST
        let device = try await transport.registerCapture(vehicleID: vehicleID, input: record.registration, expectedViewerID: viewerID)
        try await verify()
        guard device.id == record.registration.id, device.vehicleID == vehicleID, device.userID == viewerID,
              device.platform == .ios, device.isActive else { throw ChoiceQueueError.invalidReceipt }
        while let input = record.inputs.first {
            try await verify()
            let receipt = try await transport.ingestCapture(vehicleID: vehicleID, deviceID: device.id, input: input, expectedViewerID: viewerID)
            try await verify()
            let payload = try JSONDecoder().decode(CapturePayload.self, from: Data(receipt.payloadJSON.utf8))
            guard receipt.vehicleID == vehicleID, receipt.userID == viewerID, receipt.deviceID == device.id,
                  receipt.eventID == input.eventId, receipt.observedAt == input.observedAt,
                  receipt.source == input.source, receipt.eventKind == input.kind,
                  receipt.uncertainty == "unverified_app_observation",
                  payload == CapturePayload(observedAt: input.observedAt, source: input.source, kind: input.kind, detail: input.detail, location: input.location) else { throw ChoiceQueueError.invalidReceipt }
            record.inputs.removeFirst(); try await write(record)
        }
        return 0
    }
}
