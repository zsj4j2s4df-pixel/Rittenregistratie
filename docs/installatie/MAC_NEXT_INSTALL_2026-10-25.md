# Volgende Mac-installatie — 25 oktober 2026

## Afgeronde voorbereiding

Bron: PR #69, remote commit 0381d0c3749685a9671a83870854131902b8261e,
tree 6c0f8cc0ab94d837bdfcaa38620dcf9b9fcb342e. Lokale bron b3784a9 identiek.
Build 1.0 (2); bestaand bundle-ID com.example.RitKompasApp behouden.
Op 24 oktober unsigned device/simulatorbuild en 79 Swift/312 Node-tests PASS.
Deze eerdere testuitslagen zijn niet opnieuw uitgevoerd voor een documentwijziging.
Op 25 oktober Xcode 26.3/17C529 bevestigd; juiste huidige checkout geopend.
Dennis' iPhone 15 door CoreDevice als available/paired teruggelezen. Geen UDID,
serienummer of persoonlijk mailadres in dit document. Overige toestellen nog OPEN.
Xcode toont een bestaande buildfout: provisioning profile ontbreekt. Dit is een
ondertekeningsblokkade, geen nieuw vastgestelde broncodefout. Geen Apple-team,
profielen, certificaten of installatie op een echte iPhone gewijzigd.

De bestaande simulator iPhone16e/iOS26.3 is zichtbaar en booted. Een nieuwe
simctl-installatie/start bleef zonder resultaat hangen en is afgebroken; daarom
geen nieuwe simulator-PASS op25oktober. Eerder simulatorbewijs blijft24oktober.
Twee gerichte nativebroncontroles en diffcontrole op25oktober PASS.

## Accountopdracht zonder oude reviewblokkade

Cloud-opdracht: https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/68#issuecomment-6396862124
De eigenaar vraagt afronding voor Dennis en Ingrid. De vroegere algemene
reviewwachtstap mag deze specifieke accountopdracht niet blijven blokkeren.
Alleen-lezen controle op 25 oktober: beide Authaccounts ontbreken; D1 bevat één
bestaande gebruiker (derde bestuurder), geen Dennis-/Ingrid-gebruiker of membership.
Daarom is een uitnodigingsmail voor hen nog niet verzonden. Geen inboxprobleem
bewezen. Geen derde account dupliceren of diens identiteit met anderen delen.

Officiële Supabase-beheerpagina staat in Chrome op de aanmeldpagina. Persoonlijke
beheerlogin moet door een bevoegde persoon worden afgerond wanneer die beschikbaar
is; telefoonlogin opent geen Macsessie. Bestaande SMTP opnieuw configureren of een
nieuw Gmail-appwachtwoord vragen is niet nodig. Geen auth.users-writes via SQL.

## Uitvoervolgorde zodra beheerlogin beschikbaar is

1. Controleer vlak voor wijziging beide accountduplicaten opnieuw. Gebruik alleen
   het bestaande aparte RitKompas-project en bestaande productie-D1.
2. Controleer recente versleutelde backup, herstelproef en schema vóór D1-mutaties.
   Maak ontbrekende interne gebruikers/memberships uitsluitend expliciet volgens
   het bestaande eigenaarbesluit (admin_driver, prioriteit Dennis1/Ingrid2/Jesse3,
   hetzelfde bestaande voertuig), met bevoegde actor en immutable audit. Bij
   afwijking/ambiguïteit stoppen en concrete verschillen rapporteren.
3. Verstuur één persoonlijke officiële Auth-uitnodiging per persoon via bestaande
   SMTP-route met de juiste /login-callback. Lees provideracceptatie/fout terug.
   Geen wachtwoord voor iemand kiezen; ontvangst is pas bewezen door ontvanger.
4. Koppel ieder exact nieuw Authsubject expliciet aan de eigen interne gebruiker
   en bestaande Jeepmembership; geen email-autogrant of ruimer recht. Controleer
   aantallen, constraints en audit. Herhaal niet blind bij onduidelijke respons.
5. Ieder opent zelf de mail (eventueel spam), kiest persoonlijk wachtwoord en test
   webaanmelding. Nooit privélinks/tokens/wachtwoorden in GitHub of screenshots.
6. Bevestig bestaand Apple Personal Team en behoud identiteit van reeds geïnstalleerde
   app. Controleer profiel/slots/verloop; geen betaald programma of willekeurig
   nieuw team. Selecteer concreet toestel, niet Any iOS Device. Teken/Run in Xcode.
7. Werk per telefoon onderstaande acceptatie af. Geen bestaande app verwijderen,
   Keychain wissen of onzekere outboxgegevens weggooien als snelle oplossing.

## Acceptatie per echte telefoon

| Controle | Dennis | Ingrid | Jesse |
|---|---|---|---|
| Eigen account / juiste voertuigscope | OPEN | OPEN | native OPEN |
| Bestaand team, profiel en update-installatie build2 | OPEN | OPEN | OPEN |
| Starten en heropenen | OPEN | OPEN | OPEN |
| Aanmelden en Sessie gebruiken | OPEN | OPEN | OPEN |
| Remember-off/on, refresh, heropenen | OPEN | OPEN | OPEN |
| Uitloggen/accountisolatie | OPEN | OPEN | OPEN |
| Vrijwillige voorgrond-GPS / meldingen | NIET GETEST | NIET GETEST | NIET GETEST |

Persoonlijke wachtwoorden, Applelogin/2FA, toesteltrust en herstartbevestiging
blijven eigenaarhandelingen. Safari-login is geen automatisch native sessiebewijs.
Geen fictieve rit naar live schrijven om een test groen te maken.

## iPhone-instellingen voor deze build

- Ontwikkelaarsmodus indien nodig: Instellingen → Privacy en beveiliging →
  Ontwikkelaarsmodus, zelf herstarten en bevestigen.
- Internet voor aanmelden/synchronisatie via wifi of mobiele data.
- Alleen voor vrijwillige GPS-proef: Privacy en beveiliging → Locatievoorzieningen
  → RitKompas → Bij gebruik van app, Exacte locatie aan. De app vraagt pas bij
  de expliciete GPS-proef; niet Altijd instellen. Opname stopt in achtergrond.
- Meldingen optioneel via de appknop Meldingstoestemming en daarna Instellingen
  → Meldingen → RitKompas. Geen complete achtergrondritdetectieclaim.
- Automatisch slot mag tijdelijk Nooit tijdens kabeltest; daarna terugzetten.
  Geen Bluetooth-, CarPlay-, contacten-, foto- of bewegingsrechten voorwenden.

Handleiding beschikbaar in de gespreksmap onder output/pdf/ en output/. Het is een
instructieartifact, geen downloadbare installatie/IPA/TestFlightlink. De echte
native Form-kaarten en afzonderlijke ontwerpproef zijn niet de complete webapp.
Automatische achtergrondritten/CarPlay/OBD2/drie-telefoonprioriteit blijven OPEN.
