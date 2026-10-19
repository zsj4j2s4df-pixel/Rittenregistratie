# Bestanden en resterend softwarewerk — 19 oktober 2026

GitHub-bronbasis: PR36/head f96b3e583ece1c60f2f2197f6c3b59e91d3c32e3, tree f416ca8251f41b119c760f8a6033e4297a481087. Alle36open PR's teruggelezen op titel/head/base; PRketen behouden. Volledige recursieve bestandslijst:261tekstbestanden,92Markdown,1.979.770gelezenbytes. Hashvergelijking bevestigt de lokale bron tegen GitHub; alleen de vier bewust aangepaste bestaande bestanden van deze groep weken af. Nieuwe lokale bronbestanden volgen in de eigen draft. De inhoudsscan over alle bestanden is gecombineerd met masterprompt/eisenregister/M27/werkkaart en gerichte code-/testcontrole; dit is geen onafhankelijke audit van iedere regel.

De123REQ-ID's en M27-01–16 blijven intact. Historische “code ontbreekt”/“Access ontbreekt”-teksten zijn geen nieuwe taken. Opmaak en tekstredactie zijn door eigenaar uitgesteld. De onderstaande functionele onderdelen blijven open waar niet bewezen opgeleverd.

| Gebied | Wat al werkt / bewijs | Resterend werk |
|---|---|---|
| Login en toegang | PR34live, anoniemAccess302; eigenaar toont centrale voertuig/instellingen | Echte iPhone-savefout vaststellen, logout/revocatie, gescheiden agentidentiteit en onafhankelijke acceptatie |
| Centrale opslag | Gebouwde Worker+D1create/read/retry/settingsPASS | Echte gebruikersacceptatie op huidige liveversie; nieuwe bronfeatures nog niet gepubliceerd |
| Webformulieren | Centrale ingang, lokale verplichteveldcontrole, feedback-in-beeld gebouwd | Browser/Safariacceptatie; latere rustige opmaak/korte teksten |
| Ritcorrecties/historie | SQL/HTTP/browser/audit/conflicten gebouwd | Echte meergebruikersacceptatie en duurzame onzekere correcties/settingsqueue inmiddels gebouwd/getest in MUTATION_RECOVERY.md; echte Safari/nativeacceptatie |
| Rapporten/vergoeding | Vaste snapshots, exactgeld, CSV/printPDF, onbekende waarden behouden | Maand/kwartaal/jaar per bestuurder inmiddels gebouwd/getest in REPORT_PERIOD_GROUPS.md; zelfstandige serverPDF en fiscale acceptatie |
| Sync/offline | Coherente handmatige snapshot en opt-in IndexedDBcreate/reportrecovery | Opt-in coherente polling nu gebouwd/getest in AUTO_COHERENT_REFRESH.md; incremental cursor en echte multi-iPhoneacceptatie nog open; Safari/profile-restart/eviction; settings/correctionrecovery inmiddels gebouwd/getest in MUTATION_RECOVERY.md |
| Detectie/deduplicatie | Boundedrawingest, devices, quota, voorstellen, éénopenreviewcoördinatie en keuzeAPI/web | Expliciete review→éénlogboektrip met duurzame koppeling nu gebouwd/getest (REVIEWED_JOURNEY_TRIPS.md); expliciete logboekreviewafronding inmiddels gebouwd/getest in EXPLICIT_TRIP_REVIEW.md; automatische praktijkacceptatie open; echte sensoren/einde/EV/tweeminutenklantstop |
| Native iPhone | SwiftCore/clientcontracts, meldings-/versleuteldequeuebron | Geconfigureerde nativeauthprovider, host/delegate/consumer, capture/achtergrond/restart, Swift/XCTest/iOScompile en echte iPhone |
| Kaarten/route | Scoped puntenread, highwaterpaginatie, schematischeviewer | Duurzame opname/inname met reviewprovenance; echte kaartprovider en routes/retentie; geen route verzinnen |
| Jeep/OBD2/CarPlay | Bestaand fabrikantonderzoek/koopadvies en Macproeven behouden | Werkelijke Jeepmetingen, vaste iPhoneprioriteit, entitlement/Shortcutsacceptatie, OBDkilometerstand/veiligtransport |
| Accounts | Alleen eigenaar+geverifieerdvoertuigrecht ingericht | Andere gezinsaccounts via expliciete identiteitsverificatie/toestemming; geen eigen accountaanmaak of subjectraden |
| Backup/operatie | Lokale AES-GCMbackup/nieuwpadrestore getest | RemoteD1/offsite/keybeheer/crashherstel/bewaartermijnen/monitoringquota |
| MCP | Gesloten scopedreadonlyAPI/tools getest | Externe OAuth/consent/clientcompatibiliteit en veilige bevestigde schrijfacties; niet activeren zonder toestemming |
| Visueel/voertuiggegevens | Beide thema's/placeholder/merkneutraliteit behouden | Latere opmaak, juiste eigenfoto/uitvoering, voorkeur peraccount, toegankelijkheidsacceptatie |

Uitvoeringsvolgorde: opslag/validatiegroep opslaan; daarna periode-/bestuurdertotalen boven vaste snapshots bouwen; vervolgens overige veilige backend/webtaken. Voor hardware/Apple/loginbewijs GitHub/Mac gebruiken. Geen nieuwe kosten, gevoelige koppeling, productiefeaturepublicatie, migratie of mainmerge uit deze inventaris afleiden.
