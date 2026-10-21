import XCTest
@testable import RitKompasCore

private actor CaptureMemory: ChoiceQueuePersistence {
    var data: Data?
    var fail = false
    func load() -> Data? { data }
    func save(_ value: Data) throws { if fail { throw NativeAPIError.unavailable }; data = value }
    func failure(_ value: Bool) { fail = value }
}
private actor CaptureBinding: ChoiceSessionBinding {
    var viewer = "synthetic-one"
    func change() { viewer = "synthetic-two" }
    func verifiedScope(vehicleID: String) -> ChoiceSessionScope { ChoiceSessionScope(viewerID: viewer, vehicleID: vehicleID) }
}
private actor CaptureTransport: NativeCaptureTransport {
    var requests: [DetectionInput] = []
    var registrations: [DeviceRegistration] = []
    var lose = true
    var wrong = false
    func wrongReceipt() { wrong = true }
    func observed() -> [DetectionInput] { requests }
    func registered() -> [DeviceRegistration] { registrations }
    func registerCapture(vehicleID: String, input: DeviceRegistration, expectedViewerID: String) throws -> RegisteredDevice {
        registrations.append(input)
        return RegisteredDevice(id: input.id, userID: expectedViewerID, vehicleID: vehicleID, name: input.name,
            platform: .ios, active: 1, revision: 0, createdAt: 1000, updatedAt: 1000)
    }
    func ingestCapture(vehicleID: String, deviceID: String, input: DetectionInput, expectedViewerID: String) throws -> DetectionObservation {
        requests.append(input)
        if lose { lose = false; throw NativeAPIError.connectionUncertain }
        let payload = try JSONSerialization.data(withJSONObject: ["observedAt": input.observedAt,
            "source": input.source.rawValue, "kind": input.kind.rawValue, "detail": input.detail!,
            "location": ["latitude": input.location!.latitude, "longitude": input.location!.longitude, "accuracyMeters": input.location!.accuracyMeters]])
        return DetectionObservation(id: "synthetic-observation", vehicleID: vehicleID,
            userID: wrong ? "wrong-viewer" : expectedViewerID, deviceID: deviceID,
            eventID: input.eventId, observedAt: input.observedAt, receivedAt: 1000,
            source: input.source, eventKind: input.kind, uncertainty: "unverified_app_observation",
            payloadJSON: String(decoding: payload, as: UTF8.self))
    }
}

final class NativeCaptureTests: XCTestCase {
    private func sample(_ time: Int64, speed: Double = 4, accuracy: Double = 5, lon: Double = 0) -> NativeMotionSample {
        NativeMotionSample(time: time, latitude: 0, longitude: lon, accuracy: accuracy, speed: speed)
    }
    private func activate(_ detector: inout ForegroundMotionDetector) {
        XCTAssertNil(detector.observe(sample(1000), now: 1000))
        XCTAssertNil(detector.observe(sample(1006), now: 1006))
        XCTAssertEqual(detector.observe(sample(1012), now: 1012), .startCandidate)
    }
    func testStartNeedsSustainedMovementAndDoesNotRepeat() {
        var detector = ForegroundMotionDetector(); activate(&detector)
        XCTAssertTrue(detector.active)
        XCTAssertNil(detector.observe(sample(1018), now: 1018))
    }
    func testTwoMinuteStopIsOnlyCandidateAndElectricDrivingDoesNotRequireIgnition() {
        var detector = ForegroundMotionDetector(); activate(&detector)
        for time in stride(from: Int64(1018), through: 1132, by: 6) {
            XCTAssertNil(detector.observe(sample(time, speed: 0), now: time))
        }
        XCTAssertTrue(detector.active) // short customer stop does not close
        XCTAssertEqual(detector.observe(sample(1138, speed: 0), now: 1138), .endCandidate)
        XCTAssertFalse(detector.active)
    }
    func testMovingOutOfStopRadiusResetsStopTimer() {
        var detector = ForegroundMotionDetector(); activate(&detector)
        for time in stride(from: Int64(1018), through: 1144, by: 6) {
            XCTAssertNil(detector.observe(sample(time, speed: 0.5, lon: Double(time-1018)*0.00002), now: time))
        }
        XCTAssertTrue(detector.active)
    }
    func testBadAccuracyStaleOutOfOrderAndGapNeverInventEndOrDistance() {
        for (point, now) in [(sample(1018, accuracy: 100), Int64(1018)), (sample(1018), Int64(1100)),
                             (sample(1000), Int64(1012)), (sample(1100, speed: 0), Int64(1100))] {
            var detector = ForegroundMotionDetector(); activate(&detector)
            XCTAssertNil(detector.observe(point, now: now)); XCTAssertFalse(detector.active)
        }
        var detector = ForegroundMotionDetector(); activate(&detector); detector.interrupt()
        XCTAssertFalse(detector.active)
    }
    func testInvalidCoordinatesNegativeSpeedAndFutureAreRejected() {
        for point in [sample(1000, speed: -1), sample(1000, accuracy: -1), sample(1000, lon: .nan), sample(1001)] {
            XCTAssertFalse(point.valid(now: 1000))
        }
    }
    func testExactRetryAfterRestartPreservesEventAndRegistrationIDs() async throws {
        let memory = CaptureMemory(), binding = CaptureBinding(), transport = CaptureTransport()
        let first = NativeCaptureOutbox(persistence: memory, binding: binding, viewerID: "synthetic-one", vehicleID: "vehicle")
        _ = try await first.append(sample: sample(1000), boundary: .startCandidate, now: 1000)
        do { _ = try await first.flush(using: transport); XCTFail("uncertain result") } catch NativeAPIError.connectionUncertain {}
        let reconstructed = NativeCaptureOutbox(persistence: memory, binding: binding, viewerID: "synthetic-one", vehicleID: "vehicle")
        let count = try await reconstructed.count(); XCTAssertEqual(count, 2)
        _ = try await reconstructed.flush(using: transport)
        let requests = await transport.observed(), registrations = await transport.registered()
        XCTAssertEqual(requests[0], requests[1]); XCTAssertEqual(registrations[0], registrations[1])
        let empty = try await reconstructed.count(); XCTAssertEqual(empty, 0)
    }
    func testWrongReceiptAndAccountCannotClearQueuedObservations() async throws {
        let memory = CaptureMemory(), binding = CaptureBinding(), transport = CaptureTransport()
        let outbox = NativeCaptureOutbox(persistence: memory, binding: binding, viewerID: "synthetic-one", vehicleID: "vehicle")
        _ = try await outbox.append(sample: sample(1000), boundary: nil, now: 1000)
        do { _ = try await outbox.flush(using: transport) } catch NativeAPIError.connectionUncertain {}
        await transport.wrongReceipt()
        do { _ = try await outbox.flush(using: transport); XCTFail("wrong receipt accepted") } catch ChoiceQueueError.invalidReceipt {}
        let kept = try await outbox.count(); XCTAssertEqual(kept, 1)
        await binding.change()
        do { _ = try await outbox.count(); XCTFail("account leaked") } catch ChoiceQueueError.sessionChanged {}
        let other = NativeCaptureOutbox(persistence: memory, binding: binding, viewerID: "synthetic-two", vehicleID: "vehicle")
        do { _ = try await other.count(); XCTFail("other scope opened file") } catch ChoiceQueueError.invalidStorage {}
    }
    func testDiskFailureCapacityAndClosedActorNeverSilentlyReset() async throws {
        let memory = CaptureMemory(), binding = CaptureBinding()
        let outbox = NativeCaptureOutbox(persistence: memory, binding: binding, viewerID: "synthetic-one", vehicleID: "vehicle")
        await memory.failure(true)
        do { _ = try await outbox.append(sample: sample(1000), boundary: nil, now: 1000); XCTFail("disk failure passed") } catch {}
        await memory.failure(false)
        for time in 1000..<1096 { _ = try await outbox.append(sample: sample(Int64(time)), boundary: nil, now: Int64(time)) }
        do { _ = try await outbox.append(sample: sample(1096), boundary: nil, now: 1096); XCTFail("capacity truncated") } catch ChoiceQueueError.storageFull {}
        let kept = try await outbox.count(); XCTAssertEqual(kept, 96)
        await outbox.close()
        do { _ = try await outbox.count(); XCTFail("closed actor reopened") } catch NativeAPIError.signInRequired {}
    }
}
