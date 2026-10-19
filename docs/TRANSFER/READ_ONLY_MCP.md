# Alleen-lezen MCP-kern — lokaal contractbewijs

19 oktober 2026. Nieuwe factory: `createReadOnlyMcpHandler({ db, origin, resolveSession, clock? })` uit `lib/mcp-http.ts`; retourneert `(request: Request) => Promise<Response>`. De hoofdtaak kan deze later op één vast endpoint mounten. Dit werk wijzigt geen runtimebinding, account, OAuth-configuratie, bestaande REST-handler of deployment. Geen echte MCP-client of externe connector getest.

## Gekozen protocol en officiële bronnen

Voor implementatie daadwerkelijk gelezen op 19 oktober 2026:

- MCP **2025-06-18**, Streamable HTTP: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports — gelezen Markdown via https://modelcontextprotocol.io/specification/2025-06-18/basic/transports.md
- Lifecycle/version negotiation: https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle — https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle.md
- Tool discovery/calls/results: https://modelcontextprotocol.io/specification/2025-06-18/server/tools — https://modelcontextprotocol.io/specification/2025-06-18/server/tools.md

Dit is een bewust vastgezette ondersteunde versie, geen claim dat dit de nieuwste protocolversie is. De server antwoordt bij initialize met zijn ondersteunde versie; een client die deze niet ondersteunt moet stoppen. Latere requests moeten exact `MCP-Protocol-Version: 2025-06-18` meesturen. Geen downgrade naar de door de specificatie genoemde 2025-03-26-fallback geïmplementeerd; ontbrekende/afwijkende versie wordt afgewezen.

Stateless JSON-responsevorm van Streamable HTTP: POST met één JSON-RPC 2.0-message, `Content-Type: application/json` en Accept met zowel `application/json` als `text/event-stream`. Ondersteunt `initialize`, `ping`, `tools/list`, `tools/call`; notifications worden zonder effecten aangenomen met lege HTTP 202. Onbekende requestmethodes geven JSON-RPC method-not-found. Batches, inkomende responses, SSE, server-initiated requests, streaming, resumability en sessie-ID's zijn niet geïmplementeerd. GET/DELETE geven 405. Er worden geen protocolsessies of lifecycle-state in globale variabelen opgeslagen; clients moeten zelf initialize → initialized → operations volgen. Een toolaanroep kan nooit door een eerdere initialize autorisatie verkrijgen.

## Vaste toolset

Elke tool publiceert een object-inputschema met `additionalProperties: false`, vaste velden en alleen-lezen annotations. Deze annotations zijn metadata; daadwerkelijk uitsluitend bestaande leesfuncties worden aangeroepen.

| Tool | Parameters | Bestaande service |
| --- | --- | --- |
| `accessible_vehicles` | optioneel limit 1–100, offset 0–100000 | listAccessibleVehicles |
| `vehicle_snapshot` | vehicleId | createSyncService.snapshot |
| `trip_history` | vehicleId, tripId, optioneel limit 1–100 en before | createTripService.history |
| `settings_history` | vehicleId, optioneel limit 1–100 en before | createSettingsService.history |
| `saved_report` | vehicleId, reportId | createReportService.get |
| `route_points` | vehicleId, tripId; limit 1–500, after/through veilige niet-negatieve integers optioneel | createRouteService.points |

Routepaging behoudt de bestaande `through`-highwater en `nextAfter`-cursor. Standaardlimieten komen uit de services. Snapshot heeft de bestaande 5000-ritten/1000-bestuurders/1000-rapportlimiet en weigert overschrijding in plaats van stilzwijgend af te kappen. Geen totaal- of volledigheidsclaim voor begrensde geschiedenis; oudere historie is opvraagbaar met optioneel positief veilig `before`-audit-ID. Rapporttools lezen alleen een opgeslagen snapshot en maken niets aan. Geen SQL-tool, willekeurige URL, shell, schrijf-, import-, delete-, restore- of accountfunctie aanwezig.

## Grenzen en beveiliging

- `resolveSession(request)` moet door de mountende serveradapter een **werkelijk geverifieerde** identiteit leveren, bijvoorbeeld via een passend gecontroleerde provider. De kern leidt nooit identiteit af uit body, e-mailheader, toolparameters of clientInfo. Geen resolver = 401. Iedere HTTP-request en serviceaanroep verifieert opnieuw; eerdere succesvolle aanvragen geven geen blijvende toegang. Actieve databasegebruiker wordt ook bij discovery/ping/notifications gecontroleerd. Bestaande services handhaven voertuig-/objectmembership en relevante revoke-/concurrencygrenzen.
- Request-URL-origin moet gelijk zijn aan de geconfigureerde exacte HTTPS-origin; HTTP mag alleen voor localhost, 127.0.0.1 of ::1. Aanwezige Host en Origin moeten exact overeenkomen; cross-site fetch wordt geweigerd. Native clients mogen Origin weglaten. De server moet bij een lokale mount daadwerkelijk alleen op loopback luisteren; de factory kan de luisterinterface niet instellen. Vertrouw geen onbetrouwbare proxy die request-URL/Host herschrijft.
- Geen wildcard CORS of permissieve preflight. Alle antwoorden gebruiken `Cache-Control: no-store`, `X-Content-Type-Options: nosniff` en Vary voor Origin/Authorization/Cookie.
- Body maximaal 16 KiB op Content-Length én daadwerkelijk ingelezen bytes; UTF-8 is strikt, JSON/RPC/argumenten worden gecontroleerd. Identifiers zijn begrensd op 128 tekens; onbekende argumentvelden worden geweigerd. Resultaatpayload maximaal 4 MiB; grenzen omvatten geen onbeperkt streamen. De onderliggende service kan nog wel werk doen vóór resultaatlimietcontrole.
- Servicefouten worden als `isError: true` toolresultaat weergegeven; ontbrekende/verlopen sessies geven 401. Onbekende tools/argumenten geven JSON-RPC invalid-params. Onverwachte interne fouten onthullen geen SQL of stacktrace.
- Geretourneerde ritdoelen, adressen en historie zijn gebruikersinhoud: de consumer moet die als gegevens behandelen, nooit als instructies. Privacy vereist bewuste toestemming voor iedere externe client; geen locatiegegevens naar een AI-provider verstuurd in deze taak.

**Niet gereed voor externe MCP-publicatie:** geen OAuth authorization-server/resource metadata, bearer-resourcevalidatie, consent, PKCE, clientregistratie of tokenrevocation geïntegreerd; ook geen rate-limiter/abusequota. De factory is een lokaal servercontract achter een geverifieerde sessieadapter, geen bewijs dat browsercookies/Access-login door een remote MCP-client worden ondersteund. Een toekomstige OAuth-adapter mag geen ongecontroleerde identityheaders accepteren of tokens naar andere resources doorgeven. Werkelijke clientcompatibiliteit, protocolconformance-suite, TLS/proxy-gedrag, OAuth-fouten/challenges en live quota moeten vóór een externe koppeling apart worden gebouwd en getest. Geen koppeling geactiveerd.

## Testbewijs

`node --experimental-strip-types --test tests/mcp-http.test.mjs`: **6/6 PASS** met huidige echte SQLite-migraties en synthetische sessies: initialize/discovery/ping/notification; alle zes leesfuncties en geen extra auditmutatie; ontbrekende/verlopen/ingetrokken identiteit; objectscope/spoofing; JSON/RPC/argument-/bodygrenzen en onbekende schrijftool; Origin/Host/version/Accept-afwijzingen. Project-TypeScript en gerichte ESLint PASS. Geen deployed D1-, OAuth- of echte MCP-clienttest geclaimd.

## Gesloten runtimeadapter

`/api/mcp` is voorbereid achter dezelfde cryptografisch geverifieerde Cloudflare Access-resolver als de app-API. DB, exacte APP_ORIGIN, ACCESS_ISSUER en ACCESS_AUDIENCE zijn alle verplicht; ontbrekende/ongeldige configuratie geeft503/no-store zonder configuratielek. Nodepreview blijft gesloten zonder Workerbindings. Spoofheaders of ongeldigJWT leveren401 vóór databasegebruik. Geen fallback-identiteit, externe clientactivatie of productiepublicatie. Drie aanvullende runtimetests PASS naast zes kerntests. Historietools accepteren nu ook de bestaande before-keysetcursor.

Aanvullend: volledige lokale suite168/168 PASS (inclusief elf nog afzonderlijk te publiceren apparaatcases), tsc/lint/build PASS, lokaleD1smoke PASS en builtNode `/api/mcp`503/no-store PASS. Runtime Node24.19/Chromium154; geen productie-/OAuthclaim.
