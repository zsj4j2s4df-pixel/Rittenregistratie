# Geautoriseerde native ritvoorstellen en integratie PR53/54

20 oktober 2026. Deze groep combineert expliciet twee nakomelingen van PR52:

- Mac PR54/head `7831bf8772d1e9e41aa6f7208eb84af568cf32b5`, tree `8da312d67b78fc3d9d1de97f408f21865ad2bb7f`: Applebewijs en geïsoleerd klikbaar prototype.
- Cloud PR53/head `1091d31d070e5b01a960fa46b24d8adb7f6196a4`, tree `494072bb938c0cab43a4b0ab359a8e40e5933c00`: duurzame meldingsworkflow en gesloten appdelegate.

Nieuwe Gitcommit heeft PR54 als eerste en PR53 als tweede echte parent. Geen mainmerge, rebase of forcepush. Acht ongewijzigde Macblobs zijn exact teruggelezen; drie voortgangsdocumenten behouden beide toevoegingen. ContentView en ReviewPrototypeView blijven bytegelijk aan PR54. Alleen gepubliceerde tekstbron opgehaald, geen foto/screenshots/bundles. PrivateJeep.jpg blijft ignored en ontbreekt hier.

## Nieuwe bron

`GET /api/vehicles/:id/pending-choices` is een minimale read-only herstelroute. Alleen werkelijke geverifieerde sessie en actieve admin_driver-gebruiker/voertuigrelatie geven toegang. Vehicle-autorisatie en voorstelread gebeuren in dezelfde SQL-statement, sessieverval wordt opnieuw gecontroleerd. Geen viewer uit payload vertrouwen. Geen namen, adressen, GPS, kenteken of tokens in de feed. Geen DB-writes/migraties.

De feed bevat version/viewerId/vehicleId/expiresAt in Unixmilliseconden en maximaal 25 voorstellen (id/revision). Ongeclassificeerde open én gesloten voertuigritten blijven herstelbaar, geclassificeerde of al overgezette voorstellen niet. Meer dan 25 geeft expliciet moreAvailable=true; dit is geen volledig gepagineerd archief. Bestaande volledige journey/webreview blijft beschikbaar. Een keuze bewijst nog steeds geen fysieke bestuurder of fiscale acceptatie. Na gewijzigde gegevens beslist de bestaande revisie-/receipt-/membershipcontrole bij de echte write.

`PendingTripChoiceProducer` gebruikt dezelfde geverifieerde queuebinding als de workflow. Expliciet refresh controleert viewer/voertuig vóór en na de HTTP-read, expiry, duplicaten en grenzen. Refresh plant nooit meldingen. Een afzonderlijke notify(proposalID) accepteert uitsluitend een ID uit de laatste geldige feed, controleert de binding opnieuw en gaat via duurzame pending-before-OS-add. Een gefaalde refresh verwijdert oude in-memory feed. Clear tijdens read voorkomt herleving van een late response; clear tijdens OS-add ruimt een laat geplaatste melding alsnog op. Clear wist geen duurzame keuzes. Logout moet daarnaast VerifiedNativeSession.signOut en APIClient.close uitvoeren; deze producer vervangt die sluiting niet.

APIClient ondersteunt de minimale feed en stuurt de verwachte viewer ook op zulke GET-aanvragen. Geen auto-poll, auto-HTTP-retry, classificatie of bestuurderkeuze toegevoegd. De nieuwe producer is nog NIET in de shipping-host geactiveerd: echte browserauth/secure credentialprovider en gedeelde sessiebootstrap ontbreken. Bestaande gesloten runtime blijft gesloten. De backendroute is niet live en mag niet met echte credentials als werkend worden gepresenteerd.

## Validatie

Cloud: 265/265 Node-tests PASS (257 bestaand, 3 Mac-sourceguards, 5 nieuwe echte SQLite/HTTP-groepen). TypeScript, volledige lint, webbuild en diffcontrole PASS. Gebouwde framework/embedded Worker/lokale workerd+D1-proef controleert de nieuwe feed, no-store, echte ondertekende synthetische JWT, verkeerde viewer, uitsluiten na materialisatie en revoked membership, naast bestaande save/receipt/reviewregressies. Dit is lokaal, geen echt Cloudflarelogin of productiepass. Beperkte patroonscan 350 bestanden/797 lokale historische blobs zonder bevindingen; geen volledige securitygarantie.

Zes nieuwe Swift-XCTestgevallen voorbereid: refresh zonder schedule, onbekend versus werkelijk feed-ID, verkeerde viewer/expiry/dubbele/te grote feed, gefaalde refresh zonder stale fallback, accountwissel tijdens read, accountwissel vóór notify, en clear tijdens read. Eerste geval bevat meerdere assertions; zes testmethoden. Deze nieuwe Swiftbron plus de acht PR53-testmethoden NIET GETEST in Cloud (Swift/Apple-SDK ontbreken). De 23 echte PR52-tests en prototypebuilds zijn uitsluitend het concrete Macbewijs in MAC_REVIEW_PROTOTYPE_2026-10-20.md; geen pass voor nieuwe gecombineerde bron afleiden.

## Alleen noodzakelijke Macchecks

1. Haal deze gecombineerde draft exact op, inclusief beide ouders. Behoud lokale ignored foto en bestaande persoonlijke bestanden. Geen apart opnieuw samenvoegen van de prototypebestanden nodig; bron is al geïntegreerd. Geen installatie/licentievraag herhalen.
2. `node scripts/check-native-readiness.mjs --run`: voer de veranderde Core/UI semantiek en XCTest echt uit. Verwacht 37 macOS-XCTest als alle 23 bestaande + 8 workflow + 6 producer-tests worden ontdekt. Rapporteer werkelijke aantallen; los compile-/testfouten gericht op en geef ze terug. Geen synthetisch extra SwiftTesting-0 als tests tellen.
3. Bouw uitsluitend de actuele bestaande unsigned device- en simulatorapp opnieuw met dezelfde reeds succesvolle scheme/SDK-instellingen. Geen automatische signing, provisioningupdates, accounts, betaalde diensten of live credentials.
4. Gerichte simulatorrookproef op nieuwe build: prototype opent nog correct en lokale feedback blijft behouden; technische voorbereiding → Meldingen beheren bereikbaar met het appdelegate-model. Geen OS-permissionprompt bij startup/statuscontrole; alleen expliciete toestemmingsknop. Zonder native sessie geen echte melding/keuze/write en geen crash. PR53-delegate/actie- en permissionchecks uit NATIVE_NOTIFICATION_WORKFLOW.md blijven gelden; geef precies aan welke OS-runtimeactie wel/niet getest is, geen hele oude visuele proef herhalen.
5. Bewijs in opvolgende draft, exact head/tree en tests. Fysieke installatie blijft apart bij Mac/eigenaar: persoonlijk Xcodeaccount aanmelden, ontgrendelde iPhone aansluiten en daarna concreet team/toestel/signingakkoord. Geen wachtwoorden/codes delen; geen abonnement of downloadclaim.

## Volgende werk en rollback

Native browserauth/securestore en hostsessiebinding, daarna capture/lifecycle en echte iPhone/Jeep/GPS/CarPlay/Bluetooth/OBD2-acceptatie blijven open. Bestaande123REQ/M27 blijven behouden. Nieuwe sourcecheckpoints veranderen geen live Worker/DB/Access. Bronrollback via aparte checkout naar PR54 of PR53; geen destructieve databaseactie nodig. Productiepublicatie, gevoelige livekoppeling of signing vraagt concreet eigenaarbesluit.
