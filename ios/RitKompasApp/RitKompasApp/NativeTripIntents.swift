import Foundation
import RitKompasCore
#if canImport(AppIntents)
import AppIntents
#endif

// Shared with the verified foreground account model. Cold/locked launches without
// an initialized verified session fail closed, never silently reuse another user.
@MainActor
enum NativeTripIntentBridge {
    enum RecordingAction: Sendable { case start, stop }
    static var recordingHandler: (@MainActor @Sendable (RecordingAction) async throws -> Void)?
    static var handler: (@MainActor @Sendable (TripChoice) async throws -> Void)?
    static func choose(_ choice: TripChoice) async throws {
        guard let handler else { throw VoiceChoiceUnavailable() }
        do { try await handler(choice) }
        catch { throw VoiceChoiceUnavailable() } // No tokens, names or internal errors in Siri.
    }
    static func record(_ action: RecordingAction) async throws {
        guard let recordingHandler else { throw VoiceChoiceUnavailable() }
        do { try await recordingHandler(action) } catch { throw VoiceChoiceUnavailable() }
    }
}
struct VoiceChoiceUnavailable: LocalizedError {
    var errorDescription: String? {
        "Geen eenduidige aangemelde ritkeuze beschikbaar. Open RitKompas om je account en open ritten te controleren."
    }
}
#if canImport(AppIntents)
@available(iOS 16.0, *)
struct PrivateTripIntent: AppIntent {
    static var title: LocalizedStringResource { "Privé rit" }
    static var description: IntentDescription { "Bewaar Privé voor jouw actieve GPS-ritproef." }
    static var openAppWhenRun: Bool { false }
    static var authenticationPolicy: IntentAuthenticationPolicy { .alwaysAllowed }
    func perform() async throws -> some IntentResult & ProvidesDialog {
        try await NativeTripIntentBridge.choose(.private)
        return .result(dialog: "Privé lokaal bewaard. Centrale verzending is nog niet bevestigd.")
    }
}
@available(iOS 16.0, *)
struct BusinessTripIntent: AppIntent {
    static var title: LocalizedStringResource { "Zakelijke rit" }
    static var description: IntentDescription { "Bewaar Zakelijk voor jouw actieve GPS-ritproef." }
    static var openAppWhenRun: Bool { false }
    static var authenticationPolicy: IntentAuthenticationPolicy { .alwaysAllowed }
    func perform() async throws -> some IntentResult & ProvidesDialog {
        try await NativeTripIntentBridge.choose(.business)
        return .result(dialog: "Zakelijk lokaal bewaard. Centrale verzending is nog niet bevestigd.")
    }
}
@available(iOS 16.0, *)
struct RitKompasTripShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(intent: PrivateTripIntent(), phrases: ["Privé rit met \(.applicationName)"], shortTitle: "Privé rit", systemImageName: "house")
        AppShortcut(intent: BusinessTripIntent(), phrases: ["Zakelijke rit met \(.applicationName)"], shortTitle: "Zakelijke rit", systemImageName: "briefcase")
        AppShortcut(intent: StartTrialTripIntent(), phrases: ["Start ritproef met \(.applicationName)"], shortTitle: "Start ritproef", systemImageName: "location")
        AppShortcut(intent: StopTrialTripIntent(), phrases: ["Stop ritproef met \(.applicationName)"], shortTitle: "Stop ritproef", systemImageName: "stop.circle")
    }
}
@available(iOS 16.0, *)
struct StartTrialTripIntent: AppIntent {
    static var title: LocalizedStringResource { "Start ritproef" }
    static var openAppWhenRun: Bool { false }
    static var authenticationPolicy: IntentAuthenticationPolicy { .alwaysAllowed }
    func perform() async throws -> some IntentResult & ProvidesDialog {
        try await NativeTripIntentBridge.record(.start)
        return .result(dialog: "Ritproef gestart als Privé. Controleer de GPS-status in RitKompas.")
    }
}
@available(iOS 16.0, *)
struct StopTrialTripIntent: AppIntent {
    static var title: LocalizedStringResource { "Stop ritproef" }
    static var openAppWhenRun: Bool { false }
    static var authenticationPolicy: IntentAuthenticationPolicy { .alwaysAllowed }
    func perform() async throws -> some IntentResult & ProvidesDialog {
        try await NativeTripIntentBridge.record(.stop)
        return .result(dialog: "Ritproef gestopt en lokaal bewaard. Centrale bevestiging staat apart.")
    }
}
#endif
