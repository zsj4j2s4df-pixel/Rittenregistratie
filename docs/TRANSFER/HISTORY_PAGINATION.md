# Oudere rit- en instellingenhistorie

19 oktober 2026. Centrale historie ondersteunt nu keysetpaginatie; geen externe koppeling, deployment, migratie of betaalde installatie uitgevoerd in deze taak.

## Contract en gedrag

- Bestaande historie-endpoints blijven `{history: [...]}` teruggeven. Service-methoden blijven arrays teruggeven en behouden standaard 50 regels, met maximaal 100 regels per aanvraag.
- `tripService.history(vehicleId, tripId, limit = 50, before?)` en `settingsService.history(vehicleId, limit = 50, before?)` accepteren een optionele positieve veilige gehele audit-ID. De query gebruikt `id < before`, gesorteerd op `id DESC`; geen offset. Een cursor is geen toegangsrecht: iedere pagina controleert actuele identiteit, voertuiglidmaatschap en bij rithistorie de geselecteerde rit.
- HTTP GET `/api/vehicles/:vehicleId/trips/:tripId/history?limit=100&before=:auditId` en `/api/vehicles/:vehicleId/settings/history?limit=50&before=:auditId` accepteren uitsluitend de optionele `limit` en `before`, eenmaal per parameter. Niet-gehele/negatieve/nul/te grote cursors, onbekende parameters en `offset` worden geweigerd. Andere routes accepteren daardoor geen nieuwe parameters.
- Browserclient `history(vehicleId, tripId, before?)` behoudt pagina's van 100; `settingsHistory(vehicleId, before?)` behoudt pagina's van 50. Arrays en eerdere aanroepen blijven bruikbaar. De bestaande verwachte-accountvoorwaarde voor herstelaanvragen is ongewijzigd.
- Beide viewers bieden **Oudere wijzigingen laden** met de oudste geladen ID als cursor, tonen de paginagrens en voegen resultaten zonder dubbele IDs toe. Nieuw binnengekomen audits verschuiven oudere pagina's niet; **vernieuwen** wist de lijst/cursor en begint bij de nieuwste wijzigingen. Een volle laatste pagina kan nog één lege vervolgpagina opleveren voordat de knop verdwijnt.
- Op 401/403/404 verdwijnt reeds geladen historie. Andere fouten bij een vervolgpagina behouden de zichtbare regels met een foutmelding en mogelijkheid opnieuw te laden. Contextwissels en verversen annuleren verwerking van oude responses; er worden geen wijzigingen automatisch verstuurd.

## Bewijs en grenzen

`tests/history-pagination.test.mjs` bevat vier integratietests met echte SQL via de lokale SQLite/D1-adapter en de werkelijke HTTP/clientlaag:

1. 127 regels per entiteittype, doorschoven voertuig/ritregels en een nieuwe audit tussen pagina's: alle oorspronkelijke IDs eenmaal, nieuwe audit pas na verversen.
2. Bestaande service-arraycontracten, standaardlimieten, lege eindpagina en ongeldige cursors/limieten; geen toegang via een andere rit of ander voertuig.
3. Strikte HTTP-queryvalidatie op beide historie-endpoints, inclusief herhaalde parameters en afwijzen van offset.
4. Actieve scope intrekken of account uitschakelen tussen pagina's: volgende clientaanroep wordt geweigerd.

Validatie bij afronding: **138/138 Node-tests PASS**, TypeScript `--noEmit` PASS en gerichte ESLint PASS op alle gewijzigde code/testbestanden. Bestaande queue-accountregressie slaagt. Deze taak heeft geen browserrun of nieuwe build uitgevoerd; UI-gedrag is geïmplementeerd en statisch gecontroleerd, maar niet als browserbewijs geclaimd. De bestaande lokaal uitgevoerde D1-adaptertests zijn geen nieuwe test tegen een live D1-database.

Paginatie is geen onveranderlijke export: nieuwe auditregels verschijnen na verversen en administratieve externe gegevenswijzigingen vallen buiten een browserpagina. De centrale auditrecords blijven de bron; deze wijziging introduceert geen verwijderfunctie of migratie.

## Aanvullende primaire verificatie

PASS: volledige typecheck/lint/build en echte Chromium→HTTP→SQLite met125regels/type, tussentijdse nieuwe audit, ouderepagina zonder verschuiving/duplicaten, verversen terug naar nieuwste en401/403-clearing in beide viewers. tests/history-browser-smoke.mjs. Bestaande IndexedDB-recoverybrowser met accountwissel/staledelete blijft PASS. Dit vervangt de eerdere UI-NIETGETEST-notitie voor deze lokale Chromiumflow; liveprovider/Safari/remoteD1 blijven niet getest.
