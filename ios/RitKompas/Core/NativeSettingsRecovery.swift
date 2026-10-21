import Foundation

public actor NativeSettingsRecovery {
    private struct Record: Codable {
        let version: Int
        let viewerID: String
        let vehicleID: String
        let edit: NativeSettingsEdit?
    }
    private let persistence: any ChoiceQueuePersistence
    private let viewerID: String
    private let vehicleID: String
    private var closed = false
    private var working = false
    private var closing: [CheckedContinuation<Void, Never>] = []
    public init(persistence: any ChoiceQueuePersistence, viewerID: String, vehicleID: String) {
        self.persistence = persistence; self.viewerID = viewerID; self.vehicleID = vehicleID
    }
    private func begin() throws {
        guard !closed else { throw NativeAPIError.signInRequired }
        guard !working else { throw ChoiceQueueError.conflictingChoice }
        working = true
    }
    private func finish() {
        working = false
        let waiting = closing; closing = []
        for waiter in waiting { waiter.resume() }
    }
    // Logout waits for an in-flight disk operation before another account may
    // reopen this scope. Late callers can never overwrite its exact request.
    public func close() async {
        closed = true
        if working { await withCheckedContinuation { closing.append($0) } }
    }
    public func load() async throws -> NativeSettingsEdit? {
        try begin(); defer { finish() }
        return try await read()
    }
    private func read() async throws -> NativeSettingsEdit? {
        guard let data = try await persistence.load() else { return nil }
        guard data.count <= 65_536 else { throw ChoiceQueueError.invalidStorage }
        let record = try JSONDecoder().decode(Record.self, from: data)
        guard record.version == 1, record.viewerID == viewerID, record.vehicleID == vehicleID,
              record.edit == nil || record.edit!.isValid else { throw ChoiceQueueError.sessionChanged }
        return record.edit
    }
    public func save(_ edit: NativeSettingsEdit) async throws {
        try begin(); defer { finish() }
        guard validNativeIdentifier(viewerID), validNativeIdentifier(vehicleID), edit.isValid else { throw NativeAPIError.invalidPath }
        if let old = try await read() {
            // A different change cannot replace a request whose result is unknown.
            guard old == edit else { throw ChoiceQueueError.conflictingChoice }
            return
        }
        try await write(edit)
    }
    public func acknowledge(_ edit: NativeSettingsEdit) async throws {
        try begin(); defer { finish() }
        guard let old = try await read(), old == edit else { throw ChoiceQueueError.invalidReceipt }
        try await write(nil)
    }
    private func write(_ edit: NativeSettingsEdit?) async throws {
        let data = try JSONEncoder().encode(Record(version: 1, viewerID: viewerID, vehicleID: vehicleID, edit: edit))
        guard data.count <= 65_536 else { throw ChoiceQueueError.storageFull }
        try await persistence.save(data)
    }
}
