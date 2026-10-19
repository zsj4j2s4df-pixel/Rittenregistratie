# Routepunten lezen — afgebakende servercore

19 oktober 2026. Deze groep voegt alleen de read-only routeservice, tests en dit document toe. Geen GPS-inname, routeberekening, externe kaartdienst, HTTP-route, UI, configuratie, migratie of deployment toegevoegd.

## Contract

`createRouteService(db, resolveSession?, clock?).points(vehicleId, tripId, limit = 250, after = 0, through?)` retourneert:

```ts
{
  points: { id, recorded_at, latitude, longitude, accuracy_meters, source }[],
  through: number,
  nextAfter: number | null
}
```

- `limit`: veilig geheel getal van 1 t/m 500; `after`: veilig geheel getal vanaf nul. Een optionele `through` is eveneens een veilig niet-negatief geheel getal; bij een opgegeven grens moet `after <= through` gelden. Geen coercion van strings, null of niet-eindige waarden.
- De eerste pagina zonder `through` bepaalt `MAX(route_points.id)` voor uitsluitend deze rit. Highwater en eerste puntselectie gebeuren in dezelfde D1-batch/readtransactie. Een rit zonder punten heeft `through = 0` en een lege puntenlijst. Dat verschilt van een ontbrekende rit.
- Vervolgpagina's gebruiken `id > after AND id <= through`, op oplopende punt-ID, zonder offset. Geef daarvoor `nextAfter` en dezelfde ontvangen `through` door. Als `nextAfter` null is, is de grens bereikt. Eén extra interne rij bepaalt of er werkelijk een volgende pagina is; de response bevat nooit meer dan `limit` punten.
- Punten worden op ID gesorteerd, niet op opnametijd. De tijd blijft zichtbaar als `recorded_at`, in Unix-seconden. De service behoudt opgeslagen waarden en maakt geen ontbrekende coördinaten, nauwkeurigheid of broninformatie aan.
- `through` is een paginagrens en geen authenticatietoken. De garantie rond nieuwe inserts geldt wanneer de client de oorspronkelijk ontvangen grens ongewijzigd doorgeeft. Deze grens bevriest geen bestaande puntinhoud en verhindert geen beheerwijziging of verwijdering buiten deze read-only service. Voor een nieuwe actuele reeks laat de client `through` weg en begint bij `after = 0`.

## Toegang en fouten

Standaardresolver weigert toegang. De interne autorisatie gebruikt een server-side geverifieerde Principal en actuele actieve voertuigtoegang. Beide SQL-query's controleren afzonderlijk de actieve caller membership en de binding van rit aan voertuig, ook na de voorafgaande autorisatie. Alle invoer is gebonden als SQL-parameter. Andere voertuigpunten bepalen de highwater niet en worden niet teruggegeven.

Geen sessie of verlopen sessie: 401. Ontbrekende voorafgaande voertuigtoegang: 403. Ontbrekende of anders gebonden rit: 404. Wanneer rechten tussen voorafgaande autorisatie en de readbatch verdwijnen, blijft de batch leeg en volgt 404. Ongeldige cursor/limiet/rit-ID: 400. Onveilige opgeslagen punt-IDs: 409. Onverwachte batchresultaten: 500. Sessieverval wordt na de batch opnieuw gecontroleerd, voordat punten worden teruggegeven.

De output bevat alleen de zes genoemde puntvelden en paginacursors; geen voertuig-/ritmetadata, actor-ID of andere databasekolommen. Zowel gemeten als eerder opgeslagen geïnterpoleerde punten blijven herkenbaar via hun oorspronkelijke `source`. De aanwezigheid van punten of een bronlabel bewijst geen echte GPS-meting, nauwkeurigheid, routevolledigheid of afwezigheid van gaten.

## Validatie

`tests/route-service.test.mjs` bevat zeven tests met echte lokale SQLite-query's via de bestaande D1-adapter:

- Veldenwhitelist, andere voertuigpunten uitgesloten en trip-only highwater.
- 1.203 eigen punten, tussenliggende andere voertuigpunten en een nieuw punt tussen pagina's: oorspronkelijke reeks exact eenmaal; nieuw punt verschijnt pas bij een nieuwe grens.
- Bestaande lege rit versus ontbrekende of anders gebonden rit; gebonden SQL-injectietekst levert geen gegevens.
- Geen/ongeldige/verlopen sessie, uitgeschakeld account en ingetrokken lidmaatschap tussen pagina's.
- Ongeldige limieten/cursors/rit-IDs en de geldige lege grens nul.
- Intrekking na de voorafgaande autorisatie: beide batchqueries leeg.
- Eerste highwater en puntselectie in één batch, plus sessieverval tijdens het lezen.

Gerichte zeven tests, TypeScript `--noEmit` en gerichte ESLint slagen. Dit is geen live D1-, browser-, apparaat- of GPS-test. De bovenliggende HTTP/clientintegratie wordt afzonderlijk uitgevoerd.

## HTTP/client en centrale weergave — primaire integratie

GET /api/vehicles/:vehicleId/trips/:tripId/route accepteert uitsluitendlimit/after/through en alleenGET. De client verzamelt pagina's met dezelfde servergrens en weigert meer dan10000punten of niet-voortgaande cursors zonder een gedeeltelijke route te tonen. Alle antwoorden blijven no-store/nosniff; geen rawGPS in IndexedDB/recoveryqueue.

De ritcorrectieviewer biedt expliciet GPS-spoor laden. Geen punten betekent expliciet geenGPS-route opgeslagen, nooit een voorbeeldroute. De SVG is een schematisch spoor zonder kaartondergrond/provider, geen navigatie of afstandsberekening. Als interpolatie opgeslagen segmenten zijn herkenbaar; tijdgaten>120s en onnauwkeurigheid>100m worden niet doorgetekend. Onbekende precisie/ongeldige posities worden gemeld. Deze presentatiedrempels zijn geen GPSvalidatie. Dateline/singlepoint/ongeldige posities en segmentering zijn domeingetest.

PASS:10routecases (7service,2geometry,1echteHTTP/client) en echte lokale D1-readbatch. Gecombineerde werkmapsuite153tests/type/lint PASS omvat5afzonderlijke nog-niet-gemounteMCPcases; die MCPbestanden zitten niet in deze routegroep. Build PASS. Chromium bewijst lege route zonder fabricatie,1203punten via meerdepagina's, bewijslabels en verdwenen geometrie na geweigerde herlezing. Bestaande recovery- en historie-paginatiebrowsers blijven PASS. Geen echte GPS-opname, kaartdienst, Safari,remoteD1 of apparaatvalidatie.
