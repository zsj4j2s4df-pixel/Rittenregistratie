#if os(iOS)
import Foundation
import SwiftUI
import UIKit
import UserNotifications
import RitKompasCore

@available(iOS 15.0, *)
@MainActor
public final class NativeNotificationModel: ObservableObject {
    @Published public private(set) var permission = "Nog niet gecontroleerd"
    @Published public private(set) var mayRequest = false
    @Published public private(set) var message = "Geen keuze ontvangen. Native aanmelden is nog niet ingericht."
    private let notifications = TripChoiceNotifications()
    private var handler: TripChoiceResponseHandler
    private var delegate: TripChoiceNotificationDelegate?
    public init(store: any TripChoiceStore = UnconfiguredTripChoiceStore()) {
        handler = TripChoiceResponseHandler(store: store)
    }
    public func bind(store: any TripChoiceStore) {
        handler = TripChoiceResponseHandler(store: store)
        delegate = nil
        message = "Geen keuze ontvangen in de huidige sessie."
        install()
    }
    // Construct one owner, without reading Keychain, creating directories or
    // opening a session. Default scope/transport deny before persistence/network.
    public static func closedRuntime() -> NativeNotificationModel {
        guard let base = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask).first else {
            return NativeNotificationModel()
        }
        let key = KeychainChoiceQueueKey(service: (Bundle.main.bundleIdentifier ?? "RitKompasPrototype") + ".local-choices-v1")
        let persistence = EncryptedChoiceQueuePersistence(directory: base.appendingPathComponent("RitKompasChoices", isDirectory: true), keyProvider: key)
        let queue = DurableTripChoiceQueue(persistence: persistence) // Default UnconfiguredChoiceSessionBinding.
        let delivery = TripChoiceDelivery(queue: queue, transport: UnconfiguredTripChoiceTransport())
        let workflow = TripChoiceWorkflow(queue: queue, delivery: delivery, scheduler: LocalTripChoiceScheduler())
        return NativeNotificationModel(store: workflow)
    }
    public func install() {
        guard delegate == nil else { return }
        let receiver = TripChoiceNotificationDelegate(handler: handler, onResult: { [weak self] result in
            await self?.received(result)
        })
        delegate = receiver // UN center's delegate reference is weak; retain it.
        UNUserNotificationCenter.current().delegate = receiver
        Task { await notifications.registerCategories() } // No permission request.
    }
    private func received(_ result: TripChoiceHandlingResult) {
        switch result {
        case .queued: message = "Keuze lokaal bewaard; nog niet naar de centrale registratie verzonden."
        case .opened: message = "Geen keuze gedaan. Controleer de actuele rit zodra je bent aangemeld."
        case .dismissed: message = "Melding gesloten zonder een keuze te bewaren."
        case .rejected: message = "Deze keuze kon niet worden verwerkt. Open de app en controleer de actuele rit na aanmelden."
        case .ignored: break
        }
    }
    public func refreshPermission() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        switch settings.authorizationStatus {
        case .notDetermined: permission = "Nog niet gevraagd"; mayRequest = true
        case .denied: permission = "Niet toegestaan"; mayRequest = false
        case .authorized: permission = "Toegestaan"; mayRequest = false
        case .provisional: permission = "Voorlopig toegestaan; ritmeldingen nog niet actief"; mayRequest = true
        case .ephemeral: permission = "Tijdelijk toegestaan; ritmeldingen nog niet actief"; mayRequest = true
        @unknown default: permission = "Onbekende meldingsstatus"; mayRequest = false
        }
    }
    public func requestPermission() async {
        let settings = await UNUserNotificationCenter.current().notificationSettings()
        guard settings.authorizationStatus == .notDetermined || settings.authorizationStatus == .provisional || settings.authorizationStatus == .ephemeral else {
            await refreshPermission(); return
        }
        do { _ = try await notifications.requestPermission(); message = "Meldingskeuze verwerkt. Dit start geen ritregistratie." }
        catch { message = "Meldingstoestemming kon niet worden gewijzigd. Controleer de appinstellingen." }
        await refreshPermission()
    }
}

@available(iOS 15.0, *)
@MainActor
public final class NativeNotificationApplicationDelegate: NSObject, UIApplicationDelegate {
    public let notifications = NativeNotificationModel.closedRuntime()
    public override init() { super.init() }
    public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        notifications.install()
        return true
    }
}

@available(iOS 15.0, *)
@MainActor
public struct NativeNotificationPreparationView: View {
    @EnvironmentObject private var model: NativeNotificationModel
    @Environment(\.scenePhase) private var phase
    public init() {}
    public var body: some View {
        Form {
            Section(header: Text("Ritmeldingen")) {
                Text(model.permission)
                Text("Toestemming alleen start geen ritregistratie. Ritmeldingen vereisen ook een aangemelde gebruiker en een actuele rit.")
                Button("Meldingen toestaan") { Task { await model.requestPermission() } }
                    .disabled(!model.mayRequest)
                Button("Controleer meldingsstatus") { Task { await model.refreshPermission() } }
                Button("Open iOS-instellingen") {
                    guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
                    UIApplication.shared.open(url)
                }
            }
            Section(header: Text("Laatste actie")) { Text(model.message) }
            Section(header: Text("Nog in voorbereiding")) {
                Text("Aanmelden verloopt via Centrale registratie. Automatische ritregistratie is nog niet aangesloten. Alleen een werkelijk ontvangen open rit kan na jouw keuze expliciet worden verzonden; een voorbeeldrit nooit.")
            }
        }
        .nativeFormAppearance()
        .navigationTitle("Meldingen")
        .task { await model.refreshPermission() }
        .onChange(of: phase) { value in
            if value == .active { Task { await model.refreshPermission() } }
        }
    }
}
#endif
