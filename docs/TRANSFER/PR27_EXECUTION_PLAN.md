# PR #27 — uitvoerbare overdracht

> **Integratie-update:** Cloud heeft ontvangst bewezen in PR #28 en vervolgcode in #29 opgeslagen. [PR27_PLAN.md](PR27_PLAN.md) is de centrale Cloudplanning met M27-ID's; onderstaande MAC27-ID's zijn uitsluitend de aanvullende Mac-controlekaart en hernummeren die Cloud-eisen niet. De onderzochte Mac-/Cloudtakken zijn in deze reviewbranch samengebracht, zonder main-merge. MAC-ACK-01 is uitgevoerd: [MAC_CLOUD_ACK_RESULT](MAC_CLOUD_ACK_RESULT.md).

19 oktober 2026. [PR #27](https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/27) volledig gelezen: beschrijving, alle drie commits via de resulterende diff, volledig memo van 56 regels en discussie (geen comments tijdens controle). Head `4af50d3a1fa3408cb563a2924ce9aec2784c4290`. Het memo is op deze ontwikkeltak inhoudelijk exact overgenomen; PR #27 blijft open en wordt niet gemerged of geretarget.

Ontwikkelbasis is de bestaande gestapelde PR-keten tot en met #26: `cloud/cloud-005-detection-quotas`, commit `ec44dc8ddda1361a61f9f0c8bdceebe4e20e8a01`. Main staat nog op `d37d8c913aaa253d6297cf57d3379d40c5795573`. Begin niet opnieuw bij de document-only main of bij het losse memo; dat zou gebouwd werk missen.

De 123 bestaande REQ-ID's en 21 T-scenario's blijven behouden. De aanvullende MAC27-ID's hieronder koppelen de memo-details zonder historische eisen te hernummeren. Voertuig/modeljaar 2021 is door eigenaar als projectcontext opgegeven; precieze Uconnect-/markt-/hardwarecompatibiliteit vraagt bewijs.

| Memo-eis | Volgende samenhangende taak / eigenaar | Acceptatie en grens |
|---|---|---|
| MAC27-01 Automatische registratie | Cloud: vertrek-/eindebewijs en voorlopige detectie boven bestaande raw-ingest | GPS/beweging/verbinding combineren; ruwe observatie is geen definitieve rit |
| MAC27-02 Melding Zakelijk/Privé | Cloud: native UNNotificationCategory/Action-module en tests; Mac: integratie/iPhone | Actie verwerken waar iOS toestaat; lockscreen, Focus en geweigerde toestemming testen |
| MAC27-03 Geen verplichte appopening | Cloud: meldingsafhandeling met sessie-/retrycontract | Gemiste melding verliest geen rit; later classificeren; onzeker nooit automatisch zakelijk |
| MAC27-04 Automatische start | Cloud: state-machine en controleerbare herkomst | Verbinding alleen is kandidaat; echte vertrekdetectie en GPS-terugval |
| MAC27-05 Betrouwbaar einde | Cloud + Mac: eindecriteria en fixtures/hardware | Verbroken Bluetooth alleen sluit niet af; stoplicht/file is geen riteinde |
| MAC27-06 Twee minuten bij klant | Cloud: expliciete einde-/herstartscenario's | Na bewezen einde is volgend vertrek nieuwe rit, ook na twee minuten; tijd alleen bewijst einde niet |
| MAC27-07 Elektrisch rijden | Cloud + Mac: 4xe READY/EV-scenario | Nul benzinemotor-RPM beëindigt geen actieve EV-rit |
| MAC27-08 CarPlay-knoppen | Cloud: officiële categorie/entitlement/templateroute onderzoeken | Geen willekeurige CarPlay-UI of automatisch openen beloven; iPhone-fallback behouden |
| MAC27-09 Jeep-signalen | Cloud: Bluetooth/bedraad-CarPlay/Shortcuts/locatieonderzoek | Per signaal achtergrondmogelijkheden, toestemming, privacy en batterij vastleggen |
| MAC27-10 OBD2 optioneel | Cloud: adaptercontract, MX+/MC+-onderzoek; Mac: read-only proef | Exacte iOS-techniek, firmware en kilometertellerondersteuning bewijzen; geen SGW-bypass of ECU-writes |
| MAC27-11 Draadloos CarPlay | Cloud: Carlinkit/Ottocast vergelijken; Mac: huidige bedrade Uconnect controleren | Bluetooth én wifi; gewone Bluetooth-dongle is onvoldoende |
| MAC27-12 Vaste telefoonprioriteit | Cloud: fabrikantbewijs; Mac: drie-telefoontest | Dennis/vader → Ingrid/moeder → Jesse. Ook tegelijk instappen, reconnect en vader later; last-used is onvoldoende |
| MAC27-13 Voorkeursbestuurder | Cloud: Dennis als configureerbare voorkeurskandidaat | CarPlay-voorrang en werkelijke bestuurder scheiden; onzeker blijft onbekend |
| MAC27-14 Geen dubbele ritten | Cloud: centrale voertuiggebonden deduplicatie en audit | Drie telefoons/same-event/retry/conflict; één definitieve rit, geen stille samenvoeging |
| MAC27-15 Volledige gegevens/correcties | Cloud: bestaande opslag/rapporten hergebruiken | GPS/tijd/adressen/bron/teller waar beschikbaar/ritsoort/audit; geen ontbrekende waarden verzinnen |
| MAC27-16 Koopadvies | Cloud/Mac: actueel prijs-/compatibiliteitsbewijs | Korte kooplijst met onzekerheden, geen bestelling; zie HARDWARE_ADVICE_2026-10-19.md |
| MAC27-17 Samenwerking bewijs | Cloud en Mac | Transport, agentontvangst en terugkoppeling afzonderlijk bewijzen; zie MAC_CLOUD_CHANNEL_TEST.md |
| MAC27-18 Echte acceptatierit | Mac + eigenaar zodra build/hardware gereed | Jeepverbinding → melding → actie → juiste opslag → bewezen einde → nieuwe rit; met privacy/batterij/uitvaltests |

## Ontwikkelcyclus en taakvolgorde

Cloud coördineert: plannen → bestaande code gericht aanvullen → tests → securitycontrole → verbeteren → commit/PR → CLOUD_TASKS, DEVELOPMENT_PROGRESS en RESUME actualiseren → volgende veilige taakgroep. Zelfcontrole niet als onafhankelijke review presenteren. Gebruik het lichtste geschikte beschikbare model; Sol voorkeur, Astra alleen belangrijke besluiten. Geen onbewezen automatische modelrouting.

1. Lees nieuwste checkpoint en bestaande device-/detection-code; neem dit memo over zonder nieuwe full audit.
2. Native meldingsmodule en zuivere ritbewijs-/state-machine voorbereiden, inclusief uitval, korte stops en gemiste keuze. Verbind nog geen echte sensoren zonder gecontroleerde native integratie.
3. Centrale voorstel-/deduplicatieflow en begrensde app-instancegroei, met autorisatie/idempotentie/audit boven bestaande services; geen tweede backend.
4. Native login, duurzame wachtrij en geverifieerde opname integreren; Mac valideert build en echte toestellen.
5. Hardware-/CarPlayacceptatie en actueel koopadvies; pas daarna installatie-/aankoopbesluiten aan eigenaar.

Geen automatische main-merge, publicatie, aankoop, betaalde activering, nieuwe gevoelige koppeling of securityuitschakeling. De open eigenaarreviewidentiteit en live backendbindings zijn afzonderlijke afhankelijkheden en blokkeren niet alle lokale code/testtaken.

## Concrete Mac-testopdrachten

MAC-027-01: bouw bestaande Swift-core; voer beschikbare contracttests uit; onderscheid macOS van iOS-simulator. Uitkomst van deze Mac-run: MAC_NATIVE_VALIDATION.md.

MAC-027-02 zodra installeerbare build aanwezig is: op iPhone 11 Pro en nieuwere doeltoestellen meldingsacties testen bij open/vergrendeld scherm, Focus, toestemming ingetrokken, app naar achtergrond en herstart. Geen serie-/accountgegevens in GitHub.

MAC-027-03 zodra in Jeep getest kan worden: dezelfde route laten detecteren door drie telefoons; bestuurder expliciet bevestigen; stoplicht/file/2min-klantstop/EV/verbindingverlies testen. Deel alleen geanonimiseerde resultaten, geen ruwe routegeschiedenis in publieke repository.

MAC-027-04 vóór adapterkeuze: huidige bedrade CarPlay via data-USB bewijzen; bij demo-/leentoestel vaste rangorde en vader-later testen. OBD uitsluitend lezen: ondersteunde PIDs, READY/EV, herverbinden, nachtelijke slaap en voertuig-wake; geen beveiligingsgateway omzeilen.
