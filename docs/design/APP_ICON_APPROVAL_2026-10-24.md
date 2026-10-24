# Goedgekeurde appiconen — 24 oktober 2026

Eigenaarfeedback: “Blauw moet een betere willies jeep zijn”; rood logo kleuren
omdraaien en instellen als app/webappicoon. Daarna expliciet de aangehechte
zand/antraciet-variant goedgekeurd (“Deze is goed”). Die selectie is leidend.

## Gebouwd
- Exact goedgekeurd beeld alleen verkleind/hergecodeerd naar1024RGB, geen EXIF/
  XMP/alpha. Master public/brand/ritkompas-mark-approved.png, herkomst/hash inmanifest.
- De door eigenaar gekozen bitmap heeft vijf grillsleuven. Niet vervangen door
  niet-goedgekeurde vector of opnieuw gegenereerd zeven-sleuvenbeeld. Gids1.4 legt
  deze expliciete uitzondering voor merk vast; navigatie-Willys heeft wel zeven.
- Header/login/desktopmerk gebruikt dezelfde master in omgekeerde zand/antraciet.
- Mijn Jeep in web/nativebron: recht gedeeld voorruitframe, ronde lampen, zeven
  sleuven, vlakke spatborden/bumper en losse banden in themakleur.
- Webmanifest192/512PNG en Apple-touch180PNG; default browsericoon is192PNG via
  metadata. Oude generieke blauwe favicon.svg verwijderd, via Git herstelbaar.
- Echte native AppIcon1024PNG en filename in assetcatalogus, geen lege
  dark/tintedslots. Geen installatie/signedbuild/TestFlight/AppStoreclaim.
- Workerembedder gebruikt uitsluitend gevalideerde publieke manifestpaden en
  expliciete webmanifest. Alle nieuwe assets worden werkelijk in release meegebouwd.
- Geen serviceworker/offline/GPS of gewijzigde accountrechten uit manifest afleiden.
- Beeldgeneratie geprobeerd, maar de definitieve bron is uitsluitend de exacte
  door eigenaar geselecteerde aangehechte afbeelding. SVGreconstructie niet gebruikt.
  Reproduceerbaar formaatwerk via scripts/render-brand-icons.mjs met reeds
  geïnstalleerde Sharp; geen nieuwe package/APIkey of betaald abonnement.

## Verificatie
- 306Node-tests PASS, inclusief vier nieuwe PNG-/catalogus-/manifest-/Willyschecks.
- TypeScript, ESLint, productie-webbuild PASS.
- Xcode Debug generic iphoneos unsigned BUILD SUCCEEDED incl. assetcatalogus.
- Gebouwde Worker: alle7manifestassets exacte MIME/hash, HEAD/POST en webmanifest PASS.
- Gebouwde Supabase-route met synthetische provider: private routes/identity/
  membership/CSRF/refresh/logoutreplay PASS.
- Chromium synthetische echte HTTP/SQLite: beide thema's en zesgroottes375–1920,
  landscape844x390, geen overflow, logo geladen1024, navWillys zeven sleuven,
  bestaande Zakelijk/Privéfilters PASS. Mobiel en desktop screenshots bekeken.
- Loginbrowser: onthouden, herstel, passwordbevestiging, direct fragmentverwijderen,
  geen tokenlocalStorage en vierbreedtes PASS (authantwoorden nagebootst).
- Echte Safari/nieuwe homescreenbookmarkcache/fysieke nieuwe appinstallatie:
  NIET GETEST. Bestaande eigenaarwebaanmelding is apart bevestigd.
- Initiële buildaanroep gebruikte verkeerd CLIpad en is gecorrigeerd naar de
  aanwezige vinext dist/cli.js; pas daarna geslaagde build. Geen fout alsPASS.

## Publicatiegrens en direct vervolg
Nog NIET live gepubliceerd; huidige onlineversie da1419ca blijft en directe
Supabase-aanmelding zonder extra Cloudflarepoort is behouden.
Geen mainmerge/kosten/DB/account/gatewijziging in deze ontwerpgroep.
Afzonderlijk eigenaarakkoord nodig voor publiceren van dit geteste icoonpakket.
Daarna MIME/hash/manifest+anon401 en echte Safari Add to Home Screen controleren.
Safari kan een oud homescreenicoon bewaren; bestaand bladwijzericoon niet
stilzwijgend vervangen of verwijderen namens eigenaar.
Native opnieuw ondertekenen/installeren zodra gewenste ontgrendelde iPhone bij
Mac beschikbaar is; bestaande appdata behouden. Verdere ontwerpfeedback volgt later.
