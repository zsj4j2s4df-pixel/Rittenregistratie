# CLOUD-005 — rapportage en webbediening

18 oktober 2026. Eigen uitvoering met één onafhankelijke gerichte correctness/securityreview; geen volledige productieauth-audit of twee securitygoedkeuringen.

## Gebouwd op de bestaande demo
- Handmatige ritinvoer met verplichte velden, onzekerheid privé/te controleren, onbekende bestuurder, beschermde provenance en before/after-historie. Geen GPS-route verzonnen.
- Kentekeninstelling gedeeld met Mijn Jeep en nieuw gemaakte rapporten.
- Tarieven met geldigheidsperiodes, overlapcontrole, expliciet onbekend bij ontbrekend tarief; geen fiscaal standaardbedrag ingevuld. Geldberekening met integer micro-euro/millikilometers en afronding per rit naar centen; veilige grenzen en maximaal drie afstandsdecimalen expliciet gecontroleerd.
- Periode-/bestuurdersrapporten met totalen, waarschuwingen, CSV en afdruk/PDF via de browser. Rapporten zijn onveranderlijke snapshots; tarief-/ritcorrecties wijzigen reeds gemaakte snapshots niet.
- Lege CSV-export geblokkeerd. CSV-formuleprefixen, quotes, komma's en newlines veilig gecodeerd. Overlapcontrole gebruikt de gehele voertuigperiode, ook bij een bestuurdersfilter.
- Adressen toevoegen, wijzigen, uitschakelen en verwijderen met lokale before/after-historie; adresmatch classificeert niets automatisch.
- Kaartscherm selecteert echte demoritgegevens en biedt expliciete doorgifte naar Apple Kaarten. Zonder GPS-punten geen fictieve route op dit scherm; berekening door Apple vervangt geen geregistreerde route.

## Testbewijs
- 50/50 dependencyvrije Node-tests PASS; TypeScript en ESLint PASS; Vinext-webbuild PASS.
- Chromium 154: browser-smoke PASS op desktop en 390px mobiel: kenteken, tarief/adresbeheer, historische snapshots, CSV-download, afdruk-PDF, zandthema/viewport, Apple-Kaartenlink, ritcorrectieformulier en handmatige invoer.
- PDF uit Chromium aangemaakt en geïnspecteerd: A4 landscape, herhaalde tabelkoppen en paginanummers; kenteken, totalen, waarschuwingen en ritten tekstueel aanwezig. Browser-PDF is geen zelfstandige server-PDF-renderer en geen fiscale goedkeuring.
- Screenshot visueel gecontroleerd; mobiele tabel scrollt horizontaal met leesbare kolommen, beide thema's blijven bereikbaar.
- Onafhankelijke reviewer vond twee fouten (overlapfilter en lege CSV); opgelost met regressietests en gerichte hercontrole (10/10 rapportagedomeintests). Eén review, niet twee.

Browsercheck: start de lokale Vinext-server en voer tests/browser-smoke.mjs uit met Playwright beschikbaar (eventueel PLAYWRIGHT_MODULE, BROWSER_EXECUTABLE, APP_URL en ARTIFACT_DIR). De gebruikte testtools staan geïsoleerd buiten de projectdependencies; geen lockfilewijziging of extra externe dienst.

## Grenzen
Ritten, instellingen en rapporten leven alleen in de demosessie en verdwijnen bij herladen. Geen productiegegevens invoeren. Nog geen login/geverifieerde serveridentiteit, duurzame centrale opslag/sync, echte GPS-/kaartdienstintegratie, native app, definitieve fiscale export of geteste iPhone. Alle betreffende mastereisen blijven open. Volgende veilige groep: serverrepository met geteste objectrechten, versieconflicten en atomische audit, zonder ongeteste authprovider te activeren.
