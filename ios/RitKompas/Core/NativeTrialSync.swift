import Foundation

public struct TrialJourneyCommand: Codable, Sendable {
    public let requestId: String
    public let deviceId: String
    public let observationId: String
    public let expectedRevision: Int?
    public let reason: String?
    public init(requestId: String, deviceId: String, observationId: String, expectedRevision: Int? = nil, reason: String? = nil) {
        self.requestId = requestId; self.deviceId = deviceId; self.observationId = observationId
        self.expectedRevision = expectedRevision; self.reason = reason
    }
}
public struct TrialJourneyReceipt: Codable, Sendable {
    public let journeyId: String
    public let operation: String
    public let revision: Int
    public init(journeyId: String, operation: String, revision: Int) { self.journeyId = journeyId; self.operation = operation; self.revision = revision }
}
public protocol NativeTrialTransport: NativeCaptureTransport {
    func trialJourney(vehicleID: String, journeyID: String?, operation: String, input: TrialJourneyCommand, viewerID: String) async throws -> TrialJourneyReceipt
    func trialChoice(_ action: QueuedTripChoice, reason: String) async throws -> TripChoiceServerReceipt
}
#if os(iOS) || os(macOS)
extension APIClient: NativeTrialTransport {}
#endif
// Explicit sync of a STOPPED, immutable local test. Existing server journey
// coordination refuses a second open vehicle journey; never merge passengers silently.
// Each request and its expected revision are persisted before the first network call.
public actor NativeTrialSync {
    private struct Payload: Decodable {
        let observedAt: Int64; let source: ObservationSource; let kind: ObservationKind
        let detail: String?; let location: ObservationLocation?
    }
    private struct EventIDs: Codable { let requestID: String; let eventID: String }
    private struct Plan: Codable {
        let version: Int
        let trip: TrialTrip
        let registration: DeviceRegistration
        let events: [EventIDs]
        let journeyRequests: [String]
        let choiceRequests: [String]
        var registered = false
        var eventIndex = 0
        var observationIDs: [String] = []
        var journeyID: String?
        var revision = 0
        var choiceIndex = 0
        var closed = false
    }
    private let disk: any ChoiceQueuePersistence
    private let binding: any ChoiceSessionBinding
    private let viewerID: String, vehicleID: String
    private var busy = false
    public init(disk: any ChoiceQueuePersistence, binding: any ChoiceSessionBinding, viewerID: String, vehicleID: String) {
        self.disk = disk; self.binding = binding; self.viewerID = viewerID; self.vehicleID = vehicleID
    }
    private func verify() async throws {
        try Task.checkCancellation()
        let s = try await binding.verifiedScope(vehicleID: vehicleID)
        guard s.viewerID == viewerID, s.vehicleID == vehicleID else { throw ChoiceQueueError.sessionChanged }
    }
    private func save(_ p: Plan) async throws {
        let data = try JSONEncoder().encode(p); guard data.count <= 65_536 else { throw TrialTripError.capacity }
        try await verify(); try await disk.save(data); try await verify()
    }
    private func plan(_ trip: TrialTrip) async throws -> Plan {
        guard trip.viewerID == viewerID, trip.vehicleID == vehicleID, let end = trip.endedAt, end > trip.startedAt else { throw TrialTripError.invalidState }
        if let bytes = try await disk.load() {
            guard bytes.count <= 65_536 else { throw TrialTripError.capacity }
            let p = try JSONDecoder().decode(Plan.self, from: bytes)
            guard p.version == 1, p.trip.id == trip.id, p.trip.viewerID == viewerID, p.trip.vehicleID == vehicleID,
                  p.events.count == trip.points.count + 2, p.journeyRequests.count == p.events.count,
                  p.choiceRequests.count == trip.choices.count, p.eventIndex >= 0, p.eventIndex <= p.events.count,
                  p.observationIDs.count == p.eventIndex, p.choiceIndex >= 0, p.choiceIndex <= p.trip.choices.count,
                  p.trip.endedAt != nil, !p.trip.choices.isEmpty,
                  p.events.allSatisfy({ UUID(uuidString: $0.requestID) != nil && UUID(uuidString: $0.eventID) != nil }),
                  !p.closed || (p.journeyID != nil && p.eventIndex == p.events.count),
                  p.eventIndex == 0 || p.journeyID != nil else { throw TrialTripError.invalidState }
            return p
        }
        let fresh = { UUID().uuidString }
        let events = (0..<(trip.points.count + 2)).map { _ in EventIDs(requestID: fresh(), eventID: fresh()) }
        let p = Plan(version: 1, trip: trip, registration: DeviceRegistration(requestId: fresh(), id: fresh(), name: "RitKompas iPhone ritproef"),
                     events: events, journeyRequests: events.map { _ in fresh() }, choiceRequests: trip.choices.map { _ in fresh() })
        try await save(p); return p
    }
    private func input(index: Int, plan: Plan) -> DetectionInput {
        let trip = plan.trip, ids = plan.events[index]
        if index == 0 {
            let location = trip.points.first.flatMap { $0.time - trip.startedAt <= 15 ? $0.location : nil }
            return DetectionInput(requestId: ids.requestID, eventId: ids.eventID, observedAt: trip.startedAt,
                source: .manual, kind: .startCandidate, detail: "explicit_native_trial_start", location: location)
        }
        if index == plan.events.count - 1 {
            let end = trip.endedAt!
            let location = trip.points.last.flatMap { end - $0.time <= 15 ? $0.location : nil }
            return DetectionInput(requestId: ids.requestID, eventId: ids.eventID, observedAt: end,
                source: .manual, kind: .endCandidate, detail: "explicit_native_trial_stop", location: location)
        }
        let point = trip.points[index - 1]
        return DetectionInput(requestId: ids.requestID, eventId: ids.eventID, observedAt: point.time,
            source: .gps, kind: .location, detail: "native_trial_gps_unverified", location: point.location)
    }
    // Returns only after the server acknowledged every exact observation, choice and close.
    // A network error/conflict/revocation never discards the plan or changes request IDs.
    public func sync(_ trip: TrialTrip, using transport: any NativeTrialTransport) async throws -> String {
        guard !busy else { throw ChoiceQueueError.busy }; busy = true; defer { busy = false }
        try await verify(); var p = try await plan(trip)
        if p.closed { return p.journeyID! }
        if !p.registered {
            let d = try await transport.registerCapture(vehicleID: vehicleID, input: p.registration, expectedViewerID: viewerID)
            try await verify()
            guard d.id == p.registration.id, d.vehicleID == vehicleID, d.userID == viewerID, d.isActive else { throw ChoiceQueueError.invalidReceipt }
            p.registered = true; try await save(p)
        }
        while p.eventIndex < p.events.count {
            let i = p.eventIndex, event = input(index: p.eventIndex, plan: p)
            let observation = try await transport.ingestCapture(vehicleID: vehicleID, deviceID: p.registration.id, input: event, expectedViewerID: viewerID)
            try await verify()
            let payload = try JSONDecoder().decode(Payload.self, from: Data(observation.payloadJSON.utf8))
            guard observation.vehicleID == vehicleID, observation.userID == viewerID, observation.deviceID == p.registration.id,
                  observation.eventID == event.eventId, observation.observedAt == event.observedAt,
                  observation.source == event.source, observation.eventKind == event.kind,
                  observation.uncertainty == "unverified_app_observation",
                  payload.observedAt == event.observedAt, payload.source == event.source, payload.kind == event.kind,
                  payload.detail == event.detail, payload.location == event.location else { throw ChoiceQueueError.invalidReceipt }
            let operation = i == 0 ? "create" : i == p.events.count - 1 ? "close" : "join"
            // All choices are written just before close; the audit reason distinguishes
            // default-private from explicit choice. No historical proposals are changed.
            if operation == "close" {
                while p.choiceIndex < p.trip.choices.count {
                    let choice = p.trip.choices[p.choiceIndex]
                    let context = TripChoiceContext(proposalID: p.journeyID!, vehicleID: vehicleID, viewerID: viewerID, revision: p.revision)
                    let action = QueuedTripChoice(requestID: p.choiceRequests[p.choiceIndex], context: context, choice: choice.choice, createdAt: choice.time)
                    let reason = choice.source == "default_private" ? "Nieuwe opt-in GPS-ritproef: standaard Privé (geen expliciete keuze)" : "Expliciete keuze in native GPS-ritproef (app/Siri/melding)"
                    let receipt = try await transport.trialChoice(action, reason: reason); try await verify()
                    guard receipt.journeyId == context.proposalID, receipt.viewerId == viewerID, receipt.requestId == action.requestID,
                          receipt.revision == p.revision + 1, receipt.classification == choice.choice else { throw ChoiceQueueError.invalidReceipt }
                    p.revision = receipt.revision; p.choiceIndex += 1; try await save(p)
                }
            }
            let command = TrialJourneyCommand(requestId: p.journeyRequests[i], deviceId: p.registration.id,
                observationId: observation.id, expectedRevision: i == 0 ? nil : p.revision,
                reason: i == 0 ? nil : "GPS-ritproef; niet fysiek geverifieerd, controle vereist")
            let receipt = try await transport.trialJourney(vehicleID: vehicleID, journeyID: p.journeyID, operation: operation, input: command, viewerID: viewerID)
            try await verify()
            guard receipt.operation == operation, receipt.revision == (i == 0 ? 0 : p.revision + 1),
                  UUID(uuidString: receipt.journeyId) != nil,
                  p.journeyID == nil || receipt.journeyId == p.journeyID else { throw ChoiceQueueError.invalidReceipt }
            p.journeyID = receipt.journeyId; p.revision = receipt.revision
            p.observationIDs.append(observation.id); p.eventIndex += 1
            if operation == "close" { p.closed = true }
            try await save(p)
        }
        return p.journeyID!
    }
}
