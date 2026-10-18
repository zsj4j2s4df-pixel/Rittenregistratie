# Hervatpunt — 18 oktober 2026

Cloud leidt RitKompas; Mac doet iOS/hardware. Eigenaar behoudt merge-/kosten-/account-/productiebesluiten. GitHub is bron van waarheid, alleen zsj4j2s4df-pixel/Rittenregistratie. Alle123REQ-ID’s/21scenario’s/mastereisen behouden.

## Actuele code en PR-keten
#1audit → #2eisenregister → #3Macoverdracht → #4Cloudsmoke → #5integriteitsguards → #6demoweb/rapporten → #7serverkern → #8idempotenteinvoer → #9HTTPadapter → #10settings/Accessvoorbereiding → #11serverrapporten → #12APIruntime → #13centraleweb.
Nieuwe PR’s blijven draft/open; nooit mergen, forcepushen, bases herschrijven of rechtstreeks main bijwerken.

- #10 cloud/cloud-005-settings-storage, head4082d51: scopedsettings en AccessRS256-verificatie voorbereid,89testsPASS. Onderzoek Cloudflare/aparteagent afgerond, geen accounts/deploys.
- #11 https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/11 — cloud/cloud-005-server-reports, headef43bd7, base#10. Coherente onveranderlijke snapshots, integergeld/unknowncounts, Amsterdamdates, scoped retry/audit/CSV en grensoverschrijdende overlap.101tests/type/lint/build/D1PASS. SERVER_REPORTS.md.
- #12 https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/12 — cloud/cloud-005-api-runtime, head5873ad4, base#11. API standaard503bij ontbrekendeconfig;401zonderJWTwanneerconfigured. Dynamische Workerimport voorkomt Node500, echtebuiltAPI-smokePASS.105tests/type/lint/build/D1 en demobrowserPASS. API_RUNTIME.md.
- #13 https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/13 — cloud/cloud-005-central-web, codeheadfa7d31c23cddd6c7b826b7e960ebb54ac38b379a, base#12. /beheer met vehiclelist/privacyscope, manualtrip/0stand, kenteken/revision, vastreport/CSV en veilige reconnect.111tests/type/lint/buildPASS. CentraleChromium→HTTP→SQLite metsyntheticidentityPASS inclusief responseverlies→reconnect→retry zonderdubbel, reload, conflict409, report/CSV en mobiel/theme. Demobrowser/closedAPI/D1PASS. CENTRAL_WEB.md.

31/31bestanden van drie laatste groepen exact remote teruggelezen op codeheadfa7d31c. Deze hervat/checkpointactualisatie volgt als documentcommit op dezelfde#13branch. main opnieuw d37d8c913aaa253d6297cf57d3379d40c5795573, ongewijzigd. Werkmap was oorspronkelijk blobgeverifieerde snapshot: NOOIT lokale synthetische gitgeschiedenis pushen. GitHubcommits met echteparent/tree/expected_sha, geenforce.

## Volgende uitvoerbare lokale taak
Centrale adres-/tariefCRUD en ritcorrectie/historie boven bestaande services; daarna bestuurder/filters, correcte sync/cursors/pendingqueue, detectie-inname/deduplicatie, herstel/backups/read-onlyMCP en serverPDF. In /beheer zijn deze volledige flows nog niet gebouwd. Pendingcodes alleengeheugen: aangebodenreconnect behoudt ze, handmatig browserafsluiten/reloadtijdensonzekerewrite is nog geen herstelbareofflinequeue. Gepagineerdlijstlezen is geen coherentemulti-requestsnapshot. Geen alles-klaarclaim of algemeneaccountblokkade.

## Persoonlijke acties / externe blokkade
Eigenaar koos Cloudflareonderzoek en aparteagenttoegang; dezelfdekeuze niet opnieuw vragen. OWNER_ACTIONS.md bevat concrete koppelstappen, SEPARATE_AGENT_ACCESS.md en CLOUDFLARE_RESEARCH.md onder docs/TRANSFER bevatten onderzoek, STAGING_RUNBOOK.md de voorwaarden. Huidige connector is opnieuwbevestigd eigenaarlogin296047649; geen wisselactie beschikbaar. Aparte ingelogde accountkoppeling moet persoonlijk worden uitgevoerd via ondersteundeintegratie, geen geheimentokens inchat.
Ruleset25339571 opnieuw active, PR/deletion/nonfastforward, geenbypass,0verplichteapprovals. DriegevraagderegelsAFGEROND; identiteitsscheiding/eigenaarsreview OPEN. Geenagentmerge.
Cloudflare niet geactiveerd; geen readycredentials/bindings voorremoteaccount. Workers/D1-EU/Access slechts onderzocht. AccessFree vraagt betaalgegevens volgensofficiëleonboarding; geen aankoop/account/deployzondertoestemming. Echteproviderlogin, remoteDB/sync, WorkerCPU/quota/geografischeprivacy, logoutrevocation, nativeapp/iPhone/Jeep/CarPlay/OBD2 NIETGETEST. Rootweb blijftdemo; /beheer toont bij ontbrekendeconfiggeslotenfout, nooitvoorbeeldritten.

## Reproductie
Node24.19.0/Linux,pnpm11.25.0,bestaande frozenlockfiledependencies. node --experimental-strip-types --test tests/*.test.mjs; pnpm exec tsc --noEmit; pnpm lint; pnpm build; node --experimental-strip-types tests/d1-runtime-smoke.mjs. Builtlocalserver: tests/api-closed-smoke.mjs. Browser: tests/central-browser-smoke.mjs en tests/browser-smoke.mjs met APP_URL,geïsoleerdePLAYWRIGHT_MODULE/BROWSER_EXECUTABLE. Zie transferrapporten voor bewijsgrenzen. Geen sessies/models/instellingen gemigreerd.
