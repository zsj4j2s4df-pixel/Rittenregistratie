# Overdrachtsinventaris

18 oktober 2026. Lokale bronmap volledig op projectbestandniveau geïnventariseerd; originele map ongewijzigd behouden. Geen lokale `.git`, branches of commits. Niet-opgeslagen editorbuffers zijn niet via filesystem aantoonbaar: **NIET GECONTROLEERD**. Alle op schijf aangetroffen relevante bronbestanden zijn geselecteerd; manifest in FILE_MANIFEST.json.

Remote: main `d37d8c913aaa253d6297cf57d3379d40c5795573`; PR #1 head `f8f241278baf5a8d71444c132bfc7bfbf5157ff1`; PR #2 head `d1493fd23e6bc52ef2de229dcf4870ef8d9c2673`, base PR #1. Clone bevat 15 commits, geen shallow clone. Overdracht start op PR #2, zonder force push of geschiedenisvervanging.

49 lokale tekst/code/configbestanden gekopieerd, waaronder app, lib, db, drizzle, tests, lockfile en bronsnapshots. Cloud-audits blijven op hun bestaande pad; Mac-audits en actielijst staan apart in docs/MAC_SNAPSHOT_2026-10-18. Twee verschillende ACT-001-histories blijven met herkomst zichtbaar. Scripts voor voorbereiding/scanning zijn nieuw overdrachtsgereedschap, geen productfunctie.

Uitgesloten: node_modules, .pnpm-store, .next, .vinext, .wrangler, dist, tsconfig.tsbuildinfo, gegenereerde next-env.d.ts, echte jeep-hoofdfoto.jpg, og.png met niet-geverifieerde herkomst, nulmeting-archief. Geen Xcode/Swift-app aangetroffen. Verwijzingen naar niet meegeleverde foto's zijn in de overdrachtsversie vervangen door eigen SVG; origineel lokaal niet veranderd.

Echte rit-/routegegevens, accounts, secrets, Apple-certificaten of privésleutels zijn niet in geselecteerde bronnen aangetroffen. Alleen synthetische plaatsnamen/ritten en vereiste projectgebruikers staan in code. `.env.example` bevat uitleg, geen echte waarden. Lokale absolute projectpaden zijn in Mac-snapshots geredigeerd. Ook alle unieke historische Git-blobs zijn op bekende geheimpatronen gecontroleerd; zie VALIDATION voor exacte telling en beperkingen.

Een lokale herstelbaseline van 17 oktober bestaat. Die is geen Git-commit en wordt niet als verborgen ontwikkelgeschiedenis voorgesteld. Het ruwe archief blijft lokaal; `mac-baseline-to-current.patch` bewaart de verschillen voor alle 27 baselinebestanden als reconstructiebewijs, geen authentieke oude commitreeks. Zie VALIDATION.md voor herkomst en beperkingen.
