# Actuele voortgang — 18 oktober 2026

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
