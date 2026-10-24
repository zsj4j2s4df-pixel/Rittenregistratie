# Startuitleg en loginvolgorde — 24 oktober 2026

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
