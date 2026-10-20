import SwiftUI

// First native app host. No automatic permissions, credentials, capture or
// background activity: existing preparation UI remains explicitly labelled.
@main
struct RitKompasAppApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}
