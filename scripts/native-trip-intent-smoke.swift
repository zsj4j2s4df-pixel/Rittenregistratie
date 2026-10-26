// Compile with the real app NativeTripIntents.swift and existing macOS Core objects.
// This exercises AppIntent.perform in a local process, NOT Siri/lockscreen delivery.
import Foundation
import RitKompasCore

@main struct NativeTripIntentSmoke {
    @MainActor static var choices: [TripChoice] = []
    @MainActor static var starts = 0
    @MainActor static var stops = 0
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
        NativeTripIntentBridge.recordingHandler = nil
        do { _ = try await StartTrialTripIntent().perform(); fatalError("No host") }
        catch is VoiceChoiceUnavailable {}
        NativeTripIntentBridge.recordingHandler = { action in
            switch action { case .start: starts += 1; case .stop: stops += 1 }
        }
        _ = try await StartTrialTripIntent().perform(); _ = try await StopTrialTripIntent().perform()
        precondition(starts == 1 && stops == 1)
        NativeTripIntentBridge.recordingHandler = nil
        print("PASS: cold start refused; both real AppIntent.perform paths; no app-open flag; private error sanitized; cleared host refused. Local macOS process only.")
    }
}
