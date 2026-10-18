# Backend- en opslagontwerp — lokale voorbereiding

17 oktober 2026. Status: ontwerp en geteste beleidsfuncties, **geen aangesloten backend of productiebeveiliging**. Hosting/providerkeuze blijft open. Geen nieuwe dienst nodig om dit ontwerp en de tests uit te werken.

## Vertrouwensgrens

Browser/native client → sessieverificatie op server → voertuigautorisatie → invoervalidatie → databasetransactie → antwoord. Een body/header met gebruikersnaam of user-ID is nooit bewijs van identiteit. De bestaande ongebruikte ChatGPT-headerhelper mag alleen achter een aantoonbaar vertrouwde identiteitsgateway worden ingezet; rechtstreeks vertrouwen blijft verboden.

`lib/access-policy.ts` is de gedeelde beleidskern: actieve sessie, niet-geblokkeerde gebruiker, actieve koppeling met het gevraagde voertuig en expliciet bekende actie vereist. Dennis/Ingrid/Jesse krijgen dezelfde admin_driver-rechten; hun prioriteit geeft geen extra datatoegang. Een beleidstest is geen bewijs dat een endpoint het beleid toepast: er zijn nog geen gekoppelde endpoints.

## Transactiecontract voor ritcorrectie

1. Identiteit en sessieverval server-side controleren, daarna actieve voertuigkoppeling uit database lezen.
2. Rit via combinatie voertuig-ID + rit-ID ophalen; nooit alleen een door de client geleverd rit-ID vertrouwen.
3. Bekende wijzigingsvelden expliciet selecteren. Server beheert auteur, tijd, provenance, voertuig-ID en revisie.
4. Valideren op kalenderdatum, begin/eindmoment, eindige positieve afstand, tellerstanden en classificatie. Productiemomenten worden UTC met oorspronkelijke tijdzone; de demo-editor ondersteunt nog geen rit over middernacht en is geen tijdzonemodel.
5. Verwachte revisie atomair vergelijken. Wijziging en auditregel met oude/nieuwe waarde in dezelfde transactie schrijven; auditfout betekent rollback. Conflict geeft geen stille overwrite.
6. Na commit de canonieke rit en nieuwe revisie teruggeven. Herhaalde mobiele requests gebruiken een per apparaat/actie unieke idempotentiesleutel plus payloadhash. Een afwijkende payload onder dezelfde sleutel geeft conflict.

De lokale demoReducer bewijst alleen veldcontroles, before/after-geschiedenis en afwijzing van verouderde revisies in één browsersessie. Het is geen servertransactie, durable auditlog of tamper-proof opslag.

## Aanvulling gegevensmodel vóór echte opslag

- vehicle_memberships: gebruiker, voertuig, actieve status en rol; unieke combinatie.
- devices/detections: geregistreerd apparaat, voertuig, idempotentiesleutel, bronmomenten en onzekerheid; unieke sleutels voor herhaalde verzending.
- trips: revision, begin-/eindtellerstand, bron van afstand, bevestigingsstatus bestuurder, onbekende routebron toegestaan. Geen standaard `recorded` zonder GPS-bewijs.
- route_points: coördinaatbereik, tijdsvolgorde en nauwkeurigheid valideren; interpolaties expliciet onderscheiden.
- audit_logs: auteur uit sessie, servermoment, wijzigingsreden en before/after; append-only via service, retentiebeleid nog bepalen.
- mileage_rates/report_versions: exact decimaal geld/afstanden of vaste eenheden; bron, periode en tariefsnapshot per definitief rapport. Geen ongemerkte herberekening van historie.

Bestaande migratie is niet uitgevoerd of destructief veranderd. Nieuwe migratie pas toevoegen na uitgewerkt schema, lokale migratie-/rollbacktests en controle op historische gegevens. Back-up/hersteltest vóór echte gebruiksgegevens.

## Detecties en privé-eerst

Tijdoverlap signaleert mogelijke dubbele detectie; geen automatische samenvoeging zonder route/apparaatbewijs. `assessCandidateOverlap` wist niets en bepaalt bestuurder alleen als beide detecties dezelfde bevestigde bestuurder hebben. Conflicten blijven onbekend. Prioriteit is uitsluitend kandidaatselectie, geen bewijs. Adresmatches blijven voorstellen. Geen van deze regels maakt een rit vanzelf zakelijk.

## Nog te bewijzen vóór aansluiten

Provider/sessieverificatie, spoofing-/CSRF-/cross-vehicle-tests, atomaire mutatie en auditrollback, idempotentie onder gelijktijdigheid, versleuteld transport, logredactie, back-up/herstel, verwijdering/bewaarbeleid en autorisatie van iedere export. Database/hosting/accountkoppeling vraagt expliciete toestemming; er is nog geen provider geselecteerd. Onafhankelijke review blijft gewenst; huidige review is eigen controle volgens gebruikersfallback.
