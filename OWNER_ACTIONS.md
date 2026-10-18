# Persoonlijke acties

Laatste controle: 18 oktober 2026.
Bron: OWNER_ACTIONS_ASTRA_AANVULLING.md, inclusief nieuwste Sol-rolverdeling.
Bij de nulmeting bestond dit bestand niet; er zijn geen bestaande ACT-nummers overschreven.
Alleen noodzakelijke persoonlijke handelingen horen hier. Technische taken en modelrouting staan in CLOUD_TASKS.md.
Geen geheimen, aankopen of koppelingen opnemen als reeds goedgekeurd zonder expliciet besluit.

## Nu
ACT-002 vraagt eigenaarcontrole van GitHub-bescherming. De technische overdracht en Cloud-proef blijven agentwerk. Geen nieuwe aankopen gevraagd.

## Nummerconflict en historie

Cloud gebruikte ACT-001 voor codeoverdracht; Mac gebruikte zelfstandig ACT-001 voor toestelinventarisatie. Beide originele nummers blijven behouden met broncontext: deze lijst bevat Cloud ACT-001; [Mac ACT-001](docs/MAC_SNAPSHOT_2026-10-18/OWNER_ACTIONS.md) is de afgeronde eerste inventarisatie van iPhone 11 Pro en nieuwere toestellen. Geen taak stil overschreven of opnieuw aan jou gevraagd.

## ACT-002 — Technische eigenaarcontrole op GitHub vastleggen

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
