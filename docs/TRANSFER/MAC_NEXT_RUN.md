# Eén opdracht voor Codex Mac — na Cloudrelease 20 oktober2026

Actuele GitHub-overdracht: [draft-PR46](https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/46), branch `cloud/cloud-014-live-web-handover`, code/documentbasis `b75fa0610425030253459e1b6d256fbd9ae6f8c7` (alle10gewijzigdebestanden exact remote geverifieerd). Hierop volgt uitsluitend de huidige documentcheckpoint. Geen automatische Macontvangst/uitvoering geclaimd.

Cloud heeft webrelease en migraties voltooid; zie WEB_RELEASE_RESULT_2026-10-20.md voor bewijs/beperkingen en uitvoeringsincident. Deze overdracht staat op opvolgende draftbranch `cloud/cloud-014-live-web-handover`, basePR45/adcc6d373a1df3a0124ba680c5faed6f0564dcce. Lees de actuele GitHub-PRhead terug voordat je begint. Verzend-/GitHubopslagbewijs is geen Macuitvoering. De eigenaar kan deze hele prompt plakken:

```text
Neem RitKompas over voor uitsluitend de resterende Apple/native/hardwaretaken.
Repository: zsj4j2s4df-pixel/Rittenregistratie.
Lees de nieuwste draft-PR op branch cloud/cloud-014-live-web-handover en noteer exacte remotehead. Begin vanaf die branch op eigen opvolgende branch; behoud alle bestaande PRbases/ouders. Geen mainmerge/forcepush of eigen lokale wijzigingen overschrijven.

Lees eerst AGENTS.md, RESUME.md, deze MAC_NEXT_RUN.md, WEB_RELEASE_RESULT_2026-10-20.md en daarna alleen relevante nativebron/PR27_PLAN/NATIVE_CHOICE_QUEUE/MAC_HARDWARE_TESTS. Geen volledige documentaudit, adapteronderzoek of oude loginfix opnieuw uitvoeren.

Cloud heeft de expliciet goedgekeurde webcode gepubliceerd: versie ba2a2a9d-3a2a-4347-b146-b577d0e33989, deployment9c7c3f88-fd26-44aa-b1ca-3375aa21d122, bestaande D1 nu migraties0000–0015; Access/vierbindings behouden.249Node/type/lint/build/lokalegebouwdeWorker PASS; anon302 na release PASS. Geen nieuwe liveconfig/provisioning/migratie/deploy nodig. Niet opnieuw eigenaar aanmaken, database leegmaken of werkende livecode vervangen.

1. Inspecteer beschikbare Appletoolchain: node scripts/check-native-readiness.mjs. Met bestaande geschikte toolchain: node scripts/check-native-readiness.mjs --run. Dit script installeert niets en ondertekent geen app. Geen grote Xcode-installatie, Appleaccount/abonnement of entitlement aanvragen zonder eigenaarbesluit. CommandLineTools-only is geen iOSSDK/XCTest. Los echte compile/testfouten in nieuwste Core/queue/crypto/UserNotifications/UI op; parse-only en oudere Corebuild tellen niet als iOSpass.
2. Integreer in bestaande apphost indien aanwezig; maak geen onbedoelde tweede app. Sluit geverifieerde SessionAccess en ChoiceSessionBinding op dezelfde echte sessie aan, met logout/revocation/accountbinding. Geen embedded service-token/fake viewer of cookies/claims loggen. Defaultdenycode is nog geen authprovider.
3. Verbind UNUserNotificationCenterdelegate aan actuele servercontext en duurzame queue; registerPending vóór schedule, stable requestID, expliciete Zakelijk/Privé, passende serverreceipt vóór verwijderen. Queueconsumer/host ontbreken nog. Gemiste/late/dubbele/mislukte melding blijft zichtbaar te beoordelen; nooit stilzwijgend Privé of bestuurder afleiden uit CarPlayprioriteit. Test accountwisseling en lostresponse/exactretry op nieuwste servercontract.
4. Bouw de nog ontbrekende echte toestemming/capture/lifecycleintegratie; huidige NativePreparationView vraagt alleen toestemming en meet geen GPS. Behoud onbekende routegaten en bronstatus, voorkom dubbele voertuigroutes/ritten. Geen automatische ritafsluiting alleen op RPM0 of één disconnect.120s-klantstop versus verkeer en EV blijven expliciete acceptatiegevallen. Bekijk actuele Applebeperkingen; CarPlayUI vereist passende entitlement, geen goedkeuring claimen.
5. Pas als een echt ondertekend installeerbaar prototype met toestemming beschikbaar is: simulator/iPhone/meldingen/achtergrond/forcequit/restart/batterij en MAC-J-proeven met bestaande toegestane Jeep/hardware. Geen aankopen of diagnosewrites/codering/gatewaybypass. Schermbediening stilstaand. Gebruik synthetische bewijsIDs, geen echte GPS/adressen/tokens/kenteken in GitHub.
6. Doe met eigenaarbrowser een beperkte live lees/schrijf/herlaadproef van de al gepubliceerde webversie; Cloud heeft die niet kunnen uitvoeren. Geen extra gebruikersprovisioning of bestaande data wissen. Leg echte iOS/Safari/Maps/PDF/accountlogout/revocationresultaten vast; AppleMaps unified URL vanaf iOS18.4, geen oudeOSgarantie.
7. Bouw→test→herstel→commit/draftPR→RESUME/CLOUD_TASKS/DEVELOPMENT_PROGRESS→volgende veilige taakgroep. Noteer exact PASS/FAIL/NIETGETEST met SDK/Swift/commit, neem geen Cloudtest over als hardwarepass. Geen kosten, nieuwe gevoelige koppelingen, productie-/Accesswijziging, mainmerge, forcepush of beveiligingsversoepeling zonder nieuw afgebakend akkoord. Als toolchain/hardware ontbreekt, maak oorzaak/volgende stap concreet en werk ander veilig nativebronwerk af.

De eigenaar wil dat Mac zo min mogelijk zelf hoeft uit te zoeken. Lever je nativewerk en werkelijke testresultaten terug via opvolgende draft-PR. Cloud kan dat teruglezen; automatische directe agentsturing is niet beschikbaar.
```

## Korte proef voor eigenaar op iPhone

Open https://rittenregistratie.zsj4j2s4df.workers.dev en herlaad na aanmelden. De startpagina is nu centrale registratie. Vul voor instellingen een wijzigingsreden in; ritinvoer toont per ontbrekend veld een concrete melding. Na bedoelde opslag herladen en controleren. Dat is een handmatige webproef, geen automatische ritdetectie. Deel alleen algemene foutmelding/handeling, geen adres/route/aanmeldcode. Vormgeving/tekstredactie volgt volgens eerdere prioriteit na functionele software.
