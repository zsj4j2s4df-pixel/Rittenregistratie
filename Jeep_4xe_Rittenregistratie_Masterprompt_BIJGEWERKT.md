# MASTERPROMPT: JEEP WRANGLER 4XE RITTENREGISTRATIE-APP

> Eén samenvattende, complete opdracht. Bedoeld voor Claude (onafhankelijke analyse en planning) én Codex (bouwen en testen). Dit bestand vervangt de losse bronbestanden: de oorspronkelijke Codex-prompt (22 hoofdstukken), de Master-aanvullingen A–J, het projectoverzicht (Excel) en de drie design-mockups. Bij tegenstrijdigheid geldt de nieuwste expliciete wens; meld elk conflict.

---

> **PROCESUPDATE — 17 oktober 2026 (voorgestelde aanvulling).** Lees naast deze inhoudelijke masterprompt `RitKompas_Astra_Opperagent_Complete_Opdracht.md`. De nieuwe uitvoeringsvolgorde is: (A) inventarisatie, (B) Markdown-audit en gerichte verbetering, (C) agent- en modelstrategie, (D) audit en gerichte verbetering van bestaand werk, (E) vervolgontwikkeling. Astra is beoogd als centrale Opper-agent **mits beschikbaar**; gespecialiseerde subagents hoeven niet allemaal Astra te gebruiken. De oude Claude-eerst-werkwijze in hoofdstukken 0, 16 en 17 blijft als historische instructie zichtbaar en wordt door de nieuwe opdracht **voor de procesvolgorde vervangen**, niet voor de inhoudelijke eisen. Materiële wijzigingen vragen goedkeuring. Deze lokale update is nog niet in de GitHub-repository doorgevoerd.

## 0. HOE JE DIT BESTAND GEBRUIKT

**Werkwijze (vaste volgorde):**
1. Dit bestand is de enige bron van waarheid voor wensen en besluiten.
2. **Claude** analyseert eerst: volledigheid, tegenstrijdigheden, haalbaarheid, risico's, MVP-scope. Daarna schrijft Claude een verbeterde MVP-specificatie en een direct bruikbare Codex-bouwprompt (zie hoofdstuk 16).
3. **Jesse** beoordeelt de analyse en de belangrijkste keuzes.
4. **Codex** bouwt en test op basis van de goedgekeurde prompt.
5. **Claude** beoordeelt daarna onafhankelijk de implementatie en testresultaten, zodra Jesse die aanlevert.

**Rol bij Claude:** onafhankelijk senior productarchitect, iOS-specialist, UX/UI-ontwerper, backend/security-reviewer en MVP-planner.
**Rol bij Codex:** uitvoerend ontwikkelaar en tester die eerst de repository inspecteert.

**Algemene spelregels (gelden voor beide):**
- Schrijf in helder Nederlands; leg technische termen kort en eenvoudig uit.
- Verwijder of versimpel geen wens zonder dat expliciet te melden en te motiveren. Wensen die niet in de MVP passen blijven bestaan als toekomstige eis.
- Verzin geen technische mogelijkheden, fiscale garanties, voertuigdata, testresultaten of bronnen.
- Gebruik voor veranderlijke feiten actuele, officiële bronnen met directe link en raadpleegdatum.
- Onderscheid steeds: **bevestigd feit**, **aanname**, **nog te onderzoeken/testen**.
- Geen betaalde diensten, hardware (o.a. OBD2-adapter), publicatie, gevoelige machtigingen of onomkeerbare acties zonder uitdrukkelijke toestemming van Jesse.
- Noem een functie pas "klaar" als implementatie én tests dat aantonen. Claim niet dat iets al gebouwd is.
- **Uitgesloten wens:** geen functie of verwijzing om Codex automatisch aan/uit te zetten of te laten lopen. Niet toevoegen.

---

## 1. PROJECT EN DOEL

Een professionele, veilige, gebruiksvriendelijke rittenregistratie voor een **Jeep Wrangler Unlimited 80th Anniversary 4xe**.

Doel: autoritten zo automatisch mogelijk detecteren, de werkelijk gereden route vastleggen, zakelijke en privékilometers onderscheiden en controleerbare rapportages maken voor de Nederlandse administratie.

**Onderdelen van de oplossing:**
- Native iPhone-app met zo betrouwbaar mogelijke automatische ritdetectie.
- Webinterface voor computer en laptop.
- Veilige centrale backend en database; synchronisatie tussen alle gebruikers en apparaten.
- Bluetooth- en, waar officieel toegestaan, CarPlay-integratie.
- Uitbreidbare OBD2-laag (hardware nog niet aangeschaft).
- Interactieve kaarten bij iedere rit.
- Professionele rapportagemodule (PDF en CSV).
- Eigen appnaam, logo en huisstijl.
- Remote MCP-laag voor AI-koppelingen (ChatGPT, Claude, Microsoft Copilot), alleen waar actueel ondersteund.
- Tests, onafhankelijke beveiligingscontroles en documentatie.

**Voertuig:** gebruik overal de naam **Jeep Wrangler Unlimited 80th Anniversary 4xe**. Het eerder genoemde modeljaar 2021 is **niet bewezen**: controleer exacte uitvoering, modeljaar en marktuitvoering met betrouwbare bronnen (en zo mogelijk voertuigdocumenten van Jesse).

---

## 2. HOOFDREGELS (UITGANGSPUNTEN)

1. Onderzoek eerst, stel daarna alleen de noodzakelijke vragen.
2. Bouw pas als de belangrijkste keuzes duidelijk zijn.
3. Werk daarna zelfstandig door; maak veilige, omkeerbare keuzes zelf.
4. Test echt wat je bouwt; maak onderscheid tussen unit-/automatische tests, simulator/browser, handmatige tests en tests op een echte iPhone.
5. Behoud bestaande werkende functionaliteit en controleer regressies. Herbouw niet onnodig.
6. Vraag toestemming bij belangrijke kosten, gevoelige machtigingen, publicatie en onomkeerbare acties.
7. **Privé eerst**: bij onzekerheid nooit automatisch zakelijk.
8. Houd de vormgeving professioneel, rustig en functioneel.
9. Als een gewenste functie technisch niet kan of niet is toegestaan: onderzoek een praktisch alternatief, leg de beperking uit en ga door met de rest. Geen onofficiële omwegen.

---

## 3. GEBRUIKERS EN RECHTEN

| Nr | Naam | Prioriteit bij gelijktijdige verbinding | Rechten |
|---|---|---|---|
| 1 | Dennis | Hoogste | Beheerder + bestuurder |
| 2 | Ingrid | Tweede | Beheerder + bestuurder |
| 3 | Jesse | Derde | Beheerder + bestuurder |

- Elke gebruiker heeft een eigen account en dezelfde rechten: ritten bekijken, registreren, corrigeren en classificeren; vergoedingen beheren; rapporten exporteren; instellingen en accounts beheren; Mijn Jeep bekijken.
- Iedereen moet op de eigen iPhone én op een computer kunnen inloggen. Gegevens staan centraal in de backend, niet alleen op één telefoon.
- Belangrijke wijzigingen komen in een **auditlog** (wie, wat, wanneer, oude en nieuwe waarde).
- Ontwerp zo dat later meer gebruikers en voertuigen kunnen worden toegevoegd.

---

## 4. AUTOMATISCHE RITDETECTIE (KERNFUNCTIE)

Gebruik waar technisch mogelijk een combinatie van: GPS, bewegingsherkenning, Bluetooth-verbinding met de auto, bruikbare CarPlay-signalen en later OBD2.

De app moet waar mogelijk: een rit automatisch starten en beëindigen, vertrek en bestemming vastleggen, datum en tijden registreren, de werkelijk gereden GPS-route bewaren, afstand berekenen, tussenstops herkennen, tijdelijke GPS-uitval opvangen en onvolledige of gemiste ritten signaleren.

Houd rekening met: iOS-achtergrondbeperkingen, batterijverbruik, slecht GPS-bereik, parkeergarages, verkeerslichten en korte stops, meerdere gebruikers in dezelfde auto, telefoons die niet in de auto zijn, appbeëindiging, herstart en verbindingsverlies.

- Gebruik drempelwaarden en tijdscontroles tegen foutieve start- en stopmomenten.
- De app blijft bruikbaar zonder OBD2 of Bluetooth; GPS is de terugvaloptie.
- Maak zichtbaar welke detecties betrouwbaar zijn en welke ritten achteraf gecontroleerd moeten worden.

---

## 5. BLUETOOTH, MELDING EN SNELLE CLASSIFICATIE

Wanneer een gebruikers-iPhone verbinding maakt met de Bluetooth van de Jeep, wil Jesse (voor zover iOS dit toestaat) een melding dat er mogelijk een rit begint.

- Onderzoek eerst de feitelijke iOS-beperkingen. **Belofte "altijd een melding bij elke verbinding" is niet toegestaan** zonder bewijs.
- Onderscheid een **lokale melding** op de telefoon van een echte **pushmelding** via een server; gebruik de juiste term en techniek.
- De bediening is zo simpel mogelijk: twee grote keuzes **PRIVÉ** en **ZAKELIJK**, één tik, niet via meerdere schermen.
- Als iOS knoppen in de melding niet toestaat: de melding opent direct een scherm met twee grote knoppen.
- **PRIVÉ is de voorlopige standaard** als nog geen keuze is gemaakt. Leg uit dat de gebruiker de rit later moet controleren en dat dit op zichzelf **geen fiscale garantie** is.
- Voorkom dubbele meldingen bij herhaald verbinden en verbreken. Houd rekening met meldingsmachtigingen, Focus-standen, achtergrondbeperkingen en batterij.
- Geen betrouwbare melding mogelijk? Leg de beperking uit en bied een fallback (bijvoorbeeld classificatie bij aankomst of in de rittenlijst).

### 5.1 CarPlay
- Onderzoek of de app volgens actuele Apple-regels en appcategorieën een CarPlay-interface mag aanbieden.
- Alleen als dat officieel kan: een eenvoudige interface met grote PRIVÉ- en ZAKELIJK-keuzes, zonder afleiding tijdens het rijden.
- Ga **niet** uit van willekeurige knoppen op het CarPlay-scherm. Als het niet kan: **bouw het niet via een omweg**; bied een ondersteund alternatief op de iPhone.

---

## 6. BESTUURDERSHERKENNING EN DEDUPLICATIE

- Meerdere telefoons kunnen dezelfde rit detecteren. Vergelijk detecties centraal en voeg samen tot **één** definitieve rit.
- Bij vrijwel gelijktijdige verbinding is de volgorde **Dennis → Ingrid → Jesse** de beginregel voor de **kandidaat**-registratie. Later instelbaar, dit is de standaard.
- **Belangrijk:** prioriteit is een hulpmiddel, **geen bewijs** wie achter het stuur zit. Bij tegenstrijdige of onzekere signalen: vraag bevestiging of zet de rit op **bestuurder onbekend**.
- Onderscheid **voorlopige detectie**, **voorlopige rit** en **definitieve rit**.
- Gebruik tijdstippen, GPS-route, voertuigidentificatie en beschikbare Bluetooth-/OBD2-signalen voor duplicaten. Eén telefoon mag niet dezelfde rit meerdere keren aanmaken.
- Bewaar een controleerbare geschiedenis van samenvoegingen en wijzigingen.

---

## 7. ZAKELIJK OF PRIVÉ

- Elke rit is **zakelijk**, **privé** of **nog te controleren/onbekend**.
- Standaard **PRIVÉ EERST**: onvoldoende zekerheid → privé of "nog te bevestigen", nooit automatisch zakelijk. Verzin geen ritdoelen of fiscale gegevens.
- Eén tik om te corrigeren, ook achteraf; elke wijziging in de historie.
- Optionele extra velden (configureerbaar): ritdoel, klant/opdrachtgever, toelichting. Dagelijks gebruik blijft simpel.
- Toon de **reden en zekerheid** van een suggestie.

### 7.1 Zakelijke voorkeursadressen (Instellingen)
Submenu waarin gebruikers adressen beheren die **in principe zakelijk** zijn:
- Toevoegen, wijzigen, tijdelijk uitschakelen, verwijderen.
- Zoeken op naam/adres en zo mogelijk kiezen op een kaart; herkenbare naam (kantoor, werkplaats, klant); optionele toelichting; markeren als zakelijke voorkeurslocatie.
- Een adresmatch is een **aanwijzing, geen bewijs**. Voorbeeld: thuis → opgeslagen klantadres = "waarschijnlijk zakelijk", met zichtbare reden ("Bestemming komt overeen met opgeslagen zakelijk adres: Klant X").
- Gebruiker kan suggestie eenvoudig accepteren of wijzigen. Bij tegenstrijdige regels geldt privé eerst.
- Bewaar welke regel een suggestie veroorzaakte en elke correctie in de wijzigingshistorie.
- Adressen zijn locatiegegevens: beveilig ze zorgvuldig.

---

## 8. RITTENLIJST, KAARTEN EN ROUTES

**Lijst:** per rit minimaal datum, vertrek-/aankomsttijd, vertrek- en bestemmingsadres, afstand, classificatie (privé/zakelijk/te controleren), bestuurder of "onbekend" (met zekerheid van toewijzing) en een kleine kaartpreview.

**Filters:** periode, bestuurder, zakelijk/privé/te controleren, voertuig (voor later).

**Detail:** grotere interactieve kaart met vertrekpunt, bestemming, route, tussenstops, tijden, afstand en eventueel begin-/eindkilometerstand. Direct PRIVÉ/ZAKELIJK kunnen kiezen vanuit lijst en detail. Optie "Open in Apple Kaarten" waar passend (controleer voorwaarden, API-limieten, kosten).

**Drie soorten route altijd zichtbaar onderscheiden:**
1. Werkelijk geregistreerde GPS-route.
2. Door een kaartdienst achteraf berekende route.
3. Geschatte afstand.

Vervang een onvolledige GPS-route **nooit stilzwijgend** door een berekende route; toon een waarschuwing bij ontbrekende gegevens. Werkt goed op iPhone en computer; op klein scherm een compacte kaart die met een tik vergroot.

---

## 9. KILOMETERS EN VERGOEDING

- Totalen zakelijk/privé per bestuurder, maand, kwartaal en jaar.
- Instelbaar vergoedingstarief; bewaar welk tarief in welke periode gold. **Historische rapporten mogen niet ongemerkt veranderen** bij tariefwijziging.
- Verifieer actuele Nederlandse regels en tarieven; **hardcode of verzin geen tarief**. (In de mock-ups staat € 0,23/km: dat is alleen illustratief.)
- Onderscheid GPS-afstand, kilometerteller, handmatig ingevoerd en automatisch geregistreerd.

---

## 10. FISCALE RAPPORTAGE

Onderzoek met actuele officiële bronnen van de Belastingdienst welke gegevens nodig zijn; scheid wettelijke eisen, praktische aanbevelingen en optionele gegevens. Claim **nooit** dat een rapport automatisch fiscaal goedgekeurd is.

**Inhoud waar van toepassing:** bestuurder, periode, voertuig en **kenteken (het kenteken dat bij Instellingen is ingevoerd; verschijnt automatisch op het PDF- en CSV-rapport voor de Belastingdienst; ontbreekt het, toon dan een waarschuwing vóór export)**, datum per rit, vertrek-/aankomsttijd en -adres, begin-/eindstand kilometerteller (indien beschikbaar), afstand, classificatie, ritdoel/toelichting, relevante tussenstops, ontbrekende of gecorrigeerde gegevens, totalen zakelijk/privé, toegepast tarief en berekening.

**Verzin nooit** tellerstanden, adressen, ritdoelen of ontbrekende waarden: markeer ze en bied een manier om aan te vullen.

**Minimaal:** professioneel PDF-rapport (rustige vormgeving, paginanummers, tabellen met herkenbare kolomkoppen over meerdere pagina's, geen afgekapte data), CSV met ritdetails, overzicht per periode, gedetailleerde rittenlijst, rapport per bestuurder. Onderzoek of extra exportformaten nuttig zijn.

**Validaties met waarschuwing vóór export:** dubbele ritten, ontbrekende kilometerstanden, onlogische tijden, negatieve afstanden, onbekende bestuurders, onduidelijke classificatie, onvolledige GPS. Bewaar een controleerbare wijzigingshistorie.

---

## 11. DESIGN

### 11.1 Stijl
Premium, robuust, professioneel, rustig en modern; subtiel geïnspireerd op de Jeep Wrangler 80th Anniversary. Duidelijke typografie, grote bedieningselementen op mobiel, overzichtelijke kaarten en tabellen. Responsief voor iPhone, tablet en computer. Vermijd drukke dashboards, kinderachtige iconen en overbodige decoratie.

### 11.2 Twee thema's, instelbaar
In **Instellingen**: **Donker**, **Licht zandkleurig** en eventueel **Automatisch (volg apparaat)**. De keuze geldt voor de **volledige app**: start, classificatie, rittenlijst, kaarten, ritdetails, rapporten/voorbeelden, Mijn Jeep, instellingen, alle submenu's, formulieren, tabellen, grafieken en meldingen in de app. Geen gemengde thema's. Voorkeur per gebruiker; leg uit of en hoe synchronisatie gebeurt. Controleer contrast en leesbaarheid in beide thema's. Voeg geen niet-besproken automatische kleurwisselingen toe.

- **Donker:** antraciet/graphite basis, subtiele zilveren details, functionele groene statusaccenten, hoog contrast.
- **Licht zandkleurig:** zand/beige basis, crème en licht taupe oppervlakken, antraciet tekst en bediening, subtiele groene accenten; niet steriel wit.

### 11.3 Mock-ups (visuele richting, géén eisen op detailniveau)
Drie aangeleverde mock-ups zijn **statische concepten, geen werkende app**. Ze tonen: startscherm met Bluetooth-status en actieve bestuurder, ritclassificatie met grote PRIVÉ/ZAKELIJK-knoppen, rit actief met snelheid/afstand/duur/verbruik, rittenlijst met tabs Alle/Privé/Zakelijk, ritdetails met kaart, Bluetooth & CarPlay-scherm, kaartenscherm met tussenstops, Mijn Jeep, rapportenoverzicht en instellingen (gebruikers & bestuurders, voorkeursadressen, voertuig & OBD2, kilometervergoeding, meldingen).

Voorbeeldpalet uit de zandversie (richting, nog te toetsen aan contrast): Sand Beige `#D7C8A7`, Antraciet `#1F2326`, Zilver `#80868B`, Groen `#4CAF50`.

**Let op, afwijkingen die Codex niet blind mag overnemen:**
- De mock-ups bevatten het **officiële Jeep-logo en -woordmerk**: niet gebruiken zonder toestemming. Maak een eigen logo; wek niet de indruk dat de app door Jeep is goedgekeurd.
- De auto op de mock-ups is een **gegenereerde afbeelding**. Presenteer die niet als echte foto van de juiste uitvoering.
- De tekst "Privé first is fiscaal veiliger" mag niet zo in de app: dit suggereert een fiscale garantie. Gebruik neutrale tekst (zie 7).
- Voorbeelddata (plaatsen, datums 2025, € 0,23/km, motorgegevens zoals 2.0 T-GDi, 280 kW, 637 Nm, trekgewicht 2.500 kg, bodemvrijheid 247 mm) is **illustratief en ongeverifieerd**.
- "TrailLog" was slechts een conceptnaam (zie 11.5).
- De mock-ups tonen onderling verschillende details (bijv. verschillende telefoons en CarPlay-scherm met knoppen). CarPlay-knoppen blijven alleen toegestaan als Apple dat officieel ondersteunt.

### 11.4 Hoofdfoto
Grote hoofdfoto van de **juiste** uitvoering (niet een willekeurige Wrangler). Controleer uitvoering/jaar, herkomst, licentie en gebruiksrechten. Gebruik bij voorkeur een eigen foto van Jesse (alleen met zijn toestemming; verzin niet dat die er is). Anders een duidelijk gemarkeerde **placeholder** plus uitleg hoe Jesse later een eigen foto toevoegt. **Jesse levert de echte foto later rechtstreeks aan Codex tijdens het bouwen aan; tot die tijd werkt de app met de gemarkeerde placeholder.** Foto schaalt goed en verdringt ritinformatie en bediening niet.

### 11.5 Appnaam en logo
Nog niet definitief. Presenteer **vijf** naamopties (professioneel, zakelijk, makkelijk uit te spreken, leesbaar op iPhone en computer, premium/robuust, geschikt voor andere voertuigen later) met korte uitleg. Onderzoek of de naam al in gebruik is en of domeinen beschikbaar lijken; claim geen juridische beschikbaarheid. Jesse kiest of stelt zelf een naam voor; gebruik die daarna overal (app, logo, login, rapporten, documentatie). Eigen logo, geen beschermde Jeep-merkvormgeving.

### 11.6 Animaties en infographics
Subtiel, hoogwaardig en **ondersteunend** (nieuwere wens gaat vóór de eerdere regel "vermijd animaties"; houd het sober). Stijl: antraciet, granietgrijs, zilver, beperkt warm amber.

- **Login/welkom:** één rustige illustratie die uitlegt: rit detecteren → route registreren → privé/zakelijk kiezen → rapportage opbouwen. Login blijft op de voorgrond. Alleen illustratieve voorbeelddata, nette statische fallback.
- **Hoofdapp, minimaal concepten voor:** (1) ritdetectie als stappenverloop, (2) route die subtiel wordt getekend (nooit de echte opgeslagen route vervangen), (3) overgang privé/zakelijk (animatie maakt nooit zelf de classificatie definitief), (4) maand-/kilometeroverzicht (eindwaarden altijd gelijk aan echte berekeningen), (5) rapport/export alleen tijdens laden of export, (6) lege staat/eerste gebruik.
- **Techniek:** bij voorkeur lichte CSS/SVG; Lottie of bibliotheken alleen met gecontroleerde licentie, grootte, compatibiliteit, toegankelijkheid en onderhoud. Geen zware video's of 3D. Respecteer `prefers-reduced-motion` en iOS-toegankelijkheid; bied een instelling om decoratieve animatie uit te zetten. Informatie nooit alleen via beweging of kleur. Geen flitsen of afleiding tijdens het rijden. Pauzeer niet-essentiële animatie op de achtergrond. Geen betaalde assets zonder toestemming.
- Maak vóór de volledige implementatie een klein visueel concept van login en belangrijkste animaties; documenteer plek en techniek; controleer dat ze ritregistratie, navigatie, toegankelijkheid en prestaties niet verstoren. **Functionaliteit, juistheid, leesbaarheid, toegankelijkheid en veiligheid gaan voor.**

---

## 12. MIJN JEEP EN OBD2

### 12.1 Mijn Jeep
Toon alleen **geverifieerde** waarden, met bronnen en vermelding van afhankelijkheid van motor/uitvoering/markt: merk, model, uitvoering, modeljaar; **kenteken (door de gebruiker ingevoerd bij Instellingen, onderdeel voertuiggegevens; wordt daarna automatisch op de fiscale rapportage gebruikt, zie hoofdstuk 10)**; lengte, breedte, hoogte, wielbasis; motor, inhoud, vermogen, koppel; brandstof/plug-in hybride, transmissie, aandrijving; trekgewicht; bodemvrijheid; doorwaaddiepte en offroadhoeken indien verifieerbaar; Bluetooth/CarPlay-info; relevante OBD2-info. Verzin niets.

### 12.2 OBD2
Nog geen adapter aangeschaft; **niet kopen zonder toestemming**. Kandidaten (geen goedgekeurde lijst): OBDLink CX, OBDLink MX+, Vgate iCar Pro 2S, Vgate iCar Pro Bluetooth 4.0 BLE, Veepeak OBDCheck BLE+. Vergelijk iOS-compatibiliteit, Bluetooth-techniek, protocollen, compatibiliteit met deze Jeep, beschikbare gegevens, achtergrondverbinding, slaapstand en stroomverbruik, beveiliging, kosten en licenties. Ga er niet van uit dat de officiële kilometerteller of alle gewenste data beschikbaar is. Ontwerp een adapterlaag zodat later toevoegen geen herbouw vraagt.

---

## 13. MCP EN AI-KOPPELINGEN

Een aparte, beveiligde **remote MCP-server (HTTPS)** boven op de centrale backend. **Eén bron van waarheid**: geen drie databases of drie versies van de logica. App/web → backend/API → database; MCP is een gecontroleerde laag erbovenop.

- Doel: koppeling met **ChatGPT, Claude en Microsoft Copilot**, alleen waar de actuele platform-, account- en plan-mogelijkheden dit ondersteunen. Neem geen universele MCP-ondersteuning aan (ook niet in gratis consumentenversies). Onderscheid consumenten-Copilot van Microsoft 365 Copilot. **Volgorde: Copilot is het eerste platform waarmee gestart wordt; daarna ChatGPT en Claude.**
- Authenticatie: OAuth 2.0 of de officieel ondersteunde flow per platform; autorisatie per gebruiker op de **server**, nooit door het model zelf.
- **Beginfase alleen lezen:** `search_trips`, `get_trip_details`, `get_trip_summary`, `list_business_addresses`, `generate_trip_report`, `validate_trip_log`. Voorstel met uitleg en onzekerheid: `suggest_trip_classification`.
- **Schrijfactie:** `update_trip_classification` alleen na expliciete bevestiging, backend-autorisatie en auditlog. Geen verwijdering of definitieve wijziging van fiscale gegevens zonder expliciete bevestiging.
- Minste rechten, geen directe database-omweg, log wie wat wanneer zonder onnodige gevoelige data, geen geheimen in frontend, prompts, repository of logs.
- Kandidaten om te onderzoeken (niet vastgelegd): TypeScript met actuele MCP-SDK; hosting zoals Cloudflare Workers. Controleer compatibiliteit, authenticatie, kosten en limieten. Begin met één platform.

---

## 14. BEVEILIGING, PRIVACY, ARCHITECTUUR, DATABASE

**Beveiliging is topprioriteit:** veilige authenticatie; passkeys waar ondersteund; Face ID/Touch ID via het platform; optionele tweestapsverificatie; veilige sessies; versleutelde overdracht; **server-side autorisatie** (nooit alleen client-side); geen API-sleutels of geheimen in frontend of Git; beperkte toegang tot locatiegegevens; auditlogs; back-ups en herstel; bewaartermijnen; veilige accountverwijdering; dataminimalisatie. Adressen, routes en locatiegeschiedenis extra beschermen. Gebruik waar mogelijk een onafhankelijke security-review per fase; zo niet beschikbaar: meld dat en doe een passende onafhankelijke controle. Los kritieke kwetsbaarheden op vóór een functie als gereed geldt.

**Platform en installatie:** een webapp alleen is niet genoeg als die geen betrouwbare achtergrondregistratie kan. Onderzoek de beste combinatie native iPhone-app + backend + database + webinterface. Onderzoek installatie en updates voor drie iPhones (App Store, TestFlight, andere door Apple toegestane opties) inclusief kosten, certificaten, verlengingen en beperkingen; Jesse wil jaarlijkse kosten en frequent handmatig herinstalleren zoveel mogelijk vermijden. Geen betaalde diensten activeren zonder toestemming.

**Computerinterface minimaal:** inloggen; ritten bekijken en corrigeren; classificeren; interactieve routekaarten; adressen beheren; rapporten maken en exporteren; gebruikers en instellingen; veilige synchronisatie.

**Database:** veilig en uitbreidbaar, met relaties en integriteitscontroles voor gebruikers/rechten, voertuigen, ritten en voorlopige detecties, bestuurders, GPS-routepunten, vertrek-/aankomstlocaties, classificaties, kilometerstanden, vergoedingstarieven, rapporten, correcties en auditlogs, geregistreerde apparaten, OBD2-apparaten, zakelijke voorkeursadressen, instellingen en prioriteitsregels. Voorkom dubbele definitieve ritten; bewaar genoeg historie om rapporten achteraf te controleren. Documenteer keuzes en migraties.

**Plugins, skills en integraties:** onderzoek zowel beschikbare als nog niet gekoppelde tools (iOS, GPS, achtergrondregistratie, Apple Kaarten, Bluetooth/OBD2, UI/UX, logo, backend, authenticatie, beveiliging, testen, PDF/CSV, fiscaal). Vergelijk op functionaliteit, compatibiliteit, kosten, licentie, betrouwbaarheid, beveiliging, machtigingen, onderhoud en risico. Installeer of koppel niets met kosten of gevoelige toegang zonder toestemming.

---

## 15. TESTEN EN KWALITEIT

Maak een concreet testplan en test minimaal: inloggen/uitloggen/rechten; synchronisatie tussen gebruikers, iPhone en computer; automatische ritstart en -einde; Bluetooth-verbinding en meldingen; beschikbare CarPlay-interactie; bestuurdersprioriteit; dubbele ritdetectie; GPS-, Bluetooth- en OBD2-uitval; classificatie; voorkeursadressen; kaarten en routes; correcties en auditlogs; kilometerberekeningen; PDF/CSV-export en lange rapporten; waarschuwingen bij ontbrekende data; autorisatie en gegevensafscherming; achtergrondgedrag op iOS; beide thema's volledig; animaties (reduced-motion, schermlezer, prestaties); MCP-tools; regressies na elke wijziging.

Test waar mogelijk op echte iPhones. Documenteer wat alleen gesimuleerd is en welke praktijktests nog nodig zijn (bijv. OBD2 zonder hardware). **Verzin geen testresultaten.**

---

## 16. TAAK 1: WAT CLAUDE MOET LEVEREN (ANALYSE EN PLANNING)

Lees dit hele bestand voordat je iets schrijft. Onderzoek actuele, officiële bronnen (met link en raadpleegdatum) voor: iOS-achtergrondlocatie, GPS en ritdetectie, Bluetooth-detectie en meldingen, CarPlay en toegestane appfuncties, Apple Kaarten, beveiligde accounts en synchronisatie, Nederlandse fiscale eisen voor rittenregistratie, PDF/CSV, remote MCP, ChatGPT/Claude/Microsoft Copilot, OAuth, hosting/databases en terugkerende kosten.

Deel elke functie in:
- **A.** Technisch bevestigd.
- **B.** Onder voorwaarden mogelijk.
- **C.** Eerst praktisch testen.
- **D.** Niet ondersteund of mogelijk niet toegestaan.

En deel de eisen in vier groepen: **(A) MVP, (B) volgende fase, (C) eerst onderzoeken/testen, (D) mogelijk niet haalbaar/niet toegestaan**, met per onderdeel de reden.

**Uitvoer in deze volgorde:**
1. Managementsamenvatting.
2. Analyse van de specificatie.
3. Tegenstrijdigheden en ontbrekende informatie.
4. Tabel MVP / later / onderzoek / mogelijk niet haalbaar, plus technische risico's.
5. Aanbevolen architectuur (eenvoudig uitgelegd).
6. Beveiligings- en privacyanalyse.
7. Technische haalbaarheid van MCP, iOS en CarPlay.
8. Kosten, terugkerende kosten en afhankelijkheden.
9. Alleen de noodzakelijke vragen aan Jesse (veilige, omkeerbare aannames noteer je en ga je mee verder).
10. **De volledige nieuwe Codex-bouwprompt in één codeblok** (zie hoofdstuk 17).
11. Controlelijst om te controleren of alle wensen uit dit bestand behouden zijn.
12. Bronnen met directe links en raadpleegdatum.

Lever niet alleen advies: schrijf de volledige Codex-prompt. Claim niet dat de app al gebouwd is.

### Reeds herkende aandachtspunten (voor Claude om te beoordelen)
- Modeljaar 2021 vs. "4xe": uitvoering en modeljaar verifiëren.
- Intake-eerst (hoofdstuk 18) vs. "autonoom doorwerken": definitie van wat echt een vraag aan Jesse waard is.
- Eerdere regel "vermijd animatie" vs. latere wens voor subtiele infographics: nieuwste wens geldt, in sobere vorm.
- Mock-ups tonen elementen (Jeep-logo, CarPlay-knoppen, motorgegevens, vergoedingstarief, "fiscaal veiliger") die niet zonder verificatie of toestemming mogen worden overgenomen.
- CarPlay-knoppen, Bluetooth-melding bij elke verbinding en MCP in gratis consumentenversies zijn **onbewezen**.
- Telefoonprioriteit is een tie-breaker, geen bewijs van wie rijdt.

---

## 17. TAAK 2: WAT DE CODEX-BOUWPROMPT MOET BEVATTEN

Claude schrijft een zelfstandige, direct kopieerbare prompt die Codex opdraagt om:
1. **Eerst de bestaande repository en bestanden te inspecteren**, de huidige werking en architectuur vast te leggen en bestaande functionaliteit te behouden.
2. Een duidelijk plan te maken, ontbrekende informatie te benoemen en alleen noodzakelijke vragen te stellen.
3. De goedgekeurde MVP **gefaseerd** te bouwen (zie fasering hieronder) met concrete acceptatiecriteria per fase.
4. Tests uit te voeren en resultaten vast te leggen; regressies te controleren.
5. Beveiligingsproblemen te onderzoeken en op te lossen.
6. Geen onbewezen mogelijkheden te claimen, geen betaalde diensten/hardware/publicatie/onomkeerbare acties zonder toestemming, geheimen alleen server-side.
7. Alle wensen uit dit bestand te behouden (ook latere fasen als toekomstige eis), en **geen** Codex-aan/uit-functie toe te voegen.
8. Een **eerlijk eindrapport** te leveren: wat gebouwd is, wat getest is (en hoe: automatisch, simulator, echte iPhone), wat nog afhangt van hardware/machtigingen/diensten, gevonden en opgeloste beveiligingsproblemen, beperkingen en terugkerende kosten.

**Bouwfasen (volgorde mag aangepast als onderzoek dat verstandiger maakt):**

| Fase | Onderdeel | Acceptatiepunt |
|---|---|---|
| 1 | Onderzoek, intake, vijf appnamen, tools, kosten/risico's | Eerst vragen en onderzoek; niet direct programmeren |
| 2 | Architectuur, database, beveiliging, UX incl. beide thema's | Belangrijke keuzes vastgelegd |
| 3 | Basisapp: login, rollen, sync, webinterface | Backend-autorisatie; geheimen server-side |
| 4 | GPS, achtergrondregistratie, Bluetooth, meldingen | Echte iPhone-tests; iOS-limieten gedocumenteerd |
| 5 | Classificatie, bestuurdersprioriteit, deduplicatie | Prioriteit is geen bewijs van bestuurder |
| 6 | Zakelijke voorkeursadressen en snelle privé/zakelijk-keuze | Geen automatische zekerheid |
| 7 | Kaarten en ritdetails, Apple Kaarten | Geen stilzwijgende routevervanging |
| 8 | Mijn Jeep, OBD2-adapterlaag | Alleen geverifieerde bronnen; geen aankoop zonder toestemming |
| 9 | Rapportage: PDF/CSV, controles, vergoeding, audit trail | Actuele fiscale eisen; geen garantie claimen |
| 10 | MCP: eerst read-only, daarna bevestigde schrijfacties | Begin met één platform; alleen waar ondersteund |
| 11 | Beveiligingsreview, QA, regressies, privacy, back-ups, testverslag | Teststatus eerlijk gedocumenteerd |
| 12 | Installatie, updates, documentatie, kostenoverzicht | Geen betaalde publicatie zonder toestemming |

**Eindresultaat (voor zover technisch uitvoerbaar en na nodige machtigingen):** werkende iPhone-app; webinterface; veilige backend en database; automatische ritdetectie; Bluetooth-gerelateerde melding waar iOS dit toestaat; ondersteunde CarPlay-keuze indien haalbaar; bestuurdersprioriteit met bevestiging bij onzekerheid; controle op dubbele ritten; grote PRIVÉ/ZAKELIJK-knoppen; zakelijke voorkeursadressen; interactief rittenoverzicht met kaarten; uitbreidbare OBD2-laag; Mijn Jeep met gecontroleerde gegevens; configureerbare kilometervergoeding; PDF/CSV-rapportage; controleerbare fiscale registratie; eigen naam en logo; veilige accounts voor Dennis, Ingrid en Jesse; synchronisatie; MCP-laag waar ondersteund; testresultaten en beveiligingsbevindingen; installatie- en update-instructies, kostenoverzicht en beperkingen.

---

## 18. INTAKEVRAGEN AAN JESSE (alleen wat echt nodig is, gebundeld per onderwerp)

Onderzoek technische feiten eerst zelf; vraag alleen naar voorkeuren, ontbrekende informatie en beslissingen die Jesse moet nemen. Onderwerpen: appnaam en huisstijl; gebruikers en bestuurders; automatische ritdetectie; classificatie; bestuurdersherkenning en prioriteit; Bluetooth-meldingen en CarPlay; OBD2-hardware; fiscale situatie en kilometervergoeding; kaarten en routegegevens; standaard zakelijke adressen; beveiliging en privacy; computergebruik en synchronisatie; installatie, updates en kosten; back-ups, beheer en onderhoud; voertuigdocumenten en eigen foto; welk AI-platform eerst voor MCP. Gebruik begrijpelijke taal en waar mogelijk keuzelijsten. Zijn niet alle vragen beantwoord: bepaal wat echt nodig is en kies veilige, omkeerbare standaarden.

---

## 19. CONTROLELIJST: BEHOUDEN WENSEN

Vink af zodra Claude's analyse en de Codex-prompt het bevatten:

- [ ] Voertuig: Jeep Wrangler Unlimited 80th Anniversary 4xe, uitvoering/jaar geverifieerd
- [ ] Native iPhone-app + webinterface + centrale backend/database + sync
- [ ] Drie gebruikers (Dennis, Ingrid, Jesse), allen beheerder en bestuurder, auditlog
- [ ] Automatische ritdetectie (GPS, beweging, Bluetooth, CarPlay/OBD2 waar mogelijk), GPS als terugval
- [ ] Bluetooth-melding waar iOS dit toestaat, lokale melding vs. push correct benoemd
- [ ] Grote PRIVÉ/ZAKELIJK-knoppen, één tik, privé als standaard
- [ ] CarPlay alleen officieel toegestaan, anders fallback
- [ ] Prioriteit Dennis → Ingrid → Jesse als tie-breaker, geen bewijs, bestuurder-onbekend mogelijk
- [ ] Deduplicatie, voorlopig/definitief, samenvoeggeschiedenis
- [ ] Privé eerst; geen fiscale garantie in de app
- [ ] Zakelijke voorkeursadressen in Instellingen met uitleg en historie
- [ ] Rittenlijst met kaartpreview, filters, detailkaart, drie routesoorten gescheiden
- [ ] Kilometervergoeding met historisch tarief, geen verzonnen tarief
- [ ] PDF/CSV, validaties vóór export, audit trail
- [ ] Mijn Jeep met geverifieerde data en bronnen
- [ ] Kenteken invoerbaar in Instellingen en zichtbaar op fiscale rapportage
- [ ] OBD2-adapterlaag, geen aankoop zonder toestemming
- [ ] Donker én licht zandkleurig thema, instelbaar, in de hele app incl. submenu's
- [ ] Echte hoofdfoto met rechtencontrole of gemarkeerde placeholder
- [ ] Vijf appnamen, eigen logo, geen beschermde Jeep-merkvormgeving
- [ ] Subtiele animaties/infographics met toegankelijkheid en statische fallback
- [ ] Remote MCP (read-only eerst, bevestigde schrijfacties, OAuth, server-side autorisatie) voor ChatGPT/Claude/Copilot waar ondersteund
- [ ] Beveiliging: passkeys, biometrie, MFA, server-side autorisatie, geen geheimen in frontend/Git, back-ups, bewaarbeleid
- [ ] Installatie en updates voor drie iPhones, kosten inzichtelijk
- [ ] Testplan, regressies, eerlijk eindrapport
- [ ] Geen Codex-aan/uit-functie

---

## 20. BRONNEN VAN DIT BESTAND

- Oorspronkelijke Codex-prompt (22 hoofdstukken, 614 regels), samengevoegd in hoofdstukken 1–15.
- Master-aanvullingen A–J (voertuignaam, thema's, foto, classificatie, prioriteit, adressen, kaarten, MCP, samenwerking, uitsluiting).
- Projectoverzicht (Excel): functionele eisen, gebruikers, design, MCP, OBD2-kandidaten, bouwfasen.
- Drie design-mockups (donker Jeep-concept, donker rittenregistratie-concept, zand/"TrailLog"-concept): visuele richting, geen bewijs van haalbaarheid.
- Gesprekken 15–16 oktober 2026: wensen, geen bewijs van technische haalbaarheid.

---

## 21. AANVULLENDE BEVESTIGDE CONTEXT EN OPEN VRAGEN (17 OKTOBER 2026)

- De Jeep is **privé-eigendom van Dennis (vader)** en wordt ook zakelijk gebruikt. De onderneming is een **VOF**; als vennoten zijn **Dennis en oma** genoemd. Of Ingrid (moeder) en oom vennoot zijn, is **niet bevestigd**. Appgebruikers, bestuurders, eigenaars en VOF-vennoten zijn verschillende rollen. Fiscale behandeling moet apart worden onderzocht en geverifieerd.
- Er is een **GitHub-repository**, maar een koppeling met **Cloudflare is niet tot stand gebracht** volgens de laatst bevestigde projectstatus. Ga niet uit van een actieve Cloudflare-hosting, backend of database.
- Ingrid gebruikt **Microsoft Copilot via haar werkgever/werkpakket**; dit bewijst niet dat een MCP-koppeling is toegestaan of technisch beschikbaar. Onderzoek accountrechten, licentie en toestemming voordat je koppelt.
- De opdrachtgever wil een **centrale Astra-Opper-agent**, die eerst Markdown-bestanden controleert en verbetert, vervolgens eerder door Sol gebouwd werk controleert en verbetert, en daarna de resterende fasen bouwt met subagents die passende, daadwerkelijk beschikbare modellen mogen gebruiken.
- De Operator Agent houdt `OWNER_ACTIONS.md` bij voor persoonlijke acties; de Tool Scout onderzoekt eerst gratis en bestaande opties. Twee cybersecurity-reviewers blijven onafhankelijk beoordelen voor zover de tooling dat daadwerkelijk mogelijk maakt.

**Procesbron:** `RitKompas_Astra_Opperagent_Complete_Opdracht.md`. Dit hoofdstuk corrigeert geen onzekere technische of fiscale feiten tot bewezen feiten.


## 22. OWNER_ACTIONS — AANGEPASTE WERKWIJZE

De Astra Opper-agent blijft het enige vaste aanspreekpunt. De Operator Agent onderhoudt `OWNER_ACTIONS.md` uitsluitend voor persoonlijke acties van de opdrachtgever, met behoud van bestaande ACT-nummers en historie. Tool Scout onderzoekt eerst bestaande en gratis alternatieven. Interne modelkeuze, agentcoördinatie, implementatie en controles worden niet als persoonlijke taak geregistreerd, behalve wanneer kosten, machtigingen of wezenlijke besluiten expliciete toestemming vereisen. Controleer `OWNER_ACTIONS.md` tijdens de Markdown-audit en na iedere fase. Zie `OWNER_ACTIONS_ASTRA_AANVULLING.md` voor de volledige wijzigingsinstructie.

---

## NIEUWSTE PROCESAFSPRAAK: SOL ALS DAGELIJKSE OPPER-AGENT (17 oktober 2026)

Deze afspraak gaat voor op oudere procespassages over Astra als permanente Opper-agent en Claude-eerst. Alle functionele, privacy-, veiligheids- en toestemmingseisen blijven bestaan.

1. Sol leidt dagelijks de Markdown-audit, controle van eerder gebouwd werk en alle volgende ontwikkelfases.
2. Astra wordt alleen gevraagd bij belangrijke architectuur-, beveiligings- of andere zwaarwegende technische beslissingen, nooit automatisch na iedere fase.
3. Model Strategy adviseert het lichtste werkelijk beschikbare model dat de vereiste kwaliteit haalt. Sol coördineert subagents en twee securityreviews.
4. Vermijd herhaalde volledige context, onnodige parallelle agents en dubbele audits. Gebruik compacte beslisdossiers voor Astra.
5. Indien instelbaar: Medium redeneerinspanning als standaard, Low voor eenvoudige taken, High voor complexe beslissingen. Codex moet beschikbaarheid verifiëren en mag geen automatische modelwissel of usage-limiet verzinnen.
6. OWNER_ACTIONS blijft alleen voor persoonlijke acties. Alle bestaande functionele eisen blijven behouden.
7. Zie sectie 7 van RitKompas_Astra_Opperagent_Complete_Opdracht.md voor de uitvoeringsregels.
