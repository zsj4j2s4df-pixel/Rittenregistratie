import SwiftUI
import UIKit

// Isolated design-review shell. No API, sensor, notification or trip-storage
// integration. Example choices are memory-only and never become real records.
struct ReviewPrototypeView<TechnicalView: View>: View {
    let technicalView: () -> TechnicalView
    @State private var tab = 0
    @State private var accent = ReviewAccent.sand
    @State private var quickPreference: String?
    @State private var filter = "Alle"
    @State private var selectedTrip: ReviewTrip?
    @State private var showChoice = false
    @State private var driving = false
    @State private var classification = "Privé"
    @State private var showFeedback = false
    @State private var feedbackContext: String?
    @State private var reportPreview = false
    @State private var showTechnical = false

    private var sand: Color { accent.color }
    private let background = Color(red: 0.055, green: 0.075, blue: 0.075)
    private let panel = Color(red: 0.10, green: 0.13, blue: 0.13)
    private let muted = Color(red: 0.65, green: 0.70, blue: 0.68)
    private let green = Color(red: 0.60, green: 0.73, blue: 0.40)
    private var screenID: String { ["01 · Home", "02 · Ritten", "04 · Rapporten", "05 · Mijn Jeep"][tab] }

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 7) {
                Circle().fill(sand).frame(width: 6, height: 6)
                Text("ONTWERPPROEF").font(.system(size: 10, weight: .bold, design: .monospaced)).tracking(1.4)
                Spacer()
                Button { feedbackContext = screenID; showFeedback = true } label: {
                    Label("Geef feedback", systemImage: "bubble.left").font(.system(size: 12, weight: .semibold))
                }.accessibilityIdentifier("review.feedback")
            }.foregroundColor(sand).padding(.horizontal, 22).padding(.vertical, 12)
            ScrollView {
                VStack(alignment: .leading, spacing: 22) {
                    if tab == 0 { home }
                    else if tab == 1 { trips }
                    else if tab == 2 { reports }
                    else { myJeep }
                    Text("\(screenID)  ·  Voorbeeldgegevens, geen echte registratie")
                        .font(.system(size: 10, design: .monospaced)).foregroundColor(muted).padding(.bottom, 12)
                }.padding(.horizontal, 22).padding(.top, 14)
            }
            HStack(spacing: 0) {
                tabButton("Home", "house", 0)
                tabButton("Ritten", "point.topleft.down.curvedto.point.bottomright.up", 1)
                tabButton("Rapporten", "chart.bar.xaxis", 2)
                tabButton("Mijn Jeep", "car.side", 3)
            }.padding(.top, 14).padding(.bottom, 8).background(panel)
        }
        .background(background.ignoresSafeArea()).foregroundColor(.white)
        .preferredColorScheme(.dark).tint(sand)
        .sheet(isPresented: $showChoice) { choiceSheet }
        .sheet(item: $selectedTrip) { trip in detail(trip) }
        .sheet(isPresented: $showFeedback) { ReviewFeedbackView(screen: feedbackContext ?? screenID) }
        .sheet(isPresented: $showTechnical) {
            NavigationView { technicalView().toolbar { ToolbarItem(placement: .confirmationAction) { Button("Gereed") { showTechnical = false } } } }
        }
        .alert("Voorbeeldrapport", isPresented: $reportPreview) {
            Button("Begrepen", role: .cancel) {}
        } message: { Text("Dit scherm laat de vormgeving zien. Er wordt nog geen rapport gegenereerd of verstuurd.") }
    }

    private var home: some View {
        VStack(alignment: .leading, spacing: 22) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 5) {
                    Text("ELKE RIT. HELDER.").font(.system(size: 10, weight: .semibold, design: .monospaced)).tracking(2).foregroundColor(sand)
                    Text("RitKompas").font(.system(size: 36, weight: .bold, design: .rounded)).tracking(-1.5)
                }
                Spacer()
                Image(systemName: "location.north.circle").font(.system(size: 38, weight: .ultraLight)).foregroundColor(sand)
            }
            hero
            VStack(alignment: .leading, spacing: 12) {
                Text("Snelvoorkeur · ontwerpproef").font(.system(size: 14, weight: .semibold))
                HStack(spacing: 12) {
                    ForEach(["Zakelijk", "Privé"], id: \.self) { kind in
                        Button { quickPreference = kind } label: {
                            Label(kind, systemImage: classificationSymbol(kind))
                                .font(.system(size: 14, weight: .semibold))
                                .frame(maxWidth: .infinity).padding(.vertical, 13)
                                .foregroundColor(quickPreference == kind ? background : .white)
                                .background(quickPreference == kind ? sand : panel).cornerRadius(12)
                        }
                        .accessibilityAddTraits(quickPreference == kind ? .isSelected : [])
                        .accessibilityIdentifier("review.preference.\(kind)")
                    }
                }
                Text(quickPreference.map { "Snelvoorkeur: \($0). Kies bij het ritvoorbeeld nog expliciet het type." } ?? "Nog geen snelvoorkeur gekozen.")
                    .font(.system(size: 12)).foregroundColor(muted)
                Text("Alleen zolang deze ontwerpproef open is. Dit start of classificeert geen echte rit.")
                    .font(.system(size: 12)).foregroundColor(muted)
                if quickPreference != nil { Button("Wis snelvoorkeur") { quickPreference = nil }.font(.system(size: 12)) }
            }
            HStack {
                Label("Jouw Jeep, jouw overzicht", systemImage: "car.side").font(.system(size: 13, weight: .medium))
                Spacer()
                Text("4xe").font(.system(size: 13, weight: .bold, design: .rounded)).foregroundColor(green)
            }
            if driving {
                VStack(alignment: .leading, spacing: 14) {
                    HStack { Label("Voorbeeldrit actief", systemImage: "circle.inset.filled").foregroundColor(green); Spacer(); badge(classification) }
                    Text("Zo ziet een actieve rit eruit.").font(.system(size: 21, weight: .semibold))
                    Text("Geen GPS, afstandsmeting of achtergrondregistratie in deze ontwerpproef.").font(.system(size: 13)).foregroundColor(muted)
                    action("Voorbeeldrit beëindigen", "stop.circle") { driving = false }
                }.padding(18).background(panel).cornerRadius(22)
            } else {
                VStack(alignment: .leading, spacing: 15) {
                    HStack { Text("Klaar voor de volgende rit").font(.system(size: 20, weight: .semibold)); Spacer(); Image(systemName: "arrow.up.right").foregroundColor(sand) }
                    Text("Rust onderweg. Overzicht achteraf.").font(.system(size: 14)).foregroundColor(muted)
                    action("Probeer een voorbeeldrit", "play.fill") { showChoice = true }
                }.padding(18).background(panel).cornerRadius(22)
            }
            HStack(spacing: 12) {
                metric("Deze maand · demo", "842", "km")
                metric("Zakelijk · demo", "68", "%")
            }
            sectionTitle("Laatste rit", trailing: "Bekijk alles") { tab = 1 }
            tripRow(ReviewTrip.examples[0])
        }
    }

    private var hero: some View {
        ZStack(alignment: .bottomLeading) {
            GeometryReader { proxy in
                if let path = Bundle.main.path(forResource: "PrivateJeep", ofType: "jpg"), let photo = UIImage(contentsOfFile: path) {
                    Image(uiImage: photo).resizable().scaledToFill().frame(width: proxy.size.width, height: proxy.size.height).clipped()
                } else {
                    LinearGradient(colors: [panel, .black], startPoint: .topLeading, endPoint: .bottomTrailing)
                    Image(systemName: "car.side.hill.up.fill").font(.system(size: 72)).foregroundColor(sand.opacity(0.7)).frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
            LinearGradient(colors: [.clear, .black.opacity(0.12), .black.opacity(0.85)], startPoint: .top, endPoint: .bottom)
            VStack(alignment: .leading, spacing: 6) {
                Text("BUILT FOR YOUR JOURNEY").font(.system(size: 9, weight: .semibold, design: .monospaced)).tracking(2.2).foregroundColor(sand)
                Text("Mijn Jeep").font(.system(size: 28, weight: .semibold, design: .rounded))
                Text("Wrangler 4xe · 2021").font(.system(size: 12)).foregroundColor(.white.opacity(0.8))
            }.padding(20)
        }.frame(height: 250).cornerRadius(24).overlay(RoundedRectangle(cornerRadius: 24).stroke(sand.opacity(0.14)))
    }

    private var trips: some View {
        VStack(alignment: .leading, spacing: 22) {
            title("Jouw ritten", subtitle: "Overzichtelijk, tot de laatste kilometer.")
            HStack(spacing: 6) {
                ForEach(["Alle", "Zakelijk", "Privé"], id: \.self) { item in
                    Button { filter = item } label: {
                        Label(item, systemImage: item == "Alle" ? "list.bullet" : classificationSymbol(item)).font(.system(size: 13, weight: .semibold)).frame(maxWidth: .infinity).padding(.vertical, 11)
                            .background(filter == item ? sand : panel).foregroundColor(filter == item ? background : muted).cornerRadius(12)
                    }
                    .accessibilityAddTraits(filter == item ? .isSelected : [])
                    .accessibilityIdentifier("review.filter.\(item)")
                }
            }
            HStack { Text("VOORBEELDOVERZICHT").tracking(1.5); Spacer(); Text("\(ReviewTrip.examples.filter { filter == "Alle" || $0.kind == filter }.count) ritten") }.font(.system(size: 10, weight: .medium, design: .monospaced)).foregroundColor(muted)
            ForEach(ReviewTrip.examples.filter { filter == "Alle" || $0.kind == filter }) { trip in tripRow(trip) }
            Text("Tik op een rit voor details. Alle routes en cijfers hier zijn fictieve voorbeelden.").font(.system(size: 13)).foregroundColor(muted)
        }
    }

    private var reports: some View {
        VStack(alignment: .leading, spacing: 22) {
            title("Alles op een rij.", subtitle: "Van onderweg naar overzicht.")
            VStack(alignment: .leading, spacing: 20) {
                HStack { Text("Maandoverzicht").font(.system(size: 13, weight: .semibold)); Spacer(); Text("DEMO").font(.system(size: 10, design: .monospaced)) }
                Text("842 km").font(.system(size: 46, weight: .bold, design: .rounded)).tracking(-2)
                GeometryReader { proxy in
                    HStack(spacing: 4) { Capsule().fill(background).frame(width: proxy.size.width * 0.68); Capsule().fill(Color.white.opacity(0.5)) }
                }.frame(height: 15)
                HStack { Label("68% zakelijk", systemImage: classificationSymbol("Zakelijk")); Spacer(); Label("32% privé", systemImage: classificationSymbol("Privé")) }.font(.system(size: 12, weight: .medium))
                Divider().overlay(background.opacity(0.15))
                Text("Een helder overzicht voor je administratie.").font(.system(size: 16, weight: .medium))
                Text("Fictieve cijfers · geen fiscale controle of vergoeding berekend.").font(.system(size: 12)).opacity(0.7)
            }.foregroundColor(background).padding(24).background(sand).cornerRadius(24)
            action("Bekijk rapportvoorbeeld", "doc.text") { reportPreview = true }
            Text("De definitieve export en periodekeuze sluiten later aan op je echte ritten.").font(.system(size: 13)).foregroundColor(muted)
        }
    }

    private var myJeep: some View {
        VStack(alignment: .leading, spacing: 22) {
            title("Mijn Jeep", subtitle: "Gemaakt voor jouw Wrangler.")
            hero
            VStack(alignment: .leading, spacing: 12) {
                Text("Appaccent · ontwerpproef").font(.system(size: 16, weight: .semibold))
                Picker("Appaccent", selection: $accent) {
                    ForEach(ReviewAccent.allCases) { value in Text(value.rawValue).tag(value) }
                }.pickerStyle(.segmented)
                Text("Alleen voor deze geopende ontwerpproef. Niet bewaard of gesynchroniseerd.")
                    .font(.system(size: 12)).foregroundColor(muted)
            }.padding(18).background(panel).cornerRadius(20)
            VStack(spacing: 0) {
                info("Voertuig", "Wrangler 4xe", "car.side")
                info("Bouwjaar", "2021", "calendar")
                info("Verbinding", "Nog niet gekoppeld", "antenna.radiowaves.left.and.right")
                info("Ritdetectie", "Nog in ontwikkeling", "location")
                info("CarPlay / OBD2", "Nog niet getest", "cable.connector")
            }.padding(.horizontal, 16).background(panel).cornerRadius(20)
            Button { showTechnical = true } label: {
                HStack { Label("Technische voorbereiding", systemImage: "slider.horizontal.3"); Spacer(); Image(systemName: "chevron.right") }.font(.system(size: 14)).padding(18).background(panel).cornerRadius(16)
            }.foregroundColor(.white)
            action("Vertel wat je wilt aanpassen", "square.and.pencil") { feedbackContext = screenID; showFeedback = true }
        }
    }

    private var choiceSheet: some View {
        VStack(alignment: .leading, spacing: 24) {
            Text("06 · Voorbeeldrit").font(.system(size: 11, design: .monospaced)).foregroundColor(sand)
            Text("Wat voor rit\nwordt dit?").font(.system(size: 36, weight: .bold, design: .rounded))
            Text("Probeer de keuze voor Zakelijk of Privé. Er wordt geen echte rit gestart of opgeslagen.").foregroundColor(muted)
            ForEach(["Zakelijk", "Privé"], id: \.self) { kind in
                action(kind, classificationSymbol(kind)) { classification = kind; driving = true; showChoice = false }
            }
            Button("Annuleren") { showChoice = false }.frame(maxWidth: .infinity)
            Spacer()
        }.padding(28).padding(.top, 25).frame(maxWidth: .infinity).background(background).foregroundColor(.white).preferredColorScheme(.dark)
    }

    private func detail(_ trip: ReviewTrip) -> some View {
        VStack(alignment: .leading, spacing: 22) {
            HStack { Text("03 · Ritdetails").font(.system(size: 11, design: .monospaced)).foregroundColor(sand); Spacer(); Button("Gereed") { selectedTrip = nil } }
            Text(trip.route).font(.system(size: 30, weight: .bold, design: .rounded))
            Text("Fictieve voorbeeldrit · geen echte locatiegeschiedenis").font(.system(size: 13)).foregroundColor(muted)
            ZStack {
                RoundedRectangle(cornerRadius: 22).fill(panel)
                VStack(spacing: 16) { Image(systemName: "point.topleft.down.curvedto.point.bottomright.up").font(.system(size: 66, weight: .ultraLight)).foregroundColor(sand); Text("Hier komt jouw opgenomen route").font(.system(size: 13)); Text("Geen verzonnen kaartspoor").font(.system(size: 11)).foregroundColor(muted) }
            }.frame(height: 200)
            HStack { metric("Afstand", trip.distance, "km"); metric("Duur", trip.duration, "min") }
            HStack { Text("Classificatie"); Spacer(); badge(trip.kind) }.padding(18).background(panel).cornerRadius(16)
            Button { selectedTrip = nil; feedbackContext = "03 · Ritdetails"; showFeedback = true } label: { Label("Opmerking over ritdetails", systemImage: "bubble.left").font(.system(size: 14)) }
            Spacer()
        }.padding(24).padding(.top, 16).background(background).foregroundColor(.white).preferredColorScheme(.dark)
    }

    private func title(_ text: String, subtitle: String) -> some View {
        VStack(alignment: .leading, spacing: 8) { Text(text).font(.system(size: 34, weight: .bold, design: .rounded)).tracking(-1); Text(subtitle).font(.system(size: 14)).foregroundColor(muted) }
    }
    private func tabButton(_ label: String, _ icon: String, _ index: Int) -> some View {
        Button { tab = index } label: {
            VStack(spacing: 6) { Image(systemName: icon).font(.system(size: 20)); Text(label).font(.system(size: 10, weight: .medium)) }.foregroundColor(tab == index ? sand : muted).frame(maxWidth: .infinity)
        }.accessibilityIdentifier("review.tab.\(index)")
            .accessibilityAddTraits(tab == index ? .isSelected : [])
    }
    private func action(_ text: String, _ icon: String, perform: @escaping () -> Void) -> some View {
        Button(action: perform) { HStack { Image(systemName: icon); Text(text).fontWeight(.semibold); Spacer(); Image(systemName: "arrow.right") }.font(.system(size: 14)).padding(17).foregroundColor(background).background(sand).cornerRadius(14) }
    }
    private func metric(_ label: String, _ value: String, _ unit: String) -> some View {
        VStack(alignment: .leading, spacing: 8) { Text(label).font(.system(size: 11)).foregroundColor(muted); HStack(alignment: .firstTextBaseline, spacing: 4) { Text(value).font(.system(size: 28, weight: .semibold, design: .rounded)); Text(unit).font(.system(size: 12)).foregroundColor(sand) } }.frame(maxWidth: .infinity, alignment: .leading).padding(17).background(panel).cornerRadius(18)
    }
    private func classificationSymbol(_ kind: String) -> String {
        switch kind {
        case "Zakelijk": return "briefcase"
        case "Privé": return "house"
        default: return "questionmark.circle"
        }
    }
    private func badge(_ kind: String) -> some View {
        Label(kind, systemImage: classificationSymbol(kind)).font(.system(size: 10, weight: .semibold)).padding(.horizontal, 9).padding(.vertical, 6).foregroundColor(kind == "Zakelijk" ? sand : green).background((kind == "Zakelijk" ? sand : green).opacity(0.12)).cornerRadius(8)
    }
    private func tripRow(_ trip: ReviewTrip) -> some View {
        Button { selectedTrip = trip } label: {
            HStack(spacing: 14) {
                Image(systemName: "location.circle").font(.system(size: 28, weight: .ultraLight)).foregroundColor(sand)
                VStack(alignment: .leading, spacing: 8) { Text(trip.route).font(.system(size: 14, weight: .medium)).foregroundColor(.white); Text("\(trip.time) · \(trip.distance) km · demo").font(.system(size: 11)).foregroundColor(muted); badge(trip.kind) }
                Spacer(); Image(systemName: "chevron.right").font(.system(size: 11)).foregroundColor(muted)
            }.padding(16).background(panel).cornerRadius(18)
        }
    }
    private func sectionTitle(_ title: String, trailing: String, perform: @escaping () -> Void) -> some View {
        HStack { Text(title).font(.system(size: 18, weight: .semibold)); Spacer(); Button(trailing, action: perform).font(.system(size: 12)).foregroundColor(sand) }
    }
    private func info(_ key: String, _ value: String, _ icon: String) -> some View {
        HStack { Image(systemName: icon).frame(width: 22).foregroundColor(sand); Text(key).foregroundColor(muted); Spacer(); Text(value) }.font(.system(size: 12)).padding(.vertical, 16)
    }
}

private enum ReviewAccent: String, CaseIterable, Identifiable, Hashable {
    case sand = "Zand", olive = "Olijf", slate = "Leisteen"
    var id: String { rawValue }
    var color: Color {
        switch self {
        case .sand: return Color(red: 0.84, green: 0.76, blue: 0.62)
        case .olive: return Color(red: 0.72, green: 0.78, blue: 0.57)
        case .slate: return Color(red: 0.68, green: 0.78, blue: 0.85)
        }
    }
}

private struct ReviewTrip: Identifiable {
    let id: Int
    let route: String
    let time: String
    let distance: String
    let duration: String
    let kind: String
    static let examples = [
        ReviewTrip(id: 1, route: "Utrecht → Amersfoort", time: "08:12 – 08:47", distance: "35", duration: "35", kind: "Zakelijk"),
        ReviewTrip(id: 2, route: "Amersfoort → Utrecht", time: "12:05 – 12:37", distance: "28", duration: "32", kind: "Privé"),
        ReviewTrip(id: 3, route: "Utrecht → Nieuwegein", time: "14:20 – 14:43", distance: "22", duration: "23", kind: "Zakelijk")
    ]
}

private struct ReviewFeedbackView: View {
    let screen: String
    @Environment(\.dismiss) private var dismiss
    @AppStorage("ritkompas.designReviewNotes.v1") private var savedNotes = ""
    @State private var notes = ""
    @State private var saved = false
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Opmerkingen bij het ontwerp")) {
                    Text("Schrijf bijvoorbeeld: ‘01 Home: foto hoger’ of ‘03 Ritdetails: grotere letters’.")
                    Text("Huidig scherm: \(screen)").font(.caption)
                    TextEditor(text: $notes).frame(minHeight: 210).accessibilityLabel("Ontwerpfeedback")
                }
                Section {
                    Button("Bewaar op deze test-iPhone") { savedNotes = notes; saved = true }
                    if saved { Text("Lokaal bewaard. Nog niet met de ontwikkelaar gedeeld.").foregroundColor(.green) }
                    ShareLinkCompat(text: notes)
                } footer: { Text("Geen adressen, ritgegevens of aanmeldcodes invoeren. Feedback blijft lokaal tenzij je zelf deelt.") }
            }.navigationTitle("Jouw aanwijzingen")
                .toolbar { ToolbarItem(placement: .confirmationAction) { Button("Gereed") { dismiss() } } }
                .onAppear { notes = savedNotes }
        }.preferredColorScheme(.dark)
    }
}

private struct ShareLinkCompat: View {
    let text: String
    @State private var showing = false
    var body: some View {
        Button("Deel mijn opmerkingen…") { showing = true }.disabled(text.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty)
            .sheet(isPresented: $showing) { ReviewShareSheet(text: text) }
    }
}
private struct ReviewShareSheet: UIViewControllerRepresentable {
    let text: String
    func makeUIViewController(context: Context) -> UIActivityViewController { UIActivityViewController(activityItems: [text], applicationActivities: nil) }
    func updateUIViewController(_ controller: UIActivityViewController, context: Context) {}
}
