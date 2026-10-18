# CLOUD-005 — duurzame serverrapporten en exportrechten

18 oktober2026. Branch cloud/cloud-005-server-reports, base settings-storage/draft-PR #10 (4082d51). Alle mastereisen behouden; geen productie of fiscale goedkeuring.

## Gebouwd
ReportService maakt een coherente bronselectie in één SQL-statement: voertuig/kenteken/settingsrevision, tarieven, ritten met revision, bestuurdernaam, standen en herkomst. Periode op vertrekdatum Europe/Amsterdam, geld met dezelfde integerberekening als webpreview. Ontbrekende waarden blijven null en gewaarschuwd; totalen vermelden unknownDistanceCount en unknownBusinessAmountCount, zodat een deels onbekende vergoeding niet als bewezen0 wordt behandeld. Geen standaardtarief ingevuld.

Vaste snapshots in nieuwe table report_snapshots, inclusief oorspronkelijke tarieven/standen/bronwaarden. Latere wijzigingen van rit, kenteken, naam of tarief veranderen oud rapport niet. UPDATE-trigger weigert wijziging; geen publieke verwijder-/wijzigactie. Bewaar-/verwijderbeleid blijft nog te ontwerpen, geen onomkeerbare retentieclaim.

RequestId is scoped op voertuig/gebruiker: gelijke herhaling geeft het oorspronkelijke rapport, gewijzigde selectie409. Rapport en create-audit zijn één D1-transactie met recheck van actieve toegang. Lezen, lijst en CSV verifiëren de huidige voertuigrechten; andere leden van hetzelfde voertuig mogen overeenkomstig de gelijke beheerdersrechten lezen. Actor/bronvelden kunnen niet worden opgegeven via HTTP.

Providerneutrale HTTP-contracten: POST/GET /api/vehicles/{id}/reports, GET /reports/{reportId}, GET /reports/{reportId}/csv. POST gebruikt dezelfde exacteOrigin/CSRF/JSON16KiB-bescherming. Responses no-store/noCORS; CSV krijgt vaste downloadnaam, escaped formula/quotes/newlines, echte0standen en snapshotmetadata. Complete waarschuwingen staan één keer in de eerste ritregel, volgende regels verwijzen daarnaar; geen kwadratische waarschuwingverdubbeling.

Overlapdetectie gebruikt ook eerdere/lang openstaande voertuigritten buiten geselecteerde datum/bestuurder. GPS-routepunten/gaten zijn niet gevalideerd en dat staat expliciet in elk rapport. Geen GPS-volledigheids- of fiscale garantie.

## Verificatie
101/101 Node-tests PASS, TypeScript/lint/build PASS.12nieuwe rapportcases: duurzame opslag, onveranderlijkheid, exact geld, replay/concurrency/conflict/audit, rechten, rollback/revocation, Amsterdam/DST, onbekende waarden, veiligeCSV, grenzen, HTTP en overlap overmiddernacht/oudeopenrit; begrensde CSV-waarschuwingen.
Lokale workerd/D1-binding PASS met echte migrations/immutabletrigger, create/retry/CSV/auditrollback. Handler/crypto draaien in Node, SQL via workerd; geen remote Worker/provider of productiedatabase getest.
Gerichte onafhankelijke review vond overlap-overmiddernacht; gefixt met regressie,12rapporttests en hercontrolePASS. Geen volledige productieaudit.

## Grenzen
- Max500bronritten in de bredere bronperiode (inclusief eerdere open/overlappende ritten),100tarieven, snapshot1.5MB. Te grote selectie weigert413, nooit stil trunceren. Dit zijn tijdelijke API-bounds; grotere periodes vragen gebatchte rapportage zonder wensen te schrappen.
- CSV klaar op backend; zelfstandige serverPDF-renderer en webkoppeling ontbreken nog. Bestaande browserPDF blijft demoscope.
- Geen echte providerlogin/sync/staging/hardware/fiscale acceptatie. Volgende veilige groep: app-API aansluiten achter een bij ontbrekende configuratie gesloten runtimeadapter; geen account of externe dienst nodig om die code te testen.
