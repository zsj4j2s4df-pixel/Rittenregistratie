# Eerste native apphost — nog geen werkende ritdetectie

## Actueel 24 oktober 2026 — native Supabase-bron bijgewerkt

De accountview ondersteunt nu servergekozen Access of Supabase, strikte cookies,
refresh, opt-in Keychain en lokaal sluiten vóór logout. 79 kernproeven en unsigned
generic iOS-devicebuild PASS. Dit is bijgewerkte bron, geen fysieke installatie.
Live blijft Access; Supabase-accountacceptatie/activering staan nog open.
Leidend bewijs en hervatplan: [Supabase-uitvoering](../../docs/TRANSFER/SUPABASE_EXECUTION_2026-10-24.md).
Het actuele blijvende project staat onder work/ritkompas-current-20261024/ios/.
Oudere beschrijvingen hieronder zijn historie, niet de huidige authstatus.

## Beoordeelbaar ontwerp

De host opent nu een geïsoleerde SwiftUI-ontwerpproef: Home, Ritten/filter/details, Rapporten, Mijn Jeep, voorbeeldclassificatie en lokale ontwerpfeedback met expliciet iOS-deelvenster. Alle ritten/cijfers zijn fictief; knoppen starten geen GPS/netwerk/meldingen of echte registratie. De bestaande technische voorbereidingsinterface blijft onder Mijn Jeep bereikbaar. Zie `docs/TRANSFER/MAC_REVIEW_PROTOTYPE_2026-10-20.md` voor werkelijk Mac-bewijs en verdeling met Cloud.

Optionele eigenaarsfoto: plaats uitsluitend lokaal `PrivateJeep.jpg` in deze appbronmap; dit bestand is genegeerd en mag niet worden gecommit/geüpload. Zonder foto toont de app een ingebouwde symbolische achtergrond. Deel geen screenshots/appbundles met privéfoto openbaar. Nativefeedback staat alleen lokaal in UserDefaults en bevat geen aanmeld- of ritgegevens; delen gebeurt alleen via expliciete gebruikeractie.

Oudere beschrijving hieronder gaat over de behouden technische voorbereidingsview, niet over alle nieuwe ontwerpschermen. De ontwerpproef is geen activering van PR52-nativeauth.

Open `RitKompasApp.xcodeproj` in Xcode. De ene app-target gebruikt het bestaande lokale Swiftpackage in de bovenliggende `ios`-map; Core/UI worden niet gekopieerd. Geen externe dependencies, Apple-account, certificaten, CarPlay-entitlement of achtergrondmodi toegevoegd. iPhone-doel vanaf iOS15, Swift6; echte toestelcompatibiliteit blijft te testen.

Deze host toont alleen de bestaande, duidelijk gemarkeerde voorbereidingsinterface. De locatieknop vraagt pas na expliciete gebruikersactie toestemming tijdens gebruik; het scherm meet/verstuurt geen locaties. Het toevoegen van een privacytoelichting bewijst geen capture-, auth-, queue/delegate- of ritregistratie-integratie.

Reproduceerbare buildcontrole zonder signing of installatie, vanaf repositoryroot:

```sh
xcodebuild -project ios/RitKompasApp/RitKompasApp.xcodeproj -scheme RitKompasApp -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath /private/tmp/ritkompas-app-derived build CODE_SIGNING_ALLOWED=NO
```

Gebruik voor nieuwe runs een eigen lege tijdelijke derivedData-map; geen bestaand werk overschrijven. Een generieke build is geen simulatoruitvoering. `com.example.RitKompasApp` is uitsluitend een lokale placeholder, geen geregistreerde of definitieve app-identiteit. Geen automatische signing/provisioning aanzetten of op een fysieke iPhone installeren zonder de juiste eigenaarbeslissing en persoonlijke Apple-inrichting. Betaald programma/CarPlay-goedkeuring niet als beschikbaar aannemen.
