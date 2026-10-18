# Hervatpunt — 18 oktober 2026

1. Controleer `git status --short`, branch en HEAD. Werk alleen in Rittenregistratie en op een eigen branch.
2. Huidige overdrachtsbasis: `handover/mac-to-cloud-20261018`, gebaseerd op PR #2 (`d1493fd23e6bc52ef2de229dcf4870ef8d9c2673`). Daaronder PR #1. Niets is automatisch gemerged.
3. Lees CLOUD_HANDOVER.md en de actuele statustabel bovenaan CLOUD_TASKS.md. Cloud is nu hoofdontwikkelaar; oudere Mac-hoofdrollen zijn historie.
4. Eerstvolgende taak **CLOUD-008**: overdrachtstest in bestaande Cloud-sessie. Controleer bestanden en instructies, voer 31 bestaande Node-tests uit, voeg een kleine CSV-regressietest toe voor meegegeven tellerstanden (incl. 0) en toelichting met quotes/formuleprefix, run opnieuw, commit op eigen branch en maak PR tegen de overdrachtsbranch. Werk bewijs, taken en dit hervatpunt bij.
5. Controleer Node/PNPM en package-registrytoegang. Installeer alleen bestaande lockfile-dependencies in de geïsoleerde Cloudomgeving wanneer toegestaan; geen abonnementen/extra diensten. Lukt installatie niet, leg exacte beperking vast; vervang geen package/stack zonder gericht onderzoek.
6. Na geslaagde proef: CLOUD-002/004 als gecombineerde risico-/testgroep, daarna afgebakende implementatie uit CLOUD-005. Hergebruik de bestaande audits en 123 REQ-ID's. Geen volledige app opnieuw genereren.

Baseline: 31 automatische Mac-tests, webbuild, lint en typecheck op 18 oktober opnieuw geslaagd op de overdrachtscheckout; Cloud-test nog NIET GETEST. Actuele overdrachtsuitslag in DEVELOPMENT_PROGRESS.md. Geen backend, native app, sync of fiscale productie-export aangesloten.

Nog niet afgevinkt: eigenaarcontrole/technisch afdwingbare main-bescherming, onafhankelijke reviews, echte iPhone-tests. Geen secrets nodig voor de testgroep. Een gebruikerswens 'ga verder' geeft geen merge- of productiebevoegdheid.
