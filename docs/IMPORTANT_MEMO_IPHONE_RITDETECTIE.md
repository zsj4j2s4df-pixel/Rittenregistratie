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

## Acceptatie
Een echte iPhone-test toont: verbinding met Jeep -> melding -> keuze via meldingsactie -> correcte ritregistratie -> betrouwbaar einde -> nieuwe rit bij volgend vertrek. Meld duidelijk wat iOS/CarPlay niet kan of wat nog niet getest is.
