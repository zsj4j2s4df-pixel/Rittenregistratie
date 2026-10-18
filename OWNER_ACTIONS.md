# Persoonlijke acties

Laatste controle: 18 oktober 2026.
Bron: OWNER_ACTIONS_ASTRA_AANVULLING.md, inclusief nieuwste Sol-rolverdeling.
Bij de nulmeting bestond dit bestand niet; er zijn geen bestaande ACT-nummers overschreven.
Alleen noodzakelijke persoonlijke handelingen horen hier. Technische taken en modelrouting staan in CLOUD_TASKS.md.
Geen geheimen, aankopen of koppelingen opnemen als reeds goedgekeurd zonder expliciet besluit.

## Nu
Geen persoonlijke handeling nodig voor de lopende documentaudit.

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
