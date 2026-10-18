# Actuele voortgang — 18 oktober 2026

## Nieuwste webgroep — CLOUD-005

Werkbranch cloud/cloud-005-reporting, base integriteitsbranch (draft-PR #5). Handmatige ritinvoer, kenteken, historische tariefperioden, onveranderlijke rapporten, CSV en browser-afdruk/PDF, adresbeheer en eerlijke routeweergave toegevoegd. 50/50 Node-tests, typecheck/lint/build PASS; Chromium-desktop/mobiel en daadwerkelijke CSV/PDF PASS. Eén onafhankelijke review; beide concrete bevindingen afgedicht en hercontrole PASS. Details: docs/TRANSFER/REPORTING_WEB.md. Alleen demosessiestate; serverauth/opslag/sync/native/fiscale acceptatie nog open. Volgende taak: geteste serverrepository, geen nieuwe dienst of productie.

## Nieuwste codegroep — CLOUD-002/004

Omgevingsblokkades opgelost; draft-PR #4 bewaart de smoke en actuele ACT-002-controle. Werkbranch cloud/cloud-002-004-integrity: additieve migratie 0001 met INSERT/UPDATE-bewaking; vijf nieuwe in-memory regressietests, 37/37 tests PASS, typecheck/lint en webbuild PASS. Oude migratie/data behouden; geen live migratie. Bewijs: docs/TRANSFER/INTEGRITY_FIX.md. Volgende groep: CLOUD-005, rapportage/webbediening. Oudere blokkeringsmeldingen hieronder zijn historie.

> **Actuele aanvulling, 18 oktober 2026:** omgevingsherstel bevestigd. Dependencyinstallatie met ongewijzigde lockfile en supply-chaincontrole PASS; 32/32 tests, TypeScript, lint en webbuild PASS. Draft-PR #4 is aangemaakt. Oudere proxy-/credits-/NIET GETEST-vermeldingen hieronder blijven historie van eerdere pogingen. Geen main-merge, nieuwe account of productiepublicatie.

## Laatste status — eigenaarregels gecontroleerd, publicatieblokkade bereikt

- Cloud blijft hoofdmanager en hoofdontwikkelaar; Mac ondersteunt iOS/hardware. Eigenaar houdt besluit- en mergecontrole.
- Eigenaar heeft ACT-002 handmatig uitgevoerd. API-controle bevestigt ruleset 25339571 active voor main met pull_request/deletion/non_fast_forward; geen bypass-actoren. Handmatige instelling en die drie technische regels AFGEROND.
- Connector-login is nog steeds zsj4j2s4df-pixel, gelijk aan eigenaar; required_approving_review_count is 0. Onafhankelijke eigenaaronderscheiding OPEN. OWNER_ACTIONS gericht bijgewerkt, historie behouden.
- CLOUD-008-uitvoeringsbewijs en CSV-test staan remote op `1830e7efd7d08553ad5b44864b18833fa906d3a0`; alle zeven bestanden exact teruggelezen. **Draft-PR-aanmaak is NIET uitgevoerd**: automatische goedkeuringscontrole faalde wegens workspacecredits. Dit corrigeert eerdere vooruitlopende verwijzingen naar een draft-PR hieronder. Geen upload-/PR-controle omzeild.
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
