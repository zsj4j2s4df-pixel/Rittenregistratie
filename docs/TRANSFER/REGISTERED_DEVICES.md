# Eigen geregistreerde app-instanties — servervoorbereiding

19 oktober 2026. Alleen servercore, additieve SQL/schema en lokale tests. Geen HTTP/clientkoppeling, detectie-inname, accountbootstrap, secret, nieuwe externe koppeling, configuratie of productiehandeling in deze groep.

## Identiteit en contract

Een `device.id` is een door de app gekozen instanceclaim, geen hardware-ID, toestelattestatie, sessiecredential, bewijs van GPS of bevestiging van de bestuurder. Iedere serviceaanroep vereist onafhankelijk een geverifieerde sessie en actieve voertuigmembership. De server koppelt de registratie uitsluitend aan de interne actor; een `userId` of ander onbekend invoerveld wordt geweigerd.

Factory: `createDeviceService(db, resolveSession?, clock?)`. Zonder resolver wordt toegang geweigerd.

- `list(vehicleId, limit = 50, offset = 0)`: alleen eigen instanties voor dit voertuig, inclusief gedeactiveerde records. `limit` 1..100, offset 0..100000, beide veilige gehele getallen. Geen metadata van medegebruikers.
- `register(vehicleId, {requestId, id, name, platform})`: id/requestId bestaan uit 16..128 ASCII letters/cijfers/underscore/koppelteken. Naam verplicht, maximaal 100 tekens, getrimd. Platform uitsluitend `ios` of `web`. Retourneert `{id,user_id,vehicle_id,name,platform,active,revision,created_at,updated_at}`; tijden zijn Unix-seconden en `active` is 0/1.
- `deactivate(vehicleId, id, {expectedRevision, reason})`: verplichte niet-lege reden maximaal 500 tekens en positieve of nul veilige bestaande revisie, kleiner dan MAX_SAFE_INTEGER. Zet alleen `active` van 1 naar 0, verhoogt revisie, bewaart before/after plus reden en actor in audit. Geen harddelete of reactivering beschikbaar.

De instance-ID is globaal gereserveerd. Een reeds gebruikte ID wordt niet hernoemd, overgenomen of aan een ander voertuig/account toegewezen. Voor een andere registratie is een nieuwe instanceclaim nodig; multi-vehicle gebruik met dezelfde claim is hiermee niet geïmplementeerd. Een andere gebruiker krijgt bij een geraden ID geen bestaande naam/platform/eigenaar terug: registratie geeft een generieke 409, deactivering een generieke 404. Gedeactiveerde IDs blijven gereserveerd.

## Receipts, concurrency en autorisatie

`device_register_requests` bewaart een canonieke aanvraag en oorspronkelijke response, uniek voor `(vehicle_id,user_id,request_id)`. Gelijke retries na responseverlies leveren dezelfde registratie op zonder extra device/audit. Dezelfde herhaalcode met andere gegevens geeft 409; dezelfde instance-ID met een nieuwe herhaalcode geeft eveneens 409. De naam wordt vóór vergelijking getrimd.

**Gedeactiveerde replay:** een eerdere registerreceipt wordt vóór teruggeven aan de actuele eigen device gekoppeld. Als deze gedeactiveerd is, volgt 409; de oude actieve response wordt niet teruggegeven en er wordt nooit gereactiveerd. De oorspronkelijke receipt blijft behouden.

Register voert device-insert, receipt en audit uit in één D1-batch. De device-insert herhaalt actieve membership en weigert een bestaande receipt. Receipt/audit zijn alleen toegestaan bij de unieke marker van deze werkelijk geslaagde insert. Bij een ID-conflict wordt niets overgenomen of stil gewijzigd; zonder eigen geslaagde receipt volgt de generieke conflictrespons. Deactivate bewaakt owner, voertuig, actieve toestand en verwachte revisie in de write zelf; de audit hangt aan dezelfde nieuwe marker. Batchfouten rollen de gehele transactie terug.

Actieve gebruiker/voertuigtoegang wordt herhaald in iedere leesquery en in de mutatie. Sessieverval wordt vóór en na writes gecontroleerd. Als een response door sessieverval na commit niet wordt teruggegeven, blijft de registerreceipt beschikbaar voor een nieuw geverifieerd verzoek. Twee concurrente deactiveringen hebben één winnaar; een stale versie schrijft geen extra audit. Audit-actor komt uitsluitend van de serverprincipal.

## Operationele registratie- en receiptgrenzen

Centrale onveranderlijke `DEVICE_LIMITS` stelt maximaal **100 registraties totaal per geverifieerde gebruiker + voertuig** en **100 registratieontvangstbewijzen per dezelfde scope** in. Dit zijn operationele veiligheidsdefaults; geen goedgekeurd retentiebeleid, capaciteitstoezegging of reden om automatisch gegevens te verwijderen. Gedeactiveerde registraties tellen mee en blijven gereserveerd. Deactiveren maakt geen nieuwe plek vrij; er is geen reactivering of deletepad toegevoegd.

Beide COUNT-grenzen zitten in het device-INSERT-statement binnen de bestaande transactionele batch. Twee concurrente aanvragen voor de laatste vrije plek hebben daardoor maximaal één winnaar. Receipt en audit worden alleen via de marker van die geslaagde insert gemaakt; een volle receiptgrens laat geen orphan device of extra audit achter. Queries zijn gescopeerd op voertuig/gebruiker en kunnen de bestaande owner/vehicle-index en receipt-primary-key gebruiken. Dit lokale SQL-bewijs is geen remote D1-performancebenchmark.

Exacte originele retries blijven op de cap beschikbaar via de bestaande canonieke receipt. Dezelfde bestaande device-ID met een nieuwe requestId blijft generiek conflict (409), verbruikt geen extra receipt en omzeilt de cap niet. Een oude receipt voor een gedeactiveerde instantie blijft weigeren; die kan het toestel niet opnieuw activeren. Nieuwe registraties boven de grens geven 429. Na een mislukte batch worden rechten en counts gecontroleerd, terwijl ID-conflicten generiek blijven: geen vreemde naam, platform of eigenaar wordt vrijgegeven. Inhouds-/ID-conflicten blijven 409 in plaats van een quotarespons te maskeren als geslaagde registratie.

De twee caps begrenzen de opslag- en registerauditgroei **per gebruiker per voertuig**. Ze begrenzen geen onbeperkte geauthenticeerde retryreads, verkeer vóór authenticatie, alle gebruikers/voertuigen gezamenlijk of gehele providerkosten. Accounts/nieuwe voertuigen hebben nog afzonderlijke globale limieten en gatewaybescherming nodig. Er zijn geen betaald product, schemawijziging, databaseopschoning of externe mutatie voor deze bescherming uitgevoerd.

## Migratie en schema

`drizzle/0008_registered_devices.sql` voegt uitsluitend `registered_devices`, een owner/vehicle-index en `device_register_requests` toe. Foreign keys verwijzen naar bestaande users/vehicles/devices; platform, actieve toestand en revisiebereik krijgen SQL-CHECKs. Er worden geen bestaande records toegewezen, veranderd of verwijderd. `db/schema.ts` bevat de twee additieve tabeldefinities.

De gedeelde SQLite-testfixture ontdekt `.sql`-migraties automatisch en neemt 0008 mee. Deze taak wijzigt bewust geen Drizzle-journal/snapshot of bestaande migratie-/publicatiescripts, omdat alleen SQL/schema plus de nieuwe service/test/doc waren toegewezen. De hoofdontwikkelaar moet metadata en het bestaande migratiepad vóór een eventuele publicatie op elkaar afstemmen. Geen database is extern gemigreerd.

## Verificatie en grenzen

Veertien tests in `tests/device-service.test.mjs` gebruiken echte lokale SQL via de gedeelde D1-adapter: canonieke retries en actor, concurrerende gelijke en botsende requests, eigen scope/foreign-ID-guessing, bodyactorinjectie, sessie/disabled/revocation, geauditeerde deactivering en disabled replay, stale revisie, auditrollback bij beide writes, membershipintrekking vlak vóór de batch, inputgrenzen, receiptfailure en sessieverval na commit met veilige receiptretry. Drie aanvullende tests bewijzen de concurrente laatste quotaplek, exacte retries zonder nieuwe receipt, behoud van disabled capaciteit, geweigerde reactivering en de afzonderlijke receiptcap zonder orphan/auditgroei. **14/14 servicecases PASS**, TypeScript en gerichte ESLint PASS.

Gerichte tests, TypeScript `--noEmit` en gerichte ESLint slagen. Dit is geen live D1-/provider-, browser-, iPhone-, hardware- of GPS-test. Toestelbeheer op de client, authenticatie van toekomstige detectieaanlevering, attestation, native lifecycle en eventuele bewaartermijnen moeten apart worden ontworpen. De registratie alleen verleent geen detectie-innamebevoegdheid.

## Hoofdontwikkelaar: montage en bewijs

HTTP GET/POST eigen devices en PATCH deactiveren zijn nu aangesloten achter de bestaande geverifieerde Accessruntime. /beheer toont uitsluitend expliciet geladen eigen registraties; registratie voor deze webapp is handmatig, herhaalt na responseverlies met dezelfde aanvraag en schakelt geen detectie in. Reden/revisie verplicht bij deactiveren. Viewerprecondition weigert accountwissel bij writes. Opnieuw laden na revocation wist de lijst. Geen browseropslag of credential/device-attestatieclaim; herstel beperkt tot huidig tabblad.

Drizzlemetadata is door root uit schema gegenereerd in een verse geïsoleerde outputdirectory vanaf snapshots0000–0007.0008_snapshot/journal en SQL staan nu in lijn, inclusief platform/active/revision-CHECKs. Een eerste tijdelijke generatie met een achtergebleven snapshot maakte onterecht rebuildSQL; dit faalde lokaal, is vóór GitHubpublicatie vervangen door additieve CREATEs, waarna17device-service/HTTPcases opnieuw PASS. Geen externe migratie.

Chromium154 echte UI→HTTP→SQLite: verloren gecommitteerde registratieresponse, exacte retry zonder tweede device/audit, deactivering met reden en revoked reload zonder oude lijst PASS. Type/lint/build PASS; gecombineerde180Node-tests omvatten zes aparte detectiecases. Native/iPhone, liveAccess en fysieke toestellen NIETGETEST.
