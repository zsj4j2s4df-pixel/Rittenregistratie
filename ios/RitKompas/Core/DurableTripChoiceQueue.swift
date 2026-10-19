import Foundation

public enum ChoiceQueueError: Error { case busy, invalidContext, sessionChanged, staleProposal, conflictingChoice, storageFull, invalidStorage, invalidReceipt }
public struct ChoiceSessionScope: Sendable {
    public let viewerID: String
    public let vehicleID: String
    public init(viewerID: String, vehicleID: String) { self.viewerID = viewerID; self.vehicleID = vehicleID }
}
// Must come from the same verified provider/snapshot as APIClient's SessionAccess.
// No default provider and no identity inferred from notification payloads.
public protocol ChoiceSessionBinding: Actor {
    func verifiedScope(vehicleID: String) async throws -> ChoiceSessionScope
}
public actor UnconfiguredChoiceSessionBinding: ChoiceSessionBinding {
    public init() {}
    public func verifiedScope(vehicleID: String) async throws -> ChoiceSessionScope { throw NativeAPIError.sessionNotConfigured }
}
public protocol ChoiceQueuePersistence: Actor {
    func load() async throws -> Data?
    func save(_ plaintext: Data) async throws
}
public struct QueuedTripChoice: Codable, Equatable, Sendable {
    public let requestID: String
    public let context: TripChoiceContext
    public let choice: TripChoice
    public let createdAt: Int64
}
public struct TripChoiceServerReceipt: Codable, Sendable {
    public let journeyId: String
    public let viewerId: String
    public let requestId: String
    public let revision: Int
    public let classification: TripChoice
}
private struct ChoiceQueueState: Codable {
    var version = 1
    var pending: [TripChoiceContext] = []
    var actions: [QueuedTripChoice] = []
}
// One queue/persistence owner per app process; no extension/multi-process sharing.
// Reentrancy is refused rather than allowing overlapping read-modify-writes.
public actor DurableTripChoiceQueue: TripChoiceStore {
    private let persistence: any ChoiceQueuePersistence
    private let binding: any ChoiceSessionBinding
    private var busy = false
    public init(persistence: any ChoiceQueuePersistence, binding: any ChoiceSessionBinding = UnconfiguredChoiceSessionBinding()) {
        self.persistence = persistence; self.binding = binding
    }
    private func enter() throws { guard !busy else { throw ChoiceQueueError.busy }; busy = true }
    private func key(_ c: TripChoiceContext) -> String { [c.viewerID,c.vehicleID,c.proposalID].joined(separator: "\u{0}") }
    private func verify(_ context: TripChoiceContext) async throws {
        guard context.isValid else { throw ChoiceQueueError.invalidContext }
        let scope = try await binding.verifiedScope(vehicleID: context.vehicleID)
        guard scope.viewerID == context.viewerID, scope.vehicleID == context.vehicleID else { throw ChoiceQueueError.sessionChanged }
    }
    private func load() async throws -> ChoiceQueueState {
        guard let bytes = try await persistence.load() else { return ChoiceQueueState() }
        guard bytes.count <= 65_536 else { throw ChoiceQueueError.invalidStorage }
        let s = try JSONDecoder().decode(ChoiceQueueState.self, from: bytes)
        guard s.version == 1, s.pending.count <= 128, s.actions.count <= 128,
              s.pending.allSatisfy({ $0.isValid }), Set(s.pending.map { key($0) }).count == s.pending.count,
              Set(s.actions.map { $0.requestID }).count == s.actions.count,
              Set(s.actions.map { key($0.context) }).count == s.actions.count,
              s.actions.allSatisfy({ UUID(uuidString: $0.requestID) != nil && $0.createdAt >= 0 && s.pending.contains($0.context) }) else { throw ChoiceQueueError.invalidStorage }
        return s
    }
    private func save(_ state: ChoiceQueueState) async throws {
        guard state.pending.count <= 128, state.actions.count <= 128 else { throw ChoiceQueueError.storageFull }
        let data = try JSONEncoder().encode(state)
        guard data.count <= 65_536 else { throw ChoiceQueueError.storageFull }
        try await persistence.save(data)
    }
    // Host registers only a real server-scoped pending proposal BEFORE scheduling.
    // Never use unverified userInfo to create a pending proposal.
    public func registerPending(_ context: TripChoiceContext) async throws {
        try enter(); defer { busy = false }; try await verify(context)
        var state = try await load()
        if let old = state.pending.first(where: { key($0) == key(context) }) {
            if old == context { return }
            guard old.revision < context.revision, !state.actions.contains(where: { key($0.context) == key(context) }) else { throw ChoiceQueueError.staleProposal }
            state.pending.removeAll { key($0) == key(context) }
        }
        state.pending.append(context); try await verify(context); try await save(state)
    }
    public func chooseIfCurrent(_ choice: TripChoice, context: TripChoiceContext) async throws {
        try enter(); defer { busy = false }; try await verify(context)
        var state = try await load()
        guard state.pending.contains(context) else { throw ChoiceQueueError.staleProposal }
        if let old = state.actions.first(where: { key($0.context) == key(context) }) {
            guard old.context == context, old.choice == choice else { throw ChoiceQueueError.conflictingChoice }
            return
        }
        state.actions.append(QueuedTripChoice(requestID: UUID().uuidString, context: context, choice: choice, createdAt: Int64(Date().timeIntervalSince1970)))
        try await verify(context); try await save(state)
    }
    // No automatic network sending. Caller explicitly retries these exact objects.
    public func ready(viewerID: String, vehicleID: String) async throws -> [QueuedTripChoice] {
        try enter(); defer { busy = false }
        let context = TripChoiceContext(proposalID: "scope-check", vehicleID: vehicleID, viewerID: viewerID, revision: 0)
        try await verify(context); let state = try await load(); try await verify(context)
        return state.actions.filter { $0.context.viewerID == viewerID && $0.context.vehicleID == vehicleID }
    }
    public func acknowledge(_ receipt: TripChoiceServerReceipt, action: QueuedTripChoice) async throws {
        try enter(); defer { busy = false }; try await verify(action.context)
        guard receipt.journeyId == action.context.proposalID, receipt.viewerId == action.context.viewerID,
              receipt.requestId == action.requestID, receipt.revision == action.context.revision + 1,
              receipt.classification == action.choice else { throw ChoiceQueueError.invalidReceipt }
        var state = try await load()
        guard state.actions.contains(action) else { throw ChoiceQueueError.staleProposal }
        state.actions.removeAll { $0 == action }; state.pending.removeAll { $0 == action.context }
        try await verify(action.context); try await save(state)
    }
}
