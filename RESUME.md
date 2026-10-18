# Hervatpunt — 18 oktober 2026

Cloud leidt; Mac ondersteunt iOS/hardware; eigenaar beslist over main-merge, kosten, accounts/koppelingen en productie. GitHub is bron van waarheid, alleen Rittenregistratie. Alle mastereisen behouden.

## Gepubliceerd werkspoor
- #1 documentaudit → #2 eisenregister → draft #3 overdracht (handover/mac-to-cloud-20261018, head5874bc3). Niet herhalen, mergen of bases herschrijven.
- Draft #4 cloud/cloud-008-handover-smoke, base overdracht, head988c35b: bron82/82 geverifieerd, baseline31/smoke32 tests PASS, type/lint/build PASS, ACT-002 gecontroleerd.
- Draft #5 cloud/cloud-002-004-integrity, base smoke, heade367a86: additieve guards en vijf regressies,37tests PASS.
- Draft #6 cloud/cloud-005-reporting, base integriteit, head0c8c520: demo-ritinvoer, adres-/tariefbeheer, kenteken, historische rapporten, CSV/browser-PDF en routeweergave;50tests en Chromium desktop/mobiel/CSV/PDF PASS. Webstate is tijdelijk.
- Serverkern cloud/cloud-005-server-core, base reporting; voertuigautorisatie, revisions en atomische audit.61tests + lokale workerd/D1-binding + type/lint/build PASS. Twee scoped reviews, afstandsherkomstfix hercontrole PASS. Zie docs/TRANSFER/SERVER_CORE.md. Draft-PR #7: https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/7 .

- Serverritinvoer cloud/cloud-005-server-create, base server-core/#7: scoped retryreceipt, oorspronkelijke response, atomische trip/receipt/audit.65tests + D1 concurrency/rollback + type/lint/build PASS; gerichte review PASS. Zie SERVER_CREATE.md. Draft-PR #8: https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/8 .

- HTTP-adapter cloud/cloud-005-http-adapter, base create/#8: CSRF, JSON16KiB, no-store/noCORS, perrequestresolver, veilige errors.71tests + D1 HTTP-read/write + type/lint/build PASS. Niet publiek gemount. Zie TRIP_HTTP.md.

## Volgende technische taak
Duurzame instellingen/tarieven/rapporten met voertuigscope en audit; vervolgens geverifieerde sessions en publiek aansluiten na toestemming, UI-sync, detectie-inname/deduplicatie, back-up/herstel en read-only MCP. Nog niet gebouwd: geen volledige-appclaim. Providerbesluit blokkeert niet alle lokale implementaties.

## Controles en omgeving
Node24.19.0/Linux x86_64, pnpm11.25.0. Frozen lockfile-installatie/supply-chaincheck PASS; eerdere credits/proxy/dependencyblokkades opgelost. Run node --experimental-strip-types --test tests/*.test.mjs; node --experimental-strip-types tests/d1-runtime-smoke.mjs; pnpm exec tsc --noEmit; pnpm lint; pnpm build. Browsercheck tests/browser-smoke.mjs gebruikt geïsoleerde Playwright/Chromium, zie REPORTING_WEB.md.

ACT-002 handmatige instelling en PR/deletion/non-fast-forward-regels AFGEROND via API; connector en eigenaar delen identiteit, onafhankelijke approval niet afgedwongen. Geen agentmerge. OWNER_ACTIONS bevat opties voor gescheiden bevoegdheden en hosting/auth; niets geactiveerd. Productielogin/opslag/sync/back-up, native iOS, echte iPhone/Jeep/CarPlay/OBD2 NIET GETEST.

Lokale git is blobgeverifieerde snapshot, geen echte remote ancestry: NOOIT lokale geschiedenis pushen. Remote commits via connector met werkelijke parent/tree en expected_sha zonder force. Geen sessies/models/instellingen gemigreerd.
