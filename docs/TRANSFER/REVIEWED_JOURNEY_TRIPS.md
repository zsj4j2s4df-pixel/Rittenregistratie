# Gecontroleerd ritbewijs → één logboekrit

CLOUD-011, vervolg op PR39. Schema0012 is uitsluitend draftbron/lokaal getest. Geen live migratie, codepublicatie of provisioning. De bestaande live PR34-versie is niet aangepast.

## Gedrag

POST /api/vehicles/:vehicle/journeys/:journey/materialize vereist echte geverifieerde account/actief voertuigrecht, CSRF/Origin/16KiB en expected-viewercontrole. Alleen een gesloten reviewjourney met exact verwachte revisie en expliciete reviewed:true kan worden overgezet. Afstand, adressen, bestuurder en tellerstanden mogen expliciet onbekend blijven; nul is alleen een werkelijk ingevulde tellerstand. Bekende afstand ondersteunt veilige duizendsten. Een opgegeven bestuurder moet opnieuw actief toegang hebben, ook in de SQL-writegate.

De nieuwe journey_materializations-tabel legt één onveranderlijke koppeling per journey en pertrip vast, met aparte unieke account/voertuig/requestreceipt. In één transactie: journeyrevisionclaim, tripinsert, koppeling/receipt, tripaudit en journeyreviewaudit. Een auditfout rolt alles terug. Exacte retry geeft oorspronkelijke receipt; een tweede gebruiker/anderecode kan geen tweede trip maken. Bestaande of gelijktijdig nieuw ingevoegde overlappende logboekrit blokkeert overzetten; geen onzichtbare samenvoeging. Ook twee overlappende gesloten proposals van verschillende gebruikers hebben maar één winnaar. Niet-overlappende nieuwe bewegingen blijven mogelijk.

Na overzetten is de bronjourney vergrendeld en de mapping niet wijzig-/verwijderbaar. Trip-ID/voertuig/aanmaker van de gekoppelde trip zijn beschermd. Verdere correcties horen op dezelfde logboektrip via bestaande correction/audit. Oude exacte choice/coördinatiereceipts blijven historische bevestigingen; nieuwe classificaties op de vergrendelde bron worden geweigerd.

Een aangemaakte logboektrip blijft provisional/needs_review: geen fysieke attestatie, automatische bestuurder, berekende GPS-route, geschatte tellerstand of fiscale goedkeuring. Afstand is null of expliciet handmatig; route_type blijft estimated en afstandsherkomst bevat bronjourney/revisie. Ruwe bronwaarnemingen/bewijs blijven behouden. Dit levert één centrale logboekregistratie uit expliciete review; geen bewezen volautomatische voertuigherkenning of volledige deduplicatie van alle mogelijke handmatige/incomplete tijdclaims.

## Webflow

Een geopend gesloten ritbewijs toont de overzetfunctie. Alleen bekende gegevens invullen, reden en controlebevestiging verplicht. Een onbekende bestuurder blijft standaard onbekend; ritsoort volgt bestaande expliciete keuze of tecontroleren. Invoer wordt niet automatisch verstuurd. Bij verloren antwoord blijft exact de oorspronkelijke aanvraag in het tabblad voor handmatige retry; andere bronacties zijn zolang geblokkeerd. Bevestiging moet journey/viewer/request/revisie matchen. Herladen/account-/voertuigwissel kan dit geheugenherstel verliezen; de centrale unieke koppeling blijft bestaan. Na bevestiging worden bron en logboek opnieuw gelezen. Een latere readfout herstelt geen al bevestigde mutation. Bij conflict eerst centraal opnieuw bekijken; bij401/403/404 verdwijnen brongegevens.

## Bewijs

233Node-tests/typecheck/volledige lint/webbuild PASS. Acht nieuwe SQL/HTTP-regressiegroepen: éénmapping/exactretry/unknowns/zero, gelijktijdigezelfdejourney/tweeaccounts, overlap/prebatchrace, rollbackaudit, actor/driverrevocation, open/stale/onbevestigd/invalid/expired/foreign, bron-/mapping-/tripscopevergrendeling, tweeverschillendeoverlappendejourneys.

Lokale workerd/D1: echte ingest start/end→journeyclose→choice→materialize/replay/linkedget/unknowns PASS. Volledig gebouwde embedded Worker/framework/cookie/JWKS/HTTP/D1: materialize/replay/linkedGET/zero/unknown PASS. Chromium: echte ingest/close, verplichteveldengeenwrite, expliciete review, servercommit+verlorenantwoord→zelfde retry→ééntrip/mapping/audit, onbekendevelden/0 en reloadvergrendeling PASS. Synthetische identiteit/data. Nieuwe migratie alleen lokaal op testdatabases toegepast.

NIET GETEST: live schemamigratie/nieuwe features, echte iPhone-savefout, native achtergronddetectie, Jeep/CarPlay/OBD2 en onafhankelijke security/fiscale acceptatie. Deze bron bevat geen productieopdracht.

## Volgende software

Expliciete afronding van logboekreview, native host/authprovider/queueconsumer/capture, duurzame overige writes, kaart-/GPSopname en resterende werkkaart blijven open. Bestaande Apple/hardware-/account-/publicatiegrenzen blijven gelden. REQ024/027/M27-13 heeft nu dit gedeeltelijke concrete codebewijs; nog geen volledige automatische rijpraktijkacceptatie.
