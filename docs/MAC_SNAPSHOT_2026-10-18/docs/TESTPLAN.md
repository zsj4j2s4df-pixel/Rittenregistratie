# Testplan

## Huidige controlelijst (niet gelijk aan uitgevoerde tests)

Build, typecheck en lint zijn commandocontroles. De onderstaande UI-controles zijn vooralsnog handmatige browsercontroles, geen bestaande automatische regressiesuite. Migratiegeneratie bewijst niet dat migratie en gegevensintegriteit zijn getest. Resultaten van 16 oktober staan apart in `TESTRESULTATEN.md` en zijn historische waarnemingen.

- TypeScript/productiebuild;
- geldige database-migratie;
- hoofdpagina geeft HTTP 200;
- navigatie tussen alle zes hoofdschermen;
- themawissel donker/zand;
- classificatie privé/zakelijk en bevestigingsmelding;
- filters in de rittenlijst;
- CSV-download met kolomkoppen en voorbeeldritten;
- responsieve CSS voor desktop, tablet en smal mobiel;
- reduced-motion-regel aanwezig.

## Later in simulator/browser

- invoer, validatie en foutmeldingen voor voertuig, adres en tarief;
- PDF-paginering en lange tabellen;
- accounts, sessieverloop en server-side rechten;
- synchronisatieconflicten en auditlog;
- kaarten met echte kaartprovider en ontbrekende routepunten;
- deduplicatie van gelijktijdige detecties.

## Verplicht op echte iPhones

- ritstart/-einde in voor- en achtergrond;
- appbeëindiging, herstart en Background App Refresh uit;
- GPS-uitval, parkeergarage, stoplichten en korte stops;
- batterijverbruik;
- Bluetooth verbinden/verbreken en dubbele meldingen;
- Focus-standen en geweigerde machtigingen;
- meerdere telefoons in dezelfde Jeep;
- CarPlay alleen na entitlementbeoordeling;
- VoiceOver, dynamische tekst en reduced motion.

## Nog niet testbaar

- OBD2 zonder gekozen adapter;
- productieback-ups zonder gekozen hosting;
- fiscale volledigheid zonder kenteken, tellerstanden en definitieve gebruikerscontext;
- MCP-platformkoppelingen zonder gekozen platform, HTTPS-hosting en OAuth-configuratie.
