# Begrensde detectie-inname — ruwe appobservaties

19 oktober 2026. Nieuwe factory `createDetectionService(db, resolveSession?, clock?)` in `lib/detection-service.ts`. Methoden: `ingest(vehicleId, deviceId, input)` en `list(vehicleId, deviceId, limit=50, offset=0)`. Alleen servercore; geen HTTP-route, native sensor, achtergrondtaak, externe account, databasepublicatie of automatische ritvorming in deze taak.

De relevante bestaande eisen zijn REQ-011–016 (detectie en uitval), REQ-026–027 (onzekerheid en scheiding detectie/rit) en REQ-030 (geen automatische zakelijke classificatie). Deze kern is een bouwsteen, geen voltooiing van native detectie. Registratie van een app-instantie en geverifieerde gebruikerssessie bewijzen geen fysieke telefoonidentiteit, GPS-nauwkeurigheid, werkelijke Bluetooth-/CarPlay-ondersteuning of bestuurder.

## Invoercontract

`DetectionInput` bevat uitsluitend:

- `requestId`, `eventId`: 16–128 ASCII letters/cijfers/streepje/underscore; eigen appinstantie wordt apart als parameter meegegeven.
- `observedAt`: gehele Unixseconden, 0 t/m 253402300799, maximaal vijf minuten vooruit ten opzichte van de serverklok. Historische offline-observaties mogen later aankomen; de datum is een ongeverifieerde appclaim.
- `source`: `gps`, `bluetooth`, `carplay` of `manual`.
- `kind`: `location`, `start_candidate`, `end_candidate`, `connection` of `disconnection`.
- Optioneel `detail`, maximaal 500 tekens.
- Optioneel `location` met uitsluitend eindige latitude -90..90, longitude -180..180 en accuracyMeters 0..100000. Een `location`-event vereist GPS-bron en volledige locatie; een niet-GPS-bron mag geen GPS-locatie meesturen. GPS bij een start-/eindkandidaat blijft een ruwe observatie.

Onbekende velden (waaronder actor, bestuurder, classificatie en goedkeuring) worden geweigerd. Geen status, afstand, fiscaliteit of rit wordt uit deze inhoud afgeleid. Canonieke JSON gebruikt een vaste veldvolgorde, inclusief een vaste volgorde van locatievelden; identieke inhoud met een andere object-keyvolgorde herhaalt dezelfde gebeurtenis. Bronvelden en onderscheid ontbrekend/lege detail blijven behouden. De canonieke UTF-8-payload is maximaal 16 KiB; de strikte veldgrenzen zijn nog kleiner. Een latere HTTP-adapter moet daarnaast vóór JSON-parsen een harde bodylimiet hanteren; deze kern begrenst geen reeds door een caller toegewezen JavaScript-objectgeheugen.

## Autorisatie, herhaling en opslag

Iedere read/ingest vereist een verse servergeverifieerde sessie, actieve voertuigmembership en een **eigen actieve** geregistreerde appinstantie op dat voertuig. Geen resolver = weigeren. Autoriteit wordt niet uit de payload gehaald. De databasepoort wordt opnieuw in INSERT/receipt-SQL afgedwongen, zodat deactivering of membershipintrekking vlak vóór de batch geen observatie of ontvangstbewijs creëert. Herhaalresultaten en reads controleren opnieuw actieve toegang; een gedeactiveerde instance kan zijn ontvangstbewijs niet als toegangsbewijs gebruiken.

Migratie `0009_detection_ingest.sql` voegt aparte `detection_observations` en `detection_ingest_requests` toe, met foreign keys, vaste bron/kind/onzekerheid, tijd-/payloadchecks, uniek `(device_id,event_id)` en receipt-key `(vehicle_id,user_id,device_id,request_id)`. Ruwe observaties kunnen niet worden bijgewerkt: UPDATE-trigger weigert mutatie. Geen bestaande tabellen worden herbouwd en geen historische rijen worden verwijderd. De oorspronkelijke appobservatietijd en afzonderlijke serverontvangsttijd worden beide bewaard; onzekerheid is altijd `unverified_app_observation`.

Ingest is een transactionele batch van observatie, requestreceipt en audit. Een unieke servermarker koppelt uitsluitend de nieuwe observatie aan zijn audit; concurrerende retries voegen geen tweede observatie/audit toe. Nieuwe requestId met dezelfde eventId en identieke canonieke inhoud krijgt dezelfde observatie. Hergebruik van requestId of eventId met andere inhoud geeft conflict. De opgeslagen actor is uitsluitend de geverifieerde sessiegebruiker. Auditfouten rollen observatie en receipt terug. De in-memory klok en verstrekte sessie moeten echte serverinterfaces zijn, geen ongecontroleerde body-/headerclaims.

`list` toont uitsluitend eigen actieve instance-observaties met limit 1–100 en offset 0–100000. Dit is begrensde paginering, geen gegarandeerd onveranderlijke cursor of volledige synchronisatie. Observaties van andere bestuurders worden niet aan deze methode beschikbaar gemaakt. De onderstaande operationele innamegrenzen zijn toegevoegd. Globale account-/voertuigquota, request-rate-limiting vóór authenticatie, back-pressure, sensoringest-batches, credentialbinding, attestation, verwerking naar detectievoorstellen, dubbele ritbeoordeling en eigenaargoedgekeurde retentie blijven afzonderlijk werk.

## Atomaire operationele veiligheidsgrenzen

Centrale onveranderlijke `DETECTION_LIMITS` bevat **120 nieuwe observaties per 60 seconden**, **10.000 per UTC-dag**, **100.000 observaties totaal per appinstantie** en **200.000 requestontvangstbewijzen totaal per appinstantie**. Dit zijn conservatieve operationele veiligheidsdefaults; geen goedgekeurd bemonsterings-, bewaartermijn- of retentiebeleid. Bestaande gegevens worden niet verwijderd. De totalengrens reset niet automatisch; bij bereiken is een expliciet beheerd vervolg nodig, geen stille verwijdering of aankoop.

Alle vensters gebruiken uitsluitend server-`received_at`, niet de door de app geclaimde observatietijd. Dagvenster is [UTC-middernacht, volgende middernacht); rolling burstvenster omvat de huidige ontvangstseconde en de voorgaande 59 seconden. Een historisch offline-event verbruikt dus capaciteit op de dag van ontvangst. De serverklok moet betrouwbaar zijn; deze kern corrigeert geen systeemkloksprongen.

Quota-check en observatie-INSERT zitten in hetzelfde SQL-statement binnen de bestaande transactionele batch. Daardoor kan een concurrerende andere inname niet tussen count en insert nog een plek verbruiken. Dag-/burstqueries gebruiken de bestaande `(device_id,received_at,id)`-index. De receiptgrens is óók een voorwaarde voor de observatie-INSERT, zodat een volle receiptopslag geen raw record zonder receipt/audit nalaat. De receipt-INSERT heeft dezelfde grens als tweede bescherming. De receiptquery is begrensd op voertuig/gebruiker/instance en kan de primaire receipt-key gebruiken; COUNT blijft werk doen evenredig aan de reeds bewaarde begrensde rijen. Dit is geen performancebenchmark op remote D1.

Exact dezelfde requestId/inhoud retourneert vóór de quota-INSERT het oorspronkelijke resultaat en blijft op alle grenzen beschikbaar. Dezelfde eventId/inhoud met een nieuwe requestId voegt geen observatie/audit toe en werkt op observatiegrenzen, maar verbruikt wel een receipt en wordt bij volle receiptopslag geweigerd. Zo kan dedup niet met eindeloos nieuwe requestId's de opslaggrens omzeilen. Inhoudsconflicten blijven 409; echte quotaweigering wordt 429 na hercontrole van sessie/eigen actieve instance. Een nieuwe UTC-dag of verstreken burstperiode heropent alleen die tijdelijke limiet, niet de totale opslaglimiet.

Deze regels begrenzen **nieuwe opslag en auditmutaties per geregistreerde instance**, niet alle HTTP-verzoeken of gehele providerkosten. Bestaande retries/dedup vergen nog reads; het aanmaken van extra instanties heeft elders nog geen accountbrede quota. Een gateway-/accountbrede limiter en resourceobservability blijven nodig vóór onbetrouwbare grootschalige ingest.

## Testbewijs en grenzen

Gerichte tests gebruiken alle actuele SQLite-migraties en synthetische sessies/appinstanties: canonieke idempotency, concurrency, inhoudsconflicten, eigen/foreign/disabled instanties, ontbrekende sessie, membership-/deviceintrekking vlak vóór batch, auditrollback, ongeldige GPS/tijden/grootte/autoriteitsvelden en geen extra ritcreatie. Vier aanvullende quota-cases bewijzen de laatste vrije plek bij concurrentie, retries/dedup op burst-/daglimieten, UTC-middernacht/reset, totale observatiegrens en begrensde receiptgroei zonder orphan-data. **10/10 gerichte tests PASS**, project-TypeScript en gerichte ESLint PASS. Geen live D1-, devicecredential-, native iPhone-, achtergrond-, Bluetooth- of CarPlay-test geclaimd.

## Hoofdontwikkelaar: lokale runtime en weergave

GET/POST `/api/vehicles/:vehicleId/devices/:deviceId/detections` zijn nu voorbereid achter dezelfde geverifieerde Accessruntime. POST201 `{observation}`, GET200 `{observations}`;16KiB streamingbodylimiet, exactOrigin/CSRF/strictquery/expectedviewer/no-store/defaultdeny. Drie HTTPcases PASS naast zes servicecases.

Schemaexports, gegenereerde0009snapshot/journal en additieve SQL inclusief immutabletrigger zijn afgestemd. Lokale workerd/D1 draait alle tien migraties en bewijst ingest/retry-dedup en weigering na devicedeactivering. Geen remote migratie. De webUI kan per eigen actieve appinstantie expliciet maximaal de eerste50ruwe waarnemingen lezen; geen automatische sensoropname, volledige paging of locatiekaartclaim.

Volledige183Node-tests/type/lint/build PASS. Chromium154 UI→HTTP→SQLite: rawGPSwaarneming toont bron/tijd/ongeverifieerd, geen nieuwe rit; bestaande registerlostresponse/deactivate/revocation blijven PASS. Gesloten builtNodeAPI/MCP503 PASS. Rate-/totaalquota, retentie/consent en verwerking naar voorstellen blijven open; deze voorbereiding is geen toestemming voor externe of productie-inname.

## Verificatie quota-groep

187/187gecombineerdeNode-tests PASS; type/lint/build, lokaleD1 ingest/retry/deactivering en vier echteChromiumflows (rawdeviceview,IndexedDBherstel,historiepaging,GPSread) opnieuw PASS. BuiltAPI/MCP blijven503zonderbindings. Dit vervangt hierboven de open per-instancequotastatus; globale gateway/accountlimieten, retentie en productiemeting blijven open.
