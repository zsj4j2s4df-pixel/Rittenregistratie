> **Actuele leeswijzer — CLOUD-006, 18 oktober 2026.** De oorspronkelijke tekst hieronder blijft behouden als eisenbasis en historie. Nieuwste expliciete gebruikersbesluiten gaan voor. Voor de uitvoering gelden de laatste Sol-procesafspraken uit de masterprompt en §7 van de Opper-agent-opdracht: Sol dagelijks, Astra uitsluitend bij belangrijke besluiten. De Mac-agent coördineert, integreert en accepteert; Cloud mag afgebakend documentonderzoek en controles uitvoeren wanneer Mac afwezig is, met eigen branch en PR. Oudere Claude-eerst- en permanente Astra-formuleringen zijn historische procesinstructies. Dit verandert geen functionele wens, kostenbevoegdheid of publicatierecht.
>
> Documentstatus en conflicten: [documentreview](docs/ASTRA_AUDIT/DOCUMENT_REVIEW.md). Eisen/code/teststatus: [eisenregister](docs/ASTRA_AUDIT/REQUIREMENTS_TRACE.md). Cloudwerk: [takenlijst](CLOUD_TASKS.md). Geen bewijs van code, hosting of een geslaagde iPhone-test uit deze instructies afleiden.

# RITKOMPAS — AANVULLING OP `OWNER_ACTIONS.md` (ASTRA-REGIE)

**Status:** instructie voor gerichte wijziging van het bestaande `OWNER_ACTIONS.md`; geen vervanging van bestaande actiepunten.

## Doel en verantwoordelijkheden

- De **Astra Opper-agent** is het enige vaste aanspreekpunt van de opdrachtgever en eindverantwoordelijk voor de coördinatie van persoonlijke acties.
- De **Operator Agent** beheert en actualiseert `OWNER_ACTIONS.md` namens de Opper-agent.
- De **Tool Scout** onderzoekt vooraf of een account, abonnement, aanschaf, installatie of koppeling werkelijk nodig is, en beoordeelt eerst bestaande en gratis mogelijkheden.
- **Model Strategy** en de Opper-agent regelen zelf modelkeuze en subagentverdeling. Zet modelkeuze alleen op de persoonlijke actielijst als expliciete toestemming, een abonnement, kosten of een wezenlijk besluit van de opdrachtgever vereist is.

## Selectiecriteria voor persoonlijke acties

Neem alleen een taak op wanneer de opdrachtgever persoonlijk moet handelen, bijvoorbeeld om een account aan te maken, toestemming te geven, een abonnement of aankoop goed te keuren, een apparaat beschikbaar te stellen, een praktijktest uit te voeren of een wezenlijk besluit te nemen.

**Niet opnemen:** technische implementatie, normale tests door agents, architectuurcontrole, documentatiecorrecties, securityreviews, interne modelrouting en andere taken die agents zelfstandig en veilig kunnen uitvoeren.

## Verplicht taakformat

Behoud alle bestaande ACT-nummers en taken. Maak alleen een nieuw nummer voor een daadwerkelijk nieuwe persoonlijke actie. Vermeld per taak:

- **ACT-nummer en titel**
- **Waarom persoonlijk optreden nodig is** en wat de agent al heeft onderzocht
- **Prioriteit**, eventuele deadline en afhankelijkheid van een ontwikkelfase
- **Kosten** (ook 'onbekend' of 'geen') en **gratis/bestaande alternatieven**
- **Verantwoordelijke agent** en eventuele betrokken Tool Scout
- **Status**: `NOG TE ONDERZOEKEN`, `WACHT OP AGENT`, `WACHT OP OPDRACHTGEVER`, `GOEDGEKEURD`, `AFGEROND` of `VERVALLEN`
- **Concrete stappen** voor de opdrachtgever, met officiële bronnen waar nodig
- **Hoe te controleren of de taak gelukt is**
- **Datum van laatste controle** en relevante besluitverwijzing

Geen wachtwoorden, tokens, API-sleutels of andere geheimen in Markdown of Git.

## Wanneer bijwerken

De Operator Agent controleert het bestand:

1. Tijdens **FASE A/B**, bij de audit en verbetering van alle Markdown-documentatie.
2. Wanneer de verbeterde agentinstructies worden geactiveerd.
3. Na de audit van eerder door Sol gebouwd werk, **uitsluitend** als daar een persoonlijke actie uit volgt.
4. Bij iedere volgende ontwikkelfase en zodra een agent persoonlijke hulp nodig heeft.
5. Wanneer kosten, noodzaak, status of vereisten wijzigen of een taak wordt afgerond.

Controleer vóór toevoeging de bestaande taken, projectdocumenten en eerdere besluiten; voorkom duplicaten. Archiveer of markeer vervallen taken zonder de historie te wissen.

## Communicatie en toestemming

De Opper-agent meldt uitsluitend actiepunten die **nu** aandacht van de opdrachtgever vereisen, met ACT-nummer, reden, geschatte kosten en korte eerstvolgende stap. Technische voortgang blijft in de gewone voortgangsrapportage.

Geen aankoop, betaald abonnement, gevoelige machtiging, externe koppeling of publicatie zonder expliciete toestemming. De vermelding van een actie in dit bestand is **geen toestemming** om deze uit te voeren.

## Bekende uitgangspunten

- Eén centrale Jeep Wrangler 4xe, voertuiggerichte rittenregistratie, drie iPhone-gebruikers.
- Een gewoon Apple-account; betaald Apple Developer-lidmaatschap is **niet bevestigd**. Onderzoek eerst of en wanneer dit nodig is.
- Er is een GitHub-repository, maar Cloudflare is **niet als gekoppeld bevestigd**.
- Copilot is beschikbaar via de werkomgeving van moeder; toestemming en technische mogelijkheden voor een koppeling zijn **niet bevestigd**.
- Beperk onnodige kosten, aankopen en abonnementen.

## Implementatie door Astra

1. Open het **bestaande** `OWNER_ACTIONS.md` in de repository. Als het niet bestaat, maak het aan volgens deze instructie.
2. Bewaar een herstelbare versie/Git-diff; **behoud alle bestaande ACT-nummers, inhoud en statussen** totdat ze afzonderlijk gecontroleerd zijn.
3. Voeg bovenstaande governance en werkwijze gericht toe, zonder het hele bestand onnodig te herschrijven.
4. Markeer onbevestigde acties als `NOG TE ONDERZOEKEN`; verzin geen noodzakelijke aankopen of deadlines.
5. Rapporteer welke bestaande acties nu aandacht vereisen en welke wijzigingen zijn aangebracht. Start geen externe koppelingen of aankopen.

**Gebruik:** lees samen met `RitKompas_Astra_Opperagent_Complete_Opdracht.md` en de bijgewerkte masterprompt. Bij strijdige eisen: registreer het conflict en vraag goedkeuring voor materiële keuzes.

---

## NIEUWSTE ROLVERDELING: SOL DAGELIJKS, ASTRA ALLEEN BIJ BELANGRIJKE BESLUITEN

Deze sectie vervangt eerdere verwijzingen naar Astra als permanente Opper-agent.

- Sol is dagelijkse Opper-agent, vaste contactpersoon en eindverantwoordelijke voor persoonlijke acties.
- Operator Agent onderhoudt OWNER_ACTIONS.md namens Sol; Tool Scout onderzoekt eerst bestaande en gratis oplossingen.
- Astra wordt alleen ingeschakeld voor belangrijke technische beslissingen, niet standaard bij iedere fase.
- Interne modelselectie, usage-bewaking, routing en technische reviews horen niet in OWNER_ACTIONS.md. Alleen een noodzakelijke persoonlijke instelling, toestemming of uitgave wordt een ACT-taak.
- Als Codex modellen niet automatisch kan wisselen, meldt Sol welke handmatige stap werkelijk nodig is. Claim geen niet-bestaande functies.
- Behoud alle bestaande ACT-nummers, taken en historie.
