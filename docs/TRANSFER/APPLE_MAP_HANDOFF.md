# Expliciete Apple Kaarten-overdracht — 19 oktober 2026

Vanaf PR43/226cb59f217e656f3800fd5eb3867388fdb7da77. Alleen door de gebruiker geopende navigatie; geen kaart-API, account, sleutel, achtergrondverzoek of nieuwe dependency.

Na bevestiging leest de browser het volledige begrensde spoor opnieuw met de geverifieerde viewerbinding. Accountwisseling/intrekking voorkomt navigatie en wist de oude weergave. Alleen werkelijk eerste/laatste opgeslagen GPS-punten met bekende nauwkeurigheid ≤100m, geldige coördinaten en verschillende tijden/posities zijn toegestaan. Geen geïnterpoleerde vervanging of GPS-authenticiteitsclaim. De vaste HTTPS-URL bevat uitsluitend die twee coördinaten en mode=driving. Same-tab navigatie zonder referrer; geen app-token, identiteit of tussenpunten. De afstand en opgeslagen punten blijven ongewijzigd. Apple berekent zelf een nieuwe route.

Fabrikantbron werkelijk opgehaald op 19 oktober 2026: https://developer.apple.com/documentation/mapkit/unified-map-urls en bijbehorende publieke documentatie-JSON. Actuele syntax /directions?source=…&destination=…&mode=driving. Volgens Apple beschikbaar vanaf iOS18.4/macOS15.4/watchOS11.4. Oudere systemen en het werkelijk openen van native Kaarten zijn NIET GETEST; browser/OS bepaalt app of web. De oudere MapLinks-documentatie redirect naar deze actuele bron.

PASS: 247/247 Node-tests, typecheck, volledige lint, productiebuild. Chromium met lokale synthetische SQLite/HTTP-fixture: 1203-puntenpaginering, geen verzonnen lege route, onzekere/geïnterpoleerde eindpunten geblokkeerd, annuleren zonder verzoek, verse viewergebonden read, alleen coördinaten zonder referrer, geen afstand/spoormutatie, accountwisseling en intrekking blokkeren overdracht. Externe Apple-navigatie onderschept: geen echte GPS/providerrequest verzonden. Geen Swift/iPhone/hardware/livepublicatieclaim.

Mac/eigenaar: na afzonderlijk goedgekeurde release op iOS18.4+ met synthetische route controleren dat annuleren niets deelt en bevestigen juiste Apple-bestemming opent. Controleer Safari en terugkeer naar RitKompas. Geen persoonlijke ritgegevens in bewijs. Native route-inname/capture en providerkaartondergrond blijven open.
