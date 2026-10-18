# Testresultaten — 16 oktober 2026

## Geslaagd

- Productiebuild: geslaagd.
- TypeScript-controle zonder uitvoer: geslaagd.
- ESLint: geslaagd, 0 fouten en 0 waarschuwingen.
- Drizzle-schema: 7 tabellen herkend en SQL-migratie gegenereerd.
- Lokale route `/`: HTTP 200.
- Browser: alle zes hoofdschermen bereikbaar.
- Themawissel: hoofdcontainer wisselt van `dark` naar `sand`.
- Classificatie: open rit gewijzigd naar zakelijk en bevestigingsmelding getoond.
- Rittenfilter: privéfilter toont 2 voorbeeldritten.
- Kaartscherm, rapportage, Mijn Jeep en Instellingen renderen zonder browserconsolefouten.
- Gebruikers: Dennis, Ingrid en Jesse zichtbaar in de ingestelde prioriteitsvolgorde.
- CSV-actie: handler uitgevoerd en bevestigingsmelding getoond. De in-app browser gaf geen bruikbaar download-event terug; het opgeslagen bestand is daarom nog niet buiten deze browser gevalideerd.
- Mobiele controle op 390 × 844: breedte blijft 390 px, geen horizontale overflow, navigatie staat vast onderaan en bevat 6 items.

## Niet geclaimd als getest

- echte iPhone, achtergrondlocatie, bewegingsherkenning en batterijgebruik;
- echte Bluetooth- of CarPlay-verbinding;
- OBD2;
- centrale productieauthenticatie en synchronisatie;
- PDF-export en fiscale volledigheid;
- back-ups, herstel en productiehosting;
- MCP via OAuth.

De huidige zichtbare ritten zijn voorbeelddata. Een fiscale of productieklare werking wordt niet geclaimd.
