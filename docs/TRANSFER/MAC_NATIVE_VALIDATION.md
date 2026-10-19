# Native bronvalidatie op Mac — 19 oktober 2026

> **Gezamenlijke vervolgcontrole na PR29:** de geïntegreerde Mac-/Cloudversie slaagt voor **197/197 Node-tests** (0fail/0skip). De 187-testbaseline hieronder blijft apart bewijs vóór Cloudvervolgcode. De nieuw toegevoegde TripChoiceNotifications.swift staat achter `#if os(iOS)` en is daardoor niet semantisch gevalideerd door een macOS-build; iOS-meldingsgedrag blijft NIET GETEST.

Op dezelfde geïntegreerde werkboom: TypeScript, volledige ESLint en webbuild PASS; Swift6-Coretypecheck en syntactische parse van de meldingsbron PASS. Parse is geen iOS-typecheck, XCTest of toestemmings-/meldingsproef. Bestaande dependencies hergebruikt, niets geïnstalleerd. Geen productiepublicatie.

Basis: PR #26, `ec44dc8ddda1361a61f9f0c8bdceebe4e20e8a01`, inclusief Swiftvoorbereiding uit PR #25. Bestaande bestanden hergebruikt; geen tweede iPhone-app, signing, entitlement, GPS-opname of hardwarekoppeling gemaakt.

- Aanwezig: Apple Swift 6.1.2, arm64 macOS, CommandLineTools.
- `swiftc -typecheck -module-name RitKompasCore ios/RitKompas/Core/*.swift` met aparte tijdelijke modulecache: PASS, inclusief APIClient.
- `ios/Package.swift` toegevoegd met alleen de bestaande Core- en PreparationUI-libraries en bestaande ContractTests, zonder externe dependencies. Minimums zijn bestaande bron-APIgrenzen iOS15/macOS12, geen apparaatacceptatieclaim.
- `swift build --package-path ios --target RitKompasCore`: PASS met Swift 6 package-mode en normale SwiftPM-sandbox.
- `swift test --package-path ios`: **NIET UITVOERBAAR**, `no such module XCTest`. De aanwezige CommandLineTools hebben de vereiste XCTest-module niet; Xcode.app is niet op het standaardpad aangetroffen. Geen tests geslaagd verklaren op basis van alleen compile.
- SwiftUI-iOS-body, Xcode-project/build, simulator, signing/installatie, echte iPhone, meldingen, achtergrondgedrag, Bluetooth/CarPlay/OBD2: **NIET GETEST**. macOS sluit de `#if os(iOS)`-body uit.

Eerste SwiftPM-pogingen liepen tegen cachetoegang en geneste sandbox aan. Een eerste onnodige `--disable-sandbox`-poging mislukte op cachetoegang en is afgebroken; er is geen systeembeveiligingsinstelling gewijzigd. De uiteindelijke build gebruikt normale SwiftPM-beveiliging, tijdelijke caches en een beoordeelde lokale testuitvoering. Geen extra software geïnstalleerd.

## Werkelijke Mac-regressie gevonden en opgelost

De bestaande Node-suite faalde aanvankelijk op de vijf backupgevallen: macOS geeft tmpdir via `/var`, een symlink naar `/private/var`; de productcode weigert terecht symlinkpaden. Alleen de testfixture gebruikt nu `realpath(tmpdir())` vóór het maken van de tijdelijke map. De productiecontrole, encryptie en symlinkweigering zijn niet aangepast. Daarna **187/187 Node-tests PASS**, inclusief de bestaande expliciete file- en parent-symlinkweigering.

Geen type-/lint-/webbuildclaim voor nieuwe productcode: de productcode is niet veranderd; gewijzigde JavaScript-testfixture wordt afzonderlijk gelint. De 187 Node-tests zijn geen native iPhone-test.

## Reproductie

Aanvullende oplevercontroles: ESLint op de gewijzigde backup-testfixture PASS; `git diff --check` PASS; beperkte patroonscan 227 werkbestanden/467 historische blobs, nul treffers. Het overgenomen PR27-memo is bytegelijk aan de bron; centrale en nieuwe documentlinks bestaan;123bestaandeREQ-ID's behouden. Geen volledige onafhankelijke securityaudit of nieuwe webbuild geclaimd voor deze bibliotheek-/test-/documentwijziging.

```sh
node --experimental-strip-types --test tests/*.test.mjs
swift build --package-path ios --target RitKompasCore
# Met Xcode/XCTest beschikbaar; nu nog niet uitvoerbaar op deze Mac:
swift test --package-path ios
```

Voor volgende Mac-run eerst bestaande Xcode-/SDK-beschikbaarheid controleren; geen grote installatie zonder eigenaarsoverleg. Cloud kan ondertussen meldingsbroncode, zuivere detectielogica en tests voorbereiden. De vier bestaande XCTestcases blijven klaarstaan.
