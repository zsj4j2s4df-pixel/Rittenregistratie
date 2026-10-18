# iPhone-onderzoek — 17 oktober 2026

Ondersteuningsdoel: iPhone 11 Pro en nieuwere modellen. Geen simulator of echte iPhone getest. De door gebruiker genoemde iOS 26.6.2 is niet als geïnstalleerde versie geverifieerd. Nieuwe modellen zijn doel, niet automatisch getest.

## Achtergrondlocatie

Apple beschrijft dat iOS achtergrondapps kan pauzeren. Voor tijdige locatie-updates zijn expliciete configuratie, passende toestemming en achtergrondsessies nodig. Bij herstart moeten de relevante services worden hervat; toestemming mag niet worden verondersteld. Dit onderbouwt een native client, maar garandeert geen ononderbroken registratie. Bron, geraadpleegd 17-10-2026: [Handling location updates in the background](https://developer.apple.com/documentation/corelocation/handling-location-updates-in-the-background). De officiële Markdown-versie is gelezen omdat de documentatiepagina JavaScript vereist.

Ontwerp: toestemming en servicestatus zichtbaar; offline punten lokaal beschermen; ontbrekende segmenten markeren, niet stilzwijgend met berekende routes vullen. Eerst gemeten GPS-punten, aparte onzekerheidsstatus. Praktijktests voor energie, beëindiging/herstart, geweigerde rechten, parkeergarage, korte stops en netwerkuitval blijven verplicht. Minimum-iOS/API-keuze wordt pas definitief na compileerbare proef en apparaatcontrole.

## CarPlay

Apple noemt driving-task-apps en een entitlementaanvraag. Dat bevestigt niet dat deze rittenapp of de gewenste knoppen worden toegelaten. Bron, geraadpleegd 17-10-2026: [CarPlay for app developers](https://developer.apple.com/carplay/). Besluit: geen CarPlay-interface beloven of bouwen via een omweg; eerst categorie/aanvraag en concrete templates toetsen. iPhone-classificatie blijft de terugvaloptie.

## Gratis persoonlijke installatie

Apple beschrijft een Personal Team voor testen via Xcode zonder programm lidmaatschap. De genoemde provisioningprofielen verlopen na zeven dagen, waarna opnieuw bouwen/installeren nodig is; er gelden ook apparaat-/app-limieten. Dit botst met de wens weinig handmatig te herinstalleren. Bron, geraadpleegd 17-10-2026: [Developer account overview](https://developer.apple.com/help/account/basics/about-your-developer-account).

Nog geen lidmaatschap of installatie gevraagd: eerst lokaal native prototype en distributie-alternatieven verder uitwerken. Betaalde distributiekosten en eventuele uitzonderingen nog afzonderlijk onderzoeken, geen bedrag aangenomen. Accounts zijn niet geopend of gekoppeld.

## Nog open

Betrouwbare Bluetooth-trigger voor deze Jeep, mogelijkheden van meldingsacties, batterijmetingen, exacte minimum-iOS-versie, distributiekeuze en CarPlay-toelating. Een Bluetooth-audioverbinding mag niet als bewezen universele apptrigger gelden. Voor deze punten nog geen implementatieacceptatie.
