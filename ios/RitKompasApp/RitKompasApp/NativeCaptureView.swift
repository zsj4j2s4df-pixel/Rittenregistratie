import SwiftUI
import Combine
import CoreLocation
import RitKompasCore

@MainActor
final class NativeCaptureModel: NSObject, ObservableObject, CLLocationManagerDelegate {
    @Published private(set) var running = false
    @Published private(set) var busy = false
    @Published private(set) var count: Int?
    @Published private(set) var message = "Uitgeschakeld. Geen locatieverzameling."
    @Published private(set) var trip: TrialTrip?
    @Published private(set) var tripRecording = false
    @Published var backgroundEnabled = false
    private var trial: NativeTrialTrip?
    private var syncFactory: ((String) -> NativeTrialSync)?
    private let manager = CLLocationManager()
    private var detector = ForegroundMotionDetector()
    private var outbox: NativeCaptureOutbox?
    private var transport: APIClient?
    private var generation = UUID()
    private var lastSample: Int64?
    private var sending: Task<Int, Error>?
    override init() {
        super.init(); manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyNearestTenMeters
        manager.distanceFilter = kCLDistanceFilterNone
        manager.activityType = .automotiveNavigation
        manager.pausesLocationUpdatesAutomatically = false
        // No background entitlement, permission or startup in init.
    }
    func configure(outbox: NativeCaptureOutbox, transport: APIClient) {
        disconnect(); self.outbox = outbox; self.transport = transport
        message = "Aangemeld. GPS-proef staat uit; inschakelen blijft jouw keuze."
    }
    func configureTrial(_ store: NativeTrialTrip, sync: @escaping (String) -> NativeTrialSync) { trial = store; syncFactory = sync; trip = nil }
    func syncTrip() async {
        guard !busy, !running, let trial, let syncFactory, let transport else { return }
        busy = true; let started = generation; defer { if generation == started { busy = false } }
        do {
            guard let value = try await trial.snapshot(), value.endedAt != nil else { throw TrialTripError.noActiveTrip }
            let id = try await syncFactory(value.id).sync(value, using: transport)
            guard generation == started else { return }
            trip = try await trial.markSynced(journeyID: id)
            message = "GPS-punten, ritkeuzes en riteinde centraal bevestigd als ritbewijs. Controle voor definitief logboek blijft nodig."
        } catch {
            guard generation == started else { return }
            message = "Centrale ritproef niet bevestigd. Exacte aanvragen blijven bewaard; bij conflict/toegangsverlies eerst controleren."
        }
    }
    func runTrialAction(_ action: NativeTripIntentBridge.RecordingAction) async {
        do { switch action { case .start: try await startTrip(allowPermissionPrompt: true); case .stop: try await stopTrip() } }
        catch { message = "Ritactie niet bevestigd. Controleer aanmelden, precieze locatietoestemming en lokale opslag; niets gewist." }
    }
    func runTrialChoice(_ choice: TripChoice) async {
        do { try await chooseTrip(choice) }
        catch { message = "Keuze niet bevestigd; de laatst bewaarde ritkeuze blijft behouden." }
    }
    func requestBackgroundPermission() {
        // Explicit explanation and user action precede both stages of iOS permission.
        if manager.authorizationStatus == .notDetermined { manager.requestWhenInUseAuthorization() }
        else if manager.authorizationStatus == .authorizedWhenInUse { manager.requestAlwaysAuthorization() }
        message = "Kies zelf locatietoegang in iOS. Achtergrondproef blijft een afzonderlijke keuze."
    }
    func restoreTrip() async {
        guard let trial, !busy else { return }
        do { trip = try await trial.snapshot() }
        catch { message = "Ritopslag niet leesbaar; niets gewist. Meld opnieuw aan of controleer de opslag." }
    }
    func startTrip(allowPermissionPrompt: Bool = false) async throws {
        guard !busy, let trial else { throw NativeAPIError.sessionNotConfigured }
        guard manager.authorizationStatus == .authorizedWhenInUse || manager.authorizationStatus == .authorizedAlways,
              manager.accuracyAuthorization == .fullAccuracy else {
            if allowPermissionPrompt && manager.authorizationStatus == .notDetermined { manager.requestWhenInUseAuthorization() }
            throw NativeAPIError.accessDenied
        }
        guard UIApplication.shared.applicationState == .active || (backgroundEnabled && manager.authorizationStatus == .authorizedAlways) else {
            throw NativeAPIError.accessDenied
        }
        busy = true; defer { busy = false }
        let started = generation
        let value = try await trial.start()
        guard generation == started else { throw NativeAPIError.sessionNotConfigured }
        trip = value; tripRecording = true; running = true; lastSample = nil
        manager.allowsBackgroundLocationUpdates = backgroundEnabled
        manager.showsBackgroundLocationIndicator = backgroundEnabled
        manager.startUpdatingLocation()
        do { try await TripChoiceNotifications().schedule(value.context) }
        catch { message = "Ritproef gestart als Privé; melding niet toegestaan. Keuze blijft in app/Siri beschikbaar."; return }
        message = "Ritproef actief, standaard Privé. GPS wordt lokaal versleuteld bewaard."
    }
    func chooseTrip(_ choice: TripChoice) async throws {
        guard let trial, let value = try await trial.snapshot(), value.endedAt == nil else { throw TrialTripError.noActiveTrip }
        try await trial.chooseIfCurrent(choice, context: value.context)
        trip = try await trial.snapshot()
        TripChoiceNotifications().remove(value.context)
    }
    func stopTrip() async throws {
        guard !busy, let trial else { throw NativeAPIError.sessionNotConfigured }
        busy = true; defer { busy = false }
        // Stop location immediately, even when a durable stop cannot be saved.
        manager.stopUpdatingLocation(); running = false; tripRecording = false
        manager.allowsBackgroundLocationUpdates = false
        generation = UUID(); trip = try await trial.stop()
        if let trip { TripChoiceNotifications().remove(trip.context) }
        message = "Ritproef gestopt en lokaal bewaard. Controle en centrale synchronisatie volgen apart."
    }
    func sceneInactive() {
        if tripRecording && backgroundEnabled { return }
        if tripRecording {
            manager.stopUpdatingLocation(); running = false; tripRecording = false
            message = "Ritproef gepauzeerd: achtergrondproef stond uit. Herstel later; geen einde verzonnen."
        } else { stop() }
    }
    func disconnect() {
        if let trial { Task { await trial.close() } }
        trial = nil; syncFactory = nil; trip = nil; tripRecording = false; backgroundEnabled = false
        stop(); outbox = nil; transport = nil; count = nil
        message = "Uitgeschakeld. Meld eerst aan voor een GPS-proef."
    }
    func start() {
        guard outbox != nil, !busy else { return }
        switch manager.authorizationStatus {
        case .authorizedAlways, .authorizedWhenInUse:
            guard manager.accuracyAuthorization == .fullAccuracy else {
                message = "Precieze locatie ontbreekt. Geen betrouwbare route aannemen."; return
            }
            detector.interrupt(); lastSample = nil; running = true
            manager.startUpdatingLocation()
            message = "GPS-proef actief tijdens gebruik; gegevens lokaal versleuteld, nog niet verzonden."
        case .notDetermined:
            manager.requestWhenInUseAuthorization()
            message = "Kies zelf de iOS-toestemming. Tik daarna opnieuw op Inschakelen."
        default: message = "Locatietoegang ontbreekt; er wordt niet gemeten."
        }
    }
    func stop() {
        tripRecording = false
        generation = UUID(); sending?.cancel(); sending = nil; busy = false
        manager.stopUpdatingLocation(); running = false; detector.interrupt(); lastSample = nil
        manager.allowsBackgroundLocationUpdates = false
        message = "GPS-proef gestopt. Meetgat, geen verzonnen riteinde. Bewaarde observaties blijven behouden."
    }
    func send() async {
        guard !running, !busy, let outbox, let transport else { return }
        busy = true; let started = generation
        defer { if generation == started { busy = false } }
        do {
            let request = Task { try await outbox.flush(using: transport) }
            sending = request
            let remaining = try await request.value
            guard generation == started else { return }
            sending = nil; count = remaining
            message = "Observaties door de server bevestigd. Dit zijn nog geen definitieve ritten."
        } catch {
            guard generation == started else { return }
            message = "Verzending niet bevestigd. Exacte observaties blijven bewaard; geen nieuwe aanvragen maken."
        }
    }
    func loadCount() async {
        guard !busy, let outbox else { return }
        busy = true; let started = generation
        defer { if generation == started { busy = false } }
        do {
            let total = try await outbox.count()
            guard generation == started else { return }; count = total
        } catch {
            guard generation == started else { return }
            message = "Lokale opslag kon niet worden gecontroleerd; niets gewist of gereset."
        }
    }
    private func receive(_ samples: [NativeMotionSample]) async {
        if tripRecording, let trial {
            guard !busy else { return }
            busy = true; let started = generation
            defer { if generation == started { busy = false } }
            do {
                for sample in samples where sample.validForTrial(now: Int64(Date().timeIntervalSince1970)) {
                    guard generation == started, tripRecording else { return }
                    let value = try await trial.append(sample)
                    guard generation == started else { return }; trip = value
                }
            } catch {
                manager.stopUpdatingLocation(); running = false; tripRecording = false
                message = "Ritproef onderbroken: opslag/sessie niet bevestigd. Bewijs blijft bewaard."
            }
            return
        }
        guard running, let outbox else { return }
        guard !busy else { stop(); message = "Opname onderbroken door overlappende verwerking; controleer de meetgrens."; return }
        busy = true; let started = generation
        defer { if generation == started { busy = false } }
        for sample in samples {
            guard generation == started, running else { return }
            let now = Int64(Date().timeIntervalSince1970)
            guard sample.valid(now: now) else {
                detector.interrupt(); message = "Onzekere GPS-meting: meetgat, geen riteinde afgeleid."; continue
            }
            if let previous = lastSample, sample.time >= previous, sample.time - previous < 6 { continue }
            var next = detector
            let boundary = next.observe(sample, now: now)
            do {
                let total = try await outbox.append(sample: sample, boundary: boundary, now: now)
                guard generation == started, running else { return }
                detector = next; lastSample = sample.time; count = total
                message = boundary == .startCandidate ? "Startvoorstel lokaal bewaard; bestuurder en soort onbekend."
                    : boundary == .endCandidate ? "Stopvoorstel na twee minuten lokaal bewaard; controle blijft nodig."
                    : "GPS-observatie lokaal versleuteld; nog niet verzonden."
            } catch {
                guard generation == started else { return }
                stop(); message = "Opname gestopt: opslag of sessie niet bevestigd. Niets stil verwijderd."
                return
            }
        }
    }
    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        let samples = locations.compactMap { point -> NativeMotionSample? in
            let time = point.timestamp.timeIntervalSince1970
            guard time.isFinite, time >= 0, time <= 253_402_300_799 else { return nil }
            return NativeMotionSample(time: Int64(time), latitude: point.coordinate.latitude,
                longitude: point.coordinate.longitude, accuracy: point.horizontalAccuracy, speed: point.speed)
        }
        Task { @MainActor [weak self] in await self?.receive(samples) }
    }
    nonisolated func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        Task { @MainActor [weak self] in
            guard let self else { return }
            if self.manager.authorizationStatus != .authorizedWhenInUse && self.manager.authorizationStatus != .authorizedAlways
                || self.manager.accuracyAuthorization != .fullAccuracy { self.stop() }
        }
    }
    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor [weak self] in self?.stop() }
    }
}

struct NativeCaptureSection: View {
    @ObservedObject var model: NativeCaptureModel
    @State private var showRoute = false
    @State private var showTechnical = false
    var body: some View {
        Section(header: Text("Mijn rit")) {
            Text("1. Start je rit.  2. Kies Privé of Zakelijk.  3. Stop en verstuur.").font(.body)
            Text("Testversie: begin met één korte rit. Bedien de app alleen als je stilstaat.").font(.footnote)
            if let trip = model.trip {
                Text(trip.endedAt == nil ? "Rit gestart" : "Rit gestopt").font(.headline)
                Text("\(trip.classification == .private ? "Privé" : "Zakelijk") · \(trip.points.count) GPS-punten · \(trip.gaps) meetgaten")
                Text(String(format: "Gemeten GPS-deelafstand: %.3f km", trip.distanceMeters / 1000)).font(.footnote)
                Text("Start: \(Date(timeIntervalSince1970: Double(trip.startedAt)).formatted())").font(.footnote)
                Text(trip.points.isEmpty ? "Beginlocatie onbekend: nog geen geldige GPS-meting." : "Eerste en laatste gemeten GPS-punt beschikbaar; meetgaten worden niet ingevuld.").font(.footnote)
                if !trip.points.isEmpty { Button("Gemeten GPS-route bekijken") { showRoute = true } }
                if trip.syncedJourneyID != nil { Text("Ontvangen door RitKompas. Controleer de rit nog op de website.") }
                if trip.endedAt == nil {
                    Button { Task { await model.runTrialChoice(.private) } } label: { Label("Privé", systemImage: "house").frame(minHeight: 48) }.disabled(model.busy)
                    Button { Task { await model.runTrialChoice(.business) } } label: { Label("Zakelijk", systemImage: "briefcase").frame(minHeight: 48) }.disabled(model.busy)
                }
            }
            if model.tripRecording {
                Button("Stop rit") { Task { await model.runTrialAction(.stop) } }.frame(minHeight: 48).disabled(model.busy)
            } else {
                Button("Start rit") { Task { await model.runTrialAction(.start) } }.frame(minHeight: 48).disabled(model.busy || (model.trip?.endedAt != nil && model.trip?.syncedJourneyID == nil))
            }
            Button("Verstuur gestopte rit") { Task { await model.syncTrip() } }
                .disabled(model.busy || model.running || model.trip?.endedAt == nil)
            Text(model.message).accessibilityIdentifier("trip-save-status")
            DisclosureGroup("Opnemen met het scherm uit") {
                Text("Je precieze locatie wordt op deze iPhone bewaard. Alleen Verstuur stuurt de gestopte rit naar RitKompas. Privé is de standaardkeuze.").font(.footnote)
                Toggle("GPS bij vergrendeld scherm", isOn: $model.backgroundEnabled).disabled(model.running)
                Button("Locatietoestemming instellen") { model.requestBackgroundPermission() }.disabled(model.running)
            }
            DisclosureGroup("Uitleg over deze proef") {
            Button("Bewaarde rit opnieuw laden") { Task { await model.restoreTrip() } }.disabled(model.busy || model.running)
            Text("Deze begrensde proef bewaart maximaal 300 GPS-punten, minstens 15 seconden uit elkaar. Bij volle opslag, verlopen sessie of ontbrekende toestemming stopt de meting met een melding. Apple Kaarten wordt alleen geladen als je de route opent.").font(.footnote)
            }
        }
        .sheet(isPresented: $showRoute) {
            NavigationView {
                NativeTrialRouteMap(points: model.trip?.points ?? [])
                    .navigationTitle("Gemeten proefroute")
                    .toolbar { Button("Sluiten") { showRoute = false } }
            }
        }
        Section {
            DisclosureGroup("Siri en technische proeven", isExpanded: $showTechnical) {
                Text("Deze functies moeten nog op jouw iPhone worden getest.").font(.footnote)
            }
        }
        if showTechnical {
        Section(header: Text("Siri en Opdrachten — ritproef")) {
            Text("Start ritproef met RitKompas\nPrivé rit met RitKompas\nZakelijke rit met RitKompas\nStop ritproef met RitKompas")
            Text("Eerst persoonlijk aanmelden en de locatietoestemming in de app kiezen. Stemkeuze geldt alleen voor jouw actieve proefrit. Zonder aangemelde host wordt de actie geweigerd. Vergrendeling/CarPlay moeten op jouw iPhone worden getest.").font(.footnote)
            Link("Open Apple Opdrachten", destination: URL(string: "shortcuts://")!)
            Text("Voor een verbindingsproef: Opdrachten → Automatisering → Bluetooth → eigen Jeep → Start ritproef. CarPlay kan verbinden en verbreken gebruiken; kies Stop ritproef voor verbreken. De exacte opties moeten op jouw telefoon worden gecontroleerd; geen algemene Bluetooth-verbreektrigger beloven.").font(.footnote)
        }
        Section(header: Text("Voor ontwikkelaars — losse GPS-metingen")) {
            Text(model.message)
            Text(model.count.map { "Lokaal bewaard: \($0) observaties" } ?? "Bewaarde observaties nog niet gecontroleerd")
            Text("Bij inschakelen wordt je precieze locatie versleuteld op dit apparaat bewaard. Alleen Verzenden stuurt deze observaties naar je eigen RitKompas-backend. Geen achtergrondopname, definitieve rit, automatische bestuurder of Zakelijk/Privé.")
                .font(.footnote)
            if model.running { Button("GPS-proef stoppen") { model.stop() } }
            else { Button("GPS-proef inschakelen") { model.start() }.disabled(model.busy || model.tripRecording) }
            Button("Bewaarde observaties controleren") { Task { await model.loadCount() } }.disabled(model.busy || model.running)
            Button("Observaties verzenden / exact herhalen") { Task { await model.send() } }.disabled(model.busy || model.running)
        }
        }
    }
}
