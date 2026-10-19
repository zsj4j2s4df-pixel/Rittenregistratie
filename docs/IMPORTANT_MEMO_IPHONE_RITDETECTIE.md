# BELANGRIJK MEMO — RitKompas: iPhone-ritdetectie en snelle ritkeuze
Datum: 19 oktober 2026
Status: ontwerpbesluit / hoge prioriteit; technische haalbaarheid nog te controleren
Project: Jeep Wrangler 4xe (2021), drie iPhone-gebruikers, voertuiggerichte rittenregistratie

## Doel
Maak ritten registreren zo eenvoudig mogelijk: de bestuurder stapt in, kiest met één handeling **Zakelijk** of **Privé**, rijdt, en de rit wordt bij werkelijk einde automatisch opgeslagen. Geen verplichte app-opening voor iedere rit.

## Prioriteiten
1. **Voorkeur:** twee grote knoppen op het CarPlay-scherm, mits Apple dit voor deze app-categorie toestaat. Onderzoek CarPlay-entitlements, geschikte categorieën en de beperking dat CarPlay niet vrij automatisch apps kan openen. Niet aannemen dat een gewone rittenregistratie-app wordt toegelaten.
2. **Praktische hoofdroute:** een **native iOS-app** met een lokale interactieve notificatie (UNNotificationCategory + UNNotificationAction) met de acties 'Zakelijk' en 'Privé'. De keuze moet zo mogelijk zonder het openen van de app worden verwerkt. Op een vergrendelde iPhone kunnen de acties pas na uitklappen/ingedrukt houden zichtbaar zijn; sommige acties kunnen ontgrendeling vragen. Test dit op echte iPhones. Webpush alleen is geen gelijkwaardige garantie.
3. Onderzoek hoe een iPhone de verbinding met de Jeep (Bluetooth, bedrade CarPlay, eventuele Shortcuts-automatisering, bewegings-/locatiesignalen) betrouwbaar en binnen iOS-achtergrondbeperkingen herkent. Een koppeling is niet hetzelfde als gegarandeerde detectie van het starten van een rit.
4. Onderzoek OBD2 alleen als optionele aanvulling voor nauwkeurige voertuig-/kilometergegevens; controleer ondersteuning specifiek voor Wrangler 4xe 2021. Koop niets zonder toestemming.

## Ritstart en riteinde
- Begin een rit bij betrouwbaar bewijs van vertrek; laat zakelijke/privékeuze snel plaatsvinden, maar verlies de rit niet als de melding wordt gemist. Bied latere classificatie aan.
- Sluit automatisch af als het voertuig daadwerkelijk is gestopt en de rit is beëindigd; een verbroken Bluetooth-/CarPlay-verbinding alleen is onvoldoende.
- **Nieuwe rit na echt einde:** ook wanneer een bestuurder bij een klant na twee minuten opnieuw vertrekt.
- **Geen nieuwe rit** bij stoplicht, file of andere onderbreking zonder werkelijk riteinde.
- De 4xe rijdt ook elektrisch: vertrouw niet uitsluitend op het draaien van de benzinemotor.
- Bewaar GPS-route, tijd, vertrek-/aankomstlocatie, kilometerstanden waar betrouwbaar beschikbaar, ritsoort en auditgeschiedenis. Laat correcties achteraf toe. Valideer fiscale vereisten voor een privé-eigendom auto die zakelijk wordt gebruikt; claim niet zonder controle dat één ritdefinitie fiscaal verplicht is.

## Opdracht aan Codex Cloud-manager
- Lees dit memo bij planning en vertaal het naar geprioriteerde taken in de bestaande projectplanning.
- Controleer eerst bestaande code, masterprompt, issues en PR's; vermijd dubbel werk.
- Onderzoek en prototypeer de iOS-interactieve notificatie en verbindingstriggers; documenteer beperkingen, privacy, batterijimpact en testresultaten.
- Bouw waar mogelijk de veilige basisfunctionaliteit zelfstandig, met tests en fallback voor gemiste meldingen of onzekere riteinden.
- Maak branches/PR's; **niet naar main mergen zonder expliciete eigenaarstoestemming**. Geen kosten, aankopen, nieuwe accounts of productiepublicatie zonder toestemming.
- Verwijs vanuit AGENTS.md / RESUME.md / CLOUD_TASKS.md naar dit memo zodra die bestanden beschikbaar zijn, zodat toekomstige runs dit besluit meenemen.


## Onderzoek aankoopadvies: OBD2 en draadloze CarPlay (hoge prioriteit)
- Onderzoek eerst of de bestaande Jeep-Bluetoothverbinding voor ritdetectie bruikbaar is; onderscheid gewone Bluetooth, CarPlay en toegang tot voertuiggegevens.
- Vergelijk **OBDLink MX+** en **vLinker MC+** voor Jeep Wrangler 4xe 2021: iOS/Bluetooth LE, uitleesbare kilometerstand, voertuigsnelheid, ritstart/einde, sluipverbruik, veiligheid, betrouwbaarheid, prijs en verkrijgbaarheid in Nederland. Benoem expliciet wat nog niet is bevestigd en of de app rechtstreeks met de adapter kan communiceren.
- Onderzoek **draadloze Apple CarPlay-adapters** (bijvoorbeeld Carlinkit en Ottocast) die de bestaande bedrade CarPlay omzetten naar draadloos. CarPlay gebruikt Bluetooth en wifi; een gewone Bluetooth-dongle is niet voldoende. Controleer eerst of de Jeep de vereiste bedrade CarPlay ondersteunt.
- **Harde gebruikswens:** bij meerdere telefoons tegelijk in de Jeep krijgt de iPhone van **vader altijd de hoogste verbindingsprioriteit**. Voorkeursvolgorde: (1) vader, (2) moeder, (3) derde iPhone. Test of de gekozen adapter een **vaste instelbare prioriteit** ondersteunt en wat gebeurt bij gelijktijdig instappen, opnieuw verbinden en wanneer vader later instapt. Verwar 'laatst verbonden' niet met echte vaste prioriteit. Als dit niet kan, geef dat duidelijk aan en stel een praktisch alternatief voor.
- Stel vader binnen RitKompas in als **hoofdgebruiker/voorkeursbestuurder**, maar maak onderscheid tussen CarPlay-voorrang en wie werkelijk rijdt. Zorg dat ritten niet dubbel worden opgeslagen wanneer meerdere iPhones in de auto zijn.
- Geef een **korte concrete kooplijst** met modellen, actuele prijzen, voor- en nadelen, bewezen compatibiliteit en een advies. **Geen bestelling of uitgaven zonder toestemming.**

## Samenwerking Codex Cloud en Codex Mac
- **Codex Cloud is projectleider** voor onderzoek, planning, code en documentatie. **Codex Mac** voert waar nodig lokale tests uit op echte iPhones, de Jeep, CarPlay en OBD2-hardware.
- Laat Codex Cloud concrete, controleerbare testopdrachten voor Codex Mac opstellen in GitHub-issues of een gedeeld takenbestand, inclusief teststappen en gewenste terugkoppeling.
- Controleer of directe taakoverdracht van Codex Cloud naar Codex Mac technisch beschikbaar en geautoriseerd is. **Ga niet uit van automatische aansturing zonder bewezen koppeling**; gebruik anders GitHub als overdracht.
- Leg testresultaten, beperkingen en beslissingen centraal vast zodat beide agents dezelfde informatie gebruiken.
- Geen merge naar main, aankopen, nieuwe betaalde diensten of publicatie zonder toestemming.


## Eerste actie: bewijs samenwerking Cloud ↔ Mac
- Onderzoek of Codex Cloud daadwerkelijk rechtstreeks taken naar Codex Mac kan sturen en resultaten kan ontvangen, met de huidige beschikbare koppelingen en bevoegdheden.
- Voer alleen als het technisch mogelijk is een **kleine, veilige testopdracht** uit, zonder gevoelige gegevens, kosten, merge of wijzigingen aan main. Registreer opdracht, ontvangst en terugkoppeling.
- Als directe overdracht niet mogelijk is: leg een concrete testtaak in GitHub vast en beschrijf hoe Codex Mac die kan oppakken en het resultaat kan terugmelden. Doe niet alsof GitHub-registratie hetzelfde is als automatisch uitvoeren.
- Rapporteer expliciet: (1) werkt directe samenwerking automatisch, (2) welke instelling/toestemming is eventueel nodig, (3) aan welke agent moet de gebruiker voortaan opdrachten geven, (4) welke test is daadwerkelijk uitgevoerd en met welk resultaat.
- **Voer deze controle eerst uit**, zodat de gebruiker weet aan wie volgende prompts moeten worden gestuurd.

## Acceptatie
Een echte iPhone-test toont: verbinding met Jeep -> melding -> keuze via meldingsactie -> correcte ritregistratie -> betrouwbaar einde -> nieuwe rit bij volgend vertrek. Meld duidelijk wat iOS/CarPlay niet kan of wat nog niet getest is.

