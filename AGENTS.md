# RitKompas — uitvoeringsinstructies

## Actueel — CLOUD-013 / 19 oktober 2026

Deze branch is een geïsoleerd code-only releasevoorstel vanaf PR14 `6c3f60834b36fe84ed43360c27f3feb8d2438ef7`. Nieuwere cumulatieve ontwikkeling staat in PR33, Mac-bewijs in PR32. Niet deze oudere brontekst als volledige nieuwste projectbasis gebruiken. Live login blijft FAIL; eigenaar is reeds geprovisioneerd (1 gebruiker/voertuig/recht, 0 ritten, 2 audits). Geen nieuwe provisioning/migratie/configuratie/publicatie toegestaan zonder nieuwe toestemming. Oudere publicatieopdrachten hieronder zijn historie waar strijdig.

CLOUD-013: ondertekende app-cookie als strikt begrensde fallback bij ontbrekende assertionheader; crypto/account/voertuigcontroles ongewijzigd. 124/124 Node-tests, type/lint/build en lokale D1 PASS. Originele resolver reproduceert cookie-only 401, patch200; exacte live oorzaak en live oplossing NIET bewezen. Plan, rollback en Mac-eindtest: [ACCESS_TRANSPORT_FIX.md](docs/TRANSFER/ACCESS_TRANSPORT_FIX.md). Volgende stap: beperkte draft-PR review + fix naar cumulatieve branch; live test pas na expliciete toestemming voor dit concrete code-only pakket. Main/Access/DB onaangeraakt.

Nieuwste gebruikersbesluit, 18 oktober 2026: **Codex Cloud is hoofdontwikkelaar; Codex Mac ondersteunt lokale builds, iOS-simulator en hardwaretests. GitHub is de centrale bron van waarheid. De projecteigenaar beslist over belangrijke handelingen.** Oudere afwijkende rolverdelingen blijven alleen historie.

Start met RESUME.md, CLOUD_TASKS.md, DEVELOPMENT_PROGRESS.md en CLOUD_HANDOVER.md. Lees daarna alleen de relevante eisen/testgevallen en code; herhaal geen volledige inventaris zonder aanleiding. Alle functionele wensen in de bijgewerkte masterprompt blijven behouden. Sol is voorkeur voor dagelijkse regie indien beschikbaar, Astra alleen voor belangrijke afwegingen. Geen modelwissel, agentoverdracht of automatische sessiesynchronisatie claimen zonder bewijs.

Nieuwste publicatieopdracht: eigenaar autoriseert aanmaken en publiceren van RitKompas in het gekoppelde Cloudflare-account. Gekozen adres conform antwoord eigenaar: https://rittenregistratie.zsj4j2s4df.workers.dev. Dit autoriseert geen kosten, betaalgegevens, nieuwe externe accounts of main-merge. Bestaande andere Workers/accountsubdomain niet wijzigen.

## Zelfstandig toegestaan

Samenhangende code-, test-, bugfix- en documenttaken op eigen branches; commits en pull requests; taken, besluiten en hervatpunt bijwerken. Gebruik synthetische gegevens. Als een reviewer niet beschikbaar is, neem veilig werk zelf over en markeer dat als eigen controle, niet onafhankelijk.

## Nooit zonder expliciete toestemming

Kosten/betaalde diensten, productiepublicatie, nieuwe externe accounts of gevoelige koppelingen, delen van gevoelige gegevens, grote functionele scopewijzigingen, uitschakelen van beveiliging, onomkeerbare handelingen. **Geen merge naar main, geen force push, geen auto-merge, geen rechtstreekse push naar main.** Een geslaagde test is geen toestemming.

## Taakgroepen

Gebruik bestaande CLOUD-nummers. Houd samenhangend werk in één run; na iedere groep tests, commit, takenlijst, DEVELOPMENT_PROGRESS en RESUME bijwerken en volgende veilige taak uitvoeren. Stop bij echte blokkade, noodzakelijke toestemming of uitvoeringslimiet. Vermijd dubbele audit en onnodige parallelle agents. Externe dependencymogelijkheden controleren, niet zomaar vervangen.

## Verificatie

Node 24 aanbevolen. `node --experimental-strip-types --test tests/*.test.mjs` vereist geen externe npm-packages. Met dependencies: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`. Geen Mac-paden hardcoden. Native iOS is nog niet gebouwd; geen echte iPhone-test claimen vanuit een Cloud-VM. `lib/access-policy.ts` is geen aangesloten authenticatiebackend. De app bevat alleen tijdelijke demo-invoer.

Controleer vóór elke publicatie diff en geheimen; geen .env, caches, privéfoto's, GPS-historie, Apple-certificaten of databasebestanden. `scripts/scan-handover.mjs` is een beperkte patrooncontrole, geen volledige veiligheidsgarantie. Bewaar bestaande wijzigingen. Bestaande PR-keten: #1 → #2 → overdrachts-PR; niet ongemerkt rebasen, samenvoegen of bases wijzigen.
