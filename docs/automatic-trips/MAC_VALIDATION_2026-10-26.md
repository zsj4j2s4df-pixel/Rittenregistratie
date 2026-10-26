# PR70 — werkelijk Macbewijs, 26 oktober 2026

Basis: PR70/head888cc143bdddc1159b8fcebfa7cf1e1b0766f07e,
treeb4bf133ed101e04532e1c26aaa4b2617fba3df4a, boven PR69/bce7f5d9.
Eigen branch mac/pr70-siri-validation-20261026. Geen mainmerge/productie/accountmutatie.

## Werkelijk uitgevoerd

- Xcode26.3/build17C529; huidige deviceSDK iPhoneOS26.2; simulatorruntime26.3.
- Alle82 Swift-XCTest van Cloudbron uitgevoerd PASS, waaronder de3nieuwe methodes.
- Vijf aanvullende testmethodes: registratie-/keuzeopslagfout, herhaalde keuzes,
  exacte herhaling na verloren serverantwoord en procesherstel, clear/accountwissel
  tijdens registratie, ontbrekende feed/nieuwere revisie zonder overschrijven.
  Eindresultaat87Swift-XCTest,0fouten. Geen echte provider of productiegegevens.
- Unsigned iphoneos én iphonesimulator BUILD SUCCEEDED; finale taalcorrectie
  daarna voor beide opnieuw gebouwd PASS. iOS15deployment blijft behouden.
- AppIntents-bron aanvullend typechecked met targetarm64-apple-ios16.0 PASS.
  Dit is huidige SDK met minimum16, niet een iOS16-toestel of oude SDK-runtime.
- Echte ExtractAppIntentsMetadata/SSUtraining uitgevoerd voor beide builds.
  Beide intents aanwezig, iOS16availability, geen parameters, openAppWhenRunfalse.
- Lokale macOS-uitvoering van echte PrivateTripIntent.perform en
  BusinessTripIntent.perform met synthetische handlers PASS: koude/gewiste
  hostcontext weigert, beide keuzes correct, interne fouttekst afgeschermd.
  Dit is geen geverifieerde accountsessie en geen iPhone-Siri-runtimebewijs.
- Nieuwe simulatorbuild geplaatst op bestaande iPhone16e/iOS26.3 en gestart.
  Apple Opdrachten toont werkelijk RitKompas met Privé rit en Zakelijke rit.
  Bij uitvoeren zonder hostsessie toont Apple een generieke melding:
  ‘Appopdracht kan niet worden uitgevoerd’. Geen succesvolle keuze of
  centrale write geclaimd; oorzaak runtimefout niet uit generieke tekst bewezen.

## Gerichte correctie

Oorspronkelijke metadata trainde Nederlandse zinnen onder localeen doordat het
Xcodeproject developmentRegionen gebruikte. developmentRegionnu nl, knownRegions
nl/en/Base. Finale Info.plist CFBundleDevelopmentRegionnl en SSUtraining beide
Nederlandse appnaamzinnen onder localenl teruggelezen. Geen merkbeeld/themawijziging.
Xcode heeft daarnaast uitsluitend projectcommentaar/inspringing genormaliseerd;
geen team/bundle/signing/capabilities/rechten gewijzigd.

## Herhaalbare checks

Gebruik bestaande Swift/Xcode; geen dependencyinstallatie nodig.

```sh
swift test --package-path ios --scratch-path /absoluut/prive-uitvoerpad/swift
xcodebuild -project ios/RitKompasApp/RitKompasApp.xcodeproj -scheme RitKompasApp -configuration Debug -sdk iphoneos -destination 'generic/platform=iOS' -derivedDataPath /absoluut/prive-uitvoerpad/device build CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO
node scripts/check-native-trip-intent-metadata.mjs /absoluut/prive-uitvoerpad/device/Build/Products/Debug-iphoneos/RitKompasApp.app
```

Simulator equivalent: sdkiphonesimulator/destinationgenericplatformiOSSimulator.
Lokale macOS-AppIntentproef (paden aanpassen aan eigen scratch):

```sh
xcrun swiftc -parse-as-library -swift-version 6 -default-isolation MainActor -target arm64-apple-macos14.0 -I /absoluut/prive-uitvoerpad/swift/arm64-apple-macosx/debug/Modules ios/RitKompasApp/RitKompasApp/NativeTripIntents.swift scripts/native-trip-intent-smoke.swift /absoluut/prive-uitvoerpad/swift/arm64-apple-macosx/debug/RitKompasCore.build/*.o -o /absoluut/prive-uitvoerpad/intent-smoke
/absoluut/prive-uitvoerpad/intent-smoke
```

Logs/binaries blijven privé buiten checkout. Geen ruwe simulator-/toesteldata uploaden.

Aanvullend: twee bestaande nativebroncontroles PASS, metadata-checker ESLint
PASS en diffcontrole PASS. Beperkte geheimenpatrooncontrole481bestanden/1245
historische blobs zonder bevindingen; geen volledige veiligheidsgarantie.

## Nog NIET GETEST / geen complete automatische ritstart

Echte Siri-herkenning in Nederlands, lockscreen, gesproken CarPlay, Focus,
first-unlock/forcequit, echte Keychain/diskbescherming, alle drie account-/hardware-
acceptaties blijven OPEN. Opdrachten-zichtbaarheid is geen bewijs van succesvolle
Siriuitvoering. Zonder aangemelde host blijft koude start bewust gesloten.
Ook één open voorstel kan historisch zijn: geen huidige-ritclaim. Geen automatische
HTTPwrite, centrale ack, ritstart/stop/Always/backgroundlocatie toegevoegd.
AUTO01–06 uit ASSESSMENT_AND_MAC_TASK.md blijven OPEN voor Cloudbroncyclus.
Accounttaak voorbereid in docs/auth-email/ACCOUNT_PREPARATION_2026-10-26.md.
