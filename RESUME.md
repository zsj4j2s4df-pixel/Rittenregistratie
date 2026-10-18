# Hervatpunt — 18 oktober 2026

1. Controleer `git status --short`, branch en HEAD. Werk alleen in Rittenregistratie en op een eigen branch.
2. Huidige overdrachtsbasis: `handover/mac-to-cloud-20261018`, gebaseerd op PR #2 (`d1493fd23e6bc52ef2de229dcf4870ef8d9c2673`). Daaronder PR #1. Niets is automatisch gemerged.
3. Lees CLOUD_HANDOVER.md en de actuele statustabel bovenaan CLOUD_TASKS.md. Cloud is nu hoofdontwikkelaar; oudere Mac-hoofdrollen zijn historie.
4. **CLOUD-008 uitgevoerd, TER CONTROLE**: exacte broncommit `8b50e9109b51770f6cf4d0eec25eac38c17e4b76`, 82 blobs geverifieerd; Node v24.19.0 op Linux. Baseline 31/31 en na CSV-regressietest 32/32 PASS met `--test-isolation=none`. Eigen branch `cloud/cloud-008-handover-smoke`, draft-PR tegen `handover/mac-to-cloud-20261018`; zie docs/TRANSFER/CLOUD_PROOF.md. Geen herhaling van de volledige documentaudit.
5. Controleer Node/PNPM en package-registrytoegang. Installeer alleen bestaande lockfile-dependencies in de geïsoleerde Cloudomgeving wanneer toegestaan; geen abonnementen/extra diensten. Lukt installatie niet, leg exacte beperking vast; vervang geen package/stack zonder gericht onderzoek.
6. Na geslaagde proef: CLOUD-002/004 als gecombineerde risico-/testgroep, daarna afgebakende implementatie uit CLOUD-005. Hergebruik de bestaande audits en 123 REQ-ID's. Geen volledige app opnieuw genereren.

Cloudbewijs: 31/31 baselinetests en 32/32 na toevoeging PASS; typecheck/lint/build NIET GETEST wegens ontbrekende dependencies en mislukte frozen-lockfile-installatie (registrymetadata fetch failed). CLI-proxy is onbereikbaar; bron- en PR-acties via GitHub-connector werken. Geen proxy of supply-chain-beveiliging omzeilen. De lokale Git-map is een hashgeverifieerde bron-snapshot, geen volledige remote geschiedenis; remote commitancestry wordt via de connector behouden.

Apart Macbewijs: 31 tests, webbuild, lint en typecheck op 18 oktober geslaagd op de overdrachtscheckout. Geen backend, native app, sync of fiscale productie-export aangesloten. Volgende veilige taak: gerichte voorbereiding CLOUD-002/004; daarna Cloud-buildchecks hervatten zodra dependencytoegang hersteld is.

Nog niet afgevinkt: eigenaarcontrole/technisch afdwingbare main-bescherming, onafhankelijke reviews, echte iPhone-tests. Geen secrets nodig voor de testgroep. Een gebruikerswens 'ga verder' geeft geen merge- of productiebevoegdheid.
