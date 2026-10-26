# Codex-opdracht: automatische ritstart met snelle classificatie

## Eerst beoordelen

Voordat je iets bouwt, onderzoek je eerst wat er in de app en backend al is geïntegreerd, bijvoorbeeld ritstart, achtergrondlocatie, Bluetooth-herkenning, meldingen, classificatie en synchronisatie. Beoordeel daarna wat je functioneel kunt toevoegen of aanpassen, en bouw alleen wat nog ontbreekt. Leg kort vast wat je gevonden hebt en wat je gaat veranderen, en bouw daarna pas.

## Doel

Zodra de iPhone verbindt met de Bluetooth van de auto, start er automatisch een rit en kan de gebruiker met één handeling kiezen of die privé of zakelijk is, zonder de telefoon te hoeven ontgrendelen.

## Gedrag

De app herkent de Bluetooth-verbinding met de auto van de ingelogde gebruiker en start dan een rit met begintijd en locatie. Er verschijnt direct een lokale melding met twee actieknoppen, Privé en Zakelijk. Tikken op een knop classificeert de rit zonder dat de app opent.

Standaard is een rit privé, in lijn met privé-eerst. Wordt er niet gekozen, dan blijft de rit privé, tot de gebruiker hem achteraf wijzigt.

## Siri

Voeg twee App Intents toe met de zinnen "privé rit" en "zakelijke rit", zodat de keuze ook met stem kan, ook via CarPlay en de auto.

## Tijdens en na de rit

Tijdens de rit logt de app locatie op de achtergrond. Bij verbreken van de verbinding wordt de rit afgesloten met eindtijd, eindlocatie en afstand, en gesynchroniseerd met de backend.

## Randvoorwaarden

Gebruik geen CarPlay-scherm van de app zelf, want daar is toestemming van Apple voor nodig. Het moet werken voor Dennis, Ingrid en Jesse, elk met eigen instellingen. Locatie op de achtergrond en meldingen vragen toestemming bij eerste gebruik.
