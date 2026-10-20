import SwiftUI
import RitKompasPreparationUI

struct ContentView: View {
    var body: some View {
        NavigationView {
            NativePreparationView()
        }
        .navigationViewStyle(.stack)
    }
}
