# Mac — Xcode en eerste apphost

20 oktober2026. Opvolging van CloudPR48/head `2ceca7922af3490b18db5739f97e571449dc3ab6` (alleen reviewdocs boven PR47). Cloudreview behouden; native bron is dezelfde gecontroleerde PR47-basis plus deze eerste apphost. Geen mainmerge of bestaande PRbases gewijzigd.

## Eigenaarbesluit en werkelijke installatie

Eigenaar gaf Xcode-installatietoestemming, meldde Apple Developer-aanmelding voltooid en bevestigde vervolgens zelf de Xcode/SDK-overeenkomst. Geen wachtwoord/2FA/cookie overgenomen of naar GitHub gestuurd; agent heeft niet op Agree geklikt en geen license-acceptcommando gebruikt.

Officiële ingelogde Apple Developer-download van Xcode26.3 Apple silicon,2267146666bytes; arm64/macOS15.7.4. Archief uitgepakt en app zonder overschrijven in `/Applications/Xcode.app` geplaatst. xip meldde `validation not attempted`; dat is niet als certificaatpass gebruikt. Afzonderlijke codesign deep/strictcontrole gaf valid on disk/designated requirement; Gatekeeper accepted/source Apple System. Geen quarantaine/handtekeningbeveiliging uitgezet of OS-upgrade gedaan. Eerste systeemcomponenten na eigenaarakkoord voltooid; Xcode26.3/build17C529, Swift6.2.4 en iPhoneOS26.2 SDK werkelijk gemeten. Geen betaald programma, signingcertificaat, provisioning, entitlement, nieuwe account of productieactie.

## Werkelijk uitgevoerde nativecontrole

`node scripts/check-native-readiness.mjs --run` met normale beoordeelde lokale compiler-cachetoegang, zonder SwiftPM-sandbox uit te zetten, exit0:

- Core-librarybuild PASS,7.28s.
- Echte **macOS XCTest**:9tests/0failures, inclusief queue/ciphertexttampering, accountwissel, verloren antwoord/exactretry en defaultdenycontracten. De aanvullende SwiftTesting-run met0tests is niet als extra test meegeteld.
- **iOS Core semantische typecheck PASS**, arm64-apple-ios15.0 met echte iPhoneOS26.2 SDK.
- **iOS UI semantische typecheck PASS**, dezelfde SDK/minimumtarget.

Dit zijn geen iOS-simulator-XCTest-, Keychain-/FileProtection-, lockscreen-, fysieke iPhone-, CarPlay- of Jeepresultaten. De negen XCTestcases zijn ook niet hetzelfde als de eerder uitgevoerde negen standalone-smokegroepen; beide bewijzen blijven apart benoemd.

## Eerste apphost

Geen bestaande apphost aangetroffen. Via het officiële Xcode-iOS/SwiftUI-sjabloon één eerste app-target aangemaakt in `ios/RitKompasApp`, binnen dezelfde Gitrepository; geen geneste Gitrepository. Gegenereerde persoonlijke gebruikersdata ontkoppeld uit index en genegeerd, niet gepubliceerd; persoonsheaders verwijderd. Gedeelde scheme en alleen veilige bronnen/assets/projectmetadata bewaren.

Host gebruikt het bestaande lokale Swiftpackage via `..` en product RitKompasPreparationUI; geen Core/UI-kopie of externe package. Swift6, iPhonefamily1, minimum iOS15.0, placeholdercom.example.RitKompasApp, geen geregistreerde app-identiteit/team/profiel. Alleen expliciete wanneer-in-gebruiklocatietoelichting voor bestaande voorbereidingsknop; geen backgroundmode/CarPlayentitlement/autoopname. Het scherm blijft een herkenbare voorbereiding, niet een werkende automatische rittenapp. Aanmeldprovider, notificationdelegate, duurzame deliveryintegratie en echte capture/lifecycle blijven open.

De eerste volledige unsigned-devicebuild werd vóór compileren geweigerd door Xcode: iOS-platformcomponent nog niet geïnstalleerd. SDKtypecheckPASS bewees dus nog geen volledige appbuildPASS. `simctl` bevestigde toen0runtimes. Binnen goedgekeurde Xcode-inrichting uitsluitend officiële iOS-arm64component toegevoegd; Apple selecteerde iOS26.3.1 Simulator/23D8133, download8.39GB. Download/installatie werkelijk afgerond met exit0. Geen andere platforms/nieuwe kosten.

Daarna **volledige Debug-iPhonebuild PASS** (xcodebuild exit0, iphoneos/generic iOS, CODE_SIGNING_ALLOWED=NO). Gebouwde Mach-Oarm64-app/Info.plist minimum15.0 bevestigd; codesign meldt bewust `code object is not signed at all`. Vervolgens **volledige Debug-simulatorbuild PASS** (exit0, iphonesimulator/virtuele iPhone17, eveneens signingNO), arm64/minimum15.0 bevestigd. Beide builds koppelen de werkelijke bestaande package-Core/UI en de eerste host. Geen archive-/AppStore-/fysieke-installatieclaim.

Eén door Apple al aangemaakte virtuele iPhone17 met iOS26.3.1 gestart, bootstatusFinished/exit0. Geen extra virtueel toestel of Apple-account nodig. **Appinstallatie/start/visuele acceptatie in simulator NIET GETEST:** bij openen van de Simulator meldde Computer Use dat de Mac vergrendeld is en automatisch ontgrendelen niet lukt. Eigenaar gevraagd Mac handmatig te ontgrendelen; geen tweede UIroute, wachtwoord of omzeiling gebruikt. Niet als appfout of geslaagde UIproef boeken.

## Overige controle en grenzen

249bestaande Node-tests opnieuw PASS; vier nieuwe broncontractguards4/4PASS (totaal253, afzonderlijke testaanroepen). Nieuwe guards zijn uitsluitend bronchecks voor één app/localpackage/iOS15/Swift6/privacy/scheme, geen Applebuildvervanging. Aanvullende negen standalone Swift/CryptoKit-smokegroepen eveneens werkelijk uitgevoerd met de nieuwe toolchain: PASS. pbxproj-plistcontrole en git-diffwhitespace PASS. Beperkte patrooncontrole327werkbestanden/794historischeblobs zonder treffers; geen onafhankelijke volledige audit.

## Direct hervatten na ontgrendeling

Geen Xcode- of platforminstallatie/volledige testnulmeting opnieuw doen. Simulatorboot en beide appbuilds zijn klaar. Lokale afgeleide simulatorapp staat onder `/private/tmp/ritkompas-app-build-UfmZzL/Build/Products/Debug-iphonesimulator/RitKompasApp.app`; dit pad is uitsluitend Mac-checkpoint, geen draagbare GitHubbuild. Voor nieuwe omgevingen de READMEbuild met eigen lege derivedData-map uitvoeren. Controleer na eigenaarbericht dat Mac echt ontgrendeld is, toon virtuele iPhone17 en installeer/start uitsluitend deze unsigned simulatorbuild voor beperkte visuele/relauchcontrole. Geen echte telefoon/signing/provisioning of nieuwe credentials onder deze simulatorscope. Geen locatie-/meldingsrechten op een echte telefoon wijzigen.

Na die proef: geverifieerde nativeprovider/sessiebinding en queue/notificationdelegate/capture blijven nog echte ontwikkeltaken. Eerste host en een geslaagde build zijn niet hetzelfde als een functionerende automatische rittenapp. Fysieke installatie vereist nog passende eigenaarinrichting en ondertekening; kies geen betaald programma of definitieve externe app-identiteit zonder besluit.

Signing/installatie op een fysieke iPhone vraagt nog passende persoonlijke Apple-inrichting/toestemming; er is nu geen app op een echte telefoon gezet. Geen productiecode/Access/D1/gebruikers/routegegevens gewijzigd. Installer/afgeleide builds/simulatorgegevens blijven lokaal, niet in GitHub. Toestel- en overige123REQ/M27acceptatie blijven open waar niet bewezen.
