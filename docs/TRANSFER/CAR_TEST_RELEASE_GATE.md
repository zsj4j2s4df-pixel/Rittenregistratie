# Naar een echte autotest — 20 oktober 2026

## Exacte ontwikkelbasis en geteste grens

PR44 head e30027ee4914af0007a5a90ae637e42dc9fbea50, tree ca55ef6e41ac16d43343cb148d1ad371bc970cf7. Opvolgende audit-upgradebranch: `cloud/cloud-002-audit-upgrade-guard`. PR43 alle20 gewijzigde blobs en PR44 alle10 gewijzigde blobs exact teruggelezen. Bestaande PR-keten behouden; geen mainmerge.

Nieuwste Cloud: Node24.19/Chromium154,249/249 Node-tests PASS, typecheck en volledige lint PASS. Productiebuild van dezelfde webcode PASS; nieuwe groep verandert alleen SQL/tests/docs. Gebouwde embedded Worker met daadwerkelijke lokale workerd/D1 PASS voor signed header/cookie, centrale ingang, create/read/exactretry, settings/correctiereceipts, review en één-tripoverzetting, forgedheader/disabled/revokedweigering. Geen externe login nagebootst als livebewijs. Migratieupgrade op gevuld SQLite vanaf schema0007 én0008 naar0015 PASS: alle bestaande tabelrijen bytegelijk, nul/NULL behouden, integrity/FKchecks en bescherming rapport/revisie/audit behouden. SQLite is geen liveD1-upgrade-/backupbewijs.

## Klaar voor beperkte handmatige webproef, na releasebesluit

De conceptwebversie ondersteunt centrale handmatige ritinvoer, correcties/geschiedenis, expliciete controle, vaste rapporten/CSV/browserPDF, periode-/bestuurdertotalen, veilige refresh, expliciete herstelbare writes en optionele Apple Kaarten-overdracht. Vooraf of achteraf stilstaand bedienen. Dit is geen automatische iPhone-ritregistratie.

Live blijft uitsluitend de goedgekeurde PR34-versie8e264bd0-62ab-48d2-a88e-9bf19d491858. Eigenaar kan inloggen en centrale voertuiggegevens lezen; screenshots bewijzen geen geslaagde ritwrite of concrete foutoorzaak. Nieuwe featurestack en schema0012–0015 niet live. Niet opnieuw eigenaar/voertuig provisionen. Historische Mac32-telling is geen actuele lege-databasegarantie.

## Verse alleen-lezen productiecontrole

20 oktober2026 03:51–03:52 UTC: CloudflareAPI200, actuele deployment nog06d17ebe-83f7-4ec3-be5d-57b713cc0c04 met versie8e264bd0-62ab-48d2-a88e-9bf19d491858 op100%. SELECT op sqlite_master en d1_migrations bevestigt0000–0007 toegepast en featuretabellen vanaf0008 ontbreken. Beide queries changes0/rows_written0/changed_dbfalse. Geen gebruikers-/ritrijen of credentials uitgelezen, geen nieuwe actuele datatelling geclaimd. Daarmee huidige migratiedelta concreet0008–0015, opnieuw vergelijken vlak vóór een goedgekeurde release. Live auditimmutabilitytriggers ontbreken nog;0015 is uitsluitend draft. GET time_travel/bookmark API200 op03:52:13 UTC bevestigt een beschikbaar huidig bookmark (waarde niet gedeeld/opgeslagen in GitHub). Dit bewijst APIbeschikbaarheid, geen restoreproef of retentiegarantie.

## Afgebakend voorstel — NIET UITGEVOERD

Publicatie uitsluitend de bestaande RitKompas-Worker en bestaande D1, met behoud van Access, vier bindings, instellingen, identiteit, andere Workers en bestaande gegevens. Geen nieuwe accounts/providers/kosten/mainmerge. Voordat eigenaar publicatie/migratie toestaat:

1. Lees actuele Workerdeployment en de echte D1-migratietabel/schema read-only terug; stop bij afwijkende gelijktijdige wijzigingen. De geïsoleerde PR34-bron heeft migraties0000–0007, maar dat bewijst niet welke migraties live werkelijk toegepast zijn.
2. Maak een herstelbaar, privé en gecontroleerd databaseherstelpunt via bestaande ondersteunde D1-mogelijkheden; lees actuele vendorinstructies, bewaar geen echte export in GitHub. Cloud heeft remoteD1-restore/retentie nog niet bewezen. Geen destructieve terugmigratie of databases vervangen.
3. Leg de werkelijk ontbrekende migraties, exacte SQLhashes, uitvoervolgorde en rollback/compatibiliteit vast.0015 blokkeert auditUPDATE/DELETE; correcties voegen events toe. Niet blind een volledige schema-import of alle migrations opnieuw uitvoeren.
4. Beoordeel exact codepakket: `/tmp/rit-pr45-candidate-payload.json`, SHA256 `9c54fb91645dbc221490390798684a4a4237a51a830f82b8f0b4ec6e1a05bd76`,48modules/23assets. Tijdelijk Cloudartefact, niet gegarandeerd beschikbaar na environmentvervanging; reproduceer vanaf vastgelegde bron met lockfile en herhaal hash/gebouwdeWorkertest. Upload is NIET uitgevoerd. Geen credentials in pakket.
5. Na afgebakende eigenaarstoestemming: gecontroleerde migraties/codepublicatie, anoniem302 en ingelogde read/write/reload/exactretry/0stand/correctie/audit/rapport/export testen met afgesproken synthetische gegevens. Geen bestaande gegevens verwijderen voor een lege test. Echte iPhone-Safari en logout/revocation apart vastleggen.
6. Bij falen stoppen; code-only rollback naar de vooraf teruggelezen versie met behoud van bindings/DB. Beoordeel oudecode-nieuwschema expliciet, geen onbewezen veilige rollbackclaim. Nieuwe audittrigger mag niet voor voortgang worden uitgezet.

Mogelijke ontbrekende feature-SQL (alleen inventaris; geen liveplan zonder stap1):

| Bestand | SHA256 |
|---|---|
| `0008_registered_devices.sql` | `42e922b4c772964a06ec7beddf3afdcfb1b47114fb0b160141c916ec16801d56` |
| `0009_detection_ingest.sql` | `a46b2614c9b5649970d995a1e2149f066ca914481edaf183ce225f6f54b02a66` |
| `0010_vehicle_journeys.sql` | `e3a728b5b198eb248f5af13bb93da72b514abfe0ebcdca800ec6ed57261e7d28` |
| `0011_journey_choices.sql` | `566de6b5179feebb3804d010abb51f6f35d9ca662fd09a44a579247b10370e31` |
| `0012_journey_materialization.sql` | `ad70c27290fed0b4be4d210e0c065784df199e1c96d561a98181d1931c884b3b` |
| `0013_trip_review_receipts.sql` | `c0a4ad61217635b9418892fcfeacbcea1b73ce42aad1d08eeb6cf2f9239685ec` |
| `0014_mutation_recovery_receipts.sql` | `d8864685a92842951d8e202fe9a7f93844e312e8b9073af643f3683836cd1821` |
| `0015_immutable_audit_history.sql` | `704c53d3041c8a1706fb017473f2c0ba6f424430354a86824b4734920b275010` |

## Mac-opdracht: native autotest blokkades oplossen

Lees deze branch plus `NATIVE_CHOICE_QUEUE.md`, `MAC_NATIVE_VALIDATION.md` en `MAC_HARDWARE_TESTS.md`; geen tweede documentaudit/hardwareonderzoek. Controleer eerst bestaande Xcode/iOSSDK/XCTest zonder installatie. Laatste Macbewijs heeft alleen CommandLineTools en geen XCTest; Cloud heeft geen Swift/iOSSDK. Vraag eigenaar als grote installatie nodig is. Compileer de nieuwste queue/crypto/UserNotificationsbron werkelijk: oud Corebewijs van PR30 geldt hiervoor niet.

Integreer in de echte apphost (nu ontbrekend): geverifieerde native SessionAccess én ChoiceSessionBinding uit dezelfde aanmelding; geen fake viewer/service-token of cookies kopiëren/loggen. Host/delegate registreert actuele servercontext vóór melding, bewaart acties duurzaam, verstuurt dezelfde requestID en wist pas bij passende receipt. Bouw lokale permission/capture/lifecycle-integratie met expliciete gebruikerskeuze en onbekende GPSgaten behouden. Huidige PreparationView meet/verstuurt geen GPS. Geen werking suggereren door alleen protocol/defaultdenybron.

Lever bronfixes/tests op eigen opvolgende draftbranch vanaf deze exacte ontwikkelketen. Geen afzonderlijke oude basis of mainmerge. Rapporteer echte SDK/Swiftversie, build/XCTest/simulator PASS/FAIL/NIETGETEST, geen token/claim/locatiegegevens. Signing/TestFlight/AppStore en externe koppelingen vereisen apart akkoord indien nodig; geen Appleaccount of abonnement openen.

Daarna fysieke proeven MAC-J01–J12: gemiste/dubbele/late meldingen, Focus/lock/forcequit/restart, twee-minutenklantstop versus verkeer, EV zonder RPM, netwerkverlies, accountwisseling/dedup, batterij en echte bestuurder los van CarPlaywinnaar. Alleen aanwezige toegestane hardware; niets kopen. AppleMaps unified URL volgens fabrikant iOS18.4+; echte appopening nog NIETGETEST. Geen fysieke uitvoering of automatische Macontvangst bewezen vanuit deze Cloudrun.

## Wat de eigenaar moet doen

Mac de native build-/hostopdracht laten uitvoeren en, zodra exact database-/rollbackpakket beoordeeld is, expliciet beslissen over die nieuwe beperkte release/migraties. Voor automatische autotest zijn beide nodig. Ontbrekende hardwareproeven, onafhankelijke identiteit/securityreview en fiscale acceptatie blijven zichtbaar; niet alle123REQ/M27 als klaar markeren. Er is geen nieuwe productiehandeling geautoriseerd door alleen dit voorstel.
