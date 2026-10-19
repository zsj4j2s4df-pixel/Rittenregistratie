# Actuele open werkkaart — 19 oktober2026

REQ-043 nu gebouwd/getest: maand-/kwartaal-/jaartotalen per bestuurder op vaste rapporten,225tests/type/lint/build/ChromiumPASS; REPORT_PERIOD_GROUPS.md. Centrale ingang/vereistevelden/opslagtest in PR37, geen live update. Eigenaar bevestigt login/centraleinstellingen; echte iPhoneopslag onduidelijk, geen bewezen opslagfoutoorzaak.

Actueel: alleen PR34-livefix goedgekeurd/gepubliceerd, bindings behouden en anoniem302 PASS; echte ingelogde proef MAC-CLOUD-013-LIVE-01 OPEN. Cumulatieve webkeuze nu gebouwd/getest met221Node en Chromiumlostresponse/retry/conflict/accountswitch/revoke; niet live. WEB_JOURNEY_CHOICE.md en ACCESS_RELEASE_RESULT_2026-10-19.md zijn leidend voor deze twee groepen. Oudere statusregels hieronder zijn historie waar ingehaald.

Actueel CLOUD013: PR34 bevat geïsoleerde workerd-JWKS/cookiefix + releasevoorstel;221Node/type/lint/build/lokaleD1/gebouwdeWorker in cumulatieve ontwikkeling PASS. Nog geen live publicatie of echte ingelogde eindtest. Zie ACCESS_TRANSPORT_FIX.md.

Historische prioriteit naMacPR32: liveauthFAIL ondanksuitgevoerdebindings/provisioning; nietopnieuwprovisionen. Zie OWNER_ACCESS_RESULT_2026-10-19.md. CLOUD011classificatieAPI215testsPASS/nativequeuebron aanwezig, nieuweSwiftNIETGETEST; geen definitievetripoverzetting. Verdere migraties/livecode niettoepassen zondernieuweeigenaarstoestemming.

CLOUD-011: CANONICAL_JOURNEYS.md beschrijft nu éénopenvehiclecoördinatie met explicietebewijslink/review/audit/idempotentie enHTTP/webread. Definitieve tripoverzetting, nativeclassificatiequeue/producer, echte meeraccount/hardwareacceptatie blijven open. Mac-ACK viaPR30PASS; geen automatischthreadkanaal.

Hoogprioritaire aanvulling: [PR27_PLAN](PR27_PLAN.md), [hardwareonderzoek/koopadvies](JEEP_HARDWARE_RESEARCH.md), [Mac-proeven](MAC_HARDWARE_TESTS.md). Ontvangst bevestigd; automatische directeMacuitvoering nietbewezen. Nieuwe native melding/ritgrenzen/EV/vasteprioriteit/voertuigdedup blijven open tot bewijs.

Gerichte actualisatie op basis van actuele CLOUD_TASKS/RESUME/masterprompt en open PR-keten; geen herhaling van afgeronde documentaudit. Alle123REQ-ID's en21scenario's blijven behouden. Deze kaart vervangt niet de volledige eisenregistratie. “Gebouwd” betekent ter controle, niet geaccepteerd of live.

| Onderdeel | Status / concrete vervolgstap |
|---|---|
| Code-/documentoverdracht en integriteitsguards | Gebouwd; PR#1–#5 wachten op controle, geen code-ontbreektblokkade meer |
| Centrale ritten, instellingen, correctie/audit en vaste CSV-rapporten | Gebouwd ter controle in PR#6–#16; functionaliteit/integratie staat in bewijsdocumenten |
| Samenhangend verversen | Gebouwd in nieuwste groep; begrensde transactionele full refresh. Incremental cursor, auto-sync en drie echte gelijktijdige accounts nog open |
| Herstelbare invoer/offline | Opt-in create-trip/create-report recovery via IndexedDB gebouwd en tabsluiten/accountwissel/verlorenresponse/revocation getest; geen automatische resend. Queue voor instellingen/correcties, offline starten, profielrestart/Safari en opslag-eviction blijven open. PENDING_RECOVERY.md |
| Detectie-inname en deduplicatie | Eigen geverifieerde appregistratie/HTTP/beheerUI gebouwd met audit/idempotency/deactivering. Ruwe scoped detectie-inname/HTTP/dedup/audit en begrensde webread gebouwd. Per-instance observatie/burst/dag/totaal/receiptquota gebouwd. Devicegroei/gatewayquota, detectievoorstellen/bewijs/overlapworkflow nog open. Overlapbeleidskern alleen is geen werkende native detectie |
| Accounts en Access | Bindingen en uitsluitend eigenaar/voertuigrecht al ingericht in Mac32; niet opnieuw provisionen. Ingelogde API FAIL. PR34 code-only runtimefix met eigenaarstoestemming gepubliceerd; anoniem302 PASS, echte ingelogde login/logout/revocation nog open. Geen livewijzigingen zonder nieuwe eigenaarstoestemming |
| Kaarten/GPS/routes | Scoped routepunten-read met highwaterpaginatie en schematische opgeslagen-puntenviewer gebouwd; lege route wordt niet verzonnen, gaten/bronlabels aanwezig. Opname/device-inname, echte kaartprovider/routes, retentie en hardware nog open. Geen betaalde API geactiveerd |
| PDF/rapporten | Vaste rapportweergave/browserPDF gebouwd en lange Chromium-export getest; afzonderlijke serverPDF, Safari/iPhone en toegankelijkheids-/fiscale acceptatie open |
| Backup en herstel | Lokale encrypted SQLite backup/restore met versie/AES-GCM, integriteitscontrole en herstel naar nieuw pad gebouwd;5tests inclusief echt RitKompas-schema/audit/triggers PASS. RemoteD1/export, planning/offsite/keybeheer/crashproef en productieherstel blijven open. SQLITE_BACKUP.md |
| Read-only MCP | Zes begrensde read-onlytools en gesloten runtimeadapter gebouwd; scoped synthetische tests PASS. Externe OAuth/consent/clientcompatibiliteit/ratequota nog open; geen externe koppeling geactiveerd. READ_ONLY_MCP.md |
| Native iPhone | Swiftcontracten/defaultdenyHTTPSclient en permission/lifecyclebronvoorbereiding aanwezig; Swiftcompile/XCTest/simulator/appsigning/nativeauth/GPS en achtergrondflow nog open; fysieke iPhone/Bluetooth/CarPlay/Jeep/OBD2 via Mac. Cloud kan contracten/testfixtures/nativebroncode voorbereiden |
| Instellingenhistorie | Keysetpaginatie oudere rit- en instellingenhistorie gebouwd, HTTP/SQL en browser met125regels/type/getussentijdse nieuwe audit/refresh/revocation PASS. Geen onbeperkte éénmalige dump; perpagina100/50 |
| Security/privacy en operationeel | Gerichte regressies aanwezig; volledige onafhankelijke audit, concrete bewaartermijnen/verwijdering, logging/quotabelasting, sessierevocatie en productieherstel nog open |
| Eigenaarscontrole | Main-regels eerder bevestigd; aparte GitHub-identiteit/onafhankelijke review nog open. Geen agentmerge |

De draft-PR-keten wordt per ontwikkelgroep uitgebreid. Dat zijn review-/acceptatiepunten, geen zestien ongebouwde functies. Bestaande keten behouden; geen PR/main automatisch samenvoegen of als voltooid sluiten. Nieuwste ontwikkeling wordt als volgende draft op de bestaande keten opgeslagen.

Geen nieuwe livepublicatie/kosten. Persoonlijke beslissingen, toestemming voor publicatie, echte provideridentiteiten en hardware blijven bij eigenaar/Mac. Deze afhankelijkheden blokkeren niet alle lokale ontwikkeltaken.

PR27-vervolg: peruser+vehicledevice-/receiptgroei begrensd en zuivere reviewvoorstellen gebouwd/getest; native meldingsactiebron voorbereid, NIETgecompileerd. Geencentrale canoniekevoertuigritclaim, werkend achtergrondcapture of nativeclassificatiequeue. Persoonlijkehoofdgebruiker nietgeraden. WerkkaartblijftOPEN; eerstvolgendefysiekestappenstaaninMAC_HARDWARE_TESTS.
