import Foundation
import XCTest
@testable import RitKompasCore
final class NativeSettingsContractTests: XCTestCase {
    func testLegacyAddressRemainsBusinessAndEncodingDoesNotAddPrivateOrRole() throws {
        let json = #"{"id":"legacy","label":"Synthetic","address":"Synthetic address","enabled":true,"note":""}"#
        let value = try JSONDecoder().decode(NativeStoredAddress.self, from: Data(json.utf8))
        XCTAssertEqual(value.effectiveKind, .business)
        let wire = try XCTUnwrap(JSONSerialization.jsonObject(with: JSONEncoder().encode(value)) as? [String: Any])
        XCTAssertNil(wire["kind"]); XCTAssertNil(wire["businessRole"])
    }
    func testPrivateAndBusinessRoleUseActualServerContractWithoutImplicitClassification() throws {
        let value = NativeStoredAddress(id: "private-1", label: "Synthetic", address: "Synthetic location", kind: .private)
        XCTAssertTrue(value.isValid)
        let wire = try XCTUnwrap(JSONSerialization.jsonObject(with: JSONEncoder().encode(value)) as? [String: Any])
        XCTAssertEqual(wire["kind"] as? String, "private"); XCTAssertNil(wire["classification"])
        XCTAssertFalse(NativeStoredAddress(id: "private-1", label: "Synthetic", address: "Synthetic", kind: .private, businessRole: .customer).isValid)
        XCTAssertTrue(NativeStoredAddress(id: "business-1", label: "Synthetic", address: "Synthetic", businessRole: .supplier).isValid)
    }
    func testSettingsWireCarriesRequestIdentityAndZeroRate() throws {
        let settings = NativeVehicleSettings(revision: 7, plate: "", addresses: [], rates: [.init(id: "rate", microsPerKm: 0, validFrom: "2026-01-01")])
        let edit = NativeSettingsEdit(settings: settings, reason: "Synthetic recovery")
        XCTAssertTrue(edit.isValid)
        let encoder = JSONEncoder(); encoder.outputFormatting = [.sortedKeys]
        let wire = try XCTUnwrap(JSONSerialization.jsonObject(with: encoder.encode(edit)) as? [String: Any])
        XCTAssertEqual(wire["requestId"] as? String, edit.requestId)
        XCTAssertEqual((wire["rates"] as? [[String: Any]])?.first?["microsPerKm"] as? Int, 0)
    }
    func testDuplicateIdsAndCombinedCapacityAreRejectedBeforeSending() {
        let a = NativeStoredAddress(id: "address", label: "Synthetic", address: "Synthetic")
        XCTAssertFalse(NativeSettingsEdit(settings: .init(revision: 0, plate: "", addresses: [a,a], rates: []), reason: "Synthetic").isValid)
        let addresses = (0..<40).map { NativeStoredAddress(id: "address-\($0)", label: "Synthetic", address: "Synthetic") }
        XCTAssertFalse(NativeSettingsEdit(settings: .init(revision: 0, plate: "", addresses: addresses, rates: [.init(id: "rate", microsPerKm: 0, validFrom: "2026-01-01")]), reason: "Synthetic").isValid)
    }
}
