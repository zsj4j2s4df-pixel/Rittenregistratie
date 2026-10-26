import Foundation
import RitKompasCore
#if canImport(AppIntents)
import AppIntents
#endif

// Shared with the verified foreground account model. Cold/locked launches without
// an initialized verified session fail closed, never silently reuse another user.
@MainActor
enum NativeTripIntentBridge {
    static var handler: (@MainActor @Sendable (TripChoice) async throws -> Void)?
    static func choose(_ choice: TripChoice) async throws {
        guard let handler else { throw VoiceChoiceUnavailable() }
        do { try await handler(choice) }
        catch { throw VoiceChoiceUnavailable() } // No tokens, names or internal errors in Siri.
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
    static var description: IntentDescription { "Bewaar Privé voor de enige geverifieerde open ritkeuze." }
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
    static var description: IntentDescription { "Bewaar Zakelijk voor de enige geverifieerde open ritkeuze." }
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
    }
}
#endif
