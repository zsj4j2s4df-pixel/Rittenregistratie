# Herstelbare instellingen en ritcorrecties

CLOUD-005, vervolg op PR42/0fc1ba99e91d8aa601e1e9747d85a008936ff6ed. Schema0014 alleen draft/lokaal. Geen livepublicatie/provisioning/migratie.

## Server

SettingsEdit en TripEdit accepteren optioneel requestId; oude callers zonder code blijven revisionbeschermd werken. Nieuwe webwrites gebruiken stabiele codes en actuele viewerpreconditie. Eén geautoriseerde mutation_requests-receipt peractor/vehicle/request verbindt operation/target/canonicalbody met het oorspronkelijke resultaat. Andere inhoud, doel of operation bij dezelfde code geeft409. De UPDATE bevat receipt- en groeiguards, de immutable receipt is onderdeel van dezelfde datatransactie/audit. Receipt- of auditfailure rolt alle wijzigingen terug. Maximaal10000receipts peruser/vehicle,16KiBcanonicalrequest/64KiBresponse; geen stille cleanup.

Exacte retry geeft een historisch resultaat zonder nieuwe UPDATE/audit, ook na latere wijzigingen of controleafronding. Daardoor kan herstel oude instellingen niet terugzetten en geen actuele controle opnieuw ongeldig maken. Actuele account/voertuigrechten blijven vereist; een receipt verleent geen toegang. De webflow leest na herstel altijd de actuele snapshot in plaats van historische receiptdata als actuele waarheid te tonen.

## Lokale queue

Bestaande opt-in IndexedDBopslag ondersteunt nu trip, report, trip-edit en settings. Eén onzekere aanvraag perkind/verifiedscope; transactioneel toevoegen voorkomt overschrijven tussen tabs. De exacte tripId/expectedRevision/requestId blijven in de lokale correctieaanvraag; tripId gaat alleen naar het geautoriseerde pad, niet als extra bodyauthority. Herstel gebruikt de oorspronkelijke geverifieerde viewerpreconditie. Lokale cleanup vergelijkt requestId zodat een late response geen nieuwer record kan verwijderen.

Geen tokens/JWT/cookies opgeslagen. Gegevens inclusief adressen/instellingen blijven ongecodeerd in dit browserprofiel, alleen na expliciete lokale opt-in; defaultuit en reset bij account/voertuigwissel. Geen automatische resend. Het is geen vertrouwelijkheidsgrens tussen mensen met toegang tot hetzelfde profiel, geen backup of volledige offlineapp. Eén onzekere aanvraag moet eerst worden hersteld of expliciet losgelaten voordat een nieuwe van hetzelfde type wordt gestart. Oude tabs met de oudere typevalidator kunnen nieuwe types veilig weigeren; reload naar de nieuwe versie voordat ze worden gebruikt.

## Verificatie

245Node-tests/typecheck/volledige lint/build PASS. Vijf nieuwe SQL/HTTP-regressiegroepen: gelijktijdigeexactretryéénwrite/audit, historischresultaatnaanderedata/controlezonderreapply, crossoperationkeyconflict, receipt/auditrollback, actorrevocation, immutabledata, malformedkeys, HTTPviewerbinding en legacycallercompatibiliteit. Gebouwde embedded Worker/cookie/JWKS/framework/HTTP/D1 settings- en correctiepatches met exacte receipt-retry PASS.

Chromium IndexedDB/HTTP/SQLite: commit+verlorenantwoord→tabsluiten/nieuwtabblad→exactzelfdebody→éénmutation; nieuwere instellingen/ritdata blijven behouden,0tellerblijft0, andereviewer zietgeenherstel, revokedretry behoudtrecord, reconnectdaarna herstel/cleanup PASS. Bestaande trip/reportIndexedDBflows met account-/cleanup-races en centraleCRUD/perioderapporten/langePDF opnieuw PASS. Synthetische identiteit/data. Safari/iPhone, volledigbrowserprofielrestart, opslag-eviction/crash/powerloss, echteprovider/sync NIET GETEST.

De echte iPhone-opslagmelding blijft onbegrepen; dit is bronontwikkeling en geen live herstelclaim. Nativequeue voor deze nieuwe patchtypes en overige live-/hardwareacceptatie blijven open.
