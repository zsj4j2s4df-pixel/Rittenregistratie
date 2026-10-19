# Cloud-taken — RitKompas

## Actuele regie en status — 18 oktober 2026

**Cloud is hoofdontwikkelaar, Mac ondersteunt lokale/iOS/hardwaretaken, eigenaar beslist over belangrijke handelingen.** Deze nieuwe expliciete opdracht vervangt de oudere Mac-hoofdrol hieronder. GitHub is centraal. Sol indien beschikbaar; Astra uitsluitend belangrijke besluiten. Geen extra betaalde diensten/runs, geen main-merge zonder eigenaar. Eén samenhangende run heeft voorkeur.

| Taak | Actuele status / vervolgstap |
|---|---|
| CLOUD-001 | TER CONTROLE — PR #1 behouden; documentstructuur door Mac bekeken, geen merge/volledige inhoudelijke acceptatie |
| CLOUD-006 | TER CONTROLE — PR #2 afhankelijk van #1; 123 REQ-ID's/21 scenario's behouden, actuele codebasis nu aangeleverd |
| CLOUD-002 / CLOUD-004 | TER CONTROLE — additieve databaseguards, vijf regressiecases; 37/37 tests en typecheck/lint/build PASS; verdere API/UI-dekking open |
| CLOUD-003 | GEDEELTELIJK UITGEVOERD — twee gerichte serverkernreviews en één rapportagereview; volledige productieauth/privacyreview open |
| CLOUD-005 | IN UITVOERING — PR #6 web/rapportage; serverkern/ritinvoer TER CONTROLE: 127 tests (nieuwste lokale groep) + eerdere lokale D1 + type/lint/build PASS; settingsopslag/Accessvoorbereiding TER CONTROLE, adres-/tariefCRUD, ritcorrectie/historie, bestuurderkeuze en ritfilters gebouwd; Cloudflare Worker/EU-D1 gepubliceerd, live gesloten API PASS; echte login/sync open |
| CLOUD-007 | IN UITVOERING — veilige Mac→GitHub-overdracht op handover/mac-to-cloud-20261018, base cloud/cloud-006-documentatie |
| CLOUD-008 | TER CONTROLE — 32/32 tests, typecheck/lint/build PASS; draft-PR #4; eerdere omgevingblokkades opgelost |

Actuele open werkkaart: [OPEN_WORK](docs/TRANSFER/OPEN_WORK.md).

Open technische taken met acceptatie: [CLOUD_CHECKPOINT](docs/TRANSFER/CLOUD_CHECKPOINT.md). Deze checkpoint is geen volledige oplevering; providerkeuze blokkeert niet alle lokale ontwikkeling.

### Nieuwste publicatiegroep

Worker https://rittenregistratie.zsj4j2s4df.workers.dev online; EU-D1 acht migraties, geen gebruikers/ritten.119 tests/type/lint/build/D1 en uitgebreide centrale browser PASS; live HTTPS/Chromium demo en gesloten API PASS. Draft-PR #14: https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/14 . Scoped bestuurderslijst en keuze/filters toegevoegd, privacy-/revoke-/datumboundarytests PASS. Zie [CLOUD_RELEASE](docs/TRANSFER/CLOUD_RELEASE.md). Access-activering persoonlijk nodig, overige lokale ontwikkeltaken blijven open. Geen main-merge.

### Actuele uitvoering na omgevingsherstel

Draft-PR #4: https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/4 . Bestaande lockfile-dependencies geïnstalleerd; supply-chaincontrole, typecheck, lint en build PASS. Eerdere credit-/proxy-/installatiefouten hieronder zijn historie. ACT-002 technisch gecontroleerd; eigenaaridentiteit nog gedeeld. RESUME is het actuele hervatpunt.

### CLOUD-007 — Veilige overdracht

Eigenaar: Mac, controle Cloud/projecteigenaar. Prioriteit hoog; usage onbekend. Scope: bestaande code/config/tests/docs, gescheiden Mac-snapshot, veilige placeholder, besturing en privacycontrole. Acceptatie: secretscan/diff, behoud PR-voorouders, tests, remote terugleesbewijs en eigen draft-PR. Geen merge, betaalde dienst, privéfoto of runtime-data. Resultaat/bewijs: docs/TRANSFER en DEVELOPMENT_PROGRESS. Open: technische eigenaarcontrole ACT-002, Cloud-proef.

### CLOUD-008 — Echte Cloud-overdrachtstest

Eigenaar: bestaande Cloud agent, dagelijks beschikbaar model (Sol voorkeur, selectie niet verondersteld). Prioriteit hoog; usage onbekend, één gecombineerde run zonder nieuwe betaalde omgeving. Scope: branch lezen, tests draaien, kleine CSV-regressietest voor tellerstanden inclusief nul en toelichting toevoegen, commit/PR, voortgang/hervatpunt. Branch: cloud/cloud-008-handover-smoke, base handover/mac-to-cloud-20261018. Acceptatie: concrete commit, testuitvoer, terugleesbaar bestand en PR; ontbrekende runtime/installatiebevoegdheid expliciet NIET GETEST. Geen nieuw framework, geen secrets/productiedata en geen merge. Daarna veilige CLOUD-002/004-groep indien ruimte/toegang, met afzonderlijk commitbewijs.

Uitgevoerd op overdrachtscommit `8b50e9109b51770f6cf4d0eec25eac38c17e4b76`: baseline31, smoke32 PASS; standaardrunner, type/lint/build werken na omgevingsherstel. Draft-PR #4 gepubliceerd, geen pending creditblokkade. Bewijs: docs/TRANSFER/CLOUD_PROOF.md.

**Opleverketen:** #1 → #2 → #3 overdracht → #4 smoke → #5 integriteitsguards → #6 web/rapporten → draft #7 serverkern → draft #8 idempotente ritinvoer → draft #9 HTTP-adapter (base #8) → draft #10 settings/Accessvoorbereiding → draft #11 serverrapporten → draft #12 APIruntime → draft #13 centraleweb.

**ACT-002:** drie main-regels bevestigd; gedeelde identiteit/onafhankelijke approval OPEN. Zie docs/TRANSFER/MAIN_SECURITY_CHECK.md en OWNER_ACTIONS.md. Geen instellingen opnieuw laten doen.

**Nieuwe settingsgroep — draft-PR #10:** cloud/cloud-005-settings-storage, base #9: duurzame instellingen, voertuigscope/audit en voorbereide cryptografische Access-resolver.89tests/type/lint/build/lokale D1 PASS, zie SETTINGS_STORAGE.md. Cloudflareonderzoek en apartagentplan gereed, geen accounts/deploys.

**Rapportgroep TER CONTROLE — draft-PR #11:** cloud/cloud-005-server-reports, base #10.101tests/type/lint/build/lokaleD1 PASS; SERVER_REPORTS.md.

**API-runtimegroep TER CONTROLE — draft-PR #12:** cloud/cloud-005-api-runtime, base #11;105tests/type/lint/build +builtNode503smoke/lokaleD1PASS, API_RUNTIME.md.

**Centrale webgroep TER CONTROLE — draft-PR #13:** cloud/cloud-005-central-web, base #12;111tests/type/lint/build en centrale browser met echteHTTP/SQLite +syntheticidentity PASS, CENTRAL_WEB.md. Reconnectreviewfout, CSVdownload en mobieleheader gefixt.

**Volgende technische groep:** centrale adres-/tariefCRUD en ritcorrectie/historie; daarna geverifieerde sessionprovider en UI-sync. Providerbesluit is alleen nodig voor externe inrichting, niet voor alle lokale code. Native/hardware apart. Geen mastereisen vervallen.

**HTTP-bewijs:** docs/TRANSFER/TRIP_HTTP.md. Providerneutrale adapter met CSRF-/requestgrenzen; geen publieke API geactiveerd.

**Aanmaakbewijs:** docs/TRANSFER/SERVER_CREATE.md. Idempotente aanmaak en gelijktijdige retry/rollback lokaal in D1 PASS.

**Backendbewijs:** docs/TRANSFER/SERVER_CORE.md; 61/61 tests, lokale workerd/D1, typecheck/lint/build PASS. Twee gerichte serverkernreviews, geen volledige securityacceptatie.

## Historische taakbeschrijvingen (actuele status hierboven gaat voor)

Bijgewerkt: 18 oktober 2026. Alleen repository Rittenregistratie.
Mac is hoofdontwikkelaar en accepteert resultaten; Cloud werkt afgebakend op eigen branches met PR's.
Inhoudelijke eisen: bijgewerkte masterprompt, Opper-agent-opdracht en OWNER_ACTIONS-aanvulling; nieuwste procesafspraken hebben voorrang boven oudere procespassages.
Geen automatische productiepublicatie. Geen extra betaalde Cloudruns gestart.
Model voor onderstaande taken: huidige sessiemodel; Sol 6.1 voorkeur indien daadwerkelijk selecteerbaar. Geen automatische modelwissel ingesteld.
GitHub Issues niet aangemaakt: deze lijst volstaat voorlopig.

## CLOUD-001 — Eerste documentaudit en veilige nulmeting
- Waarom: conflicterende historische instructies scheiden van geldende afspraken, vóór codewerk.
- Prioriteit: hoog. Status: TER CONTROLE. Verantwoordelijke: Cloud; controle door Mac zodra beschikbaar.
- Bestanden/eisen: alle vier basisdocumenten; Opper-agent FASE A/B; samenwerking §4, §6.
- Instructies: inventariseer main, lees bronnen, leg conflicten vast, behoud eisen en historie.
- Afhankelijkheden: geen Mac-hardware nodig voor dit deel.
- Acceptatie: inventaris met basiscommit, concrete bevindingen en beperkingen, besluiten en taakstatus; eigen branch en PR; Mac-controle voor afronding.
- Verplichte controles: GitHub-bestandslijst, bronlezing, PR-diff controleren; applicatietests niet van toepassing.
- Security: geen geheimen, persoonsgegevens of externe koppelingen; geen onafhankelijke implementatiereview claimen.
- Usage: laag ingeschat; werkelijk verbruik onbekend.
- Branch: cloud/cloud-001-documentatie-audit. PR: https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/1 .
- Resultaat: docs/ASTRA_AUDIT/INVENTARIS.md, DOCUMENT_REVIEW.md, DECISIONS.md; OWNER_ACTIONS.md en deze lijst.
- Testbewijs: bronnen op main gecontroleerd; code en tests ontbreken. Mac-controle nog niet uitgevoerd.
- Blokkade: definitieve controle door Mac wacht; dit blokkeert documentonderzoek niet.

## CLOUD-002 — Codekwaliteit en ontbrekende tests
- Waarom: aantoonbare fouten vinden vóór verder bouwen.
- Prioriteit: hoog. Status: GEBLOKKEERD. Verantwoordelijke: Cloud.
- Bestanden/eisen: nog aan te leveren code, buildconfiguratie, tests; Opper-agent FASE D.
- Instructies/afhankelijkheden: pas na beschikbaarheid code en toepasselijke documentgates; inventariseer echte testcommando's.
- Acceptatie/tests: reproduceerbare bevindingen met bestand, bewijs en testuitkomsten; geen fictieve groene status.
- Security: geen productiegegevens of secrets gebruiken.
- Usage: onbekend. Branch: bij start cloud/cloud-002-codekwaliteit. Issue/PR: geen.
- Resultaat/testbewijs: niet uitgevoerd. Blokkade: code ontbreekt; technische overdracht via Mac-agent; zie CODE_AUDIT.md.

## CLOUD-003 — Onafhankelijke beveiligingsanalyse
- Waarom: authenticatie, autorisatie en locatieprivacy beschermen.
- Prioriteit: hoog. Status: GEBLOKKEERD. Verantwoordelijke: Cloud.
- Bestanden/eisen: architectuur, code, API's, datamodel; masterprompt §14, Opper-agent FASE C/D.
- Instructies/afhankelijkheden: eerst reviewscope en daadwerkelijk onafhankelijke reviewers vastleggen.
- Acceptatie/tests: dreigingsmodel, concrete misbruikscenario's, bewijs en regressiecontroles; onafhankelijkheid eerlijk beschrijven.
- Security: geen penetratietests op externe systemen of productiegegevens.
- Usage: onbekend. Branch: bij start cloud/cloud-003-securityreview. Issue/PR: geen.
- Resultaat/testbewijs: niet uitgevoerd. Blokkade: code/architectuur ontbreken; twee onafhankelijke reviews niet uitgevoerd.

## CLOUD-004 — Testdekking en regressierisico
- Waarom: belangrijke gedragsregels en ontbrekende controles zichtbaar maken.
- Prioriteit: hoog. Status: GEBLOKKEERD. Verantwoordelijke: Cloud.
- Bestanden/eisen: code, tests, requirements; masterprompt §15.
- Instructies/afhankelijkheden: hergebruik CLOUD-002-resultaten; geen dubbele volledige audit.
- Acceptatie/tests: risico's gekoppeld aan eisen; echte testuitvoer; iPhone/simulator apart markeren.
- Security: synthetische testdata; locatiegegevens afschermen.
- Usage: onbekend. Branch: bij start cloud/cloud-004-testdekking. Issue/PR: geen.
- Resultaat/testbewijs: niet uitgevoerd. Blokkade: geen code of tests.

## CLOUD-005 — Kleine backend- en webtaken afbakenen
- Waarom: zelfstandig uitvoerbare implementatietaken voorbereiden.
- Prioriteit: normaal. Status: BACKLOG. Verantwoordelijke: Cloud.
- Bestanden/eisen: masterprompt §13–14, architectuur en code zodra beschikbaar.
- Instructies/afhankelijkheden: geen implementatiekeuzes verzinnen; pas na architectuurcontrole taken kiezen.
- Acceptatie/tests: per vervolgtaak scope, bestanden, afhankelijkheden en aantoonbare tests.
- Security: server-side autorisatie en read-only MCP eerst.
- Usage: onbekend. Branch: bij start cloud/cloud-005-backendtaken. Issue/PR: geen.
- Resultaat: voorbereidende taakinventaris in BACKEND_WEB_CANDIDATES.md; geen implementatietaken gestart.
- Testbewijs: eisen en voorgestelde acceptatie beschreven, geen code getest. Blokkade: architectuur/code niet beschikbaar; definitieve taakselectie na Mac-controle.

## CLOUD-006 — FASE B-documentaudit voltooien
- Waarom: CLOUD-001 is een eerste audit; volledige eisenkoppeling en gerichte broncorrecties blijven nodig.
- Prioriteit: hoog. Status: TER CONTROLE. Verantwoordelijke: Cloud.
- Bestanden/eisen: vier bronbestanden en CLOUD-001-resultaat; Opper-agent FASE B.
- Instructies: maak REQUIREMENTS_TRACE.md per functionele eis; code/teststatus ontbrekend; corrigeer historische procesverwijzingen gericht met behoud van historie.
- Afhankelijkheden: vervolgbranch baseren op beoordeeld CLOUD-001-resultaat of expliciet die branch gebruiken; vermijd gelijktijdige edits.
- Acceptatie/tests: alle mastereisen traceerbaar, relatieve documentlinks gecontroleerd, diff behoudt wensen; materiële keuzes apart ter besluitvorming.
- Security: fiscale claims en iOS-mogelijkheden niet als bewezen presenteren zonder actuele officiële bronnen.
- Usage: gemiddeld ingeschat; werkelijk verbruik onbekend. Branch: cloud/cloud-006-documentatie. PR: https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/2 .
- Resultaat: REQUIREMENTS_TRACE.md (123 eisen/voorwaarden), TEST_PLAN.md (21 scenario's), gerichte leeswijzers met behoud van originele broninhoud; FEASIBILITY_RESEARCH.md met 18 officiële bronnen en beperkingen, SECURITY_PRECHECK.md en CODE_AUDIT.md.
- Testbewijs: broninhoud exact behouden, ID's en interne links gecontroleerd, bestanden na opslag teruggelezen; geen app-tests uitgevoerd. Zie PROGRESS.md voor de uiteindelijke validatie.
- Blokkade: Mac-review/acceptatie open; materiële fiscale en platformkeuzes niet genomen. Branch gebaseerd op CLOUD-001, eigen PR met die branch als base; eerst PR #1 beoordelen.

## Nieuwste Access-controle en publicatiebeperking

Eigenaar bevestigt Zero Trust Free actief. Read-only API bevestigt organisatie snowy-snowflake-4760.cloudflareaccess.com; apps nog leeg, bestaande IdP type cloudflare. Hosting en exacte APP_ORIGIN opnieuw vanaf GitHub gecontroleerd: https://rittenregistratie.zsj4j2s4df.workers.dev, Workers+D1, geen eigen domein nodig voor proef. iPhone-invulvelden en veilige fallback: docs/TRANSFER/ACCESS_IPHONE_SETUP.md. Oude actie “Access activeren” is uitgevoerd; volgende eigenaaractie is app/destination/expliciete allowlist opslaan. Nog geen echte loginclaim.

Nieuwste instructie: **geen nieuwe livepublicatie zonder toestemming, geen kosten**; oudere publicatieopdracht is voor volgende releases niet voldoende. Tijdens deze taak alleen read-only Cloudflare. Zelfstandig toegevoegd: offline Access-configuratiecontrole vóór latere aansluiting,122Node-tests/type/lint PASS; geen appdeploy of accountprovisioning. Draft-GitHubwijzigingen toegestaan, main ongemoeid.

## 19 oktober2026 — zelfstandige vervolggroep naast Mac

CLOUD-005/002/004 TER CONTROLE: bestuurder van bestaande rit corrigeren met verplichte reden/audit en actieve rechten; opgeslagen serverrapport bekijken en browser-PDF/afdruk.123Node-tests/type/lint/build en uitgebreide browser PASS;81ritten/16A4pagina's/all80extra bestemmingen PASS. Nieuwe draftbranch cloud/cloud-005-report-view vanaf #15; geen nieuwe livepublicatie. Bewijs CENTRAL_REPORT_VIEW.md. ServerPDF, coherente sync/pendingqueue/detectie/backups/MCP en echte provider/hardware blijven open.

## 19 oktober2026 — samenhangende refresh

CLOUD-005/002/004: snapshotroute en transactionele UI-refresh gebouwd,127tests/type/lint/build/lokaleD1/centrale browser/geslotenAPI/PDF PASS. Geen gedeeltelijke lijst bij overschrijding. COHERENT_REFRESH.md. Cursors/auto-sync/pendingqueue en overige OPEN_WORK-taken blijven open. Geen livepublicatie.

## Vervolggroep instellingenhistorie — 19 oktober2026

CLOUD-005/002/004: centrale historie van kenteken, adressen en tarieven met reden, account-ID en voor/na gebouwd. Bestaande scoped backend hergebruikt; laatste50expliciet begrensd, oudere historie blijft bewaard. Herlezen na revocation wist de oude lijst.128Node-tests/type/lint/build PASS; echteHTTP/SQLite en centrale Chromium met drie settingsredenen en geweigerde verversing PASS, PDF16pagina's/geslotenAPI PASS. Geen livepublicatie, cloudmutatie of kosten. Vervolgcommit op draft#17, basisgroep127tests blijft afzonderlijk bewezen. Volgende: herstelbare pendingqueue/cursors, detectie/backups/MCP en overige OPEN_WORK.

## Herstelbare invoer — 19 oktober2026, niet live

CLOUD-005/002/004: opt-in IndexedDB voor exacte create-trip/create-report-aanvragen, scope uit geverifieerde viewer+vehicle, expected-viewerprecondition, transactionele compare-before-delete en contextreset bij accountwissel.129Node-tests plus echte Chromium IndexedDB/tabsluiten/responseverlies/recovery/geen duplicaat/accountwissel/stale-delete/revocation PASS; type/lint/build en bestaande centrale browser/PDF PASS. Bewijs PENDING_RECOVERY.md. Geen volledige offline-/Safari-/crashclaim; PATCH-invoer en auto-sync nog open. Backupgroep parallel afzonderlijk in nieuwe bestanden; geen productieactie. Nieuwe draftbranch cloud/cloud-005-pending-recovery vanaf #17-head9246810.

## Lokale backup/herstel — 19 oktober2026, niet live

CLOUD-005/002/004: scripts/sqlite-backup.mjs maakt consistente SQLite-backup met AES-256-GCM/authenticated versieheader en key-file buiten Git. Restore uitsluitend nieuw pad, integrity_check/foreign_key_check, geen overschrijven/symlinks.5gerichte tests PASS inclusief echt RitKompas-schema/trips/audit/rapportimmuutheid/revisieguards; lint PASS. Bewijs SQLITE_BACKUP.md. Tijdelijke plaintext onder private0700map en crash/keybeheer/Mac/remoteD1-grenzen expliciet. Eerste streamtesthang opgelost vóór afronding; volledige eerdere133suitePASS, vijfde test apartPASS. Geen productieactie/kosten. Volgende draftbranch cloud/cloud-005-local-backup op #18. Paginatie oudere historie parallel in uitvoering; root wijzigt die bestanden niet.

## Oudere historie — 19 oktober2026

CLOUD-005/002/004: keyset before-id voor rit-/settinghistorie, strikte HTTPvalidatie en UI ouderepagina/verversreset/dedupe/clearbij401/403/404.138Node-tests op afgeronde paginatiebasis/type/lint/build PASS; browser125regels/type metnieuweaudit/refresh/revocation PASS, recoverybrowser blijftPASS. Bewijs HISTORY_PAGINATION.md. Nieuwe draftbranch cloud/cloud-005-history-pages op #19-head8cf8bc2. Route-read/geometrycode staat parallel los in nieuwe bestanden, nog niet in deze historie-PR. Geen livepublicatie/cloudmutatie/kosten/mainmerge.
