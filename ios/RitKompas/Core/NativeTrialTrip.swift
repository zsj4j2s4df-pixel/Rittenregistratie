import Foundation

public enum TrialTripError: Error { case activeTrip, noActiveTrip, invalidTime, invalidState, capacity, closed }
public struct TrialPoint: Codable, Equatable, Sendable {
    public let time: Int64
    public let location: ObservationLocation
}
public struct TrialChoice: Codable, Equatable, Sendable {
    public let choice: TripChoice
    public let time: Int64
    public let source: String
}
public struct TrialTrip: Codable, Sendable {
    public let id: String
    public let viewerID: String
    public let vehicleID: String
    public let startedAt: Int64
    public var endedAt: Int64?
    public var points: [TrialPoint]
    public var choices: [TrialChoice]
    public var gaps: Int
    public var interrupted: Bool
    public var distanceMeters: Double
    public var syncedJourneyID: String?
    public var classification: TripChoice { choices.last!.choice }
    public var context: TripChoiceContext {
        TripChoiceContext(proposalID: id, vehicleID: vehicleID, viewerID: viewerID, revision: 0)
    }
}

// An explicit recording TEST, not a driver assertion or definitive logbook trip.
// One persisted record per authenticated viewer/vehicle; no reset on load failure.
public actor NativeTrialTrip: TripChoiceStore {
    private let disk: any ChoiceQueuePersistence
    private let binding: any ChoiceSessionBinding
    private let viewerID: String
    private let vehicleID: String
    private let clock: @Sendable () -> Int64
    private var working = false
    private var closed = false
    public init(disk: any ChoiceQueuePersistence, binding: any ChoiceSessionBinding,
                viewerID: String, vehicleID: String,
                clock: @escaping @Sendable () -> Int64 = { Int64(Date().timeIntervalSince1970) }) {
        self.disk = disk; self.binding = binding; self.viewerID = viewerID; self.vehicleID = vehicleID; self.clock = clock
    }
    private func begin() throws {
        guard !closed else { throw TrialTripError.closed }
        guard !working else { throw ChoiceQueueError.busy }; working = true
    }
    private func verify() async throws {
        try Task.checkCancellation()
        guard !closed else { throw TrialTripError.closed }
        let scope = try await binding.verifiedScope(vehicleID: vehicleID)
        guard !closed, scope.viewerID == viewerID, scope.vehicleID == vehicleID else { throw ChoiceQueueError.sessionChanged }
    }
    private func now() throws -> Int64 {
        let value = clock(); guard (0...253_402_300_799).contains(value) else { throw TrialTripError.invalidTime }; return value
    }
    private func read() async throws -> TrialTrip? {
        guard let data = try await disk.load() else { return nil }
        guard data.count <= 65_536 else { throw TrialTripError.capacity }
        let trip = try JSONDecoder().decode(TrialTrip.self, from: data)
        guard UUID(uuidString: trip.id) != nil, trip.viewerID == viewerID, trip.vehicleID == vehicleID,
              trip.startedAt >= 0, trip.endedAt == nil || trip.endedAt! >= trip.startedAt,
              !trip.choices.isEmpty, trip.choices.count <= 32, trip.points.count <= 300,
              trip.choices.first?.choice == .private, trip.choices.first?.source == "default_private",
              trip.choices.allSatisfy({ $0.time >= trip.startedAt && ["default_private", "explicit"].contains($0.source) }),
              trip.distanceMeters.isFinite, trip.distanceMeters >= 0, trip.gaps >= 0,
              trip.points.allSatisfy({ $0.time >= trip.startedAt && $0.location.latitude.isFinite && abs($0.location.latitude) <= 90 && $0.location.longitude.isFinite && abs($0.location.longitude) <= 180 && (0...30).contains($0.location.accuracyMeters) }) else { throw TrialTripError.invalidState }
        return trip
    }
    private func write(_ trip: TrialTrip) async throws {
        let data = try JSONEncoder().encode(trip)
        guard data.count <= 65_536 else { throw TrialTripError.capacity }
        try await verify(); try await disk.save(data); try await verify()
    }
    public func snapshot() async throws -> TrialTrip? {
        try begin(); defer { working = false }; try await verify()
        let value = try await read(); try await verify(); return value
    }
    public func start() async throws -> TrialTrip {
        try begin(); defer { working = false }; try await verify()
        if let old = try await read() {
            // Repeated start cannot silently overwrite either active or ended unsynced evidence.
            if old.endedAt == nil { return old }
            if old.syncedJourneyID == nil { throw TrialTripError.activeTrip }
        }
        let time = try now()
        let value = TrialTrip(id: UUID().uuidString, viewerID: viewerID, vehicleID: vehicleID,
            startedAt: time, points: [], choices: [TrialChoice(choice: .private, time: time, source: "default_private")],
            gaps: 0, interrupted: false, distanceMeters: 0)
        try await write(value); return value
    }
    public func append(_ sample: NativeMotionSample) async throws -> TrialTrip {
        try begin(); defer { working = false }; try await verify()
        guard var value = try await read(), value.endedAt == nil else { throw TrialTripError.noActiveTrip }
        guard sample.validForTrial(now: try now()), sample.time >= value.startedAt else { throw TrialTripError.invalidState }
        if let last = value.points.last {
            guard sample.time > last.time else { return value }
            // Bound storage and battery use. Never fill intervals with invented points.
            if sample.time - last.time < 15 { return value }
            if sample.time - last.time > 45 { value.gaps += 1 }
            else {
                let distance = Self.distance(last.location, sample.location)
                if distance / Double(sample.time - last.time) <= 80 { value.distanceMeters += distance }
                else { value.gaps += 1 }
            }
        }
        guard value.points.count < 300 else { throw TrialTripError.capacity }
        value.points.append(TrialPoint(time: sample.time, location: sample.location))
        try await write(value); return value
    }
    public func chooseIfCurrent(_ choice: TripChoice, context: TripChoiceContext) async throws {
        try begin(); defer { working = false }; try await verify()
        guard var value = try await read(), value.endedAt == nil, context == value.context else { throw ChoiceQueueError.staleProposal }
        guard value.choices.count < 32 else { throw TrialTripError.capacity }
        let time = try now(); guard time >= value.startedAt else { throw TrialTripError.invalidTime }
        if value.choices.last?.choice == choice && value.choices.last?.source == "explicit" { return }
        value.choices.append(TrialChoice(choice: choice, time: time, source: "explicit"))
        try await write(value)
    }
    public func stop(interrupted: Bool = false) async throws -> TrialTrip {
        try begin(); defer { working = false }; try await verify()
        guard var value = try await read() else { throw TrialTripError.noActiveTrip }
        if value.endedAt != nil { return value }
        let time = try now(); guard time > value.startedAt else { throw TrialTripError.invalidTime }
        value.endedAt = time; value.interrupted = interrupted
        if interrupted { value.gaps += 1 }
        try await write(value); return value
    }
    // Close before logout/account change. Persisted evidence remains encrypted under its own scope.
    public func close() { closed = true }
    public func markSynced(journeyID: String) async throws -> TrialTrip {
        try begin(); defer { working = false }; try await verify()
        guard var value = try await read(), value.endedAt != nil, UUID(uuidString: journeyID) != nil else { throw TrialTripError.invalidState }
        if let previous = value.syncedJourneyID, previous != journeyID { throw TrialTripError.invalidState }
        value.syncedJourneyID = journeyID; try await write(value); return value
    }
    private static func distance(_ a: ObservationLocation, _ b: ObservationLocation) -> Double {
        let rad = Double.pi / 180, dlat = (b.latitude-a.latitude)*rad, dlon = (b.longitude-a.longitude)*rad
        let h = pow(sin(dlat/2),2)+cos(a.latitude*rad)*cos(b.latitude*rad)*pow(sin(dlon/2),2)
        return 6_371_000*2*asin(sqrt(min(1,max(0,h))))
    }
}

public extension NativeMotionSample {
    // A manual trial records location even when CoreLocation reports speed=-1 (unknown).
    // This is not automatic driving detection or proof of movement.
    func validForTrial(now: Int64) -> Bool {
        time >= 0 && time <= now && now - time <= 15
            && location.latitude.isFinite && abs(location.latitude) <= 90
            && location.longitude.isFinite && abs(location.longitude) <= 180
            && location.accuracyMeters.isFinite && (0...30).contains(location.accuracyMeters)
    }
}

// Routes a notification only to an already-created matching trial or the existing server proposal store.
public actor TrialChoiceRouter: TripChoiceStore {
    private let trial: NativeTrialTrip
    private let proposals: any TripChoiceStore
    public init(trial: NativeTrialTrip, proposals: any TripChoiceStore) { self.trial = trial; self.proposals = proposals }
    public func chooseIfCurrent(_ choice: TripChoice, context: TripChoiceContext) async throws {
        if let local = try await trial.snapshot(), local.id == context.proposalID {
            try await trial.chooseIfCurrent(choice, context: context)
        } else { try await proposals.chooseIfCurrent(choice, context: context) }
    }
}
