#if os(iOS) || os(macOS)
import Foundation

// HTTPS/system TLS only. No automatic redirects, cookies, credentials, cache,
// background transfers or automatic mutation retries. Supply a reviewed provider
// later; the default SessionAccess fails closed before opening a connection.
final class RefuseRedirects: NSObject, URLSessionTaskDelegate, @unchecked Sendable {
    func urlSession(_ session: URLSession, task: URLSessionTask,
                    willPerformHTTPRedirection response: HTTPURLResponse,
                    newRequest request: URLRequest,
                    completionHandler: @escaping (URLRequest?) -> Void) {
        completionHandler(nil)
    }
}
@available(iOS 15.0, macOS 12.0, *)
public actor APIClient: PendingTripChoiceSource {
    private let origin: APIOrigin
    private let access: any SessionAccess
    private let session: URLSession
    private let redirects: RefuseRedirects
    public init(origin: APIOrigin, access: any SessionAccess = UnconfiguredSessionAccess()) {
        self.origin = origin
        self.access = access
        let redirects = RefuseRedirects()
        self.redirects = redirects
        let configuration = URLSessionConfiguration.ephemeral
        configuration.urlCache = nil
        configuration.urlCredentialStorage = nil
        configuration.httpCookieStorage = nil
        configuration.httpShouldSetCookies = false
        configuration.requestCachePolicy = .reloadIgnoringLocalCacheData
        configuration.timeoutIntervalForRequest = 30
        configuration.timeoutIntervalForResource = 45
        self.session = URLSession(configuration: configuration, delegate: redirects, delegateQueue: nil)
    }
    public func close() { session.invalidateAndCancel() }
    private func send<Response: Decodable & Sendable>(segments: [String], method: String = "GET",
                           query: [URLQueryItem] = [], body: Data? = nil, expectedViewerID: String? = nil) async throws -> Response {
        let url = try origin.url(segments: segments, query: query)
        guard origin.contains(url) else { throw NativeAPIError.invalidOrigin }
        if let body, body.count > 16_384 { throw NativeAPIError.requestTooLarge }
        let grant = try await access.grant(for: origin)
        guard !grant.expectedViewerID.isEmpty, grant.expectedViewerID.count <= 128,
              !grant.expectedViewerID.unicodeScalars.contains(where: { $0.value < 32 || $0.value == 127 }),
              !grant.headers.isEmpty else { throw NativeAPIError.invalidSessionGrant }
        if let expectedViewerID, expectedViewerID != grant.expectedViewerID { throw NativeAPIError.invalidSessionGrant }
        var request = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData)
        request.httpMethod = method
        request.httpBody = body
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        let allowedHeaders: Set<String> = ["authorization", "cookie", "cf-access-jwt-assertion"]
        for (name, value) in grant.headers {
            guard allowedHeaders.contains(name.lowercased()), !value.isEmpty,
                  value.utf8.count <= 16_384, !value.contains("\r"), !value.contains("\n") else {
                throw NativeAPIError.invalidSessionGrant
            }
            request.setValue(value, forHTTPHeaderField: name)
        }
        if let expectedViewerID { request.setValue(expectedViewerID, forHTTPHeaderField: "x-ritkompas-viewer") }
        if body != nil {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.setValue(origin.value, forHTTPHeaderField: "Origin")
            request.setValue("1", forHTTPHeaderField: "x-csrf-protection")
            request.setValue(grant.expectedViewerID, forHTTPHeaderField: "x-ritkompas-viewer")
        }
        do {
            let (bytes, response) = try await session.bytes(for: request)
            defer { bytes.task.cancel() }
            guard let http = response as? HTTPURLResponse, let finalURL = http.url,
                  origin.contains(finalURL) else { throw NativeAPIError.invalidResponse }
            if (300..<400).contains(http.statusCode) { throw NativeAPIError.redirectRefused }
            switch http.statusCode {
            case 200..<300: break
            case 401: throw NativeAPIError.signInRequired
            case 403: throw NativeAPIError.accessDenied
            case 409: throw NativeAPIError.conflict
            case 503: throw NativeAPIError.unavailable
            default: throw NativeAPIError.requestRejected(http.statusCode)
            }
            guard http.value(forHTTPHeaderField: "Content-Type")?.split(separator: ";", maxSplits: 1).first?
                    .trimmingCharacters(in: .whitespaces).lowercased() == "application/json" else {
                throw NativeAPIError.invalidResponse
            }
            let maximum = 4 * 1024 * 1024
            if response.expectedContentLength > Int64(maximum) { throw NativeAPIError.responseTooLarge }
            var data = Data()
            for try await byte in bytes {
                try Task.checkCancellation()
                guard data.count < maximum else { throw NativeAPIError.responseTooLarge }
                data.append(byte)
            }
            do { return try JSONDecoder().decode(Response.self, from: data) }
            catch { throw NativeAPIError.invalidResponse }
        } catch let error as NativeAPIError { throw error }
        catch is CancellationError { throw CancellationError() }
        catch { throw NativeAPIError.connectionUncertain }
    }
    private func pagination(limit: Int, offset: Int) throws -> [URLQueryItem] {
        guard (1...100).contains(limit), (0...100_000).contains(offset) else { throw NativeAPIError.invalidPath }
        return [URLQueryItem(name: "limit", value: String(limit)), URLQueryItem(name: "offset", value: String(offset))]
    }
    public func vehicles(limit: Int = 50, offset: Int = 0) async throws -> VehiclesEnvelope {
        try await send(segments: ["api", "vehicles"], query: pagination(limit: limit, offset: offset))
    }
    public func devices(vehicleID: String, limit: Int = 50, offset: Int = 0) async throws -> DevicesEnvelope {
        try await send(segments: ["api", "vehicles", vehicleID, "devices"], query: pagination(limit: limit, offset: offset))
    }
    // The caller keeps this exact input/requestId for uncertain-response retries.
    // Reconstructing it with new IDs risks duplicate registrations/observations.
    public func register(vehicleID: String, input: DeviceRegistration) async throws -> DeviceEnvelope {
        try await send(segments: ["api", "vehicles", vehicleID, "devices"], method: "POST", body: JSONEncoder().encode(input))
    }
    private struct ChoiceInput: Encodable { let requestId: String; let expectedRevision: Int; let classification: TripChoice; let reason: String }
    private struct ChoiceEnvelope: Decodable, Sendable { let receipt: TripChoiceServerReceipt }
    public func sendChoice(_ action: QueuedTripChoice) async throws -> TripChoiceServerReceipt {
        guard action.context.isValid, UUID(uuidString: action.requestID) != nil else { throw NativeAPIError.invalidPath }
        let input = ChoiceInput(requestId: action.requestID, expectedRevision: action.context.revision, classification: action.choice, reason: "Expliciete keuze via iOS-melding")
        let result: ChoiceEnvelope = try await send(segments: ["api", "vehicles", action.context.vehicleID, "journeys", action.context.proposalID, "choice"], method: "POST", body: JSONEncoder().encode(input), expectedViewerID: action.context.viewerID)
        return result.receipt
    }
    private struct NativeSettingsEnvelope: Decodable, Sendable { let settings: NativeVehicleSettings }
    public func settings(vehicleID: String, expectedViewerID: String) async throws -> NativeVehicleSettings {
        guard validNativeIdentifier(expectedViewerID) else { throw NativeAPIError.invalidSessionGrant }
        let result: NativeSettingsEnvelope = try await send(segments: ["api", "vehicles", vehicleID, "settings"], expectedViewerID: expectedViewerID)
        return result.settings
    }
    public func saveSettings(vehicleID: String, input: NativeSettingsEdit, expectedViewerID: String) async throws -> NativeVehicleSettings {
        guard input.isValid, validNativeIdentifier(expectedViewerID) else { throw NativeAPIError.invalidPath }
        let result: NativeSettingsEnvelope = try await send(segments: ["api", "vehicles", vehicleID, "settings"], method: "PATCH", body: JSONEncoder().encode(input), expectedViewerID: expectedViewerID)
        return result.settings
    }
    private struct PendingChoicesEnvelope: Decodable, Sendable { let pending: NativePendingChoices }
    public func pendingChoices(vehicleID: String, expectedViewerID: String) async throws -> NativePendingChoices {
        guard validNativeIdentifier(expectedViewerID) else { throw NativeAPIError.invalidSessionGrant }
        let result: PendingChoicesEnvelope = try await send(segments: ["api", "vehicles", vehicleID, "pending-choices"], expectedViewerID: expectedViewerID)
        return result.pending
    }
    public func deactivate(vehicleID: String, deviceID: String, input: DeviceDeactivation) async throws -> DeviceEnvelope {
        try await send(segments: ["api", "vehicles", vehicleID, "devices", deviceID], method: "PATCH", body: JSONEncoder().encode(input))
    }
}
#endif
