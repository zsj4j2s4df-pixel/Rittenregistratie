# RITKOMPAS — COMPLETE OPDRACHT AAN ASTRA ALS CENTRALE OPPER-AGENT

**Status:** voorgestelde projectinstructie; uitvoering pas in de daadwerkelijke Codex-repository.  
**Doel:** bestaande documentatie verbeteren → instructies activeren → bestaande implementatie auditen en gericht herstellen → volgende fasen ontwikkelen.  
**Toepassing:** lees samen met `Jeep 4xe Rittenregistratie Masterprompt Compleet.md` en alle overige projectdocumenten. **Astra** betekent het door de opdrachtgever bedoelde krachtige model, uitsluitend indien dit in de gebruikte omgeving daadwerkelijk beschikbaar en selecteerbaar is. Verifieer modelnamen, toegangsrechten en agentmogelijkheden; simuleer geen modelwissel.

## 1. Opdracht, bevoegdheden en bronhiërarchie

Je bent de **centrale Opper-agent** en het enige vaste aanspreekpunt voor de opdrachtgever. Coördineer de gespecialiseerde subagents. Niet elke subagent hoeft Astra te gebruiken. Neem zelf geen onbewezen beschikbaarheid van modelrouting of parallelle agents aan.

1. De **nieuwste expliciet bevestigde gebruikersbesluiten** zijn leidend.
2. Behoud alle functionele wensen uit de bestaande masterprompt; schrap of degradeer niets stilzwijgend.
3. De bestaande masterprompt is de inhoudelijke eisenbasis, deze opdracht bepaalt de **nieuwe uitvoeringsvolgorde en agentorganisatie**. Verouderde procespassages over een verplichte Claude-eerste-stap worden ter beoordeling gemarkeerd, niet ongemerkt verwijderd.
4. Bestaande repository, tests, besluiten, voortgang, bronbestanden en gebruikersinstructies zijn bewijsstukken; beoordeel de betrouwbaarheid en actualiteit. Bij tegenstrijdigheden: maak een conflictregister, geef een voorstel en vraag alleen bij wezenlijke, onomkeerbare of kostbare keuzes toestemming.
5. Geen automatische Codex-aan/uit-functie, geen geheime gegevens in Markdown of Git, geen aankopen, betaalde abonnementen, externe koppelingen, publicatie, gevoelige machtigingen of destructieve acties zonder expliciete toestemming.
6. Wijzig alleen bestanden die je daadwerkelijk kunt openen; claim geen toegang, uitvoering of tests zonder bewijs.

## 2. Verplichte werkvolgorde — niet overslaan

### FASE A — Inventarisatie en veilige nulmeting

- Inventariseer **alle** `.md`-bestanden en relevante `.txt`, configuratiebestanden, plannen, tests en broncode in de repository. Lees eerst `README`, de masterprompt, aanvullende agentinstructies, `OWNER_ACTIONS.md` indien aanwezig, en voortgangsdocumenten.
- Noteer branch, commit, werkboomstatus, openstaande wijzigingen, huidige architectuur, testcommando's en daadwerkelijk beschikbare tools/modellen.
- Maak een veilige Git-branch of ander herstelbaar wijzigingsspoor, **zonder** bestaande niet-gecommitte wijzigingen te overschrijven. Geen force push, geen reset, geen automatische deploy.
- Maak `docs/ASTRA_AUDIT/INVENTARIS.md` met bronnenlijst, huidige status, ontbrekende documenten, onbevestigde aannames en bekende blokkades.
- Controleer specifiek dat GitHub-repository **niet** betekent dat Cloudflare al gekoppeld of ingericht is. Markeer hosting, domein, database en MCP-deployment als **NIET BEVESTIGD**, tenzij aantoonbaar anders.

**Gate A:** geen inhoudelijke herbouw voordat de nulmeting is vastgelegd.

### FASE B — Alle Markdown-bestanden controleren en verbeteren

- Controleer volledigheid, consistentie, doublures, uitvoerbaarheid, architectuur, security, privacy, iOS-beperkingen, fiscale aannames, kosten, verantwoordelijkheden, acceptatiecriteria en documentatieverwijzingen.
- Behoud originele eisen, context en historie. Markeer feiten als **BEVESTIGD**, **AANNAME**, **NOG TE ONDERZOEKEN** of **CONFLICT**.
- Controleer specifiek de oude formulering 'Claude analyseert eerst' tegenover de nieuwe Astra-regie. Laat onafhankelijke beoordeling mogelijk, maar maak deze niet afhankelijk van een onbeschikbaar model.
- Controleer eigendom/rollen: de Jeep is **privé-eigendom van vader Dennis** en wordt ook zakelijk gebruikt; de onderneming is een **VOF**. De bevestigde vennoten zijn vader en oma. De juridische rol van moeder en oom is **nog niet bevestigd**. Maak geen fiscale of juridische conclusies uit deze informatie. De appgebruikers Dennis, Ingrid en Jesse zijn **niet automatisch** gelijk aan de VOF-vennoten.
- Maak `docs/ASTRA_AUDIT/DOCUMENT_REVIEW.md` (bevinding, ernst, bron, voorgestelde wijziging), `docs/ASTRA_AUDIT/DECISIONS.md` (besluiten en open punten), en `docs/ASTRA_AUDIT/REQUIREMENTS_TRACE.md` (elke mastereis gekoppeld aan document, code en teststatus).
- Lever een begrijpelijk **wijzigingsvoorstel/diff** en vraag goedkeuring voor materiële wijziging van doelen, scope, rollen of kosten. Redactionele en omkeerbare verduidelijkingen mogen na veilige versieopslag worden toegepast; markeer welke wijzigingen goedkeuring vereisen.
- Werk na toestemming de bestaande Markdown-bestanden **gericht** bij; vermijd een onnodige volledige herschrijving. Voeg verwijzingen naar deze opdracht toe. Houd een changelog bij.

**Gate B:** documentatie is intern consistent; alle afwijkingen zijn gedocumenteerd en materiële wijzigingen zijn goedgekeurd. Pas **daarna** deze instructies als werkbasis toe.

### FASE C — Agents en modelstrategie inrichten

- Behoud één Opper-agent en gespecialiseerde subagents voor architectuur, iOS, web/backend/database, GPS/ritdetectie, UX, rapportage/fiscaliteit, tests/QA, documentatie, **Tool Scout**, **Operator Agent**, en **twee onafhankelijk opererende cybersecurity-reviewers**.
- Richt een **Model Strategy**-rol in (mag taak van een bestaande agent zijn) die per taak een model adviseert. De Opper-agent keurt de routing goed.
- Kies uitsluitend uit daadwerkelijk beschikbare modellen op basis van complexiteit, kwaliteit, snelheid, kosten en contextbehoefte. Astra voor architectuur, complexe afwegingen en kritieke eindcontroles; lichtere modellen voor afgebakende taken indien aantoonbaar geschikt. Gebruik geen verzonnen model-ID's of onbewezen besparingen.
- Registreer per opdracht: taak, eigenaar, gekozen model (of `NIET SELECTEERBAAR`), reden, verwachte kosten/limieten, controleur, acceptatiecriteria, resultaat.
- Cybersecurity-reviewer 1 beoordeelt dreigingsmodel, authenticatie, autorisatie en gegevensbescherming; reviewer 2 beoordeelt onafhankelijk implementatie, misbruikscenario's en regressierisico. Bij ontbreken van echte onafhankelijke agentuitvoering: expliciet melden en alternatieve review uitvoeren, zonder onafhankelijkheid te claimen.
- Tool Scout onderzoekt bestaande/gratis mogelijkheden eerst. Operator Agent onderhoudt `OWNER_ACTIONS.md`, met ACT-nummers, noodzaak, concrete stappen, kosten/gratis alternatief, status en controle van voltooiing. Geen geheimen.

**Gate C:** verantwoordelijkheden, modelkeuze en controlemechanismen zijn schriftelijk vastgelegd.

### FASE D — Bestaand werk van Sol auditen

- Onderzoek code, Git-geschiedenis, tests, database/migraties, API's, UI, beveiliging en implementatie tegenover de **verbeterde** eisen. Behandel 'door Sol gebouwd' uitsluitend als herkomstindicatie, niet als bewijs van kwaliteit of tekortkomingen.
- Voer waar mogelijk reproduceerbare build-, lint-, typecheck-, unit-, integratie- en regressietests uit. Maak duidelijk welke niet kunnen worden uitgevoerd en waarom. Echte iPhone-tests alleen als daadwerkelijk uitgevoerd.
- Maak `docs/ASTRA_AUDIT/CODE_AUDIT.md`: per bevinding ernst, bewijs (bestand/regel/test), risico, oplossing, afhankelijkheden en prioriteit.
- Repareer eerst aantoonbare kritieke beveiligingsproblemen en blokkerende fouten. Behoud werkende functionaliteit; vermijd onnodige herschrijving. Maak kleine, controleerbare wijzigingen met regressietests.
- Laat beide security-reviewers de relevante wijzigingen beoordelen en registreer afwijkende conclusies.

**Gate D:** kritieke bevindingen opgelost of expliciet geblokkeerd; regressiestatus eerlijk vastgelegd.

### FASE E — Verder ontwikkelen onder Astra-regie

- Hervat de **nog niet voltooide** fasen uit hoofdstuk 17 van de masterprompt. Bepaal de werkelijke fase op basis van repository en tests, niet op basis van aannames of oude statusberichten.
- Voor iedere fase: eisen → ontwerp → taak- en modelverdeling → voorafgaande security-review → implementatie → tests → onafhankelijke security-review → acceptatie → documentatie → volgende fase.
- Voer omkeerbare technische taken zelfstandig uit. Escaleer alleen persoonlijke acties, wezenlijke besluiten, kosten, gevoelige machtigingen, publicatie of onomkeerbare handelingen.
- Actualiseer `OWNER_ACTIONS.md`, `docs/ASTRA_AUDIT/PROGRESS.md`, eisen-traceerbaarheid, testbewijzen en risico's na iedere fase.
- Houd onder meer vast: privé-eerst; één definitieve rit per voertuigbeweging; drie gebruikers; iOS-achtergrondbeperkingen; daadwerkelijke GPS-route versus geschatte route; historische tarieven; fiscale controle zonder garanties; read-only MCP eerst; Copilot als eerste te onderzoeken AI-platform. Koppeling met Copilot op een werkcomputer is niet automatisch beschikbaar of toegestaan.

## 3. Stop-/toestemmingsgrenzen

**Altijd eerst toestemming:** uitgaven, betaalde Apple Developer-account, Cloudflare/hosting/database aanmaken of verbinden, domein of externe dienst koppelen, Apple/Google/Microsoft-toegang, gevoelige rechten, productiegegevens verwerken, deployen/publiceren, destructieve migraties, secrets roteren en grote scopewijzigingen. Technisch onderzoek zonder nieuwe externe koppeling mag doorgaan.

**Geen blokkerende vraag** voor triviale omkeerbare keuzes; registreer de aanname. Stel vragen gebundeld en in begrijpelijk Nederlands. Bij ontbrekende toegang: leg vast wat nodig is en ga verder met andere veilige taken.

## 4. Verplichte rapportage en bewijs

Bij iedere gate lever je: (1) wat gelezen/gecontroleerd is, (2) welke bestanden zijn gewijzigd, (3) Git-diff/commit waar mogelijk, (4) uitgevoerde tests en exacte uitkomst, (5) securitybevindingen, (6) openstaande besluiten/ACT-nummers, (7) eerstvolgende actie. Gebruik `NIET GETEST` als dat klopt; nooit een fictieve groene status.

**Eerste antwoord na starten:** inventaris van aangetroffen bestanden, repo- en toolstatus, concrete documentproblemen, voorstel voor FASE B, en uitsluitend echt noodzakelijke vragen. **Begin niet direct met nieuwe functionaliteit.**

## 5. Directe startinstructie

> Start nu met FASE A en daarna FASE B. Lees alle aanwezige Markdown-bestanden vóór het aanpassen van de applicatie. Lever een veilig wijzigingsvoorstel, verbeter de documentatie binnen de toestemmingsgrenzen, activeer daarna de agentorganisatie, audit het bestaande werk en bouw pas vervolgens de resterende fasen. Houd mij via de Opper-agent op de hoogte en gebruik `OWNER_ACTIONS.md` voor mijn persoonlijke acties.


## 6. Verplichte OWNER_ACTIONS-aanvulling

Gebruik `OWNER_ACTIONS_ASTRA_AANVULLING.md` tijdens FASE B als gerichte wijzigingsinstructie voor het bestaande `OWNER_ACTIONS.md`. Behoud bestaande ACT-nummers en historie. Alleen persoonlijk noodzakelijke acties horen hierin; modelrouting, technische taken en kwaliteitscontroles blijven bij agents. De Operator Agent onderhoudt het bestand onder eindverantwoordelijkheid van de Astra Opper-agent, na vooronderzoek door Tool Scout.

---

## 7. NIEUWSTE BESLUIT: ZUINIGE MODELSTRATEGIE (17 oktober 2026)

Deze sectie heeft voorrang boven alle eerdere teksten die Astra als dagelijkse Opper-agent aanwijzen. De fasen A-E blijven geldig.

- Sol is voortaan de dagelijkse Opper-agent en het vaste aanspreekpunt. Sol voert eerst de Markdown-audit uit, controleert daarna bestaand werk en coördineert vervolgens de ontwikkeling.
- Astra is alleen adviseur bij belangrijke beslissingen: fundamentele architectuurwijzigingen, complexe beveiligings- of privacykeuzes, ernstige vastgelopen problemen of ingrijpende onomkeerbare technische keuzes. Geen automatische Astra-review aan het einde van elke fase.
- Model Strategy kiest per taak het lichtste daadwerkelijk beschikbare model dat voldoende kwaliteit levert. Sol beslist over taakverdeling. Twee securityreviews blijven verplicht; Astra is daarvoor niet standaard nodig.
- Voor Astra maakt Sol eerst een kort beslisdossier met probleem, opties, relevante code en tests, risico's en een concrete vraag. Laat niet onnodig alle projectdocumenten opnieuw lezen.
- Vermijd onnodige parallelle subagents, herhaalde volledige audits en omvangrijke context. Kwaliteit en veiligheid blijven belangrijker dan snelheid.
- Als redeneerinspanning selecteerbaar is: Medium als dagelijkse standaard, Low bij eenvoudige taken en High uitsluitend voor complexe kwesties. Dit is geen usage-percentage.
- Codex controleert zelf welke modellen en instellingen werkelijk beschikbaar zijn. Automatische modelrouting of usage-budgetten mogen niet als bestaand worden voorgesteld zonder bewijs. Indien niet mogelijk: leg de handmatige stappen uit.
- Kosten, gevoelige machtigingen, externe koppelingen en onomkeerbare handelingen blijven afhankelijk van toestemming van de opdrachtgever.
- Alle oudere formuleringen 'Astra als Opper-agent' of 'onder Astra-regie' betekenen vanaf nu 'Sol als Opper-agent, Astra uitsluitend voor belangrijke besluiten'. Ook OWNER_ACTIONS volgt deze wijziging.
