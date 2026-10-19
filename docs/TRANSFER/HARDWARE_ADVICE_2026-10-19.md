# Hardwareadvies bij PR #27

Onderzoek 19 oktober 2026, geen aankoop. Jeep Wrangler 4xe 2021 is projectcontext; exacte EU-uitvoering/Uconnect en daadwerkelijke ondersteunde voertuigdata zijn niet getest. Aanbiedingsprijzen zijn momentopnamen, geen gegarandeerde eindprijs of reservering.

## Concrete kandidaten

| Model | Aangetroffen aanbod | Relevante voordelen | Beperkingen voor RitKompas |
|---|---|---|---|
| OBDLink MX+ | OBDLink NL €149, voorraad vermeld | iOS-ondersteuning, slaap/wekken; fabrikant: 2 mA slaap, 62 mA actief, encryptie/pairingknop | Bluetooth Classic 3.0, **geen BLE**. Eigen app heeft bevestigde MFi/External Accessory-toegang nodig; bestaande diagnose-appcompatibiliteit bewijst die niet |
| Vgate vLinker MC+ | OBD24U €74,95, 1–2 weken; AsTools €67,95 met tegenstrijdige voorraadmeldingen | Onderzochte variant gebruikt BLE op iOS; fabrikant beschrijft automatische slaap/start | Exacte hardware-/firmwareversie en GATT/protocol/security eerst bevestigen. Geen betrouwbare MC+-slaapstroomwaarde vastgesteld |
| Carlinkit 5.0 / CPC200-2air | Carlinkit NL €50 aanbod | Bedrade fabrieks-CarPlay naar draadloos via Bluetooth én wifi | Vaste drie-telefoonrangorde en automatisch overnemen bij later instappende vader niet bewezen |
| Ottocast U2AIR Pro | Officiële EU-pagina €51,95 | Automatische draadloze herverbinding; bestaande bedrade CarPlay vereist | Officiële FAQ noemt doorgaans laatst gebruikte telefoon; dit voldoet niet aantoonbaar aan vaste vader→moeder→Jesse-prioriteit |

Prijzen/voorraad: [MX+ NL](https://obdlink.nl/producten/obdlink-mx-plus), [MC+ OBD24U](https://www.obd24u.nl/vgate-vlinker-mc-ble-bluetooth.html), [MC+ AsTools](https://www.astools.nl/products/vgate-vlinker-mc-elm327-bluetooth-4-0-interface), [Carlinkit NL](https://carlinkit.nl/products/carlinkit-2air-maak-bedrade-carplay-en-android-auto-draadloos), [Ottocast EU](https://www.ottocast.com/en-de/products/u2-air-pro). Levering, btw/verzendkosten en retourvoorwaarden vóór een eventuele aankoop opnieuw bevestigen.

## Advies nu

**Nog geen adapter als definitieve keuze bestellen.** Voor een eigen BLE-prototype is de juiste MC+-variant een kandidaat; voor een bewezen commerciële diagnose-app is MX+ een sterkere gedocumenteerde kandidaat, maar directe RitKompas-toegang vraagt eerst fabrikantbevestiging. Een hogere prijs bewijst geen toegang tot de officiële kilometerteller.

Geen van beide CarPlay-kandidaten voldoet aantoonbaar aan de harde vaste-prioriteitseis. Vraag schriftelijk fabrikantbewijs voor drie ingestelde prioriteiten en het scenario waarin vader later instapt, of test een demo-/leentoestel. “Onthoudt meerdere telefoons” en “laatst verbonden” zijn onvoldoende. Praktische tijdelijke optie: vader bedraad aansluiten of vóór vertrek bewust zijn telefoon kiezen; dit is handmatig en voldoet niet aan automatische vaste prioriteit. Eerst bestaande bedrade Uconnect-CarPlay via data-USB verifiëren.

## Voertuigdata en detectie

De officiële OBDLink-PID-lijst noemt snelheid `0x0D` én kilometerteller `0xA6`. Een voertuig ondersteunt slechts een subset: ondersteuning van `01 A6` op deze Wrangler 4xe is **NIET GETEST**. Er is geen betrouwbare concrete OEM-teller-PID/ECU/schaal voor deze uitvoering vastgesteld. GPS-afstand of geïntegreerde snelheid is geen uitgelezen dashboardstand. Het oudere enhanced-supportdocument noemt Wrangler tot 2021 maar bewijst geen 4xe/EU/tellerdekking.

JScan noemt Wrangler 4XE en beide OBD-kandidaten; dat bewijst een bestaande diagnoseroute, geen vrij bruikbare RitKompas-interface. JScan onderscheidt lezen/live-data van beveiligde schrijfoperaties. Voor RitKompas geen security-gatewaybypass, tuning of ECU-schrijfcommando's voorstellen.

Bluetooth/adapter-wake is alleen een signaal, geen bewezen vertrek of riteinde. Test READY/elektrisch rijden, laden, korte klantstop, reconnect, nachtelijke slaap en gelijktijdige draadloze CarPlay. Motor-RPM nul mag een EV-rit niet beëindigen. MX+ 2 mA komt rekenkundig neer op ongeveer 1,44 Ah per 30 dagen voor alleen de adapter; extra voertuig-wake moet afzonderlijk worden gemeten.

## Primaire technische bronnen

- [OBDLink MX+](https://www.obdlink.com/products/obdlink-mxp/), [verbindingstypen](https://support.obdlink.com/support/solutions/articles/43000713351), [pairinginstellingen](https://support.obdlink.com/support/solutions/articles/43000714809-get-started-with-settings): Classic/BLE onderscheiden, stroom en pairing bij boot controleren.
- [Vgate MC+](https://vgatemall.com/products-detail/i-5/), [Vgate BLE-beheerdersantwoord](https://forum.vgatemall.com/showthread.php?tid=6643), [slaap/wekken en firmware](https://forum.vgatemall.com/showthread.php?tid=6820): exacte variant testen; onbevestigde gebruikerservaringen zijn geen compatibiliteitsbewijs.
- [Apple External Accessory](https://developer.apple.com/documentation/externalaccessory/), [Apple BLE versus External Accessory](https://developer.apple.com/library/archive/qa/qa1657/_index.html): MFi-appautorisatie en Core Bluetooth zijn verschillende routes.
- [OBDLink PID-lijst](https://www.obdlink.com/obd-apps/obdlink-app/), [historische OEM-dekking](https://www.obdlink.com/wp-content/uploads/2021/11/mxp-enhanced-diag-support-coverage2021-10-21.pdf), [JScan](https://jscan.net/), [JScan SGW](https://jscan.net/fca-security-gateway-module-basic-info-and-location/).
- [Carlinkit 2air fabrikant](https://www.carlinkit.com/2air), [aanvullende winkelreview meerdere telefoons](https://carlinkitcarplay.com/blogs/news/carlinkit-5-0-2air-wireless-carplay-adapter-full-review), [Ottocast U2AIR Pro FAQ](https://www.ottocast.com/products/u2-air-pro).

Alle fysieke compatibiliteit, vaste rangorde, iOS-achtergrondgedrag, sluipverbruik in de Jeep en betrouwbare automatische ritstart/-einde blijven **NIET GETEST**. Geen bestelling of uitgave geautoriseerd.
