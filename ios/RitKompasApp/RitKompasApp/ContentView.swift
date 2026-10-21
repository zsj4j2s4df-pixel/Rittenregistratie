import SwiftUI
import RitKompasPreparationUI

struct ContentView: View {
    @State private var showDesign = false
    var body: some View {
        VStack(spacing: 0) {
            NativeAccountView()
            Button("Afzonderlijke ontwerpproef bekijken") { showDesign = true }
                .frame(minHeight: 44)
        }
        .sheet(isPresented: $showDesign) {
            VStack {
                Button("Terug naar centrale registratie") { showDesign = false }.frame(minHeight: 44)
                ReviewPrototypeView { NativePreparationView() }
            }
        }
    }
}
