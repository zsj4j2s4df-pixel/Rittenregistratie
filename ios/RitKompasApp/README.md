# Eerste native apphost — nog geen werkende ritdetectie

Open `RitKompasApp.xcodeproj` in Xcode. De ene app-target gebruikt het bestaande lokale Swiftpackage in de bovenliggende `ios`-map; Core/UI worden niet gekopieerd. Geen externe dependencies, Apple-account, certificaten, CarPlay-entitlement of achtergrondmodi toegevoegd. iPhone-doel vanaf iOS15, Swift6; echte toestelcompatibiliteit blijft te testen.

Deze host toont alleen de bestaande, duidelijk gemarkeerde voorbereidingsinterface. De locatieknop vraagt pas na expliciete gebruikersactie toestemming tijdens gebruik; het scherm meet/verstuurt geen locaties. Het toevoegen van een privacytoelichting bewijst geen capture-, auth-, queue/delegate- of ritregistratie-integratie.

Reproduceerbare buildcontrole zonder signing of installatie, vanaf repositoryroot:

```sh
xcodebuild -project ios/RitKompasApp/RitKompasApp.xcodeproj -scheme RitKompasApp -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' -derivedDataPath /private/tmp/ritkompas-app-derived build CODE_SIGNING_ALLOWED=NO
```

Gebruik voor nieuwe runs een eigen lege tijdelijke derivedData-map; geen bestaand werk overschrijven. Een generieke build is geen simulatoruitvoering. `com.example.RitKompasApp` is uitsluitend een lokale placeholder, geen geregistreerde of definitieve app-identiteit. Geen automatische signing/provisioning aanzetten of op een fysieke iPhone installeren zonder de juiste eigenaarbeslissing en persoonlijke Apple-inrichting. Betaald programma/CarPlay-goedkeuring niet als beschikbaar aannemen.
