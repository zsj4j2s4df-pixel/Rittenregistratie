# Native Macvalidatie en beoordelingsprototype — 20 oktober 2026

Exacte bronbasis PR52/head `f1d73cdc86bf32a61970caeff51276594b19cbaa` via Git opgehaald. Eigenaar vraagt testbare app, vervolgens representatief klikbaar prototype met eigen Jeepfoto en Canva/Willys-appicoon. Nieuwste rolverdeling: alleen noodzakelijke Mactaken hier; overige ontwikkeling bij Cloud na veilige bronoverdracht. Eigenaar koos expliciet eerst gratis via Mac, niet betaald TestFlight.

## Werkelijk Applebewijs voor nieuwe PR52-code

Xcode26.3/17C529, Swift6.2.4, iPhoneOS26.2SDK, bestaande iOS26.3simulator op arm64. `node scripts/check-native-readiness.mjs --run` exit0: Core-librarybuild PASS,23echte macOS-XCTest/0failures (9bestaande en14nieuwe), echte iOS Core/UI semantische typechecks PASS. Extra SwiftTesting-uitvoer0tests niet geteld. URLProtocoltests zijn synthetisch en bewijzen geen echtTLS/Cloudflarelogin. Volledige unsigned device- en simulatorappbuilds exit0. Geen bronfix nodig; geen signing/account/provisioning/livehandeling.

## Ontwerpproef in dezelfde native app

ContentView opent ReviewPrototypeView, met expliciete ONTWERPPROEF/demowaarschuwingen. Zelfde lokale package/app/scheme, minimumiOS15; geen tweede app/repo/dependencies. Home, Ritten/filter, Ritdetails, Rapporten, Mijn Jeep, Zakelijk/Privévoorbeeldrit en lokale feedback. Voorbeeldritstatus is alleen geheugen; geen echte ritwrite/capture/API/notifications. Routepaneel verzint geen GPSkaart. Technische NativePreparationView blijft bereikbaar via Mijn Jeep; echte login blijft oningesteld/defaultdeny.

Zandbeige/antraciet/olijfgroene stijl uit aangeleverde voorbeelden. Optionele eigenaarsfoto lokaal als PrivateJeep.jpg, expliciet ignored; niet in Gitindex/tree/PR. Zonder foto veilige ingebouwde symbolische fallback. Origineel ongewijzigd behouden. Foto/screenshots/appbundles met deze privéfoto niet openbaar uploaden. Geen foto naar Canva gestuurd.

Nieuwe UI daadwerkelijk opnieuw gebouwd voor simulator én device: beide BUILD SUCCEEDED/exit0. Alleen onschadelijke AppIntentsmetadatawaarschuwing wegens ontbrekende frameworkdependency. Vier bestaande en drie nieuwe Node-sourcecontractguards PASS; deze zijn geen UItests. `git diff --check` PASS. Geen complete Nodebaseline herhaald voor deze geïsoleerde presentatiedelta.

## Handmatige simulatorcontrole

Op virtuele iPhone17 geïnstalleerd en gestart; Computer Use bevestigt foto, titel, kaarten, tabnavigatie en expliciete demo-/onverbondenstatus. Zakelijkvoorbeeld gekozen → Voorbeeldrit actief/Zakelijk; beëindigen → terug naar klaar. Ritten/Privéfilter toont alleen privévoorbeeld, ritdetail geeft juiste28km/32min en fictiefwaarschuwing. Rapporten toont demoverdeling; knop legt uit dat niets gegenereerd/verstuurd wordt. Mijn Jeep toont niet gekoppeld/nog in ontwikkeling/niet getest; technische voorbereidingsview bereikt met toestemming Nog niet gevraagd.

Feedback: synthetische TESTnotitie ingevoerd, lokaal bewaard, iOS-deelvenster geopend en zonder bestemming/verzending gesloten. Na terminate/relaunch dezelfde notitie teruggelezen; daarna alleen eigen testnotitie leeggemaakt/bewaard. Geen userfeedback overschreven. Geen automatische agentontvangst of cloudsync van feedback; eigenaar moet expliciet delen. Geen geautomatiseerde XCUITest of volledige toegankelijkheids-/DynamicType-/allemodelacceptatie geclaimd.

Lokale screenshots: `/private/tmp/ritkompas-review-home-20261020.png` en `/private/tmp/ritkompas-review-reports-20261020.png`. Bewijs is privé, niet GitHub. DerivedData `/private/tmp/ritkompas-pr52-build-FYOveK`; laatste simulatorapp in Build/Products/Debug-iphonesimulator/RitKompasApp.app. Afgeleide paden zijn lokaal, geen draagbare Cloudartefacten.

## Canva-scout

Door eigenaar expliciet gevraagde scout-agent gebruikte gekoppeld Canva generate-image: één Willys-geïnspireerd front/kompas/routeconcept, MEDIA MAHYkKnzyD4 v1, zonder officiële Jeeptekst/militaire symbolen. Geen aankoop/upgrade of privéfoto-upload. Canva-concept is nog geen gecontroleerde1024px iOS-AppIcon-export en niet in assetcatalogus geplaatst. Geen definitief icoon of commerciële merkgoedkeuring claimen.

## Gratis echte iPhone: concrete blokkade

Read-only Appleaccountwebsite toont Join the Apple Developer Program; geen actief betaald lidmaatschap geverifieerd. Xcode Settings/Apple Accounts toont Add Apple Account en geen accountlijst. `xcrun devicectl list devices` exit0: No devices found. Niets gekoppeld, getekend, geregistreerd of op fysiek toestel geïnstalleerd. Eigenaar meldt zelf aan en sluit gewenste ontgrendelde iPhone aan; daarna team/toestel en exacte toestemming voor persoonlijke development-signing/provisioning/installatie controleren. Geen kosten/abonnement aangaan. Gratis profiel verloopt na7dagen volgens [Apple](https://developer.apple.com/help/account/basics/about-your-developer-account); installeren vraagt periodiek opnieuw bouwen. Voor TestFlight is [App Store Connect/distributie](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/) nodig, niet een willekeurige IPA-download. Nu geen werkende downloadlink/mail verzinnen.

## Vervolg/taakverdeling

Cloud heeft overige nativebronwerkopdracht ontvangen via bestaande chat: browserauth/securestore, hostbinding, notificationdelegate/delivery en capture met behoud van alle123REQ/M27/defaultdeny. Mac reserveerde ContentView/ReviewPrototypeView/foto en doet Applebuild/runtime/toestelchecks. Na veilige PR neemt Cloud exacte UIbron en gemeten resultaten over; geen privéasset. Bij gelijktijdige Cloudbranch beide nakomelingen van PR52 expliciet integreren zonder mainmerge/forcepush of werkverlies. Geen backendpublicatie/migratie/Accesswijziging uit dit ontwerp afleiden.

Nog NIET GETEST/NIET AF: fysieke iPhone/11Pro/anderemodellen, echte login/tokenstore, runtimebackend nieuwe sessionroute (draft), notificaties, GPS, achtergrondritten, CarPlay/Bluetooth/OBD2/Jeep, definitief appicoon, DynamicType/alleoriëntaties, signing/installatie/verspreiding. Prototype is ter beoordeling, geen afgebouwde automatische ritregistratie. Wacht alleen voor concrete persoonlijke Apple-/toestelstap; Cloud kan veilig bronwerk blijven doen.
