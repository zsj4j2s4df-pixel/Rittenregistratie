import XCTest
@testable import RitKompasCore
private actor RecoveryMemory: ChoiceQueuePersistence {
    var data: Data?
    var fail = false
    func load() -> Data? { data }
    func save(_ plaintext: Data) throws { if fail { throw NativeAPIError.unavailable }; data = plaintext }
    func setFailure(_ value: Bool) { fail = value }
}
private actor PausedRecoveryMemory: ChoiceQueuePersistence {
    var data: Data?
    var entered = false
    private var continuation: CheckedContinuation<Void, Never>?
    func load() -> Data? { data }
    func save(_ plaintext: Data) async {
        entered = true
        await withCheckedContinuation { continuation = $0 }
        data = plaintext
    }
    func isSaving() -> Bool { entered }
    func resume() { continuation?.resume(); continuation = nil }
}
final class NativeSettingsRecoveryTests: XCTestCase {
    private func edit(_ name: String = "Synthetic") -> NativeSettingsEdit {
        NativeSettingsEdit(settings: NativeVehicleSettings(revision: 0, plate: "", addresses: [
            NativeStoredAddress(id: "fixture", label: name, address: "Synthetic address", kind: .private)
        ], rates: []), reason: "Synthetic test")
    }
    func testExactRecoveryAfterReconstructionAndAcknowledgement() async throws {
        let memory = RecoveryMemory(), input = edit()
        let first = NativeSettingsRecovery(persistence: memory, viewerID: "one", vehicleID: "vehicle")
        try await first.save(input)
        let restarted = NativeSettingsRecovery(persistence: memory, viewerID: "one", vehicleID: "vehicle")
        let recovered = try await restarted.load(); XCTAssertEqual(recovered, input)
        try await restarted.save(input) // exact retry doesn't replace the request
        try await restarted.acknowledge(input)
        let final = try await first.load(); XCTAssertNil(final)
    }
    func testAnotherAccountOrVehicleCannotReadOrReplaceUnknownRequest() async throws {
        let memory = RecoveryMemory(), input = edit()
        let owner = NativeSettingsRecovery(persistence: memory, viewerID: "one", vehicleID: "vehicle")
        try await owner.save(input)
        for (viewer, vehicle) in [("two", "vehicle"), ("one", "another")] {
            let other = NativeSettingsRecovery(persistence: memory, viewerID: viewer, vehicleID: vehicle)
            do { _ = try await other.load(); XCTFail("cross-scope read") } catch {}
            do { try await other.save(edit("Another")); XCTFail("cross-scope replacement") } catch {}
        }
        do { try await owner.save(edit("Another")); XCTFail("unknown request overwritten") } catch {}
        let original = try await owner.load(); XCTAssertEqual(original, input)
    }
    func testWriteOrReceiptFailureKeepsOriginalRecovery() async throws {
        let memory = RecoveryMemory(), input = edit()
        let outbox = NativeSettingsRecovery(persistence: memory, viewerID: "one", vehicleID: "vehicle")
        await memory.setFailure(true)
        do { try await outbox.save(input); XCTFail("failed persistence passed") } catch {}
        let empty = try await outbox.load(); XCTAssertNil(empty)
        await memory.setFailure(false); try await outbox.save(input)
        do { try await outbox.acknowledge(edit()); XCTFail("wrong request acknowledged") } catch {}
        await memory.setFailure(true)
        do { try await outbox.acknowledge(input); XCTFail("failed ack passed") } catch {}
        let recovered = try await outbox.load(); XCTAssertEqual(recovered, input)
    }
    func testConcurrentEditCannotReplaceAnInFlightDiskWrite() async throws {
        let memory = PausedRecoveryMemory(), input = edit()
        let outbox = NativeSettingsRecovery(persistence: memory, viewerID: "one", vehicleID: "vehicle")
        let saving = Task { try await outbox.save(input) }
        while !(await memory.isSaving()) { await Task.yield() }
        do { try await outbox.save(edit("Another")); XCTFail("overlapping write accepted") }
        catch ChoiceQueueError.conflictingChoice {}
        await memory.resume(); try await saving.value
        let result = try await outbox.load(); XCTAssertEqual(result, input)
    }
    func testCloseDrainsDiskWriteAndPermanentlyRejectsLateRequests() async throws {
        let memory = PausedRecoveryMemory(), input = edit()
        let outbox = NativeSettingsRecovery(persistence: memory, viewerID: "one", vehicleID: "vehicle")
        let saving = Task { try await outbox.save(input) }
        while !(await memory.isSaving()) { await Task.yield() }
        let closing = Task { await outbox.close() }
        await Task.yield()
        await memory.resume(); try await saving.value; await closing.value
        do { _ = try await outbox.load(); XCTFail("closed reader reopened") }
        catch NativeAPIError.signInRequired {}
        do { try await outbox.save(edit("Late")); XCTFail("closed writer reopened") }
        catch NativeAPIError.signInRequired {}
        let reopened = NativeSettingsRecovery(persistence: memory, viewerID: "one", vehicleID: "vehicle")
        let result = try await reopened.load(); XCTAssertEqual(result, input)
    }
}
