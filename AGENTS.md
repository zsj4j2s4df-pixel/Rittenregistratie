# RitKompas — uitvoeringsinstructies

## Nieuwste Mac-Xcodebewijs — 20 oktober2026

Installatie/licentie door eigenaar bevestigd en uitgevoerd; niet opnieuw blokkeren op ontbrekende Xcode.9echte macOS-XCTest, echte iOS Core/UI semantiek,9extra smokeproeven,249+4Node/sourcechecks en eerste unsigned device/simulatorappbuild PASS. [Exacte grenzen](docs/TRANSFER/MAC_XCODE_VALIDATION_2026-10-20.md). UIproef stopt op vergrendelde Mac: handmatig ontgrendelen vragen, geen beveiliging omzeilen. Eén eerste apphost staat in ios/RitKompasApp met bestaande lokale package, geen betaalde koppeling/signing/provisioning. Nativeprovider/delegate/capture en fysieke acceptatie nog open. Oudere Xcode-ontbreektstatus hieronder is historie.

## Mac-resultaat PR46 — 20 oktober2026

PR46 vanafc615ae62e2f93fce72e735b7a46112fb1301bf32 werkelijk ontvangen/uitgevoerd, Cloudantwoord bevestigd. Echte Macbrowser eigenaarlogin/read/zelfde settingswrite/reload PASS; geen privéwaarden delen. Nieuwe pure queueconsumer met volledige Core-Swift6compile/9uitgevoerde smokeproeven en249Node PASS. [Bewijs en vervolgtaken](docs/TRANSFER/MAC_PR46_RESULT_2026-10-20.md). Volledige Xcode/iPhoneSDK/XCTest ontbreken; niet installeren zonder eigenaarbesluit. Nativehost/provider/delegate/capture/hardware blijven open; geen livepublicatie/CFconfig/migraties onder dit bronwerk. Volgende run gebruikt nieuwste opvolgende Macdraft, niet stalePR30.

## Actueel — eigenaarstoestemming uitgevoerd, 20 oktober2026

Goedgekeurde PR45-webcode en migraties0008–0015 LIVE: versieba2a2a9d-3a2a-4347-b146-b577d0e33989, deployment9c7c3f88-fd26-44aa-b1ca-3375aa21d122. Vierbindings/Access behouden; anoniem302 op /,/beheer,/api/vehicles PASS.249Node/type/lint/build/gebouwdeWorkerD1 PASS; versleutelde echte privésnapshot lokaal hersteld/geüpgraded met alle oorspronkelijke rijen behouden, SQLintegrity/FK en10livetabelhashes PASS. Echte ingelogde iPhonewrite/native/hardware NIETGETEST. Geen mainmerge/kosten/provisioning. [Releasebewijs inclusief uitvoeringsincident](docs/TRANSFER/WEB_RELEASE_RESULT_2026-10-20.md).

Overdrachtbranch `cloud/cloud-014-live-web-handover`, basePR45/adcc6d373a1df3a0124ba680c5faed6f0564dcce. [Eén kopieerbare Mac-opdracht](docs/TRANSFER/MAC_NEXT_RUN.md); script `node scripts/check-native-readiness.mjs [--run]` inspecteert bestaande Appletoolchain en kan huidige bronnen werkelijk controleren zonder installatie/signing. Clouduitvoering: terecht NIETGETEST iOS; geen Swiftbuildpass. Nativeauth/apphost/queueconsumer/capture en echte Mac/iPhone/Jeep/CarPlay/OBD2 blijven open. Geen nieuwe productionfeaturetoestemming afleiden uit alleen dit uitgevoerde releasepakket; oude ontbrekende-toestemmingstekst hieronder is daarvoor historie.

## CLOUD-013 livepakket gepubliceerd met eigenaarstoestemming

19 oktober2026: uitsluitend PR34/e0e8159 gepubliceerd als Worker-versie8e264bd0-62ab-48d2-a88e-9bf19d491858/deployment06d17ebe-83f7-4ec3-be5d-57b713cc0c04. Vier bestaande bindings strict behouden en teruggelezen; geen DB-migratie/provisioning/Accesswijziging/mainmerge. Anoniem302 naarAccess op /,/beheer,/api/vehicles PASS met browser-UA. Ingelogde API/UI nafix NIETGETEST; Mac/eigenaar moet MAC-CLOUD-013-LIVE-01 uitvoeren. Geen algemene live-succesclaim. [Resultaat, testopdracht en goedgekeurde code-only rollback](docs/TRANSFER/ACCESS_RELEASE_RESULT_2026-10-19.md). PR35 bevat cumulatieve ontwikkeling en is niet gepubliceerd. Volgende lokale groep: expliciete webkeuze Zakelijk/Privé met idempotente handmatige retry. Oude tekst “toestemming ontbreekt” hieronder is historie voor uitsluitend PR34; verdere productiefeatures/migraties blijven apart beslispunt.

## CLOUD-013 — Access-runtimefix gereed voor controle, 19 oktober 2026

Beperkte releasefix staat in draft-PR #34, head `e0e8159f4f9aae396e1dc80ad05980e559351fb9`, exact vanaf live bronbasis PR14/6c3f608. Echte gebouwde Worker/framework/workerd/D1-test toonde aan: JWKS-fetch met redirect:error veroorzaakt een workerd-exceptie en401. Fix gebruikt manual en weigert alle3xx zonder volgen; begrensde ondertekende app-cookiefallback toegevoegd wanneer assertionheader ontbreekt. Alle crypto/account/rechtcontroles behouden. Geen diagnostische token/claimslogging in bron of artefact.

Geïsoleerde releasebasis:125/125 Node-tests/type/lint/build/lokaleD1/gebouwdeWorker PASS. Cumulatieve branch boven PR33/f1cf2eef1a531caef86add1f10b62ec010f7d198:221/221 Node-tests/type/lint/build/lokaleD1/gebouwdeWorker PASS. PR33:29/29 changed blobs exact teruggelezen; PR34 eerste12/12 exact, vervolgtree apart gecontroleerd. Nieuwe Swift/XCTest/iOS blijven NIETGETEST; geen hardwarepass.

Live eigenaarbindings/provisioning blijven uitgevoerd (1user/1vehicle/1recht/0trips/2audits), live eindtest blijft FAIL tot nieuwe code met toestemming is gepubliceerd en Mac/eigenaar daadwerkelijk test. Geen nieuwe migratie/provisioning/Cloudflarewijziging/upload/mainmerge/kosten. PR31/32/33 behouden. Cumulatieve integratie is NIET het releasepakket: uitsluitend PR34 is afgebakend tegen de bestaande live bronbasis.

[Releasebewijs, artefacthash en code-only rollback/Mac-eindtest](docs/TRANSFER/ACCESS_TRANSPORT_FIX.md). Volgende noodzakelijke eigenaarbeslissing: toestemming voor uitsluitend dit PR34-Workerpakket met behoud van huidige bindings/Access/DB en code-only terugval bij mislukte eindtest. Daarna echte ingelogde /api/vehicles en /beheer testen; anoniem302 behouden. Geen claims van live herstel vooraf. Veilige overige ontwikkeling: native host/authprovider/queueconsumer en expliciete definitieve ritoverzetting voorbereiden zonder live migratie; hardwaretestopdrachten blijven GitHub/Mac.

Nieuwste beperkte toestemming is uitgevoerd: Access-runtimebindings plus uitsluitend geverifieerde eigenaar/voertuigrecht. [Eindtest FAIL en vervolg](docs/TRANSFER/OWNER_ACCESS_RESULT_2026-10-19.md). Niet opnieuw provisionen of toestemming voor hetzelfde pakket vragen. Geen nieuwe codepublicatie/migraties/beveiligingsversoepeling geautoriseerd. Onderstaande oudere ontbrekende-binding/provisioningstatus is historie. Onderzoek/fix/test op eigen branch blijft toegestaan; geen onbewezen oorzaak of werkende livebackend claimen.

## Actuele gezamenlijke basis — na Cloud #28/#29 en Mac #30

De huidige reviewbranch combineert beide voorouders met behoud van code en historie. Cloudontvangst en Mac-terugproef zijn bewezen in docs/TRANSFER/MAC_CLOUD_ACK_RESULT.md; rechtstreeks Cloud→Mac sturen is in de Cloud-sessie niet beschikbaar. Cloud gebruikt GitHub-testopdrachten. Gebruik docs/TRANSFER/PR27_PLAN.md voor centrale M27-eisen, PR27_EXECUTION_PLAN.md als aanvullende MAC27-controlekaart en RESUME voor volgende taak. Geen tweede documentaudit of hardwareonderzoek herhalen zonder nieuw bewijs.

## Nieuwste Mac-overdracht — 19 oktober 2026

Lees bij hervatten het volledige [memo uit PR #27](docs/IMPORTANT_MEMO_IPHONE_RITDETECTIE.md) en [de uitvoerbare planning](docs/TRANSFER/PR27_EXECUTION_PLAN.md). Cloud coördineert de ontwikkeling, Mac verzorgt lokale native/hardwaretests. Start vanaf de nieuwste gecontroleerde ontwikkelketen, niet opnieuw vanaf de document-only main. De overige functionele mastereisen blijven gelden.

De eigenaar heeft in deze Mac-run specifiek All traffic + Cloudflare account members voor uitsluitend de bestaande RitKompas-Worker goedgekeurd; dit is toegepast en read-only geverifieerd. Dat is geen algemene toestemming voor publicatie, runtimebindings, gebruikersprovisioning of extra toegang. Huidig bewijs: [Zero Trust](docs/TRANSFER/MAC_ZERO_TRUST_2026-10-19.md), [samenwerking en commando's](docs/TRANSFER/MAC_CLOUD_CHANNEL_TEST.md), [Mac-nativecontrole](docs/TRANSFER/MAC_NATIVE_VALIDATION.md). Oudere Access-ontbreektmeldingen zijn historie. `/scale` en `/do` niet als ondersteund aannemen.

Nieuwste hoogprioritaire sturing: lees [PR27-memo](docs/IMPORTANT_MEMO_IPHONE_RITDETECTIE.md), [aanvullende eisen/planning](docs/TRANSFER/PR27_PLAN.md) en [Mac-testopdrachten](docs/TRANSFER/MAC_HARDWARE_TESTS.md). Native interactieve Zakelijk/Privé-melding is de praktische hoofdroute; CarPlay-knoppen vereisen passende Apple-goedkeuring. Betrouwbaar einde, twee-minutenklantstop, elektrisch rijden, drie-iPhoneprioriteit versus echte bestuurder en centrale voertuigdedup blijven expliciete acceptatiepunten. Geen automatische samenwerking/hardwarebewijs claimen; Mac beheert zijn Access/rulesetonderzoek, Cloud wijzigt die externe configuratie niet gelijktijdig.

Nieuwste gebruikersbesluit, 18 oktober 2026: **Codex Cloud is hoofdontwikkelaar; Codex Mac ondersteunt lokale builds, iOS-simulator en hardwaretests. GitHub is de centrale bron van waarheid. De projecteigenaar beslist over belangrijke handelingen.** Oudere afwijkende rolverdelingen blijven alleen historie.

Start met RESUME.md, CLOUD_TASKS.md, DEVELOPMENT_PROGRESS.md en CLOUD_HANDOVER.md. Lees daarna alleen de relevante eisen/testgevallen en code; herhaal geen volledige inventaris zonder aanleiding. Alle functionele wensen in de bijgewerkte masterprompt blijven behouden. Sol is voorkeur voor dagelijkse regie indien beschikbaar, Astra alleen voor belangrijke afwegingen. Geen modelwissel, agentoverdracht of automatische sessiesynchronisatie claimen zonder bewijs.

Nieuwste publicatieopdracht: eigenaar autoriseert aanmaken en publiceren van RitKompas in het gekoppelde Cloudflare-account. Gekozen adres conform antwoord eigenaar: https://rittenregistratie.zsj4j2s4df.workers.dev. Dit autoriseert geen kosten, betaalgegevens, nieuwe externe accounts of main-merge. Bestaande andere Workers/accountsubdomain niet wijzigen.

Nieuwste beperking na eerdere publicatie: eigenaar heeft Zero Trust Free geactiveerd, vraagt exacte Access-instructies en zelfstandige ontwikkeling, maar **geen nieuwe live publicatie zonder zijn toestemming**. Kosten blijven verboden. Code/tests/docs en draft-GitHubupdates blijven toegestaan; geen Cloudflare-mutaties uitvoeren op basis van de oudere publicatietoestemming.

## Zelfstandig toegestaan

Samenhangende code-, test-, bugfix- en documenttaken op eigen branches; commits en pull requests; taken, besluiten en hervatpunt bijwerken. Gebruik synthetische gegevens. Als een reviewer niet beschikbaar is, neem veilig werk zelf over en markeer dat als eigen controle, niet onafhankelijk.

## Nooit zonder expliciete toestemming

Kosten/betaalde diensten, productiepublicatie, nieuwe externe accounts of gevoelige koppelingen, delen van gevoelige gegevens, grote functionele scopewijzigingen, uitschakelen van beveiliging, onomkeerbare handelingen. **Geen merge naar main, geen force push, geen auto-merge, geen rechtstreekse push naar main.** Een geslaagde test is geen toestemming.

## Taakgroepen

Gebruik bestaande CLOUD-nummers. Houd samenhangend werk in één run; na iedere groep tests, commit, takenlijst, DEVELOPMENT_PROGRESS en RESUME bijwerken en volgende veilige taak uitvoeren. Stop bij echte blokkade, noodzakelijke toestemming of uitvoeringslimiet. Vermijd dubbele audit en onnodige parallelle agents. Externe dependencymogelijkheden controleren, niet zomaar vervangen.

## Verificatie

Node 24 aanbevolen. `node --experimental-strip-types --test tests/*.test.mjs` vereist geen externe npm-packages. Met dependencies: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`. Geen Mac-paden hardcoden. Native iOS is nog niet gebouwd; geen echte iPhone-test claimen vanuit een Cloud-VM. `lib/access-policy.ts` is geen aangesloten authenticatiebackend. De app bevat alleen tijdelijke demo-invoer.

Controleer vóór elke publicatie diff en geheimen; geen .env, caches, privéfoto's, GPS-historie, Apple-certificaten of databasebestanden. `scripts/scan-handover.mjs` is een beperkte patrooncontrole, geen volledige veiligheidsgarantie. Bewaar bestaande wijzigingen. Bestaande PR-keten: #1 → #2 → overdrachts-PR; niet ongemerkt rebasen, samenvoegen of bases wijzigen.
