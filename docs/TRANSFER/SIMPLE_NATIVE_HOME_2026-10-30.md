# Eenvoudiger echte native ritbediening

Eigenaarfeedback 30 oktober: testapp/beginscherm is onduidelijk voor vader.
Basis exact PR72/b0e4ea1470f46f552213e882a95af78800abec58; GPS-ritproef behouden.
Drie accounts volgens eigenaar aangemaakt: niet opnieuw aanmaken/uitnodigen.
Test wel afzonderlijk login, bestaande D1-mapping/rechten, logout/accountwissel.
Geen adressen/wachtwoorden/tokens in GitHub.

## Gebouwd
- Echte ritbediening direct na account/voertuig, vóór instellingen/adressen.
- Start rit, Privé/Zakelijk met tekst+icoon, Stop rit, Verstuur gestopte rit.
- Ontvangststatus is geen definitieve logboekacceptatie; zelfde receiptcontract.
- Instellingen/adressen bereikbaar via aparte knop, technische proeven standaard
  ingeklapt. Achtergrondlocatie alleen via bestaande expliciete opt-in.
- Afzonderlijke demo onder ingeklapte ontwikkelaarsgroep, alleen DEBUG.
- Bestaande huisstijl en assets behouden; geen tweede demo-opslag of authwijziging.

## Gerichte opdracht Mac
1. Neem deze nakomeling van PR72 over zonder lopend werk kwijt te raken.
2. Compileer actuele unsigned device/simulator (SwiftUI-viewbuilder gewijzigd),
   voer bestaande Swift-tests uit. Geen oud bewijs hergebruiken.
3. Controleer beide thema's, klein scherm, grote tekst, toetsenbord, VoiceOver:
   aanmelden, ritbediening vóór adresbeheer, Instellingen openen/sluiten,
   technische opties standaard dicht; release zonder demoknop.
4. Met elk bestaand account: login/rechten/accountwisseling. Geen provisioning
   opnieuw uitvoeren alleen omdat oudere documenten accounts open noemen.
5. Eén korte echte rit: start, classificatie, scherm vergrendelen na expliciete
   opt-in, stop, verstuur, serverreceipt en daadwerkelijke websitezichtbaarheid
   controleren. Journeybewijs is nog geen definitieve logboekrit: rapporteer dat
   verschil en blokkeer acceptatie als de rit niet werkelijk in het logboek staat.
6. Pas daarna twee dagen gebruik testen. Geen TestFlightaankoop nodig.

## Verificatiegrenzen
Cloud: Node-regressies en diffcontrole; exacte uitslag in PR.
Geen Swift/Xcode beschikbaar in deze Cloudomgeving. Nieuwe native build,
visuele runtime, fysieke GPS/achtergrond en drieaccountacceptatie NIET GETEST.
Geen live deploy/migraties/rechtenwijzigingen/signing/installatie uitgevoerd.
