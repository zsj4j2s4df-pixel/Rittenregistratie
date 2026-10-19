# PR27 — aanvullende eisen en uitvoerplan

19 oktober 2026. Bron: [memo](../IMPORTANT_MEMO_IPHONE_RITDETECTIE.md), exact PR27-head4af50d3a1fa3408cb563a2924ce9aec2784c4290. Addendum op het bestaande register met123REQ-ID's/21scenario's; geen hernummering of stilzwijgende vervanging. Status “gepland/bronprototype” is geen geaccepteerde werkende functie.

| Addendum-ID | Eis / acceptatie | Bestaande aansluiting | Prioriteit / status |
|---|---|---|---|
| M27-01 | Directe samenwerking eerst bewijzen, opdracht/ontvangst/uitvoering onderscheiden | MAC_HARDWARE_TESTS/MAC-ACK-01 | P0 ontvangst Cloud bevestigd; directe threadtool ontbreekt, GitHubterugkoppeling wacht Mac |
| M27-02 | Twee grote CarPlayknoppen alleen met toepasselijke entitlement/templates; niet willekeurig autoopenen | Nativebronvoorbereiding, geen CarPlayapp | P1 Apple driving-taskcategorie onderzocht; goedkeuring/uitvoering OPEN |
| M27-03 | Native interactieve lokale melding Zakelijk/Privé, liefst zonderappopening; lockscreen/Focus/authbeperkingen | iOSsourcevoorbereiding PR25 | P0 bronprototype→Maccompile→echteiPhone; NIET GETEST |
| M27-04 | Bluetooth/CarPlay/Shortcuts signalen herkennen binnen achtergrondbeperkingen | Rawingest/service+HTTP PR24 | P0 eerst bestaande Jeep gratis testen; signalen zijn geen vertrekbewijs |
| M27-05 | Betrouwbaar vertrek, gemistekeuze nietverliezen, later classificeren | Ritten review/classification/audit, raw observations | P0 stateworkflow en duurzame nativequeue OPEN; defaultreview, nooit stilzakelijk |
| M27-06 | Werkelijk einde +nieuw vertrek na120sklantstop; geen splitsing stoplicht/file | Overlapregels/rawobservaties | P0 bewijsgestuurde eindstatus; geen generieke2minutentimer, echtetest OPEN |
| M27-07 | Elektrisch rijden: RPM0 isgeen einde | 4xeonderzoeksbron | P0 EVmotion/readybewijs en hybridewisselingtesten OPEN |
| M27-08 | GPS/tijden/adressen/betrouwbareteller/soort/audit; onbekendniet0; correcties en fiscalecontext | Route-read/correcties/historie/CSV/rapporten algebouwd | P0 hergebruiken; nativecapture/OBDteller/fiscaleacceptatie OPEN |
| M27-09 | OBDoptioneel:MX+/MC+, iPhone, directapptransport, data/slaap/veiligheid/prijs | JEEP_HARDWARE_RESEARCH | P1 onderzoekafgerondmetexplicieteonzekerheden; eigenJeep/transport NIET GETEST |
| M27-10 | DraadlozeCarPlay via juistwired-to-wirelessapparaat; geenBTdongle | FabrikantvergelijkingCarlinKit/Ottocast/TWO+ | P1 gratisbedradenulmeting; nietsbesteld |
| M27-11 | Vaste vader→moeder→derde prioriteit, gelijktijdig/laterinstappen, geenlastusedverwarring | TWO+defaultpriorityclaimapartvanbewijs | P0 hardeacceptatiewens; alle3/laterswitch NIET BEWEZEN; fallbackhandmatig/bedraad |
| M27-12 | Vaderhoofdgebruiker/voorkeursbestuurder, werkelijkechauffeurapart | users.driver_priority /trip.driver_id /onbekend | P1 exacteinterneaccountverificatieenrechtennodig; nietsgeradenofgeprovisioned |
| M27-13 | Centrale voertuigdedup bijmeerdereiPhones, offline/retry/overlap | Pereventidempotency/overlapaudit reedsgebouwd | P0 voertuigritcoördinatie/detectievoorstellen OPEN; pereventdedupisgeenvolledigeritdedup |
| M27-14 | Privacy/batterij/achtergrond/grensfouten zichtbaar | no-store/scopedbackend/pendingoptin/quota | P0 foreground/permission/retentie/energietesten OPEN; geenpermanentetrackstandaard |
| M27-15 | ConcreteMac-testtaken en centrale bewijsstatus; geen ongeteste claims | MAC_HARDWARE_TESTS | P0 gratisACKgereedomeventueeloptepikken, hardwarepasbijbeschikbaarheid/toestemming |
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
