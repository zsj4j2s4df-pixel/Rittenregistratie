# PR27 — aanvullende eisen en uitvoerplan

Native ontwerpfeedback blijft aanvullend behouden in [NATIVE_DESIGN_BACKLOG](NATIVE_DESIGN_BACKLOG.md). Voorkeur/adres/accent is geen classificatie, routebewijs of sessiegrant; nieuwe privémedia blijven owner-private/lokaal. Functionele M27-eisen blijven ongewijzigd.

Actueel na Mac49/51: Xcode/licentie/lock afgehandeld; echte macOS-XCTest/iOSsemantiek/unsigned builds en beperkte simulatorstart PASS, geen fysieke of automatische ritacceptatie. Nieuwe gedeelde native sessiebinding en minimale server-scopebron als draft gebouwd; [gerichte Mac-testopdracht](NATIVE_VERIFIED_SESSION.md). Originele M27-eisen blijven behouden; oudere ontbrekende-toolchain/hoststatus is waar ingehaald historie.

> **Mac-resultaat:** [MAC_CLOUD_ACK_RESULT](MAC_CLOUD_ACK_RESULT.md) bewijst de retourproef via GitHub; directe tweewegthreadsturing niet beschikbaar. Mac-corecompile PASS, XCTest/iOS/hardware NIET GETEST. [Zero Trust](MAC_ZERO_TRUST_2026-10-19.md) is specifiek goedgekeurd/toegepast, backend blijft gesloten. Deze Cloudplanning met M27-ID's is leidend; [MAC27-controlekaart](PR27_EXECUTION_PLAN.md) is aanvullend, geen concurrerende nummering.

19 oktober 2026. Bron: [memo](../IMPORTANT_MEMO_IPHONE_RITDETECTIE.md), exact PR27-head4af50d3a1fa3408cb563a2924ce9aec2784c4290. Addendum op het bestaande register met123REQ-ID's/21scenario's; geen hernummering of stilzwijgende vervanging. Status “gepland/bronprototype” is geen geaccepteerde werkende functie.

| Addendum-ID | Eis / acceptatie | Bestaande aansluiting | Prioriteit / status |
|---|---|---|---|
| M27-01 | Directe samenwerking eerst bewijzen, opdracht/ontvangst/uitvoering onderscheiden | MAC_HARDWARE_TESTS/MAC-ACK-01 | P0 GitHub-retourproef MAC-CLOUD-20261019-PR27-ACK-01 PASS via PR30; directe threadtool ontbreekt |
| M27-02 | Twee grote CarPlayknoppen alleen met toepasselijke entitlement/templates; niet willekeurig autoopenen | Nativebronvoorbereiding, geen CarPlayapp | P1 Apple driving-taskcategorie onderzocht; goedkeuring/uitvoering OPEN |
| M27-03 | Native interactieve lokale melding Zakelijk/Privé, liefst zonderappopening; lockscreen/Focus/authbeperkingen | iOSsourcevoorbereiding PR25 | P0 meldingsbron/Core gecompileerd en apphost/simulatorvoorbereiding bewezen; delegate/echte meldingsacties/iPhone OPEN |
| M27-04 | Bluetooth/CarPlay/Shortcuts signalen herkennen binnen achtergrondbeperkingen | Rawingest/service+HTTP PR24 | P0 eerst bestaande Jeep gratis testen; signalen zijn geen vertrekbewijs |
| M27-05 | Betrouwbaar vertrek, gemistekeuze nietverliezen, later classificeren | Ritten review/classification/audit, raw observations | P0 reviewcoördinatie + expliciete API/webkeuze gebouwd/getest; duurzame nativequeue/consumer op Mac gebouwd/getest, voorbereidingshost/simulator PASS; nieuwe sessiebindingbron Mac-testen; hostintegratie/delegate/capture OPEN; nooit stilzakelijk |
| M27-06 | Werkelijk einde +nieuw vertrek na120sklantstop; geen splitsing stoplicht/file | Overlapregels/rawobservaties | P0 bewijsgestuurde eindstatus; geen generieke2minutentimer, echtetest OPEN |
| M27-07 | Elektrisch rijden: RPM0 isgeen einde | 4xeonderzoeksbron | P0 EVmotion/readybewijs en hybridewisselingtesten OPEN |
| M27-08 | GPS/tijden/adressen/betrouwbareteller/soort/audit; onbekendniet0; correcties en fiscalecontext | Route-read/correcties/historie/CSV/rapporten algebouwd | P0 hergebruiken; nativecapture/OBDteller/fiscaleacceptatie OPEN |
| M27-09 | OBDoptioneel:MX+/MC+, iPhone, directapptransport, data/slaap/veiligheid/prijs | JEEP_HARDWARE_RESEARCH | P1 onderzoekafgerondmetexplicieteonzekerheden; eigenJeep/transport NIET GETEST |
| M27-10 | DraadlozeCarPlay via juistwired-to-wirelessapparaat; geenBTdongle | FabrikantvergelijkingCarlinKit/Ottocast/TWO+ | P1 gratisbedradenulmeting; nietsbesteld |
| M27-11 | Vaste vader→moeder→derde prioriteit, gelijktijdig/laterinstappen, geenlastusedverwarring | TWO+defaultpriorityclaimapartvanbewijs | P0 hardeacceptatiewens; alle3/laterswitch NIET BEWEZEN; fallbackhandmatig/bedraad |
| M27-12 | Vaderhoofdgebruiker/voorkeursbestuurder, werkelijkechauffeurapart | users.driver_priority /trip.driver_id /onbekend | P1 exacteinterneaccountverificatieenrechtennodig; nietsgeradenofgeprovisioned |
| M27-13 | Centrale voertuigdedup bijmeerdereiPhones, offline/retry/overlap | Pereventidempotency/overlapaudit reedsgebouwd | P0 canonieke reviewcoördinatie/proposals/API/webreview gebouwd/getest; expliciete éénlogboektripoverzetting met overlapguard gebouwd/getest; automatische praktijk-/meeriPhoneacceptatie OPEN; geen volledige ritdedupclaim |
| M27-14 | Privacy/batterij/achtergrond/grensfouten zichtbaar | no-store/scopedbackend/pendingoptin/quota | P0 foreground/permission/retentie/energietesten OPEN; geenpermanentetrackstandaard |
| M27-15 | ConcreteMac-testtaken en centrale bewijsstatus; geen ongeteste claims | MAC_HARDWARE_TESTS | P0 MacACK/49/51 daadwerkelijk uitgevoerd; nieuwe sessiegroep heeft gerichte Mac-opdracht, fysiekehardware blijft apart |
| M27-16 | Geen aankopen/kosten/nieuwaccount/publicatie/securityuitschakeling/mainmerge | AGENTS/OWNER_ACTIONS | Doorlopend gehandhaafd;MacdoetAccess/ruleset,Cloudwijzigtnietparallel |

## Eerstvolgende veilige taakgroepen

1. Ontvangst/memo/onderzoek/eisenaddendum en Macopdracht opslaan op eigen draftbranch vanaf exacte PR26. PR27naar main niet mergen en PR1–26keten behouden.
2. Bestaande onafgemaakte devicequota/proposalbron eerst zelf reviewen/testen; eerdere subagentcreditfout niet als succesvolleoplevering tonen. Geen onnodige nieuwe agents of betaalde reruns.
3. Native meldingsactiebronprototype met expliciete toestemmingsvraag en lokale geverifieerde voertuig/actor/ritcontext; gemistekeuzehoudtreview, stale/doubleactionveilig. Zonder Appletoolchain compile/echtdevice NIETGETEST en concreteMacvalidatie.
4. Zuivere reviewvoorstellen uit boundedobservaties, geenautomatischgoedgekeurderit; expliciete start/eindankers en overlapwaarschuwingen, maxgap geen riteindtimer. Daarna centralepersistentevoertuigritclaim+review/audit, nativequeueenbackgroundsensoren gefaseerd.
5. GratisMacnulmeting eerst; pasna resultaten specifiekehardwarekeuze/akkoord. Geen OBDPID/CarPlayprioriteit of transportendpoint verzinnen om geblokkeerde hardwaretest te omzeilen.
6. Verdere coherente multiusersync/offlinePATCH/conflictwerk en andere OPEN_WORK blijven bestaan; PR27isnieuwehoogprioritairesturing, geen schrapping van oorspronkelijkeeisen.

## Gevraagde beslissingen en blokkades

Nu geen aankoop-/publicatievraag nodig: gratiswerk kan door. Aankoopadvies is reviewbaar maar niet uitgevoerd. Later eigenaarbesluit over één hardwarekandidaat/leverancier/budget indien nodig; Mac voert daadwerkelijke iOS/Jeepmetingen uit. Afzonderlijke GitHubidentiteit blijft open; gedeeldePRauteur isgeenonafhankelijkereview. `/scale`/`/do` nietondersteund in beschikbaretools; gewone taakgroepen gebruikt. DirecteMacautosturing nietbewezen; GitHubbewijsstatuswachten.

## Uitgevoerde lokale vervolggroep

Onderzoek/ontvangst in draftPR28 opgeslagen;10/10betrokkenbestanden exactremotegelezen. Root heeft na de agentcreditfout bestaande devicequotabron afgerond/gecontroleerd:14servicetestsPASS. Pureproposals7testsPASS; geenautomatischriteinde of volledigevoertuigdedup. Nativeinteractive-notificationbronprototype toegevoegd, zonderwerkendestore/provider/delegate enzonderSwiftcompilebewijs.197Node-tests/type/lint/build/lokaleD1PASS. Zie actueleRESUMEvoornieuweGitHubcheckpointenvolgendegroep; Mac-ACK/hardware blijven NIETUITGEVOERDtotexternbewijs.
