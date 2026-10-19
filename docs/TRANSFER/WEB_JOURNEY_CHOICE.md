# Expliciete webkeuze voor voertuigritvoorstellen

19 oktober2026, CLOUD-011-vervolg boven PR35. Conceptcode, niet live gepubliceerd. Geen nieuwe migratie/schema/dependency of gevoelige koppeling.

/beheer laat na het openen van een ritbewijs expliciet Zakelijk of Privé kiezen. Beide gebruiken de bestaande choice-API met het geverifieerde viewer-ID uit de voertuigsnapshot, verwachte ritbewijsrevisie, vaste auditreden en één willekeurige requestId. Een keuze maakt geen definitieve rit aan en stelt geen chauffeur, afstand of fiscale goedkeuring vast.

Bij netwerkverlies/5xx of een ongeldige bevestiging blijft exact dezelfde aanvraag alleen in het tabblad staan. Er volgt geen automatische resend. De gebruiker kan dezelfde keuze opnieuw proberen; andere keuzes en detailwissels zijn geblokkeerd zolang de bevestiging onzeker is. De bevestiging moet journey/viewer/request/revision/classification exact matchen. Na bevestiging wordt geen oude aanvraag teruggezet als alleen verversen mislukt.

Bij401/403/404/409 verdwijnen lijst/detail en lokale aanvraag; opnieuw centraal laden en controleren is verplicht vóór een nieuwe keuze. Serveraccountwissel wordt door x-ritkompas-viewer afgewezen. Een expliciet bevestigde lokale loslaatknop draait een eventuele serverkeuze niet terug en vraagt daarna opnieuw lezen. Reload, tabsluiten of account/voertuigwissel kan deze geheugenaanvraag verliezen: dit is nadrukkelijk geen duurzame offlinequeue. Bestaande native versleutelde queuebron blijft een afzonderlijke, nog niet op iOS geteste implementatie.

## Verificatie

PASS221/221Node-tests, typecheck, volledige lint en productie-webbuild. PASS echte Chromium tegen gebouwde /beheer met HTTP-handlers en SQLite/synthetische identiteit:

- Aanvraag wordt server-side gecommit, antwoord gaat verloren, exacte retry geeft één choice/één audit en dezelfde requestbody.
- Geen extra definitieve trip aangemaakt.
- Een andere reviewer verhoogt de revisie: oude keuze409, geen extra write, detail wordt gewist en moet opnieuw worden gelezen.
- Account wisselt na laden:409, geen write onder andere identiteit.
- Voertuigrecht wordt ingetrokken:403, lijst/detail verdwijnen, geen keuze-write.

Herhaal met APP_URL=http://127.0.0.1:4218 en een bestaande PLAYWRIGHT_MODULE naar Playwright: node --experimental-strip-types tests/journey-browser-smoke.mjs. Geen installatie op Mac. Deze proef bewijst geen live Access-login, Safari/iPhone of native achtergrondflow.

## Open vervolg

Echte Access-loginproef na beperkt live PR34-pakket is afzonderlijk MAC-CLOUD-013-LIVE-01. Nieuwe webkeuze zit in ontwikkelstack en is niet gepubliceerd. Definitieve voertuigritoverzetting naar precies één trip vraagt expliciete duurzame koppeling/idempotentie/review en blijft open; niet improviseren met geschatte afstand, automatisch bestuurder of nieuwe live migratie. Native queue-host/authprovider/delegate en Apple-compile/hardware blijven open. Zie OPEN_WORK en MAC_HARDWARE_TESTS.
