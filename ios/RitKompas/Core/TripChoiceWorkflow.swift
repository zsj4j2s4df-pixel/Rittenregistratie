import Foundation
import CoreFoundation

public protocol TripChoiceScheduler: Actor {
    func schedule(_ context: TripChoiceContext) async throws
    func remove(_ context: TripChoiceContext) async
}
public actor UnconfiguredTripChoiceScheduler: TripChoiceScheduler {
    public init() {}
    public func schedule(_ context: TripChoiceContext) async throws { throw NativeAPIError.sessionNotConfigured }
    public func remove(_ context: TripChoiceContext) async {}
}
public actor UnconfiguredTripChoiceTransport: TripChoiceTransport {
    public init() {}
    public func sendChoice(_ action: QueuedTripChoice) async throws -> TripChoiceServerReceipt { throw NativeAPIError.sessionNotConfigured }
}
public enum TripChoiceWorkflowError: Error { case alreadyAnswered }

// Producer accepts only actual server-read pending context. NEVER call prepare
// from notification userInfo. Responses only call chooseIfCurrent, so an
// untrusted notification cannot create its own pending proposal.
public actor TripChoiceWorkflow: TripChoiceStore {
    private let queue: DurableTripChoiceQueue
    private let delivery: TripChoiceDelivery
    private let scheduler: any TripChoiceScheduler
    public init(queue: DurableTripChoiceQueue, delivery: TripChoiceDelivery, scheduler: any TripChoiceScheduler = UnconfiguredTripChoiceScheduler()) {
        self.queue = queue; self.delivery = delivery; self.scheduler = scheduler
    }
    public func prepare(_ context: TripChoiceContext) async throws {
        try Task.checkCancellation()
        try await queue.registerPending(context) // Disk failure must precede any OS notification.
        guard try await queue.hasUnanswered(context) else {
            await scheduler.remove(context)
            throw TripChoiceWorkflowError.alreadyAnswered
        }
        do {
            try Task.checkCancellation()
            try await scheduler.schedule(context)
            try Task.checkCancellation()
            // A response or explicit delivery may race with asynchronous add.
            // Remove a notification added after the action was already handled.
            let unanswered = try await queue.hasUnanswered(context)
            if !unanswered { await scheduler.remove(context) }
        } catch {
            await scheduler.remove(context)
            throw error // Durable pending context remains; no implicit classification.
        }
    }
    public func chooseIfCurrent(_ choice: TripChoice, context: TripChoiceContext) async throws {
        try Task.checkCancellation()
        try await queue.chooseIfCurrent(choice, context: context)
        await scheduler.remove(context) // Only AFTER durable local save, no network.
    }
    public func actions(viewerID: String, vehicleID: String) async throws -> [QueuedTripChoice] {
        try await queue.ready(viewerID: viewerID, vehicleID: vehicleID)
    }
    // Explicit foreground retry only, never invoked by the notification delegate.
    public func send(_ action: QueuedTripChoice) async throws {
        try await delivery.send(action)
        await scheduler.remove(action.context)
    }
}

public enum TripChoiceResponse: Sendable {
    case choose(TripChoice, TripChoiceContext), opened, dismissed, unrelated, malformed
}
public enum TripChoiceHandlingResult: Sendable, Equatable { case queued, opened, dismissed, ignored, rejected }
// Synchronous decoding only. It never authorizes or registers pending context.
// Parse on the platform callback before crossing an actor/task boundary; do not
// transfer UNNotificationResponse or [AnyHashable:Any] into an unstructured Task.
public enum TripChoicePayloadDecoder {
    public static func context(_ values: [AnyHashable: Any]) -> TripChoiceContext? {
        guard let proposal = values["proposalID"] as? String,
              let vehicle = values["vehicleID"] as? String,
              let viewer = values["viewerID"] as? String,
              let number = values["revision"] as? NSNumber,
              CFGetTypeID(number) != CFBooleanGetTypeID(),
              number.doubleValue.isFinite, number.doubleValue >= 0,
              number.doubleValue < 9_007_199_254_740_991,
              let revision = Int(exactly: number.doubleValue) else { return nil }
        let context = TripChoiceContext(proposalID: proposal, vehicleID: vehicle, viewerID: viewer, revision: revision)
        return context.isValid ? context : nil
    }
}
public actor TripChoiceResponseHandler {
    private let store: any TripChoiceStore
    public init(store: any TripChoiceStore = UnconfiguredTripChoiceStore()) { self.store = store }
    public func handle(_ response: TripChoiceResponse) async -> TripChoiceHandlingResult {
        switch response {
        case .opened: return .opened
        case .dismissed: return .dismissed
        case .unrelated: return .ignored
        case .malformed: return .rejected
        case .choose(let choice, let context):
            guard context.isValid else { return .rejected }
            do { try Task.checkCancellation(); try await store.chooseIfCurrent(choice, context: context); return .queued }
            catch { return .rejected } // No sensitive error/claims/payload logging.
        }
    }
}
