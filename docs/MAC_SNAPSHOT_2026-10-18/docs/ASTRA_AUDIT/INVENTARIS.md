# FASE A — Nulmeting

Datum: 17 oktober 2026. Werkmap: `<MAC_PROJECT>`.

## Bronnen

Alle acht bestaande project-Markdown-bestanden zijn beoordeeld: README; docs/MASTERPROMPT, ARCHITECTUUR, TESTPLAN en TESTRESULTATEN; de drie bestanden onder bronnen. De bijgewerkte masterprompt heeft hoofdstukken 0–22; de oude versie is historisch.

Relevante implementatie: app/page.tsx, globals.css, layout.tsx, chatgpt-auth.ts; db/index.ts, schema.ts, env.d.ts; drizzle/0000_medical_maestro.sql en meta-snapshots; package.json, pnpm-lock.yaml, pnpm-workspace.yaml, vite.config.ts, next.config.ts, tsconfig.json, next-env.d.ts, eslint.config.mjs, drizzle.config.ts, .gitignore en .openai/hosting.json. Public bevat beeldmateriaal; herkomst/rechten en gebruik worden nog apart beoordeeld. Geen eigen testbestanden of relevante project-txt aangetroffen. Dependencies en gegenereerde build/cachebestanden zijn geen leidende projectdocumentatie.

## Status en herstelbaarheid

- **BEVESTIGD:** geen `.git` in deze werkmap; lokale branch, commit en Git-diff daarom niet beschikbaar. De genoemde GitHub-repository is geen bewijs dat deze werkmap een checkout ervan is.
- **BEVESTIGD:** herstelarchief `nulmeting-2026-10-17.tar.gz` bevat de oorspronkelijke projectdocumenten, bronbestanden, schema/migratie en belangrijke configuratie. Geen node_modules, runtime-databases of omgevingsgeheimen opgenomen. Media zijn niet gewijzigd en niet opgenomen. Archief eerst apart uitpakken bij herstel; niet blind over nieuw werk schrijven.
- SHA-256 archief: `210f9814ba5db093c48d177d819e180f9e4d7bef6afae7069d4ddb9ae0fda1c2`.
- **BEVESTIGD:** React/Vinext-webprototype met in-memory voorbeeldritten en Drizzle-schema voor zeven tabellen. Geen native iOS-project aangetroffen.
- **NIET BEVESTIGD:** hosting, domein, productie-database, MCP-deployment en Cloudflare-koppeling. `vite.config.ts` gebruikt een placeholder-database-ID.
- **BEVESTIGD:** shell, bestandsbewerking en agenttools beschikbaar. Toolcatalogus vermeldt `gpt-6-astra`; hoofdmodel niet zelfstandig omgezet. Beschikbare tool is geen bewijs van geslaagde agentuitvoering. Routing hoort bij fase C.
- Bestaande dependencies blijven behouden; geen installatie uitgevoerd. Testcommando's: vinext build, tsc --noEmit, eslint met dist/.next uitgesloten. Geen unit-/integratietestscript aanwezig.

Ontbraken bij start: OWNER_ACTIONS, auditregister, beslisregister, traceerbaarheid en voortgang. Deze worden in fase B toegevoegd. Historische testresultaten van 16 oktober zijn niet opnieuw uitgevoerd in fase A/B; actuele runtime: NIET GETEST.

Gate A: nulmeting vastgelegd; geen applicatieherbouw uitgevoerd.
