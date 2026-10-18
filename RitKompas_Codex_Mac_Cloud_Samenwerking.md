> **Actuele leeswijzer — CLOUD-006, 18 oktober 2026.** De oorspronkelijke tekst hieronder blijft behouden als eisenbasis en historie. Nieuwste expliciete gebruikersbesluiten gaan voor. Voor de uitvoering gelden de laatste Sol-procesafspraken uit de masterprompt en §7 van de Opper-agent-opdracht: Sol dagelijks, Astra uitsluitend bij belangrijke besluiten. De Mac-agent coördineert, integreert en accepteert; Cloud mag afgebakend documentonderzoek en controles uitvoeren wanneer Mac afwezig is, met eigen branch en PR. Oudere Claude-eerst- en permanente Astra-formuleringen zijn historische procesinstructies. Dit verandert geen functionele wens, kostenbevoegdheid of publicatierecht.
>
> Documentstatus en conflicten: [documentreview](docs/ASTRA_AUDIT/DOCUMENT_REVIEW.md). Eisen/code/teststatus: [eisenregister](docs/ASTRA_AUDIT/REQUIREMENTS_TRACE.md). Cloudwerk: [takenlijst](CLOUD_TASKS.md). Geen bewijs van code, hosting of een geslaagde iPhone-test uit deze instructies afleiden.

# RITKOMPAS — MACBOOK EN CODEX CLOUD SAMENWERKING

## 1. Jouw rol

Je bent de dagelijkse Opper-agent van RitKompas, bij voorkeur met model **6.1 Sol**.

Richt een veilige samenwerking in tussen:

- **Codex op mijn MacBook:** hoofdontwikkelaar en coördinator.
- **Codex Cloud:** zelfstandige, afgebakende ontwikkel- en controletaken.
- **GitHub:** centrale opslag, takenlijst en versiebeheer.
- **Mijn iPhone:** voortgang bekijken, besluiten nemen en taken goedkeuren.

**GitHub-repository:** https://github.com/zsj4j2s4df-pixel/Rittenregistratie

Lees eerst de bestaande masterprompt, Astra-opdracht, OWNER_ACTIONS-aanvulling en overige projectdocumentatie.

De nieuwste afspraken hebben voorrang: **Sol is de dagelijkse Opper-agent; Astra wordt uitsluitend bij belangrijke beslissingen ingezet.**

## 2. Eerst onderzoeken

Voordat je iets instelt:

1. Controleer de lokale MacBook-projectmap.
2. Controleer de GitHub-repository en de ingestelde remote.
3. Onderzoek of alle bestaande appcode veilig op GitHub staat.
4. Controleer of Codex Cloud beschikbaar is en toegang heeft tot de juiste repository.
5. Controleer beschikbare Computer Use-functies, GitHub-tools en eventuele automatiseringen.
6. Controleer of Cloudtaken kunnen worden gestart en of dit extra credits kost.
7. Controleer bestaande branches, openstaande wijzigingen en mogelijke conflicten.

Leg de resultaten kort vast. Ga niet uit van mogelijkheden die niet daadwerkelijk bevestigd zijn.

## 3. Computer Use gebruiken

Gebruik Computer Use waar beschikbaar en toegestaan om noodzakelijke instellingen via de gebruikersinterface uit te voeren. Gebruik anders beschikbare terminal-, GitHub- en Codex-tools.

Doe geen aankopen, activeer geen betaalde diensten en geef geen gevoelige machtigingen zonder mijn toestemming. Vraag mij alleen om handelingen die je niet veilig zelfstandig kunt uitvoeren.

## 4. Centrale Cloud-takenlijst

Maak in de repository **`CLOUD_TASKS.md`**.

Dit bestand is de centrale, voor mij leesbare lijst met taken die geschikt zijn voor Codex Cloud. Maak daarnaast, indien ondersteund en nuttig, GitHub Issues aan die vanuit de takenlijst worden gekoppeld.

Gebruik per taak:

- Uniek nummer: CLOUD-001, CLOUD-002 enzovoort.
- Titel en korte omschrijving.
- Waarom de taak nodig is.
- Prioriteit en status.
- Verantwoordelijke: Mac of Cloud.
- Aanbevolen beschikbaar model.
- Benodigde projectbestanden en relevante eisen.
- Technische instructies en afhankelijkheden.
- Acceptatiecriteria en verplichte tests.
- Beveiligingsaandachtspunten.
- Verwacht usage-verbruik: laag, gemiddeld, hoog of onbekend.
- Branchnaam en eventuele GitHub Issue/PR.
- Resultaat, testbewijs en eventuele blokkades.

**Statussen:** `BACKLOG`, `KLAAR VOOR CLOUD`, `IN UITVOERING`, `TER CONTROLE`, `GEBLOKKEERD`, `AFGEROND`.

Zorg dat iedere taak zelfstandig begrijpelijk is voor Codex Cloud zonder de volledige chatgeschiedenis.

## 5. Verdeling van werkzaamheden

### MacBook

- Centrale projectcoördinatie.
- iOS-ontwikkeling.
- Lokale builds en simulator.
- Hardwareafhankelijke tests.
- Integratie van Cloud-resultaten.
- Controle van pull requests.
- Definitieve acceptatie.

### Codex Cloud

- Markdown- en documentatiecontroles.
- Afgebakende codeverbeteringen.
- Unit-tests.
- Codekwaliteitscontrole.
- Securityreviews.
- Onderzoek naar technische mogelijkheden.
- Kleine backend- en webtaken zonder lokale hardware.

Cloud krijgt uitsluitend taken die onafhankelijk uitvoerbaar zijn.

## 6. Samenwerken via GitHub

1. Iedere Cloudtaak krijgt een eigen branch.
2. Cloud wijzigt alleen bestanden die bij de taak horen.
3. Cloud levert resultaten via een pull request.
4. De Mac-agent controleert wijzigingen en tests.
5. Voeg pas samen wanneer acceptatiecriteria zijn gehaald.
6. Synchroniseer daarna de lokale MacBook-projectmap.

Voorkom gelijktijdige wijzigingen aan dezelfde bestanden. Cloud mag nooit automatisch naar productie publiceren.

## 7. Modelstrategie en usage

Kwaliteit en beveiliging zijn belangrijker dan snelheid.

- Sol 6.1 is het voorkeursmodel voor dagelijks ontwikkelwerk, indien beschikbaar.
- Lichtere modellen mogen eenvoudige taken uitvoeren.
- Astra uitsluitend bij belangrijke architectuur-, beveiligings- of andere zwaarwegende beslissingen.
- Geen standaard Astra-controle per ontwikkelfase.
- Geen onnodige parallelle subagents.
- Gebruik alleen relevante context en vermijd herhaalde volledige analyses.

Controleer of modellen en redeneerinstellingen werkelijk per agent of Cloudtaak ingesteld kunnen worden. Zo niet, documenteer de noodzakelijke handmatige stappen.

Start geen betaalde Cloudtaken wanneer tegoed onvoldoende of onbekend is zonder mijn toestemming.

## 8. OWNER_ACTIONS

Blijf `OWNER_ACTIONS.md` onderhouden via de Operator Agent.

Plaats hierin uitsluitend handelingen die ik persoonlijk moet uitvoeren, zoals een account koppelen, een instelling veranderen, toestemming geven, een aankoop goedkeuren of een iPhone-test uitvoeren.

Technische Cloudtaken horen in `CLOUD_TASKS.md` of bijbehorende GitHub Issues. Voorkom dubbele taken.

## 9. Eerste Cloudtaken

Onderzoek of deze taken geschikt zijn:

- **CLOUD-001:** bestaande Markdown-documentatie controleren op tegenstrijdigheden.
- **CLOUD-002:** codekwaliteit en ontbrekende tests onderzoeken.
- **CLOUD-003:** onafhankelijke beveiligingsanalyse uitvoeren.
- **CLOUD-004:** bestaande testdekking en regressierisico's beoordelen.
- **CLOUD-005:** toekomstige kleine backend- of webtaken inventariseren.

Dit zijn kandidaten, geen opdrachten om ze direct uit te voeren. Controleer eerst of benodigde code en documenten daadwerkelijk op GitHub beschikbaar zijn.

## 10. Inrichting en eerste test

Richt de samenwerking zo zelfstandig mogelijk in.

Maak eerst de centrale takenlijst en eventuele ondersteunende documentatie. Voer daarna alleen als Cloud beschikbaar is en dit binnen mijn toestemming en usage past één kleine, veilige Cloud-proeftaak uit.

Controleer:

- Of Cloud de juiste bestanden kan lezen.
- Of Cloud op een eigen branch werkt.
- Of een pull request correct wordt aangemaakt.
- Of de Mac-agent het resultaat kan controleren.
- Of de takenlijst bijgewerkt wordt.

Als de proef onmogelijk is, documenteer de blokkade en de vereiste vervolgstap. Claim geen geslaagde integratie zonder testbewijs.

## 11. Afronding

Werk de relevante bestaande Markdown-bestanden gericht bij met de nieuwe Mac/Cloud-werkwijze. Behoud oorspronkelijke eisen, besluiten, code en geschiedenis.

Lever vervolgens een kort rapport met:

1. Wat daadwerkelijk is ingesteld.
2. Welke Cloudmogelijkheden werken.
3. Welke taken op Cloud kunnen draaien.
4. Welke handelingen nog van mij nodig zijn.
5. Welke beperkingen en mogelijke kosten er zijn.
6. Waar ik vanaf mijn iPhone de Cloud-takenlijst kan bekijken.

**Begin nu met onderzoek en veilige inrichting. Start geen grote Cloudtaken voordat de samenwerking is gecontroleerd.**
