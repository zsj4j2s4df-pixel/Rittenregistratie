import SwiftUI
import Combine
import CryptoKit
import WebKit
import UserNotifications
import RitKompasCore
import RitKompasPreparationUI

// Login is interactive in an isolated WebKit store. Only the exact app origin's
// Secure/HttpOnly same-origin cookies are offered as candidates; no DOM/JS scraping,
// token entry, decoded JWT identity or shared Safari cookie import.
@MainActor
final class NativeLoginBrowser: NSObject, ObservableObject, WKNavigationDelegate {
    let web: WKWebView
    @Published var location = ""
    @Published var issue = ""
    let origin: APIOrigin
    init(origin: APIOrigin) {
        self.origin = origin
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .nonPersistent()
        web = WKWebView(frame: .zero, configuration: configuration)
        super.init(); web.navigationDelegate = self
        web.load(URLRequest(url: URL(string: origin.value + "/login")!))
    }
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        location = webView.url?.host ?? ""
    }
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction,
                 decisionHandler: @escaping @MainActor @Sendable (WKNavigationActionPolicy) -> Void) {
        // Authentication may visit the existing Access identity provider. Never
        // handle custom schemes, certificate exceptions, popups or downloads.
        decisionHandler(navigationAction.request.url?.scheme == "https" ? .allow : .cancel)
    }
    func credential() async throws -> NativeLoginCredential {
        guard let url = web.url, origin.contains(url), ["/login", "/ritten", "/api/vehicles"].contains(url.path) else {
            throw NativeAPIError.signInRequired
        }
        let cookies = await web.configuration.websiteDataStore.httpCookieStore.allCookies()
        let host = URL(string: origin.value)!.host!
        let matches = cookies.filter {
            $0.name == "CF_Authorization" && $0.domain == host && $0.path == "/" && $0.isSecure && $0.isHTTPOnly
        }
        let transport = HTTPSNativeSupabaseTransport()
        // Provider status comes only from the fixed backend. No cookie sniffing fallback.
        var accessHeaders: [String: String] = [:]
        if matches.count == 1, let cookie = matches.first, let expiry = cookie.expiresDate {
            accessHeaders = try NativeAccessCookie(origin: origin, value: cookie.value,
                expiresAt: Int64(expiry.timeIntervalSince1970 * 1000)).headers(for: origin, now: Int64(Date().timeIntervalSince1970 * 1000))
        }
        let provider: NativeLoginProvider
        do { provider = try await transport.provider(origin: origin, accessHeaders: accessHeaders); await transport.close() }
        catch { await transport.close(); throw error }
        switch provider {
        case .access:
            guard matches.count == 1, let cookie = matches.first, let expiry = cookie.expiresDate else { throw NativeAPIError.signInRequired }
            return .access(try NativeAccessCookie(origin: origin, value: cookie.value, expiresAt: Int64(expiry.timeIntervalSince1970 * 1000)))
        case .supabase:
            return .supabase(try NativeSupabaseCookies(origin: origin, cookies: cookies))
        }
    }
    func clear() async {
        web.stopLoading()
        let store = web.configuration.websiteDataStore
        await store.removeData(ofTypes: WKWebsiteDataStore.allWebsiteDataTypes(), modifiedSince: .distantPast)
    }
}
private struct LoginBrowserSurface: UIViewRepresentable {
    let browser: NativeLoginBrowser
    func makeUIView(context: Context) -> WKWebView { browser.web }
    func updateUIView(_ uiView: WKWebView, context: Context) {}
}

@MainActor
final class NativeAccountModel: ObservableObject {
    static let origin = try! APIOrigin("https://rittenregistratie.zsj4j2s4df.workers.dev")
    @Published private(set) var vehicles: [Vehicle] = []
    @Published private(set) var vehicleID = ""
    @Published private(set) var viewerID = ""
    @Published private(set) var settings: NativeVehicleSettings?
    @Published private(set) var pending: NativePendingChoices?
    @Published private(set) var actions: [QueuedTripChoice] = []
    @Published private(set) var busy = false
    @Published var message = "Meld aan met je bestaande RitKompas-account."
    private var generation = UUID()
    private var closingSession = false
    private var credentialDeletionFailed = false
    private var credentials: (any NativeAccountCredentialSource)?
    private var access: VerifiedNativeSession?
    private var client: APIClient?
    private var producer: PendingTripChoiceProducer?
    private var workflow: TripChoiceWorkflow?
    private var recovery: NativeSettingsRecovery?
    private var captureOutbox: NativeCaptureOutbox?
    private weak var capture: NativeCaptureModel?
    private var retry: NativeSettingsEdit?
    var hasRetry: Bool { retry != nil }
    private weak var notifications: NativeNotificationModel?
    private func credentialStore() -> any NativeAccountCredentialSource {
        let service = Bundle.main.bundleIdentifier ?? "RitKompas"
        if UserDefaults.standard.string(forKey: "ritkompas.native-provider.v1") == NativeLoginProvider.supabase.rawValue {
            return NativeSupabaseSession(origin: Self.origin, transport: HTTPSNativeSupabaseTransport(),
                persistence: KeychainSupabasePersistence(origin: Self.origin, service: service + ".native-supabase-v1"))
        }
        // Existing installs remain explicit legacy Access until a verified provider selection.
        return KeychainNativeCredentials(origin: Self.origin, service: service + ".native-access-v1")
    }
    func configure(_ notifications: NativeNotificationModel, capture: NativeCaptureModel) { self.notifications = notifications; self.capture = capture }
    // Login, vehicle changes and logout advance generation before any await.
    // Late data from a closed account must never repopulate the new screen.
    func open(cookie: NativeLoginCredential? = nil) async {
        guard !busy else { return }
        busy = true
        let started = await close(clearCredentials: false)
        guard generation == started else { return }
        if let cookie { UserDefaults.standard.set(cookie.provider.rawValue, forKey: "ritkompas.native-provider.v1") }
        let store = credentialStore(); credentials = store
        do {
            if let cookie { try await store.stageLogin(cookie) }
            // Discovery authenticates through the same credential actor. It
            // grants no vehicle scope; the backend returns existing rights only.
            let discovery = HTTPSNativeScopeVerifier()
            let result: VehiclesEnvelope
            do { result = try await discovery.discoverVehicles(origin: Self.origin, candidate: store.candidate(for: Self.origin)); await discovery.close() }
            catch { await discovery.close(); throw error }
            guard generation == started else { return }
            vehicles = result.vehicles
            guard !vehicles.isEmpty else { throw NativeAPIError.accessDenied }
            busy = false
            await selectVehicle(vehicles[0].id, persist: cookie != nil)
        } catch {
            guard generation == started else { return }
            await close(clearCredentials: true)
            busy = false; message = Self.errorText(error)
        }
    }
    func selectVehicle(_ id: String, persist: Bool = false) async {
        guard !busy, vehicles.contains(where: { $0.id == id }), let credentials else { return }
        busy = true; generation = UUID(); let started = generation
        let old = client; let oldAccess = access; let oldProducer = producer; let oldRecovery = recovery; let oldCapture = captureOutbox
        capture?.disconnect(); captureOutbox = nil
        client = nil; access = nil; producer = nil; workflow = nil; retry = nil; recovery = nil
        settings = nil; pending = nil; actions = []; viewerID = ""; vehicleID = ""
        notifications?.bind(store: UnconfiguredTripChoiceStore())
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
        await old?.close(); await oldAccess?.close(); await oldProducer?.clear(); await oldRecovery?.close(); await oldCapture?.close()
        guard generation == started else { return }
        let session = VerifiedNativeSession(origin: Self.origin, vehicleID: id, credentials: credentials, verifier: HTTPSNativeScopeVerifier())
        let api = APIClient(origin: Self.origin, access: session)
        access = session; client = api
        do {
            let scope = try await session.verifiedScope(vehicleID: id)
            let fresh = try await api.settings(vehicleID: id, expectedViewerID: scope.viewerID)
            guard generation == started else { await api.close(); await session.close(); return }
            if persist { try await credentials.persistVerifiedCandidate() }
            guard generation == started else { return }
            let directory = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
                .appendingPathComponent("RitKompasChoices", isDirectory: true)
            let key = KeychainChoiceQueueKey(service: (Bundle.main.bundleIdentifier ?? "RitKompasPrototype") + ".local-choices-v1")
            let queue = DurableTripChoiceQueue(persistence: EncryptedChoiceQueuePersistence(directory: directory, keyProvider: key), binding: session)
            let delivery = TripChoiceDelivery(queue: queue, transport: api)
            let flow = TripChoiceWorkflow(queue: queue, delivery: delivery, scheduler: LocalTripChoiceScheduler())
            workflow = flow
            producer = PendingTripChoiceProducer(vehicleID: id, workflow: flow, binding: session, source: api)
            let recoveryID = SHA256.hash(data: Data((scope.viewerID + "\u{0}" + id).utf8)).map { String(format: "%02x", $0) }.joined()
            let recoveryStore = NativeSettingsRecovery(persistence: EncryptedChoiceQueuePersistence(
                directory: directory.appendingPathComponent("Settings-" + recoveryID), keyProvider: key), viewerID: scope.viewerID, vehicleID: id)
            let restored = try await recoveryStore.load()
            let queued = try await flow.actions(viewerID: scope.viewerID, vehicleID: id)
            guard generation == started else { return }
            vehicleID = id; viewerID = scope.viewerID; settings = fresh
            notifications?.bind(store: flow)
            actions = queued; recovery = recoveryStore; retry = restored
            let captureStore = NativeCaptureOutbox(persistence: EncryptedChoiceQueuePersistence(
                directory: directory.appendingPathComponent("Capture-" + recoveryID), keyProvider: key),
                binding: session, viewerID: scope.viewerID, vehicleID: id)
            captureOutbox = captureStore; capture?.configure(outbox: captureStore, transport: api)
            busy = false; message = "Verbonden met de centrale registratie."
        } catch { await failed(error, started: started) }
    }
    func refresh() async {
        guard !busy, let client, let workflow, !viewerID.isEmpty else { return }
        busy = true; let started = generation; let viewer = viewerID; let vehicle = vehicleID
        // Clear displayed values before checking server authorization again.
        settings = nil; pending = nil; actions = []
        do {
            let fresh = try await client.settings(vehicleID: vehicle, expectedViewerID: viewer)
            let feed = try await producer?.refresh()
            let queued = try await workflow.actions(viewerID: viewer, vehicleID: vehicle)
            guard generation == started else { return }
            settings = fresh; pending = feed; actions = queued; busy = false
            message = "Centrale gegevens opnieuw geladen."
        } catch { await failed(error, started: started) }
    }
    func save(addresses: [NativeStoredAddress], reason: String) async {
        guard !busy, retry == nil, let settings else { return }
        let edit = NativeSettingsEdit(settings: NativeVehicleSettings(revision: settings.revision, plate: settings.plate,
            addresses: addresses, rates: settings.rates), reason: reason)
        guard edit.isValid else { message = "Controleer de adresvelden, wijzigingsreden en limiet van 40 locaties en tarieven."; return }
        retry = edit
        await retrySave()
    }
    func retrySave() async {
        guard !busy, let retry, retry.isValid, let recovery, let client else { return }
        busy = true; let started = generation; let viewer = viewerID; let vehicle = vehicleID
        do {
            try await recovery.save(retry) // durable before the first network mutation
            guard generation == started else { return }
            let fresh = try await client.saveSettings(vehicleID: vehicle, input: retry, expectedViewerID: viewer)
            guard generation == started else { return }
            try await recovery.acknowledge(retry)
            guard generation == started else { return }
            self.retry = nil; settings = fresh; busy = false; message = "Adressen centraal opgeslagen."
        } catch {
            guard generation == started else { return }
            // Keep the encrypted exact request after any uncertain result or local
            // acknowledgement failure. A conflict requires review on the website;
            // never silently discard it or create a new request.
            settings = nil
            await failed(error, started: started)
        }
    }
    func notify(_ id: String) async {
        guard !busy, let producer else { return }
        busy = true; let started = generation
        do { try await producer.notify(proposalID: id); guard generation == started else { return }
            busy = false; message = "Keuzemelding klaargezet. Er is nog geen classificatie opgeslagen."
        } catch { await failed(error, started: started) }
    }
    func send(_ action: QueuedTripChoice) async {
        guard !busy, let workflow else { return }
        busy = true; let started = generation
        do {
            try await workflow.send(action)
            let remaining = try await workflow.actions(viewerID: viewerID, vehicleID: vehicleID)
            guard generation == started else { return }
            actions = remaining; busy = false; message = "Keuze door de server bevestigd."
        } catch { await failed(error, started: started) }
    }
    private func failed(_ error: Error, started: UUID) async {
        guard generation == started else { return }
        if case NativeAPIError.signInRequired = error { await close(clearCredentials: true) }
        else if case NativeAPIError.accessDenied = error { await close(clearCredentials: true) }
        else if case NativeAPIError.redirectRefused = error { await close(clearCredentials: true) }
        busy = false; message = Self.errorText(error)
    }
    private static func errorText(_ error: Error) -> String {
        if let error = error as? NativeAPIError { return error.localizedDescription }
        return "Actie niet afgerond. Controleer je verbinding en vernieuw de gegevens."
    }
    func logout() async {
        guard !closingSession else { return }
        closingSession = true
        busy = true
        let old = credentials ?? credentialStore()
        await close(clearCredentials: false)
        var logoutFailed = false
        do { try await old.logout() } catch { logoutFailed = true }
        busy = false
        closingSession = false
        message = logoutFailed
            ? "Sessie lokaal gesloten. Serverafmelding of verwijderen uit de sleutelhanger is niet bevestigd. Controleer dit voordat je het apparaat overdraagt."
            : "Uitgelogd op dit apparaat. Meld voor accountwisseling opnieuw aan."
    }
    @discardableResult
    private func close(clearCredentials: Bool) async -> UUID {
        generation = UUID(); let closedGeneration = generation
        let oldClient = client; let oldAccess = access; let oldCredentials = credentials; let oldProducer = producer; let oldRecovery = recovery; let oldCapture = captureOutbox
        capture?.disconnect(); captureOutbox = nil
        client = nil; access = nil; credentials = nil; producer = nil; workflow = nil; retry = nil; recovery = nil
        vehicles = []; vehicleID = ""; viewerID = ""; settings = nil; pending = nil; actions = []
        notifications?.bind(store: UnconfiguredTripChoiceStore())
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        UNUserNotificationCenter.current().removeAllDeliveredNotifications()
        await oldClient?.close(); await oldAccess?.close(); await oldProducer?.clear(); await oldRecovery?.close(); await oldCapture?.close()
        if clearCredentials {
            credentialDeletionFailed = false
            do { try await (oldCredentials ?? credentialStore()).clear() }
            catch { if generation == closedGeneration {
                credentialDeletionFailed = true
                message = "Sessie gesloten. Verwijderen uit de sleutelhanger is niet bevestigd."
            } }
        }
        return closedGeneration
    }
}

struct NativeAccountView: View {
    @StateObject private var model = NativeAccountModel()
    @StateObject private var capture = NativeCaptureModel()
    @EnvironmentObject private var notifications: NativeNotificationModel
    @Environment(\.scenePhase) private var phase
    @State private var browser: NativeLoginBrowser?
    @State private var showLogin = false
    @State private var label = ""
    @State private var address = ""
    @State private var reason = ""
    @State private var kind = NativeAddressKind.business
    @State private var role = NativeBusinessRole.customer
    @State private var editID: String?
    @State private var enabled = true
    @State private var confirmDelete = false
    @AppStorage(NativeAppearanceTheme.storageKey) private var appearance = NativeAppearanceTheme.anthracite.rawValue
    private func resetForm() { label = ""; address = ""; reason = ""; editID = nil; enabled = true; confirmDelete = false }
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Centrale registratie")) {
                    Text(model.message).accessibilityIdentifier("native-status")
                    if model.viewerID.isEmpty {
                        Button("Aanmelden") {
                            browser = NativeLoginBrowser(origin: NativeAccountModel.origin); showLogin = true
                        }.disabled(model.busy)
                        Button("Bewaarde sessie openen") { Task { await model.open() } }.disabled(model.busy)
                    } else {
                        Picker("Voertuig", selection: Binding(get: { model.vehicleID }, set: { id in
                            resetForm(); Task { await model.selectVehicle(id) }
                        })) {
                            ForEach(model.vehicles, id: \.id) { vehicle in Text(vehicle.displayName).tag(vehicle.id) }
                        }.disabled(model.busy)
                        Button("Vernieuwen en herstelkeuzes laden") { resetForm(); Task { await model.refresh() } }.disabled(model.busy)
                        Button("Uitloggen / ander account") { resetForm(); Task { await model.logout() } }
                    }
                }
                Section(header: Text("Appstijl")) {
                    Picker("Kleur van de gehele app", selection: $appearance) {
                        ForEach(NativeAppearanceTheme.allCases) { theme in Text(theme.rawValue).tag(theme.rawValue) }
                    }
                }
                if let settings = model.settings {
                    ForEach([NativeAddressKind.business, .private], id: \.rawValue) { category in
                        Section(header: Text(category == .business ? "Zakelijke locaties" : "Privélocaties")) {
                            ForEach(settings.addresses.filter { $0.effectiveKind == category }, id: \.id) { item in
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(item.label).font(.headline); Text(item.address)
                                    if !item.enabled { Text("Inactief").foregroundColor(.secondary) }
                                    Button("Bewerk \(item.label)") {
                                        editID = item.id; label = item.label; address = item.address; kind = item.effectiveKind
                                        role = item.businessRole ?? .customer; enabled = item.enabled; reason = ""
                                    }.disabled(model.busy || model.hasRetry)
                                }
                            }
                            Button(category == .business ? "+ Zakelijke locatie" : "+ Privélocatie") { resetForm(); kind = category }
                                .disabled(model.busy || model.hasRetry)
                        }
                    }
                    Section(header: Text(editID == nil ? "Locatie toevoegen" : "Locatie bewerken")) {
                        TextField("Naam locatie", text: $label)
                        TextField("Adres", text: $address)
                        Toggle("Locatie actief", isOn: $enabled)
                        Picker("Soort locatie", selection: $kind) { Text("Zakelijk").tag(NativeAddressKind.business); Text("Privé").tag(NativeAddressKind.private) }
                        if kind == .business { Picker("Zakelijke relatie", selection: $role) { Text("Klant").tag(NativeBusinessRole.customer); Text("Leverancier").tag(NativeBusinessRole.supplier) } }
                        TextField("Wijzigingsreden", text: $reason)
                        Button("Centraal opslaan") {
                            let old = settings.addresses.first { $0.id == editID }
                            let item = NativeStoredAddress(id: editID ?? UUID().uuidString, label: label, address: address,
                                enabled: enabled, note: old?.note ?? "", kind: kind, businessRole: kind == .business ? role : nil)
                            var next = settings.addresses.filter { $0.id != editID }; next.append(item)
                            Task { await model.save(addresses: next, reason: reason); if !model.hasRetry { resetForm() } }
                        }.disabled(model.busy || model.hasRetry || label.trimmingCharacters(in: .whitespaces).isEmpty || address.trimmingCharacters(in: .whitespaces).isEmpty || reason.trimmingCharacters(in: .whitespaces).isEmpty)
                        if editID != nil {
                            Button("Locatie verwijderen", role: .destructive) { confirmDelete = true }
                                .disabled(reason.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
                                .alert("Locatie verwijderen?", isPresented: $confirmDelete) {
                                    Button("Annuleren", role: .cancel) {}
                                    Button("Verwijderen", role: .destructive) {
                                        let next = settings.addresses.filter { $0.id != editID }
                                        Task { await model.save(addresses: next, reason: reason); if !model.hasRetry { resetForm() } }
                                    }
                                } message: { Text("Oude ritten behouden hun opgeslagen adrestekst. De wijzigingsreden wordt vastgelegd.") }
                            Button("Annuleer bewerken") { resetForm() }
                        }
                    }.disabled(model.busy || model.hasRetry)
                }
                if model.hasRetry { Section(header: Text("Opslag nog niet bevestigd")) {
                    Text("De server kan de wijziging al hebben opgeslagen. Herhaal dezelfde aanvraag; maak geen nieuwe wijziging.")
                    Button("Dezelfde aanvraag opnieuw verzenden") { Task { await model.retrySave() } }.disabled(model.busy)
                } }
                if let pending = model.pending { Section(header: Text("Ritten om te controleren")) {
                    if pending.proposals.isEmpty { Text("Geen open keuzes ontvangen.") }
                    ForEach(pending.proposals, id: \.id) { proposal in Button("Keuzemelding voor rit klaarzetten") { Task { await model.notify(proposal.id) } }.disabled(model.busy) }
                    if pending.moreAvailable { Text("Er zijn meer open ritten. Controleer de website.") }
                } }
                if !model.actions.isEmpty { Section(header: Text("Lokaal bewaarde keuzes")) {
                    ForEach(model.actions, id: \.requestID) { action in
                        Button(action.choice == .business ? "Zakelijke keuze verzenden" : "Privékeuze verzenden") { Task { await model.send(action) } }.disabled(model.busy)
                    }
                } }
                Section {
                    if !model.viewerID.isEmpty { Text("Ritdetectie hieronder vereist afzonderlijk inschakelen en iOS-toestemming.") }
                    NavigationLink("Meldingstoestemming", destination: NativeNotificationPreparationView())
                    Link("Ritten, historie en rapporten op de website", destination: URL(string: NativeAccountModel.origin.value + "/beheer")!)
                    Text("Volledige automatische ritregistratie is nog niet gereed. Een keuzemelding vereist een werkelijk ontvangen open rit.").font(.footnote)
                }
                if !model.viewerID.isEmpty { NativeCaptureSection(model: capture) }
            }
            .nativeFormAppearance()
            .navigationTitle("RitKompas")
            .task { model.configure(notifications, capture: capture) }
            .onChange(of: model.viewerID) { _ in resetForm() }
            .onChange(of: phase) { value in
                if value != .active { resetForm(); capture.stop() }
            }
            .overlay { if phase != .active { Color(UIColor.systemBackground).overlay(Text("RitKompas").font(.title)) } }
        }
        .navigationViewStyle(.stack)
        .sheet(isPresented: $showLogin, onDismiss: { if let browser { Task { await browser.clear() } }; browser = nil }) {
            if let browser {
                NavigationView {
                    VStack {
                        Text(browser.location.isEmpty ? "Beveiligde aanmelding" : browser.location).font(.caption)
                        Text(browser.issue).font(.caption).foregroundColor(.red)
                        LoginBrowserSurface(browser: browser)
                    }.navigationTitle("Aanmelden")
                    .toolbar {
                        ToolbarItem(placement: .cancellationAction) { Button("Annuleren") { showLogin = false } }
                        ToolbarItem(placement: .confirmationAction) { Button("Sessie gebruiken") { Task {
                            do {
                                let cookie = try await browser.credential()
                                await browser.clear(); showLogin = false
                                await model.open(cookie: cookie)
                            } catch { browser.issue = "Rond eerst je persoonlijke aanmelding af. De server moet de RitKompas-sessie bevestigen." }
                        } } }
                    }
                }
            }
        }
    }
}
