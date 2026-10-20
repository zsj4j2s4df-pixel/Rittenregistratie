# MAC-PR46 — ontvangst en daadwerkelijke uitvoering

20 oktober2026, Europe/Amsterdam. In opdracht van de eigenaar Cloud rechtstreeks gevraagd wat is uitgevoerd; Cloud heeft geantwoord en PR46-head `c615ae62e2f93fce72e735b7a46112fb1301bf32` bevestigd. Mac heeft metadata, alle10gewijzigde bestanden en lege PR-discussie gelezen. Op eigen opvolgende branch vanaf precies die head gewerkt; bestaande PRbases/ouders behouden. Geen oude loginfix, adapteronderzoek of documentaudit herhaald.

## Cloudresultaat tegenover Macbewijs

Cloud meldt de geautoriseerde webrelease ba2a2a9d-3a2a-4347-b146-b577d0e33989, deployment9c7c3f88-fd26-44aa-b1ca-3375aa21d122 en migraties0000–0015,249tests/type/lint/build en gegevenscontrole PASS. Dit blijft Cloudbewijs, niet in deze Mac-run opnieuw gepubliceerd/gemigreerd. Het expliciet gemelde bookmark-stopafhandelingsincident blijft ongewijzigd gedocumenteerd in WEB_RELEASE_RESULT_2026-10-20.md.

Mac heeft met bestaande eigenaarbrowser daadwerkelijk kunnen aanmelden. Centrale voertuig-/instellingenschermen openen. Eén beperkte echte settingswrite uitgevoerd: **bestaande voertuiginstelling inhoudelijk ongewijzigd opnieuw opgeslagen**, met reden `MAC-PR46 controle: bestaande voertuiginstelling ongewijzigd opnieuw opgeslagen`. UI gaf opslagbevestiging; na volledige reload was die reden in de centrale historie aanwezig, bestaande waarden behouden. Geen neprit, adres, tarief, account of appregistratie toegevoegd; bestaande gegevens niet verwijderd. De write verhoogt bewust de instellingenrevisie en voegt audit/receipt toe. Geen echte persoonsgegevens of screenshot in dit openbare verslag.

Dit bewijst eigenaarlogin/read/settingswrite/reload op Mac in de Codex-browser, **niet** iPhone/Safari, tripwrite, verloren-liveantwoord/exactretry, PDF/Maps of revocation/logout. Die blijven NIET GETEST; geen gehele appacceptatieclaim.

## Appletoolchain en bron

- Gemeten Apple Swift6.1.2, arm64, macOS SDK15.5, geselecteerd `/Library/Developer/CommandLineTools`.
- Geen volledige Xcode in de gecontroleerde appmap/actieve toolchain; xcodebuild meldt CommandLineTools-only, iPhoneOS SDK ontbreekt. Geen Xcode/signing/account/entitlement/afhankelijkheid geïnstalleerd of aangevraagd.
- `node scripts/check-native-readiness.mjs` uitgevoerd: Swift PASS, Xcode/iPhoneSDK niet beschikbaar, exit2.
- Eerste `--run` liep vast op geweigerde compiler-cachetoegang in de beheerde sandbox: geen bewezen bronfout. Daarna via expliciet beoordeelde normale lokale buildtoegang herhaald, **zonder SwiftPM-sandbox uit te zetten**. PR46-Core-librarybuild daadwerkelijk PASS,94.58s. Exit2 blijft terecht omdat XCTest/iOS niet getest zijn.
- Nieuwste bron bevat een Swiftpackage met Core/UI, geen apphost/@main/Xcode-project/signingconfiguratie. Geen onbedoelde tweede app aangemaakt. Authprovider/host/notificationdelegate/capture niet als werkend voorgesteld.

## Veilige resterende bronontwikkeling

`TripChoiceDelivery` vult het zuivere queueconsumer-deel in: uitsluitend expliciete single-action verzending; actuele queue/sessiescope vóór transport, APIClient controleert exact dezelfde viewer vóór netwerk, vervolgens uitsluitend gecontroleerde serverreceipt aan queue-acknowledgement. Bij verloren antwoord, accountwisseling, onjuiste receipt, cancellation of mislukte opslag blijft de duurzame actie behouden voor exactretry. Geen timer/autodrain, automatische classificatie of nieuwe requestID. Gelijktijdige calls op dezelfde consumer worden geweigerd; ontvangende host moet één queue/persistenceowner en consumer gebruiken.

Dit is geen loginprovider of echte notificationhost. De APIClient-conformance is aangesloten broncode; echte credentials, serverrequests en achtergrondwerking zijn niet vanuit native uitgevoerd. Alleen aansluiten op werkelijk geverifieerde SessionAccess/ChoiceSessionBinding, nooit op notificationuserInfo/hardcoded viewer. Twee XCTestcases toegevoegd voor verloren antwoord/exactretry en accountwisseling; XCTest blijft NIET UITGEVOERD wegens ontbrekende toolchain.

Voor een echte uitvoerbare Macproef zonder XCTest is `node scripts/run-native-choice-smoke.mjs` toegevoegd. Compileert de volledige actuele Core in Swift6 en voert synthetische queue/consumer/CryptoKit-proeven uit, zonder netwerk, echte Keychain of signing. De tijdelijke fixture/binary/compilercache wordt alleen uit de eigen vers aangemaakte tijdelijke map opgeruimd. Dit vervangt geen XCTest/iOS-acceptatie.

## Resultaat van deze nieuwste bronnen

| Werkelijk op deze Mac uitgevoerd | Uitkomst |
|---|---|
| Swift6 compile van volledige actuele Core inclusief deliveryconsumer + uitvoerbare smoke | PASS |
| Queue heropenen/dubbelactie | PASS |
| Verloren antwoord bewaart exacte actie | PASS |
| Onjuiste receipt weigert acknowledgement | PASS |
| Accountwissel vóór netwerk | PASS, geen transportcall |
| Accountwissel tijdens antwoord | PASS, actie behouden |
| Opslagfout bij acknowledgement | PASS, actie behouden |
| Cancellation vóór verzending | PASS, geen transportcall |
| Exactretry/ack, reeds verwijderde actie niet opnieuw sturen | PASS |
| Werkelijke CryptoKit AES-GCM roundtrip, verkeerde/ontbrekende sleutel, behoud ciphertext en tamperweigering | PASS met synthetische sleutel, geen echte Keychain |
| Node-regressie op actuele branch | 249/249 PASS,0skips |
| Gerichte lint nieuwe JS-runner, JS-syntax en diff-whitespace | PASS |
| XCTest/iOS SDK/UI/UserNotifications/FileProtection/simulator/hardware | NIET GETEST |

Negen smokegroepen is geen vervanging van de XCTest-suite. Eigen controle, geen onafhankelijke review. Baseline Core-librarybuild94.58s gold voor PR46 vóór deliverytoevoeging; de nieuwe volledige Core is daarna daadwerkelijk door de Swift-smokerunner gecompileerd en uitgevoerd.

Nieuwe XCTestbron tevens syntactisch geparsed PASS; geen semantische XCTestpass geclaimd. Beperkte patrooncontrole312werkbestanden/778historischeblobs vond geen treffers; geen onafhankelijke of volledige geheimenaudit. Alleen veilige bron/docs publiceren, geen screenshot/privéwaarden/fixturebestanden.

## Nog open / volgende run

1. Volledige Xcode/iPhoneSDK/XCTest beschikbaar maken na expliciet eigenaarbesluit over de grote installatie; niets stilzwijgend installeren. Op deze Mac kan nu geen iOS semantische build, simulator of signing worden bewezen.
2. Met die SDK een bewuste apphost/authprovider opbouwen of bestaande host aansluiten; er is nu geen bestaande host gevonden om te integreren. Native browserlogin/credentialopslag/logout/revocation en queuebinding moeten echt dezelfde sessie gebruiken. Geen service-token of fake viewer.
3. Notificationdelegate: server-scoped pendingcontext duurzaam registreren vóór schedule, alleen expliciete actie in queue, consumer aanroepen onder geverifieerde sessie, bij fouten zichtbaar pending houden. iOS-opslag/Keychain/FileProtection/achtergrond/lockscreen testen.
4. Werkelijke opt-in capture/lifecycle en betrouwbare ritgrenzen ontwikkelen/testen.120s-klantstop versus verkeer, EV/RPM0, disconnect, routegaten en drie-iPhone-dedup blijven fysieke acceptatiepunten. Geen GPS-/hardwarepass vanuit deze bronproef.
5. Echte iPhone/Safari write/reload, rapport/PDF/Maps, logout/revocation en MAC-J01–J12 uitsluitend met beschikbare toegestane hardware. Geen purchases/OBDwrite/gatewaybypass of privéroutebewijs in GitHub.

Geen Cloudflare-configuratie, provisioning, migraties, productiecode, hoofdbranch of beveiligingsregels gewijzigd in deze Mac-run. De uitgevoerde beperkte settingswrite is geen nieuwe deploytoestemming. Overige123REQ/M27 blijven open waar nog niet bewezen.
