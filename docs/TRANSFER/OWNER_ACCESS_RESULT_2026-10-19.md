# Live eigenaarstoegang — configuratie toegepast, eindtest niet geslaagd

19 oktober 2026. Nieuwste status; oudere ontbrekende-bindings/lege-databaseclaims zijn ingehaald.

## Toestemming en uitvoering

Eigenaar gaf specifiek toestemming voor koppeling van de bestaande livebackend aan Access en uitsluitend zijn geverifieerde interne account/voertuigtoegang. Geen algemene codepublicatie, nieuwe externe accounts, kosten, migraties of main-merge geautoriseerd.

- Bestaande Worker: alleen PATCH settings, met behoud van APP_ORIGIN en DB. ACCESS_ISSUER/ACCESS_AUDIENCE uit bestaande Access-app/organisatie toegevoegd en exact teruggelezen. `wrangler.json` bewaart dezelfde openbare waarden voor toekomstige geautoriseerde releases; dit is geen deployopdracht.
- Gedeployde bron read-only gecontroleerd: strikte RS256/JWKS-, issuer-, audience-, tijd- en subjectcontrole en expliciete interne mapping aanwezig. Geen emailheader-/demofallback.
- Eigenaarsidentiteit via Cloudflare API én officieel browserendpoint `/cdn-cgi/access/get-identity` bevestigd. Mapping exact `JSON.stringify([issuer, verifiedSubject])`. Geen JWT/cookie uitgelezen of opgeslagen.
- Database vooraf leeg. Parametergebonden D1 REST-batch: één eigenaar, één projectvoertuig, één actief admin_driver-lidmaatschap, twee bootstrap-audits; alle vijf statements success/changes1. Geen rit, route, tarief, kenteken of tellerstand toegevoegd.
- Bestaand projectmodel Jeep Wrangler Unlimited 80th Anniversary 4xe, modeljaar2021, status `unverified`. Geen claim van geverifieerde voertuigidentificatie/specs. Gebruikersprioriteit volgt het bestaande register; echte bestuurder wordt niet automatisch aangenomen.

Geen privé-email, externe subject-ID, IP, persoonlijke claims of screenshot in openbare GitHub. Bootstrap niet blind herhalen: database is niet meer leeg. Nooit INSERT OR REPLACE of automatische adminaanmaak voor iedere login.

## Werkelijke tests

| Controle | Uitkomst |
|---|---|
| Runtimebindings teruggelezen | PASS: APP_ORIGIN, DB, ACCESS_ISSUER, ACCESS_AUDIENCE |
| Interne mapping en membership SQL | PASS: exacte eigenaar, actieve admin_driver-rechten |
| Eindtelling | users1, vehicles1, actieve memberships1, trips0, audit_logs2 |
| Openbare JWKS | HTTP200, twee RSA-sleutels |
| Cookievrije GET `/`, `/beheer`, `/api/vehicles` | PASS: elk302 naar eigen Access-login |
| Ingelogde eigenaar, browser `/api/vehicles` | FAIL: JSON `Aanmelden vereist.` |
| Ingelogde eigenaar, browser `/beheer`, ook na reload | FAIL: `Aanmelden vereist.`; geen bruikbare centrale registratie |
| Andere identiteit / ingetrokken sessie / iPhone | NIET GETEST |

Lokale regressie op ongewijzigde code:19/19tests PASS (Access-handtekening/claims/explicit mapping, disabled/expired/revocation/voertuigscoping en geconfigureerde API fail-closed). `git diff --check` PASS. Dit zijn geen geslaagde liveauthenticatietests.

Een tussentijdse lege-voertuigenmelding bij opnieuw verbinden was geen geslaagde autorisatie; na voltooid laden keerde de aanmeldfout terug. Geen succesvolle backendlogin claimen.

## Oorzaakonderzoek en vervolg

Configuratie en interne mapping kloppen, maar de exacte falende resolverstap is NIET BEWEZEN: bestaande resolver vangt fouten bewust zonder persoonsgegevenslogging af. Geen nieuwe code/logging live gezet.

Onderzoek de aansluiting tussen de JWT-headerresolver en Worker-level Access. De [officiële Worker Access-documentatie](https://developers.cloudflare.com/workers/configuration/cloudflare-access/) beschrijft `ctx.access.aud` en `ctx.access.getIdentity()` plus beperking bij Static Assets/interne router; frameworks kunnen automatisch assets toevoegen. Dit is een onderzoekshypothese, geen bewezen ontbrekende header. Niet zonder bewijs de resolver verzwakken, email-only vertrouwen of een tweede Access-app maken.

Cloud mag op eigen branch een gerichte fix/adapter en regressietests voorbereiden. Controleer context-doorgifte, exacte account/app/subjectbinding, afloop en revocation; behoud interne gebruikers-/voertuigguards en echte JWT-verificatie waar van toepassing. Geen diagnostisch endpoint met tokens/claims. Laatste draftcode/migraties zijn niet live.

**Nieuwe toestemming nodig vóór beperkte live codepublicatie voor diagnose/herstel.** Eerst concrete diff, tests, bestaande live-codebasis en rollback vastleggen. Niet bundelen met alle recente Cloudfunctionaliteit. Worker-Access blijft aan; nooit uitschakelen als herstel. Nieuwe eigenaarrecord/audits niet automatisch verwijderen.
