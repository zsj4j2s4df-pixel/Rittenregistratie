# Opt-in automatisch samenhangend verversen

CLOUD-005, vervolg op PR38. Alleen bestaande geautoriseerde snapshot-GET; geen nieuwe migratie, externe service, achtergrondwrite of livepublicatie.

De gebruiker kan automatisch centraal verversen inschakelen, standaard uit. Direct na inschakelen en daarna elke60seconden wordt alleen bij zichtbaar/online scherm en buiten centrale writes een samenhangende snapshot gelezen. Maximaal één verzoek per actieve scope; requests hebben15secondenaborttimeout. Verbergen/offline pauzeert, terugkeer/online hervat. Wisselen van account/voertuig schakelt de keuze uit; late geannuleerde antwoorden worden genegeerd.

Invoer wordt per echt formulier gevolgd. Zodra er onopgeslagen invoer is, worden geen automatische snapshots opgevraagd/toegepast. Native formreset of verwijderen van het oude formulier beëindigt die blokkade; een handmatig gecontroleerde refresh blijft mogelijk. Een interactie-/scopeversie voorkomt overschrijven wanneer de gebruiker begint te typen of een handeling uitvoert terwijl een eerder readrequest nog onderweg is. Automatische reads veranderen nooit een vast geopend rapport. Snapshotviewer en voertuig moeten exact overeenkomen; andere viewer/401/403 wist de centrale gegevens, pendingweergave en rapportpreview en verlangt opnieuw verbinden. Dit is geen momentane revocatiepush: controle gebeurt uitsluitend wanneer een read daadwerkelijk plaatsvindt.

Er worden nooit opgeslagen of onzekere writes automatisch verstuurd. Dit is begrensde full-snapshotpolling, geen incrementele cursor, pushkanaal, volledige offlineapp of echte drie-iPhonesacceptatie. De bestaande snapshotlimieten/autoriseringschecks blijven gelden.

## Verificatie

225Node-tests, typecheck, volledige lint en productiebuild PASS. Chromium met echte SQL/HTTP en synthetische identiteit PASS: standaarduit, remote bronwijzigingen, explicietuitgeenpolling, hidden/offlinegeenrequests, terugkeerhervat, dirtyformgeenread en invoerbehoud, edit-tijdensinflightreadgeenoverschrijven, resetgeeftverversingvrij, accountwissel/revocationwistgegevensenconsent. Bestaande centrale opslag/rapporten/CSV/langePDF/mobiel/historierevocation opnieuw PASS. Geen Safari/echte provider/multi-iPhoneclaim.

## Vervolg

Echte iPhone-opslagmelding blijft onbegrepen zonder foutmelding/uitgevoerde opslagactie; screenshot bewijst centrale read/login. Nativehost/capture, definitieve voertuigritmaterialisatie en overige werkkaart blijven open. Geen nieuwe productiefeatures of schema's publiceren zonder afgebakend eigenaarbesluit.
