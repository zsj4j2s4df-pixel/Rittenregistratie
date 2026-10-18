# Haalbaarheid en kosten — vooronderzoek voor documentaudit

Raadpleegdatum: 18 oktober 2026. Dit is brononderzoek, geen praktijktest of goedgekeurde architectuur.
A = technisch mechanisme bevestigd; B = voorwaarden; C = praktijktest nodig; D = niet aangetoond/toegestaan voor dit doel.
Scopekolommen zijn voorstellen. Geen functionele eis wordt geschrapt.

## Kernbevindingen

| Onderdeel | Haalbaarheid | Scopevoorstel en implicatie | Bron |
|---|---|---|---|
| Achtergrondlocatie | B/C | Kern/MVP, maar native prototype en echte iPhones vereist; configuratie en machtigingen zijn geen garantie voor ononderbroken ontvangst. | S01 |
| Bluetooth als ritstart | C | Onderzoek vóór belofte; achtergrondgebeurtenissen zijn beperkt. Een Core Bluetooth-voorbeeld bewijst geen universele toegang tot de Jeep-audioverbinding. GPS-terugval behouden. | S02 |
| PRIVÉ/ZAKELIJK in melding | A voor actieknoppen, B/C voor aflevering en gedrag | Eerst lokale melding onderzoeken; registratie van een actie bewijst geen Bluetooth-trigger. App-scherm blijft fallback. | S03 |
| CarPlay | B/C; geen goedkeuring voor RitKompas bewezen | Apple noemt onder meer driving task apps, widgets en Live Activities. Onderzoek categorie, OS, templates en entitlement; niet categorisch onmogelijk verklaren en geen willekeurige knoppen beloven. iPhone-fallback behouden. | S04 |
| iPhone-installatie zonder betaling | B | Gratis Personal Team geschikt voor prototype; herprovisionering na zeven dagen past slecht bij de wens weinig handmatig onderhoud. Geen distributiekeuze gemaakt. | S05 |
| Beta-distributie | B | TestFlight-build maximaal 90 dagen, dus geen permanent onderhoudsvrije installatie. Developer-lidmaatschap nog niet bevestigd. | S06, S07 |
| Interactieve webkaart | A/B | MapKit JS biedt overlays/annotaties en kent lidmaatschapsquota; routeweergave bewijst geen automatische ritregistratie. Exacte sleutel-/token- en privacyinrichting nog toetsen. | S08 |
| Fiscale administratie | B, toepasbaarheid te bevestigen | Export en waarschuwingen kern; privé-eigendom en VOF-rollen niet verwarren met auto-van-de-zaak/bijtelling. Een volledig rapport is geen fiscale goedkeuring. | S09–S11 |
| Copilot als eerste MCP-platform | B | Microsoft 365 federated connectors kennen MCP, maar vragen onder meer beheerrechten. Werkgeversaccount geen toestemming. Eerst licentie, gekozen extensieroute en werkgeverstoestemming verifiëren. | S12 |
| Remote MCP | A/B | Onderzoek/volgende integratiefase; één backend; leesrechten eerst. Compatibiliteit per platform en protocolversie testen. | S13–S16 |
| Cloudflare Workers/D1 | B | Kandidaten, niet gekozen/geactiveerd. Gratis limieten en CPU-budget kunnen met routeverwerking/PDF botsen; indexering en meetbare workload nodig. | S17, S18 |
| OBD2 en officiële kilometerteller | C | Later/onderzoek; adapterlaag behouden. Exacte Jeep/adaptercombinatie en beschikbare data niet bewezen; geen aankoop. | Masterprompt §12; geen compatibiliteitsclaim |
| Voertuigwaarden en foto | C | Alleen geverifieerde uitvoering/markt/jaar; tot foto aangeleverd is gemarkeerde placeholder. Eigenaarcontext bewijst uitvoering niet. | Masterprompt §1/11/12; voertuigdocumenten ontbreken |

## Bronnen en begrenzing

- **S01 — Apple Core Location:** https://developer.apple.com/documentation/corelocation/handling-location-updates-in-the-background . Apple beschrijft dat apps kunnen worden gesuspendeerd en dat ondersteuning voor achtergrondlocatie expliciet nodig is. De actuele pagina gaf hier een JavaScript-shell; geïndexeerde officiële inhoud was gedeeltelijk leesbaar, Markdown-weergave kon niet worden geopend. Geen gedetailleerde API- of OS-garantie hieruit afgeleid.
- **S02 — Apple achtergrond-Bluetooth (archief, 2013):** https://developer.apple.com/library/archive/documentation/NetworkingInternetWeb/Conceptual/CoreBluetooth_concepts/CoreBluetoothBackgroundProcessingForIOSApps/PerformingTasksWhileYourAppIsInTheBackground.html . Beschrijft beperkte achtergrondtijd en aangepaste scans voor BLE. Door ouderdom alleen onderbouwing voor voorzichtigheid; actuele Core Bluetooth-documentatie en specifieke Jeep-signalen vóór implementatie opnieuw onderzoeken. Geen algemene claim dat alle Classic Bluetooth onmogelijk is.
- **S03 — Apple actionable notifications:** https://developer.apple.com/documentation/usernotifications/declaring-your-actionable-notification-types . Officiële geïndexeerde documentatie noemt UNNotificationCategory en UNNotificationAction voor acties. Directe pagina was een JavaScript-shell; actiegedrag, lockscreen en permissies blijven praktijktests.
- **S04 — Apple CarPlay:** https://developer.apple.com/carplay/ . Actuele overzichtspagina noemt appcategorieën, widgets/Live Activities en een aanvraagroute voor app-entitlement. Een download van de Developer Guide kon hier niet worden geopend; toegestane specifieke RitKompas-interface is dus niet vastgesteld.
- **S05 — Apple Developer-account:** https://developer.apple.com/help/account/basics/about-your-developer-account/ . Personal Team-profielen verlopen na zeven dagen; opnieuw bouwen/installeren is dan nodig. Accounttype van gebruiker niet gecontroleerd.
- **S06 — Apple Developer Program:** https://developer.apple.com/programs/ . Vermeldt 99 USD per jaar en onder meer TestFlight/distributie. Lokale valuta en uiteindelijke factuur apart controleren; geen abonnement aangegaan.
- **S07 — Apple TestFlight:** https://testflight.apple.com/ . Een build kan tot 90 dagen worden getest; daarna opent die beta-build niet meer. Geen testuitnodiging of upload gedaan.
- **S08 — Apple Maps op web:** https://developer.apple.com/maps/web/ . MapKit JS ondersteunt interactieve kaarten en overlays; vermeldt per Developer Program-lidmaatschap dagelijks 250.000 kaartweergaven en 25.000 servicecalls. Licentie-, privacy- en tokenvoorwaarden nog gericht toetsen vóór gebruik.
- **S09 — Belastingdienst rittenregistratie:** https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/inkomstenbelasting_voor_ondernemers/privegebruik_auto/rittenregistratie . Deze pagina behandelt bewijs rond maximaal 500 privékilometers; noemt voertuig/periode en per rit onder meer datum, tellerstanden, adressen, afwijkende route, classificatie en privé-omrijkilometers. De toepasselijkheid op Dennis' privéauto volgt hier niet automatisch uit.
- **S10 — Belastingdienst eigen auto:** https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/auto_en_vervoer/auto_van_de_onderneming/autokosten/u_rijdt_in_uw_eigen_auto . Zakelijke kilometers met privéauto en btw worden afzonderlijk besproken. Betaling door de VOF, aftrek en vergoeding zijn verschillende begrippen.
- **S11 — Belastingdienst privévervoermiddel:** https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/winst/inkomstenbelasting/inkomstenbelasting_voor_ondernemers/zakelijk-gebruik-privevervoermiddel . Geraadpleegde pagina noemt 0,25 euro per zakelijke kilometer voor de actuele aftrek en 0,23 voor 2024/2025. Dit is broninformatie, geen vastgesteld vergoedingstarief voor deze gebruikers of fiscaal advies. Configureerbaar tarief met historische geldigheid behouden; geen standaardwaarde ingesteld.
- **S12 — Microsoft federated connectors:** https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/set-up-custom-federated-connectors . Beschrijft MCP, OAuth/Entra en benodigde beheerrollen. Dit is één Microsoft 365-route, geen algemene uitspraak over iedere consumenten-Copilot of Copilot Studio-licentie. Geen werkaccount geopend.
- **S13 — MCP autorisatie, versie 2026-07-28:** https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization . HTTP-autorisatie bouwt op OAuth en resource/authorization-server-discovery. Protocolversie en daadwerkelijke clientondersteuning moeten samen gekozen worden; niet aannemen dat elk platform al de nieuwste specificatie implementeert.
- **S14 — MCP security:** https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices . Tokens met verkeerde doelgroep niet accepteren; token passthrough is verboden. Backendrechten blijven nodig naast MCP-authenticatie; tooloutput is geen instructiebron voor rechten.
- **S15 — OpenAI custom MCP:** https://help.openai.com/en/articles/12584461-connecting-custom-mcp-servers-in-chatgpt . Geraadpleegde pagina onderscheidt volledige MCP voor Business/Enterprise/Edu en read/fetch voor Pro; beschrijft web- en beheervoorwaarden. Geen claim dat gratis accounts werken of dat deze gebruiker de vereiste rechten heeft.
- **S16 — Claude remote connectors:** https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp . Vermeldt meerdere plannen inclusief Free met één custom connector; verbinding komt uit Anthropic-cloud. Geen verbinding of gegevensdeling gestart; gewenste tools en OAuth moeten nog worden getest.
- **S17 — Workers-prijzen:** https://developers.cloudflare.com/workers/platform/pricing/ . Free vermeldt 100.000 requests/dag en 10 ms CPU per invocation; betaalde voorbeelden beginnen bij 5 USD/maand met gebruikskosten. Geen kostengarantie of providerkeuze.
- **S18 — D1-prijzen:** https://developers.cloudflare.com/d1/platform/pricing/ . Gratis quota: vijf miljoen gelezen rijen/dag, 100.000 geschreven rijen/dag, vijf GB opslag totaal. Queryscans en indexen beïnvloeden verbruik. Routepuntvolume en retentie zijn nog onbekend; geen database aangemaakt.

## Fiscale documentbevindingen voor besluitvorming

De bestaande eisen voor validatie en ontbrekende waarden blijven geldig. Voor een rapport volgens de S09-context is het specifiek relevant dat privé-omrijkilometers en afwijkende routes herkenbaar kunnen zijn; dit stond nog niet expliciet als apart veld in de masterprompt. Dit is een voorstel voor nadere uitwerking, geen stilzwijgend toegevoegde fiscale verplichting voor deze privéauto. Evenmin mogen ontbrekende tellerstanden door GPS worden vervangen zonder herkomstlabel. De juridische/fiscale rol per gebruiker en de toepasselijke administratieve regeling moeten worden bevestigd voordat een fiscale export als passend wordt geaccepteerd.

## Kostenbesluiten die nu niet nodig zijn

Documentonderzoek vereist geen nieuwe aanschaf of koppeling. Apple Developer, hosting, domein, OBD2 en werkgever-Copilot zijn niet besteld of gekoppeld. Werkelijke AI-usage/credits zijn in deze sessie niet uitleesbaar; geen aparte Cloudrun gestart. Providerkeuze en abonnementen pas na voorstel met doel, alternatief, limieten en expliciete toestemming.

## Nog niet bewezen

Achtergrondgedrag op de drie echte iPhones, exacte Bluetooth/CarPlay-signalen van de Jeep, OS-compatibiliteit, accountrechten, fiscale toepassing, datalocatie/contracten, back-upherstel, volledige adaptervergelijking en naam-/merkrechten. Verder detailonderzoek hierover wordt bij de betreffende fase gedaan; dit rapport vervangt die controles niet.
