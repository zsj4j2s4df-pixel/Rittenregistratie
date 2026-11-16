# RitKompas — overdracht aan Claude Code

Opgesteld 16 november 2026 op verzoek van de eigenaar voor verder werken vanaf
zijn iPhone. Geschoonde projectstatus, zonder persoonlijke adressen, Authsubjects,
profielbestanden, sleutels, privélogs of echte rit-/locatiegegevens.

## 1. Doel en bron

RitKompas registreert privé- en zakelijke ritten voor een Jeep Wrangler 4xe.
Het doel is een bruikbare native iPhone-app met ritopname, duidelijke classificatie,
Siri/meldingen en betrouwbare centrale opslag, naast een webapp voor overzicht,
correcties en rapporten. Volledige automatische productieacceptatie is nog open.

Repository: https://github.com/zsj4j2s4df-pixel/Rittenregistratie
Ontwikkelcode bij overdracht: PR75/head91c791bdb44688c01490d7f26031b12b33bb60fe.
De huidige docsbranch staat daarboven. Geen mainmerge uitvoeren.

| PR | Betekenis | Broncommit |
|---|---|---|
| 75 | Mac-regressietest voor oude bewaarde verzendplannen | 91c791bdb44688c01490d7f26031b12b33bb60fe |
| 74 | HTTP400-fix bij GPS-start/eindobservaties | 677b792e488cb5e1f5db51ad1b8046f96ecacb06 |
| 73 | Begrijpelijk native beginscherm, ritbediening vóór instellingen | 115793257c7312dc4b8673869e3e59c7dc0e22c4 |
| 72 | Geïntegreerde GPS-proef, Siri, meldingskeuze, herstelbare sync | b0e4ea1470f46f552213e882a95af78800abec58 |

Alle vier PRs zijn op 16 november opnieuw als OPEN/niet samengevoegd gelezen.
Een PR-/branchnaam alleen bewijst geen publicatie of installatie.

## 2. Projectkaart

| Onderdeel | Waar |
|---|---|
| Native Swift-kern en versleutelde proef/sync | ios/RitKompas/Core/ |
| Swift-tests | ios/RitKompas/Tests/ |
| Echte SwiftUI-app en Xcode-project | ios/RitKompasApp/ |
| Webpagina's en API-routes | app/ |
| Gedeelde backend/domeinservices | lib/ |
| Schema en additieve migraties | db/schema.ts en drizzle/ |
| Node-/SQLite-/HTTP-tests | tests/ |
| Build-/controlehulpmiddelen | scripts/ |
| Goedkeurde visuele bestanden | public/brand/ en native resources |
| Actuele stijl | docs/design/RITKOMPAS_HUISSTIJL.md, tokens.json en gekoppelde skill |
| Hoofdeisen | Jeep_4xe_Rittenregistratie_Masterprompt_BIJGEWERKT.md |
| Eisenregister/testplan/securityvoorcontrole | docs/ASTRA_AUDIT/ |
| GPS-proef en toestelinstructies | docs/automatic-trips/ |
| Bronfix en Mac-vervolgkaart | docs/TRANSFER/NATIVE_TRIAL_SYNC_FIX_2026-11-01.md |

Gebruik alleen de relevante stukken; doe niet iedere sessie een nieuwe volledige
inventaris. Bewaar eisenregister en oude besluiten, maar verwar oude status niet
met nieuw runtimebewijs. docs/MAC_SNAPSHOT_2026-10-18 is historisch materiaal.

## 3. Laatst werkelijk vastgesteld

### Bron, tests en schermen — 1 november

Dezelfde bron is op de Mac gecontroleerd: 313 Node-tests en 95 Swift-XCTest PASS,
unsigned iPhone- en simulatorbuilds geslaagd. De extra Swift-test herlaadt een
bevroren versie1-verzendplan bij het begin en bij een nog niet bevestigd einde,
met behoud van rit, registratie en alle event-/request-ID's. Gesloten exactretry
verstuurt geen nieuwe observaties. Zie PR75 voor de synthetische regressie.

Simulatorapp werkelijk gestart. Uitgelogd beginscherm, Desert/Anthracite en
instellingen openen/sluiten gezien. Dat bewijst geen echte account-/GPS-/Siri-
acceptatie. Dit zijn historische testuitslagen, niet opnieuw uitgevoerde tests
op 16 november. Verifieer opnieuw wat door jouw wijzigingen wordt geraakt.

### Fysieke installatie en Apple-blokkade — 2 november

De reparatieapp is op de bestaande test-iPhone bijgewerkt. Xcode meldde dat de app
draaide; geen uninstall of bewuste opslagreset uitgevoerd. Het profiel bleef het
oude profiel en verliep op 2 november om 12:51 uur Nederlandse tijd.

Vernieuwen lukte niet: Apple accepteerde de opgeslagen Xcode-aanmelding niet.
De eigenaar moest zelf opnieuw aanmelden/2FA doen. Niet bewezen dat dit daarna
is afgerond. Behandel het profiel nu als verlopen totdat een actuele controle
een nieuwe geldige vervaldatum aantoont. Niet 'zeven dagen verlengd' claimen op
basis van alleen opnieuw installeren. Geen betaald TestFlighttraject gestart.

### Accounts en website — laatst bekende stand

De drie bedoelde persoonlijke appaccounts zijn eerder ingericht; de laatste twee
zijn op 29 oktober uitgenodigd en afzonderlijk gekoppeld. Niet opnieuw aanmaken,
uitnodigen of rechten wijzigen omdat oudere documenten nog OPEN vermelden.
Ontvangst en volledige persoonlijke loginacceptatie zijn niet voor iedereen bewezen.
Een appgebruiker is geen beheerder van Supabase of Cloudflare.

Webapp: https://rittenregistratie.zsj4j2s4df.workers.dev
Supabase verzorgt appaanmelding; de bestaande Cloudflare Worker/D1 verzorgt de
centrale applicatie en opslag. De extra Cloudflare Access-inlog vóór de app is
24 oktober verwijderd na eigenaarbesluit; appauth bleef verplicht.
Geen nieuwe liveconfiguratie- of beschikbaarheidstest uitgevoerd op 16 november.
Vraag nooit om accountgeheimen in de chat. Hergebruik uitsluitend bevoegde toegang.

## 4. Twee verschillende problemen — niet verwarren

### A. De app opent niet: testprofiel verlopen

Dit is een Apple-installatieblokkade. Een codewijziging aan de ritstart lost dit
niet op. Nodig: persoonlijke Apple-heraanmelding in Xcode op de Mac, geldige
ondertekening via hetzelfde bestaande team, dezelfde app bijwerken, nieuwe echte
vervaldatum en launch controleren. Behoud bundleID, Keychain en appcontainer.

### B. Start rit blijft grijs: oude proef nog niet bevestigd

NativeCaptureView blokkeert Start rit bij busy of een gestopte rit zonder
syncedJourneyID. NativeTrialTrip voorkomt ook het overschrijven van zo'n rit.
Dat kan de waarneming van de eigenaar verklaren; de precieze toestelstatus is
nog niet opnieuw bewezen. De app legt de blokkade onvoldoende uit.

De oude proef moet veilig centraal bevestigd worden. Maak de knop niet bruikbaar
door de proef/queue te wissen, een nieuwe identiteit te kiezen of IDs te vervangen.

PR74 repareert een concrete contractfout: start/stop met echte GPS-locatie werd
als source manual verstuurd. De intake weigert locatie bij manual met HTTP400.
Met locatie wordt source gps, zonder locatie blijft manual. De expliciete start/
stophandeling en onzekere GPS-status blijven behouden. Servervalidatie niet versoepeld.
Afgewezen aanvragen kregen geen receipt: dezelfde IDs kunnen met de gecorrigeerde
bron opnieuw worden gebruikt. Echt andere bestaande inhoud blijft conflict409;
geen receipt of serverrecord forceren/overschrijven.

Nog NIET GETEST: bestaande echte proef op de bijgewerkte iPhone opnieuw versturen,
centrale bevestiging teruglezen en daarna werkelijk een nieuwe rit starten.
Een gesloten journeybewijs is bovendien geen definitieve logboekrit. Controleer
ook daadwerkelijke websitezichtbaarheid en de bestaande review/materialisatieflow.

## 5. Eerstvolgend werk

1. Controleer repositorybasis, nieuwe PRs en beschikbare tools. Meld wat je zelf
   werkelijk kunt uitvoeren in je huidige omgeving.
2. Veilige codegroep voor Claude: onderzoek en verbeter duidelijke status/herstel-
   bediening rond de geblokkeerde startknop. Laat zien waarom de vorige rit eerst
   verstuurd moet worden; behoud de opslag-/retry-/accountgrenzen. Test relevante
   toestanden, fouten en herstel. Geen fictieve succesvolle ontvangst tonen.
3. Bereid een korte Mac-overdracht voor de Apple-blokkade en echte ritproef voor.
   Alleen de Mac met Xcode, bevoegde persoonlijke Apple-aanmelding en aangesloten
   iPhone kan die installatie-/hardwarestappen bewijzen.
4. Op Mac: dezelfde app bijwerken zonder verwijderen, bestaande proef herladen,
   éénmaal Verstuur gestopte rit, veilige foutcategorie of echte serverbevestiging
   vastleggen. Geen echte GPS-/tokenlogs publiceren.
5. Na bevestiging: nieuwe korte proef, classificatie, stop, versturen, exactretry,
   daarna achtergrondopt-in, vergrendeling, Siri/meldingen en Jeep/CarPlay apart.
   Bestuurder bedient de telefoon niet tijdens rijden.

Een iPhone als toegang tot Claude Code betekent niet dat er Xcode op die iPhone
beschikbaar is. Werk met wat het echte aangesloten uitvoersysteem ondersteunt.
Stop niet al het code-/documentwerk omdat de Mac tijdelijk niet bereikbaar is.

## 6. Bouwen en testen

Gebruik bestaande lockfiles en scripts, geen onnodige toolchain-upgrades.

```sh
node --version
node --experimental-strip-types --test tests/*.test.mjs
```

Node24 is de laatst geteste Mac-runtime. Voor webchecks met bestaande dependencies:
`pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build` (zie package.json).
Installeer niet blind dependencies wanneer alleen documenten veranderen.

Op een Mac met de bestaande Xcode/Swift-toolchain:

```sh
swift test --package-path ios --configuration release
xcodebuild -project ios/RitKompasApp/RitKompasApp.xcodeproj   -scheme RitKompasApp -configuration Debug   -destination 'generic/platform=iOS' CODE_SIGNING_ALLOWED=NO build
```

Gebruik voor een fysieke update lokale goedgekeurde signing; publiceer geen team-
IDs/profielen/certificaten. Code signing faalde eerder door Finder/iCloud-metadata
in gegenereerde buildproducten; bouwen in een lokale map buiten iCloud hielp.
Wis hiervoor nooit de telefoonapp of de oorspronkelijke ritgegevens.
Beschikbaarheid van Swift op Linux bewijst geen werkende Apple-frameworktest.
Markeer onuitvoerbare checks expliciet NIET GETEST, met reden.

## 7. Veiligheid en samenwerking

Zelfstandig: code, synthetische tests, documentatie, eigen branches en draft-PRs.
Eigenaar beslist over kosten, productiepublicatie, mainmerge, nieuwe gevoelige
koppelingen/toegang, veiligheidsversoepeling en onomkeerbare handelingen.
Geen forcepush of automatische merges. Documentoverdracht autoriseert geen deploy.

Geen nieuwe accounts of migraties uitvoeren als 'oplossing' voor een onbekende
status. Geen service_role, browsercookie, signingkey of mailtoken opzoeken om een
persoonlijke aanmelding te omzeilen. Gebruik bestaande auth-/voertuigscopechecks.

GitHub is het overdrachtskanaal, geen automatisch gesprekssysteem. Maak geen claim
'Codex weet dit nu' zonder aantoonbare verzending/ontvangst. Eigenaar kan je korte
Mac-opdracht doorsturen. Alleen door eigenaar geautoriseerde externe berichten sturen.

## 8. Onderhoud voor iedere volgende sessie

Werk na een taak RESUME.md, CLOUD_TASKS.md en DEVELOPMENT_PROGRESS.md bij met datum,
broncommit/PR, resultaat, tests, NIET GETEST, blokkade en concrete vervolgstap.
OWNER_ACTIONS.md bevat alleen persoonlijke eigenaaracties; CLOUD_HANDOVER.md wijst
naar het actuele hervatpunt. Corrigeer de actieve status hier als nieuw bewijs
binnenkomt; behoud oudere gebeurtenissen als gedateerde historie.

Op 16 november zijn repositorystatus en lokale gesprekscheckpoints samengebracht.
Nieuwe Apple-aanmelding, profielverlenging, liveomgeving en fysieke ritacceptatie
zijn daarbij niet opnieuw gecontroleerd. Laat de eigenaar alleen noodzakelijke
persoonlijke stappen doen en geef daarvoor korte klik-voor-klik-instructies.
