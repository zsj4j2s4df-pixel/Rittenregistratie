import SwiftUI
import RitKompasPreparationUI

// First native app host. No automatic permissions, credentials, capture or
// background activity: existing preparation UI remains explicitly labelled.
@main
struct RitKompasAppApp: App {
    @AppStorage(NativeAppearanceTheme.storageKey) private var themeValue = NativeAppearanceTheme.anthracite.rawValue
    @UIApplicationDelegateAdaptor(NativeNotificationApplicationDelegate.self) private var appDelegate
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appDelegate.notifications)
                .preferredColorScheme((NativeAppearanceTheme(rawValue: themeValue) ?? .anthracite).scheme)
                .tint((NativeAppearanceTheme(rawValue: themeValue) ?? .anthracite).accent)
        }
    }
}
