# CLOUD-005 — herstelbare rit-/rapportaanvragen

19 oktober2026, vervolg op draft#17/head9246810cb7d91075ff504c049579eee2eb2fb804. Geen livepublicatie, Cloudflare-mutatie, kosten of mainmerge.

## Gedrag

In /beheer kan de gebruiker expliciet kiezen nieuwe rit-/rapportaanvragen lokaal te bewaren. Standaard uit; keuze wordt bij gebruikers-/voertuigwissel gereset. De tekst meldt dat persoonsgegevens/adressen ongecodeerd in IndexedDB worden bewaard, raadt gedeelde apparaten af en waarschuwt voor browseropruiming. Geen tokens/cookies/JWT opgeslagen. Er is maximaal één onzekere aanvraag per type per gebruikers-/voertuigscope; records zijn begrensd tot20kB. Er wordt niets automatisch opnieuw verstuurd of stil verwijderd.

Met keuze aan wordt de exacte aanvraag inclusief herhaalcode transactioneel opgeslagen vóór verzending. Na een verloren antwoord kan de gebruiker dezelfde aanvraag handmatig herstellen. Serverreceipts maken retries van dezelfde account/voertuig/herhaalcode idempotent, ook als de eerste poging al gecommit was. Verwijderen van een lokale kopie vereist bevestiging en maakt geen serverrit/rapport ongedaan. IndexedDB-onbeschikbaarheid voorkomt dat een nieuwe aanvraag wordt verzonden zonder de benodigde lokale controle; de fout wordt getoond.

De scope gebruikt alleen het interne viewerId uit het geautoriseerde snapshot plus voertuig-ID. IndexedDB leest via de scope-index, niet alle gebruikersrecords in het browsergeheugen. Een extra expected-viewer-header is uitsluitend een voorwaarde die met de echte geverifieerde principal wordt vergeleken; hij verleent nooit identiteit/rechten. Een gewijzigde serveraccount geeft409 vóór een write. De echte service blijft membership, expiry, CSRF en payload controleren.

Bij een andere geverifieerde viewer worden actieve invoerformulieren opnieuw opgebouwd en consent/retryrefs/rapportpreview gewist. Oude herstelrecords blijven uitsluitend in de oorspronkelijke scope. Opruimen vergelijkt transactioneel de verwachte requestId: een late reactie of verouderde verwijderknop mag geen nieuwere aanvraag uit een ander tabblad wissen.

## Verificatie

PASS:129Node-tests vóór de afzonderlijke backupgroep, inclusief nieuw HTTP/clientgeval: twee gebruikers met hetzelfde voertuig, verkeerde expectedviewer geeft409 en geen write; correcte viewer en retry maken precies één rit. Typecheck/lint/build PASS.

PASS: echte Chromium/IndexedDB → HTTP → SQLite met synthetische identiteit/data. Rit en rapport gecommit, response afgebroken, tabblad gesloten/nieuw tabblad, herstel met dezelfde code en geen duplicaat. Andere account ziet geen herstelknop; intrekken membership weigert herstel en behoudt lokaal record. Gebruikerswissel via reconnect zonder reload leegt oude invoer en consent. Verouderde lokale-delete na vervanging door een nieuwer record wordt geweigerd en het nieuwe record blijft behouden. Deze twee races kwamen uit een gerichte agentreview en zijn daarna hersteld; dit is geen volledige onafhankelijke securityaudit.

PASS: bestaande centrale browserflows en16pagina-PDF blijven slagen. Browser-/opslagdetails: Chromium154/Linux, bestaande geïsoleerde Playwright en geïnstalleerde Chromium. Run tests/pending-browser-smoke.mjs met APP_URL, PLAYWRIGHT_MODULE, eventueel BROWSER_EXECUTABLE.

## Grenzen

Dit is expliciet herstel van create-trip/create-report, geen volledig offline product. De app moet eerst online de gebruiker/voertuigtoegang bevestigen; offline herladen opent geen onbeveiligde lokale identiteit. Instellingen en ritcorrecties hebben nog geen duurzame queue; zij vereisen eigen revision-/conflictafhandeling. Geen automatische backgroundsync. Hele browser/profielrestart, Safari/iPhone, quota/eviction/crash/powerloss en echte providerlogin NIET GETEST. IndexedDB is geen vertrouwelijkheidsgrens tussen mensen met hetzelfde browserprofiel, geen backup en niet versleuteld. Verwijderde browseropslag kan niet worden hersteld. Serveridempotentie vervangt geen detectiededuplicatie van verschillende aanvragen/apparaten.
