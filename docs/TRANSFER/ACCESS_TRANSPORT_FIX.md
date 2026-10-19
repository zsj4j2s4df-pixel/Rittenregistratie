# CLOUD-013 — beperkte Access-transportfix, 19 oktober 2026

> Actueel: het afgebakende PR34-pakket is inmiddels expliciet goedgekeurd en live gepubliceerd. Zie [release-resultaat](ACCESS_RELEASE_RESULT_2026-10-19.md). Het voorstel hieronder is bewaard als specificatie; echte ingelogde eindtest blijft open.

## Status en afbakening

Voorstel, NIET gepubliceerd. Actuele live eindtest blijft FAIL zoals Mac PR32 meldt. Bronbasis is exact PR14 commit `6c3f60834b36fe84ed43360c27f3feb8d2438ef7`, niet de latere featurestack. PR31/33 en Mac PR30/32 blijven behouden. Geen migraties, provisioning, nieuwe afhankelijkheden of Cloudflare-configuratiewijzigingen.

De oorspronkelijke resolver leest uitsluitend `cf-access-jwt-assertion`. Een synthetisch correct ondertekend app-token, alleen als `CF_Authorization`-cookie, geeft met originele code 401; dezelfde regressietest geeft met de patch 200. De patch kiest alleen bij afwezige assertionheader één strikt begrensde, ondubbelzinnige cookie. Een aanwezige ongeldige/lege header krijgt nooit cookie-fallback. Alle bestaande RS256/JWKS-, issuer-, audience-, app-type-, tijd-, subject- en interne account/voertuigcontroles blijven verplicht. Geen vertrouwen in cookiebestaan, emailheader of ongetoetste ctx-velden; geen automatisch account.

## Aangetoonde runtimefout en gerichte oplossing

De extra end-to-endtest `node tests/access-built-worker-smoke.mjs` draait het echte gebouwde embedded releasepakket, frameworkrouter en lokale workerd/D1 met uitsluitend synthetische JWKS. Beide geldige transportpaden gaven eerst401. Tijdelijke lokale diagnostiek zonder tokens/claims identificeerde de exacte workerd-exceptie: `Invalid redirect value, must be one of "follow" or "manual" ("error" won't be implemented since it does not make sense at the edge; use "manual" and check the response status code).` Diagnostiek is uit het artefact verwijderd en niet aan broncode toegevoegd.

De JWKS-fetch gebruikt daarom nu `redirect:'manual'`; de bestaande `!response.ok`-controle weigert alle3xx voordat een body wordt gelezen. Er wordt nooit een Location gevolgd. Een nieuwe regressie weigert301/302/303/307/308 met precies één aanvraag naar de vast ingestelde issuer. Met deze wijziging slaagt de echte gebouwde Worker voor ondertekende header én cookie, ontbrekend token401, vervalste header401, uitgeschakelde gebruiker401 en ingetrokken voertuigrecht403. De beheershell geeft200; een echte ingelogde browserflow is hiermee niet getest.

De aanvankelijke standalone-resolver/D1-tests draaiden de verifier in Node en konden deze edge-fetchbeperking niet aantonen. De gebouwd-Worker-test vult dat gat. Dit is een bewezen runtimefout in het lokale releasepakket en een onderbouwde live-oorzaak, nog geen bewezen liveherstel. De cookie-fallback is aanvullend; ctx.access wordt niet als alternatieve identiteit vertrouwd.

## Bewijs en grenzen

- PASS: 125/125 Node-tests; typecheck; volledige lint; webbuild; lokale workerd/D1-smoke met ondertekende header én cookie, uitschakeling en ingetrokken voertuigrecht.
- PASS: gerichte regressie tegen oorspronkelijke resolver faalt precies op 401 versus verwacht 200; patch slaagt. Alleen synthetische sleutels/identiteit, geen echte tokens of claims gelogd.
- PASS: geïnstalleerde vinext 1.0.0-beta.3 maakt in createWorkerRevalidationContext een afgeleid contextobject zonder `access`. Test importeert echte geïnstalleerde frameworkmodule. Dit bewijst die lokale contextomissie, niet de oorzaak van het live probleem.
- Read-only live inspectie uit deze run: deployment `e82d58e7-f037-485d-9e57-97a9f2cc5d5a`, versie `a7ed7466-3631-4788-8632-68ec365607b5` (100%, nummer3); script-etag `bf0b884f3afe21d00a7e3bfa9480ec2732ec0bd7d19747035ee9966900864c80`. Headerresolver aanwezig, cookiepad/ctx.access-adapter afwezig. Embedded release-entry.js; geen native assets-resourcebinding. Geen echte ingelogde requestheaders onderschept.
- NIET GETEST: exacte falende live resolverstap, nieuwe code achter echte Access-login, Safari/iPhone, native iOS/Jeep/CarPlay/OBD2. Cookie-fallback kan de live fout oplossen wanneer de assertionheader ontbreekt en de geldige app-cookie de handler bereikt; verkeerde interne subjectmapping of een andere routefout wordt hiermee niet bewezen opgelost.

Draft-PR: https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/34 .

## Concreet releasevoorstel — nieuwe eigenaarstoestemming vereist

Alleen Worker `rittenregistratie` op `https://rittenregistratie.zsj4j2s4df.workers.dev`, bronbasis hierboven plus deze twee runtimebestanden (`lib/access-token.ts`, `lib/cloudflare-access.ts`). Geen featurestack uit PR15–33 meepubliceren. Buildwrapper ongewijzigd. Bestaande DB-binding, APP_ORIGIN, ACCESS_ISSUER/AUDIENCE en Access-policy behouden; provisioning is al uitgevoerd: 1 gebruiker, 1 voertuig, 1 actief recht, 0 ritten, 2 audits volgens Mac32. Database niet leeg noemen of opnieuw vullen.

Lokale payload via `node scripts/prepare-worker-upload.mjs /tmp/rit-auth-worker-payload.json`: 46 modules/23 publieke assets, SHA-256 `78c1daf6f4f684e6926a4c439457f2ca308b7d507f8f4474f0a03e95d77549f4`. Gegenereerde build/payload blijft buiten Git. Hash is van dit lokale artefact; opnieuw bouwen kan andere bytes opleveren en vereist nieuwe hashcontrole. Er is niets geüpload.

Na toestemming: eerst huidige deployment/versie/bindings opnieuw read-only controleren; bij onverwachte wijziging stoppen en voorstel herijken. Alleen codepakket uploaden met expliciet behoud van alle bestaande bindings en Access-instellingen; geen migratie, gebruikersaanmaak of ruimere policy. Leg ontvangen versie-ID vast. Mac/eigenaar controleert ingelogd `/api/vehicles` (200, alleen eigen voertuig) en `/beheer` (geen Aanmelden vereist), anoniem op beide nog302; geen ritmutatie. Log uitsluitend status en beoordelingsresultaat, geen JWT/cookies/persoonsgegevens. Bij FAIL geen live succes claimen; herstel de vooraf bevestigde versie met bestaande runtimeconfig/gegevens en leg resultaat vast. Rollbackvoorstel is code-only naar bovenstaande a7ed-versie als die nog de vooraf bevestigde versie is; nooit bootstrap of database terugdraaien. Ook rollback valt onder het expliciet goed te keuren releasepakket.

Als live FAIL blijft: controleer met toestemming privacybeperkt alleen booleans transportaanwezigheid/header-vs-cookie, verifierstapcategorie en interne mappingmatch, zonder tokens/claims/IDs te loggen. Geen debugendpoint of logging toegevoegd in deze patch. Geen hoofdzaak als bewezen presenteren zonder die test.

## Bronnen

- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/ — header heeft voorkeur; cookie is geen garantie; JWT altijd cryptografisch verifiëren.
- https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/ — app-cookie onderscheiden van teamtoken.
- https://developers.cloudflare.com/workers/configuration/cloudflare-access/ — ctx.access hoort bij directe geauthenticeerde invocation; forwarding/assetsrouter kennen beperkingen. De huidige fix vertrouwt niet op ctx.access.

## Volgende veilige taak

Fix apart reviewen en naar cumulatieve ontwikkelbranch overnemen; open native queuebron en resterende werkkaart blijven concept/hardwarecontrole. Geen externe wijzigingen zolang releasebesluit ontbreekt.
