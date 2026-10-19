# Goedgekeurde Access-fix — live resultaat, 19 oktober 2026

Eigenaar gaf in deze Cloud-run expliciet toestemming: “Ik geef toestemming maark alles af”, direct op het concrete PR34-code-only release-/rollbackvoorstel. Dit is toestemming voor dat pakket, geen algemene toestemming voor kosten, andere productiefeatures, provisioning, migraties of mainmerge.

## Uitgevoerd en teruggelezen

- Alleen Worker `rittenregistratie`, https://rittenregistratie.zsj4j2s4df.workers.dev . Geen andere Worker of Access-policy gewijzigd.
- Bron: PR34 head `e0e8159f4f9aae396e1dc80ad05980e559351fb9`, vanaf live PR14-bronbasis6c3f608. Niet PR35 of featurestack gepubliceerd.
- Exact lokaal geteste payload SHA-256 `78c1daf6f4f684e6926a4c439457f2ca308b7d507f8f4474f0a03e95d77549f4`,46modules/23publiekeassets. Geen token of persoonsgegevens in pakket.
- PUT200 PASS op2026-10-19T16:58:02.277093Z. Deployment `06d17ebe-83f7-4ec3-be5d-57b713cc0c04`, versie `8e264bd0-62ab-48d2-a88e-9bf19d491858`100%. Etag `6caf5190f56253ae4e707d5dda7f0de25516a5fdfa2d88483dd810afd7ba050b`.
- Vier bestaande bindings met strict inherit behouden en achteraf bytegelijk teruggelezen: DB naar bestaande EU-D1, APP_ORIGIN, ACCESS_ISSUER, ACCESS_AUDIENCE. Compatibilitydate2026-05-22/nodejs_compat behouden. Geen native assets-resourcebinding. Logpush blijft uit, geen diagnostische claim/tokenlogging.
- Geen D1-migratie of gegevensmutatie uitgevoerd; eerdere Mac32-provisioning behouden, geen nieuwe telling als eigen DB-test geclaimd.
- PASS anoniem `/`, `/beheer`, `/api/vehicles`:302 naar bestaande Access-teamhost, met gewone browser-User-Agent. Eerste geautomatiseerde probe kreeg403/error1010; browser-User-Agentprobe kreeg302. Geen beveiliging gewijzigd om probe toe te laten.

## Nog te bevestigen — MAC-CLOUD-013-LIVE-01

Mac/eigenaar opent https://rittenregistratie.zsj4j2s4df.workers.dev/beheer met bestaande aanmelding. Verwacht: alleen eigen voertuig en geen “Aanmelden vereist”. Controleer ingelogd /api/vehicles200, uitsluitend eigen voertuig; rapporteer alleen status/ja-nee, geen JSON met persoonsgegevens of tokens. Anoniem op beide302 blijven. Geen rit aanmaken of gegevens veranderen voor deze proef.

Er is geen eigenaarbrowser of ingelogde sessie beschikbaar in Cloud. Daarom: live publicatie PASS, anonieme Access-gate PASS, echte ingelogde API/UI NIET GETEST na fix. De eerdere ingelogde FAIL uit Mac32 is historische laatste test, geen nieuw falen van deze versie en geen live PASS. Verzend-/GitHub-opslagbevestiging is geen Mac-uitvoering.

Bij werkelijk bevestigd mislukte eindtest: alleen de vooraf bevestigde codeversie `a7ed7466-3631-4788-8632-68ec365607b5` terugzetten met behoud van huidige bindings/Access/DB. Dat code-only rollbackpakket is mee goedgekeurd. Geen rollback alleen omdat een Cloud-login niet beschikbaar is; geen database/bootstrap terugdraaien. Bij afwijkende actuele deployment eerst onderzoeken om gelijktijdig werk niet te overschrijven.

## Verder bouwen

Cumulatieve code staat in PR35,221Node/type/lint/build/lokaleD1/gebouwdeWorker PASS vóór volgende UI-groep. Expliciete webkeuze Zakelijk/Privé met veilige herhaalcode is de volgende lokale taak. Nieuwe Swift/XCTest/iOS en hardware blijven NIET GETEST. Geen verdere productiepublicatie of migraties op basis van deze beperkte toestemming.
