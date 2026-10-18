# CLOUD-005 — geteste serverkern, nog niet publiek aangesloten

18 oktober 2026. Branch cloud/cloud-005-server-core, base cloud/cloud-005-reporting (draft-PR #6).

## Resultaat
lib/trip-service.ts biedt voertuiggebonden lijst/detail/geschiedenis en ritcorrecties. Zonder geverifieerde SessionResolver weigert de service toegang; er is geen publieke API-route geactiveerd. De resolver moet een echte serververificatie implementeren. Browserheaders of een opgegeven actor zijn geen identiteit. De ongebruikte app/chatgpt-auth.ts-helper is hiervoor niet geschikt en wordt nergens aangesloten.

Actieve vehicle_memberships en niet-geblokkeerde gebruikers worden zowel vóór als in de schrijfactie gecontroleerd. Bestuurdertoewijzing vereist dezelfde actieve voertuigtoegang. SQL gebruikt gebonden waarden, pagination heeft grenzen. Een stale revision geeft 409; een unieke servermutatiemarkering koppelt precies één auditrecord aan één geslaagde correctie. Actor, tijd, oude/nieuwe waarde en reden komen in de audit. D1 batch slaat correctie/audit transactioneel op. Afstandscorrecties worden manual; eerste afstand/bron blijft apart bewaard. Een classificatiecorrectie maakt GPS niet handmatig. Tellerstand 0 blijft geldig.

Migraties 0002–0004 zijn additief: memberships, disabled, revision/mutation, tellerstanden, herkomst en databaseguards. Geen DROP/rebuild, geen records of routes verwijderd, oorspronkelijke migratie behouden. Nieuwe membershiptabel is leeg en geeft niemand toegang. Bootstrap volgt pas na accountkeuze. Geen live database gemigreerd.

## Bewijs
- 61/61 Node-tests PASS op Node 24.19.0/Linux x86_64; 11 servicetests gebruiken echte SQLite-queries en transacties, synthetische gegevens.
- TypeScript --noEmit, ESLint en Vinext-build PASS op bestaande frozen-lockfile-dependencies (pnpm 11.25.0).
- tests/d1-runtime-smoke.mjs PASS met bestaande Miniflare/workerd/D1-binding, zonder account of remote service: alle migraties, fail-closed session, correctie/audit, afstandsherkomst, revisionconflict, echte batch-rollback bij auditfout en ingetrokken toegang.
- Twee afzonderlijke gerichte codelezingen vonden dezelfde GPS-herkomstfout; hersteld, regressietest toegevoegd, één reviewer bevestigde de fix en 11/11 servicetests. Dit zijn scoped reviews van deze kern, geen twee afgeronde productiebeveiligingsaudits.
- Bron voor D1-transactiecontract: https://developers.cloudflare.com/d1/worker-api/d1-database/ (gelezen 18 oktober 2026). Lokale runtime bewijst geen productieconfiguratie.

Reproductie: node --experimental-strip-types --test tests/*.test.mjs; node --experimental-strip-types tests/d1-runtime-smoke.mjs; pnpm exec tsc --noEmit; pnpm lint; pnpm build.

## Open en volgende veilige taak
Technisch nog te bouwen: server-side ritinvoer met retry-idempotentie, accounts/geverifieerde sessions, HTTP/CSRF/adapters, centrale instellingen/tarieven/rapporten, UI-opslag/sync, detectie-inname/deduplicatie, exportautorisatie, back-up/herstel en read-only MCP. Ook zonder providerbesluit zijn domein-, SQL- en contracttests hiervan uitvoerbaar. Providerkeuze blokkeert dus niet alle programmeerwerk.

NIET GETEST: echte gebruikerslogin, productie-D1, centrale sync, live migratie/back-up, native iOS en echte iPhone/Jeep/CarPlay/OBD2. Web blijft demosessiestate. Geen fiscale goedkeuring, geen productiepublicatie en geen merge. Persoonlijke keuzes: OWNER_ACTIONS.md.
