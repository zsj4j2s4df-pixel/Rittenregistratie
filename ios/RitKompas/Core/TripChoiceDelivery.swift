import Foundation

// Transport must use the same verified SessionAccess as the queue binding.
// APIClient checks the queued viewer before every network request; the server
// still decides whether that session may mutate the vehicle/journey.
public protocol TripChoiceTransport: Actor {
    func sendChoice(_ action: QueuedTripChoice) async throws -> TripChoiceServerReceipt
}
#if os(iOS) || os(macOS)
@available(iOS 15.0, macOS 12.0, *)
extension APIClient: TripChoiceTransport {}
#endif

public enum TripChoiceDeliveryError: Error { case busy, actionNotPending }

// Explicit single-action delivery only: no timer, auto-drain, retry loop or
// promise of background execution. The app host/provider are still required.
public actor TripChoiceDelivery {
    private let queue: DurableTripChoiceQueue
    private let transport: any TripChoiceTransport
    private var busy = false

    public init(queue: DurableTripChoiceQueue, transport: any TripChoiceTransport) {
        self.queue = queue
        self.transport = transport
    }

    public func send(_ action: QueuedTripChoice) async throws {
        guard !busy else { throw TripChoiceDeliveryError.busy }
        busy = true
        defer { busy = false }
        try Task.checkCancellation()
        let current = try await queue.ready(viewerID: action.context.viewerID, vehicleID: action.context.vehicleID)
        guard current.contains(action) else { throw TripChoiceDeliveryError.actionNotPending }
        try Task.checkCancellation()
        // A lost response, conflict, cancellation or storage error leaves the
        // exact durable action available. Never manufacture a new requestID.
        let receipt = try await transport.sendChoice(action)
        try Task.checkCancellation()
        // Queue validates every receipt field and rechecks current scope before
        // removing anything. If acknowledgement fails, exact retry remains safe.
        try await queue.acknowledge(receipt, action: action)
    }
}
