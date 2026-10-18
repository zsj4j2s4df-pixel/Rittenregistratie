# CLOUD-002/004 — gerichte voorbereiding na de Cloud-smoketest

18 oktober 2026. Eigen controle, geen onafhankelijke securityreview. Bestaande code en Mac-mapping hergebruikt; geen nieuwe volledige documentaudit. Nog geen afgeronde codekwaliteit-/testdekkinggate.

## Werkelijk gemeten

Na de 32/32 geslaagde tests is één gerichte coveragerun uitgevoerd:

```sh
node --experimental-strip-types --test --test-isolation=none \
  --experimental-test-coverage tests/*.test.mjs
```

Uitkomst: **32 tests, 32 pass, 0 fail, 0 skipped**.

| Geladen productmodule | Lijnen | Branches | Functies |
|---|---:|---:|---:|
| app/trip-domain.ts | 100,00% | 92,96% | 100,00% |
| app/trip-utils.ts | 100,00% | 100,00% | 100,00% |
| lib/access-policy.ts | 100,00% | 100,00% | 100,00% |
| Alleen deze gemeten modules samen | 100,00% | 96,06% | 100,00% |

Dit is uitdrukkelijk **geen 100% appdekking**: React-schermen, authhelper, Drizzle-schema, Cloudflare-binding, browsergedrag en native iOS ontbreken in deze meting. De SQLite-migratie wordt door de bestaande tests uitgevoerd; dat is geen API-, opslag- of integratieacceptatie. [Ruwe uitvoer](CLOUD002004_COVERAGE.txt).

## Concrete volgende controles

| Prioriteit | Code/bestaand bewijs | Gat/risico | Veilige vervolgtaak en acceptatie |
|---|---|---|---|
| Hoog vóór backend | app/chatgpt-auth.ts; lib/access-policy.ts; T-03/19, REQ-093/094 | Headerhelper is ongebruikt en verifieert zelf geen vertrouwde upstream; policykernel neemt principal/membership als argument aan. Geen aangesloten serverauth. | Kies pas met onderbouwde provider-/vertrouwensgrens een serverpad; negatieve API-tests voor ontbrekende/vervalste/verlopen sessie en objectrechten. Niet als beveiligde backend publiceren. |
| Hoog vóór duurzame opslag | db/schema.ts; drizzle/0000_medical_maestro.sql; T-19, REQ-100/101 | TypeScript-enums zijn geen SQL CHECK-constraints. Test hieronder toont acceptatie van ongeldige classificatie, negatieve afstand en omgekeerde tijden. | Bestaande schema-/migratiegeschiedenis behouden; gerichte nieuwe niet-destructieve migratie/validatie ontwerpen en met in-memory schemafouten testen. Geen live migratie uitgevoerd. |
| Hoog vóór opslag/sync | demoReducer en browserstate; T-03/08/20 | Lokale revisie/before-after is geen transactionele serveraudit of multi-user-conflictcontrole. | Servertransactie koppelt mutatie/audit; parallelle stale updates mogen geen gegevens verliezen. Afhankelijk van server/storagekeuze, zonder nieuwe dienst nu. |
| Normaal | trip-domain.ts; T-08/11/12 | Line coverage is compleet maar branches 92,96%; ontbrekende grensgevallen zoals maximale tekstlengtes en gecombineerde ontbrekende standen gericht nalopen. | Tests afleiden uit eisen/gedrag, geen regels spiegelen alleen om percentage te verhogen. |
| Hoog vóór rapportacceptatie | trip-utils.ts; T-12; REQ-049/052 | CSV is expliciet demo; geen kentekeninstelling, PDF, tariefhistorie of fiscale volledigheid. Nieuwe regressie bewijst alleen exact CSV-escaping/nulbehoud. | Exportkeuzes/validatie en historisch rapportmodel gefaseerd uitbreiden; echte spreadsheet-/PDF-inspectie later uitvoeren. |
| Normaal vóór UI-gereed | app/page.tsx/trip-editor.tsx; T-10/13/15 | Nog geen Cloud-browserbewijs voor filters/correctie/thema/a11y. | Na dependencies: typecheck/lint/build, browserflows op beide thema's, toetsenbord en kleine schermen. |

## Reproduceerbare schema-observatie

Uitsluitend Node `DatabaseSync(':memory:')`, `PRAGMA foreign_keys=ON` en de bestaande SQL-migratie. Synthetische user/vehicle met geldige foreign keys ingevoegd; daarna een trip met classificatie `not-a-classification`, start `200`, einde `100`, afstand `-1`. De bestaande database accepteerde de rij. Geen productie-DB of echte ritdata gebruikt.

Dit is een bevestigde schemabeperking, geen bewijs van een exploiteerbare productie-API (die is niet aangesloten). Geen test met blijvende ongeldige data of destructieve reparatie toegevoegd.

## Stop- en hervatpunt

Smoketestcode/bewijs staat al op GitHub-commit `1830e7efd7d08553ad5b44864b18833fa906d3a0`. De automatische goedkeuringscontrole kon de draft-PR niet aanmaken wegens workspacecredits; geen alternatieve route gebruikt. Daarom geen volgende implementatiegroep gestart die niet volgens afspraak op GitHub kan worden opgeleverd.

Eerst de goedkeurings-/usageblokkade oplossen; daarna draft-PR aanmaken tegen `handover/mac-to-cloud-20261018`, pending ACT-002/progressbijwerkingen publiceren met controle van de actuele branch-head. De bestaande opvolgcommit `5874bc3` op de overdrachtsbranch voegt alleen GITHUB_PROOF.md toe en moet behouden blijven. Daarna gerichte CLOUD-002/004-tests/verbeteringen, dependencies herstellen via ondersteunde netwerktoegang en pas vervolgens CLOUD-005. Geen main-merge, nieuwe accounts, betalingen of productie.
