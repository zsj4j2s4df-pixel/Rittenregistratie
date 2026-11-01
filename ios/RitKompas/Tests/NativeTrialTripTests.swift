import Foundation
import XCTest
@testable import RitKompasCore

private final class TrialClock: @unchecked Sendable {
    private let lock = NSLock()
    private var value: Int64 = 1000
    func get() -> Int64 { lock.lock(); defer { lock.unlock() }; return value }
    func set(_ value: Int64) { lock.lock(); defer { lock.unlock() }; self.value = value }
}
private actor TrialDisk: ChoiceQueuePersistence {
    var bytes: Data?
    var fails = false
    func fail() { fails = true }
    func load() async throws -> Data? { bytes }
    func save(_ data: Data) async throws { if fails { throw TrialTripError.capacity }; bytes = data }
}
private actor TrialBinding: ChoiceSessionBinding {
    var viewer = "viewer"
    func change() { viewer = "other" }
    func verifiedScope(vehicleID: String) async throws -> ChoiceSessionScope { ChoiceSessionScope(viewerID: viewer, vehicleID: vehicleID) }
}
private actor TrialServer: NativeTrialTransport {
    let journeyID = UUID().uuidString
    var choiceReceipts: [String: TripChoiceServerReceipt] = [:]
    var choices: [(String, String)] = []
    var operations: [String] = []
    var observations: [DetectionInput] = []
    var loseChoiceResponse = false
    var corruptObservation = false
    func loseNextChoiceResponse() { loseChoiceResponse = true }
    func corrupt() { corruptObservation = true }
    func registerCapture(vehicleID: String, input: DeviceRegistration, expectedViewerID: String) async throws -> RegisteredDevice {
        RegisteredDevice(id: input.id, userID: expectedViewerID, vehicleID: vehicleID, name: input.name, platform: .ios, active: 1, revision: 0, createdAt: 1000, updatedAt: 1000)
    }
    func ingestCapture(vehicleID: String, deviceID: String, input: DetectionInput, expectedViewerID: String) async throws -> DetectionObservation {
        // Mirror the real intake contract; permissive mocks previously hid this bug.
        if input.location != nil && input.source != .gps { throw NativeAPIError.requestRejected(400) }
        observations.append(input)
        struct Payload: Encodable { let observedAt: Int64; let source: ObservationSource; let kind: ObservationKind; let detail: String?; let location: ObservationLocation? }
        let payload = Payload(observedAt: input.observedAt, source: input.source, kind: input.kind, detail: input.detail, location: corruptObservation ? nil : input.location)
        return DetectionObservation(id: input.eventId, vehicleID: vehicleID, userID: expectedViewerID, deviceID: deviceID, eventID: input.eventId,
            observedAt: input.observedAt, receivedAt: 1100, source: input.source, eventKind: input.kind, uncertainty: "unverified_app_observation", payloadJSON: String(data: try JSONEncoder().encode(payload), encoding: .utf8)!)
    }
    func trialJourney(vehicleID: String, journeyID: String?, operation: String, input: TrialJourneyCommand, viewerID: String) async throws -> TrialJourneyReceipt {
        operations.append(operation)
        return TrialJourneyReceipt(journeyId: self.journeyID, operation: operation, revision: operation == "create" ? 0 : input.expectedRevision! + 1)
    }
    func trialChoice(_ action: QueuedTripChoice, reason: String) async throws -> TripChoiceServerReceipt {
        choices.append((action.requestID, reason))
        if let receipt = choiceReceipts[action.requestID] { return receipt }
        let receipt = TripChoiceServerReceipt(journeyId: journeyID, viewerId: action.context.viewerID, requestId: action.requestID,
            revision: action.context.revision + 1, classification: action.choice)
        choiceReceipts[action.requestID] = receipt
        if loseChoiceResponse { loseChoiceResponse = false; throw NativeAPIError.connectionUncertain }
        return receipt
    }
    func choiceCalls() -> [(String, String)] { choices }
    func operationCalls() -> [String] { operations }
    func observationCalls() -> [DetectionInput] { observations }
}

// Frozen version-1 disk shape from the pre-fix app. Source is derived at send
// time, not stored in this plan; an update must preserve every existing ID.
private struct LegacyTrialEventIDs: Codable { let requestID: String; let eventID: String }
private struct LegacyTrialPlan: Encodable {
    let version = 1
    let trip: TrialTrip
    let registration: DeviceRegistration
    let events: [LegacyTrialEventIDs]
    let journeyRequests: [String]
    let choiceRequests: [String]
    let registered = true
    let eventIndex: Int
    let observationIDs: [String]
    let journeyID: String?
    let revision: Int
    let choiceIndex = 0
    let closed = false
}

final class NativeTrialTripTests: XCTestCase {
    private func make(_ clock: TrialClock = TrialClock(), disk: TrialDisk = TrialDisk(), binding: TrialBinding = TrialBinding()) -> NativeTrialTrip {
        NativeTrialTrip(disk: disk, binding: binding, viewerID: "viewer", vehicleID: "vehicle", clock: { clock.get() })
    }
    func testDefaultPrivateExplicitAuditAndCrashRestoreNeverInventLocations() async throws {
        let clock = TrialClock(), disk = TrialDisk(), binding = TrialBinding(), trial = make(clock, disk: disk, binding: binding)
        let started = try await trial.start()
        XCTAssertEqual(started.classification, .private); XCTAssertTrue(started.points.isEmpty)
        let duplicate = try await trial.start(); XCTAssertEqual(started.id, duplicate.id)
        clock.set(1015)
        _ = try await trial.append(NativeMotionSample(time: 1015, latitude: 52, longitude: 4, accuracy: 5, speed: -1))
        clock.set(1080)
        let gap = try await trial.append(NativeMotionSample(time: 1080, latitude: 52.001, longitude: 4, accuracy: 5, speed: 3))
        XCTAssertEqual(gap.gaps, 1); XCTAssertEqual(gap.distanceMeters, 0)
        try await trial.chooseIfCurrent(.business, context: started.context)
        let restored = make(clock, disk: disk, binding: binding)
        let snapshot = try await restored.snapshot()
        XCTAssertEqual(snapshot?.choices.map(\.source), ["default_private", "explicit"])
        XCTAssertEqual(snapshot?.classification, .business)
        clock.set(1100); let ended = try await restored.stop(); XCTAssertEqual(ended.endedAt, 1100)
        do { _ = try await restored.start(); XCTFail("Unsent stopped evidence must not be replaced") } catch TrialTripError.activeTrip {}
    }
    func testStorageFailureDoesNotCreateTrialAndForeignScopeCannotChoose() async throws {
        let disk = TrialDisk(); await disk.fail(); let trial = make(disk: disk)
        do { _ = try await trial.start(); XCTFail("Disk failed") } catch TrialTripError.capacity {}
        let binding = TrialBinding(), other = make(binding: binding), value = try await other.start()
        await binding.change()
        do { try await other.chooseIfCurrent(.business, context: value.context); XCTFail("Foreign account") } catch ChoiceQueueError.sessionChanged {}
    }
    func testStoppedTrialRejectsLateNotificationAndClosedSessionCannotResume() async throws {
        let clock = TrialClock(), trial = make(clock), value = try await trial.start()
        clock.set(1001); _ = try await trial.stop()
        do { try await trial.chooseIfCurrent(.business, context: value.context); XCTFail("Late notification") } catch ChoiceQueueError.staleProposal {}
        await trial.close()
        do { _ = try await trial.start(); XCTFail("Closed binding") } catch TrialTripError.closed {}
    }
    func testSyncReusesExactChoiceAfterLostResponseAndPersistsAllStages() async throws {
        let clock = TrialClock(), binding = TrialBinding(), trial = make(clock, binding: binding)
        let started = try await trial.start()
        clock.set(1015); _ = try await trial.append(NativeMotionSample(time: 1015, latitude: 52, longitude: 4, accuracy: 5, speed: -1))
        try await trial.chooseIfCurrent(.business, context: started.context)
        clock.set(1030); let trip = try await trial.stop()
        let disk = TrialDisk(), server = TrialServer(); await server.loseNextChoiceResponse()
        let sync = NativeTrialSync(disk: disk, binding: binding, viewerID: "viewer", vehicleID: "vehicle")
        do { _ = try await sync.sync(trip, using: server); XCTFail("Lost response") } catch NativeAPIError.connectionUncertain {}
        let recovered = NativeTrialSync(disk: disk, binding: binding, viewerID: "viewer", vehicleID: "vehicle")
        let id = try await recovered.sync(trip, using: server)
        let calls = await server.choiceCalls()
        XCTAssertEqual(calls.count, 3); XCTAssertEqual(calls[0].0, calls[1].0)
        XCTAssertTrue(calls[0].1.contains("standaard")); XCTAssertTrue(calls[2].1.contains("Expliciete"))
        let operations = await server.operationCalls(); XCTAssertEqual(operations, ["create", "join", "close"])
        let again = try await recovered.sync(trip, using: server); XCTAssertEqual(again, id)
        _ = try await trial.markSynced(journeyID: id)
        clock.set(1040); let next = try await trial.start(); XCTAssertNotEqual(next.id, trip.id)
    }
    func testActiveTrialNeverSyncsAndWrongReceiptNeverAcknowledges() async throws {
        let clock = TrialClock(), binding = TrialBinding(), trial = make(clock, binding: binding)
        let value = try await trial.start(), server = TrialServer()
        let sync = NativeTrialSync(disk: TrialDisk(), binding: binding, viewerID: "viewer", vehicleID: "vehicle")
        do { _ = try await sync.sync(value, using: server); XCTFail("Still active") } catch TrialTripError.invalidState {}
        clock.set(1015); _ = try await trial.append(NativeMotionSample(time: 1015, latitude: 52, longitude: 4, accuracy: 5, speed: 0))
        clock.set(1030); let ended = try await trial.stop(); await server.corrupt()
        do { _ = try await sync.sync(ended, using: server); XCTFail("Wrong location receipt") } catch ChoiceQueueError.invalidReceipt {}
    }
    func testPreFixVersionOneDiskPlanResumesRejectedStartOrEndWithoutReplacingIDs() async throws {
        // Cover a failed first observation and a plan that already acknowledged
        // start + GPS but is blocked at the final observation.
        for acknowledged in [0, 2] {
            let clock = TrialClock(), binding = TrialBinding(), trial = make(clock, binding: binding)
            _ = try await trial.start()
            clock.set(1015)
            _ = try await trial.append(NativeMotionSample(time: 1015, latitude: 52, longitude: 4, accuracy: 5, speed: -1))
            clock.set(1030); let trip = try await trial.stop()
            let disk = TrialDisk(), server = TrialServer()
            let events = (0..<3).map { _ in LegacyTrialEventIDs(requestID: UUID().uuidString, eventID: UUID().uuidString) }
            let saved = LegacyTrialPlan(trip: trip,
                registration: DeviceRegistration(requestId: UUID().uuidString, id: UUID().uuidString, name: "Synthetic saved plan"),
                events: events, journeyRequests: events.map { _ in UUID().uuidString },
                choiceRequests: trip.choices.map { _ in UUID().uuidString },
                eventIndex: acknowledged, observationIDs: events.prefix(acknowledged).map(\.eventID),
                journeyID: acknowledged == 0 ? nil : server.journeyID, revision: acknowledged == 0 ? 0 : 1)
            try await disk.save(JSONEncoder().encode(saved))
            let reopened = NativeTrialSync(disk: disk, binding: binding, viewerID: "viewer", vehicleID: "vehicle")
            let result = try await reopened.sync(trip, using: server)
            XCTAssertEqual(result, server.journeyID)
            let sent = await server.observationCalls()
            XCTAssertEqual(sent.map(\.requestId), events.dropFirst(acknowledged).map(\.requestID))
            XCTAssertEqual(sent.map(\.eventId), events.dropFirst(acknowledged).map(\.eventID))
            XCTAssertTrue(sent.allSatisfy { $0.source == .gps && $0.location != nil })
            let loaded = try await disk.load()
            let bytes = try XCTUnwrap(loaded)
            let persisted = try JSONSerialization.jsonObject(with: bytes) as! [String: Any]
            let original = try JSONSerialization.jsonObject(with: JSONEncoder().encode(saved)) as! [String: Any]
            for key in ["trip", "registration", "events", "journeyRequests", "choiceRequests"] {
                XCTAssertTrue((persisted[key] as! NSObject).isEqual(original[key]), "Existing \(key) changed")
            }
            XCTAssertEqual(persisted["closed"] as? Bool, true)
            let repeated = try await reopened.sync(trip, using: server)
            XCTAssertEqual(repeated, result)
            let callsAfterRetry = await server.observationCalls()
            XCTAssertEqual(callsAfterRetry.count, sent.count)
        }
    }
    func testMeasuredDistanceSkipsImpossibleJumpsAndRejectsInaccurateLocations() async throws {
        let clock = TrialClock(), trial = make(clock)
        _ = try await trial.start()
        _ = try await trial.append(NativeMotionSample(time: 1000, latitude: 52, longitude: 4, accuracy: 5, speed: -1))
        clock.set(1015)
        let measured = try await trial.append(NativeMotionSample(time: 1015, latitude: 52.001, longitude: 4, accuracy: 5, speed: -1))
        XCTAssertEqual(measured.distanceMeters, 111.195, accuracy: 1)
        clock.set(1030)
        let jump = try await trial.append(NativeMotionSample(time: 1030, latitude: 53, longitude: 4, accuracy: 5, speed: 0))
        XCTAssertEqual(jump.distanceMeters, measured.distanceMeters); XCTAssertEqual(jump.gaps, 1)
        clock.set(1045)
        do { _ = try await trial.append(NativeMotionSample(time: 1045, latitude: 53, longitude: 4, accuracy: 1000, speed: 0)); XCTFail("Inaccurate fix") }
        catch TrialTripError.invalidState {}
    }
    func testSameSecondStopDoesNotPersistAnUnsynchronizableZeroLengthTrip() async throws {
        let clock = TrialClock(), trial = make(clock)
        _ = try await trial.start()
        do { _ = try await trial.stop(); XCTFail("Zero duration") } catch TrialTripError.invalidTime {}
        let active = try await trial.snapshot(); XCTAssertNil(active?.endedAt)
        clock.set(1001); let stopped = try await trial.stop(); XCTAssertEqual(stopped.endedAt, 1001)
    }
}
