# Main-beveiliging — read-only gecontroleerd

> **Actuele aanvulling, 18 oktober 2026:** omgevingsherstel bevestigd. Dependencyinstallatie met ongewijzigde lockfile en supply-chaincontrole PASS; 32/32 tests, TypeScript, lint en webbuild PASS. Draft-PR #4 is aangemaakt. Oudere proxy-/credits-/NIET GETEST-vermeldingen hieronder blijven historie van eerdere pogingen. Geen main-merge, nieuwe account of productiepublicatie.

18 oktober 2026, Europe/Amsterdam. Eigenaar heeft de handmatige instelling bevestigd; dit rapport beschrijft de vervolgens waargenomen technische configuratie. Geen instellingen gewijzigd en geen verboden push/merge/verwijdering getest.

## API-bewijs

- Repositorymetadata: `default_branch: main`, eigenaar `zsj4j2s4df-pixel`.
- `GET /repos/zsj4j2s4df-pixel/Rittenregistratie/rulesets`: actieve ruleset gevonden.
- `GET /repos/zsj4j2s4df-pixel/Rittenregistratie/rulesets/25339571`: naam **RitKompas - bescherm main**, enforcement **active**, target **branch**.
- Voorwaarde: include **~DEFAULT_BRANCH**, exclude **[]**. De regel geldt dus voor de huidige default branch main.
- Regels: **pull_request**, **deletion**, **non_fast_forward**. Dit bevestigt de gevraagde PR-verplichting, blokkade op verwijderen en blokkade op force pushes.
- `bypass_actors: []`, `current_user_can_bypass: never`.
- [Ruleset op GitHub](https://github.com/zsj4j2s4df-pixel/Rittenregistratie/rules/25339571).

De connector staat het alternatieve `/rules/branches/main`-endpoint niet toe (400). Het ondersteunde detailendpoint hierboven gaf wel de actieve voorwaarden en regels terug; geen eerdere 403/lege lijst als actuele status herhaald.

## Identiteit en resterende eigenaarcontrole

De geauthenticeerde connector meldt login **zsj4j2s4df-pixel**, id **296047649**. Dit is dezelfde identiteit als de repository-eigenaar en de auteurs van PR #1–#3. Identiteitsscheiding is dus **niet aanwezig**.

De ruleset heeft `required_approving_review_count: 0`, `required_reviewers: []`, `require_code_owner_review: false` en `require_last_push_approval: false`. PR's zijn verplicht, maar afzonderlijke menselijke goedkeuring wordt daarmee niet technisch afgedwongen. Geen claim dat de agent hierdoor niet zelfstandig zou kunnen mergen. De bindende projectinstructie blijft: **nooit merge naar main zonder expliciete toestemming van de eigenaar**.

Geen beveiligingsregel gewijzigd, geen bypass aangevraagd en geen andere identiteit/account/koppeling gestart. ACT-002 is opgesplitst: handmatige instelling AFGEROND, controle van de drie gevraagde regels AFGEROND, onafhankelijk eigenaaronderscheid OPEN.

## PR-status tijdens controle

Alle bestaande PR's gelezen: #1 open tegen main; #2 open tegen CLOUD-001; #3 draft/open tegen CLOUD-006. Geen eerdere PR omgezet, geretarget of samengevoegd. PR #3-head is inmiddels `5874bc3364171e03fcf9e7404451c86f98d6fd9a`, één aanvulling met `docs/TRANSFER/GITHUB_PROOF.md` boven de exact geteste broncommit. Die aanvulling bevat geen appcodewijziging.

CLOUD-008-branch staat remote op `1830e7efd7d08553ad5b44864b18833fa906d3a0`; alle zeven gepubliceerde gewijzigde bestanden zijn exact teruggelezen. De draft-PR-aanmaak is niet uitgevoerd: automatische goedkeuringscontrole meldde “Your workspace is out of credits. Add credits to continue.” Dit is een reviewfout, geen beoordeling dat de actie onveilig is. Niet via CLI/andere tool alsnog dezelfde PR aangemaakt. Dit beveiligingsrapport en de nieuwe ACT-002-status zijn daarom vooralsnog lokaal, met patch voor later hervatten.
