# CLOUD-005 — bestuurdercorrectie en centrale rapportweergave

19 oktober2026. Vervolg op draft-PR #15, exacte GitHub-parent cf3b6386ca5f1d4008d478ff4bc0929b37b0d136. Zelfstandige ontwikkeling naast Mac's Access-instelling; geen nieuwe livepublicatie of Cloudflare-mutatie. Bestaande mastereisen voor bestuurdercorrecties, audit, vaste rapporten en lange export blijven leidend.

## Geleverd

- Bestaande rit: bestuurder expliciet wijzigen naar een actieve bevoegde bestuurder of Onbekend. Ontbrekende driverId in een ouder formulier behoudt de bestaande waarde; expliciet leeg maakt onbekend. De backend blijft beslissend voor actieve membership, revision en verplichte correctiereden. Geen automatische toewijzing op prioriteit.
- Audit behoudt oude/nieuwe bestuurder; ontoegankelijke/vervallen bestuurder en ingetrokken callerrechten worden afgewezen zonder extra revisie/audit. Een niet-actief bestaand account blijft herkenbaar in het formulier met opdracht een actieve bestuurder of onbekend te kiezen. Historie verversen leegt oude items; een geweigerde herlezing laat geen oude lijst staan.
- Rapport bekijken haalt de echte opgeslagen snapshot op via bestaande scoped GET. Kenteken, instellingenrevisie, periode, aanmaakmoment, bestuurder, ritdetails, herkomst, standen, tarief/bedrag, bekende totalen, onbekendentellingen en alle waarschuwingen zijn zichtbaar. Geen reconstructie uit de actuele rittenlijst: latere correcties veranderen het oude rapport niet.
- Browserafdruk/PDF-opslag op expliciete knop en bevestiging. Voor window.print wordt het snapshot opnieuw via de beveiligde API gelezen. Bij weigering sluit het rapport en blijft de afdrukaanroep achterwege. Rapport sluiten/voertuigwisseling verwijdert de rapportweergave. Alleen het gekozen rapport wordt afgedrukt; invoerformulieren en beheerpanelen worden verborgen.
- A4 landscape, witte achtergrond, vaste kolombreedtes, terugkerende kolomkoppen en Chromium-paginanummers. Waarschuwingen worden per rit gebundeld zonder meldingen weg te laten. Lange adressen blijven leesbaar in een brede routekolom, niet veertien te smalle kolommen.

## Verificatie

PASS:123Node-tests, volledige typecheck, ESLint en vinext build. Extra integratietest gebruikt browserformulierconversie → client → echte HTTP-adapter → SQLite/service/audit en controleert toewijzen, expliciet onbekend, ingetrokken bestuurder en caller, geen gedeeltelijke mutatie.

PASS: uitgebreide centrale Chromium→HTTP→SQLite-smoke met synthetische identiteit, bestaande responseverlies/retry/reconnect/conflict/instellingen/CSV/mobiel plus bestuurdercorrectie naar onbekend, snapshot openen, oude snapshot heropenen na latere ritwijziging, succesvolle afdruk-herautorisatie en weigering na revocation, historie leeg na geweigerde verversing. Geen live provideridentiteit.

PASS: browser-PDF met81ritten,80extra synthetische lange-adresritten. Eerste proef96pagina's wees op te smalle kolommen/te ruime losse waarschuwingen; definitieve opmaak16A4pagina's. pdfinfo/pdftotext bewijzen alle80extra bestemmingen, herhaalde headers, disclaimer en afwezigheid van invoerformulieren. Eerste en laatste pagina visueel bekeken; expliciete stand0 zichtbaar. tests/pdf-layout-smoke.mjs bewaakt2–25pagina's en bestemmingen voor deze vaste fixture. Geen algemene garantie voor alle rapportgroottes.

PASS: lokale gebouwde app API503/no-store/nosniff en demo200 zonder Accessconfig. Geen nieuwe D1-migratie of gewijzigde backendautorisatie; bestaande services hergebruikt. Beperkte patroonscan0bevindingen, geen volledige onafhankelijke securityaudit.

Reproduceren: standaard Node-tests, tsc, lint, build; start vinext op lokale poort. Run tests/central-browser-smoke.mjs met APP_URL, PLAYWRIGHT_MODULE en geïnstalleerde Chromium. Daarna node tests/pdf-layout-smoke.mjs <artifactmap>/central-long-snapshot.pdf; poppler pdfinfo/pdftotext vereist. Artefacten bevatten uitsluitend synthetische data en staan buiten Git.

## Grenzen / vervolg

Dit is browser-PDF-opslag, geen zelfstandige PDF-generator op de server. iPhone/Safari, echte gebruikerslogin, remote synchronisatie en native/hardware NIET GETEST. PDF/UA-toegankelijkheid en fiscale goedkeuring worden niet geclaimd. Reeds bekeken/gedownloade gegevens kunnen niet worden teruggetrokken; knop controleert actuele rechten vóór een nieuwe afdruk. Coherente sync/cursors, duurzame pendingqueue, detectie-inname/deduplicatie, backup/herstel en read-onlyMCP blijven open. Mac's Access-configuratie niet gewijzigd; geen credentials, accounts, kosten, mainmerge of livepublicatie.
