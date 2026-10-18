# CLOUD-005 — providerneutrale ritten-HTTP-adapter

18 oktober 2026, branch cloud/cloud-005-http-adapter, base cloud/cloud-005-server-create (draft-PR #8). Code: lib/trip-http.ts. Niet als publieke app-route aangesloten.

## Contract
Factory createTripHttpHandler({db,origin,resolveSession,clock}) maakt een handler per deploymentconfiguratie. Origin moet exact HTTPS zijn; HTTP alleen localhost voor lokaal testen. Iedere request krijgt opnieuw een geverifieerde serverresolver; ontbrekende resolver weigert toegang. Geen browserheaders als identiteit gebruiken. Proxyheaders en app/chatgpt-auth.ts vormen geen geverifieerde provider.

- GET /api/vehicles/{vehicleId}/trips?limit=50&offset=0
- POST /api/vehicles/{vehicleId}/trips (TripCreate, requestId voor retries)
- GET /api/vehicles/{vehicleId}/trips/{tripId}
- PATCH /api/vehicles/{vehicleId}/trips/{tripId} (TripEdit met expectedRevision)
- GET /api/vehicles/{vehicleId}/trips/{tripId}/history?limit=50

Alle responses JSON, Cache-Control:no-store en nosniff, geen CORS-permissies. Schrijven vereist exact Origin, x-csrf-protection:1, application/json en maximaal16384 daadwerkelijke bytes (ook chunked); cross-site Fetch Metadata wordt geweigerd. Onbekende velden/query's en dubbele queryparameters worden geweigerd. Geen DELETE. Bound SQL/objectrechten blijven in één gedeelde serverkern; geen tweede businesslogica voor web/iOS.

200 lezen/correctie;201aanmaak/herhaling;400ongeldige invoer;401geen sessie;403geen toegang/herkomst;404ontbrekende rit;409revision/idempotentieconflict;413te groot;415geen JSON. Interne provider-/databasefouten geven generieke500, zonder SQL/adres/geheimen. Een create-receipt is de oorspronkelijke aanmaakresponse, niet de actuele revision.

## Bewijs
71/71 Node-tests PASS, inclusief6HTTP-cases met echte SQLite-service: header-spoofing, perrequestresolver, objectscope, paginering, CSRF, inhoudstype, ongeldige JSON/UTF8, bytegrens/chunked, unknownfields, create/retry/correctie/conflict/audit, veilige fouten en originconfig. Typecheck/lint/build PASS. Lokale workerd/D1-smoke PASS inclusief HTTP-read/write en ingetrokken toegang. Eén gerichte onafhankelijke boundary-review vond geen concrete fout; geen productieauth-audit.

## Integratievoorwaarden / open
Adapter is klaar voor providerintegratie, maar geen bewijs van werkende login, productieopslag of sync. Nodig vóór publiek aansluiten: eigenaarbesluit over hosting/identiteit, echte token-/sessieverificatie inclusief intrekking/verval/audience/issuer, veilige cookies, netwerkrequest-timeouts/rate-limits, HTTPS/securityheaders, bootstrap van drie gebruikers/voertuigleden, migratie/back-up/herstel, end-to-end auth en mobiele clienttests. Geen nieuwe externe koppeling, deployment of main-merge uitgevoerd.

Volgende lokale groep: instellingen/tarieven/rapportopslag met voertuigscope en audit; account-/providerintegratie zodra eigenaar besluit. Alle mastereisen blijven open waar niet volledig bewezen.
