# Persoonlijke Opdrachten-route — testplan, geen autostartinrichting

Gecontroleerde Apple-documentatie26oktober voor iOS26:
- Bluetooth: https://support.apple.com/guide/shortcuts/apde31e9638b/9.0/ios/26
- CarPlay: https://support.apple.com/guide/shortcuts/apd8ebfc4e8e/9.0/ios/26

Apple documenteert Bluetooth verbinden met gekozen apparaat. Geen algemene
Bluetoothverbreektrigger beloven. CarPlay documenteert verbinden én verbreken.
Dit is documentbewijs, nog geen test op de Jeep of drie eigen iPhones.

## Nu alleen expliciete classificatie testen

Na signed installatie en eigen native sessie: open Opdrachten → zoek RitKompas →
controleer Privé rit/Zakelijke rit. Er moet exact één actueel geverifieerd open
voorstel bestaan. Een synthetische lokale testfixture mag geen live neprit maken.
Beide acties bewaren een keuze lokaal; centrale verzending blijft apart bevestigd.
Ze starten/stoppen geen rit. Gebruik ze dus niet als automatische verbindingsactie
om een willekeurig oud voorstel bij instappen te classificeren.

Spreek na eigen toestemming ‘Privé rit met RitKompas’ of ‘Zakelijke rit met
RitKompas’. Korte namen zonder appnaam alleen via een persoonlijk benoemde
Opdracht testen; niet als universeel herkend presenteren. Persoonlijke Siri-/Focus-
lockscreeninstellingen door eigenaar zelf laten kiezen; niets verzwakken.

## Latere triggeradapter — AUTO01–06 eerst bouwen

Op echte telefoon: Opdrachten → Automatisering → nieuwe persoonlijke automatisering
→ Bluetooth → kies uitsluitend eigen Jeepverbinding; noteer beschikbare uitvoeren-
opties zonder deze nu aan een niet-bestaande ritstart te koppelen. Voor CarPlay:
Automatisering → CarPlay → verbinding/verbreking afzonderlijk inspecteren.
De exacte Nederlandse labels en uitvoeren-bij-vergrendeling op ieder toestel
verifiëren; nooit van documentatie alleen een runtime-PASS maken.

Pas na echte start/stopintents en actieve-ritcoördinatie mag dit de opname aansturen.
Tot dan expliciete bediening voor bestaande voorgrond-GPS-proef en stoppen als
eerlijke terugval; geen complete automatische rit of ritafstand suggereren.

## Matrix voor de volgende aanwezige eigenaar

Per Dennis/Ingrid/Jesse: juiste eigen account, geen/één/meerdere/oude voorstellen,
vergrendeld/ontgrendeld, Focus, offline, na herstart/first-unlock, forcequit,
accountwissel, connect/reconnect/disconnect en twee-minutenstop/EV. Alle echte
uitkomsten momenteel NIET GETEST. Test stilstaand of als passagier. Geen OBD2aankoop,
nieuw CarPlayentitlement, permanente achtergrondaudio of nieuwe bevoegdheden.
