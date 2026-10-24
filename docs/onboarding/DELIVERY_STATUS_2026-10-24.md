# Startuitleg en loginvolgorde — 24 oktober 2026

## Nieuwste tekstcorrectie: eerst link openen, daarna herstel

Eigenaar vraagt na de chattekst opnieuw hetzelfde mooie overzicht. `/hulp` en
reviewmail herschikt:1aanmeldlink,2Wachtwoord vergeten→Stuur herstellink + mail/spam,
3Nieuw wachtwoord/Herhaal wachtwoord/Wachtwoord opslaan,4Inloggen met eerst opt-in.
Echte knopnamen op livepagina gecontroleerd zonder herstelmail te versturen.
Account moet vooraf klaarstaan; recovery maakt geen account of rechten aan.
Bestaand werkend wachtwoord: sla herstel over. Huisstijl1.6 gespiegeld; geen
nieuwe assets, accounts, rechten, mails of nativewijziging. Publicatiebewijs volgt.

## Definitief: LIVE en browseracceptatie PASS

- Uitleg: https://rittenregistratie.zsj4j2s4df.workers.dev/hulp
- Aanmelden: https://rittenregistratie.zsj4j2s4df.workers.dev/login
- GitHub [PR68](https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/68),
  branchmac/onboarding-help-20261024, bovenPR67; geen mainmerge.
- Gepubliceerde bron774a5bf24f99416ba1f7136aef289437d89b768a /
  treea23b960c1e9d3129e4353eed117e911d59d3ea47, exact lokaal d64f9b5.
- Werkelijke versiea9f0ee9b-08c8-4eca-b076-0183e837a39c,
  deploymenta544276e-2c0b-4a52-9088-3113019c1e22/100%, na publicatie teruggelezen
  uitsluitend in juiste account e9922d90d4223d8522e44cb000c5d608.
- Alle7bindings exact met beoordeelde configuratie vergeleken en behouden.
  Directe login/hulp200. Echte anonieme liveChrome: ready, vinkje standaarduit/
  aan/uit zonder submit, hulp openen en terug, zichtbare nummers/vierformaten,
  geen pageerrors PASS. Zeven assets MIME/hash/HEAD/manifest en Willys behouden.
  Zes private API's401/no-store, vervalste oudecredentials401 en foreign-origin403.
-309Node/type/lint/build, lokale productieChrome en synthetische Worker/Auth/D1
  PASS. Laatste beperkte patrooncheck460files/1194historische blobs:0bevindingen.
- GEEN mail verzonden, GEEN nieuwe accounts/invites/rechten. Doorstuurbare algemene
  uitleg klaar; Jesse moet eerst controleren. Geen nieuwe nativeinstallatie.

Dit is de actuele status. Onderstaande eerste-publicatie-/voorbereidingsregels
zijn uitvoeringshistorie, niet een open blokkade voor de huidige hulplink.

Eigenaar keurde plan goed: eerst algemene uitleg laten controleren door Jesse,
daarna pas de twee overige persoonlijke uitnodigingen. Die stap niet overslaan.

## Implementatie

- `/hulp`: deelbare openbare uitleg, geen echte accountgegevens/invitelinks.
  Accountsetup, spam, herstel, optionele sessie, iPhone Safari en laptopinstallatie.
  Expliciet webapp/internet; automatische capture/CarPlay/OBD2 niet beschikbaar;
  native nog in ontwikkeling/hardwareacceptatie open.
- Login: remember-keuze boven credentials, standaard uit, gekoppelde uitleg,
  kliklabel44px en expliciete submit. Geen nieuwe API/schema/migratie.
- Huisstijl1.5 en bestaande goedgekeurde iconen behouden. Projectstructuurindex
  in docs/PROJECT_STRUCTURE.md; alleen veilige projectbestanden naar publiek Git.
- Algemene reviewmail klaar in docs/onboarding/README.md. NIET VERZONDEN:
  geen mailconnector; Gmail kwam bij geblokkeerde Workspace-origin. Niet omzeild.
  Eigenaar kan de algemene URL/mail aan Jesse doorsturen. Geen persoonlijke
  uitnodigingen of account/membership/driverprioriteit gewijzigd.

## Testen en release

308 Node-tests, TypeScript, ESLint en webbuild PASS. Gebouwde releasewrapper met
assets/MIME/hash/manifest PASS. Echte workerd/lokaleD1 met synthetische Auth:
anonymous401, mappings/rechten/viewer/CSRF, remember-off/on, refresh/logout/replay
PASS. Chromecheck: invoervelden/vinkje vullen verstuurt niet; expliciet inloggen
met beide rememberkeuzes; herstel/wachtwoord/hashverwijdering PASS. Provider mocked.
Dit bewijst niet de werking van elke iOS-wachtwoordmanager/autofill-autosubmit.
Chrome extra: beide login-thema's, zes formaten375/390/844landscape/1280/1440/1920,
hulppagina in vasteDesert, genummerde lijsten,44px-keuzelabel en 200%tekst zonder
horizontale overloop PASS. Screenshots lokaal visueel gecontroleerd, niet publiek
geüpload. Twee gevonden opmaakpunten (resetlijstnummers/200%header) gecorrigeerd.
Patrooncontrole458bestanden/1173historische blobs: geen bevindingen; geen volledige
geheimenvrijgarantie. Bestaande private data/certificaten/builds blijven uitgesloten.

Publicatie wordt pas als LIVE gemarkeerd nadat account-/bindingsreadback en
anonieme HTTP-/browsercontroles geslaagd zijn; zie eventuele releaseaanvulling.
Eerste publicatie345ad32c/deployment50657c5d gaf publieke HTTP200 maar de echte
Chrome-doorklik faalde met framework-Linkfout ‘e is not a function’. Niet als
geslaagde browseracceptatie opgeleverd. Gerichte correctie: gewone documentlinks
voor login/hulp, geen account-/API-/securitywijziging. Extra lokale productie-
browserharness met echte workerd en lege lokaleD1 voorkomt dev-onlyacceptatie.
Deze gecorrigeerde productiebuild is vervolgens écht via lokale HTTP→Chrome→
workerd getest: loginready, vinkje aan/uit zonder submit, hulp openen en terug naar
login, zichtbare nummers en vier formaten PASS, geen pageerrors. Nieuwe guard
tegen herinvoeren van framework-Link; totaaltelling nu309Node-tests PASS.
Doel uitsluitend bestaand account e9922d90d4223d8522e44cb000c5d608,
Worker rittenregistratie, subdomainzsj4j2s4df, bestaande DB/Supabase behouden.
Extra verse D1-export door veiligheidscontrole geweigerd; geen omweg. Bestaande
gecontroleerde versleutelde backup/restore van dezelfde avond behouden. Deze
release schrijft geen productiedata en voert geen migraties/accounts uit.
Geen nieuwe volledige datavergelijking claimen. Geen mainmerge/kosten/gatewijziging.

## Direct hervatten

1. Laat Jesse de algemene uitleg controleren; wacht op expliciet reviewakkoord.
2. Daarna accountduplicaten opnieuw controleren en het bestaande cutoverdraaiboek
   volgen voor de twee overige mensen, met expliciete veilige toegang/mapping.
3. Ontvangst/setup/login en echte Safari/homescreeninstallatie samen bevestigen.
4. Nativebron blijft ongewijzigd: geen nieuwe build/installatie/hardwaretest.

Echte verzending, tweede/derde persoonlijke accountacceptatie, nieuwe fysieke
iPhone-installatie, Safari-homescreenacceptatie NIET GETEST/NIET UITGEVOERD.
