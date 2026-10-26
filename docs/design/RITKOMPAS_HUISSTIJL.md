# RitKompas — bindende huisstijl
Versie 1.8 · 26 oktober 2026 · eigenaar: projecteigenaar RitKompas

## Aanvulling 1.8 — samenhangende native GPS-ritproef

Eigenaar vraagt vóór fysieke installatie een zo compleet mogelijke GPS-ritproef,
actieve start/stop, privé-eerst met onderscheid expliciet/standaard, lockscreen-
melding en Siri. Native functionele Formstijl behouden; geen productiepreview als
bewijs. Ritstatus toont echte puntentelling, gemeten deelafstand en meetgaten.
Kaart uitsluitend op uitdrukkelijk openen, met huidige thematint; geen lijn over
lange/ongeldige GPS-gaten. Geen locatie-/naamgegevens op lockscreen. Siri/AppShortcuts
krijgen vier Nederlandse acties, inclusief start/stopproef; externe inrichting en
coldstart/lock/Jeepacceptatie eerlijk OPEN. Achtergrondopname alleen afzonderlijke
opt-in en iOS-toestemming. Een capability is geen verleende toestemming.
Bron en actuele teststatus: docs/automatic-trips/; ritbewijs is geen definitieve
logboekrit. Geen verandering van goedgekeurde merkassets, geen productiepublicatie.

## Aanvulling 1.7 — echte native voorbereiding en installatie-artifact

Native build2 krijgt exact goedgekeurd merkbeeld in de echte registratie en
de goedgekeurde offroadfoto als gebundelde native-JPEG in de gelabelde demo.
AppIcon blijft exact. Geen AI-hertekening of privéfoto opnieuw publiceren.
Op simulator beide thema's/merkheader en aparte fotopreview gezien; functionele
nativeForm heeft nog platformeigen kaarten, niet de hele vernieuwde webUI.
PDF + mobielHTML gebruiken Desert, ronde kaarten, klikpaden en duidelijke
statuslabels: unsignedbuild/simulator is geen fysieke installatie/downloadlink.
Instructies uitsluitend echte iPhone-app; geen PWA-beginschermroute verwarren.
Bron/bewijs: docs/installatie/NATIVE_READINESS_2026-10-24.md.

## Aanvulling 1.6 — eerst link, dan wachtwoordherstel

Eigenaar vraagt hetzelfde mooie overzicht, maar eerst aanmeldlink openen,
daarna exact ‘Wachtwoord vergeten’ → ‘Stuur herstellink’, mail/spam, wachtwoord
kiezen en dan inloggen. Vier genummerde Desert-kaarten, bestaande merkassets.
Account moet vooraf klaarstaan; herstel is geen accountaanmaak of rechtentoekenning.
Geen accounts/mails/backendwijziging uit deze tekstaanpassing afleiden.

## Aanvulling 1.5 — eenvoudige startuitleg

Eigenaar vraagt korte klik-voor-klik-uitleg, spamwaarschuwing en web/nativeverschil.
Publieke `/hulp` gebruikt Desert-tokens, goedgekeurd Willys/kompasbeeld, genummerde
kaarten, leesbare16px-tekst, echte links en printbare opmaak; geen privé-invites.
Aanmelden: expliciete opt-in ‘Ingelogd blijven’ vóór credentials, standaard UIT,
44px-label en waarschuwing gedeeld apparaat. Geen gedwongen persistentie.
Jesse controleert de algemene uitleg vóór andere persoonlijke uitnodigingen.
Native automatische GPS/CarPlay/OBD2 nog niet als werkelijk werkend presenteren.
Bewijs/verzend- en livestatus: docs/onboarding/DELIVERY_STATUS_2026-10-24.md.

## Eigenaarfeedback 1.4 — goedgekeurd appicoon en Willys-navigatie

Publicatiestatus: goedgekeurde1.4 website-iconen werkelijk LIVE als b919671a,
deploymentd634c2cc/100% in bewezen RitKompas-account;7bindings/auth behouden,
liveasset-MIME/hash/manifest en private401PASS. Native wel gebouwd, niet opnieuw
geïnstalleerd. Bewijs docs/design/APP_ICON_LIVE_2026-10-24.md. Onderstaande eerdere
niet-liveverklaring is historie van bronoplevering, geen actuele blokkade.

Eigenaar markeert in mobiele rittenpagina het bovenlogo rood: kleuren omdraaien
en gebruiken als app/webappicoon; Mijn Jeep onderin blauw: duidelijker Willys.
Eigenaar keurt daarna expliciet de aangehechte zand/antraciet-bitmap goed
(“Deze is goed”). Gebruik PRECIES dat ontwerp, niet de latere vectorreconstructie
en niet opnieuw genereren. Publicatiekopie public/brand/ritkompas-mark-approved.png,
1024pxRGB. De gekozen bitmap heeft vijf grillsleuven: expliciete eigenaarselectie
gaat voor eerdere zeven-sleuvenregel voor dit merkbeeld. Niet stilzwijgend wijzigen.
Navigatie-Willys blijft een eigen strak lijnicoon met zeven sleuven, ronde lampen,
recht gedeeld voorruitframe, vlakke spatborden/bumper en twee losse terreinbanden.
Web en nativebron gebruiken dezelfde geometrische richting, in huidige themakleur.
Logo overal zandachtergrond met antracietbeeld, geen automatische CSS-inversie.
Webmanifest192/512px, Apple-touch180px en nativeAppIcon1024px uit dezelfde
goedgekeurde bron, zonder metadata/alpha. Geen fictieve dark/tintedvarianten.
Een webmanifest is geen offline-app/GPSclaim. Nativecatalogus ingevuld en unsigned
gebouwd, NIET opnieuw geïnstalleerd. Huidige livewebsite blijft apart vastgelegd;
een stijlopdracht autoriseert geen nieuwe publicatie of accountwijziging.
Zie docs/design/APP_ICON_APPROVAL_2026-10-24.md voor bewijs en resterende stappen.

## Aanvulling 1.3 — persoonlijke aanmelding en e-mail

Native accountaanmelding behoudt de bestaande RitKompas-componenten; tekst
spreekt over een persoonlijke sessie, niet uitsluitend een Cloudflare-cookie.
Uitnodiging en herstelmail zijn helder Nederlands met RitKompas in het onderwerp,
antraciet #242b29, eenvoudige Arial-tekst en één duidelijke persoonlijke actie.
Geen externe foto's, tracking of nepknoppen die niet bij de providerlink horen.
Bewaar de echte ConfirmationURL-placeholder; geen wachtwoord/token in uitleg.
Sjablonen en onderwerpen staan in docs/auth-email/, via Supabase UI opgeslagen.
Nativebron unsigned gebouwd en unitgetest; driepersoonlijke live-mail/login en
nieuwe fysieke iPhone-installaties NIET GETEST. Geen liveclaim uit een preview.
Zie docs/TRANSFER/SUPABASE_EXECUTION_2026-10-24.md voor actueel bewijs.

## Geldigheid en onderhoud
Deze standaard geldt voor ALLE RitKompas-interfaces en zichtbare projectuitingen:
native iPhone, website, login, beheer, formulieren, rapporten, previews en nieuwe
schermen. Niet voor ongerelateerde projecten of gewone gesprekstekst.
Lees deze bron en skills/ritkompas-huisstijl/SKILL.md vóór visueel werk.
Nieuwe expliciete eigenaarfeedback gaat voor; leg die met datum en bron vast,
werk tokens/componenten/assetmanifest/tests tegelijk bij. Bestaande functies,
toestemmingen, authenticatie en gegevensintegriteit blijven leidend.
Geen automatische publicatie, aankopen of nieuwe machtigingen uit deze standaard.

Eén actuele bron: dit document. skills verwijst hiernaar, geen concurrerende gids.
De werkkopie in de Mac-gespreksmap en GitHub moeten dezelfde versie bevatten.
Bij overdracht commit/PR vermelden; een bestand is geen bewijs van Cloudontvangst.
Actualiseren bij iedere afgeronde ontwerptaak, niet claimen dat buiten runs
automatische monitoring of blijvende synchronisatie bestaat.

## Wat werkelijk bekeken is
- Native ReviewPrototypeView.swift en NativeAppearanceTheme.swift uit PR61/63,
  bestaande native screenshot van 20 oktober, huidige lokale appresources.
- Nieuwere goedgekeurde Home-preview van 21 oktober, de werkelijk aanwezige
  jeep-offroad-v2.png, ritkompas-mark.jpg en originele De Voetel-GIF.
- Native hoofdscherm is nog een functionele Centrale registratie/Form-interface;
  de fraaiere Home is een afzonderlijk gelabelde ontwerpproef. Niet gelijkstellen.
- De geïnstalleerde build bevat nog de oude zwart-wit bosfoto. AppIcon-catalogus
  bevat 1024px-slots zonder bestandsnaam; geen afgerond iOS-AppIcon beweren.
- De nieuwe gouden offroadfoto en 200px-Willys/kompasmarkering zijn de bedoelde
  visuele richting. De thumbnail is GEEN echte 1024px-AppIcon-export.

## Visuele beschrijving
Karakter: rustig, degelijk, persoonlijk en avontuurlijk; een verzorgde
expeditie-interface, geen camouflage, speelgoedauto of generiek groen dashboard.
Antraciet is bijna zwart met een subtiele grijsgroene ondertoon. Kaarten zijn
iets lichter, afgerond en fijn omlijnd. Zandkleur draagt merk, primaire acties
en selectie. Olijf is een bescheiden statuskleur, geen grote felgroene vlakken.
Desert is een volledig licht thema: warm zand ondergrond, crème kaarten,
donkere antraciettekst en grafietacties, niet alleen een veranderd accent.

Het woordmerk RitKompas staat in forse, compacte afgeronde letters. Daarboven
een kleine gespatieerde monospaced regel ELKE RIT. HELDER. Het merkbeeld rechts
is duidelijk herkenbaar: klassiek Willys-front, ronde koplampen, zeven verticale
grillesleuven, brede banden, rechte voorruit, bumper; erboven een open kompasring
met richtingpijl en een zachte olijfgroene route. Zand op donker, geen Jeep-
fabriekslogo of claim van officiële Jeep-samenwerking.

De foto toont de echte grijze open Wrangler 4xe driekwart van linksachter:
buizen-/gaasdeuren, open rolkooi, grote terreinbanden en reservewiel. Nieuwe
omgeving: rotsachtig bergpad, laag struikgewas, gouden late middag, berglagen
en water in de verte. Trekhaak verwijderd, kenteken neutraal, gezicht niet
identificeerbaar; een heel klein merk-watermerk rechtsboven. Bewerkte illustratieve
omgeving, niet als feitelijke gereden locatie of GPS-bewijs presenteren.

Foto in een kaart met circa 24px-hoeken; onderaan donker verloop en zachte
vervaging, met witte titel Mijn Jeep en kleine voertuigtekst. Achtergrondbeeld
alleen subtiel/stilstaand; geen parallax of onleesbare tekst op drukke details.
Landschap en portret krijgen hun eigen uitsnede: niet rekken, wagen niet afhakken,
focus rond 55% horizontaal/45% verticaal. De rittenlijst krijgt géén hoge
foto-header die filters en gegevens uit beeld duwt.

## Bindende semantische tokens
Tokens staan machineleesbaar in docs/design/tokens.json en worden in de website
naar CSS geëxporteerd; geen ad-hoc kleuren per pagina.
- Anthracite: achtergrond #0E1313, kaart #1B2323, verheven #222D2B,
  tekst #F8F9F6, secundair #A8B3AD, lijn #35403C, actie/merk #D7C39E,
  actietekst #101717, positief #A1BC70.
- Desert: achtergrond #EDE3D1, kaart #FAF2E3, verheven #E5D7BE,
  tekst #242B29, secundair #58605B, lijn #CBBCA2, actie #404A47,
  actietekst #FAF2E3, positief #406133; merkzand blijft #D7C39E.
- Fout: terracotta/donkerrood met leesbare tekst en melding; onzeker amber
  plus label. Kleur is nooit het enige onderscheid.
- Native bestaande RGB-waarden liggen dichtbij maar zijn niet overal exact
  gelijk. Dat is een bekende implementatieafwijking, geen bewezen native update.
- Ruimte 4/8/12/16/22/28/36px. Kaarten 18–24px radius; knoppen12–14px.
- Body systeem-sans 14–16px, hoofdtitels28–36px/600–750, kaarttitels18–22px.
  Monospace alleen kleine rubrieken, geen lange tekst in kapitalen.
- Klikdoelen minimaal44px; belangrijkste keuzes48px. Labels niet onder10px.

## Iconen en merkbestanden
Eén lijnfamilie: huidige kleur, geen vulling, afgeronde uiteinden/verbindingen,
circa1.6–1.8px op24px. Functionele iconen18–26px; grote keuzes48–57px.
Geen emoji als productie-iconen en geen mix van generieke auto, klaver en Willys.
Mijn Jeep gebruikt het eigen geometrische Willys-front met ZEVEN sleuven.
Privé gebruikt huis met dak/deur. Zakelijk gebruikt het originele De Voetel-logo
waar er leesbare ruimte is; op compacte pictogrammen een koffer als bewuste
fallback. Altijd tekst Zakelijk erbij; geen ANWB-badge of nagemaakt bedrijfslogo.
Ritten: verbonden routepunten. Rapporten: document/balken. Instellingen: sliders.
Merklogo groter dan een navigatie-icoon: circa56–78px mobiel, niet wazig opblazen.

public/brand/asset-manifest.json registreert paden, afmetingen, MIME, SHA256,
herkomst/rechten, publicatiegrond en gebruik. Alleen gekozen publicatiekopieën
metadata-vrij optimaliseren; lokale originelen en ignore-regels behouden.
Geen andere privéfoto's, kentekens, locaties, tokens of browseropslag publiceren.
Gebruik bestaande goedgekeurde bestanden. Alleen voor expliciete beeldbewerking
mag een nieuwe variant worden gemaakt; herkomst en beperkingen registreren.
200px-JPEG alleen tonen tot circa78CSSpx; niet als volwaardig appstore-icoon.

## Regels per scherm
- Ritten/start: echte centrale lijst, maand/totaal/filters blijven leidend. Merk
  compact in header/zijbalk, geen verzonnen Homecijfers of fictieve GPSroute.
- Filters Alle/Zakelijk/Privé/Te controleren: losse tegels met zichtbare tussenruimte,
  fijne rand, duidelijk zand/grafiet-selectievlak en aria-pressed. Niet samensmelten.
- Home, als werkelijk gebouwd: Zakelijk/Privé boven de foto/scroll zichtbaar.
  Een voorkeur is GEEN bevestigde ritclassificatie. Niet voorgeven dat een
  filter op de web-rittenlijst een nieuwe rit classificeert.
- Mijn Jeep: goedgekeurde foto prominent, merk discreet; alleen echte voertuigdata.
  Technische detectie-/CarPlaystatus niet groen maken zonder bewezen verbinding.
- Rapporten: rustige kaarten en duidelijke CSV/PDF-acties. Print wit, goed leesbaar;
  decoratieve foto's/nav niet afdrukken. Historische snapshot niet wijzigen.
- Instellingen: twee VOLLEDIGE thema's, meerdere zakelijke én privélocaties via
  bestaande centrale backend. Geen tweede lokale adresopslag.
- Login/herstel/fout/lege toestand: dezelfde huisstijl, echt accountproces en
  duidelijke status; geen schijnlogin of Cloudflarebeveiliging verbergen.
- Mobiel: vaste ondernavigatie, labels, safe-area en voldoende inhoudspadding.
  Desktop: rustige zijbalk, max1600px bruikbare inhoud, geen uitgerekte telefoon.
  Landscape laag scherm: compacte bar; inhoud en toetsenbord blijven bereikbaar.
- Alle knoppen/focus/disabled/modals hebben beide thema's; op mobiel geen
  wit op zand, zwart op donkere overlay of afhankelijkheid van hover.

## Verplichte oplevercontrole
Controleer 375/390px portret,844x390landscape en1280/1440/1920desktop, beide thema's,
200%tekst, toetsenbord/focus, safe-area, geen horizontale overflow. Verifieer foto-
uitsnede, natuurlijke verhouding, logoherkenning, iconen en contrast visueel.
Test bestaande echte filters/correcties/historie/rapport/CSV/PDF/logout opnieuw.
Controleer daadwerkelijke release-image-requests en MIME: bronbestand alleen is
geen bewijs dat Workerupload het meeneemt. Geen gevoelige screenshots naar GitHub.
Noem exact wat werkelijk native/Safari/live getest is en wat NIET GETEST is.

## Wijzigingslog
- 1.2,24oktober: eigenaar vraagt witte logoachtergrond verwijderen en overal
  vervangen. De Voetel als bedoelde logo geïnterpreteerd. Canva MEDIA bekeken;
  achtergrondverwijdering vraagt betaald plan, niet geactiveerd. Ingebouwde
  imagegen gebruikt voor gerichte achtergrondextractie, daarna PNG geoptimaliseerd.
  Transparant1040x533; origineel GIF behouden. Geen pixel-identieke reconstructie
  claimen. Webfilter/ritkaart en nativevoorkeur/ritkeuze/badges gebruiken dezelfde
  PNG. Geen wit vlak; op donker alleen fijne lichte slagschaduw voor leesbaarheid.
  301Node-tests, type/lint/webbuild en unsigned Xcode-devicebuild PASS.
  Geïnstalleerde iPhone, Safari en nieuwe livepublicatie NIET GETEST/niet uitgevoerd.
  Oudere tijdelijke ontwerpcheckout verdween vóór bronoverdracht. Implementatie
  hersteld in blijvende work/ritkompas-current-20261024; huidige bewijsstatus
  staat in docs/design/LOGO_UPDATE_2026-10-24.md. Onderstaande1.1 is historie.
- 1.0,23oktober: eigenaar vraagt gedetailleerde appanalyse en verplichte blijvende
  stijl voor dit gesprek, daarna website hierop aanpassen. Richting afgeleid uit
  werkelijk bekeken nativebron en goedgekeurde nieuwe preview. Publicatiebeelden
  volgen de afgebakende eigenaarsopdracht MAC_WEB_VISUAL_ASSETS.md.

## Implementatie 1.1 — 23 oktober 2026
Website toegepast op centrale ritten, Mijn Jeep, instellingen, login en gedeelde
beheer-/rapporttokens. Offroadfoto1280x960, merk200x200 en DeVoetel520x266 als
metadata-vrije WebP-publicatiekopieën; geometrisch Willys met zeven sleuven,
origineel logo bij zakelijke filter. Selectie zand/grafiet, olijf alleen status.
Randgeval: Desert secundair #58605B houdt ook op verheven zand minstens4,5:1.
Loginfoto heeft expliciete breedte; merkbeeld mag geen oude demo-polygonmasker
erven. Mobiele header compact, ondernavigatie ook bij844x390landscape.
301Node-tests/contrast+assetchecks, type/lint/build, bestaande registratie-/login-
browserregressies en gebouwdeWorkerassetrequests PASS. Providers en ritten
synthetisch, geen echte iPhone/Safari/account-/mailacceptatie. Nativebestanden
niet gewijzigd: oudere foto en ontbrekende echte1024px-AppIcon blijven open.
Publicatiebesluit wordt apart bijgehouden in de overdracht; geen liveclaim op
basis van deze gids of alleen een screenshot. Gids bij volgende taak actualiseren.
