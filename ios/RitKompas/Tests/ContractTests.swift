import Foundation
import XCTest
@testable import RitKompasCore

// Source-only tests for a future Mac-created RitKompasCore test target.
// Not compiled or executed in this Cloud environment: Swift is unavailable.
final class ContractTests: XCTestCase {
    func testOriginAndPathDoNotAllowCredentialEgress() throws {
        for invalid in ["http://api.example.invalid", "https://api.example.invalid/", "https://api.example.invalid/api",
                        "https://user:pass@api.example.invalid", "https://api.example.invalid?host=evil", "https://api.example.invalid#x"] {
            XCTAssertThrowsError(try APIOrigin(invalid))
        }
        let origin = try APIOrigin("https://api.example.invalid")
        let url = try origin.url(segments: ["api", "vehicles", "v?x=1", "devices"])
        XCTAssertTrue(origin.contains(url))
        XCTAssertTrue(url.absoluteString.contains("v%3Fx%3D1"))
        XCTAssertThrowsError(try origin.url(segments: ["api", "../other"]))
        XCTAssertFalse(origin.contains(URL(string: "https://evil.example.invalid/api")!))
    }
    func testDeviceWireContractKeepsUnixSecondsAndExplicitZero() throws {
        let json = #"{"device":{"id":"synthetic-instance-1","user_id":"u","vehicle_id":"v","name":"Synthetic","platform":"ios","active":0,"revision":1,"created_at":1792350037,"updated_at":1792350038}}"#
        let result = try JSONDecoder().decode(DeviceEnvelope.self, from: Data(json.utf8))
        XCTAssertFalse(result.device.isActive)
        XCTAssertEqual(result.device.createdAt, 1_792_350_037)
        XCTAssertEqual(result.device.userID, "u")
        let input = DeviceRegistration(requestId: "synthetic-request-1", id: "synthetic-instance-1", name: "Synthetic")
        let encoded = try JSONSerialization.jsonObject(with: JSONEncoder().encode(input)) as? [String: Any]
        XCTAssertEqual(encoded?["requestId"] as? String, "synthetic-request-1")
        XCTAssertNil(encoded?["userId"])
    }
    func testDetectionInputDoesNotInventIdentityOrLocation() throws {
        let input = DetectionInput(requestId: "synthetic-request-1", eventId: "synthetic-event-1",
                                   observedAt: 1_792_350_037, source: .manual, kind: .startCandidate)
        let encoded = try JSONSerialization.jsonObject(with: JSONEncoder().encode(input)) as? [String: Any]
        XCTAssertEqual(encoded?["kind"] as? String, "start_candidate")
        XCTAssertNil(encoded?["userId"])
        XCTAssertNil(encoded?["location"])
        XCTAssertEqual(encoded?["observedAt"] as? Int64, 1_792_350_037)
    }
    func testDefaultAccessIsUnavailable() async throws {
        do {
            _ = try await UnconfiguredSessionAccess().grant(for: APIOrigin("https://api.example.invalid"))
            XCTFail("The unconfigured provider must never grant a session")
        } catch let error as NativeAPIError {
            guard case .sessionNotConfigured = error else { return XCTFail("Unexpected typed failure") }
        }
    }
}
