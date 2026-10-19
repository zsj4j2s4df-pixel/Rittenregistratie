# Volledige overdracht RitKompas naar Codex Cloud

> **Nieuwste livecontrole 19 oktober:** Access-runtimebindings en uitsluitend eigenaar/voertuigrecht met toestemming ingericht. Anoniem gesloten, maar ingelogde backend blijft weigeren. [Bewijs/gerichte opvolging](docs/TRANSFER/OWNER_ACCESS_RESULT_2026-10-19.md). Niet opnieuw provisionen of succesvolle login claimen. Geen nieuwe code/migraties gepubliceerd; verdere live codewijziging vraagt toestemming. Parallel CloudPR31 behouden.

> **Laatste gezamenlijke checkpoint:** Cloud bevestigt PR27 en levert PR28/29; Macretourproef [MAC_CLOUD_ACK_RESULT](docs/TRANSFER/MAC_CLOUD_ACK_RESULT.md) is PASS via GitHub. De eigen MacPR30 staat na integratie boven CloudPR29.197Node-tests/type/lint/build op geïntegreerde versie PASS, SwiftCoretypecheck/build bewezen; iOS/XCTest/hardware blijven open. Directe Cloud→Mac-threadsturing ontbreekt, GitHubtaken vormen het werkende retourkanaal. Oudere pending-ontvangsttekst hieronder is ingehaald.

> **Actueel 19 oktober 2026:** codeketen bestaat tot PR #26; PR #27 is integraal opgenomen en gekoppeld aan [uitvoerbare vervolgtaken](docs/TRANSFER/PR27_EXECUTION_PLAN.md). [Mac-controle](docs/TRANSFER/MAC_NATIVE_VALIDATION.md) bewijst Coretypecheck/build en187Node-tests, geen iPhone/XCTest. [Zero Trust](docs/TRANSFER/MAC_ZERO_TRUST_2026-10-19.md) is met specifieke toestemming ingesteld; backend blijft gesloten tot apart goedgekeurde aansluiting. [Directe Cloud-opdracht](docs/TRANSFER/MAC_CLOUD_CHANNEL_TEST.md) is geregistreerd; agentontvangst/retoursturing nog niet bevestigd. Oudere ontbrekende-code-/geenAccess-/31tests-zinnen hieronder zijn historische overdrachtstatus.

> Actuele Cloud-update: draft-PR’s #4–#13 bevatten aanvullende implementatie,111tests/type/lint/build/lokaleD1 PASS. Zie RESUME.md en docs/TRANSFER/SETTINGS_STORAGE.md. Onderstaande31tests/7tabellen en eerdere toegangsblokkades beschrijven de oorspronkelijke overdracht, niet de nieuwste code. Web blijft demo; geen productie of native oplevering.

Datum: 18 oktober 2026. Repository: `zsj4j2s4df-pixel/Rittenregistratie`. Status: overdracht ter controle; pas compleet na geverifieerde upload, Cloud-proef en vastgelegde eigenaarcontrole. Geen automatische merge.

## 1. Werking

RitKompas moet native iPhone-rittenregistratie, webbeheer en één beveiligde backend krijgen. Nu bestaat een lokaal webprototype met synthetische ritten en tijdelijke browserstate. Classificatie/ritcorrectie werken alleen in die sessie; herladen wist wijzigingen. Routes zijn illustraties, geen GPS-metingen. Geen fiscaal goedgekeurde registratie. Databasecode en beleidsfuncties zijn voorbereid, niet als server aangesloten.

## 2. Onderdelen

| Pad | Inhoud |
|---|---|
| app/ | React-interface, ritcorrectie, domeincontroles, CSV, ongebruikte authhelper |
| lib/access-policy.ts | Losse geteste voertuigtoegangs- en detectiebeleidskern |
| db/, drizzle/ | Drizzle-schema en bestaande SQL-migratie; 7 tabellen |
| tests/ | 31 Node-tests voor domein, CSV, beleid en SQLite-migratie |
| public/ | Eigen placeholder en favicon; privéfoto uitgesloten |
| docs/ASTRA_AUDIT/ | Bestaande Cloud-audits, 123 eisen, 21 testscenario's, securityvoorcontrole |
| docs/MAC_SNAPSHOT_2026-10-18/ | Afzonderlijk behouden Mac-documenten, README en actielijst; lokale projectpaden geredigeerd |
| bronnen/ | Eerdere Mac-bronsnapshot; root-masterprompt is actueler |
| docs/TRANSFER/ | Inventaris, privacyselectie, controles en later Cloud-proefbewijs |
| AGENTS.md, RESUME.md, CLOUD_TASKS.md | Actuele besturing, hervatpunt, taken |

Geen Swift-, Xcode- of native iPhone-project aangetroffen. Swift CLI was lokaal aanwezig, Xcode.app niet op het gecontroleerde standaardpad. Dat is geen iOS-buildbewijs.

## 3. Klaar binnen demo-scope

Interface, twee thema's, demo-classificatie/correctie, veldvalidatie, tijdelijke wijzigingsgeschiedenis, filters, expliciet gemarkeerde CSV met ontsnapping van quotes/formules; tests voor ontbrekende/ongeldige waarden, revisieconflict, onzekere bestuurder en tijdoverlap. Geen claim dat heel T-03/T-07/T-12 daardoor geaccepteerd is.

## 4. Ontbreekt

Native client en achtergrondregistratie; accounts/sessieverificatie/serverrechten; opslag/sync; echte kaarten; centrale deduplicatie; complete instellingen/adressen/tarieven; PDF en fiscale verificatie; MCP/OAuth; back-ups/herstel; onafhankelijke reviews; volledige visuele/hardwaretests. Zie bestaand eisenregister; geen functionaliteit schrappen.

## 5. Bouwen en testen

Aanbevolen Node 24, pnpm passend bij lockfile v9. Controleer runtime, bestaande tools en netwerk vóór installeren. Er is geen secret nodig voor unit-tests of lokale demo.

```sh
node --version
node --experimental-strip-types --test tests/*.test.mjs
# Alleen in toegestane geïsoleerde ontwikkelomgeving, niet stil op de Mac:
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm lint
pnpm build
```

Gebruik bestaande dependencies indien beschikbaar. `node:sqlite` wordt uitsluitend met `:memory:` gebruikt in tests. Bouw bevat Vinext/Cloudflare/Sites-devplugins; lockfile en scripts meenemen. Package-registrybeschikbaarheid in Cloud nog afzonderlijk bewijzen. `next-env.d.ts` is gegenereerd en niet noodzakelijk voor pure tests. Geen productiepush of databasebinding aanmaken om tests groen te krijgen.

## 6. Tools en diensten

GitHub lezen/schrijven via gekoppelde connector is bewezen. CLI Git voor read-only clone en lokale commits beschikbaar. Bestaande Cloud-sessie heet **Cloud agent**; geen nieuwe agentorganisatie of sessie gemigreerd. Cloudflare/D1-binding in config is placeholder, geen dienstbewijs. Apple, kaartprovider, MCP/Copilot, authprovider, hosting en domein zijn nog geen aangesloten productiediensten.

## 7. Ontbrekende toegang en bescherming

Branch-protection API gaf 403 voor deze integratie; rulesetlijst was leeg. In-app GitHub-browser was niet aangemeld, dus geen instelling gewijzigd. Repository is openbaar. Foto's en gevoelige gegevens daarom uitgesloten. Publicatie van veilige projectbroncode is expliciet opgedragen; productiepublicatie niet.

PR's worden door de huidige connector onder het eigenaarsaccount aangemaakt. GitHub kan menselijke eigenaar en agent met dezelfde identiteit niet als twee reviewers onderscheiden; de auteur kan de eigen PR niet goedkeuren. CODEOWNERS is alleen een basis, geen zelfstandige afdwinging. Tot passende bescherming/identiteit bewezen is: draft-PR's, geen merge door agents, eigenaar beslist; technisch afdwingbare eigenaargoedkeuring **NIET BEVESTIGD**. Zie OWNER_ACTIONS ACT-002.

## 8. Cloud zelfstandig

Code/tests/docs/fixes op eigen branches, eigen commits en PR's, voortgang en hervatpunt bijwerken. Cloud hoofdverantwoordelijk; Sol dagelijks indien selecteerbaar; Astra alleen zware besluiten. Bundel samenhangend werk, test/commit per taakgroep en ga verder tot echte blokkade. Geen kosten, productie, gevoelige koppeling, gegevensdeling, scopewijziging, beveiligingsuitschakeling, destructieve operatie of main-merge zonder eigenaarstoestemming. Zie AGENTS.md.

## 9. Mac-verantwoordelijkheid

Lokale builds en debugging, Xcode/iOS-simulator wanneer aanwezig/toegestaan, code signing met gebruikerstoegang, echte iPhone/Jeep/Bluetooth/CarPlay/OBD2-tests. Oudste opgegeven toestel: iPhone 11 Pro, iOS 26.6.2 volgens gebruiker; nieuwere modellen doel, niet getest. De Mac-map is bewaard maar wordt niet automatisch gesynchroniseerd; werk voortaan vanaf GitHub-branches, geen twee concurrerende hoofdversies.

## 10. Eerstvolgende taak en PR-keten

CLOUD-008: één kleine Cloud-overdrachtstest volgens RESUME, op eigen branch vanaf de overdrachtsbranch. Code lezen, Node-tests uitvoeren, een relevante CSV-regressietest toevoegen, commit/PR en voortgang. Daarna CLOUD-002/004 bundelen, geen dubbele documenten-audit. PR #1 heeft base main; #2 base CLOUD-001; overdrachts-PR krijgt base CLOUD-006. Geen PR gesloten, gemerged of geretarget. Na eigenaarmerge van voorgangers pas bases bewust opnieuw controleren.

## Cloudmogelijkheden — bronnen versus bewijs

Officiële documentatie noemt geïsoleerde Cloudwerkruimtes, repository-toegang en hervatten via web/mobiel. Persoonlijke Mac-skills worden niet automatisch gesynchroniseerd; browser/computer use is volgens deze Cloudpagina nog beperkt. Dit bewijst niet welke functies/accountinstellingen in onze bestaande sessie werken. [Cloud environments](https://learn.chatgpt.com/docs/environments/cloud-environments), geraadpleegd 18-10-2026.

Modeltoegang verschilt per product en account; een lokaal selecteerbare modelnaam is geen bewijs van Cloudselectie. Sol/Astra blijven voorkeuren, geen ingestelde routing. [Workspace model availability](https://learn.chatgpt.com/docs/enterprise/workspace-model-availability), geraadpleegd 18-10-2026.

De GitHub-identiteitsbeperking volgt uit [Approving a pull request with required reviews](https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/approving-a-pull-request-with-required-reviews). Beschermingsopties: [Managing protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches). Raadpleegdatum 18-10-2026. Geen automatische overdracht van accounts, settings of agents geclaimd.
