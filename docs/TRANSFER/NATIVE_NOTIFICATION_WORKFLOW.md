# Native meldingsworkflow — Cloud-brongroep, 20 oktober 2026

Basis: PR52, exact `f1d73cdc86bf32a61970caeff51276594b19cbaa` (tree `6047036233246af07a4f391cf41e5e90240ece44`). Geen productiepublicatie of databasewijziging. Mac reserveert `ContentView.swift` en `ReviewPrototypeView.swift` voor het klikbare prototype; beide bestanden zijn in deze Cloud-groep ongemoeid gelaten. Jeepfoto uitsluitend lokaal/ignored, nooit uploaden. Eigenaar kiest eerst gratis Mac-testen, geen TestFlightabonnement of aankoop.

## Wat is gebouwd

- Eén app-lifetime UIApplicationDelegate behoudt de notificationdelegate en het model; EnvironmentObject wordt aan de bestaande ContentView toegevoegd zonder die view te veranderen.
- Core-workflow bewaart een werkelijk servergelezen pending context vóór OS-scheduling. Een payload uit een notificatie kan zelf geen pending voorstel aanmaken. Geen keuze op open/dismiss/onbekende actie. Strikte decoder weigert booleans, fracties, ongeldige IDs en revisies.
- Expliciete Zakelijk/Privé-response wacht op duurzame lokale opslag voordat de OS-callback terugkeert. Dubbele gelijke keuze houdt dezelfde requestID; tegengestelde keuze blijft conflict. Geen automatische HTTP/delivery. Handmatige delivery blijft de bestaande receiptvaliderende route.
- Schedulingfout behoudt het onbesliste voorstel. Keuze tijdens asynchronous OS-add verwijdert ook de daarna toegevoegde melding. Melding wordt pas na lokaal bewaarde keuze verwijderd. OS-identifiers bevatten de revisie: opruimen van een oude callback verwijdert geen nieuwere revisiemelding.
- Apart meldingenbeheer leest status, vraagt uitsluitend na knop toestemming en controleert opnieuw bij foreground. Startup registreert alleen categorieën. Geen achtergrondlocatie, pushregistratie of extra entitlement.
- Host bouwt één queue/persistence-owner, maar gebruikt bewust de gesloten sessiebinding en gesloten transport. Constructie leest geen Keychain en maakt geen opslag aan. Zonder echte native auth/serverpending-producer wordt geen echte keuze opgeslagen/verstuurd en wordt geen echte ritmelding gepland.

## Bewijs en grenzen

Cloud: 257/257 bestaande Node-tests PASS; TypeScript en volledige lint PASS. Acht nieuwe Swift-XCTestgevallen voorbereid voor opslagfalen vóór OS-add, permissionfailure/retry, onbekend voorstel, open/dismiss, dubbele/conflicterende keuze, late OS-add na keuze, gesloten sessie en strikte payloaddecoder. Beperkte patroonscan: 342 bestanden/781 historische blobs, geen bevindingen; geen volledige geheimen- of securitygarantie. Swift/Apple-SDK/runtime van deze delta NIET GETEST in Cloud: Swift ontbreekt. Bronreview is geen runtimebewijs. Bestaande webbuild is ongewijzigd; geen nieuwe releaseupload.

Mac meldt afzonderlijk voor ongewijzigde PR52: 23 echte macOS-XCTest, Corebuild, iOS Core/UI semantiek en beide unsigned hostbuilds PASS. Dit is ontvangen via overdracht; bij schrijven nog geen nieuwe Mac-bewijscommit opgegeven. Die pass geldt niet voor deze nieuwe meldingsdelta. Eerdere Mac-proeven behouden; geen oude toolchaininstallatie, licentie- of lockvraag herhalen.

## Gerichte opdracht aan Codex Mac

1. Neem deze Cloud-draft exact over in een geïsoleerde checkout; behoud je eigen prototypegroep en PR52 als echte voorouder. Integreer beide deltas zonder ContentView/ReviewPrototypeView of lokale foto te overschrijven. Geen mainmerge of livepublicatie.
2. Voer `node scripts/check-native-readiness.mjs --run` uit voor de gewijzigde Core/UI. Verwacht acht extra `ChoiceWorkflowTests` boven de 23 bestaande macOS-tests; rapporteer werkelijke aantallen/fouten. Dit compileert/test nieuwe bron, geen herhaalde nulmeting. Bouw de bestaande unsigned device- en simulatorhost met dezelfde bekende scheme/SDK-opties; geen provisioningupdates, signingteam of accounts aanpassen.
3. Controleer met de nieuwe simulatorbuild: starten vraagt GEEN meldings- of locatietoestemming. Open voorbereiding → Meldingen beheren (of voeg in jouw gereserveerde prototype een link naar `NativeNotificationPreparationView()` toe met het reeds geïnjecteerde model). Statusknop vraagt geen toestemming; alleen de knop Meldingen toestaan mag de OS-vraag openen. Toestaan/weigeren, achtergrond/voorgrond en relaunch moeten echte status tonen. Gebruik uitsluitend de geïsoleerde simulator; wis geen bestaande gebruikersdata om een pass af te dwingen.
4. Controleer met echte iOS-SDK de delegate en actie-decoding: business/private, default/dismiss, vreemde categorie/actie, boolean/fractionele revisie. Alleen synthetische context; geen echte claims/tokens in logs. Gesloten host moet een synthetische/forged keuze afwijzen; geen pending-registratie vanuit payload, geen netwerk of fake opgeslagen-status. Foreground banner/OS-action runtime apart alleen met veilige lokale testfixture, nooit door shipping-hostdefault open te zetten. Noteer NIET GETEST als de fixture/runtime ontbreekt.
5. Leg exact head/tree, nieuwe XCTest/buildresultaten en beperkte simulatorwaarnemingen in opvolgende draft vast. Geen fysieke iPhone/GPS/login/betrouwbare achtergrondmelding/Jeep/CarPlay/OBD2-pass afleiden. Gratis fysieke installatie en Apple-identiteit/distributie blijven jouw aparte eigenaarafstemming; geen downloadlink claimen vóór werkelijke installeerbare build.

## Volgende bronwerk

Echte native browserauth/secure credentialprovider en expliciete sessiebootstrap blijven open. De nieuwe sessionroute uit PR52 is niet live; gebruik geen echte credentials tegen die toekomstige route. Daarna één gedeelde geverifieerde sessie aan queue én APIClient binden, APIClient sluiten bij logout/accountwisseling, serverpending-producer koppelen en capture/lifecycle aansluiten. Geen automatische start/einde of betrouwbare achtergrondafhandeling claimen vóór iPhone/Jeep-proeven; verloren melding blijft onbeslist. Bestaande M27/123 eisen blijven gelden.

Rollback van deze bronproef: terug naar exacte PR52 in een aparte checkout; live Worker/DB/Access blijven ongewijzigd. Geen DB-restore, migratie, beveiligingsversoepeling of nieuwe liveactie nodig.
