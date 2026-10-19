# RitKompas — uitvoeringsinstructies

## Actuele gezamenlijke basis — na Cloud #28/#29 en Mac #30

De huidige reviewbranch combineert beide voorouders met behoud van code en historie. Cloudontvangst en Mac-terugproef zijn bewezen in docs/TRANSFER/MAC_CLOUD_ACK_RESULT.md; rechtstreeks Cloud→Mac sturen is in de Cloud-sessie niet beschikbaar. Cloud gebruikt GitHub-testopdrachten. Gebruik docs/TRANSFER/PR27_PLAN.md voor centrale M27-eisen, PR27_EXECUTION_PLAN.md als aanvullende MAC27-controlekaart en RESUME voor volgende taak. Geen tweede documentaudit of hardwareonderzoek herhalen zonder nieuw bewijs.

## Nieuwste Mac-overdracht — 19 oktober 2026

Lees bij hervatten het volledige [memo uit PR #27](docs/IMPORTANT_MEMO_IPHONE_RITDETECTIE.md) en [de uitvoerbare planning](docs/TRANSFER/PR27_EXECUTION_PLAN.md). Cloud coördineert de ontwikkeling, Mac verzorgt lokale native/hardwaretests. Start vanaf de nieuwste gecontroleerde ontwikkelketen, niet opnieuw vanaf de document-only main. De overige functionele mastereisen blijven gelden.

De eigenaar heeft in deze Mac-run specifiek All traffic + Cloudflare account members voor uitsluitend de bestaande RitKompas-Worker goedgekeurd; dit is toegepast en read-only geverifieerd. Dat is geen algemene toestemming voor publicatie, runtimebindings, gebruikersprovisioning of extra toegang. Huidig bewijs: [Zero Trust](docs/TRANSFER/MAC_ZERO_TRUST_2026-10-19.md), [samenwerking en commando's](docs/TRANSFER/MAC_CLOUD_CHANNEL_TEST.md), [Mac-nativecontrole](docs/TRANSFER/MAC_NATIVE_VALIDATION.md). Oudere Access-ontbreektmeldingen zijn historie. `/scale` en `/do` niet als ondersteund aannemen.

Nieuwste hoogprioritaire sturing: lees [PR27-memo](docs/IMPORTANT_MEMO_IPHONE_RITDETECTIE.md), [aanvullende eisen/planning](docs/TRANSFER/PR27_PLAN.md) en [Mac-testopdrachten](docs/TRANSFER/MAC_HARDWARE_TESTS.md). Native interactieve Zakelijk/Privé-melding is de praktische hoofdroute; CarPlay-knoppen vereisen passende Apple-goedkeuring. Betrouwbaar einde, twee-minutenklantstop, elektrisch rijden, drie-iPhoneprioriteit versus echte bestuurder en centrale voertuigdedup blijven expliciete acceptatiepunten. Geen automatische samenwerking/hardwarebewijs claimen; Mac beheert zijn Access/rulesetonderzoek, Cloud wijzigt die externe configuratie niet gelijktijdig.

Nieuwste gebruikersbesluit, 18 oktober 2026: **Codex Cloud is hoofdontwikkelaar; Codex Mac ondersteunt lokale builds, iOS-simulator en hardwaretests. GitHub is de centrale bron van waarheid. De projecteigenaar beslist over belangrijke handelingen.** Oudere afwijkende rolverdelingen blijven alleen historie.

Start met RESUME.md, CLOUD_TASKS.md, DEVELOPMENT_PROGRESS.md en CLOUD_HANDOVER.md. Lees daarna alleen de relevante eisen/testgevallen en code; herhaal geen volledige inventaris zonder aanleiding. Alle functionele wensen in de bijgewerkte masterprompt blijven behouden. Sol is voorkeur voor dagelijkse regie indien beschikbaar, Astra alleen voor belangrijke afwegingen. Geen modelwissel, agentoverdracht of automatische sessiesynchronisatie claimen zonder bewijs.

Nieuwste publicatieopdracht: eigenaar autoriseert aanmaken en publiceren van RitKompas in het gekoppelde Cloudflare-account. Gekozen adres conform antwoord eigenaar: https://rittenregistratie.zsj4j2s4df.workers.dev. Dit autoriseert geen kosten, betaalgegevens, nieuwe externe accounts of main-merge. Bestaande andere Workers/accountsubdomain niet wijzigen.

Nieuwste beperking na eerdere publicatie: eigenaar heeft Zero Trust Free geactiveerd, vraagt exacte Access-instructies en zelfstandige ontwikkeling, maar **geen nieuwe live publicatie zonder zijn toestemming**. Kosten blijven verboden. Code/tests/docs en draft-GitHubupdates blijven toegestaan; geen Cloudflare-mutaties uitvoeren op basis van de oudere publicatietoestemming.

## Zelfstandig toegestaan

Samenhangende code-, test-, bugfix- en documenttaken op eigen branches; commits en pull requests; taken, besluiten en hervatpunt bijwerken. Gebruik synthetische gegevens. Als een reviewer niet beschikbaar is, neem veilig werk zelf over en markeer dat als eigen controle, niet onafhankelijk.

## Nooit zonder expliciete toestemming

Kosten/betaalde diensten, productiepublicatie, nieuwe externe accounts of gevoelige koppelingen, delen van gevoelige gegevens, grote functionele scopewijzigingen, uitschakelen van beveiliging, onomkeerbare handelingen. **Geen merge naar main, geen force push, geen auto-merge, geen rechtstreekse push naar main.** Een geslaagde test is geen toestemming.

## Taakgroepen

Gebruik bestaande CLOUD-nummers. Houd samenhangend werk in één run; na iedere groep tests, commit, takenlijst, DEVELOPMENT_PROGRESS en RESUME bijwerken en volgende veilige taak uitvoeren. Stop bij echte blokkade, noodzakelijke toestemming of uitvoeringslimiet. Vermijd dubbele audit en onnodige parallelle agents. Externe dependencymogelijkheden controleren, niet zomaar vervangen.

## Verificatie

Node 24 aanbevolen. `node --experimental-strip-types --test tests/*.test.mjs` vereist geen externe npm-packages. Met dependencies: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`. Geen Mac-paden hardcoden. Native iOS is nog niet gebouwd; geen echte iPhone-test claimen vanuit een Cloud-VM. `lib/access-policy.ts` is geen aangesloten authenticatiebackend. De app bevat alleen tijdelijke demo-invoer.

Controleer vóór elke publicatie diff en geheimen; geen .env, caches, privéfoto's, GPS-historie, Apple-certificaten of databasebestanden. `scripts/scan-handover.mjs` is een beperkte patrooncontrole, geen volledige veiligheidsgarantie. Bewaar bestaande wijzigingen. Bestaande PR-keten: #1 → #2 → overdrachts-PR; niet ongemerkt rebasen, samenvoegen of bases wijzigen.
