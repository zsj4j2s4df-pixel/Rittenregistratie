# Hervatpunt — 18 oktober 2026

## Actueel — Mac-overdracht en PR #27, 19 oktober 2026

Basis: PR #26 commit ec44dc8; deze Mac-vervolgbranch behoudt de gehele keten en neemt het volledige parallelle memo #27 over. Lees eerst [PR27_EXECUTION_PLAN](docs/TRANSFER/PR27_EXECUTION_PLAN.md), [MAC_CLOUD_CHANNEL_TEST](docs/TRANSFER/MAC_CLOUD_CHANNEL_TEST.md) en nieuwste DEVELOPMENT_PROGRESS.

Zero Trust Free bevestigd; eigenaar keurt uitsluitend Worker-Access All traffic/accountleden goed, toegepast en teruggelezen. Drie anonieme URL-tests krijgen Access302, bestaande eigenaarbrowserlogin slaagt. Centrale backend blijft gesloten: ACCESS_ISSUER/AUDIENCE ontbreken; geen nieuwe release of provisioning uitgevoerd. Voorstel/toestemmingsgrens: MAC_ZERO_TRUST_2026-10-19.md. Main-ruleset actief met drie regels/geenbypass;0approvals en gedeelde identiteit blijven open.

Swift-core typecheck en Swift6-packagebuild op Mac PASS. XCTest niet beschikbaar in CommandLineTools; geen iOS/XCTest/hardwareclaim.187Node-tests PASS na macOS-realpathfix uitsluitend in de backup-testfixture. Geen installatie gedaan. Zie MAC_NATIVE_VALIDATION.md.

Cloud-opdracht MAC-CLOUD-20261019-PR27 is via threadtool geregistreerd; agentantwoord/retourtest nog niet bevestigd. Geen nieuwe retries/runs starten zolang status niet duidelijk is. Cloud hervat daarna de meldings-/ritbewijs-/centrale deduplicatiegroep volgens het plan, commit/tests/security/voortgang per groep. Concrete Mac-testopdrachten staan erbij; geen extra aankopen, kosten, publicatie of main-merge.

## Atomaire detectiequota — 19 oktober 2026, niet live

CLOUD-005/002/004:120nieuweobservaties/60s,10000/UTCdag,100000totaalobservaties en200000receipts perappinstance centraal begrensd met atomische SQLgates; exacte retries blijvenwerken en geenorphanbijreceiptcap. Operationele defaults, geen retentie/deletiebeleid.187Node-tests/type/lint/build/lokaleD1 en vier Chromiumregressieflows PASS. Bewijs DETECTION_INGEST.md. Draftbranch cloud/cloud-005-detection-quotas op #25-head57a2f48. Main opnieuw d37d8c9ongewijzigd; ruleset25339571active/PR/deletion/nonfastforward/geenbypass,0approvals; connectorPRauteur nog eigenaar296047649. Volgende: devicequota tegen instancegroei, detectievoorstellen en veilige sync; nativecompile blijftMac. Geen productiepublicatie/kosten/mainmerge.


## iOS-bronvoorbereiding — 19 oktober 2026, niet live

CLOUD-005: vijf Swiftbronbestanden voor Codable/backendcontracten, exacteHTTPS/URLSession/netwerkgrenzen/defaultdenySessionAccess, voorbereide XCTestcases en SwiftUI permission/lifecyclevoorbereiding. Geen @main/Xcodeproject/signing/accounts of sensoropname. Swift-toolchain ontbreekt: parse/typecheck/XCTest/simulator/iPhone ALLE NIETGETEST; Node183PASS van vorige backendgroep is geen nativebewijs. Bewijs IOS_CLOUD_PREPARATION.md geeft concrete Macvalidatiestappen zonder authbypass. Draftbranch cloud/cloud-005-ios-preparation op #24-headde6baf2. Volgende cloudtaak: atomaire detectiequota en expliciet onzekere detectievoorstellen, daarna verdere veilige sync. Geen productiepublicatie/kosten/mainmerge.


## Ruwe detectie-inname — 19 oktober 2026, niet live

CLOUD-005/002/004: eigen actieve appinstance+membership, canonieke request/eventdedup, batchaudit en immutable ruwe observaties gebouwd; geen automatische rit. GETPOSTadapter/Accessdispatch en expliciete eerste50waarnemingen in beheerUI.9service/HTTPcases,183Node-tests/type/lint/build, lokaleD1 ingest/dedup/disabledweigering en Chromiumrawview/geenrit/registerrecovery/revoke PASS.0009schema/journal/snapshot afgestemd; geen externe migratie. Bewijs DETECTION_INGEST.md. Draftbranch cloud/cloud-005-detection-ingest op #23-headceaf46a. Volgende: atomische innamequota, nativebronvoorbereiding en detectievoorstellen; volledigeeisen blijven open. Geen productiepublicatie/kosten/mainmerge.


## Eigen appregistraties — 19 oktober 2026, niet live

CLOUD-005/002/004: eigen geverifieerde appinstanties met idempotente registratie, audit/revisie-deactivering, geen heractivatie door oude retries, HTTP/client en handmatige beheerUI gebouwd.17service/HTTPcases en Chromium responseverlies/retry/deactivate/revocation PASS; gecombineerde180tests omvatten zes aparte detectiecases. Type/lint/build en lokale echteD1 register/retry/deactivate PASS. Additieve0008+schema/journal/snapshot afgestemd; geen remote migratie of hardware/loginclaim. Bewijs REGISTERED_DEVICES.md. Draftbranch cloud/cloud-005-registered-devices op #22-head6960896. Volgende: ruwe detectie-inname/HTTP/schema en nativebronvoorbereiding; geen productiepublicatie/kosten/mainmerge.


## Read-only MCP-runtime — 19 oktober 2026, niet live

CLOUD-005/002/004: zes begrensde read-only MCP-tools achter geverifieerde Access-sessies voorbereid, inclusief historiecursor. /api/mcp blijft503 zonder volledige configuratie; spoofidentiteit401, strikte Origin/JSON/protocol/bodygrenzen. Negen MCP-kern/runtimecases PASS; gecombineerde168 Node-tests bevatten elf afzonderlijke devicekernelcases. Type/lint/build, echte lokaleD1 en builtNode geslotenAPI/MCP PASS. Geen OAuth/clientactivatie, livepublicatie of externe gegevensdeling; zie READ_ONLY_MCP.md. Draftbranch cloud/cloud-005-read-only-mcp op #21-head26317fa. Volgende: geregistreerde appinstanties/HTTP/UI, daarna detectie-inname; echte native/Access/provideracceptatie blijft open.


## Opgeslagen routepunten — 19 oktober2026, niet live

CLOUD-005/002/004: scoped read-only routepunten met eerste-batchhighwater en volgende keysetpagina's, strikteHTTP/clientlimieten en opgeslagen-spoorviewer zonder kaartprovider. Geen verzonnen lege route; onderscheid GPS/interpolatie en gaten/precisiewaarschuwingen.10routecases, lokale echteD1batch, type/lint/build en Chromium1203punten/leeg/revocation PASS. Gecombineerde153tests omvat5aparteMCPkerncases; MCPnog niet in deze routegroep. Bewijs ROUTE_READ.md. Nieuwe branch cloud/cloud-005-route-read op #20-head11649e2. Geen GPS-inname/nativevalidatie of livepublicatie/kosten. Volgende: lokale read-onlyMCP-runtime, detectie/devicecontracten, veilige sync/overige openwerkkaart.

## Oudere historie — 19 oktober2026

CLOUD-005/002/004: keyset before-id voor rit-/settinghistorie, strikte HTTPvalidatie en UI ouderepagina/verversreset/dedupe/clearbij401/403/404.138Node-tests op afgeronde paginatiebasis/type/lint/build PASS; browser125regels/type metnieuweaudit/refresh/revocation PASS, recoverybrowser blijftPASS. Bewijs HISTORY_PAGINATION.md. Nieuwe draftbranch cloud/cloud-005-history-pages op #19-head8cf8bc2. Route-read/geometrycode staat parallel los in nieuwe bestanden, nog niet in deze historie-PR. Geen livepublicatie/cloudmutatie/kosten/mainmerge.

## Lokale backup/herstel — 19 oktober2026, niet live

CLOUD-005/002/004: scripts/sqlite-backup.mjs maakt consistente SQLite-backup met AES-256-GCM/authenticated versieheader en key-file buiten Git. Restore uitsluitend nieuw pad, integrity_check/foreign_key_check, geen overschrijven/symlinks.5gerichte tests PASS inclusief echt RitKompas-schema/trips/audit/rapportimmuutheid/revisieguards; lint PASS. Bewijs SQLITE_BACKUP.md. Tijdelijke plaintext onder private0700map en crash/keybeheer/Mac/remoteD1-grenzen expliciet. Eerste streamtesthang opgelost vóór afronding; volledige eerdere133suitePASS, vijfde test apartPASS. Geen productieactie/kosten. Volgende draftbranch cloud/cloud-005-local-backup op #18. Paginatie oudere historie parallel in uitvoering; root wijzigt die bestanden niet.

## Herstelbare invoer — 19 oktober2026, niet live

CLOUD-005/002/004: opt-in IndexedDB voor exacte create-trip/create-report-aanvragen, scope uit geverifieerde viewer+vehicle, expected-viewerprecondition, transactionele compare-before-delete en contextreset bij accountwissel.129Node-tests plus echte Chromium IndexedDB/tabsluiten/responseverlies/recovery/geen duplicaat/accountwissel/stale-delete/revocation PASS; type/lint/build en bestaande centrale browser/PDF PASS. Bewijs PENDING_RECOVERY.md. Geen volledige offline-/Safari-/crashclaim; PATCH-invoer en auto-sync nog open. Backupgroep parallel afzonderlijk in nieuwe bestanden; geen productieactie. Nieuwe draftbranch cloud/cloud-005-pending-recovery vanaf #17-head9246810.

## Vervolggroep instellingenhistorie — 19 oktober2026

CLOUD-005/002/004: centrale historie van kenteken, adressen en tarieven met reden, account-ID en voor/na gebouwd. Bestaande scoped backend hergebruikt; laatste50expliciet begrensd, oudere historie blijft bewaard. Herlezen na revocation wist de oude lijst.128Node-tests/type/lint/build PASS; echteHTTP/SQLite en centrale Chromium met drie settingsredenen en geweigerde verversing PASS, PDF16pagina's/geslotenAPI PASS. Geen livepublicatie, cloudmutatie of kosten. Vervolgcommit op draft#17, basisgroep127tests blijft afzonderlijk bewezen. Volgende: herstelbare pendingqueue/cursors, detectie/backups/MCP en overige OPEN_WORK.

## Nieuwste groep — samenhangend verversen, niet live

CLOUD-005: vehicle/snapshot via één read-only D1-batchtransactie; UI gebruikt snapshot bij laden/verversen/na writes.127tests/type/lint/build, echte lokale D1 en volledige centrale browser/PDF/geslotenAPI PASS. Privacy/scoping/revocation/expiry/groottegrenzen getest. Geen incremental cursor, auto-sync of duurzame queueclaim. Bewijs COHERENT_REFRESH.md; actuele openwerkkaart docs/TRANSFER/OPEN_WORK.md. Nieuwe branch cloud/cloud-005-coherent-refresh op exacte#16-head6523edc. MacAccess onaangeroerd; geen livepublicatie/kosten/mainmerge.

## 19 oktober2026 — nieuwste ontwikkelgroep, nog niet live

CLOUD-005: bestuurdercorrectie met audit/unknown/revocation en centrale onveranderlijke rapportweergave + browserafdruk/PDF gebouwd.123Node-tests/type/lint/build en centrale browser PASS. LangePDF81ritten/80extra langeadressen16A4pagina's, allebestemmingen/headers/paginanummers gecontroleerd; geen serverPDFclaim. Lokale geslotenAPI PASS. Bewijs docs/TRANSFER/CENTRAL_REPORT_VIEW.md. Nieuwe branch cloud/cloud-005-report-view op exacte #15-headcf3b638. Mac doet Access via computer use; die configuratie ongemoeid. Geen nieuwe livepublicatie, kosten of mainmerge.

Volgende ontwikkeling: coherente sync/cursors en duurzame pendingqueue, detectie-inname/deduplicatie, backups/read-onlyMCP en afzonderlijke serverPDF. Echteproviderlogin/remotegebruikers en iPhone/Safari/native NIET GETEST.

## Nieuwste Access-controle en publicatiebeperking

Eigenaar bevestigt Zero Trust Free actief. Read-only API bevestigt organisatie snowy-snowflake-4760.cloudflareaccess.com; apps nog leeg, bestaande IdP type cloudflare. Hosting en exacte APP_ORIGIN opnieuw vanaf GitHub gecontroleerd: https://rittenregistratie.zsj4j2s4df.workers.dev, Workers+D1, geen eigen domein nodig voor proef. iPhone-invulvelden en veilige fallback: docs/TRANSFER/ACCESS_IPHONE_SETUP.md. Oude actie “Access activeren” is uitgevoerd; volgende eigenaaractie is app/destination/expliciete allowlist opslaan. Nog geen echte loginclaim.

Nieuwste instructie: **geen nieuwe livepublicatie zonder toestemming, geen kosten**; oudere publicatieopdracht is voor volgende releases niet voldoende. Tijdens deze taak alleen read-only Cloudflare. Zelfstandig toegevoegd: offline Access-configuratiecontrole vóór latere aansluiting,122Node-tests/type/lint PASS; geen appdeploy of accountprovisioning. Draft-GitHubwijzigingen toegestaan, main ongemoeid.

Cloud leidt RitKompas; Mac doet iOS/hardware. Eigenaar behoudt merge-/kosten-/account-/productiebesluiten. GitHub is bron van waarheid, alleen zsj4j2s4df-pixel/Rittenregistratie. Alle123REQ-ID’s/21scenario’s/mastereisen behouden.

## Nieuwste hervatpunt: Cloudflare gepubliceerd

Draft-PR #14: https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/14, base cloud/cloud-005-central-web (#13), eerste releasecommit6484a22b8c3d128aa83fbb66a36158dd7d97e412.23/23bestanden exact remote teruggelezen. Vervolggroep op dezelfde draftbranch: scoped actieve bestuurderslijst zonder email/auth-ID, bestuurderkeuze bij invoer/rapport en ritfilters op Amsterdamdatum/classificatie/bestuurder/adres/doel.119tests/type/lint/build en uitgebreide centrale browser PASS. Nieuwste Workerdeployment99e7ef93427c4a77979caa6afc83c978. Main opnieuw d37d8c9 ongewijzigd; ruleset25339571 actief met PR/deletion/nonfastforward en geenbypass,0verplichteapprovals.

Adres https://rittenregistratie.zsj4j2s4df.workers.dev, Worker rittenregistratie + EU-D1 UUID5cee8499-45cf-47a4-8960-4b43e4ab8204. Acht migraties0000–0007 bevestigd, users0/trips0. Centrale adres-/tariefCRUD en ritcorrectie/historie gebouwd;117tests/type/lint/build/D1/centrale browser PASS, live demo/Chromium en geslotenAPI503 PASS. ACCESS_ISSUER/AUDIENCE bewust afwezig; echte login NIET GETEST. Owneractie: ZeroTrust/Access kosteloos activeren; gekoppelde GitHubidentiteit nog eigenaar. Geen mainmerge. Publicatie geautoriseerd, geen nieuwe toestemming vragen voor deze bestaande Worker.

Zie docs/TRANSFER/CLOUD_RELEASE.md voor exact deploybewijs en reproductie. Nieuwe draftbranch cloud/cloud-005-cloudflare-release op echte #13-head7fc9eccff54a177380426794ff88d832bf0f0baa. Oudere tekst hieronder is historie waar ingehaald. Volgende lokale taken: coherente sync en duurzame pendingqueue, detectie/deduplicatie, backups/read-onlyMCP/centralePDF. Geen algemeneaccountblokkade.

## Actuele code en PR-keten
#1audit → #2eisenregister → #3Macoverdracht → #4Cloudsmoke → #5integriteitsguards → #6demoweb/rapporten → #7serverkern → #8idempotenteinvoer → #9HTTPadapter → #10settings/Accessvoorbereiding → #11serverrapporten → #12APIruntime → #13centraleweb.
Nieuwe PR’s blijven draft/open; nooit mergen, forcepushen, bases herschrijven of rechtstreeks main bijwerken.

- #10 cloud/cloud-005-settings-storage, head4082d51: scopedsettings en AccessRS256-verificatie voorbereid,89testsPASS. Onderzoek Cloudflare/aparteagent afgerond, geen accounts/deploys.
- #11 https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/11 — cloud/cloud-005-server-reports, headef43bd7, base#10. Coherente onveranderlijke snapshots, integergeld/unknowncounts, Amsterdamdates, scoped retry/audit/CSV en grensoverschrijdende overlap.101tests/type/lint/build/D1PASS. SERVER_REPORTS.md.
- #12 https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/12 — cloud/cloud-005-api-runtime, head5873ad4, base#11. API standaard503bij ontbrekendeconfig;401zonderJWTwanneerconfigured. Dynamische Workerimport voorkomt Node500, echtebuiltAPI-smokePASS.105tests/type/lint/build/D1 en demobrowserPASS. API_RUNTIME.md.
- #13 https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/13 — cloud/cloud-005-central-web, codeheadfa7d31c23cddd6c7b826b7e960ebb54ac38b379a, base#12. /beheer met vehiclelist/privacyscope, manualtrip/0stand, kenteken/revision, vastreport/CSV en veilige reconnect.111tests/type/lint/buildPASS. CentraleChromium→HTTP→SQLite metsyntheticidentityPASS inclusief responseverlies→reconnect→retry zonderdubbel, reload, conflict409, report/CSV en mobiel/theme. Demobrowser/closedAPI/D1PASS. CENTRAL_WEB.md.

31/31bestanden van drie laatste groepen exact remote teruggelezen op codeheadfa7d31c. Deze hervat/checkpointactualisatie volgt als documentcommit op dezelfde#13branch. main opnieuw d37d8c913aaa253d6297cf57d3379d40c5795573, ongewijzigd. Werkmap was oorspronkelijk blobgeverifieerde snapshot: NOOIT lokale synthetische gitgeschiedenis pushen. GitHubcommits met echteparent/tree/expected_sha, geenforce.

## Vorige uitvoerbare lokale taak (adres/tarief/correctie inmiddels gebouwd)
Centrale adres-/tariefCRUD en ritcorrectie/historie boven bestaande services; daarna bestuurder/filters, correcte sync/cursors/pendingqueue, detectie-inname/deduplicatie, herstel/backups/read-onlyMCP en serverPDF. In /beheer zijn deze volledige flows nog niet gebouwd. Pendingcodes alleengeheugen: aangebodenreconnect behoudt ze, handmatig browserafsluiten/reloadtijdensonzekerewrite is nog geen herstelbareofflinequeue. Gepagineerdlijstlezen is geen coherentemulti-requestsnapshot. Geen alles-klaarclaim of algemeneaccountblokkade.

## Persoonlijke acties / externe blokkade
Eigenaar koos Cloudflareonderzoek en aparteagenttoegang; dezelfdekeuze niet opnieuw vragen. OWNER_ACTIONS.md bevat concrete koppelstappen, SEPARATE_AGENT_ACCESS.md en CLOUDFLARE_RESEARCH.md onder docs/TRANSFER bevatten onderzoek, STAGING_RUNBOOK.md de voorwaarden. Huidige connector is opnieuwbevestigd eigenaarlogin296047649; geen wisselactie beschikbaar. Aparte ingelogde accountkoppeling moet persoonlijk worden uitgevoerd via ondersteundeintegratie, geen geheimentokens inchat.
Ruleset25339571 opnieuw active, PR/deletion/nonfastforward, geenbypass,0verplichteapprovals. DriegevraagderegelsAFGEROND; identiteitsscheiding/eigenaarsreview OPEN. Geenagentmerge.
Historie vóór nieuwste publicatiegroep: Cloudflare niet geactiveerd; geen readycredentials/bindings voorremoteaccount. Workers/D1-EU/Access slechts onderzocht. AccessFree vraagt betaalgegevens volgensofficiëleonboarding; geen aankoop/account/deployzondertoestemming. Echteproviderlogin, remoteDB/sync, WorkerCPU/quota/geografischeprivacy, logoutrevocation, nativeapp/iPhone/Jeep/CarPlay/OBD2 NIETGETEST. Rootweb blijftdemo; /beheer toont bij ontbrekendeconfiggeslotenfout, nooitvoorbeeldritten.

## Reproductie
Node24.19.0/Linux,pnpm11.25.0,bestaande frozenlockfiledependencies. node --experimental-strip-types --test tests/*.test.mjs; pnpm exec tsc --noEmit; pnpm lint; pnpm build; node --experimental-strip-types tests/d1-runtime-smoke.mjs. Builtlocalserver: tests/api-closed-smoke.mjs. Browser: tests/central-browser-smoke.mjs en tests/browser-smoke.mjs met APP_URL,geïsoleerdePLAYWRIGHT_MODULE/BROWSER_EXECUTABLE. Zie transferrapporten voor bewijsgrenzen. Geen sessies/models/instellingen gemigreerd.
