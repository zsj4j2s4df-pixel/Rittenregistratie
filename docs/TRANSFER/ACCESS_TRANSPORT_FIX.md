# CLOUD-013 — beperkte Access-transportfix, 19 oktober 2026

## Status en afbakening

Voorstel, NIET gepubliceerd. Actuele live eindtest blijft FAIL zoals Mac PR32 meldt. Bronbasis is exact PR14 commit `6c3f60834b36fe84ed43360c27f3feb8d2438ef7`, niet de latere featurestack. PR31/33 en Mac PR30/32 blijven behouden. Geen migraties, provisioning, nieuwe afhankelijkheden of Cloudflare-configuratiewijzigingen.

De oorspronkelijke resolver leest uitsluitend `cf-access-jwt-assertion`. Een synthetisch correct ondertekend app-token, alleen als `CF_Authorization`-cookie, geeft met originele code 401; dezelfde regressietest geeft met de patch 200. De patch kiest alleen bij afwezige assertionheader één strikt begrensde, ondubbelzinnige cookie. Een aanwezige ongeldige/lege header krijgt nooit cookie-fallback. Alle bestaande RS256/JWKS-, issuer-, audience-, app-type-, tijd-, subject- en interne account/voertuigcontroles blijven verplicht. Geen vertrouwen in cookiebestaan, emailheader of ongetoetste ctx-velden; geen automatisch account.

## Bewijs en grenzen

- PASS: 124/124 Node-tests; typecheck; volledige lint; webbuild; lokale workerd/D1-smoke met ondertekende header én cookie, uitschakeling en ingetrokken voertuigrecht.
- PASS: gerichte regressie tegen oorspronkelijke resolver faalt precies op 401 versus verwacht 200; patch slaagt. Alleen synthetische sleutels/identiteit, geen echte tokens of claims gelogd.
- PASS: geïnstalleerde vinext 1.0.0-beta.3 maakt in createWorkerRevalidationContext een afgeleid contextobject zonder `access`. Test importeert echte geïnstalleerde frameworkmodule. Dit bewijst die lokale contextomissie, niet de oorzaak van het live probleem.
- Read-only live inspectie uit deze run: deployment `e82d58e7-f037-485d-9e57-97a9f2cc5d5a`, versie `a7ed7466-3631-4788-8632-68ec365607b5` (100%, nummer3); script-etag `bf0b884f3afe21d00a7e3bfa9480ec2732ec0bd7d19747035ee9966900864c80`. Headerresolver aanwezig, cookiepad/ctx.access-adapter afwezig. Embedded release-entry.js; geen native assets-resourcebinding. Geen echte ingelogde requestheaders onderschept.
- NIET GETEST: exacte falende live resolverstap, nieuwe code achter echte Access-login, Safari/iPhone, native iOS/Jeep/CarPlay/OBD2. Cookie-fallback kan de live fout oplossen wanneer de assertionheader ontbreekt en de geldige app-cookie de handler bereikt; verkeerde interne subjectmapping of een andere routefout wordt hiermee niet bewezen opgelost.

## Concreet releasevoorstel — nieuwe eigenaarstoestemming vereist

Alleen Worker `rittenregistratie` op `https://rittenregistratie.zsj4j2s4df.workers.dev`, bronbasis hierboven plus deze twee runtimebestanden (`lib/access-token.ts`, `lib/cloudflare-access.ts`). Geen featurestack uit PR15–33 meepubliceren. Buildwrapper ongewijzigd. Bestaande DB-binding, APP_ORIGIN, ACCESS_ISSUER/AUDIENCE en Access-policy behouden; provisioning is al uitgevoerd: 1 gebruiker, 1 voertuig, 1 actief recht, 0 ritten, 2 audits volgens Mac32. Database niet leeg noemen of opnieuw vullen.

Lokale payload via `node scripts/prepare-worker-upload.mjs /tmp/rit-auth-worker-payload.json`: 46 modules/23 publieke assets, SHA-256 `82168a5c18822735f265519309a45bd703198d515a16b7816f6f47df8dd2c3b0`. Gegenereerde build/payload blijft buiten Git. Hash is van dit lokale artefact; opnieuw bouwen kan andere bytes opleveren en vereist nieuwe hashcontrole. Er is niets geüpload.

Na toestemming: eerst huidige deployment/versie/bindings opnieuw read-only controleren; bij onverwachte wijziging stoppen en voorstel herijken. Alleen codepakket uploaden met expliciet behoud van alle bestaande bindings en Access-instellingen; geen migratie, gebruikersaanmaak of ruimere policy. Leg ontvangen versie-ID vast. Mac/eigenaar controleert ingelogd `/api/vehicles` (200, alleen eigen voertuig) en `/beheer` (geen Aanmelden vereist), anoniem op beide nog302; geen ritmutatie. Log uitsluitend status en beoordelingsresultaat, geen JWT/cookies/persoonsgegevens. Bij FAIL geen live succes claimen; herstel de vooraf bevestigde versie met bestaande runtimeconfig/gegevens en leg resultaat vast. Rollbackvoorstel is code-only naar bovenstaande a7ed-versie als die nog de vooraf bevestigde versie is; nooit bootstrap of database terugdraaien. Ook rollback valt onder het expliciet goed te keuren releasepakket.

Als live FAIL blijft: controleer met toestemming privacybeperkt alleen booleans transportaanwezigheid/header-vs-cookie, verifierstapcategorie en interne mappingmatch, zonder tokens/claims/IDs te loggen. Geen debugendpoint of logging toegevoegd in deze patch. Geen hoofdzaak als bewezen presenteren zonder die test.

## Bronnen

- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/ — header heeft voorkeur; cookie is geen garantie; JWT altijd cryptografisch verifiëren.
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/ — app-cookie onderscheiden van teamtoken.
- https://developers.cloudflare.com/workers/configuration/cloudflare-access/ — ctx.access hoort bij directe geauthenticeerde invocation; forwarding/assetsrouter kennen beperkingen. De huidige fix vertrouwt niet op ctx.access.

## Volgende veilige taak

Fix apart reviewen en naar cumulatieve ontwikkelbranch overnemen; open native queuebron en resterende werkkaart blijven concept/hardwarecontrole. Geen externe wijzigingen zolang releasebesluit ontbreekt.
