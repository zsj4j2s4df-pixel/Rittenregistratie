# Cloudflare — gericht vervolgonderzoek

Geraadpleegd: **18 oktober 2026, Europe/Amsterdam**. Dit document vult `docs/ASTRA_AUDIT/FEASIBILITY_RESEARCH.md` (S17/S18) gericht aan; het herhaalt geen iOS-, MCP- of fiscale audit. Officiële openbare bronnen zijn daadwerkelijk gelezen via HTTPS met `Accept: text/markdown`. Geen Cloudflare-dashboard, account, token, database, abonnement of deployment aangemaakt/geactiveerd; geen productiegegevens gebruikt.

## Besluitstatus en voorstel

De eigenaar heeft **Cloudflare onderzoeken** en **aparte agenttoegang** gevraagd. Dat autoriseert dit onderzoek en voorbereiding; het bewijst geen bestaand Cloudflare-account, provideractivatie, betaaltoestemming of productiepublicatie. Voorstel: behoud de bestaande Vinext/Workers-route, bereid een geïsoleerde synthetische stagingomgeving met D1-EU voor en gebruik Access als mogelijke web-login. Activeer pas na een concrete keuze en eigenaarstoestemming voor de benodigde account/koppeling/publicatie. Workers Free is een onderzoeksmogelijkheid, geen garantie dat SSR plus tokenvalidatie binnen 10 ms CPU past.

## Kosten en limieten

Bedragen hieronder zijn gepubliceerde USD-prijzen, geen offerte inclusief eventuele belasting/wisselkoers. Workers Paid, D1 en Zero Trust hebben verschillende quota; een bestaand Cloudflare-domeinplan dekt Workers Paid niet automatisch.

| Onderdeel | Free | Paid en praktische consequentie | Bron |
| --- | --- | --- | --- |
| Workers dynamische requests | 100.000 per dag | Workers Standard minimaal $5/account/maand; 10 miljoen requests/maand inbegrepen, daarna $0,30/miljoen | CF01 |
| Workers CPU | 10 ms CPU per invocation | 30 miljoen CPU-ms/maand inbegrepen, daarna $0,02/miljoen; HTTP standaard 30 s CPU, instelbaar tot 5 min | CF01/CF02 |
| Workers geheugen | 128 MB | Ook 128 MB; SSR, grote exports en payloads begrenzen/pagineren | CF02 |
| D1 gelezen rijen | 5 miljoen/dag | 25 miljard/maand inbegrepen; daarna $0,001/miljoen | CF03 |
| D1 geschreven rijen | 100.000/dag | 50 miljoen/maand inbegrepen; daarna $1/miljoen | CF03 |
| D1 opslag | **500 MB per database**, 5 GB accounttotaal, maximaal 10 databases | 10 GB per database, 5 GB opslag inbegrepen, daarna $0,75/GB-maand; accountlimiet standaard 1 TB | CF03/CF04 |
| D1 herstelhistorie | 7 dagen | 30 dagen; geen extra Time Travel-herstelkosten | CF04/CF06 |
| Access | $0, 50-gebruikerslimiet volgens producttabel | Productpagina noemt $7/gebruiker/maand bij jaarlijkse betaling; voor drie gebruikers is betaald niet op grond van aantallen nodig | CF08 |

Workers statische assets zijn volgens de prijspagina gratis/onbeperkt; als requests via Worker-caching worden afgehandeld gelden de daar beschreven requestkosten. CPU telt JavaScript-uitvoering, niet wachten op database/netwerk. De Workers-limietenpagina noemt dat authenticatie/SSR vaak 10–20 ms kost: meet de eigen samengestelde request op de doelruntime vóór een Free-keuze. Geen betaalde upgrade om een fout te verhelpen zonder toestemming.

D1 rekent gescande rijen, niet alleen teruggegeven resultaten. Indexonderhoud schrijft extra rijen; GPS-punten, auditregels en indexen horen dus in de volumeproef. Free-quota overschrijden geeft fouten en geen stilzwijgende betaalde capaciteit. Dagquota resetten om 00:00 UTC. Paid-overgebruik wordt wel gefactureerd; een CPU-limiet is geen volledige maandelijkse budgetgarantie. D1 en Workers noemen geen egresskosten voor deze diensten. Optionele andere producten/observability kunnen afzonderlijke tarieven hebben; niet automatisch inschakelen.

Aanvullende D1-grenzen: 100 gebonden parameters/query, 100 KB SQL, 2 MB per string/BLOB/rij, 30 s queryduur (ook gehele batch), 50 queries per Workers Free-invocation en 1.000 Paid. Een database verwerkt queries sequentieel; batches, indexen, kleine payloads en paginering blijven nodig, ook voor drie gebruikers. De huidige servicecorrectie met twee batchstatements ligt qua aantal onder deze grenzen; dat is geen remote performancebewijs.

## Datalocatie en privacy

CF05 onderscheidt **locatiehint** en **jurisdictie**. `weur` is alleen een voorkeur en garandeert geen EU-opslag. D1 ondersteunt `jurisdiction=eu`, te kiezen **bij creatie**; die jurisdictie kan achteraf niet worden toegevoegd of gewijzigd. Met jurisdictie blijven ook eventuele read replicas binnen die jurisdictie. Zonder expliciete keuze kan de creatielocatie van een Cloud-VM invloed hebben op de primaire locatie; niet blind automatisch aanmaken.

De jurisdictie beperkt waar de database draait en persisteert. Workers mogen die database nog van overal benaderen; dit is **geen bewijs dat alle requestverwerking, Access-identiteitsgegevens, logs, back-ups buiten D1 of andere diensten uitsluitend in de EU blijven**. Cloudflare verwijst voor responsverwerking naar Regional Services; beschikbaarheid, prijs en contractvoorwaarden daarvan zijn hier niet vastgesteld. DPA, privacyinformatie, retentie, GPS-toestemming en daadwerkelijke accountinstellingen blijven vóór echte gebruikersgegevens te toetsen. Schrijf geen GPS, sessietokens of volledige persoonsgegevens naar requestlogs.

## Back-up, herstel en behoud van audit

Time Travel is automatisch actief voor databases op D1's production storage backend; legacy alpha gebruikt een ander mechanisme. De limietenpagina CF04 specificeert 7 dagen Free/30 Paid, ook al begint het algemene Time Travel-overzicht met “30 days”. Bookmarks verwijzen naar herstelpunten; historie en herstel kosten volgens CF06 niet extra. Maximaal 10 restores per 10 minuten per database.

**Restore overschrijft de bestaande database en annuleert lopende queries/transacties.** Daarom niet zelfstandig als productiereparatie uitvoeren. Bewaar het voorafgaande bookmark en een gecontroleerde export; gebruik voor oefeningen uitsluitend synthetische staginggegevens. Een bookmark is geen downloadbare, onafhankelijke langetermijnback-up. Time Travel kan ook de auditlog terugdraaien; externe herstelregistratie is nodig als ooit productieherstel wordt toegestaan.

CF07 ondersteunt SQL-export met `wrangler d1 export ... --remote --output=...` en import met `d1 execute --file=...`. Een actieve export blokkeert andere databaseverzoeken; export van databases met virtual tables wordt niet ondersteund. Het huidige schema gebruikt geen virtual tables; toekomstig FTS toevoegen vraagt dus een herzien back-upplan. Verwijder geen tabellen voor een back-up. Bewaar echte exports versleuteld buiten Git en test een import in een aparte database op rijaantallen, relaties, triggers, schema-/migratieversies en audit-/provenancevelden. Geen export/import/restore daadwerkelijk uitgevoerd in dit onderzoek.

## Login voor Dennis, Ingrid en Jesse

Access kan een webapp afschermen met een expliciete allowlist van de drie echte e-mailadressen. CF09 ondersteunt een per e-mail verzonden one-time PIN (10 minuten geldig); gebruikers hebben daarvoor geen eigen Cloudflare-beheeraccount nodig. **OTP wordt bij nieuwe Zero Trust-organisaties niet meer automatisch toegevoegd**: Cloudflare IdP is de standaard; OTP moet expliciet worden ingesteld. Alleen mailbezit bewijzen is geen passkey/MFA-implementatie; gewenste passkeys, herstel, uitloggen en native iPhone-login blijven aparte integratie-/testpunten.

Belangrijke eigenaaractie: de actuele officiële Zero Trust-startpagina CF10 vraagt een abonnementkeuze en **betaalgegevens óók voor Free**, met vermelding dat Free niet wordt belast. Daarom niet beloven dat deze route zonder betaalgegevens activeerbaar is. De eigenaar moet zelf beslissen of hij dat wil; geen betaalkaart of gegevens via chat verstrekken.

Access vervangt de objectrechten in de backend niet. CF11 schrijft ook voor Workers validatie van het `Cf-Access-Jwt-Assertion`-JWT voor: cryptografische handtekening/JWKS, correcte issuer, app-AUD en geldigheid; een zelfgestuurde e-mailheader of alleen het bestaan van het JWT is onvoldoende. Koppel pas daarna een geverifieerde provideridentiteit aan interne users/memberships. Houd SessionResolver fail-closed. Bescherm ook API-/alternatieve hosts en test pogingen om de login via een workers.dev-/preview-URL te omzeilen. Geen `Bypass`-policy gebruiken om de integratie te laten werken. Bij toekomstige wijzigingen CSRF/originbescherming en logout/revocation expliciet testen.

## Aparte toegang voor agent en eigenaar

Applicatiegebruikers, Cloudflare-accountbeheerders en een technische agentcredential zijn drie verschillende zaken. CF12 ondersteunt afzonderlijke accountleden met rollen/scopes. Laat eigenaar/hoofdadministrator en billing bij de eigenaar; gebruik een afzonderlijke, herroepbare technische credential met minimale stagingrechten, korte geldigheid waar ondersteund, en herleidbare logs. Geen gedeeld wachtwoord, eigenaar-OTP, Global API Key of brede beheeridentiteit. Geen nieuwe agentmailbox/account aangemaakt. Exact ondersteunde scope voor Workers/D1/Access moet bij het concrete account worden gecontroleerd; niet claimen dat één product-specifieke rol alle benodigde toegangen veilig scheidt.

Deze Cloudflare-scheiding lost de bestaande gedeelde **GitHub**-identiteit niet op. Onafhankelijke eigenaarcontrole en main-mergeverbod blijven daar afzonderlijk gelden. Productiecredentials en productiedeploy blijven buiten een eventuele stagingcredential.

## Compatibiliteit met bestaande Vinext-app

Lokale broninspectie op deze datum: `package.json` gebruikt Vinext `1.0.0-beta.3`, Vite `8.0.13`, `@cloudflare/vite-plugin` `1.37.1`, Wrangler `4.92.0` en Drizzle `0.45.2`. `vite.config.ts` laadt de Cloudflare Vite-plugin, `nodejs_compat` en `vinext/server/app-router-entry`; `.openai/hosting.json` noemt binding `DB`. De database-ID in de Vite-config is expliciet een placeholder. Dit is een passende bestaande richting, **geen gekoppelde remote D1**.

Officiële Cloudflare Vinext-repository CF13 noemt Workers als primaire deploymenttarget en bindings via `cloudflare:workers`, maar waarschuwt voor actieve ontwikkeling en compatibiliteitsgaten. De lokaal geïnstalleerde beta waarschuwt eveneens; upstream main-instructies zijn geen bewijs dat elk nieuw CLI-commando past bij onze gepinde beta. Geen dependencyupgrade of overstap naar een tweede framework nodig voor dit onderzoek.

Vervolg vóór activatie: specifieke gepinde buildoutput/config controleren, servercore uitsluitend achter geverifieerde SessionResolver aansluiten, preview/staging en productie scheiden, D1-binding/migraties op echte staging-D1 testen, batchrollback/concurrency/revoke/provenance ook remote bevestigen, login/CSRF/alternate-host-omzeiling testen, CPU/bundlegrootte meten en daarna pas eigenaar een concreet publicatievoorstel geven. Een lokale build of SQLite-test bewijst die externe integratie niet. Geen deploycommando uitgevoerd.

## Officiële bronnen

Alle hieronder op 18 oktober 2026 daadwerkelijk geraadpleegd. “Bijgewerkt” is waar vermeld de datum op de bronpagina; prijzen en voorwaarden opnieuw controleren vlak vóór activatie.

- **CF01** Workers pricing (bijgewerkt 2 oktober 2026): https://developers.cloudflare.com/workers/platform/pricing/
- **CF02** Workers limits (12 oktober 2026): https://developers.cloudflare.com/workers/platform/limits/
- **CF03** D1 pricing (21 april 2026): https://developers.cloudflare.com/d1/platform/pricing/
- **CF04** D1 limits (21 april 2026): https://developers.cloudflare.com/d1/platform/limits/
- **CF05** D1 data location (2 oktober 2026): https://developers.cloudflare.com/d1/configuration/data-location/
- **CF06** D1 Time Travel (21 april 2026): https://developers.cloudflare.com/d1/reference/time-travel/
- **CF07** D1 import/export (21 april 2026): https://developers.cloudflare.com/d1/best-practices/import-export-data/
- **CF08** Access product/prijzen, Free $0 en 50-userlimit: https://www.cloudflare.com/zero-trust/products/access/
- **CF09** One-time PIN (31 augustus 2026): https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/
- **CF10** Zero Trust setup, betaalgegevens bij Free: https://developers.cloudflare.com/cloudflare-one/setup/
- **CF11** Access JWT-validatie, inclusief Workers: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
- **CF12** Accountleden en minimale rollen/scopes (20 april 2026): https://developers.cloudflare.com/fundamentals/manage-members/
- **CF13** Officiële Cloudflare Vinext-repository (main; veranderlijk): https://github.com/cloudflare/vinext — README daadwerkelijk gelezen via https://raw.githubusercontent.com/cloudflare/vinext/main/README.md ; daarnaast lokale geïnstalleerde `node_modules/vinext/README.md` geïnspecteerd.

**Bewijsgrens:** openbare documentatie en lokale configinspectie. Geen cloudaccountrechten, maandfactuur, werkelijk herstel, remote D1-migratie, Access-login, passkeys, geografische runtime of productiegeschiktheid technisch bevestigd.
