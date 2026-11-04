import Foundation
import XCTest
@testable import RitKompasCore

private actor WorkflowDisk: ChoiceQueuePersistence {
    enum Failure: Error { case write }
    var bytes: Data?
    var fails = false
    func failWrites() { fails = true }
    func load() async throws -> Data? { bytes }
    func save(_ value: Data) async throws { if fails { throw Failure.write }; bytes = value }
}
private actor WorkflowBinding: ChoiceSessionBinding {
    func verifiedScope(vehicleID: String) async throws -> ChoiceSessionScope {
        ChoiceSessionScope(viewerID: "viewer", vehicleID: vehicleID)
    }
}
private actor WorkflowScheduler: TripChoiceScheduler {
    enum Failure: Error { case permission }
    var fail = false
    var hold = false
    var calls = 0
    var visible = false
    var started: CheckedContinuation<Void, Never>?
    var release: CheckedContinuation<Void, Never>?
    func configure(fail: Bool = false, hold: Bool = false) { self.fail = fail; self.hold = hold }
    func waitForAdd() async {
        if calls > 0 { return }
        await withCheckedContinuation { started = $0 }
    }
    func finishAdd() { release?.resume(); release = nil }
    func schedule(_ context: TripChoiceContext) async throws {
        calls += 1
        if hold {
            await withCheckedContinuation { continuation in
                release = continuation
                started?.resume(); started = nil
            }
        }
        if fail { throw Failure.permission }
        visible = true
    }
    func remove(_ context: TripChoiceContext) async { visible = false }
    func snapshot() -> (Int, Bool) { (calls, visible) }
}
private actor WorkflowStore: TripChoiceStore {
    var calls = 0
    func chooseIfCurrent(_ choice: TripChoice, context: TripChoiceContext) async throws { calls += 1 }
    func count() -> Int { calls }
}

final class ChoiceWorkflowTests: XCTestCase {
    private func context() -> TripChoiceContext {
        TripChoiceContext(proposalID: "proposal", vehicleID: "vehicle", viewerID: "viewer", revision: 0)
    }
    private func workflow(_ queue: DurableTripChoiceQueue, _ scheduler: WorkflowScheduler) -> TripChoiceWorkflow {
        TripChoiceWorkflow(queue: queue, delivery: TripChoiceDelivery(queue: queue, transport: UnconfiguredTripChoiceTransport()), scheduler: scheduler)
    }
    func testDiskFailurePrecedesOSNotification() async throws {
        let disk = WorkflowDisk(), scheduler = WorkflowScheduler()
        let queue = DurableTripChoiceQueue(persistence: disk, binding: WorkflowBinding())
        await disk.failWrites()
        do { try await workflow(queue, scheduler).prepare(context()); XCTFail("Must persist first") }
        catch WorkflowDisk.Failure.write {}
        let state = await scheduler.snapshot()
        XCTAssertEqual(state.0, 0); XCTAssertFalse(state.1)
    }
    func testPermissionFailureRetainsPendingForExplicitRetry() async throws {
        let scheduler = WorkflowScheduler(), c = context()
        let queue = DurableTripChoiceQueue(persistence: WorkflowDisk(), binding: WorkflowBinding())
        let flow = workflow(queue, scheduler)
        await scheduler.configure(fail: true)
        do { try await flow.prepare(c); XCTFail("Permission missing") }
        catch WorkflowScheduler.Failure.permission {}
        let unanswered = try await queue.hasUnanswered(c)
        XCTAssertTrue(unanswered)
        let actions = try await flow.actions(viewerID: c.viewerID, vehicleID: c.vehicleID)
        XCTAssertTrue(actions.isEmpty)
        await scheduler.configure()
        try await flow.prepare(c)
        let state = await scheduler.snapshot()
        XCTAssertEqual(state.0, 2); XCTAssertTrue(state.1)
    }
    func testUntrustedContextCannotCreatePendingProposal() async throws {
        let queue = DurableTripChoiceQueue(persistence: WorkflowDisk(), binding: WorkflowBinding())
        let result = await TripChoiceResponseHandler(store: workflow(queue, WorkflowScheduler())).handle(.choose(.business, context()))
        XCTAssertEqual(result, .rejected)
        let unanswered = try await queue.hasUnanswered(context())
        XCTAssertFalse(unanswered)
    }
    func testOpenDismissInvalidAndUnrelatedNeverChoose() async {
        let store = WorkflowStore()
        let actual = TripChoiceResponseHandler(store: store)
        let opened = await actual.handle(.opened), dismissed = await actual.handle(.dismissed)
        let ignored = await actual.handle(.unrelated), malformed = await actual.handle(.malformed)
        XCTAssertEqual(opened, .opened); XCTAssertEqual(dismissed, .dismissed)
        XCTAssertEqual(ignored, .ignored); XCTAssertEqual(malformed, .rejected)
        let count = await store.count(); XCTAssertEqual(count, 0)
    }
    func testDuplicateChoiceKeepsStableActionAndNeverAutomaticallySends() async throws {
        let c = context(), scheduler = WorkflowScheduler()
        let queue = DurableTripChoiceQueue(persistence: WorkflowDisk(), binding: WorkflowBinding())
        let flow = workflow(queue, scheduler), handler = TripChoiceResponseHandler(store: flow)
        try await flow.prepare(c)
        let result = await handler.handle(.choose(.business, c)); XCTAssertEqual(result, .queued)
        let first = try await flow.actions(viewerID: c.viewerID, vehicleID: c.vehicleID)
        let repeated = await handler.handle(.choose(.business, c)); XCTAssertEqual(repeated, .queued)
        let same = try await flow.actions(viewerID: c.viewerID, vehicleID: c.vehicleID)
        XCTAssertEqual(same, first); XCTAssertEqual(first.count, 1)
        let opposite = await handler.handle(.choose(.private, c)); XCTAssertEqual(opposite, .rejected)
        do { try await flow.send(try XCTUnwrap(first.first)); XCTFail("No configured transport") }
        catch NativeAPIError.sessionNotConfigured {}
        let retained = try await flow.actions(viewerID: c.viewerID, vehicleID: c.vehicleID)
        XCTAssertEqual(retained, first)
        let state = await scheduler.snapshot(); XCTAssertFalse(state.1)
    }
    func testNotificationAddedAfterChoiceIsRemovedAgain() async throws {
        let c = context(), scheduler = WorkflowScheduler()
        let queue = DurableTripChoiceQueue(persistence: WorkflowDisk(), binding: WorkflowBinding())
        let flow = workflow(queue, scheduler)
        await scheduler.configure(hold: true)
        let producer = Task { try await flow.prepare(c) }
        await scheduler.waitForAdd()
        try await flow.chooseIfCurrent(.private, context: c)
        await scheduler.finishAdd()
        try await producer.value
        let state = await scheduler.snapshot(); XCTAssertFalse(state.1)
        let actions = try await flow.actions(viewerID: c.viewerID, vehicleID: c.vehicleID)
        XCTAssertEqual(actions.count, 1)
    }
    func testUnconfiguredSessionStopsBeforeScheduling() async throws {
        let scheduler = WorkflowScheduler()
        let queue = DurableTripChoiceQueue(persistence: WorkflowDisk())
        do { try await workflow(queue, scheduler).prepare(context()); XCTFail("No verified scope") }
        catch NativeAPIError.sessionNotConfigured {}
        let state = await scheduler.snapshot(); XCTAssertEqual(state.0, 0)
    }
    func testStrictPayloadDecoderRejectsBooleanFractionAndInvalidIdentifiers() {
        let base: [AnyHashable: Any] = ["proposalID": "proposal", "vehicleID": "vehicle", "viewerID": "viewer", "revision": 0]
        XCTAssertEqual(TripChoicePayloadDecoder.context(base), context())
        let revisions: [Any] = [true, 0.5, -1, Double.nan, Double.infinity, "0", 9_007_199_254_740_991 as Double]
        for revision in revisions {
            var values = base; values["revision"] = revision
            XCTAssertNil(TripChoicePayloadDecoder.context(values))
        }
        for id in ["", "bad\nvalue", String(repeating: "x", count: 129)] {
            var values = base; values["proposalID"] = id
            XCTAssertNil(TripChoicePayloadDecoder.context(values))
        }
    }
}
