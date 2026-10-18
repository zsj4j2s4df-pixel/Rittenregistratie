# Access instellen op iPhone — gecontroleerd 18 oktober 2026

## Gecontroleerde bron van waarheid

GitHub-branch cloud/cloud-005-cloudflare-release, commit6c3f60834b36fe84ed43360c27f3feb8d2438ef7: wrangler.json heeft name=rittenregistratie, workers_dev=true, preview_urls=false, APP_ORIGIN=https://rittenregistratie.zsj4j2s4df.workers.dev en DB-binding voor EU-D1. Hosting is Workers (vinext/React SSR + API) en D1; geen Pages-hosting of vereist eigen domein.

Read-only Cloudflare-controle: accountsubdomain zsj4j2s4df; Access-organisatie bestaat met auth_domain snowy-snowflake-4760.cloudflareaccess.com. Access-applicatielijst leeg tijdens controle: het formulier op de iPhone is nog geen opgeslagen/toegepaste applicatie. Alleen huidige identityprovider type cloudflare is gezien; geen geconfigureerde One-time PIN-provider veronderstellen. Freeplan is door eigenaar bevestigd, billing is niet gewijzigd of opnieuw gecontroleerd.

Nieuwste opdracht: geen nieuwe livepublicatie zonder toestemming en geen kosten. Deze taak maakt/wijzigt geen Access-app, policy, Worker, DB, DNS, abonnement of account. Eerdere Workerpublicatie blijft geschiedenis, geen nieuwe release tijdens deze taak.

## Invullen in Access → Applications → Application details → Destinations

| Veld | Waarde |
|---|---|
| Application type | Self-hosted |
| Application name | RitKompas |
| Destination | Public hostname |
| Hostname / volledig domein | rittenregistratie.zsj4j2s4df.workers.dev |
| Path | Leeg |
| Session duration | 1 hour / 1h |

De hostname zonder https:// invoeren; in Safari is het volledige adres https://rittenregistratie.zsj4j2s4df.workers.dev . Leeg pad beschermt ook /beheer, /api en de demo. Niet alleen /beheer invullen: de API moet eveneens onder Access vallen. Geen wildcard over alle Workers; freesadviseur en accountsubdomain ongemoeid laten.

Als de interface subdomain/domain splitst: subdomain rittenregistratie en domain zsj4j2s4df.workers.dev. Kan de domeinkeuzelijst workers.dev niet kiezen, forceer geen zone of domeinaankoop. Gebruik een aangeboden custom-hostname-invoer voor de exacte host; alternatief, expliciet gedocumenteerd voor Workers: Workers & Pages → rittenregistratie → Access → Protect this Worker behind Access → All traffic. Dit alternatief beschermt alleen deze Worker, niet Protect all Workers. Geavanceerde policy achteraf in Access-app beheren. Geen beide routes dubbel configureren zonder de voorrang te controleren. Worker-level Access ondersteunt volgens huidige docs geen WebSockets; voor toekomstige websocket-sync hostname-based bescherming blijven gebruiken.

Policy: naam RitKompas-eigenaar; Action Allow; Include → Emails → het exacte login-e-mailadres van de eigenaar. Geen Everyone, Bypass of complete maildomein-allowlist. Gebruik de bestaande Cloudflare-login als aangeboden; One-time PIN pas kiezen als die provider werkelijk is ingesteld en de eigenaar dat wenst. Geen nieuwe externe IdP/account nodig. Eigenaar bepaalt allowlist en drukt zelf op Save/Create wanneer hij deze configuratie wil toepassen. Cloud doet dat nu niet.

Na opslaan: Cloud kan issuer/audience/destination/policy read-only teruglezen. Issuer is https://snowy-snowflake-4760.cloudflareaccess.com, audience pas bekend na opslaan van de app. Geen verzonnen audience, service token of wachtwoord via chat. Alleen een Access-policy opent de backend niet: runtimebindings en expliciete interne gebruikers/voertuigrechten zijn nog nodig; daarvoor eerst het concrete wijzigingsvoorstel afronden en eventuele livepublicatie door eigenaar laten autoriseren. Geen automatische interne admin voor iedere toegelaten login.

## Lokale ontwikkeling in deze taak

lib/access-readiness.ts en scripts/check-access-setup.mjs controleren een lokaal, opgeschoond snapshot van de opgeslagen Access-app/policies vóór een later wijzigingsvoorstel. Geen netwerk/schrijf/deployfunctie. Accepteert bewust alleen de hierboven aanbevolen volledige publieke hostname met expliciete e-mailallowlist; Worker-level of gedeeltelijke padconfiguraties vragen gerichte review, zijn niet per definitie onveilig. Afwijzing bij verkeerde/brede bestemming, publieke override, bypass/everyone, ontbrekende audience, vreemde issuer of onvolledige policyreadback. Alleen bij geslaagde controle worden openbare bindings voorgesteld; geen login/provisioning/revocationclaim.

Gebruik: node --experimental-strip-types scripts/check-access-setup.mjs /pad/naar/private-snapshot.json . Invoer bevat origin, authDomain, allowedEmails, app (type/aud/destinations/policies). Privé-e-mailallowlist niet in Git opslaan. Snapshot zonder JWT, credentials, cookies of ruwe identiteitsclaims aanleveren. Uitvoer bevat geen e-mailadressen. Type/lint en122Node-tests PASS; drie gerichte configuratieregressietests. Geen gewijzigde app-UI en geen nieuwe build/deploy nodig voor dit losse ontwikkelhulpmiddel. Echte login/iPhone/provider-flow NIET GETEST.

## Actuele officiële documentatie

- https://developers.cloudflare.com/workers/configuration/routing/workers-dev/ — geen eigen domein nodig voor workers.dev; Access kan productiehost beschermen. Voor bedrijfskritische productie beveelt Cloudflare later een eigen route/domein aan; dat is nu geen aanschafvoorwaarde.
- https://developers.cloudflare.com/workers/configuration/cloudflare-access/ — Protect one Worker, hostname/path-bescherming en voorrang; geraadpleegd18oktober2026.
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/ — standaard publieke-hostnameformulier en policies. Zonevereiste in die algemene handleiding vervangt niet de expliciete Workers/Access-ondersteuning hierboven.
