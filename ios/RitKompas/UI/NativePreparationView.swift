#if os(iOS)
import SwiftUI
import CoreLocation
import UIKit

@available(iOS 15.0, *)
@MainActor
private final class NativePreparationModel: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published private(set) var permission = "Nog niet gecontroleerd"
    @Published private(set) var accuracy = "Nog niet gecontroleerd"
    @Published private(set) var lifecycle = "Voorbereiding; geen locatieverzameling"
    @Published private(set) var message = ""
    @Published private(set) var mayRequest = false
    private let location = CLLocationManager()

    override init() {
        super.init()
        location.delegate = self
        readPermission()
    }
    func readPermission() {
        switch location.authorizationStatus {
        case .notDetermined: permission = "Nog niet gevraagd"; mayRequest = true
        case .restricted: permission = "Beperkt door iOS"; mayRequest = false
        case .denied: permission = "Niet toegestaan"; mayRequest = false
        case .authorizedWhenInUse: permission = "Tijdens gebruik toegestaan"; mayRequest = false
        case .authorizedAlways: permission = "Altijd toegestaan (niet door deze voorbereiding gevraagd)"; mayRequest = false
        @unknown default: permission = "Onbekende iOS-status"; mayRequest = false
        }
        guard location.authorizationStatus == .authorizedWhenInUse || location.authorizationStatus == .authorizedAlways else {
            accuracy = "Geen locatiegebruik toegestaan; meetprecisie onbekend"
            return
        }
        switch location.accuracyAuthorization {
        case .fullAccuracy: accuracy = "Precieze locatie toegestaan; werkelijke meetnauwkeurigheid niet getest"
        case .reducedAccuracy: accuracy = "Beperkte precisie; geen volledige GPS-route aannemen"
        @unknown default: accuracy = "Onbekende precisietoestemming"
        }
    }
    func requestWhenInUse() {
        guard location.authorizationStatus == .notDetermined else { readPermission(); return }
        guard let explanation = Bundle.main.object(forInfoDictionaryKey: "NSLocationWhenInUseUsageDescription") as? String,
              !explanation.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            message = "De ontvangende iOS-app mist de locatietoelichting. Toestemming wordt niet gevraagd."
            return
        }
        message = "iOS bepaalt of een toestemmingsvenster verschijnt. Dit start geen locatieverzameling."
        location.requestWhenInUseAuthorization()
    }
    func phaseChanged(_ phase: ScenePhase) {
        if phase == .active {
            readPermission()
            lifecycle = "App actief. Er loopt geen GPS-opname of automatische synchronisatie."
        } else {
            lifecycle = "App niet actief. Geen achtergrondregistratie of herstartgarantie beschikbaar."
        }
    }
    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor [weak self] in self?.readPermission() }
    }
}

// Reused by the separate first app host. This library view never starts capture,
// configures signing/entitlements or requests background location.
@available(iOS 15.0, *)
@MainActor
public struct NativePreparationView: View {
    @Environment(\.scenePhase) private var scenePhase
    @StateObject private var model = NativePreparationModel()
    public init() {}
    public var body: some View {
        Form {
            Section(header: Text("RitKompas — native voorbereiding")) {
                Text("Voorbereidingsprototype. Nog geen werkende of op een echte iPhone geteste rittenregistratie.")
                Text("Native aanmelden is niet ingericht. Er worden geen accounts, registraties of observaties verzonden.")
            }
            Section(header: Text("Locatietoestemming")) {
                Text(model.permission)
                Text(model.accuracy)
                Text("Kies zelf of je toestemming wilt geven. Er wordt uitsluitend toestemming tijdens gebruik gevraagd. Geen locatie wordt gemeten of verstuurd vanuit dit scherm.")
                Button("Vraag toestemming tijdens gebruik") { model.requestWhenInUse() }
                    .disabled(!model.mayRequest)
                Button("Controleer toestemmingsstatus") { model.readPermission() }
                Button("Open iOS-instellingen") {
                    guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
                    UIApplication.shared.open(url)
                }
                if !model.message.isEmpty { Text(model.message).accessibilityAddTraits(.updatesFrequently) }
            }
            Section(header: Text("Levenscyclus en grenzen")) {
                Text(model.lifecycle)
                Text("Geen achtergrondlocatie, Bluetooth-trigger, CarPlay, lokale opslag of automatische verzending geïmplementeerd. Toestemming alleen bewijst geen betrouwbare GPS-meting.")
                Text("Onbekende routes en ontbrekende segmenten worden niet ingevuld. Hardware-, energie- en herstarttests moeten op een echte iPhone plaatsvinden.")
            }
        }
        .navigationTitle("Voorbereiding")
        .onAppear { model.phaseChanged(scenePhase) }
        .onChange(of: scenePhase) { model.phaseChanged($0) }
    }
}
#endif
