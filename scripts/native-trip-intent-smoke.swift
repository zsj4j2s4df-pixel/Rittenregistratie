// Compile with the real app NativeTripIntents.swift and existing macOS Core objects.
// This exercises AppIntent.perform in a local process, NOT Siri/lockscreen delivery.
import Foundation
import RitKompasCore

@main struct NativeTripIntentSmoke {
    @MainActor static var choices: [TripChoice] = []
    struct PrivateFailure: LocalizedError {
        var errorDescription: String? { "synthetic-private-detail" }
    }
    @MainActor static func main() async throws {
        NativeTripIntentBridge.handler = nil
        do { _ = try await PrivateTripIntent().perform(); fatalError("Cold start accepted") }
        catch is VoiceChoiceUnavailable {}
        NativeTripIntentBridge.handler = { choice in choices.append(choice) }
        _ = try await PrivateTripIntent().perform()
        _ = try await BusinessTripIntent().perform()
        precondition(choices == [.private, .business])
        precondition(!PrivateTripIntent.openAppWhenRun && !BusinessTripIntent.openAppWhenRun)
        NativeTripIntentBridge.handler = { _ in throw PrivateFailure() }
        do { _ = try await BusinessTripIntent().perform(); fatalError("Failure accepted") }
        catch {
            precondition(error is VoiceChoiceUnavailable)
            precondition(!error.localizedDescription.contains("synthetic-private-detail"))
        }
        NativeTripIntentBridge.handler = nil
        do { _ = try await BusinessTripIntent().perform(); fatalError("Cleared host accepted") }
        catch is VoiceChoiceUnavailable {}
        precondition(choices.count == 2)
        print("PASS: cold start refused; both real AppIntent.perform paths; no app-open flag; private error sanitized; cleared host refused. Local macOS process only.")
    }
}
