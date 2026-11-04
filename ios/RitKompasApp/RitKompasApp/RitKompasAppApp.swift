import SwiftUI
import RitKompasPreparationUI

// First native app host. No automatic permissions, credentials, capture or
// background activity: existing preparation UI remains explicitly labelled.
@main
struct RitKompasAppApp: App {
    @UIApplicationDelegateAdaptor(NativeNotificationApplicationDelegate.self) private var appDelegate
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appDelegate.notifications)
        }
    }
}
