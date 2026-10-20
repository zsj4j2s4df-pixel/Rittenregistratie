import Foundation
import XCTest
@testable import RitKompasCore

private actor DeliveryMemory: ChoiceQueuePersistence {
    var bytes: Data?
    func load() async throws -> Data? { bytes }
    func save(_ plaintext: Data) async throws { bytes = plaintext }
}
private actor DeliveryBinding: ChoiceSessionBinding {
    var viewer = "synthetic-viewer"
    func change() { viewer = "other-viewer" }
    func verifiedScope(vehicleID: String) async throws -> ChoiceSessionScope {
        ChoiceSessionScope(viewerID: viewer, vehicleID: vehicleID)
    }
}
private actor DeliveryTransport: TripChoiceTransport {
    enum Failure: Error { case lostResponse }
    var actions: [QueuedTripChoice] = []
    var fail = true
    func succeed() { fail = false }
    func sent() -> [QueuedTripChoice] { actions }
    func sendChoice(_ action: QueuedTripChoice) async throws -> TripChoiceServerReceipt {
        actions.append(action)
        if fail { throw Failure.lostResponse }
        return TripChoiceServerReceipt(journeyId: action.context.proposalID, viewerId: action.context.viewerID,
                                       requestId: action.requestID, revision: action.context.revision + 1,
                                       classification: action.choice)
    }
}

final class ChoiceDeliveryTests: XCTestCase {
    func testLostResponseRetainsExactActionAndSuccessfulRetryAcknowledges() async throws {
        let binding = DeliveryBinding(), disk = DeliveryMemory(), transport = DeliveryTransport()
        let queue = DurableTripChoiceQueue(persistence: disk, binding: binding)
        let context = TripChoiceContext(proposalID: "synthetic-proposal", vehicleID: "synthetic-vehicle", viewerID: "synthetic-viewer", revision: 0)
        try await queue.registerPending(context)
        try await queue.chooseIfCurrent(.business, context: context)
        let pending = try await queue.ready(viewerID: context.viewerID, vehicleID: context.vehicleID)
        let action = try XCTUnwrap(pending.first)
        let delivery = TripChoiceDelivery(queue: queue, transport: transport)
        do { try await delivery.send(action); XCTFail("Lost response must not acknowledge") }
        catch DeliveryTransport.Failure.lostResponse { }
        let retained = try await queue.ready(viewerID: context.viewerID, vehicleID: context.vehicleID)
        XCTAssertEqual(retained, [action])
        await transport.succeed()
        try await delivery.send(action)
        let sent = await transport.sent()
        XCTAssertEqual(sent, [action, action])
        let remaining = try await queue.ready(viewerID: context.viewerID, vehicleID: context.vehicleID)
        XCTAssertTrue(remaining.isEmpty)
        do { try await delivery.send(action); XCTFail("Acknowledged action cannot be resent") }
        catch TripChoiceDeliveryError.actionNotPending { }
    }

    func testAccountSwitchStopsBeforeTransport() async throws {
        let binding = DeliveryBinding(), transport = DeliveryTransport()
        let queue = DurableTripChoiceQueue(persistence: DeliveryMemory(), binding: binding)
        let context = TripChoiceContext(proposalID: "synthetic-proposal", vehicleID: "synthetic-vehicle", viewerID: "synthetic-viewer", revision: 0)
        try await queue.registerPending(context)
        try await queue.chooseIfCurrent(.private, context: context)
        let pending = try await queue.ready(viewerID: context.viewerID, vehicleID: context.vehicleID)
        let action = try XCTUnwrap(pending.first)
        await binding.change()
        do { try await TripChoiceDelivery(queue: queue, transport: transport).send(action); XCTFail("Wrong account") }
        catch ChoiceQueueError.sessionChanged { }
        let sent = await transport.sent()
        XCTAssertTrue(sent.isEmpty)
    }
}
