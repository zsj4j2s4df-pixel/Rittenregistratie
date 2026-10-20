import Foundation

public struct NativePendingProposal: Decodable, Sendable {
    public let id: String
    public let revision: Int
    public init(id: String, revision: Int) { self.id = id; self.revision = revision }
}
public struct NativePendingChoices: Decodable, Sendable {
    public let version: Int
    public let viewerId: String
    public let vehicleId: String
    public let expiresAt: Int64
    public let proposals: [NativePendingProposal]
    public let moreAvailable: Bool
    public init(version: Int = 1, viewerId: String, vehicleId: String, expiresAt: Int64, proposals: [NativePendingProposal], moreAvailable: Bool = false) {
        self.version = version; self.viewerId = viewerId; self.vehicleId = vehicleId
        self.expiresAt = expiresAt; self.proposals = proposals; self.moreAvailable = moreAvailable
    }
}
public protocol PendingTripChoiceSource: Actor {
    func pendingChoices(vehicleID: String, expectedViewerID: String) async throws -> NativePendingChoices
}
public actor UnconfiguredPendingTripChoiceSource: PendingTripChoiceSource {
    public init() {}
    public func pendingChoices(vehicleID: String, expectedViewerID: String) async throws -> NativePendingChoices { throw NativeAPIError.sessionNotConfigured }
}
public enum PendingTripChoiceError: Error { case busy, invalidFeed, noCurrentProposal }

// Explicit foreground recovery only. Refresh never schedules a notification;
// notify accepts an ID from the last verified feed, never raw notification data.
// No background timer, automatic classification or driver inference.
public actor PendingTripChoiceProducer {
    private let vehicleID: String
    private let binding: any ChoiceSessionBinding
    private let source: any PendingTripChoiceSource
    private let workflow: TripChoiceWorkflow
    private let clock: @Sendable () -> Int64
    private var feed: NativePendingChoices?
    private var busy = false
    private var generation = UUID()
    public init(vehicleID: String, workflow: TripChoiceWorkflow,
                binding: any ChoiceSessionBinding = UnconfiguredChoiceSessionBinding(),
                source: any PendingTripChoiceSource = UnconfiguredPendingTripChoiceSource(),
                clock: @escaping @Sendable () -> Int64 = { Int64(Date().timeIntervalSince1970 * 1000) }) {
        self.vehicleID = vehicleID; self.workflow = workflow; self.binding = binding; self.source = source; self.clock = clock
    }
    private func current(_ value: NativePendingChoices, scope: ChoiceSessionScope) -> Bool {
        let now = clock()
        return value.version == 1 && value.vehicleId == vehicleID && scope.vehicleID == vehicleID
            && value.viewerId == scope.viewerID && validNativeIdentifier(value.viewerId)
            && now >= 0 && value.expiresAt > now && value.expiresAt <= 9_007_199_254_740_991
            && value.proposals.count <= 25 && Set(value.proposals.map(\.id)).count == value.proposals.count
            && value.proposals.allSatisfy { proposal in
                proposal.id.range(of: "^[A-Za-z0-9_-]{16,128}$", options: .regularExpression) != nil
                    && TripChoiceContext(proposalID: proposal.id, vehicleID: vehicleID, viewerID: value.viewerId, revision: proposal.revision).isValid
            }
    }
    public func refresh() async throws -> NativePendingChoices {
        guard !busy else { throw PendingTripChoiceError.busy }
        busy = true; feed = nil
        let started = generation
        defer { busy = false }
        try Task.checkCancellation()
        let before = try await binding.verifiedScope(vehicleID: vehicleID)
        let result = try await source.pendingChoices(vehicleID: vehicleID, expectedViewerID: before.viewerID)
        try Task.checkCancellation()
        let after = try await binding.verifiedScope(vehicleID: vehicleID)
        try Task.checkCancellation()
        guard started == generation, before.viewerID == after.viewerID, before.vehicleID == after.vehicleID,
              current(result, scope: after) else { throw PendingTripChoiceError.invalidFeed }
        feed = result
        return result // moreAvailable stays explicit; never claim a complete list.
    }
    public func notify(proposalID: String) async throws {
        guard !busy else { throw PendingTripChoiceError.busy }
        busy = true; defer { busy = false }
        try Task.checkCancellation()
        let started = generation
        guard let value = feed else { throw PendingTripChoiceError.noCurrentProposal }
        let scope = try await binding.verifiedScope(vehicleID: vehicleID)
        guard started == generation, current(value, scope: scope) else { feed = nil; throw PendingTripChoiceError.invalidFeed }
        guard let proposal = value.proposals.first(where: { $0.id == proposalID }) else { throw PendingTripChoiceError.noCurrentProposal }
        let context = TripChoiceContext(proposalID: proposal.id, vehicleID: vehicleID, viewerID: value.viewerId, revision: proposal.revision)
        try await workflow.prepare(context)
        if started != generation {
            await workflow.cancelNotification(context)
            throw PendingTripChoiceError.noCurrentProposal
        }
    }
    public func clear() { generation = UUID(); feed = nil }
}
