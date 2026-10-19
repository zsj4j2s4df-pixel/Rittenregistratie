# Actuele voortgang — 18 oktober 2026

## Actueel — CLOUD-013 / 19 oktober 2026

Deze branch is een geïsoleerd code-only releasevoorstel vanaf PR14 `6c3f60834b36fe84ed43360c27f3feb8d2438ef7`. Nieuwere cumulatieve ontwikkeling staat in PR33, Mac-bewijs in PR32. Niet deze oudere brontekst als volledige nieuwste projectbasis gebruiken. Live login blijft FAIL; eigenaar is reeds geprovisioneerd (1 gebruiker/voertuig/recht, 0 ritten, 2 audits). Geen nieuwe provisioning/migratie/configuratie/publicatie toegestaan zonder nieuwe toestemming. Oudere publicatieopdrachten hieronder zijn historie waar strijdig.

CLOUD-013: ondertekende app-cookie als strikt begrensde fallback bij ontbrekende assertionheader; crypto/account/voertuigcontroles ongewijzigd. 124/124 Node-tests, type/lint/build en lokale D1 PASS. Originele resolver reproduceert cookie-only 401, patch200; exacte live oorzaak en live oplossing NIET bewezen. Plan, rollback en Mac-eindtest: [ACCESS_TRANSPORT_FIX.md](docs/TRANSFER/ACCESS_TRANSPORT_FIX.md). Volgende stap: beperkte draft-PR review + fix naar cumulatieve branch; live test pas na expliciete toestemming voor dit concrete code-only pakket. Main/Access/DB onaangeraakt.

## Nieuwste centrale webgroep — draft-PR #13

/beheer communiceert met echte gedeelde backend, geen demodatafallback. Vehiclelist/privacy, manualtrip/0stand, plate/revision, vaste report/CSV.111tests/type/lint/build PASS. Centrale browsertest met gesimuleerde identiteit en echteHTTP/SQLite: lostresponse→reconnect→retry zonderduplicaat, reload, concurrent409, CSV, mobile/theme PASS. Reconnectreviewbevinding en 2browserbugs gefixt, hercontrolePASS. Geen liveCloudflarelogin/remoteDB, fullCRUD/sync/native niet af. Zie CENTRAL_WEB.md.

Opslagcontrole:31/31betrokkenbestanden uit#11/#12/#13 exact remote teruggelezen opfa7d31c23cddd6c7b826b7e960ebb54ac38b379a. main ongewijzigd d37d8c913aaa253d6297cf57d3379d40c5795573. Huidige login opnieuw eigenaar296047649, rulesetactive/3regels/0approvals. Persoonlijke koppelstappen OWNER_ACTIONS.md, nietafgeronde functies RESUME.md. Geen extraaccount/kosten/publicatie/merge.

## API-runtimegroep — draft-PR #12

AppAPIroutes aangesloten met geldigeWorkerconfig/geverifieerde identiteit. Ontbrekend/ongeldig503; Node500door Workerimport opgelost.105tests/type/lint/build en builtNode503-smokePASS; lokaleD1PASS. Geen site/deploy/account, demo tijdelijk. Zie API_RUNTIME.md. Volgende groep:web/backendadapter.

## Serverrapportgroep — draft-PR #11

Coherente bronselectie en duurzame onveranderlijke rapporten met scoped retry, audit, exportrechten en CSV.101tests/type/lint/build en lokaleD1 PASS.Over-middernacht-overlapfout gerepareerd na onafhankelijke review; hercontrolePASS. Geen publieke login/serverPDF/websync. Bewijs SERVER_REPORTS.md. Volgende veilige groep: gesloten runtimeadapter.

## Eerdere groep — duurzame instellingen en Cloudflare-voorbereiding, draft-PR #10

Eigenaarkeuzes ontvangen: Cloudflare onderzoeken, aparteagenttoegang. Officiële bronnen onderzocht en ownerstappen beschreven; geen externe activatie. Backendsettingsopslag met voertuigscope, revision en audit +settingsHTTP +cryptografische AccessRS256-resolver voorbereid.89/89tests, type/lint/build en lokale D1HTTP/settings/rollback/synthetische identiteit PASS.2legacyreviewfouten hersteld met regressies en hercontrole; Accessgerichte review geen concrete fout. Web blijft demo, echte providerlogin/sync/native niet getest. Zie docs/TRANSFER/SETTINGS_STORAGE.md. Volgende technische groep: duurzame serverrapporten/exportrechten.

Nieuwe groep:21/21 bestanden exact teruggelezen op723e317c733055faf88d08f6485b318b9579de22, main ongewijzigd. Staging/accountvoorwaarden concreet in STAGING_RUNBOOK.md; geen externe resources aangemaakt.

## Opslagcontrole

Draft-PR’s #4–#9 aangemaakt; #7–#9 bevatten serverkern, idempotente aanmaak en HTTP-adapter.23/23 betrokken backend-/voortgangsbestanden exact remote teruggelezen op d42bc91273dcd451db96a6a714a22f9db1e4f4da. main blijft d37d8c913aaa253d6297cf57d3379d40c5795573. Laatste codegate:71tests, type/lint/build, lokale D1 PASS. Open werk en bewijsgrenzen staan in CLOUD_CHECKPOINT.md. Geen volledige-appclaim.

## Nieuwste HTTP-groep — CLOUD-005

Draft-PR #9 (cloud/cloud-005-http-adapter), base ritinvoer/draft-PR #8: providerneutrale handler voor list/detail/history/create/edit; objectrechten in gedeelde kern, exact Origin/CSRF, JSON16KiB, no-store en veilige fouten.71/71tests, echte lokale D1 HTTP-read/write en typecheck/lint/build PASS. Eén gerichte boundary-review: geen concrete fout. Niet publiek aangesloten. Bewijs: docs/TRANSFER/TRIP_HTTP.md.

## Aanmaakgroep — CLOUD-005

cloud/cloud-005-server-create, base server-core/draft-PR #7: handmatige serverrit met scoped retry-idempotentie, atomische rit/receipt/audit en oorspronkelijke response.65/65tests, lokale D1 inclusief gelijktijdige retry en auditrollback, typecheck/lint/build PASS. Eén gerichte onafhankelijke review: geen concrete fout. Nog geen publieke login/API. Bewijs: docs/TRANSFER/SERVER_CREATE.md. Volgende groep: veilige HTTP-adapter.

## Backendgroep — CLOUD-005

Serverkern cloud/cloud-005-server-core, base cloud/cloud-005-reporting (PR #6): voertuiggebonden rechten, ingetrokken toegang, revisionconflicten, atomische correctie/audit, bronbehoud en databaseguards. 61/61 tests, typecheck/lint/build en echte lokale workerd/D1-binding PASS. Twee gerichte reviews vonden dezelfde afstandsbronfout; opgelost met regressie en hercontrole. Geen productieauth of duurzame webopslag aangesloten. Bewijs: docs/TRANSFER/SERVER_CORE.md. Volgende technisch uitvoerbare groep: serverritinvoer met retry-idempotentie; daarna instellingen/rapporten en sync. OWNER_ACTIONS bevat uitsluitend persoonlijke keuzes.

## Webgroep — CLOUD-005

Werkbranch cloud/cloud-005-reporting, base integriteitsbranch (draft-PR #5). Handmatige ritinvoer, kenteken, historische tariefperioden, onveranderlijke rapporten, CSV en browser-afdruk/PDF, adresbeheer en eerlijke routeweergave toegevoegd. 50/50 Node-tests, typecheck/lint/build PASS; Chromium-desktop/mobiel en daadwerkelijke CSV/PDF PASS. Eén onafhankelijke review; beide concrete bevindingen afgedicht en hercontrole PASS. Details: docs/TRANSFER/REPORTING_WEB.md. Alleen demosessiestate; serverauth/opslag/sync/native/fiscale acceptatie nog open. Volgende taak: geteste serverrepository, geen nieuwe dienst of productie.

## Nieuwste codegroep — CLOUD-002/004

Omgevingsblokkades opgelost; draft-PR #4 bewaart de smoke en actuele ACT-002-controle. Werkbranch cloud/cloud-002-004-integrity: additieve migratie 0001 met INSERT/UPDATE-bewaking; vijf nieuwe in-memory regressietests, 37/37 tests PASS, typecheck/lint en webbuild PASS. Oude migratie/data behouden; geen live migratie. Bewijs: docs/TRANSFER/INTEGRITY_FIX.md. Volgende groep: CLOUD-005, rapportage/webbediening. Oudere blokkeringsmeldingen hieronder zijn historie.

> **Actuele aanvulling, 18 oktober 2026:** omgevingsherstel bevestigd. Dependencyinstallatie met ongewijzigde lockfile en supply-chaincontrole PASS; 32/32 tests, TypeScript, lint en webbuild PASS. Draft-PR #4 is aangemaakt. Oudere proxy-/credits-/NIET GETEST-vermeldingen hieronder blijven historie van eerdere pogingen. Geen main-merge, nieuwe account of productiepublicatie.

## Historie — eerdere publicatieblokkade (opgelost)

- Cloud blijft hoofdmanager en hoofdontwikkelaar; Mac ondersteunt iOS/hardware. Eigenaar houdt besluit- en mergecontrole.
- Eigenaar heeft ACT-002 handmatig uitgevoerd. API-controle bevestigt ruleset 25339571 active voor main met pull_request/deletion/non_fast_forward; geen bypass-actoren. Handmatige instelling en die drie technische regels AFGEROND.
- Connector-login is nog steeds zsj4j2s4df-pixel, gelijk aan eigenaar; required_approving_review_count is 0. Onafhankelijke eigenaaronderscheiding OPEN. OWNER_ACTIONS gericht bijgewerkt, historie behouden.
- CLOUD-008-uitvoeringsbewijs en CSV-test staan remote op `1830e7efd7d08553ad5b44864b18933fa906d3a0`; alle zeven bestanden exact teruggelezen. **Draft-PR-aanmaak is NIET uitgevoerd**: automatische goedkeuringscontrole faalde wegens workspacecredits. Dit corrigeert eerdere vooruitlopende verwijzingen naar een draft-PR hieronder. Geen upload-/PR-controle omzeild.
- CLOUD-002/004 gericht voorbereid: 32/32 tests PASS in scoped coverage-run; de drie geladen pure modules hebben 100% line coverage en samen 96,06% branch coverage. Geen appbrede coverageclaim. Schemabeperking met ongeldige classificatie/negatieve afstand/omgekeerde tijden in geïsoleerde SQLite gereproduceerd; geen productiegegevens of migratie gebruikt.
- Deze laatste eigenaar-/voorbereidings-/hervatupdates zijn **lokaal opgeslagen, pending GitHub-upload** door de goedkeurings-/usageblokkade. Actuele open PR's blijven #1, #2 en draft #3. Geen CLOUD-008-PR aangemaakt, geen bestaande PR gemerged of geretarget.
- Volgende veilige stap en bronnen: docs/TRANSFER/MAIN_SECURITY_CHECK.md en CLOUD_002_004_PREPARATION.md. Dependencies blijven onbeschikbaar wegens registry/proxy; typecheck/lint/build NIET GETEST. Geen nieuwe implementatiegroep gestart zonder de vereiste GitHub-oplevering te kunnen doen.

## CLOUD-008 — nieuwe Cloud-uitvoering

De broncode is nu aantoonbaar beschikbaar; oudere ontbrekende-code-aannames zijn uitsluitend historie. Alle 82 bronblobs op commit `8b50e9109b51770f6cf4d0eec25eac38c17e4b76` via GitHub opgehaald en met Git-blobhashes geverifieerd. Node v24.19.0 op Linux x86_64: 31/31 individuele baselinetests PASS, daarna 32/32 PASS met CSV-regressietest voor beginstand 0 en toelichting met quotes/formuleprefix/newline. Productiecode niet gewijzigd.

Standaard runner rapporteerde slechts vier bestandschecks; individuele testbewijzen gebruiken `--test-isolation=none`. Typecheck/lint/build in Cloud NIET GETEST: geen bestaande dependencies; geïsoleerde frozen-lockfile-installatie faalt bij registrymetadata. CLI Git-proxy niet bereikbaar; GitHub-connector werkt. Geen netwerk-/supply-chain-beveiliging omzeild. Node-historiescanner strandt op spawnSync git EPERM; beperkte bronpatroonscan apart uitgevoerd, geen onafhankelijke securitygoedkeuring.

Eigen branch `cloud/cloud-008-handover-smoke` vanaf exacte overdrachtscommit; draft-PR met base `handover/mac-to-cloud-20261018`. Bewijs en vervolgstap: [CLOUD_PROOF](docs/TRANSFER/CLOUD_PROOF.md). ACT-002 blijft open; PR #1 → #2 → #3 intact, geen merge/forcepush/nieuwe accounts/kosten/productie. Oude Mac-teststatus hieronder blijft apart bewijs; geen sessies/models/instellingen gemigreerd.

## Overdracht

- Volledige relevante lokale broncode geselecteerd voor overdrachtsbranch; bestaand Cloudwerk als voorouder behouden.
- Lokale oorspronkelijke werkmap had geen `.git`; geen verborgen lokale commits/branches te verhuizen. 15 bestaande remote commits zijn opgehaald, inclusief de volledige PR #1/#2-keten.
- Mac-documenten als afzonderlijke snapshot bewaard; Cloud-eisenregister (123 ID's), testplan (21 scenario's), audits en securityvoorcontrole blijven intact met actuele statusnotities.
- Privacy: echte Jeep-foto en onbekende sociale preview niet publiceren; originele bestanden blijven lokaal. Cloudversie gebruikt een eigen SVG-placeholder. Geen runtime-data, caches, dependencyfolders, certificaten of backup-archieven geselecteerd.
- Eerste patroonscan: 68 geselecteerde bestanden en 33 historische blobs, 0 treffers; definitieve controle en terugleesbewijs volgen. Dit is geen garantie tegen ieder type geheim.

## Gebouwd op Mac

Webprototype in React/Vinext: donker/zand, voorbeeldritten, classificatie, ritcorrectie met veldcontroles en tijdelijke before/after-geschiedenis, datum/bestuurder/classificatiefilters, demo-CSV met formula-escaping en waarschuwingen. Pure toegangs-/detectiebeleidsfuncties plus zeven-tabellenschema. Geen duurzame registratie of API-autorisatie aangesloten.

## Teststatus

18 oktober: de daadwerkelijke overdrachtscheckout slaagt voor 31/31 Node-tests, typecheck, lint en webbuild met bestaande Mac-dependencies; geen installatie gedaan. Details en beperkingen in docs/TRANSFER/VALIDATION.md. Browsercontrole eerder geweigerd; niet omzeild. Echte iPhone, simulator, Bluetooth/CarPlay/OBD2, centrale opslag, PDF, MCP en back-ups NIET GETEST.

## Open

CLOUD-008 Cloud-proef; main-bescherming en identiteitsbeperking (OWNER_ACTIONS ACT-002); native Xcode/iPhonewerk; backend- en providerkeuze. Geen nieuwe kosten of productie. Twee extra Astra-reviewagents faalden eerder met kredietmelding; de precieze oorzaak is niet vastgesteld en gewone accountlimieten waren niet uitgeput. Geen bijkoop nodig voor de lokale controles.


## 18 oktober 2026 — Cloudflare-release en centrale correcties

CLOUD-005/002/004: adres-/tariefCRUD en ritcorrectie/historie geïntegreerd.117tests/type/lint/build/D1 PASS; centrale browser met nieuwe flows PASS. Werkelijke Worker en EU-D1 aangemaakt/gepubliceerd na expliciete eigenaaropdracht; acht migraties, users0/trips0, live demo/assets en API503 PASS. Geen accountloginclaim. Assetsupload401 omzeild met credentialvrije ingebedde publieke assetmodules, geen beveiligingsbypass. Accessorganisatie ontbreekt, login blijft gesloten. Nieuwe draftbranch cloud/cloud-005-cloudflare-release gebaseerd op #13-head7fc9ecc, keten behouden. Volledig bewijs/beperkingen: docs/TRANSFER/CLOUD_RELEASE.md. Volgende lokale taak: bestuurder/filters of duurzame pendingqueue; persoonlijke stap: ZeroTrust/Access activeren zonder kosten. Native/hardware en productieauth nog NIET GETEST.


### Vervolggroep in dezelfde run: bestuurderkeuze en filters

Op draft-PR #14, zonder mainmerge. Alleen actieve bestuurders van het toegestane voertuig worden geleverd via GET /api/vehicles/:id/drivers, velden uitsluitend id/name en no-store. Callerautorisatie wordt in SQL herhaald; disabled/revoked/ander voertuig/malformedquery/method tests PASS. Centrale ritinvoer kiest expliciet bestuurder of onbekend, vaste rapporten kunnen per actieve bestuurder worden gemaakt; overzichtfilter op Amsterdamdatum, classificatie, bestuurder en adres/doel. Filters veranderen geen rapporten en zijn geen autosync.119tests/type/lint/build PASS, centrale ChromiumHTTP→SQLite inclusief driverkeuze/filter PASS; lokale D1-regressie PASS. Deployment99e7ef93427c4a77979caa6afc83c978. Login blijft gesloten. Main en actieve3regels opnieuw teruggelezen; onafhankelijke eigenaaridentiteit blijft open.
