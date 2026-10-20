# Native ontwerpbacklog — eigenaarsfeedback 20 oktober 2026

## Nieuwste opdracht — volledige Desert-stijl en echte adresintegratie

Lees [de complete Cloud-uitvoeropdracht](OWNER_DESIGN_REGISTRATION_HANDOVER.md). Basis PR56/head `8fecda44bc613f4bd463b2bda6bb1b2814454ba6`; bestaande bron, historie en 123REQ/M27 behouden. Nieuw: Home Zakelijk/Privé zonder scrollen bovenaan, Willys-icoon Mijn Jeep, echt De Voetel-logo voor Zakelijk, volledig Desert én Anthracite, meerdere zakelijke én privéadressen met plusknop en koppeling aan echte registratie/settingscode. Dit vervangt oudere accent-only/één-adres/view-memory-beperkingen voor het nieuwe werk.

Status: opdracht en veilige bronreferentie voorbereid; deze nieuwe functionaliteit is NOG NIET GEÏMPLEMENTEERD. `prototypes/design-reference/` bevat alleen geschoonde vorige ontwerpbron met eigen placeholders, geen privéfoto/Canvaasset/adresgegevens. Cloud bouwt en test echte integratie op eigen draft-branch; Mac doet alleen gerichte Apple-/privémediacontrole. PR55/56 Applewijzigingen NIET GETEST; oudere PR52-pass niet hergebruiken als nieuw bewijs. Geen livepublicatie/migratie, mainmerge, kosten of beveiligingswijziging toegestaan.

Addendum op de bestaande 123REQ/M27-eisen; geen vervanging van functionele acceptatie. De Mac-overdracht over de owner-private Sites-preview is ontvangen. Sites-browserpreview, native ontwerpproef en echte ritregistratie zijn drie verschillende bewijsniveaus. Geen previewpass geldt als native/backend/hardwarepass.

Basis voor deze bronwijziging: PR55/head `0622c858e766f97ab6a339b081919f062249bc28`, tree `f867c47a41d8cf2a6c09c8e47f345f791654edc6`. PR53/54, geverifieerde sessie-/meldingsbron en pending-feed blijven behouden. Geen backend, auth-, capture- of hostactivatie in deze groep.

| Punt | Eigenaarswens en acceptatie | Actuele native status |
| --- | --- | --- |
| Filters | Losse, duidelijk onderscheiden Alle / Zakelijk / Privé; actieve selectie ook zonder alleen kleur herkenbaar | Drie bestaande knoppen behouden, nu tekst + lijnicoon + geselecteerde toegankelijkheidsstatus/vaste IDs. Native runtime en kleine schermen nog controleren. Onbekende echte classificatie mag nooit als Privé worden geraden. |
| Onderbalk | Vaste ondericonen, ook na scroll en schermwissel | Bestaande balk buiten ScrollView behouden; geselecteerde toegankelijkheidsstatus toegevoegd. Safe-area/toetsenbord/DynamicType op iPhone nog accepteren. |
| Lijniconen | Coherente Jeep/Willys-geïnspireerde stijl; Privé huis, Zakelijk koffer door hele app | Eén gedeelde huis/koffer-mapping voor voorbeeldfilters, Homevoorkeur, keuze, badges en rapportlegenda. Systeemlijniconen zijn een tijdelijke bronimplementatie; definitieve goedgekeurde stijlvorm en gehele echte app nog OPEN. Onbekend krijgt vraagteken, nooit stil privé. |
| Appicoon | Groter eigenaarsgoedgekeurd appicoon | OPEN: lokaal concept/Canva-icoon is geen gecontroleerd NativeAppIcon1024-exportbestand. Geen 200px-thumb als eindasset gebruiken. Mac controleert werkelijke lokale export/resolutie/assetcatalogus en visuele grootte; geen asset opgehaald/gepubliceerd door Cloud. |
| Appaccent | Eigen accent kunnen kiezen | In native ontwerpproef keuze Zand/Olijf/Leisteen toegevoegd, uitsluitend @State in deze geopende view; geen bewaren/sync. Definitieve kleuren, toegankelijkheid en opslagkeuze OPEN. |
| Standaardadressen | Afzonderlijke adressen voor Zakelijk en Privé | OPEN: geen native adresvelden/opslag/sync gebouwd of besluit aangenomen. Moeten afzonderlijke concepten zijn, zonder automatisch route, rijdoel, APIgrant of classificatie te maken. Bestaande centrale adressen niet ongemerkt wijzigen/importeren. Opslag/sync/privacy eerst concreet kiezen voordat echte adressen worden ingevoerd. |
| Home-snelvoorkeur | Snel Zakelijk of Privé als voorkeur kiezen | Native ontwerpproef heeft een expliciet te kiezen en te wissen @State-voorkeur, begint leeg. Knoppen wijzigen uitsluitend quickPreference, nooit driving/classification of echte acties. Het voorbeeldritvenster blijft een afzonderlijke expliciete keuze vereisen. Geen persistentie/sync en geen echte backendkoppeling. |
| Homeachtergrond | Nieuwe privé-Jeepfoto: zonder trekhaak, volledig offroad, subtiel logowatermerk, fade/blur onderrand en vaste Homeachtergrond | Wens behouden, nieuwe media uitsluitend owner-private Sites/local. Native overzetting/vaste achtergrond OPEN. Cloud heeft geen afbeelding gedownload, geen oude foto vervangen en geen nieuwe media in tree gezet. Native fallback blijft behouden. |

## Grenzen voor hostintegratie

Voorkeuren zijn presentatie, geen bewijsmateriaal of bevoegdheid. Nooit een voorkeur als TripChoice-action opslaan/versturen, chauffeur afleiden, GPS-route invullen, automatisch sessiegrant maken of permissions vragen. Alleen een echte geverifieerde sessie, actueel voorstel en expliciete bevestiging mogen de bestaande duurzame keuze-/receiptroute gebruiken. Adresvoorkeur is geen bezoek of gemeten route. Ontwerpproef blijft gelabeld en geïsoleerd; feedback wordt niet automatisch naar agents gestuurd.

Sites-thema/voorkeur/adressen blijven volgens Mac uitsluitend browserlocal en niet verzonden; dat zegt niets over nativeopslag. Deze native accent/snelvoorkeur zijn nog beperkter: alleen view-geheugen, verdwijnen bij opnieuw aanmaken/herstart. Geen opslagcontract of cross-accountsync impliceren. Alle echte nativeauth/capture-/M27-taken blijven open.

Privéfoto, bewerkte export, Canva-concept en bundels/screenshots met die media nooit naar publieke GitHub kopiëren. Geen eigen download. Latere native assetoverdracht via veilig lokaal kanaal bij Mac/eigenaar; privacygevoelige foto-/kenteken-/adresdata niet in bron, bewijs of testlog. PrivateJeep.jpg blijft lokaal ignored; repositoryfallback is bruikbaar zonder foto. Appicoon-goedkeuring en technische exportkwaliteit afzonderlijk controleren.

## Validatie en alleen noodzakelijke Maccheck

Cloud: 7/7 bestaande native-host/prototype-sourceguards en diffcheck PASS. Beperkte patroonscan 351bestanden/822historische lokale blobs zonder bevindingen; geen volledige securitygarantie. Nieuwe SwiftUI NIET GETEST/NIET GEBOUWD in Cloud; geen visuele, accessibility-, Apple-runtime- of hardwarepass. Geen volledige 265Node/backendbaseline herhaald voor uitsluitend deze UI/documentdelta; vorige PR55-bewijs blijft zijn eigen scope houden.

Mac: neem deze delta boven PR55 over zonder lokale foto/feedback te overschrijven. Bouw de gewijzigde app unsigned met bestaande scheme/SDK. Controleer in dezelfde gerichte simulatorproef drie filters/active status, vaste onderbalk tijdens scroll, consistente huis/koffericonen, accentkeuze en Home-snelvoorkeur/wissen. Voorkeur kiezen mag geen voorbeeldrit starten; alleen afzonderlijke expliciete ritkeuze doet dat. App herstarten geeft geen opgeslagen accent/snelvoorkeur aan; bestaande ontwerpfeedback moet behouden blijven. Geen OS-permissionprompt of netwerk door de nieuwe bediening. Controleer ook grotere tekst/smal scherm waar mogelijk, zonder onbewezen universele toegankelijkheidspass.

Combineer met nog open PR55-Macchecks; voer de 37 XCTest slechts eenmaal op de nieuwe gecombineerde bron uit als PR55 nog niet gecontroleerd is. Is PR55 al bewezen en zijn Core/UI-library ongewijzigd, herhaal de Core-nulmeting niet voor dit ene appviewbestand. Noteer werkelijke build/runtime-uitkomsten en niet-geteste gevallen in opvolgende draft. Geen productie, migratie, signing, aankoop, toegangsverbreding of mainmerge nodig. Bronrollback via aparte checkout naar PR55; geen DB-/Accessactie.
