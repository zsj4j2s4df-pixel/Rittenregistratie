import Foundation
import XCTest
@testable import RitKompasCore

private actor PendingBinding: ChoiceSessionBinding {
    var viewer = "viewer"
    func change() { viewer = "other" }
    func verifiedScope(vehicleID: String) async throws -> ChoiceSessionScope { ChoiceSessionScope(viewerID: viewer, vehicleID: vehicleID) }
}
private actor PendingDisk: ChoiceQueuePersistence {
    var bytes: Data?
    func load() async throws -> Data? { bytes }
    func save(_ value: Data) async throws { bytes = value }
}
private actor PendingScheduler: TripChoiceScheduler {
    var calls = 0
    func schedule(_ context: TripChoiceContext) async throws { calls += 1 }
    func remove(_ context: TripChoiceContext) async {}
    func count() -> Int { calls }
}
private actor PendingSource: PendingTripChoiceSource {
    var value: NativePendingChoices
    var fails = false
    var bindingToChange: PendingBinding?
    init(_ value: NativePendingChoices) { self.value = value }
    func fail() { fails = true }
    func switchDuringResponse(_ binding: PendingBinding) { bindingToChange = binding }
    func pendingChoices(vehicleID: String, expectedViewerID: String) async throws -> NativePendingChoices {
        if fails { throw NativeAPIError.connectionUncertain }
        if let bindingToChange { await bindingToChange.change() }
        return value
    }
}
private actor HeldPendingSource: PendingTripChoiceSource {
    var started: CheckedContinuation<Void, Never>?
    var release: CheckedContinuation<Void, Never>?
    var entered = false
    func waitForRead() async { if entered { return }; await withCheckedContinuation { started = $0 } }
    func finish() { release?.resume(); release = nil }
    func pendingChoices(vehicleID: String, expectedViewerID: String) async throws -> NativePendingChoices {
        entered = true
        await withCheckedContinuation { continuation in release = continuation; started?.resume(); started = nil }
        return NativePendingChoices(viewerId: expectedViewerID, vehicleId: vehicleID, expiresAt: 2000, proposals: [.init(id: "synthetic-proposal", revision: 0)])
    }
}
final class PendingTripChoiceProducerTests: XCTestCase {
    private func make(_ source: any PendingTripChoiceSource, binding: PendingBinding = PendingBinding()) -> (PendingTripChoiceProducer, PendingScheduler) {
        let scheduler = PendingScheduler()
        let queue = DurableTripChoiceQueue(persistence: PendingDisk(), binding: binding)
        let workflow = TripChoiceWorkflow(queue: queue, delivery: TripChoiceDelivery(queue: queue, transport: UnconfiguredTripChoiceTransport()), scheduler: scheduler)
        return (PendingTripChoiceProducer(vehicleID: "vehicle", workflow: workflow, binding: binding, source: source, clock: { 1000 }), scheduler)
    }
    private func feed(viewer: String = "viewer", expiry: Int64 = 2000, proposals: [NativePendingProposal] = [.init(id: "synthetic-proposal", revision: 0)], more: Bool = false) -> NativePendingChoices {
        NativePendingChoices(viewerId: viewer, vehicleId: "vehicle", expiresAt: expiry, proposals: proposals, moreAvailable: more)
    }
    func testRefreshDoesNotScheduleAndExplicitKnownProposalDoes() async throws {
        let (producer, scheduler) = make(PendingSource(feed(more: true)))
        let result = try await producer.refresh(); XCTAssertTrue(result.moreAvailable)
        let before = await scheduler.count(); XCTAssertEqual(before, 0)
        do { try await producer.notify(proposalID: "unknown"); XCTFail("No payload-created context") }
        catch PendingTripChoiceError.noCurrentProposal {}
        try await producer.notify(proposalID: "synthetic-proposal")
        let after = await scheduler.count(); XCTAssertEqual(after, 1)
    }
    func testWrongViewerExpiryDuplicatesAndOversizeFeedAreRejected() async throws {
        let duplicate = NativePendingProposal(id: "synthetic-proposal", revision: 0)
        for value in [feed(viewer: "other"), feed(expiry: 1000), feed(proposals: [duplicate, duplicate]), feed(proposals: (0..<26).map { .init(id: "proposal-\($0)", revision: 0) }), feed(proposals: [.init(id: "bad\nvalue", revision: 0)])] {
            let (producer, scheduler) = make(PendingSource(value))
            do { _ = try await producer.refresh(); XCTFail("Invalid feed") }
            catch PendingTripChoiceError.invalidFeed {}
            let calls = await scheduler.count(); XCTAssertEqual(calls, 0)
        }
    }
    func testFailedRefreshClearsOldFeedInsteadOfSilentlySchedulingStaleData() async throws {
        let source = PendingSource(feed()), (producer, _) = make(source)
        _ = try await producer.refresh(); await source.fail()
        do { _ = try await producer.refresh(); XCTFail("Connection failed") }
        catch NativeAPIError.connectionUncertain {}
        do { try await producer.notify(proposalID: "synthetic-proposal"); XCTFail("Old feed is cleared") }
        catch PendingTripChoiceError.noCurrentProposal {}
    }
    func testAccountChangeDuringReadRejectsResponse() async throws {
        let binding = PendingBinding(), source = PendingSource(feed())
        let (producer, scheduler) = make(source, binding: binding)
        await source.switchDuringResponse(binding)
        do { _ = try await producer.refresh(); XCTFail("Account changed") }
        catch PendingTripChoiceError.invalidFeed {}
        let calls = await scheduler.count(); XCTAssertEqual(calls, 0)
    }
    func testAccountChangeBeforeNotifyRejectsCachedContext() async throws {
        let binding = PendingBinding(), (producer, scheduler) = make(PendingSource(feed()), binding: binding)
        _ = try await producer.refresh(); await binding.change()
        do { try await producer.notify(proposalID: "synthetic-proposal"); XCTFail("Wrong account") }
        catch PendingTripChoiceError.invalidFeed {}
        let calls = await scheduler.count(); XCTAssertEqual(calls, 0)
    }
    func testClearDuringReadPreventsLateFeedResurrection() async throws {
        let source = HeldPendingSource(), (producer, _) = make(source)
        let read = Task { try await producer.refresh() }
        await source.waitForRead(); await producer.clear(); await source.finish()
        do { _ = try await read.value; XCTFail("Cleared during read") }
        catch PendingTripChoiceError.invalidFeed {}
        do { try await producer.notify(proposalID: "synthetic-proposal"); XCTFail("No current feed") }
        catch PendingTripChoiceError.noCurrentProposal {}
    }
    func testVoiceQueuesExplicitChoiceWithoutNotificationOrNetworkDelivery() async throws {
        for choice in [TripChoice.private, .business] {
            let binding = PendingBinding(), scheduler = PendingScheduler()
            let queue = DurableTripChoiceQueue(persistence: PendingDisk(), binding: binding)
            let workflow = TripChoiceWorkflow(queue: queue, delivery: TripChoiceDelivery(queue: queue, transport: UnconfiguredTripChoiceTransport()), scheduler: scheduler)
            let producer = PendingTripChoiceProducer(vehicleID: "vehicle", workflow: workflow, binding: binding, source: PendingSource(feed()), clock: { 1000 })
            try await producer.chooseOnlyPending(choice)
            let actions = try await workflow.actions(viewerID: "viewer", vehicleID: "vehicle")
            XCTAssertEqual(actions.count, 1)
            XCTAssertEqual(actions.first?.choice, choice)
            let alerts = await scheduler.count(); XCTAssertEqual(alerts, 0)
        }
    }
    func testVoiceRefusesEmptyMultipleAndTruncatedFeeds() async throws {
        for value in [feed(proposals: []), feed(proposals: [.init(id: "synthetic-proposal", revision: 0), .init(id: "second-proposal-id", revision: 0)]), feed(more: true)] {
            let (producer, scheduler) = make(PendingSource(value))
            do { try await producer.chooseOnlyPending(.business); XCTFail("No ambiguous voice classification") }
            catch PendingTripChoiceError.ambiguousProposal {}
            let alerts = await scheduler.count(); XCTAssertEqual(alerts, 0)
        }
    }
    func testVoiceRejectsAccountChangeAndClearingDuringRead() async throws {
        let binding = PendingBinding(), source = PendingSource(feed())
        let (producer, _) = make(source, binding: binding)
        await source.switchDuringResponse(binding)
        do { try await producer.chooseOnlyPending(.private); XCTFail("Changed account") }
        catch PendingTripChoiceError.invalidFeed {}
        let held = HeldPendingSource(), (other, _) = make(held)
        let task = Task { try await other.chooseOnlyPending(.business) }
        await held.waitForRead(); await other.clear(); await held.finish()
        do { try await task.value; XCTFail("Cleared account") }
        catch PendingTripChoiceError.invalidFeed {}
    }

}
