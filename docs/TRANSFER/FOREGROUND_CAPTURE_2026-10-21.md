# Vervolg: eerste werkelijke GPS-opnamebron, geen volledige automatische app

Eigenaarsvraag: voer publicatie, echte Dennis/Ingrid/Jesse-tests, iPhoneinstallatie
en automatische ritopname uit. Basis is gecontroleerde PR60/head
`fc0cf5a01328d2f0a245d52122729e62c9b0322f`; voorgaande bron/historie behouden.

## Nieuwe bron

NativeCaptureView/Model gebruikt nu echte CLLocationManager callbacks, maar alleen
na expliciete inschakeling door een aangemelde gebruiker en eigen iOS WhenInUse-
toestemming met precieze locatie. Geen stille start, Always-verzoek, backgroundmode,
Bluetooth-/CarPlaydriverclaim of startup/herstartgarantie. UI en InfoPlist leggen
uit wat er lokaal wordt gemeten en dat alleen expliciet Verzenden het naar dezelfde
private RitKompas-backend stuurt. Geen provider/AI of andere bestemming.

ForegroundMotionDetector is een testbeleid, geen bewezen voertuigdetector:

- Geldige geografische waarden, niet-negatieve snelheid, nauwkeurigheid tot30m,
  niet ouder dan15seconden en geen toekomstmeting. Geen motortoerental/brandstof-
  aanname; elektrisch rijden is niet afhankelijk van een brandende motor.
- Drie bewegingssamples met minimaal12seconden en snelheid minstens2,5m/s geven
  een start_candidate op de bevestigende meting, niet bewezen fysieke vertrektijd.
- Snelheid hoogstens0,8m/s,120seconden en binnen30m geeft end_candidate; korter
  stoppen sluit niet. Dit bewijst geen werkelijk klantbezoek/parking of riteinde.
- Gat groter dan30seconden, onjuiste/oude/tijdsprongmeting, permissionverlies,
  backgroundfase of expliciet stoppen: onderbreken, nooit een riteinde verzinnen.
  Nieuw starten kan apart bewijs geven; geen oude/nieuwe segmenten stil verbinden.
- App bemonstert hoogstens eenmaal per6seconden, geen timer die GPS verzint.
  Bij iOS-batching/overlappende verwerking of volle opslag stopt de proef eerlijk.

NativeCaptureOutbox bewaart exacte observatie-/request-/appregistratie-IDs vóór
netwerkmutatie in bestaande EncryptedChoiceQueuePersistence/AES-GCM met lokale
Keychainkey, apart directory op hash(viewer+voertuig).96observaties/64KiB bovengrens;
geen truncatie/reset, dus bij vol eerst stoppen en bestaande invoer herstellen.
Geen multi-hour-offlineclaim. App-instantie-ID is geen hardwareattestatie.

APIClient registreert de eigen testapp-instantie en stuurt dezelfde exacte inputs
naar bestaande scoped device/detectionsroutes, met dezelfde VerifiedNativeSession,
verwachte viewer, TLS/redirect-/CSRFgrenzen. Unixseconden voor observaties, niet de
milliseconden van sessie-expiry. Serverreceipt moet voertuig/viewer/device/event/
payload/tijd/bron/soort en unverified_app_observation exact teruggeven; pas daarna
lokale acknowledgement. Onzeker resultaat blijft staan voor expliciete exactretry.
Cancel/logout/accountwissel sluit/cancelt eerst; geen late gegevens in nieuw scherm.

Observaties en start/stopvoorstellen zijn **geen definitieve ritten**. Deze groep
roept geen journey create/join/close of materialisatie aan, kent geen bestuurder,
Zakelijk/Privé of fiscale afstand toe. Centrale coördinatie, deduplicatie en expliciet
gecontroleerde materialisatie moeten hierna gekoppeld en werkelijk getest worden;
geen tweede ritbackend, geen stille cross-phone-merge. De bestaande web/backend-
code/schema is in deze groep niet gewijzigd.

## Werkelijk bewijs en grens

58 echte macOS-XCTest/0failures, Corebuild en iOS Core/UI SDK-semantiek PASS.
Acht nieuwe cases: sustainedstart/geen herhaling,120sstop/geen korte-stop-einde,
verplaatsing reset stoptimer, onnauwkeurig/oud/out-of-order/gat/interruptie,
ongeldige GPS/snelheid/toekomst, reconstructie/exactretry met dezelfde app-/eventIDs,
verkeerde receipt/account/scope, diskfailure/capaciteit/gesloten actor.
Mocks en synthetische coördinaten, GEEN echte GPS-/TLS-/D1-/hardwareacceptatie.

Unsigned simulator- en deviceappbuild PASS; eerste simulatorcompilefout door
ontbrekende Combine-import hersteld, opnieuw gebouwd. NativeCaptureModel startte
geen GPS tijdens tests. Nieuwe simulatorapp geïnstalleerd en gestart via simctl;
dat is GEEN visuele UIacceptatie: Mac was aanvankelijk ontgrendeld maar bij de
schermproef opnieuw vergrendeld. Geen beveiliging omzeild, geen echte locaties of
appregistratie/observaties naar productie verzonden, geen iPhone geïnstalleerd.

Volledige279 Node/backend/sourcechecks PASS (276bestaande +3nieuwe opname-hostsourceguards).
Volledige lint en diffcontrole PASS; beperkte patrooncontrole389bestanden en977
historischeblobs zonder bevindingen, plus handmatige selectie; geen volledige securitygarantie;
sourceguards zijn geen runtime-/accountbewijs. Geen dependencies/installaties.

## Overige expliciete doelen: feitelijke blokkades

- Cloudflare-plugin whoami blijft MCP-32603; beschikbare plugindirectoryzoekactie
  gaf geen alternatieve Cloudflareplugin. De al geïnstalleerde Wrangler4.92.0
  meldt werkelijk NIET aangemeld. Geen lokale tokens/cookies gezocht/gekopieerd.
  Scopehelp bekeken; aan eigenaar gevraagd om officiële aanmelding met uitsluitend
  account/userlezen,workers_scripts:write en d1:write. Dit is nieuwe persistente
  lokale toegang (productrechten kunnen meer dan alleen deze ene Worker/DB raken),
  dus niet zonder concrete goedkeuring geopend/geaccordeerd. Geen refresh-/offline-
  extra scope zelf toevoegen. De bestaande releasegoedkeuring blijft geldig.
- Na die toegang: actuele deployment/bindingen/schema/ledger en consistente
  private export, versleuteling, gevulde0015→0016upgrade/integrity/FK/databehoud
  controleren. Pas daarna bestaande gecontroleerde webupdate en0016 publiceren,
  Access behouden, echte login/read/save/reload/historie en anonimiteit testen.
  GEEN deploy/migratie/restore/nieuwe account/Accesswijziging uitgevoerd.
- Xcode Apple Accounts live bekeken: geen Apple-account. Devicectl: geen echte
  devices. Aan eigenaar gevraagd eigen telefoon ontgrendeld aan te sluiten en
  persoonlijk Applelogin te doen. Daarna pas exact PersonalTeam/doeltoestel/bundle-ID
  afspreken en gratis development-signing/installatie, geen TestFlightaankoop.
- Dennis/Ingrid/Jesse echte logins/rechten/save/reload/geschiedenis/accountwissel/
  receipts: NIET GETEST. Ieder moet zelf aanmelden; geen impersonatie, codes,
  provisioning of rechtenuitbreiding afleiden uit testopdracht. Geen echte nepritten
  naar productie om acceptatie groen te maken.

## Eerstvolgende werkende acceptatiegroep

1. Persoonlijke Cloudflareaanmelding en Apple-/toestelstappen, Mac ontgrendeld houden.
2. Exacte releasepreflight en gecontroleerde publicatie zoals PR59/60 voorschrijven.
3. Native echte login/Keychainherstart/adressen/exactretry/accountwissel; drieaccounts.
4. Simulator-GPSfixtures met alleen lokale/synthetische backend en opt-inbediening;
   echte iPhone-GPS na toestemming. Geen synthetische GPS naar productie.
5. Centrale journey-/meldings-/receiptkoppeling, dedup en ritmaterialisatie bouwen;
   vervolgens foreground/background/restart/EV/korte-stop/Jeep/CarPlay/hardwareproeven.

Alle open M27/123REQ blijven behouden; geen volledige automatische appclaim,
mainmerge/forcepush/kosten/AI-/werkgeverkoppeling of privéassetpublicatie.

Referenties: bestaande detection-service/journey-service en Mac-hardwareplan;
[Apple CLLocationManager](https://developer.apple.com/documentation/corelocation/cllocationmanager),
[officiële Wrangler-aanmelding](https://developers.cloudflare.com/workers/wrangler/commands/general/).
