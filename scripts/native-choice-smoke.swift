import Foundation

private enum SmokeError: Error { case assertion(String), lostResponse, diskUnavailable, missingKey }
private func expect(_ value: Bool, _ label: String) throws {
    guard value else { throw SmokeError.assertion(label) }
}
private actor MemoryDisk: ChoiceQueuePersistence {
    var bytes: Data?
    var fail = false
    func failNextSave() { fail = true }
    func load() async throws -> Data? { bytes }
    func save(_ plaintext: Data) async throws {
        if fail { fail = false; throw SmokeError.diskUnavailable }
        bytes = plaintext
    }
}
private actor Binding: ChoiceSessionBinding {
    var viewer = "synthetic-viewer"
    func set(_ viewer: String) { self.viewer = viewer }
    func verifiedScope(vehicleID: String) async throws -> ChoiceSessionScope {
        ChoiceSessionScope(viewerID: viewer, vehicleID: vehicleID)
    }
}
private actor Transport: TripChoiceTransport {
    enum Mode { case lost, valid, invalidReceipt, switchAccount }
    var mode: Mode = .lost
    var sent: [QueuedTripChoice] = []
    let binding: Binding
    init(binding: Binding) { self.binding = binding }
    func set(_ mode: Mode) { self.mode = mode }
    func requests() -> [QueuedTripChoice] { sent }
    func sendChoice(_ action: QueuedTripChoice) async throws -> TripChoiceServerReceipt {
        sent.append(action)
        if mode == .lost { throw SmokeError.lostResponse }
        if mode == .switchAccount { await binding.set("other-viewer") }
        return TripChoiceServerReceipt(journeyId: action.context.proposalID, viewerId: action.context.viewerID,
            requestId: mode == .invalidReceipt ? UUID().uuidString : action.requestID,
            revision: action.context.revision + 1, classification: action.choice)
    }
}
#if canImport(CryptoKit) && canImport(Security)
private actor SyntheticKey: ChoiceQueueKeyProvider {
    let value: UInt8
    var missing = false
    init(_ value: UInt8) { self.value = value }
    func remove() { missing = true }
    func keyBytes(createIfMissing: Bool) async throws -> Data {
        if missing { throw SmokeError.missingKey }
        return Data(repeating: value, count: 32)
    }
}
#endif

@main
private struct NativeChoiceSmoke {
    static func main() async throws {
        let disk = MemoryDisk(), binding = Binding()
        let queue = DurableTripChoiceQueue(persistence: disk, binding: binding)
        let transport = Transport(binding: binding)
        let delivery = TripChoiceDelivery(queue: queue, transport: transport)
        let context = TripChoiceContext(proposalID: "synthetic-proposal", vehicleID: "synthetic-vehicle", viewerID: "synthetic-viewer", revision: 0)
        try await queue.registerPending(context)
        try await queue.chooseIfCurrent(.business, context: context)
        try await queue.chooseIfCurrent(.business, context: context)
        let original = try await queue.ready(viewerID: context.viewerID, vehicleID: context.vehicleID)
        try expect(original.count == 1, "one durable action")
        let action = original[0]
        let reopened = DurableTripChoiceQueue(persistence: disk, binding: binding)
        let restored = try await reopened.ready(viewerID: context.viewerID, vehicleID: context.vehicleID)
        try expect(restored == original, "exact action restored")
        print("PASS reopen and duplicate local action")

        do { try await delivery.send(action); throw SmokeError.assertion("lost response accepted") }
        catch SmokeError.lostResponse { }
        let retained = try await queue.ready(viewerID: context.viewerID, vehicleID: context.vehicleID)
        try expect(retained == original, "retain after lost response")
        print("PASS lost response retains exact request")

        await transport.set(.invalidReceipt)
        do { try await delivery.send(action); throw SmokeError.assertion("wrong receipt accepted") }
        catch ChoiceQueueError.invalidReceipt { }
        try expect(try await queue.ready(viewerID: context.viewerID, vehicleID: context.vehicleID) == original, "wrong receipt retained")
        print("PASS mismatched receipt cannot acknowledge")

        await binding.set("other-viewer")
        let count = await transport.requests().count
        do { try await delivery.send(action); throw SmokeError.assertion("other account sent") }
        catch ChoiceQueueError.sessionChanged { }
        try expect(await transport.requests().count == count, "no transport on account switch")
        await binding.set(context.viewerID)
        print("PASS account switch blocks before network")

        await transport.set(.switchAccount)
        do { try await delivery.send(action); throw SmokeError.assertion("changed session acknowledged") }
        catch ChoiceQueueError.sessionChanged { }
        await binding.set(context.viewerID)
        try expect(try await queue.ready(viewerID: context.viewerID, vehicleID: context.vehicleID) == original, "retain after response account switch")
        print("PASS account switch during response retains action")

        await transport.set(.valid)
        await disk.failNextSave()
        do { try await delivery.send(action); throw SmokeError.assertion("disk failure accepted") }
        catch SmokeError.diskUnavailable { }
        try expect(try await queue.ready(viewerID: context.viewerID, vehicleID: context.vehicleID) == original, "disk failure retained")
        print("PASS acknowledgement storage failure retains action")

        let beforeCancellation = await transport.requests().count
        let cancelled = Task {
            withUnsafeCurrentTask { $0?.cancel() }
            try await delivery.send(action)
        }
        do { try await cancelled.value; throw SmokeError.assertion("cancelled delivery sent") }
        catch is CancellationError { }
        try expect(await transport.requests().count == beforeCancellation, "cancelled before transport")
        print("PASS cancelled delivery makes no request")

        try await delivery.send(action)
        try expect(try await queue.ready(viewerID: context.viewerID, vehicleID: context.vehicleID).isEmpty, "acknowledged action removed")
        let sent = await transport.requests()
        try expect(sent.allSatisfy { $0 == action }, "all retries preserve exact action")
        do { try await delivery.send(action); throw SmokeError.assertion("removed action sent") }
        catch TripChoiceDeliveryError.actionNotPending { }
        print("PASS exact retry acknowledgement and no resend after removal")

        #if canImport(CryptoKit) && canImport(Security)
        let root = FileManager.default.temporaryDirectory.resolvingSymlinksInPath().appendingPathComponent("ritkompas-smoke-" + UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: root) }
        let key = SyntheticKey(7)
        let storage = EncryptedChoiceQueuePersistence(directory: root, keyProvider: key)
        let plain = Data("synthetic classification fixture".utf8)
        try await storage.save(plain)
        try expect(try await storage.load() == plain, "real CryptoKit roundtrip")
        let file = root.appendingPathComponent("choices-v1.enc")
        let cipher = try Data(contentsOf: file)
        try expect(cipher.range(of: plain) == nil, "no plaintext on disk")
        let wrong = EncryptedChoiceQueuePersistence(directory: root, keyProvider: SyntheticKey(9))
        var rejected = false
        do { _ = try await wrong.load() } catch { rejected = true }
        try expect(rejected, "wrong key rejected")
        await key.remove()
        do { _ = try await storage.load(); throw SmokeError.assertion("missing key reset") }
        catch SmokeError.missingKey { }
        try expect(try Data(contentsOf: file) == cipher, "missing key retains ciphertext")
        var damaged = cipher; damaged[damaged.count - 1] ^= 1
        try damaged.write(to: file, options: .atomic)
        let tampered = EncryptedChoiceQueuePersistence(directory: root, keyProvider: SyntheticKey(7))
        rejected = false
        do { _ = try await tampered.load() } catch { rejected = true }
        try expect(rejected, "tampering rejected")
        print("PASS real CryptoKit roundtrip, wrong/missing key, ciphertext retention and tamper rejection")
        #else
        throw SmokeError.assertion("CryptoKit/Security missing; do not claim crypto tested")
        #endif
        print("PASS 9 native smoke groups; not XCTest/iOS/Keychain/hardware or a live authenticated app")
    }
}
