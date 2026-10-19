# Swift/iOS — broncodevoorbereiding voor de bestaande backend

19 oktober 2026. In de gedeelde repository zijn vóór deze taak geen `.swift`-bestanden, `ios/`-app of Xcode-project gevonden. Wel gelezen: de bestaande iPhone-/locatie-/CarPlay-eisen, `docs/MAC_SNAPSHOT_2026-10-18/docs/IOS_ONDERZOEK.md`, de Access/iPhone-overdracht en de actuele device-/detectieservicecontracten. Dit is een kleine integreerbare bronmodule, geen tweede app, geïnstalleerde build of afgeronde native client.

## Toegevoegde broncode

| Pad onder `ios/RitKompas/` | Functie |
| --- | --- |
| `Core/BackendModels.swift` | Codable device-/voertuigmodellen en server-detectiecontract. Exacte backendveldnamen; Unix-seconden blijven gehele `Int64`-waarden. Geen `userId` in registratiemutaties. Ontbrekende locatie blijft afwezig. |
| `Core/SessionAccess.swift` | Exacte geconfigureerde HTTPS-origin en veilige padopbouw, getypeerde fouten, actor-protocol voor een later beoordeelde sessiekoppeling. Default `UnconfiguredSessionAccess` weigert iedere grant. |
| `Core/APIClient.swift` | URLSession-actor voor bestaande voertuig-/device-HTTP-contracten: beperkte paginatie, registratie met vaste requestId en deactivering met verwachte revisie/reden. Alleen iOS/macOS-bron; geen netwerkuitvoering in deze taak. |
| `UI/NativePreparationView.swift` | SwiftUI-voorbereidingsscherm met echte lokale toestemmingsstatus en levenscyclusmelding. Alleen expliciete when-in-use-toestemmingsvraag; geen locatieverzameling. |
| `Tests/ContractTests.swift` | Voorbereide XCTest-cases voor een toekomstige `RitKompasCore`-testtarget: origin/pad, device-Codable, detectie zonder verzonnen locatie/identiteit en default-deny-sessie. **NIET UITGEVOERD.** |

Geen `@main`, project/workspace, Package.swift, Info.plist, signingconfiguratie, entitlement of achtergrondmodus toegevoegd. Als op de Mac buiten deze repository al een native app bestaat, moeten deze bestanden daarin worden opgenomen; maak daarvoor geen parallelle app.

## Veilige netwerkgrens

De origin moet expliciet worden aangeleverd als één HTTPS-origin zonder pad, query, fragment of URL-gebruikersnaam/wachtwoord. Er is geen standaard productiehost en geen HTTP-uitzondering. URLSession behoudt systeem-TLS-controle; certificaatvalidatie wordt niet uitgezet. API-paden worden per segment opgebouwd, met afwijzing van separators, controltekens en dotsegmenten.

De client gebruikt een ephemeral sessie zonder automatische cookie-/credentialopslag of responsecache, weigert iedere redirect en controleert de response-origin en JSON-mediawaarde. Een succesvolle HTML-loginpagina wordt niet als API-data behandeld. Aanvragen zijn maximaal 16 KiB; reacties worden gestreamd met een grens van 4 MiB, zonder stil afkappen. Een beëindigde of geweigerde response annuleert de bijbehorende streamtask. Timeout en annulering zijn aanwezig, maar hun gedrag is **niet op iOS getest**.

Er is geen ingebouwd Access-token, service-token, wachtwoord, fake-userheader, Keychain-inhoud of loginimplementatie. Een later beoordeelde `SessionAccess`-actor moet daadwerkelijk een geverifieerde gebruikerssessie voor juist deze origin leveren, secure storage/refresh/logout verzorgen en de **interne viewer-ID bij dezelfde sessie** vaststellen. Dit is niet hetzelfde als een e-mailadres of provider-subject. Die ID gaat bij writes als `x-ritkompas-viewer` mee; Origin en custom CSRF-header volgen het bestaande HTTP-contract. Alleen authheaders `Authorization`, `Cookie` of `cf-access-jwt-assertion` kunnen vanuit die abstractie worden aangeleverd; identity-/Host-/Origin-overrides worden niet geaccepteerd. Dat is een technische grens voor de toekomstige koppeling, geen claim dat een native Access-flow hiermee al werkt.

HTTP 401/403/409/503 worden onderscheiden. Redirects worden niet gevolgd om stil opnieuw in te loggen. Er is geen automatische mutatieretry. De aanroeper moet de **zelfde onveranderde aanvraag met dezelfde requestId** bewaren bij onzekere response; opnieuw UUID's maken kan een nieuwe operatie veroorzaken. De module implementeert nog geen duurzame offlinewachtrij, accountwissel-UX of gebruikerskeuze voor lokale persoonsgegevensopslag.

## Backendgrens

Device-methoden spiegelen de bestaande losse deviceadapter: GET/POST `/api/vehicles/:vehicleId/devices`, PATCH `/api/vehicles/:vehicleId/devices/:deviceId`. Deze native taak wijzigt of mount geen endpoint. Controleer bij integratie dat de adapter in de bedoelde serverbuild werkelijk is gemount; een bijbehorende call kan nu nog 404 geven. `devices()`/`vehicles()` laden één expliciet begrensde pagina; een aanroepende UI moet verdere pagina's bewust aanbieden en mag een volle eerste pagina niet als volledige lijst presenteren.

`DetectionInput`/`DetectionObservation` volgen de aanwezige `lib/detection-service.ts`. Tijdens afronding bevestigde de hoofdontwikkelaar GET/POST `/api/vehicles/:vehicleId/devices/:deviceId/detections`. Conform de afgebakende opdracht zijn hiervoor nu geen aanvullende native calls toegevoegd; de Codable-contracten zijn beschikbaar voor die volgende integratiestap. De modellen kennen de bestaande bronlabels, maar de client genereert geen GPS-/Bluetooth-/CarPlay-events en bepaalt geen rit, bestuurder of zakelijke classificatie. Een device-ID blijft een app-instanceclaim, geen hardware-attestatie.

## Toestemming en levenscyclus

Het voorbereidingsscherm vraagt toestemming uitsluitend na een knopdruk, en alleen als de ontvangende app een niet-lege `NSLocationWhenInUseUsageDescription` heeft. Zonder die key blijft de vraag gesloten met een duidelijke melding. De ontvangende app moet de toelichting inhoudelijk laten aansluiten bij de werkelijk geïmplementeerde functie; deze taak voegt geen plist of toestemming buiten de expliciete knop toe.

Het scherm leest de huidige CoreLocation-autorisatie en toegestane precisie. Zonder toestemming toont het geen claim dat precieze locatie beschikbaar is. Het start geen location updates, vraagt geen always/background-toestemming en verzamelt/verstuurt geen punt. Bij terugkeer naar de voorgrond wordt de toestemmingsstatus opnieuw gelezen; bij niet-actieve lifecycle staat expliciet dat geen achtergrondregistratie of herstartgarantie beschikbaar is. De knop naar iOS-instellingen opent uitsluitend de systeeminstellingen van de app.

Bluetooth-trigger, CarPlay, OBD2, meldingen, energiegebruik, locatiegaten, app-termination/herstart en hardware-integratie blijven open. Een enumbronlabel of locatie-toestemming bewijst daarvan niets.

## Verificatie en vervolgstappen voor Mac

`command -v swift` leverde in deze Cloudomgeving geen Swift-toolchain op. **Swift parse/typecheck, XCTest, Xcode-build, simulator, signing, installatie en echte iPhone: NIET GETEST.** Er zijn geen dependencies/toolchain geïnstalleerd en geen accounts of nieuwe koppelingen aangemaakt. Node-tests kunnen deze Swift-broncode niet valideren; er wordt geen Node-pass als native bewijs opgevoerd.

Mac kan eerst zonder API-aanmelding de pure Foundation-bestanden controleren:

```sh
swiftc -typecheck ios/RitKompas/Core/BackendModels.swift ios/RitKompas/Core/SessionAccess.swift
```

Controleer daarna `APIClient.swift` met een actuele Apple-Swift-toolchain, inclusief strict-concurrencydiagnostiek, en neem de Core-bestanden op in de bestaande of afzonderlijk geautoriseerde `RitKompasCore`-target. Koppel de voorbereide XCTest-bron aan die target. URLSession.AsyncBytes vraagt in deze bron minimaal iOS 15/macOS 12; dat is een broncode-APIgrens, geen definitieve minimum-iOS-/hardwareacceptatie. De oorspronkelijke iPhone 11 Pro-en-nieuwer-doelstelling blijft behouden.

Integreer het SwiftUI-scherm pas in de bestaande app-target en verifieer echte permission/lifecycletoestanden. Stel vervolgens eerst de native providerlogin en sessie-/viewerbinding vast; bouw geen ad-hoc tokenkopie uit Safari, hardcoded token, webview-cookie-extractie of alternatieve authbypass. Test daarna HTTPS/redirectweigering/401/403/409/503, responseverlies met dezelfde requestId, gedeactiveerde registratie en accountwissel tegen de echte serveradapter. Volgende GPS-opnamewerk vereist een aparte gecontroleerde stap met expliciete toestemming en apparaattests; deze broncode activeert die niet.

## Rootcontrole na parallelle voorbereiding

De device- en detectieHTTP-adapters zijn inmiddels lokaal gemount en in draftPR23/24 opgeslagen. Dat bevestigt het backendpad, niet dat nativeURLSessionauth werkt. De Swiftmodule blijft zonder detectienetwerkmethode en zonder accountprovider; toevoegen kan na nativecompile en providerbinding. Root heeft de broncode gelezen; `command -v swift` opnieuw geenresultaat. Swift/XCTest/iOS blijven expliciet NIETGETEST.

## PR27: meldingsactiebronprototype

`Core/TripChoiceNotifications.swift` bereidt UNNotificationCategory met Zakelijk/Privé voor, zonder foregroundflag; explicit-in-app permissionvraag apart van categoriebinding. Lokale melding bevat geen klantadres/route. Default/dismiss classificeert niets. Structuur valideert ritvoorstel/voertuig/viewer/revisie maar vertrouwt userInfo niet als authority: een nog te implementeren actorstore moet geauthenticeerde lokale context en idempotente duurzame actie atomisch controleren. Defaultstore weigert alles. Er is nog geen delegatehost, duurzame queue, loginprovider, live backendwrite of automatisch sensortriggerpad aangesloten. Gemiste melding moet een bestaand reviewvoorstel behouden; de melding maakt zelf geen rit.

Swift-toolchain ontbreekt nog steeds: deze nieuwe bron is gelezen, **NIET GECOMPILEERD/GETEST**. Mac moet ook concurrency/SDKbeschikbaarheid, vergrendeldeacties, Focus/meldingenuit, dubbele/stale/accountwisselacties en korte achtergrondtijd testen voordat bruikbaarheid wordt bevestigd. Bronprototype is geen werkende iPhone-release of betrouwbare afleveringgarantie. Zie MAC-J03/04 in MAC_HARDWARE_TESTS.md.
