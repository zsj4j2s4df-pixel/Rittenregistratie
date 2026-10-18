# CLOUD-008 — bewijs van echte Cloud-overdrachtstest

Datum: 18 oktober 2026 (Europe/Amsterdam). Eigen controle in de bestaande Cloud-run; geen onafhankelijke review.

## Bron, runtime en werkspoor

- Repository: uitsluitend `zsj4j2s4df-pixel/Rittenregistratie`.
- Overdrachtsbasis: `handover/mac-to-cloud-20261018`, exacte commit `8b50e9109b51770f6cf4d0eec25eac38c17e4b76`, brontree `e2d9d8a76483bebef6a013a337d91fc85cb943ac`.
- Instructies gelezen: AGENTS, RESUME, CLOUD_HANDOVER, actuele CLOUD_TASKS-tabel en DEVELOPMENT_PROGRESS; relevante code/tests/schema en code-mapping gelezen. Geen herhaalde volledige documentaudit.
- Runtime: Linux x86_64, Node `v24.19.0`, pnpm `11.25.0`, npm `11.9.0`, Git `2.52.0`. Geen project-node_modules aanwezig bij aanvang.
- Runtime-status meldde connected, actuele configuratie en unrestricted HTTP-policy. De werkelijke CLI-proxy was echter niet bereikbaar. Geen geheimen of externe identiteiten geconfigureerd/gebruikt.
- `git clone --no-checkout --single-branch --branch handover/mac-to-cloud-20261018 ...` faalde: `Failed to connect to proxy port 8080`. Geen proxyinstellingen omzeild.
- Via de werkende GitHub-connector zijn alle 82 blobs op de exacte commit opgehaald. Elk bestand is lokaal tegen de bijbehorende Git-blob-SHA geverifieerd: **82/82 PASS**. De lokale snapshotcommit heeft dezelfde brontree; dit is geen opgehaalde volledige Git-geschiedenis. De lokale snapshot-commit-ID is geen remote overdrachtscommit-ID.
- Remote taakbranch `cloud/cloud-008-handover-smoke` is rechtstreeks vanaf de exacte overdrachtscommit gemaakt. Remote commits gebruiken die ancestry; de lokale snapshotgeschiedenis wordt niet gepusht. PR-base blijft `handover/mac-to-cloud-20261018`.

## Tests en wijziging

De productiecode is niet gewijzigd. Eén regressietest in `tests/trip-utils.test.mjs` controleert de volledige CSV-datarij: expliciete beginstand **0**, eindstand **35**, ontbrekend kenteken, demonstratiewaarschuwing en toelichting met witruimte/formuleprefix, quotes, komma en newline. De verwachte rij controleert dat nul niet als ontbrekend wordt geëxporteerd en dat de formuleprefix wordt geneutraliseerd terwijl quotes correct verdubbelen.

| Controle | Exact resultaat |
|---|---|
| Standaard `node --experimental-strip-types --test tests/*.test.mjs` | Exit 0 maar alleen 4 bestandschecks gerapporteerd; onvoldoende bewijs voor 31 individuele tests |
| Baseline met `node --experimental-strip-types --test --test-isolation=none --test-reporter=tap tests/*.test.mjs` | **PASS: 31 tests, 31 pass, 0 fail, 0 skipped** |
| Zelfde commando na CSV-regressietest | **PASS: 32 tests, 32 pass, 0 fail, 0 skipped** |
| `git diff --check` | **PASS** |
| Bronhashcontrole | **PASS: alle 82 Git-blobs gelijk aan overdrachtstree** |

De extra flag schakelt alleen de subprocess-isolatie van de Node-testrunner uit en maakt alle individuele tests zichtbaar in deze runtime. Geen bewering dat de standaard geïsoleerde runner daarmee onderzocht of gerepareerd is. Testimports en assertions zijn ongewijzigd; SQLite-tests gebruiken uitsluitend `:memory:`.

Ruwe uitvoer: [baseline](CLOUD008_BASELINE.tap) en [na wijziging](CLOUD008_AFTER.tap).

## Dependencies, typecheck, lint en build

Er zijn geen dependencies op de Mac geïnstalleerd. In deze geïsoleerde Cloud-map is uitsluitend een lockfile-installatie geprobeerd, met installatiescripts uit en writable caches onder `/workspace/scratch`:

```sh
env PNPM_HOME=/workspace/scratch/pnpm \
  XDG_DATA_HOME=/workspace/scratch/xdg-data \
  XDG_CACHE_HOME=/workspace/scratch/xdg-cache \
  npm_config_manage_package_manager_versions=false \
  node /opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/pnpm/bin/pnpm.cjs \
  install --frozen-lockfile --ignore-scripts \
  --store-dir /workspace/scratch/pnpm-store --fetch-retries=0 --fetch-timeout=15000
```

De runtime-specifieke pnpm-locatie hierboven is bewijs van deze uitvoering, geen projectpad dat op de Mac moet worden overgenomen.

Uitkomst: exit 1. Lockfile-resolutie werd overgeslagen als up-to-date; supply-chain-policycontrole kon registrymetadata niet ophalen: `ERR_PNPM_META_FETCH_FAIL`, GET `https://registry.npmjs.org/@alloc%2Fquick-lru: fetch failed`. Dit is geen vastgestelde onveilige dependency. De controle is niet uitgezet, packages/lockfile/stack zijn niet vervangen. Eerste `pnpm exec tsc --noEmit` strandde al in pnpm bij een niet-beschikbare standaard-datamap onder `/home/agent`; de gerichte installpoging gebruikte daarna writable datamappen.

| Controle | Status in Cloud |
|---|---|
| Typecheck | **NIET GETEST**: compiler niet gestart; dependencies niet beschikbaar |
| Lint | **NIET GETEST**: ESLint/config-dependencies niet beschikbaar |
| Webbuild | **NIET GETEST**: Vinext/Vite/dependencies niet beschikbaar |
| Browser/UI, native iOS, simulator, echte iPhone/Jeep/CarPlay/OBD2 | **NIET GETEST** |
| Backendauth, centrale opslag/sync, MCP, fiscale productie-export | **NIET GETEST / niet aangesloten** |

De bekende Mac-PASS-status in VALIDATION.md blijft Macbewijs, geen Cloud-PASS.

## Veiligheidscontrole en grenzen

`node scripts/scan-handover.mjs .` kon de historische Git-scan niet afronden: `spawnSync git EPERM`. Dit is **GEEN PASS** voor die scan. Een afzonderlijke beperkte patrooncontrole van de 82 geselecteerde bronbestanden gaf 0 treffers; nieuw toegevoegde bewijsdocumenten worden vóór commit eveneens gecontroleerd. Geen volledige historische Git-scan, entropy-scan of onafhankelijke securityreview geclaimd. Diff en bestandsselectie zijn apart gecontroleerd; geen caches, dependencies, runtime-DB, echte routes, privéfoto's of secrets geselecteerd voor commit.

ACT-002 blijft open: technische bescherming van eigenaarcontrole is niet bevestigd. Alle nieuwe PR's blijven draft. Geen merge, forcepush, basewijziging van eerdere PR's, auto-merge, productiepublicatie, nieuwe accounts, kosten of gevoelige koppelingen.

Geen sessie, modelselectie, instellingen, accountrechten of agentorganisatie gemigreerd. Deze bestaande sessie voert de taak uit; Sol is voorkeur volgens AGENTS, geen nieuw ingestelde routing. Geen Astra-agent of extra run gestart.

## Hervatten

CLOUD-008 is technisch uitgevoerd en staat TER CONTROLE via een draft-PR met de overdrachtsbranch als base. De proxy-/registryblokkade verhindert Cloud-typecheck/lint/build, maar niet het al uitgevoerde dependencyvrije testwerk of gerichte voorbereiding van CLOUD-002/004. Volgende veilige stap: die code-/testrisico's gericht vastleggen, daarna dependencies en checks hervatten zodra de ondersteunde netwerktoegang functioneert. Niet de stack vervangen om deze omgeving groen te laten lijken.
