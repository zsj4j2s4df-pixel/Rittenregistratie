import Foundation
import XCTest
@testable import RitKompasCore

private actor MemoryChoicePersistence: ChoiceQueuePersistence {
    var data: Data?
    func load() async throws -> Data? { data }
    func save(_ plaintext: Data) async throws { data = plaintext }
}
private actor SyntheticChoiceBinding: ChoiceSessionBinding {
    private var viewer = "synthetic-viewer"
    func setViewer(_ value: String) { viewer = value }
    func verifiedScope(vehicleID: String) async throws -> ChoiceSessionScope { ChoiceSessionScope(viewerID: viewer, vehicleID: vehicleID) }
}
// Prepared for Mac/Xcode; NOT executed in Cloud without Swift/XCTest.
final class ChoiceQueueTests: XCTestCase {
    func testReloadRetainsExactActionAndRefusesAccountSwitch() async throws {
        let disk = MemoryChoicePersistence(), binding = SyntheticChoiceBinding()
        let queue = DurableTripChoiceQueue(persistence: disk, binding: binding)
        let context = TripChoiceContext(proposalID: "synthetic-proposal", vehicleID: "synthetic-vehicle", viewerID: "synthetic-viewer", revision: 0)
        try await queue.registerPending(context)
        try await queue.chooseIfCurrent(.business, context: context)
        try await queue.chooseIfCurrent(.business, context: context)
        let first = try await queue.ready(viewerID: context.viewerID, vehicleID: context.vehicleID)
        let reopened = DurableTripChoiceQueue(persistence: disk, binding: binding)
        let again = try await reopened.ready(viewerID: context.viewerID, vehicleID: context.vehicleID)
        XCTAssertEqual(first, again); XCTAssertEqual(first.count, 1)
        await binding.setViewer("other-viewer")
        do { _ = try await reopened.ready(viewerID: context.viewerID, vehicleID: context.vehicleID); XCTFail("account switch must be denied") }
        catch ChoiceQueueError.sessionChanged { }
    }
    func testStaleContextOrContradictoryActionCannotReplacePendingChoice() async throws {
        let queue = DurableTripChoiceQueue(persistence: MemoryChoicePersistence(), binding: SyntheticChoiceBinding())
        let context = TripChoiceContext(proposalID: "synthetic-proposal", vehicleID: "synthetic-vehicle", viewerID: "synthetic-viewer", revision: 0)
        do { try await queue.chooseIfCurrent(.private, context: context); XCTFail("unregistered context") }
        catch ChoiceQueueError.staleProposal { }
        try await queue.registerPending(context); try await queue.chooseIfCurrent(.private, context: context)
        do { try await queue.chooseIfCurrent(.business, context: context); XCTFail("must preserve prior choice") }
        catch ChoiceQueueError.conflictingChoice { }
    }
}

#if canImport(CryptoKit) && canImport(Security)
private actor SyntheticQueueKey: ChoiceQueueKeyProvider {
    private let bytes: Data
    init(_ byte: UInt8) { bytes = Data(repeating: byte, count: 32) }
    func keyBytes(createIfMissing: Bool) async throws -> Data { bytes }
}
extension ChoiceQueueTests {
    func testEncryptedDiskReloadAndTamperingFailClosed() async throws {
        let root = FileManager.default.temporaryDirectory.resolvingSymlinksInPath().appendingPathComponent(UUID().uuidString)
        defer { try? FileManager.default.removeItem(at: root) }
        let storage = EncryptedChoiceQueuePersistence(directory: root, keyProvider: SyntheticQueueKey(7))
        let plain = Data("synthetic private classification fixture".utf8)
        try await storage.save(plain)
        let loaded = try await storage.load(); XCTAssertEqual(loaded, plain)
        let file = root.appendingPathComponent("choices-v1.enc")
        var cipher = try Data(contentsOf: file)
        XCTAssertNil(cipher.range(of: plain))
        cipher[cipher.count - 1] ^= 1; try cipher.write(to: file, options: .atomic)
        do { _ = try await storage.load(); XCTFail("tampering must not reset or decode") } catch { }
    }
}
#endif
