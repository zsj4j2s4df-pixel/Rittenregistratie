# CLOUD-011 — canonieke voertuigritcoördinatie

19 oktober2026, niet live. Basis exact PR30 `677a222e3d2947510a9f9e1d736023ebf82c8118`, tree `f93782b3b07fde78f2ef458f0ab4dd01be962ba2`, beide remote ouders behouden.21Macdeltafiles bytegelijk overgenomen. MAC-CLOUD-20261019-PR27-ACK-01 PASS teruggelezen; GitHubretour bewezen, geen directe agentsturing. MacCorebuildbewijs behouden; nieuwe iOS/UserNotificationscode daarmee niet semantisch getest. Geen Mac-/productieconfiguratie gewijzigd.

## Contract en expliciete grenzen

`createJourneyService(db,resolveSession?,clock?)` vereist de bestaande werkelijk geverifieerde sessie, actieve vehiclemembership en voor writes een eigen actieve geregistreerde instance met eigen bewaarde rawobservatie. Geen bodyactor, devicecredential of CarPlaychauffeurclaim.

- `create(vehicle,{requestId,deviceId,observationId})`: bron moet start_candidate zijn. Partial unique index garandeert maximaal één review_open per voertuig. Concurrerende andere telefoon krijgt409, nooit automatische samenvoeging. Eigen replay met dezelfde requestId/inhoud krijgt oorspronkelijke ontvangstbevestiging terug.
- `join(vehicle,journey,{requestId,deviceId,observationId,expectedRevision,reason})`: expliciete keuze welke bestaande voertuigrit bij het bewijs hoort. Alleen open/actuele revisie; nieuw bewijs wordt éénmaal gekoppeld. Al gekoppeld bewijs met een nieuwe requestId groeit niet stil door. Geen prioriteits-/nabijheidsheuristiek.
- `close(...)`: zelfde mutatievelden, maar bron moet expliciet end_candidate zijn en later liggen dan het beginanker. Een disconnect, RPM0 of120s stilte sluit niet af. Een echt eindanker en nieuw startanker120slater kunnen twee aparte coördinaties opleveren; dit bewijst nog geen fysieke detectie van die ankers.
- `get(vehicle,journey)`: één transactionele D1batch voor voertuigrit+max1000bewijssamenvattingen. Geen vreemde rawGPS/payload/devicemetadata via dit overzicht. Actieve voertuigleden kunnen de gedeelde samenvatting lezen; oorspronkelijke rawservice blijft eigen-instance-scoped. `list` expliciet pagineerbaar1–100/offset0–100000, nieuwste eerst; geen onveranderlijke lijstcursorclaim.

Elke write bestaat uit geautoriseerde/gereviseerde hoofdwrite, bewijslink, canonieke requestreceipt en audit in één batch met unieke servermarker. Intrekking of deactivering vlak voor de batch blokkeert de write. Auditfout rolt alles terug. Bewijs kan niet aan twee verschillende voertuigritten worden gekoppeld; rawobservaties blijven bestaan. Status is altijd review_open of review_closed, geen goedgekeurde ritstatus. Chauffeur, afstand, tellerstanden en Zakelijk/Privé worden niet verzonnen. Er worden **geen trips/rapportregels aangemaakt**. Beoordeling/overzetten naar één definitieve rit blijft een volgende aparte groep.

Requestreceipts bevatten operatie, journey-ID en oorspronkelijke revisie, geen actuele snapshotclaim. Na succesvolle retry moet de caller het actuele overzicht opnieuw lezen. Replay na gewijzigde inhoud/operatie409; revokedaccount of inactieve broninstance krijgt geen writes/replay. Gesloten coördinatie wordt niet heropend. DBguards beschermen immutable evidence/receipts, revisiestap en oorspronkelijke scope/startanker.

## Resource- en HTTP-grenzen

Centraal JOURNEY_LIMITS:10000coördinaties/vehicle,10000requestreceipts/user+vehicle,1000bewijskoppelingen/journey. SQLgates begrenzen ook concurrenten; bestaande exacte retries blijven beschikbaar. Nieuwe mutatie op capaciteits-/stateconflict geeft409 en vraagt herladen; geen gegevens verwijderd of quota aangekocht. Geen volledige gateway/accountbrede kostenlimiet of remoteperformanceclaim.

GET/POST `/api/vehicles/:v/journeys`, GET `/.../:journey`, POST `/.../:journey/join|close`. Exactorigin, writeOrigin/CSRF, JSON16KiBstreamgrens, strictquery/velden, no-store/nosniff, geen resolverfallback; optionele expectedviewerprecondition volgt bestaande geverifieerde sessie. Aangesloten achter dezelfde gesloten Workeradapter; ontbrekendeconfig503. Read-only webreview toont maxnieuwste50 en expliciete onzekerheidslabels, laadt bewijs op verzoek en wist lijst/detail bij geweigerde reload. Geen productiepublicatie.

## Bewijs en volgende taken

13gerichte SQL/HTTPcases PASS: concurrent openwinnaar/explicietejoin; create/join/closereplay; stale/conflict;120sklantstop versusdisconnect; vreemdebron/bodyactor/sessie/revocation; rollback op create/join/close en revokevoorbatch; hergebruikbron; receiptcap/immutability. Gecombineerde210Node-tests/typecheck/volledigelint/webbuild PASS. Echte lokale workerd/D1 met alle11migraties: create/replay/coherentbewijsoverzicht/close PASS. Chromium154→HTTP→SQLite: gedeelde review/bewijssamenvatting/geen nieuwetrip/revokedreload wistdetails PASS. BuiltNode geslotenAPI/MCP503 PASS. Patrooncontrole geen treffers, geen volledige onafhankelijke securityaudit.

Nieuw ontwerp is eigen controle, geen onafhankelijke Macreview. Geen echte iPhone/Jeep/CarPlay/OBD2 of productieauth getest. Volgende: geautoriseerde idempotente classificatie met sessie-/revisiebinding en duurzame native meldingsactiequeue; daarna expliciete auditable omzetting naar één definitieve trip, centrale overlapresolutie/meeraccounts/sync en overige OPEN_WORK. Fysieke proeven blijven viaGitHubmatrix; niet opnieuw eerder hardwareonderzoek doen.
