# CLOUD-005 — eerste centrale webbediening

18 oktober2026. cloud/cloud-005-central-web, base API-runtime/draft-PR #12. Geen productie/deployment/accountactivering. Oude demonstratie blijft apart.

## Gebouwd
/beheer gebruikt uitsluitend de beveiligde backend: voertuigselectie uit actieve accountrechten, volledige gepagineerde ritten-/rapportlijst, handmatige ritinvoer met echte0stand, kentekenwijziging met reden, vaste rapporten en CSV. Geen fallback op voorbeeldritten of fictieve gebruiker. Rootdemo verwijst herkenbaar naar centrale registratie.

/api/vehicles geeft alleen id/naam/kenteken van actieve voertuiglidschappen; userdisable/rollen en pagination gecontroleerd. Shared verifiedPrincipal/worker-api voorkomen afwijkende identiteit/config tussen vehiclelist en bestaande routes. Ontbrekende Workerconfig blijft503, geen echte providerlogin hierdoor gerealiseerd.

Client gebruikt same-origin credentials, no-store, redirect:error, CSRF-header bij writes en expliciete typedpayloads. CSV wordt gecontroleerd opgehaald als Blob en pas na gebruikerbevestiging gedownload; HTML-loginpagina wordt geweigerd. Geen JSON-import/export van privédata naar repository.

Bij servercommit met verlorenresponse blijft dezelfde requestId/invoer binnen dezelfde mount bewaard. Aangeboden Opnieuwverbinden herlaadt gegevens zonder pagereload; identieke retry maakt geen tweede rit. Geen automatische retry of overschrijven bij409. Kentekenwijziging bewaart bestaande adressen/tarieven en historische rapporten.

## Bewijs
111/111 Node-tests PASS, typecheck/lint/build PASS.6nieuwe client/vehiclecases met echte HTTP-adapter+SQLite: centrale roundtrip, lost-response-aftercommit, stale409, vehicleprivacy/pagination, >100trips volledig laden en HTML-als-CSV weigeren.

Chromium154 centrale-browser-smoke PASS: echte browser→gedeelde HTTP-kern→in-memory SQLite; identiteit gesimuleerd, geen echte Cloudflaretoken. Bewijst unconfigured503/geen demodata, create, exactlostresponse→aangebodenreconnect→retry zonderdubbel, page-reload→opgeslagenrit, kenteken, concurrent409zonderoverschrijven, rapport/CSVdownload, mobiel390px/theme en geen horizontale paginaoverflow. Screenshots desktopdonker/mobielzand visueel gecontroleerd. Bronbestand tests/central-browser-smoke.mjs (Playwright buiten projectdependencies).

Gerichte onafhankelijke review vond reconnect/pendingcodeverlies; gefixt/hercontrolePASS en exacte browserrepro groen. Browsertest vond directCSVdownloadannulering en overlappende mobieleheader; Blobdownload en headerhoogte hersteld, normale bediening opnieuw getest. Geen omzeiling met geforceerde clicks.

Bestaande demobrowserregressie (desktop/mobiel/CSV/PDF) blijftPASS. Lokale workerd/D1-smoke en werkelijke built-Node503-smoke blijvenPASS, ook nieuwe vehiclelistSQL. Geen productie-/volledigeauthaudit.

## Nog open
- Echte Accessinrichting/DBbindings/bootstrap en remote/login/end-to-end met drie personen, logoutrevocation en WorkerCPU/quota/privacy.
- Dit is een eerste centrale interface: volledige centrale adres-/tariefCRUD, ritcorrectie-/historiebediening, bestuurderbeheer/filters, serverPDF, realtime/offline-sync en automatische detectie ontbreken nog. Niet als complete interface of nativeapp presenteren.
- Handmatige invoer gebruikt de apparaatstijdzone (zichtbaar uitgelegd); rapportperiode en getoonde ritdatums zijn Europe/Amsterdam. Bestuurder bij nieuwe rit onbekend en needs_review; geen prioriteit als bewijs.
- Pendingcodes staan alleen in geheugen. Browser afsluiten/eigen handmatig reload tijdens onzekere write is nog geen herstelbare offlinequeue; aangeboden reconnect bewaart ze wel. Geen adres/GPS-invoer in localStorage gezet.
- Gepagineerde lijst is geen transactionele snapshot tijdens gelijktijdige mutaties; expliciet vernieuwen en serverrevisions blijven nodig. Rapportbron zelf is coherent. Meerdere apparaten/echte netwerkuitval nog apart testen.
- Alle mastereisen blijven behouden. Volgende lokale groep: centrale adres/tarief-/correctie/historiebediening, daarna synchronisatie/detectie/herstel/MCP. Niet alle lokale ontwikkeling is door accounts geblokkeerd.
