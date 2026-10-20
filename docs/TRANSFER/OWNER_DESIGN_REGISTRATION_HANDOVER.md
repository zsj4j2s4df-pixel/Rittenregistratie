# RitKompas — nieuwe ontwerp- en registratieopdracht aan Cloud

Status nieuwe functionaliteit: NOG NIET GEÏMPLEMENTEERD / NIET GETEST. De bronreferentie en deze opdracht zijn overdrachtsmateriaal, geen bewijs van werkende native integratie.

Overdrachtscontrole: 6/6 gerichte Node-broncontroles PASS (3 nieuwe export-/privacy-/opdrachtcontroles en 3 bestaande native-prototypecontroles); JavaScript parseert, lokale HTML-assets bestaan, diffcontrole schoon. Geen nieuwe Applebuild, browserruntime- of backendintegratietest in deze bronoverdracht. Deze controles bewijzen niet dat de nieuwe functionaliteit al werkt.

Eigenaarsverzoek 20 oktober2026: alle nieuwe informatie veilig naar GitHub en deze
kennis/opdracht rechtstreeks aan Codex Cloud geven. Cloud is hoofdontwikkelaar;
Mac doet noodzakelijke Applebuilds/simulator/toesteltests en privémediaverwerking.
Nieuwe basis PR56/head `8fecda44bc613f4bd463b2bda6bb1b2814454ba6`; PR53–56 en alle
123REQ/M27 blijven behouden. Dit document gaat vóór oudere beperkingen zoals
uitsluitend view-geheugen of precies één adres. Geen nieuwe productie-/kosten- of
mainmergetoestemming: uitsluitend bron, lokale tests, commits en draft-PRs.

## Nieuwe eigenaarsfeedback — letterlijk en praktisch

1. Home: verplaats Zakelijk/Privé naar boven, beide zonder scrollen zichtbaar en
   aanklikbaar. Plaats ze na de compacte titel/branding en vóór de grote fotokaart.
   Niet oplossen door alleen de foto of letters onleesbaar klein te maken.
2. Mijn Jeep: gebruik een herkenbaar klassiek Willys-front als icoon, geen algemene
   zijaanzicht-auto. De geregistreerde Wrangler4xe/2021 blijft hetzelfde voertuig.
3. Zakelijk: gebruik het echte logo van Sportcentrum & Camping De Voetel in Limmen.
   Houd ook tekst Zakelijk en toegankelijk label zichtbaar; geen AI-verzonnen logo.
4. Instellingen: een **geheel Desert-thema** met zand/beige achtergronden en
   grijs/antraciet als accenten, én de bestaande donkere/antraciete optie behouden.
   Dit betreft de complete app: achtergronden, kaarten, tekst, navigatie, invoer,
   sheets, badges en selected/disabled/errorstates; niet slechts een accentkleur.
5. Standaardadressen uitbreidbaar met plusknop: meerdere zakelijke locaties zoals
   leveranciers/klanten én meerdere privélocaties. Voegtoe/bewerk/deactiveer/verwijder
   met passende bevestiging en behoud van historie; niet twee vaste tekstvelden.
6. Alles moet in contact staan met de **echte ritregistratiecode**. Geen tweede losse
   lokale demo maken en daarna backend/native gereed claimen.

## Bestaand werk en werkelijk bewijs

Mac maakte een aparte owner-only Sites-preview. Laatste brongroep daar:
`09715ecbabcc7f8c81638f11ceec59ef8ad23cf1`, gepubliceerd succeeded. Eén eigenaar,
geen groepen/externe bezoekers; anoniem pagina, nieuwe foto en beeldmerk HTTP401.
Geen echte RitKompasbackend/nativepublicatie of datawijziging hierdoor. De private
URL blijft in de eigenaarschat, niet nodig voor Cloudtoegang of uitvoering.

Round2-preview: gescheiden filters, vaste onderbalk, samenhangende lijniconen,
groter beeldmerk, Home-snelvoorkeur, vieraccenten en één lokaal adres per soort.
Browsercontrole375x812 en812x375: geen horizontale overflow, nav fixed onderin,
48pxfilters met10pxgap;57pxritkeuze-iconen;78pxbrandmerk. Thema Forest en uitsluitend
fictieve testadresstrings bleven na reload behouden, eigen testwaarden daarna gewist.
Dit is **browserbewijs**, geen fysieke iPhone/Safari/native- of backendacceptatie.
De nieuwste zes punten hierboven zijn nog uit te voeren, niet al klaar.

Veilige bronreferentie: `prototypes/design-reference/`. Geen media/screenshot/
auth- of gebruikersdata. Foto-uitgave gebruikt nieuwe eigenaarsfoto, verwijderde
trekhaak, offroadomgeving, subtiele goedgekeurde branding, onderste fade/blur en
stilstaande Homeachtergrond. Echte pixels/Canvaasset blijven private Mac/Sites.
Origineel behouden. NativeAppIcon-resolutie/export nog apart accepteren.

Mac voerde PR52 werkelijk uit:23macOS-XCTest incl14nieuw/0failures, Corebuild,
iOS Core/UI semantiek en unsigned device/simulatorbuilds PASS. PR55/56 introduceerden
nieuwe bron, dus oude passes daarvoor niet hergebruiken. Concrete Maccheck in
NATIVE_DESIGN_BACKLOG bundelen met PR55-nativecheck (37XCTest alleen werkelijk tellen
na uitvoering). Native auth/securestore/capture/hardware zijn nog open; UIwerk mag
die niet wegdocumenteren of onveilige dummycredentials activeren.

## Echte bestaande koppelingen eerst hergebruiken

- `lib/settings-service.ts`: StoredAddress/VehicleSettings, scopedread met membership,
  revisioncontrole, mutationReceipts, atomische audit en idempotenterecovery; echte
  tabel `business_addresses`. Meerdere zakelijke adressen bestaan al.
- `app/beheer/settings-manager.tsx` en `settings-manager-domain.ts`: centrale
  toevoegen/bewerken/actief/verwijderen en gedeelde adres-/tariefvalidatie.
- `app/demo-settings.ts`/`app/settings-panel.tsx`: oude demo, NIET centrale opslag.
- `lib/trip-http.ts`, geverifieerde sessie- en pending-feedcode uit PR52–55,
  `ios/RitKompas/Core/VerifiedNativeSession.swift`, duurzame queue/delivery en
  notificationworkflow: daadwerkelijke identiteit/voertuig/context/receipt behouden.
- `ios/RitKompasApp/RitKompasApp/ReviewPrototypeView.swift`: presentatieprototype,
  geen recht om ineens echte requests met een fake session/grant te doen.

Voorkom parallelle modellen. Ontwerp een compatibele uitbreiding voor categorisering
Zakelijk/Privé en optioneel klant/leverancierlabel. Bestaande business_addresses
blijven zakelijk, met behoud van IDs, audit en rijen; nooit stil als privé herschrijven.
Wijziging tabel/contract/schema eerst lokaal testen met gevulde oude data en alleen
als draftmigratie opleveren. De bestaande40grens voor adressen+tariefperioden niet
stil verwijderen; meerdere per soort ondersteunen binnen een expliciete veilige limiet.

## Gedrag bij echte ritten

De Home-knoppen moeten dezelfde domein-/APIroute gebruiken als andere expliciete
Zakelijk/Privékeuzes, met actuele server-scoped ritcontext, juiste bestuurder en
voertuig, verified session, duurzame pendingactie en passende receipt. Toon eerlijk
welke rit je wijzigt en de pending/fout/bevestigdstatus; geen bevestiging vóór ontvangst.
Bij geen geautoriseerde actuele rit: alleen duidelijk gemarkeerde voorkeur voor een
volgende rit, of duidelijke niet-beschikbaarstatus. Maak nooit een rit/GPSspoor,
bestuurder of classificatie uit alleen een voorkeur of adresmatch.

Adreskeuze bij handmatige ritinvoer moet door echte velden/modellen/API worden
gebruikt; adres-ID en label hangen aan het juiste account/voertuig. Een adresmatch
is suggestie/context, niet het bewijs van een bezoek of automatische fiscale keuze.
Gemeten route/afstand nooit vervangen door een standaardadres of berekende route.
Een adres later hernoemen/verwijderen wijzigt geen oude ritten/rapporten ongemerkt.
Accountwissel/logout/revocatie mogen geen adressen of pendingkeuzes laten doorlekken.
Een offline/retryconflict nooit oplossen met stil verlies of dubbele writes.

Geen echte adressen uit browseropslag van de privépreview opvragen/importeren. Een
latere expliciete import vraagt een gebruikerskeuze en gecontroleerde verwerking;
code en tests gebruiken alleen synthetische waarden. Nooit adressen/tokens in URL,
logs, screenshots of publiek GitHubbewijs.

## Logo: officiële bron vastgesteld, asset nog niet als nativeicoon ingebouwd

Bron: [officiële De Voetel-site](https://devoetel.nl/nl) en contactpagina in Limmen.
De paginabron gebruikt `<img alt="de Voetel logo">` met dit publieke bestand:
[De Voetel Logo.gif](https://devoetel.nl/img/De%20Voetel%20Logo.gif).
Mac heeft die bron visueel gecontroleerd: het eigen Sportcentrum & Camping-
woord-/beeldmerk. De footerafbeelding `/img/97c15e24.png` is daarentegen een ANWB-
nominatiebadge en mag NIET als bedrijfslogo worden gebruikt. Geen ANWBbeeld overnemen.
Logoaspectratio respecteren, niet verminken/hardcroppen of met AI vervangen.
Gebruik voor kleine knoppen zo nodig de echte beeldcomponent of vraag een scherp
SVG/PNG aan de eigenaar wanneer de geleverde bron niet leesbaar genoeg is; tekst
Zakelijk blijft staan. Deze overdracht bevat geen bedrijfslogo-binary of privéasset.

## Concrete ontwikkel- en acceptatiegroep voor Cloud

Werk samenhangend: inspecteer alleen de genoemde huidige code → ontwerp compatibel
adres-/themacontract → implementeer echte services/validatie en clients → tests →
veiligheidscontrole → voortgang/commit/draftPR → gerichte Macopdracht. Geen nieuwe
volledige masteraudit, tweede prototypebackend, alleen-docreviewrondes of fake auth.

Acceptatie:

- Beide Home-keuzes direct boven de foto, zichtbaar op smalle iPhoneviewport zonder
  scroll;44pxminimaal aanraken, voldoende contrast, DynamicType/focus/safe-area,
  portret/landschap en vaste navigatie. Mac accepteert echte iOS-runtime afzonderlijk.
- Desert en Anthracite veranderen de hele app en blijven na een correcte herstart
  behouden volgens een expliciet getest opslagcontract; geen cross-accountlekkage.
- Minimaal twee zakelijke én twee privélocaties toevoegen, centraal teruglezen,
  bewerken/deactiveren/verwijderen en daarna in echte ritinvoer kiezen. Geen stale
  lokale cache als geslaagde centrale write presenteren.
- Tests403andervoertuig/rechten, logout/accountwissel, revisie409, validatie/
  dubbeleIDs/limieten, partialfailure/rollback/audit, lostresponse/exactretry,
  voorgangerdata behouden, meerdere soorten, historische ritten niet herschreven.
- Tests voor Home-keuze via bestaande idempotente echte keuze-/receiptroute,
  geen pendingcontext/fakeprovider, unknown niet als Privé, voorkeur start geen GPS.
- Test art/config die veilig kan draaien in Cloud; alleen noodzakelijke nieuwe
  Swift/iOS/simulator/toestelgevallen naar Mac. Vermeld PASS/FAIL/NIETGETEST eerlijk.

Maak deze groep daadwerkelijk uitvoerbaar op eigen opvolgende branch, test en
bewaar RESUME/CLOUD_TASKS/DEVELOPMENT_PROGRESS/OWNER_ACTIONS. Alleen echte persoonlijke
keuzes in OWNER_ACTIONS. Geen live deploy, migratie, nieuwe gevoelige koppeling,
kosten, beveiligingsversoepeling, mainmerge of forcepush zonder afgebakend akkoord.
