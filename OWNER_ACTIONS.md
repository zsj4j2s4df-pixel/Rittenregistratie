# Persoonlijke acties

Laatste controle: 18 oktober 2026.
Bron: OWNER_ACTIONS_ASTRA_AANVULLING.md, inclusief nieuwste Sol-rolverdeling.
Bij de nulmeting bestond dit bestand niet; er zijn geen bestaande ACT-nummers overschreven.
Alleen noodzakelijke persoonlijke handelingen horen hier. Technische taken en modelrouting staan in CLOUD_TASKS.md.
Geen geheimen, aankopen of koppelingen opnemen als reeds goedgekeurd zonder expliciet besluit.

## Nu
ACT-002: de eigenaar heeft de main-ruleset handmatig ingesteld. De drie gevraagde regels zijn via de GitHub-API bevestigd. Onafhankelijke eigenaarcontrole blijft open omdat agent en eigenaar dezelfde GitHub-identiteit gebruiken en geen goedkeurende review vereist is. Geen herhaling van de handmatige instelling gevraagd. Geen nieuwe aankopen of koppelingen aangegaan.

## Nummerconflict en historie

Cloud gebruikte ACT-001 voor codeoverdracht; Mac gebruikte zelfstandig ACT-001 voor toestelinventarisatie. Beide originele nummers blijven behouden met broncontext: deze lijst bevat Cloud ACT-001; [Mac ACT-001](docs/MAC_SNAPSHOT_2026-10-18/OWNER_ACTIONS.md) is de afgeronde eerste inventarisatie van iPhone 11 Pro en nieuwere toestellen. Geen taak stil overschreven of opnieuw aan jou gevraagd.

## ACT-002 — Technische eigenaarcontrole op GitHub vastleggen

### Actuele deelstatus — 18 oktober 2026, na bevestiging eigenaar

- **Handmatige instelling: AFGEROND.** De eigenaar bevestigt dat hij via Safari op zijn iPhone de ruleset heeft aangemaakt.
- **Technische controle van de drie gevraagde regels: AFGEROND via read-only API-inzage.** Ruleset `25339571`, “RitKompas - bescherm main”, is `active`, target `branch`, omvat `~DEFAULT_BRANCH` zonder uitsluitingen; de repositorymetadata bevestigt dat de default branch `main` is. Regels: `pull_request`, `deletion`, `non_fast_forward`. Geen bypass-actoren; `current_user_can_bypass: never`.
- **Identiteit gecontroleerd: NIET GESCHEIDEN.** De geauthenticeerde connector-login is `zsj4j2s4df-pixel`, dezelfde eigenaar en PR-auteur als in de repository. Geen andere identiteit aangemaakt of gekoppeld.
- **Onafhankelijke eigenaargoedkeuring: OPEN.** `required_approving_review_count: 0`, geen verplichte reviewers, geen code-owner-review of last-push-approval. De PR-verplichting dwingt dus geen afzonderlijke menselijke goedkeuring af. Geen merge-/verwijder-/forcepush-test uitgevoerd om dit te bewijzen; er is niets aan main gewijzigd.
- **Overkoepelende status: WACHT OP AGENT** voor een onderbouwd inrichtingsvoorstel voor gescheiden bevoegdheden; niet opnieuw wachten op de al uitgevoerde instelling. Een nieuwe account/koppeling of bevoegdheidswijziging vereist eerst toestemming. Tot die tijd beslist uitsluitend de eigenaar over merges en blijven nieuwe agent-PR's draft.
- **Bewijs:** [MAIN_SECURITY_CHECK.md](docs/TRANSFER/MAIN_SECURITY_CHECK.md). De eerdere PR-creditblokkade is opgelost; draft-PR #4 is via dezelfde GitHub-tool aangemaakt. De historische beperking is niet omzeild. Geen hoofdbranch gewijzigd.

### Historie vóór de actuele instelling

- **Waarom persoonlijk:** de connector kan code schrijven, maar branch-protectioninspectie geeft 403; de browser is niet ingelogd. De huidige connector maakt PR's onder jouw eigen GitHub-account. Een auteur kan zijn eigen PR niet als onafhankelijke reviewer goedkeuren; CODEOWNERS alleen lost dit niet op.
- **Vooronderzoek:** repository is public, adminrechten vermeld; rulesetlijst leeg. Geen instellingen gewijzigd of toegangsrechten uitgebreid. Zie CLOUD_HANDOVER voor officiële GitHub-bronnen.
- **Prioriteit:** hoog, vóór main-merge; geen deadline. De veilige branch-overdracht kan doorgaan.
- **Kosten:** geen aankoop voorgesteld; openbare repositories ondersteunen branch protection volgens GitHub. Eventuele andere identiteit/organisatie of planwijziging eerst onderzoeken, niet automatisch activeren.
- **Bestaand alternatief:** laat alle agent-PR's draft/open staan en voeg uitsluitend zelf handmatig samen na controle. Dit is procedureel, niet technisch eigenaaronderscheid zolang dezelfde identiteit wordt gebruikt.
- **Verantwoordelijke:** projecteigenaar; Cloud/Operator documenteert en Tool Scout onderzoekt inrichting.
- **Status:** WACHT OP OPDRACHTGEVER.
- **Stap:** open de repository → Settings → Rules/Branches in je ingelogde GitHub-account. Controleer bescherming van main en bepaal de reviewidentiteit. Laat ons weten of je zelf de bescherming wilt instellen of via een ingelogde beheersessie wilt laten configureren. Deel geen wachtwoord of token. Geef agents geen bypass om een review-eis te omzeilen.
- **Gewenste verificatie:** main vereist PR's, blokkeert force pushes/verwijderen en passende reviews; een test toont dat de agent niet zelfstandig kan mergen. Bij dezelfde identiteit blijft technische eigenaaronderscheiding onbewezen; een afzonderlijke beperkt bevoegde agentidentiteit vraagt jouw expliciete toestemming.
- **Laatste controle:** 18 oktober 2026; besluit HANDOVER-002 in docs/ASTRA_AUDIT/DECISIONS.md.

## ACT-001 — Bestaande appcode beschikbaar laten maken
- Waarom persoonlijk: de Mac-agent is afwezig en deze Cloud-sessie kan de MacBook-map niet inspecteren. De gecontroleerde GitHub-main bevat alleen vier documenten.
- Prioriteit: nodig vóór code-audit en appontwikkeling; geen deadline vastgesteld.
- Kosten: geen aanschaf vereist; bestaande GitHub-repository gebruiken.
- Gratis/bestaand alternatief: wachten op Mac-agent, die lokale code en wijzigingen controleert en veilig via Git aanlevert.
- Verantwoordelijke: Mac-agent; Cloud hervat controle na beschikbaarstelling.
- Status: VERVALLEN.
- Concrete stappen: bij terugkeer controleert Mac de juiste projectmap, remote en lokale wijzigingen; controleert op geheimen en persoonsgegevens; levert bestaande code zonder overschrijven via een eigen branch/PR aan.
- Controle: verwachte broncode, configuratie en eventuele tests zichtbaar in GitHub; Cloud controleert commit en bestandslijst.
- Laatste controle: 18 oktober 2026.
- Besluitverwijzing: docs/ASTRA_AUDIT/DECISIONS.md.
- Correctie CLOUD-006: dit blijkt een technische overdrachtstaak voor de Mac-agent, geen noodzakelijke persoonlijke actie. ACT-001 blijft als historie behouden; werk en blokkade volgen CLOUD-002/003/004. Geen handeling van Jesse gevraagd.
- Geen wachtwoorden, tokens, sleutels of echte ritgegevens uploaden.
