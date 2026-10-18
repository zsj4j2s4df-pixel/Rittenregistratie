# Cloudflare-release — 18 oktober 2026

## Geleverde taakgroep CLOUD-005 / CLOUD-002 / CLOUD-004

Eigenaar autoriseerde resourceaanmaak en publicatie. Antwoord op accountvraag: kies de beste route zoals andere Workers. Bestaand accountsubdomain behouden; niets aan freesadviseur gewijzigd.

- Publiek adres: https://rittenregistratie.zsj4j2s4df.workers.dev . Root is nadrukkelijk een tijdelijke demo; /beheer is de centrale interface en toont een gesloten fout zonder loginconfiguratie.
- Worker rittenregistratie, deployment c1890cd3989d4eefa1675c5694589f5c, etag8838eb8f9a14bafdcdd3e78275dbed641d2ed955890e0f07d548ad9e692fbc63. workers.dev enabled, previews disabled, observability/logpush uit.
- EU-D1 rittenregistratie, UUID5cee8499-45cf-47a4-8960-4b43e4ab8204, jurisdiction eu, region EEUR, readreplication disabled. Acht migraties0000–0007 in45-statementbatch toegepast; journal readback8. Users0 en trips0 bevestigd; geen voorbeelddata in centrale database.
- Centrale adresCRUD (incl. uitschakelen), tariefperiodenCRUD met exacte micro-eurobedragen, wijzigingsreden, conflictbehoud; ritcorrectie met expectedRevision/reason en historie. UTC-seconden blijven exact, onbekende bestuurder/standen worden niet geschat. Historie toont account-ID eerlijk zonder onopgehaalde naam. Bestaande rapporten blijven onveranderd.

## Publicatiepad en reproductie

Bestaande dependencies gebruikt, geen installatie op Mac. Root wrangler.json is bronconfig; Vite ontdekt die zelf (dubbele D1-binding bij expliciete array-merge opgelost). Compatibility date2026-05-22 sluit aan op geïnstalleerde workerd; aanvankelijke2026-10-18 lokaal niet ondersteund, vóór release gecorrigeerd.

`pnpm build` en `node scripts/prepare-worker-upload.mjs` maken dist/server/release-entry.js, embedded-assets.js, wrangler.embedded.json en een credentialvrij /tmp/rit-worker-payload.json. Geen dist in Git. Publieke /_next/static/* en rootSVG worden als modules meegenomen met juiste MIME/nosniff/cacheheaders; interne manifests, .assetsignore en _headers worden niet publiek ingebed. App-/API-responses worden niet als assets gecachet. Wrapper laat de gebouwde SSR-/API-handler intact, gebruikt een ASSETS-fetchadapter en laat de echte DB-binding beschikbaar.

Native assets-upload-session werkte, maar upload met tijdelijke assetsJWT via pluginfetch gaf401 Unauthorized. Geen tokens gepubliceerd of opgeslagen. Veilige fallback: multipart PUT Worker46modules/23publiekeassets via gekoppelde Cloudflare-API; geen extern uploadaccount. Deze fallback kost Workerrequests/CPU voor statische assets; quota/performance nog niet belast getest. Een normale latere `wrangler deploy --config dist/server/wrangler.embedded.json` vereist een ondersteunde aparte CLI-authenticatie; nooit een token in chat vragen.

## Bewijs

- PASS:117/117 Node-tests, tsc --noEmit, volledige ESLint, vinext build.
- PASS: lokale workerd/D1-smoke: migraties, scoped writes/audit/rollback, idempotentie, provenance, settings, vaste rapporten/CSV, synthetisch ondertekende Accessidentiteit. Geen echteproviderclaim.
- PASS: centrale Chromium→HTTP→SQLite met synthetische identiteit: responseverlies/reconnect/retry zonder duplicaat, reload, kenteken409, adres-/tarieftoevoeging, ritcorrectie/historie, vast rapport/CSV, mobiel/thema.
- PASS: volledige bestaande demobrowser tegen lokale echte Worker inclusief CSV, print/PDFflow, adressen/tarieven, correctie/invoer, kaart-handoff en mobiele layout.
- PASS: exacte embedded release in lokale workerd: root200 en API503/no-store op lees-/schrijfroutes.
- PASS: live HTTPS root200 en /beheer200, API503/no-store/nosniff ook met gespoofte identiteit. Nodeproxy gebruikt; eerste directe Nodefetch kon niet verbinden en geldt niet als appfout.
- PASS: live Chromium: echte hydration/navigatie en publieke assets, /beheer gesloten, geen pageerrors. tests/deployed-browser-smoke.mjs; geen centrale writes.
- PASS: remote D1 journal8, users0/trips0. Beperkte patroonscan0bevindingen; geen volledige onafhankelijke securityaudit.

Runtime: Linux, Node24.19.0, Chromium154.0.8037.57, Wrangler4.92.0, workerd compatibility2026-05-22, bestaande lockfiledependencies. Geen sessies/models/instellingen gemigreerd.

## Nog open

Cloudflare Access niet enabled: organisatie-GET9999. Geen ACCESS_ISSUER/AUDIENCE verzonnen en geen authbypass. Eigenaar moet ZeroTrust/Access kosteloos activeren en toegestane loginidentiteiten bepalen (OWNER_ACTIONS). Pas daarna provider aansluiten, interne gebruikers/voertuigrechten expliciet provisionen en echte login/revocation/sync testen. GitHubconnector blijft eigenaaridentiteit; geen onafhankelijke eigenaarcontroleclaim of mainmerge.

Ook lokale taken blijven uitvoerbaar: bestuurder/filters, coherente sync/cursors en duurzame pendingqueue, detectie-inname/deduplicatie, backup/herstel/read-onlyMCP en centrale serverPDF. Geen claim dat Access die allemaal blokkeert. Adres-/tariefbewerk-/verwijderflows hebben domain/service-tests maar nog geen volledige browserCRUDmatrix. Native iOS/iPhone/Jeep/CarPlay/OBD2, privacy/quotabelasting en echte providerlogin NIET GETEST. Alle123eisen/21scenario's blijven leidend; geen volledige oplevering.
