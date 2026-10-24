# Transparant Zakelijk-logo — 24 oktober 2026

## Uitgevoerd
Eigenaar: ‘haal witte achtergrond weg en plaats nieuw overal waar hij moet staan als icoon’, met Canva-verwijzing. De Voetel-logo geïnterpreteerd als doel; Willys-merk niet vervangen. Officiële bestaande GIF behouden. Canva-media gecontroleerd; background remover vraagt betaald plan en is niet geactiveerd. Ingebouwde imagegen gebruikt, daarna alleen PNG-resize/optimalisatie met Sharp.

Bewerkprompt: verwijder uitsluitend de buitenste witte achtergrond naar echte alpha, behoud grijs/oranje/zwart beeldmerk en de teksten DE VOETEL / Sportcentrum & Camping; geen herontwerp, kader, schaduw of nieuwe achtergrond. Automatische extractie kan minieme randverschillen opleveren; geen pixel-identieke reconstructie claimen.

Resultaat: public/brand/de-voetel-transparent.png,1040×533,269014bytes,RGBA/echte alpha. SHA256:66d187214f71d7c15ab72025eff8cf4264cf478660f341c59a9296031e508f83. Native kopie DeVoetelLogoTransparent.png is byte-identiek. Webfilter en zakelijke ritkaart gebruiken de centrale component; native Homevoorkeur, keuze en badges de gedeelde helper. Geen witte CSS-achtergrond, op Anthracite een fijne lichte rand-schaduw voor leesbaarheid.

## Huisstijl en herstel
Huisstijl1.2/skill/assetmanifest onderhouden. Eerdere tijdelijke ontwerpcheckout is niet meer aanwezig; stijl uit blijvende bronnen hersteld in work/ritkompas-current-20261024, gebaseerd op PR64/head8f729bd89a17301d4b0b19c436f70f8198b51554. Offroadfoto/Willys-merk in website/login en Willys7sleuven hersteld; centrale backend/auth/rechten blijven ongewijzigd. De rootapp is niet de actuele productiebron.

## Werkelijk getest
- 301Node-tests:301PASS/0FAIL; TypeScript/lint/webbuild PASS.
- Unsigned Xcode Debug/iphoneos-build PASS; geen signing/toestelinstallatie.
- Chromium: beide thema's,375/390/844×390/1280/1440/1920; alpha-afbeeldingen geladen, geen wit achtergrondvlak of horizontale overflow; filters PASS. Mobiele screenshots beide thema's visueel bekeken: origineel gekleurd beeldmerk herkenbaar, zwart woordmerk met fijne lichte rand op donker.
- Bestaande registratiebrowser: echte lokale HTTP/SQLite, correctie/historie/rapport/CSV/PDF, zes breedtes en authverlies PASS; fictieve identiteit/data.
- Loginbrowser: remember/herstel/passwordconfirm/fragmentverwijdering en vier breedtes PASS; provider gesimuleerd.
- Gebouwde release-wrapper in echte lokale workerd: alle drie gekozen beelden exact MIME/hash,GET/HEAD200 en POST405 PASS. Geen upload.
- Nativehelper compileert en bundel bevat PNG; visuele controle op fysieke iPhone/Safari/200%tekst NIET GETEST in deze groep.

## Grenzen en hervatten
Dit zijn lokale bronwijzigingen, geen nieuwe livepublicatie of GitHub-overdracht. Geïnstalleerde iPhone heeft deze PNG nog niet ontvangen. Geen kosten, mainmerge, migratie, accountrechten of beveiligingsversoepeling.
Volgende veilige stap: bronreview/afzonderlijke PR met alleen code, huisstijl en gekozen publicatiebeelden. Geen buildlogs, lokale testdatabase, screenshots van echte gegevens of credentials meenemen. Livepublicatie vereist afzonderlijke actuele toestemming; iPhone-installatie/signing apart uitvoeren met toesteleigenaar.
