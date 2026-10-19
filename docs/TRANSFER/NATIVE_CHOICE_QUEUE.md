# CLOUD-011 — sessiegebonden ritkeuze en duurzame native wachtrijbron

19 oktober2026, niet live. Volgt PR31 op exacte head0643b8c649ea31a971a75991f27adbab47c229a1. Bestaande MacACK/nativeCorebewijs behouden; **nieuwe Swiftcode is in Cloud NIET gecompileerd of uitgevoerd**. Geen tweede app, signing, accountlogin, externe koppeling, productieconfiguratie of aankoop.

## Servercontract — getest

POST `/api/vehicles/:vehicleId/journeys/:journeyId/choice` accepteert uitsluitend `{requestId,expectedRevision,classification:'business'|'private',reason}`. Geauthenticeerde actor en vehiclemembership komen van de bestaande resolver, niet body/notification/CarPlay. Bestaande expected-viewerheader weigert een ander werkelijk ingelogd account met409 vóór writes.16KiB/Origin/CSRF/no-store/defaultdeny blijven gelden.

`createJourneyChoiceService.choose` wijzigt de globale journeyrevisie en schrijft immutable keuze/receipt plus audit atomair. Dezelfde requestId+canonieke inhoud retourneert oorspronkelijke `{journeyId,viewerId,requestId,revision,classification}`. Andere inhoud/revisie409; concurrerende tegenstrijdige keuzes hebben één winnaar. Opnieuw classificeren vereist actuele revisie, nieuwe herhaalcode en reden. Max1000keuzes/journey in SQLgate. Revocation vóórbatch/auditfout laat geen keuze of revisiestap achter. Authchecks ook opreplay. Additieve0011/schema/journal/snapshot, geenremote migratie.

Classificatie is een expliciete keuze, geen vaststelling van chauffeur/afstand/teller/werkelijk einde/fiscaliteit. Status blijft review_open/review_closed; geen tripinsert of rapportregel. Read-onlybeheer toont laatste keuze uit dezelfde transactionele overzichtsread. Oudere keuzes blijven in immutabletabel/audit.

## Nativebron — NIET GETEST

Gedeelde Codable TripChoice/TripChoiceContext staan nu buiten de iOS-only UserNotificationsguard zodat de echte pure queue ook op Mac te compileren is. UNNotificationcode blijft iOS-only. `DurableTripChoiceQueue` implementeert TripChoiceStore met:

- uitsluitend vooraf geregistreerde server-scoped pendingcontexten; notificationuserInfo creëert geen context;
- geverifieerde actuele viewer+vehiclebinding vóór lezen/schrijven, defaultbinding weigert alles;
- éénzelfde UUID per vastgelegde keuze, identieke dubbelactie idempotent, tegenstrijdige keuze/stalecontext geweigerd;
- begrensde versie1JSONstate:128pending/128actions/64KiB; corrupte/onbekende state wordt niet leeggemaakt;
- expliciete scoped ready()/acknowledge(); receipt moet request/viewer/vehiclecontext/proposal/revisie/keuze overeenkomen; geen automatische verzending of accountwisselovername;
- actorreentrancy-busyweigering om overlappende read-modify-writes te voorkomen. Eén queue/persistenceowner per appproces, geen extension-/multiprocesssharedstoreclaim.

`EncryptedChoiceQueuePersistence` gebruikt CryptoKit AES256GCM met geauthenticeerde formaatheader en willekeurige nonce. Alleen ciphertext wordt atomair op schijf vervangen, in een dedicated vertrouwde sandboxmap; symlink/regularfile/groottegrenzen.0600bestand/0700nieuwe map, iOSfileprotection untilfirstunlock. Geen hostile-filesystem-/TOCTOU-/powerlossgarantie. Geen locaties/adressen/tokens in de actionqueue, wel persoonsgegevens zoals interne viewer/context en ritsoort.

Keychainprovider gebruikt random32bytes, nietgesynchroniseerde afterFirstUnlockThisDeviceOnlyitem. Bestaande ciphertext zonder sleutel leidt tot fout, niet automatisch nieuwe sleutel/lege queue. Dubbele keyaanmaak heeft één begrensde reread, geen onbeperkte retry. Geen Keychainactie uitgevoerd vanuit Cloud. Encryptie is bronimplementatie, geen onafhankelijke audit of hardwarebewijs; gedeeld toestel/ontgrendeling blijft privacyrisico.

APIClient.sendChoice verzendt alleen op expliciete calleractie exact dezelfde queuedinput, weigert vóór netwerk een grant voor een andereviewer en behoudt bestaandeHTTPS/origin/redirectgrenzen. Ack wist alleen na gecontroleerde overeenkomst; bij onzeker antwoord blijft queue staan. Default sessieprovider is nog niet ingericht. Er is **nog geen werkende providerbinding/delegatehost/backgrounddrain/nativeUIintegratie**. De queue is dus geen geïnstalleerde werkende iPhonefunctie.

SessionScope is een interface voor dezelfde werkelijk geverifieerde sessie/snapshot als APIClient. Een binding implementeren met hardcodedviewer ofnotificationpayload is verboden. Actorbinding en bestand zijn geen gezamenlijke OS-transactie; wijzigingen blijven aan de oorspronkelijke context gebonden, en opnieuw verzenden vereist actuele scope én servercontrole. Ontvangst van een melding is geen garantie dat opslag/achtergrondtijd beschikbaar is. Pendingreview moet vóórschedule duurzaam bestaan en bij storingen behouden blijven.

## Bewijs en Mac-opdracht

Vijf nieuwe Nodecases voor choiceAPI/kernel PASS, volledige215tests/type/lint/build PASS; echte lokale D1choice/retry/readback en Chromiumkeuzeweergave apart uitgevoerd. Deze Nodechecks zijn **geenSwiftbewijs**. XCTestbron voorbereid voor heropenen/exactid/accountwissel/stale/dubbel/contradictie en echte ciphertexttamperproef; ALLE XCTestcases NIET UITGEVOERD inCloud. GeenSwifttoolchain aanwezig.

MAC-J11: vanaf deze drafthead eerst `swift build --package-path ios --product RitKompasCore` en strictconcurrencydiagnostiek. Alleen met reeds aanwezige XCTest/Xcode `swift test --package-path ios`; anders NIETGETEST melden, niets installeren. Controleer nieuwemeldingscode met echte iOSSDK, niet alleen macOSconditionalparse. MAC-J12: dedicatedsyntheticqueue heropenen, ciphertexttamper/wrongkey/keymissing, capaciteit en foutvoor/naatomischschrijven, apptermination en twee snelle acties, accountwissel en preciespassendeAck. Test echte Keychain/FileProtection pas in de bedoelde getekende appomgeving; geenproductiesleutels of tokens in GitHub. Resultaten in eigen draft-PR, geen autosturingclaim.

Volgende Cloudgroep: expliciet geauditeerde éénmalige omzetting van een gesloten gereviewde voertuigrit naar één trip, handmatigecontrole echte afstand/adressen/driver; daarna nativeprovider/delegateintegratie als gecontroleerdcontract en overige sync/offline. Geen automatische sensorgrenzen of fysiekeacceptatie claimen.
