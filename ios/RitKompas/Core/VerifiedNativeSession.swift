import Foundation

// A reviewed login/credential store must supply a stable version for exactly
// these headers. Rotate the UUID on every credential change/logout, even if a
// later login restores the same header text. No identity comes from this value.
public struct NativeCredentialCandidate: Sendable, CustomStringConvertible, CustomDebugStringConvertible {
    public let version: UUID
    public let headers: [String: String]
    public init(version: UUID, headers: [String: String]) { self.version = version; self.headers = headers }
    public var description: String { "NativeCredentialCandidate(redacted)" }
    public var debugDescription: String { description }
}
public protocol NativeCredentialSource: Actor {
    func candidate(for origin: APIOrigin) async throws -> NativeCredentialCandidate
    func clear() async throws
}
public actor UnconfiguredNativeCredentials: NativeCredentialSource {
    public init() {}
    public func candidate(for origin: APIOrigin) async throws -> NativeCredentialCandidate { throw NativeAPIError.sessionNotConfigured }
    public func clear() async throws {}
}
public struct NativeVerifiedScope: Decodable, Equatable, Sendable {
    public let version: Int
    public let viewerID: String
    public let vehicleID: String
    public let expiresAt: Int64 // Unix milliseconds, not seconds.
    public init(version: Int = 1, viewerID: String, vehicleID: String, expiresAt: Int64) {
        self.version = version; self.viewerID = viewerID; self.vehicleID = vehicleID; self.expiresAt = expiresAt
    }
    enum CodingKeys: String, CodingKey { case version, expiresAt; case viewerID = "viewerId", vehicleID = "vehicleId" }
}
public protocol NativeScopeVerifier: Actor {
    func verify(origin: APIOrigin, vehicleID: String, candidate: NativeCredentialCandidate) async throws -> NativeVerifiedScope
}
public actor UnconfiguredNativeScopeVerifier: NativeScopeVerifier {
    public init() {}
    public func verify(origin: APIOrigin, vehicleID: String, candidate: NativeCredentialCandidate) async throws -> NativeVerifiedScope { throw NativeAPIError.sessionNotConfigured }
}
func validNativeIdentifier(_ value: String) -> Bool {
    !value.isEmpty && value.utf8.count <= 128 && !value.unicodeScalars.contains { $0.value < 32 || $0.value == 127 || $0 == "/" || $0 == "\\" }
}
func validNativeHeaders(_ headers: [String: String]) -> Bool {
    let allowed: Set<String> = ["authorization", "cookie", "cf-access-jwt-assertion"]
    let names = headers.keys.map { $0.lowercased() }
    return !headers.isEmpty && Set(names).count == headers.count && names.allSatisfy { allowed.contains($0) }
        && headers.values.allSatisfy { !$0.isEmpty && $0.unicodeScalars.allSatisfy { $0.value >= 32 && $0.value < 127 } }
        && headers.reduce(0, { $0 + $1.key.utf8.count + $1.value.utf8.count }) <= 16_384
}

// One actor shared by APIClient and DurableTripChoiceQueue. This adapter verifies
// candidate credentials; it does not implement login, Keychain or app lifecycle.
// Every API grant requires fresh server authorization. Only local queue actions
// may use the last same-credential unexpired proof while offline; this never
// authorizes a network mutation. A different viewer permanently closes the actor.
public actor VerifiedNativeSession: SessionAccess, ChoiceSessionBinding {
    private let origin: APIOrigin
    private let vehicleID: String
    private let credentials: any NativeCredentialSource
    private let verifier: any NativeScopeVerifier
    private let clock: @Sendable () -> Int64
    private var closed = false
    private var pinnedViewerID: String?
    private var queueProof: NativeVerifiedScope?
    private var proofCandidate: NativeCredentialCandidate?
    private func discardProof() { queueProof = nil; proofCandidate = nil }
    private func fresh(_ scope: NativeVerifiedScope) -> Bool {
        let now = clock()
        return scope.version == 1 && validNativeIdentifier(scope.viewerID) && scope.vehicleID == vehicleID
            && now >= 0 && now <= 9_007_199_254_740_991 && scope.expiresAt > now && scope.expiresAt <= 9_007_199_254_740_991
    }
    public init(origin: APIOrigin, vehicleID: String,
                credentials: any NativeCredentialSource = UnconfiguredNativeCredentials(),
                verifier: any NativeScopeVerifier = UnconfiguredNativeScopeVerifier(),
                clock: @escaping @Sendable () -> Int64 = { Int64(Date().timeIntervalSince1970 * 1000) }) {
        self.origin = origin; self.vehicleID = vehicleID; self.credentials = credentials; self.verifier = verifier; self.clock = clock
    }
    private func current() async throws -> (NativeVerifiedScope, NativeCredentialCandidate) {
        try Task.checkCancellation()
        guard !closed else { throw NativeAPIError.signInRequired }
        guard validNativeIdentifier(vehicleID) else { throw NativeAPIError.invalidPath }
        let candidate = try await credentials.candidate(for: origin)
        guard !closed else { throw NativeAPIError.signInRequired }
        guard validNativeHeaders(candidate.headers) else { throw NativeAPIError.invalidSessionGrant }
        try Task.checkCancellation()
        let scope: NativeVerifiedScope
        do { scope = try await verifier.verify(origin: origin, vehicleID: vehicleID, candidate: candidate) }
        catch NativeAPIError.signInRequired { closed = true; discardProof(); throw NativeAPIError.signInRequired }
        catch NativeAPIError.accessDenied { closed = true; discardProof(); throw NativeAPIError.accessDenied }
        try Task.checkCancellation()
        let latest = try await credentials.candidate(for: origin)
        guard !closed else { throw NativeAPIError.signInRequired }
        guard candidate.version == latest.version, candidate.headers == latest.headers else {
            discardProof(); throw ChoiceQueueError.sessionChanged
        }
        guard fresh(scope) else { discardProof(); throw NativeAPIError.invalidSessionGrant }
        if let viewer = pinnedViewerID, viewer != scope.viewerID {
            closed = true; pinnedViewerID = nil; discardProof()
            throw ChoiceQueueError.sessionChanged
        }
        try Task.checkCancellation()
        pinnedViewerID = scope.viewerID
        queueProof = scope; proofCandidate = candidate
        return (scope, candidate)
    }
    public func grant(for requestedOrigin: APIOrigin) async throws -> SessionGrant {
        guard requestedOrigin == origin else { throw NativeAPIError.invalidOrigin }
        let (scope, candidate) = try await current()
        return SessionGrant(expectedViewerID: scope.viewerID, headers: candidate.headers)
    }
    public func verifiedScope(vehicleID requestedVehicle: String) async throws -> ChoiceSessionScope {
        guard requestedVehicle == vehicleID else { throw NativeAPIError.accessDenied }
        try Task.checkCancellation()
        guard !closed else { throw NativeAPIError.signInRequired }
        let candidate = try await credentials.candidate(for: origin)
        try Task.checkCancellation()
        guard !closed else { throw NativeAPIError.signInRequired }
        if let proof = queueProof, let old = proofCandidate, fresh(proof),
           proof.viewerID == pinnedViewerID, candidate.version == old.version, candidate.headers == old.headers {
            return ChoiceSessionScope(viewerID: proof.viewerID, vehicleID: proof.vehicleID)
        }
        discardProof()
        let (scope, _) = try await current()
        return ChoiceSessionScope(viewerID: scope.viewerID, vehicleID: scope.vehicleID)
    }
    // Local closure is immediate even if secure-store deletion fails. Caller
    // must also close APIClient to cancel in-flight transport. A new login uses
    // a new actor; this one cannot be reopened by a late verification response.
    public func signOut() async throws {
        closed = true; pinnedViewerID = nil; discardProof()
        try await credentials.clear()
    }
}
