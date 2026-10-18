# Voorbereid stagingplan — nog niet uitvoeren op Cloudflare

18 oktober 2026. Cloudflareonderzoek is opgedragen en afgerond. Dit plan is reviewbaar zonder nieuwe accounts, betaalgegevens of publicatie. Code: draft-PR #10, base #9;89tests/type/lint/build/lokaleD1 PASS. Codehead723e317c733055faf88d08f6485b318b9579de22,21/21 bestanden teruggelezen. main onveranderd. Web/handler/provider zijn nog niet publiek gekoppeld.

## Wat de eigenaar persoonlijk moet doen
1. Aparte GitHub-toegang: gebruik SEPARATE_AGENT_ACCESS.md. De huidige GitHub-appverbinding identificeert zich nog als eigenaar. Controleer of de aangeboden accountkoppeling een aparte gebruiker ondersteunt; zo niet, is een andere ondersteunde uitvoerende integratie nodig. Maak niet alvast een GitHub App-privésleutel die deze connector niet kan gebruiken. Deel geen wachtwoord/token. Geef aparte toegang alleen deze repo en geen beheer/bypass. Keuze voor aparte toegang is al ontvangen.
2. Cloudflare: beoordeel de concrete Workers/D1/Access-optie uit CLOUDFLARE_RESEARCH.md. Bestaand account/plan/domein is onbekend en er zijn geen Cloudflare-runtimecredentials gereed. Access Free vraagt volgens onboarding betaalgegevens; alleen eigenaar voert die eventueel in. Geen abonnement of publieke staging/app zelfstandig activeren. Dit is een nieuw inrichtingsbesluit, niet nogmaals toestemming om te onderzoeken.

## Voorwaarden vóór een externe test
- Schriftelijk vastleggen: uitsluitend synthetische staging, gekozen host/identitypolicy, Free of expliciet betaalbudget, accountrechten en gegevensvoorwaarden. EU-D1 voorgesteld; weur is geen EU-garantie. Geen echte GPS/personen in staginglogs.
- Aparte GitHub-actor werkelijk vaststellen; minimaal één vereiste eigenaarreview pas zo inrichten dat de PR-auteur onafhankelijk is. Huidige0approval-regel onder eigenaaridentiteit niet als gescheiden controle presenteren. Geen main-merge door agent.
- Een beperkt stagingcredential via ondersteunde secretvoorziening, geen Global API Key/eigenaarwachtwoord of productieprivileges. Geen geheime inhoud in Git of chat.
- Exacte gepinde Vinext-buildconfig evalueren. Vite gebruikt nu placeholderdatabaseID en is geen remote stagingconfig. Geen placeholder stil vervangen of bestaand databasebestand overschrijven.

## Uitvoering na expliciete externe autorisatie
- Geïsoleerde D1-staging met EU-jurisdictie creëren. Gecontroleerde CLI-mogelijkheid: Wrangler4.92.0 d1 create --help noemt --jurisdiction eu. Alleen help is hier uitgevoerd; het echte create-commando maakt een remote resource en is niet uitgevoerd. EU-jurisdictie moet bij creatie worden gekozen.
- Additieve migraties0000–0006 op lege synthetische staging toepassen, schema/foreignkeys/triggers controleren, expliciete drie gebruikers en memberships bootstrap. Gebruik geverifieerde issuer+subjectmapping; geen e-mailheader of automaticprovision.
- Access-app/allowlist zonder Bypass inrichten; mogelijke OTP expliciet configureren. Exact issuer/audience aan resolver geven. Controleren dat alternatieve preview-/workers.dev-hosts de bescherming niet omzeilen. Handler pas daarna achter provider monteren.
- Remote acceptatie: drie afzonderlijke gebruikers, intrekking/verval, crossvehicle-deny, CSRF, conflict/retry, auditrollback, settingslegacybehoud, rapportrechten, payloadgrenzen en mobiele workflow. JWT-validatie alleen bewijst geen onmiddellijke providerlogout-revocation.
- CPU/rows/opslag/quota meten op samengestelde SSR+auth+DB. Free10msCPU/50queries kunnen knellen; niets automatisch upgraden. Lokale settingsbatch is begrensd tot40objecten/44statements.
- Export/import/herstel oefenen met synthetische data op aparte database, inclusief migratie-/trigger-/auditbehoud. Geen productierestore; die overschrijft gegevens. TimeTravel is geen onafhankelijke langetermijnback-up.
- Resultaten en kostenvoorstel vastleggen; productie blijft afzonderlijke eigenaarbeslissing. Geen impliciete toestemming door groene tests.

## Wat Cloud zonder accounts verder kan bouwen
Duurzame serverrapporten, exportrechten, UI/backendadapters, detectie-inname/deduplicatie, offline/conflictcontracten en lokale hersteltests. Deze taken blijven open en zijn niet allemaal door accountinrichting geblokkeerd. Native build/hardware vraagt Mac/iPhone. Zie CLOUD_TASKS.md; geen mastereisen schrappen.
