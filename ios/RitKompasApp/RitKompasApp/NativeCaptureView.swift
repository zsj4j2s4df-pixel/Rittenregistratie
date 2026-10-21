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
    func disconnect() {
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
        generation = UUID(); sending?.cancel(); sending = nil; busy = false
        manager.stopUpdatingLocation(); running = false; detector.interrupt(); lastSample = nil
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
    var body: some View {
        Section(header: Text("Ritdetectie — proef tijdens gebruik")) {
            Text(model.message)
            Text(model.count.map { "Lokaal bewaard: \($0) observaties" } ?? "Bewaarde observaties nog niet gecontroleerd")
            Text("Bij inschakelen wordt je precieze locatie versleuteld op dit apparaat bewaard. Alleen Verzenden stuurt deze observaties naar je eigen RitKompas-backend. Geen achtergrondopname, definitieve rit, automatische bestuurder of Zakelijk/Privé.")
                .font(.footnote)
            if model.running { Button("GPS-proef stoppen") { model.stop() } }
            else { Button("GPS-proef inschakelen") { model.start() }.disabled(model.busy) }
            Button("Bewaarde observaties controleren") { Task { await model.loadCount() } }.disabled(model.busy || model.running)
            Button("Observaties verzenden / exact herhalen") { Task { await model.send() } }.disabled(model.busy || model.running)
        }
    }
}
