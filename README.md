# RitKompas — Rittenregistratie

> **Gezamenlijke actuele basis:** CloudPR28/29 en MacPR30 zijn gecombineerd. Cloud heeft PR27 aantoonbaar verwerkt; Mac heeft de GitHub-retourtest uitgevoerd. Zie [ontvangstbewijs](docs/TRANSFER/MAC_CLOUD_ACK_RESULT.md).197Node-tests/type/lint/build op Mac PASS, native iOS/hardware nog open. Volgende runs starten met RESUME.md en centrale Cloudplanning PR27_PLAN.md.

> **Nieuwste overdracht, 19 oktober 2026:** lees [PR27-plan](docs/TRANSFER/PR27_EXECUTION_PLAN.md), [hervatpunt](RESUME.md), [Mac-/Cloud-ontvangstbewijs](docs/TRANSFER/MAC_CLOUD_CHANNEL_TEST.md) en [Zero Trust-resultaat](docs/TRANSFER/MAC_ZERO_TRUST_2026-10-19.md). De bestaande keten loopt tot PR #26; het parallelle memo #27 is hier meegenomen. GitHub is centraal, Cloud coördineert, Mac valideert native/hardware, eigenaar beslist over belangrijke wijzigingen. Corecompile op Mac en187Node-tests PASS; geen iPhone-acceptatieclaim.

Project voor de Jeep Wrangler Unlimited 80th Anniversary 4xe: native iPhone-app, webinterface en centrale gegevensbron volgens de masterprompt.
Deze overdrachtsbranch bevat nu de bestaande webcode, gegevenscontroles, databaseontwerp en 31 automatische tests. De app is een tijdelijke demo, geen productieklare registratie. Native iPhone-app, echte GPS, accounts, opslag/sync, PDF en MCP ontbreken nog.

## Actuele besturing — 18 oktober 2026

**Cloud ontwikkelt; Mac ondersteunt; jij beslist.** GitHub is de centrale bron van waarheid. Sol is voorkeur voor dagelijkse regie indien beschikbaar, Astra alleen voor belangrijke beslissingen. Geen automatische overdracht van agents, sessies of modelinstellingen. Zie [CLOUD_HANDOVER](CLOUD_HANDOVER.md), [RESUME](RESUME.md), [DEVELOPMENT_PROGRESS](DEVELOPMENT_PROGRESS.md) en [AGENTS](AGENTS.md).

## Testen en starten

Node 24 aanbevolen. Pure tests zonder package-installatie: `node --experimental-strip-types --test tests/*.test.mjs`. Met bestaande/toegestane lockfile-dependencies: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, lokaal `pnpm dev`. Geen secrets nodig voor de demo. Cloud-installatie en tests worden apart geverifieerd; Mac-uitvoer is geen Cloudbewijs.

## Begin hier

- [Masterprompt en functionele wensen](Jeep_4xe_Rittenregistratie_Masterprompt_BIJGEWERKT.md)
- [Uitvoeringsvolgorde en nieuwste Sol-regie](RitKompas_Astra_Opperagent_Complete_Opdracht.md)
- [Mac/Cloud-samenwerking](RitKompas_Codex_Mac_Cloud_Samenwerking.md)
- [Cloud-taken en blokkades](CLOUD_TASKS.md)
- [Persoonlijke acties](OWNER_ACTIONS.md)
- [Voortgang en bewijs](docs/ASTRA_AUDIT/PROGRESS.md)
- [Eisenregister](docs/ASTRA_AUDIT/REQUIREMENTS_TRACE.md)
- [Testplan](docs/ASTRA_AUDIT/TEST_PLAN.md)
- [Documentbevindingen](docs/ASTRA_AUDIT/DOCUMENT_REVIEW.md)
- [Brononderzoek en kosten](docs/ASTRA_AUDIT/FEASIBILITY_RESEARCH.md)
- [Securityvoorcontrole](docs/ASTRA_AUDIT/SECURITY_PRECHECK.md)
- [Code-auditstatus](docs/ASTRA_AUDIT/CODE_AUDIT.md)
- [Voorbereidende backend/webtaken](docs/ASTRA_AUDIT/BACKEND_WEB_CANDIDATES.md)

## Werkwijze

Cloud coördineert de ontwikkeling; Mac ondersteunt lokale/iOS/hardwaretaken. Wijzigingen via branches en PR's; alleen de eigenaar mag toestemming geven voor main-merge en andere belangrijke handelingen. Geen automatische merge of productiepublicatie.
Open op iPhone de GitHub-branch of PR om voorgestelde documenten te bekijken; bestanden verschijnen pas na goedgekeurde samenvoeging op main.

## Huidige beperking

De broncode is als overdrachtsvoorstel toegevoegd boven op PR #2; PR #2 hangt af van PR #1. Geen van deze PR's is automatisch gemerged. Bestaande Cloud-documentatie en de aparte [Mac-snapshot](docs/MAC_SNAPSHOT_2026-10-18/README.md) blijven behouden. Foto en sociale preview blijven lokaal; de app gebruikt een gemarkeerde placeholder. Main-bescherming/eigenaarreview is nog niet technisch bevestigd: zie [ACT-002](OWNER_ACTIONS.md).
