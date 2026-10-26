# Automatische ritstart — beoordeling en eerste brondelta, 26 oktober 2026

Exact ontvangen basis PR69/bce7f5d9214ae18737890badfc1094e0de84cf47. Lees het ongewijzigde OWNER_REQUEST.md in deze map. Geen afgeronde Macbouw/SMTP/huisstijl/Accesswerk opnieuw gedaan. Geen live- of accountwijziging in deze groep; Ingrid-uitnodigingsopdracht op PR68 blijft apart open totdat daadwerkelijk uitgevoerd.

## Gevonden vóór bouwen

- NativeCaptureView: echte CLLocationManager, alleen expliciet tijdens gebruik/WhenInUse, geen Always-aanvraag/backgroundmode; versleutelde NativeCaptureOutbox, expliciete verzending van observaties, nog geen definitieve autorit. ForegroundMotionDetector gebruikt snelheid/kwaliteit/gaten en120secondenstopkandidaten; elektromotor niet uitgesloten.
- TripChoiceNotifications en delegate: twee lokale actieknoppen zonder foreground/authenticationRequired, geen persoonsgegevens op lockscreen; duurzame sessie-/voertuig-/revisiegebonden queue en exacte receipts. PendingTripChoiceProducer leest echte geautoriseerde backendvoorstellen, melding alleen na expliciete bediening. Geen nieuwe meldingsbron nodig.
- Native Supabase-sessie/rechten, voertuigkeuze, actorbinding, encrypted queue en backend review/materialisatie/synchronisatie bestaan. Geen backendautoriteit afleiden uit Bluetoothnaam, notificationpayload, Siri of e-mailadres.
- Geen Bluetoothautoradio-trigger, achtergrondopname, automatische start/eindritpipeline, App Intents of betrouwbare driepersoon/hardwareacceptatie in huidige bron. Bestaande unresolved voorstellen zijn bewust niet automatisch privé.

## Gebouwd in deze eerste delta

Twee iOS16+-AppIntents met appgebonden zinnen ‘Privé rit met RitKompas’ en ‘Zakelijke rit met RitKompas’, zonder appopenflag en met OS-lockscreenuitvoering toegestaan. Korte losse zinnen kunnen als persoonlijke Opdrachtnaam worden ingesteld; universele herkenning zonder appnaam niet claimen. iOS15 blijft ondersteund zonder AppIntents.

Alleen expliciete stemkeuze: eerst actuele geverifieerde pendingfeed, exact één resultaat, geen moreAvailable/truncatie, account/voertuig/revisiecontrole. Daarna bestaande duurzame queue zonder extra melding en zonder nieuwe automatische HTTP-write. Meer/geen voorstellen, netwerk-, disk-, sessie- of accountprobleem betekent weigering. Centrale verzending blijft apart bevestigd; Siri spreekt geen onterechte ‘centraal opgeslagen’. Host koppelt bridge alleen na echte sessie en wist hem vóór voertuig-/accountwisseling/logout. Geen extra credentialsopslag of authenticatieversoepeling.

Dit is bronvoorbereiding, geen complete automatische ritstart en geen bewezen Siri-/lockscreenruntime. Koude processtart heeft nog geen geverifieerde hostcontext en weigert eerlijk; geen stille keychain- of accountfallback. Ook exact één open voorstel kan een oude rit zijn: de Siri-actie betreft de enige open ritkeuze, niet bewezen ‘de huidige autorit’. Een actieve-ritselectie hoort bij de volgende coördinatiegroep.

## Apple-beperkingen en gecontroleerde bronnen

Geraadpleegd26oktober: Apple AppIntent.authenticationPolicy (default alwaysAllowed, ook locked), https://developer.apple.com/documentation/appintents/appintent/authenticationpolicy ; AVAudioSession.routeChangeNotification, https://developer.apple.com/documentation/avfaudio/avaudiosession/routechangenotification ; persoonlijke Bluetoothinstellingstriggers, https://support.apple.com/guide/shortcuts/setting-triggers-apde31e9638b/ios . Apple documentatie-JSON daadwerkelijk gelezen voor de eerste twee.

Audio-routewijzigingen zijn geen algemene Bluetooth-identiteits-/wake-API en bewijzen geen bestuurder/auto. CoreBluetooth BLE niet presenteren als autoradio-Classic-Bluetoothmonitor. Geen stille audio/backgroundtruc om het proces wakker te houden. Onderzoek op echte telefoon persoonlijke Bluetooth/CarPlay-Opdrachtenautomatisering (verbinden én het werkelijk ondersteunde einde), iOSversie, vergrendeling, killswitch/forcequit en toestemming. Verbreektrigger of altijd-run niet zonder runtimebewijs beloven. Geen eigen CarPlay-scherm of entitlement aanvragen.

## Gerichte Mac-uitvoering nu

1. Neem deze opvolgende bron boven PR69 over zonder huidig werk te verliezen. Swiftpackage test, iOS16/actuele SDK-semantiek, unsigned device/simulatorbuild en AppShortcutsmetadata-extractie uitvoeren. Nieuwe3XCTestmethodes inclusief twee keuzes, lege/meervoudige/truncatedfeed en accountwisseling/clear tijdens response. Voeg gerichte echte tests toe voor diskfailure, dubbele stemkeuze/exactretry, oude keuze/materiaalstatus en logout tijdens registratie waar nog niet gedekt. Cloud kan geen Applecompileclaim leveren; herstel concrete bronfouten en lever bewijs in eigen draftPR.
2. Simulator: AppIntents zichtbaar, appnaamzinnen, ontbrekende sessie eerlijk geweigerd; echte lokale geverifieerde pendingcontext als synthetische fixture zonder live neprit. Geen app openen door succesvolle actie. Geen stale handler na logout/voertuigwisseling. Lokale queue != serverack expliciet.
3. Echte iPhone met eigenaar: meldingen na uitleg/toestemming, actieknoppen vergrendeld, Focus, backgroundtijd, na eerste unlock, herstart/forcequit, offline, Keychain/diskbescherming. Siri-/CarPlay-stemtoegang alleen testen indien door eigenaar toegestaan; persoonlijke instellingen niet namens hem verzwakken. iPhone15 versus16+-availability correct. Dennis/Ingrid/Jesse elk afzonderlijke eigen sessie/instellingen; ontbrekende accounts eerst bestaande provisioningopdracht uitvoeren, geen shared Jesse-login.
4. Leg uitvoerbare persoonlijke Opdrachtenroute voor verbinden/einde met Jeep vast. Als iOS dit niet levert: expliciete start/stop als eerlijke terugval; geen permanentautomatischclaim. Geen OBD2-aankoop of nieuwe koppeling.

## Volgende broncyclus — nog OPEN, niet door document afgerond

- AUTO-01: per gebruiker/voertuig opt-in en geverifieerde actieve sessie + echte triggeradapter met expliciete provenance; passagiers-/meerdere-iPhone-deduplicatie via bestaande centrale coördinatie, geen eigenaarprioriteit=bestuurder.
- AUTO-02: duurzame actieve rit/lifecycle met begintijd en eerste echte geldige locatie (bij ontbrekende GPS ‘onbekend’, nooit verzinnen), herstel na crash, geen dubbele start. In deze expliciet nieuwe automatische flow is ‘privé-eerst’ door eigenaar opgedragen: nieuwe rit standaardprivé met auditbron ‘standaard’ onderscheiden van expliciete keuze; bestaande unresolved reviewvoorstellen/historische ritten NIET massaal privé maken. Ruwe detectie alleen blijft onbetrouwbaar bewijs, geen fiscale goedkeuring.
- AUTO-03: Always-/achtergrondlocatie pas na uitleg/opt-in en correcte plist/capability. Machtigingen niet in init/Bluetoothcallback aanvragen. Accu/precisie/privacy en routegaten controleren; ontbrekende toestemming blokkeert opnames eerlijk.
- AUTO-04: melding aan duurzame echte actieve rit binden, stemactie dezelfde expliciete sessie/revisiecontext; coldstartveilige bootstrap zonder gedeelde credentials. Timeout/dismiss behoudt standaardprivé alleen voor de nieuwe opt-in-flow, geen keuze namens gebruiker fabriceren.
- AUTO-05: disconnectdebounce/120seconden-klantstop/EV/reconnect, eindtijd/locatie/GPSafstand met qualitygapmarkering, geen kilometertellerclaim. Verbindingsverlies alleen is geen zekere complete rit. Bestaande review/idempotentie/audit/immutable history behouden.
- AUTO-06: queued exact retry en serverack voor definitieve start/stop/classificatie, conflict409/revocation403/accountwissel/offline/crash/relaunch; centrale dubbele opnames van gezinsleden samen beoordelen. Geen automatische definitieve ritmaterialisatie zonder bewezen coördinatie en juiste bestuurder.

Geen wijzigingen aan Cloudflare/Supabase/production, geen nieuwe afhankelijkheden/signing/accounts/kosten/mainmerge. Native build/hardware is de huidige echte grens van Cloud, niet bewijs dat de overige eisen onmogelijk of afgerond zijn.

## Werkelijk Cloud-testbewijs

312 bestaande Node-tests PASS; TypeScript en volledige ESLint PASS via bestaande dependencies met bytegelijke lockfile. Eerste Node-run zonder gekoppelde dependencies gaf311PASS/1module-resolutiefout; na herstel312PASS. pnpm-wrapper weigerde gedeelde modulesmap te vervangen; geen installatie uitgevoerd, officiële lokale tsc/eslint-binaries rechtstreeks gebruikt. Nieuwe Swiftcode/XCTest/AppIntents NIET gecompileerd of uitgevoerd: geen Swift/Xcode in deze Cloudruntime. De312Node-tests zijn uitsluitend web/backendregressie, geen bewijs voor nieuwe Siri-/nativefunctionaliteit. Beperkte patrooncontrole471bestanden/1234historischeblobs zonder bevindingen; geen volledige securitygarantie. Geen webbuild herhaald voor uitsluitend nieuwe Swift/docs.
