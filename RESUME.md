# Hervatpunt — 18 oktober 2026

Cloud leidt; eigenaar beslist over merges, kosten, gevoelige koppelingen en productie. Mac ondersteunt iOS/hardware. GitHub is centraal. Alleen Rittenregistratie.

## Actuele status
- CLOUD-008: 82/82 bronblobs geverifieerd; 31/31 baseline, 32/32 na CSV-regressie PASS. Draft-PR #4 tegen handover/mac-to-cloud-20261018; eerdere keten #1 → #2 → #3 behouden.
- De eerdere proxy-, dependency- en PR-creditblokkades zijn in deze uitvoering opgelost: frozen-lockfile-installatie met bestaande packages en supply-chain-controle PASS; typecheck, lint en webbuild PASS. Geen stackwijziging of extra dienst.
- ACT-002: eigenaarinstelling en drie actieve main-regels bevestigd. Connectoridentiteit blijft gelijk aan eigenaar; geen verplichte onafhankelijke approval. Geen merge door agents.
- CLOUD-002/004: vervolgtaakgroep voor database-integriteit en aanvullende regressies; eigen branch/PR op deze smoke-branch. Oude migratie niet wijzigen, geen live database migreren.

## Werkspoor
Remote smoke-head vóór documentactualisatie: 1830e7efd7d08553ad5b44864b18833fa906d3a0, gebaseerd op 8b50e9109b51770f6cf4d0eec25eac38c17e4b76. De overdrachtsbranch bevat daarnaast 5874bc3 (alleen GITHUB_PROOF.md); behouden. Lokale Git-map begon als blobgeverifieerde snapshot, geen geclonede remote geschiedenis. Remote commits via GitHub-connector met juiste parent; lokale snapshotgeschiedenis niet pushen.

## Verificatie en volgende stappen
Run node --experimental-strip-types --test tests/*.test.mjs, pnpm exec tsc --noEmit, pnpm lint en pnpm build op de echte projectdependencies. Node 24.19.0, pnpm 11.25.0. Standaard subprocess-testrunner werkt nu; oudere vier-bestandschecks zijn historische runtimebeperking.

Na integriteitsgroep: volgende afgebakende web/backendtaak uit CLOUD-005; alle mastereisen behouden. Veilige lokale ontwikkeling toegestaan zonder accounts of productie. Provider-/auth/distributiekeuzes met eventuele kosten eerst ter besluitvorming; geen gebruikers-/GPS-productiegegevens gebruiken. Native iOS en echte iPhone/Jeep/CarPlay/OBD2 nog niet getest. Onafhankelijke securityreview blijft open.

Bewijs: docs/TRANSFER/CLOUD_PROOF.md, MAIN_SECURITY_CHECK.md en CLOUD_002_004_PREPARATION.md. Eigenaaracties: OWNER_ACTIONS.md.
