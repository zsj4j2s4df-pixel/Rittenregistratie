# Reparatie geweigerde GPS-start/eindobservatie

Basis PR73 exact115793257c7312dc4b8673869e3e59c7dc0e22c4.
Eigenaar toont gestopte proef met3punten en generieke synchronisatiefout.
Geen precieze foutcode/servertelling uit screenshot afleiden.

## Bewezen fout
NativeTrialSync.input gebruikte source manual voor expliciet start/stop, maar
voegde ook een recente echte GPS-locatie toe. detection-service weigert alle
locaties met source anders dan gps met HTTP400. Dat is een echte contractfout;
welke stap op de telefoon faalde is zonder nieuwe runtimecontrole niet bewezen.

## Reparatie en behoud
Met locatie wordt source gps; zonder locatie blijft manual. Kind blijft
start_candidate/end_candidate en detail explicit_native_trial_start/stop:
de expliciete gebruikershandeling is dus niet ineens automatische detectie.
GPS blijft onverified; geen driver- of hardwareclaim. Geen servervalidatie verzwakt.
Planversie en identifiers blijven gelijk, geen gegevens wissen of nieuwe IDs.
Afgewezen manual+locatie-aanvragen kregen volgens echt servicecontract geen
receipt. Exact dezelfde IDs kunnen daarom met correct bronlabel worden verstuurd.
Eerder geaccepteerde manual zonder locatie en gps-locatie-events blijven gelijk.
Een bestaande echte afwijkende receipt blijft409: nooit geforceerd overschrijven.

Generieke catch toont nu getypeerde NativeAPIError zonder serverbody/token/PII;
opslag-/decodefouten blijven apart, geen willekeurige error.localizedDescription.

## Verificatie
Nieuwe Node-regressie gebruikt echte SQLite/device/intake/journeyservices:
oude start en stop400, nul receipt voor afwijzing, gecorrigeerde payload met
zelfde IDs geaccepteerd, journey afgesloten, exacte retry gelijk, gewijzigde
inhoud409. Swiftmock handhaaft nu ook gps-broncontract; bestaande lost-response-
proef heeft start én eindlocatie en had met oude nativebron gefaald.
Swift/XCTest NIET uitgevoerd: geen Swift/Xcode in Cloud. Volledige Node-uitslag
in PR. Geen nieuwe live-/iPhone-/drieaccountclaim.

## Gerichte Mac-uitvoering
1. Neem opvolgerPR73 over, behoud eigen werk en bestaande signing/installatie.
2. Run volledige Swift-tests, vooral NativeTrialTripTests en lostresponse/exactretry;
   bouw actuele unsigned device/simulator en controleer beide schermthema's.
3. Werk dezelfde iPhone-app bij zonder uninstall/gewijzigde bundleID of opslagreset.
   Controleer toestemming voor noodzakelijke bestaande signing, geen nieuwe accounts.
4. Meld aan met dezelfde eigenaar/voertuig, laad bestaande gestopte proef en
   synchroniseer éénmaal. Noteer getypeerde fout als het mislukt (geen tokens/GPS).
   Controleer daadwerkelijke serverreceipts en eigen actor/rechten; maak geen
   tweede nep-/vervangrit, negeer geen409 en verwijder geen bestaande data.
5. Na bevestiging hoort Start weer beschikbaar. Test korte rit, achtergrondopt-in,
   schermslot, stop, exactretry, accountwisseling. Journeybewijs apart van definitief
   logboek beoordelen; daadwerkelijke websitezichtbaarheid is nog acceptatiepunt.

Geen livebackenddeploy/migratie nodig voor deze native contractfix. Rollback:
bronbranch terug naar PR73; behoud appdata. Oudere versie kan de afgewezen payload
blijven weigeren, dus rollback is geen gegevensherstel. Geen mainmerge/kosten.
