# Cloud-ontvangst en bronreview PR47 — 20 oktober 2026

PR47 daadwerkelijk teruggelezen: head `072315c7d3cf6849e3f1d0bf3b5e05d99eb46af1`, parent `c615ae62e2f93fce72e735b7a46112fb1301bf32`, tree `f5c07618d1142ace74935c0b83d8632dac77eae2`, branch `mac/pr46-native-takeover-20261020`. Alle elf gewijzigde bestanden opgehaald en hun Git-blobhash lokaal exact geverifieerd vóór import. Bestaande PR-keten behouden; geen merge of publicatie. Geen tweede native nulmeting, adapteronderzoek, loginfix of provisioning.

## Ontvangen werkelijk Mac-bewijs

[Mac-verslag](MAC_PR46_RESULT_2026-10-20.md) bevestigt eigenaarbrowserlogin/read en één inhoudelijk ongewijzigde instellingenwrite met technische reden, volledige reload en historie. Dat verhoogt terecht revisie/audit/receipt. Hiermee is de instellingenwrite op Mac bewezen; niet iPhone/Safari, tripwrite, live lostresponse/exactretry, PDF/Maps of logout/revocation. De oude algemene Cloudstatus ‘live writes niet getest’ is voor deze beperkte Macproef ingehaald, niet voor de overige schrijfacties.

Mac rapporteert Swift6.1.2/macOSSDK15.5 Corecompile en negen werkelijk uitgevoerde Swift/CryptoKit-smokegroepen PASS plus249Node PASS. XCTestbron alleen geparsed; geen echte XCTest-, iOS-, UI-, Keychain-, FileProtection-, simulator- of hardwarepass. Cloud neemt dit als expliciet Mac-bewijs over en presenteert het niet als eigen uitvoering. Geen volledige onafhankelijke veiligheidsaudit: gedeelde GitHub-identiteit/eigenaarcontrole blijft een apart open punt.

## Gerichte Cloud-bronreview

TripChoiceDelivery, nieuwe XCTest-/smokebron en runner gelezen, met bestaande APIClient en DurableTripChoiceQueue als relevante context. Geen blokkerend defect gevonden binnen deze beperkte delta; dit is geen goedkeuring van een complete native app.

- Single-action expliciet transport met busy-guard; geen timer, automatische retry of nieuwe requestID.
- Queue controleert actuele scope vóór en na laden; alleen exact nog aanwezige actie wordt verstuurd. APIClient-conformance behoudt onafhankelijke viewercontrole vóór netwerk en serverautorisatie.
- Cancellation vóór transport en na antwoord wordt gecontroleerd. Receipt wordt pas via queue.acknowledge geaccepteerd; alle relevante receiptvelden en scope worden daar opnieuw gecontroleerd vóór duurzame verwijdering.
- Bij transport-/receipt-/scope-/diskfout blijft de bestaande actie beschikbaar voor gecontroleerde retry. Eén persistenceowner en één consumer per host blijven vereisten, geen bewezen multiprocess-/achtergrondgarantie.
- De runner compileert echte Corebronnen met Swift6 in een eigen tijdelijke map; geen installaties, signing, Keychain- of netwerkactivatie. CryptoKitproeven falen expliciet als platformmodules ontbreken. Synthetische smoke-transporten zijn geen echte native API-koppeling.

Cloud heeft alleen gerichte JS-syntax/lint op de nieuwe runner en diffcontrole uitgevoerd. Geen herhaling van de al door Mac uitgevoerde249Node- of native nulmeting; geen Swift/iOS-runtime op Cloud beschikbaar en geen eigen nativepass geclaimd.

## Volgende concrete grens

ACT-004: expliciet eigenaarbesluit voor grote Xcode-installatie op Mac; eventuele Apple-aanmelding/licentievoorwaarden door eigenaar. Niets door Cloud geïnstalleerd of op Mac gestart. Daarna echte XCTest/iOSsemantiek en apphost, geverifieerde nativeprovider/sessiebinding, notificationdelegate en capture/lifecycle aansluiten. TripChoiceDelivery sluit slechts het expliciete Core-consumerdeel, niet deze overige onderdelen.

Blijf doorgaan met veilig bronwerk waar mogelijk, en vraag voor signing/installatie/entitlements, nieuwe accounts/kosten/koppelingen en productiehandelingen afzonderlijk toestemming wanneer die nog ontbreekt. Geen live Cloudflare-configuratie, codepublicatie, migratie of provisioning gewijzigd tijdens deze review. Live blijft de al goedgekeurde versie `ba2a2a9d-3a2a-4347-b146-b577d0e33989`; dit is laatst bevestigde release, geen nieuwe liveprobe. Alle oorspronkelijke123REQ/M27 en hardwareacceptatie blijven behouden.
