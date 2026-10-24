import Foundation

public struct NativeAuthStatus: Codable, Sendable {
    public let provider: String
    public let authenticated: Bool
    public let viewerId: String?
    public let expiresAt: Int64?
    public init(provider: String = "supabase", authenticated: Bool, viewerId: String? = nil, expiresAt: Int64? = nil) {
        self.provider = provider; self.authenticated = authenticated; self.viewerId = viewerId; self.expiresAt = expiresAt
    }
}
public struct NativeAuthRotation: Sendable {
    public let cookies: NativeSupabaseCookies
    public let status: NativeAuthStatus
    public init(cookies: NativeSupabaseCookies, status: NativeAuthStatus) { self.cookies = cookies; self.status = status }
}
public protocol NativeSupabaseTransport: Actor {
    func inspect(origin: APIOrigin, cookies: NativeSupabaseCookies) async throws -> NativeAuthStatus
    func refresh(origin: APIOrigin, cookies: NativeSupabaseCookies) async throws -> NativeAuthRotation
    func logout(origin: APIOrigin, cookies: NativeSupabaseCookies) async throws
}
public protocol NativeSupabasePersistence: Actor {
    func load() async throws -> NativeSupabaseCookies?
    func save(_ cookies: NativeSupabaseCookies) async throws
    func remove() async throws
}

/// Owns only candidate headers. VerifiedNativeSession remains the sole rights/vehicle binding.
public actor NativeSupabaseSession: NativeCredentialSource {
    private let origin: APIOrigin
    private let transport: any NativeSupabaseTransport
    private let persistence: any NativeSupabasePersistence
    private let clock: @Sendable () -> Date
    private var cookies: NativeSupabaseCookies?
    private var expiry: Int64?
    private var viewer: String?
    private var version = UUID()
    private var closed = false
    private var persistent = false
    private var operation: (UUID, Task<NativeAuthRotation, Error>)?
    private var completed: (operation: UUID, before: UUID, after: UUID)?
    public init(origin: APIOrigin, transport: any NativeSupabaseTransport, persistence: any NativeSupabasePersistence,
                clock: @escaping @Sendable () -> Date = { Date() }) {
        self.origin = origin; self.transport = transport; self.persistence = persistence; self.clock = clock
    }
    public func stage(_ value: NativeSupabaseCookies) async throws {
        guard !closed else { throw NativeAPIError.signInRequired }
        _ = try value.headers(for: origin, now: clock(), refreshing: true)
        version = UUID(); let stamp = version
        operation?.1.cancel(); operation = nil; completed = nil; cookies = nil; viewer = nil; expiry = nil; persistent = false
        // A remember-off login must never leave an older remember-on account on disk.
        try await persistence.remove()
        guard !closed, version == stamp else { throw ChoiceQueueError.sessionChanged }
        cookies = value
    }
    private func accept(_ result: NativeAuthRotation) throws {
        let now = clock().timeIntervalSince1970 * 1000
        guard result.status.provider == "supabase", result.status.authenticated,
              let id = result.status.viewerId, validNativeIdentifier(id), let exp = result.status.expiresAt,
              now.isFinite, now >= 0, Double(exp) > now, exp <= 9_007_199_254_740_991 else { throw NativeAPIError.signInRequired }
        if let viewer, viewer != id {
            closed = true; version = UUID(); cookies = nil; expiry = nil
            throw ChoiceQueueError.sessionChanged
        }
        _ = try result.cookies.headers(for: origin, now: clock(), refreshing: true)
        viewer = id; expiry = exp; cookies = result.cookies
    }
    public func candidate(for requested: APIOrigin) async throws -> NativeCredentialCandidate {
        try Task.checkCancellation()
        guard !closed, requested == origin else { throw NativeAPIError.signInRequired }
        let start = version
        if cookies == nil {
            let restored = try await persistence.load()
            guard !closed, version == start, let restored,
                  try restored.mayPersist(for: origin, now: clock()) else { throw NativeAPIError.signInRequired }
            cookies = restored; persistent = true
        }
        guard let current = cookies else { throw NativeAPIError.signInRequired }
        _ = try current.headers(for: origin, now: clock())
        if let expiry, Double(expiry) > clock().timeIntervalSince1970 * 1000 + 30_000 {
            return NativeCredentialCandidate(version: version, headers: try current.headers(for: origin, now: clock()), expectedViewerID: viewer)
        }
        let item: (UUID, Task<NativeAuthRotation, Error>)
        if let operation { item = operation }
        else {
            let shouldPersist = persistent, pinned = viewer
            let task = Task { [transport, origin, persistence, clock] in
                // Server expiry/viewer is authenticated online, never decoded from JWT locally.
                let status = try await transport.inspect(origin: origin, cookies: current)
                let result: NativeAuthRotation
                if status.provider == "supabase", status.authenticated, let exp = status.expiresAt,
                   Double(exp) > clock().timeIntervalSince1970 * 1000 + 30_000 {
                    result = NativeAuthRotation(cookies: current, status: status)
                } else {
                    result = try await transport.refresh(origin: origin, cookies: current)
                }
                try Task.checkCancellation()
                guard result.status.provider == "supabase", result.status.authenticated,
                      let id = result.status.viewerId, validNativeIdentifier(id),
                      let exp = result.status.expiresAt, Double(exp) > clock().timeIntervalSince1970 * 1000,
                      exp <= 9_007_199_254_740_991 else { throw NativeAPIError.signInRequired }
                if let pinned, pinned != id { throw ChoiceQueueError.sessionChanged }
                _ = try result.cookies.headers(for: origin, now: clock(), refreshing: true)
                if shouldPersist {
                    guard try result.cookies.mayPersist(for: origin, now: clock()) else { throw NativeAPIError.signInRequired }
                    try Task.checkCancellation()
                    try await persistence.save(result.cookies)
                    try Task.checkCancellation()
                }
                return result
            }
            item = (UUID(), task); operation = item
        }
        do {
            let result = try await item.1.value
            try Task.checkCancellation()
            guard !closed else { throw NativeAPIError.signInRequired }
            // A concurrent waiter may already have committed this exact rotation.
            if operation?.0 != item.0 {
                guard let cookies, let expiry, Double(expiry) > clock().timeIntervalSince1970 * 1000 else { throw ChoiceQueueError.sessionChanged }
                guard let completed, completed.operation == item.0, completed.before == start,
                      completed.after == version else { throw ChoiceQueueError.sessionChanged }
                return NativeCredentialCandidate(version: version, headers: try cookies.headers(for: origin, now: clock()), expectedViewerID: viewer)
            }
            guard version == start else { throw ChoiceQueueError.sessionChanged }
            try accept(result)
            version = UUID(); completed = (item.0, start, version); operation = nil
            return NativeCredentialCandidate(version: version, headers: try result.cookies.headers(for: origin, now: clock()), expectedViewerID: viewer)
        } catch {
            let isCurrent = operation?.0 == item.0 && version == start
            if operation?.0 == item.0 { operation = nil; expiry = nil }
            if isCurrent, case ChoiceQueueError.sessionChanged = error { closed = true; cookies = nil; version = UUID() }
            throw error
        }
    }
    public func persistVerifiedCandidate() async throws {
        guard !closed, let cookies, viewer != nil else { throw NativeAPIError.signInRequired }
        guard try cookies.mayPersist(for: origin, now: clock()) else { return }
        let stamp = version
        try await persistence.save(cookies)
        guard !closed, version == stamp else { throw ChoiceQueueError.sessionChanged }
        persistent = true
    }
    public func clear() async throws {
        closed = true; version = UUID(); operation?.1.cancel(); operation = nil; completed = nil
        cookies = nil; viewer = nil; expiry = nil; persistent = false
        try await persistence.remove()
    }
    public func logout() async throws {
        let old = cookies
        // Close locally before every await. Provider failure must not reopen local state.
        var deletionError: (any Error)?
        do { try await clear() } catch { deletionError = error }
        if let old { try await transport.logout(origin: origin, cookies: old) }
        if let deletionError { throw deletionError }
    }
}
