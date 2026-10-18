# Eisen-trace — eerste nulmeting

Update 17 oktober: eisen 12/14/25 hebben nu demo-eerlijkheidscorrecties en vijf pure unit-tests in `tests/trip-utils.test.mjs`; dit bewijst geen GPS, fiscale rapportage of integratie. Eis 24 heeft een apparaattestmatrix voor iPhone 11 Pro en nieuwer. Zie CODE_AUDIT en TESTS_2026-10-17. Onafhankelijke reviews zijn niet uitgevoerd wegens kredietlimiet. Onderstaande tabel bewaart de oorspronkelijke nulmeting.

Bron: bijgewerkte masterprompt in bronnen, hoofdstukken 0–22. Alle wensen blijven gelden. Onderstaande 26 regels volgen checklist §19; details in de genoemde hoofdstukken blijven integraal onderdeel van elke eis. Dit is nog geen volledige testcasespecificatie per subeis. Status is gebaseerd op code/documentinspectie, niet nieuwe runtime-tests.

| Eis / master | Implementatiebewijs | Nog vereist / teststatus |
|---|---|---|
| 01 voertuig §1,12 | page.tsx naam; schema vehicles | Uitvoering/jaar/bronnen niet geverifieerd |
| 02 native/web/backend/sync §1,14 | Alleen web; db-schema | iOS, API, duurzame opslag, sync ontbreken |
| 03 accounts/rechten/audit §3 | users/auditLogs schema; ongebruikte authhelper | Geen geïntegreerde accounts, rechten of auditwrites |
| 04 automatische detectie §4 | Alleen handmatige UI-status | GPS/beweging/start/stop/uitval niet gebouwd/getest |
| 05 Bluetooth-melding §5 | Geen implementatie | iOS-onderzoek en apparaatproef vereist |
| 06 snelle classificatie §5,7 | useState in page.tsx | Geen opslag/historie; privé-eerst regressies nodig |
| 07 CarPlay §5.1 | Geen implementatie | Officiële toelating en fallback onderzoeken |
| 08 prioriteit §6 | Statische weergave | Tie-breaker, onzekerheid en correctie ontbreken |
| 09 deduplicatie §6 | Statusveld schema | Centrale samenvoeging en geschiedenis ontbreken |
| 10 privé-eerst §7 | review-default schema | End-to-end tests ontbreken; geen fiscale garantie |
| 11 zakelijke adressen §7.1 | Schema; UI-knop | CRUD, suggestiereden en historie ontbreken |
| 12 lijst/kaart/filter §8 | Demo lijst/filter; CSS-kaart | Echte kaart/routegegevens en volledige filters ontbreken |
| 13 historische vergoeding §9 | mileageRates schema | Berekening en onveranderlijke historie niet getest |
| 14 rapporten/validatie §10 | CSV-handler, rapportdemo | PDF ontbreekt; CSV-bestand/validaties niet bewezen |
| 15 Mijn Jeep §12.1 | Scherm met onbekende waarden | Verificatie/bronnen per specificatie ontbreken |
| 16 kenteken §10,12 | registrationPlate schema | Invoer en rapportdoorgifte ontbreken |
| 17 OBD2 §12.2 | Geen implementatie | Vergelijking en adapterlaag; niets aanschaffen |
| 18 thema's §11.2 | dark/sand CSS en tijdelijke state | Contrast/volledigheid/sync te testen |
| 19 hoofdfoto §11.4 | public/jeep-hoofdfoto.jpg | Rechten/uitvoering en gebruikersbedoeling open D-006 |
| 20 naam/logo §11.5 | README vijf opties; werktitel | Naam-/domeinonderzoek en definitieve keuze ontbreken |
| 21 animaties §11.6 | CSS aanwezig | Concepten, alle zes situaties en toegankelijkheid niet geaccepteerd |
| 22 MCP §13 | Geen implementatie | Copilot eerst onderzoeken; read-only/OAuth/rechten/tests ontbreken |
| 23 beveiliging §14 | Losse helper/schema | Dreigingsmodel, sessies, autorisatie, privacy, back-ups/herstel ontbreken |
| 24 installatie §14,17 | Webscripts | Drie iPhones/updates/kosten nog onderzoeken |
| 25 tests/rapportage §15–17 | Testplan en historisch verslag | Geen unit/integratiesuite; onafhankelijke reviews nog uitvoeren |
| 26 geen Codex-aan/uit §0,17 | Geen dergelijke functie aangetroffen | Uitsluiting behouden |

Proces: §0,2 en16–18 vervangen qua volgorde door nieuwe A–E-opdracht, niet inhoudelijk geschrapt. §20 bronhistorie behouden. §21 context opgenomen in DECISIONS/architectuur; §22 uitgevoerd via OWNER_ACTIONS. Toolonderzoek uit §14 blijft open. Voor elk later geïmplementeerd onderdeel moeten exacte test-ID's, uitslagen en reviewbewijs worden toegevoegd; lege cellen zijn nooit een geslaagde test.
