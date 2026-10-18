# Cloud-taken — RitKompas

## Actuele regie en status — 18 oktober 2026

**Cloud is hoofdontwikkelaar, Mac ondersteunt lokale/iOS/hardwaretaken, eigenaar beslist over belangrijke handelingen.** Deze nieuwe expliciete opdracht vervangt de oudere Mac-hoofdrol hieronder. GitHub is centraal. Sol indien beschikbaar; Astra uitsluitend belangrijke besluiten. Geen extra betaalde diensten/runs, geen main-merge zonder eigenaar. Eén samenhangende run heeft voorkeur.

| Taak | Actuele status / vervolgstap |
|---|---|
| CLOUD-001 | TER CONTROLE — PR #1 behouden; documentstructuur door Mac bekeken, geen merge/volledige inhoudelijke acceptatie |
| CLOUD-006 | TER CONTROLE — PR #2 afhankelijk van #1; 123 REQ-ID's/21 scenario's behouden, actuele codebasis nu aangeleverd |
| CLOUD-002 / CLOUD-004 | IN UITVOERING — gerichte integriteitsreparatie en regressies na geslaagde smoke; geen live migratie |
| CLOUD-003 | KLAAR VOOR CLOUD na CLOUD-008 — gerichte securityreview; onafhankelijkheid alleen claimen bij echte tweede uitvoering |
| CLOUD-005 | BACKLOG — afbakenen na codecontrole; geen nieuwe app genereren |
| CLOUD-007 | IN UITVOERING — veilige Mac→GitHub-overdracht op handover/mac-to-cloud-20261018, base cloud/cloud-006-documentatie |
| CLOUD-008 | TER CONTROLE — 32/32 tests, typecheck/lint/build PASS; draft-PR #4; eerdere omgevingblokkades opgelost |

### Actuele uitvoering na omgevingsherstel

Draft-PR #4: https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/4 . Bestaande lockfile-dependencies geïnstalleerd; supply-chaincontrole, typecheck, lint en build PASS. Eerdere credit-/proxy-/installatiefouten hieronder zijn historie. ACT-002 technisch gecontroleerd; eigenaaridentiteit nog gedeeld. RESUME is het actuele hervatpunt.

### CLOUD-007 — Veilige overdracht

Eigenaar: Mac, controle Cloud/projecteigenaar. Prioriteit hoog; usage onbekend. Scope: bestaande code/config/tests/docs, gescheiden Mac-snapshot, veilige placeholder, besturing en privacycontrole. Acceptatie: secretscan/diff, behoud PR-voorouders, tests, remote terugleesbewijs en eigen draft-PR. Geen merge, betaalde dienst, privéfoto of runtime-data. Resultaat/bewijs: docs/TRANSFER en DEVELOPMENT_PROGRESS. Open: technische eigenaarcontrole ACT-002, Cloud-proef.

### CLOUD-008 — Echte Cloud-overdrachtstest

Eigenaar: bestaande Cloud agent, dagelijks beschikbaar model (Sol voorkeur, selectie niet verondersteld). Prioriteit hoog; usage onbekend, één gecombineerde run zonder nieuwe betaalde omgeving. Scope: branch lezen, tests draaien, kleine CSV-regressietest voor tellerstanden inclusief nul en toelichting toevoegen, commit/PR, voortgang/hervatpunt. Branch: cloud/cloud-008-handover-smoke, base handover/mac-to-cloud-20261018. Acceptatie: concrete commit, testuitvoer, terugleesbaar bestand en PR; ontbrekende runtime/installatiebevoegdheid expliciet NIET GETEST. Geen nieuw framework, geen secrets/productiedata en geen merge. Daarna veilige CLOUD-002/004-groep indien ruimte/toegang, met afzonderlijk commitbewijs.

Uitgevoerd op overdrachtscommit `8b50e9109b51770f6cf4d0eec25eac38c17e4b76`. Resultaat en exacte runtime/beperkingen: [CLOUD_PROOF](docs/TRANSFER/CLOUD_PROOF.md). Baseline 31/31; na één nieuwe CSV-regressietest 32/32, met `--test-isolation=none`. Projectdependencies ontbreken en lockfile-installatie faalt bij registrymetadata; geen Cloud-type/lint/build-PASS. ACT-002 blijft open; eigenaarcontrole en draft-PR behouden. Geen model-/sessiemigratie of extra betaalde run.

**Actueel opleverpunt:** de zeven smoke-bestanden staan op GitHub-commit `1830e7efd7d08553ad5b44864b18833fa906d3a0` en zijn exact teruggelezen. PR-aanmaak is niet uitgevoerd: automatische goedkeuringscontrole meldt workspacecredits op. Er is dus nog geen CLOUD-008-PR-nummer. Geen alternatieve schrijfroute gebruikt. Deze actualisatie, ACT-002-resultaat en gerichte CLOUD-002/004-voorbereiding zijn lokaal/pending upload, geen reeds gepubliceerde status.

**ACT-002-controle:** eigenaarinstelling uitgevoerd; actieve main-ruleset 25339571 bevestigt PR-verplichting, verwijder- en forcepushblokkade. Connectoridentiteit gelijk aan eigenaar en nul verplichte approvals; onafhankelijke eigenaarcontrole blijft open. Zie [beveiligingsbewijs](docs/TRANSFER/MAIN_SECURITY_CHECK.md).

**Volgende groep:** [CLOUD-002/004-voorbereiding](docs/TRANSFER/CLOUD_002_004_PREPARATION.md), nog geen afgeronde codekwaliteitgate. Eerst usage-/goedkeuringsblokkade oplossen en pending documenten via goedgekeurde GitHub-tools publiceren; vervolgens gerichte schema-/auth-/integratietests en dependencychecks, zonder nieuwe kosten/accounts of main-merge.

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
