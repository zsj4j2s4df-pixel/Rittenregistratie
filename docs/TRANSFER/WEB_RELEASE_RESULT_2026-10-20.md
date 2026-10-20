# Goedgekeurde webrelease — 20 oktober 2026

## Toestemming en afbakening

Eigenaar gaf in realtime expliciet toestemming voor de beschreven nieuwe webversie én databasewijzigingen: “die toestemming heb je”, daarna “Voer dat allemaal maar uit” en zoveel mogelijk voorbereiden voor Codex Mac. Uitgevoerd uitsluitend bestaande RitKompas-Worker/D1. Geen mainmerge, forcepush, kosten, externe accounts, gebruikersprovisioning of nieuwe gevoelige koppeling. Nieuwe iPhone-app/signing/CarPlay entitlement niet gepubliceerd. Bestaande Access en vier runtimebindings behouden. Dit document vervangt oudere ontbrekende-toestemmingsregels voor alleen dit concrete pakket; geen algemene toestemming voor toekomstige productiefeatures.

## Gepubliceerd en teruggelezen

- Broncode: PR45 codehead82330265b9aedc2a24533503c23de1d86546768c; documentcheckpoint adcc6d373a1df3a0124ba680c5faed6f0564dcce. Vooraf PR43/44/45 changedblobs20/10/10 exact remote gecontroleerd, laatste documentcheckpoint4files exact.
- URL: https://rittenregistratie.zsj4j2s4df.workers.dev . Root opent nu centrale registratie; demonstratie expliciet /demo. Nieuwe validatie toont ontbrekende verplichte velden. Geen bewezen oorzaakclaim voor eerdere iPhone-opslagmelding.
- Exact geteste payload SHA2569c54fb91645dbc221490390798684a4a4237a51a830f82b8f0b4ec6e1a05bd76,48modules/23embeddedpubliekeassets. SHA opnieuw in uploadruntime berekend en gematcht. Eerste uploadpoging stopte vóór PUT op te strenge modulefilenaamguard (~ ontbreekt in toegestane tekens); alleen uploadguard gecorrigeerd, payload ongewijzigd.
- PUT200, deployment9c7c3f88-fd26-44aa-b1ca-3375aa21d122, versieba2a2a9d-3a2a-4347-b146-b577d0e33989 op100%, aangemaakt2026-10-20T04:26:32.446535Z. Teruggelezen04:26:50UTC.
- Vier bindings via strict inherit behouden en achteraf canoniek bytegelijk geverifieerd; DB, APP_ORIGIN, ACCESS_ISSUER, ACCESS_AUDIENCE. Compatibilitydate2026-05-22/nodejs_compat en logpushfalse behouden. Geen andere Worker of Access-policy gewijzigd.
- Bestaande D1-migratietabel0000–0007 vooraf bevestigd. Goedgekeurde delta0008–0015 in volgorde toegepast, elke APIcall200 en elke SQLstatement success; migrationledger toont nu precies0000–0015. Bestaande gebruikerstabellen zijn niet opnieuw ingevuld. SQLhashes staan in CAR_TEST_RELEASE_GATE.md.0015 blokkeert gewone auditUPDATE/DELETE, geen beheerder-/cryptografische onvervalsbaarheidclaim.
- D1 PRAGMA quick_check=ok en foreign_key_check0violations na migratie PASS. Hashvergelijking alle10 bestaande gegevenstabellen met privéherstelkopie: onveranderd vóór codepublicatie. Migratietabel is bewust uitgebreid; geen nieuwe lege-databaseclaim.
- Anoniem /,/beheer,/api/vehicles302 naar bestaande CloudflareAccess-teamhost PASS na release met browserUserAgent; geen gate versoepeld.

## Herstelkopie en beperkingen

Actuele D1bookmark vóór wijziging privé vastgelegd. Fabrikantdocument https://developers.cloudflare.com/d1/reference/time-travel/ werkelijk opgehaald: TimeTravel altijdaan, Free7dagen, restore destructief/inplace; geen retentie langer dan plan beloven. Geen live databaserestore uitgevoerd.

D1 SQLexportAPI200, maar downloadhost werd expliciet geweigerd door toolnetwerkbeleid. Geen omzeiling of nieuwe netwerk-/accountinstelling. Alternatief: toegestane bestaande D1queryAPI leest alleen schema en quote-gecodeerde rijen; bookmark vóór/na snapshot gelijk gecontroleerd. Gegevens binnen toolruntime versleuteld AES256GCM met willekeurige sleutel, sleutel RSAOAEP-SHA256 naar lokaal gegenereerde publickey gewrapt. Privatekey verlaat private Cloudmap niet. Ciphertext/keys/echte SQL/rijen/bookmarkwaarden niet in GitHub of rapport gelogd.

Privémap `/workspace/ritkompas-private-release`0700, encryptedbackup en privatekey0600. SQLplaintextdigest9b1cddffc1990aabe1ba9e59dac91e456dbedcaf97d7369ba5f6ed41ec633dc7. Authenticated decrypt/hash, lokaal SQLherstel, alle oorspronkelijke tabelrijtellingen/FK/integrity PASS. Die echte kopie lokaal door0008–0015 geüpgraded: alle oorspronkelijke rijen exact behouden. Vorige gepubliceerde bron PR34: synthetische trip/settingsread/write/audit op nieuw schema PASS voor beperkte code-only rollbackcompatibiliteit. Geen garantie voor alle toekomstige workloads. Tijdelijke plaintextcontrolebestanden worden na bewijs verwijderd; encryptedbackup/key blijven alleen privé. Dit is geen offsitebackup of garantie tegen verlies van de Cloudomgeving.

## Uitvoeringsincident — expliciet vastgelegd

Een extra bookmark/deploymentvoorcontrole retourneerde MCPisError met “Concurrent change; do not migrate”. Het orchestration-script behandelde die toolfout ten onrechte niet als stop en ging door met de acht al geautoriseerde additieve migraties. Dit had moeten stoppen. Geen oorzaak van bookmarkafwijking bewezen. Direct daarna, vóór codepublicatie, live deployment opnieuw bevestigd onveranderd; alle10 bestaande gegevenstabellen tegen snapshot gehasht en ongewijzigd bevonden; ledger/FK/quickcheck PASS. Verdere mutationstappen expliciet op MCPisError/resultsuccess laten stoppen; upload bevatte opnieuw deployment- en bindingsvergelijking. Geen securityguard uitgeschakeld, geen data-rollback of verhulling. Gewone gegevensintegriteit hiermee gecontroleerd; dit maakt de foutieve stopafhandeling niet juist. Niet herhalen met een batch die een voorafgaande toolfout alleen afdrukt.

## Tests en werkelijke grens

249/249 Node-tests, typecheck, volledige lint en productiebuild PASS op deze webbron. Na toestemming gebouwde embedded Worker/framework/lokale workerdD1 opnieuw PASS voor JWT-header/cookie, create/read/exactretry, settings/correctiereceipts, expliciete review, gecontroleerde ééntripoverzetting en account/revocationweigering. Synthetische JWKS in lokale test is geen echte Access-login.

NIET GETEST na deze release: eigenaar-ingelogde live APIwrite/reload/exactretry, Safari/iPhone-export/Maps, echte logout/revocation, nativebuild/XCTest/iOS/achtergrond, Jeep/CarPlay/OBD2 en drie echte gebruikers. Geen eigenaarbrowser of aanmeldcredential beschikbaar in Cloud; geen token vragen/kopiëren of fakeuser maken. Eigenaar kan nu stilstaand een bedoelde rit/instelling opslaan, herladen en controleren; gebruik synthetische gegevens indien afgesproken en deel geen privérit/adressen. Bij fout alleen veld/handeling en algemene melding doorgeven. Geen bestaande gegevens verwijderen om testomgeving leeg te maken.

## Code-only terugval bij bewezen releasefalen

Vóór rollback actuele deployment controleren om later werk niet te overschrijven. Alleen code terug naar vorige versie8e264bd0-62ab-48d2-a88e-9bf19d491858 met behoud van schema/bindings/Access/gegevens; geen automatische databaseschema-downgrade of TimeTravelrestore. Dit herstel is voorbereid bij het goedgekeurde releasepakket, niet uitgevoerd. Bij dataverliesverdenking eerst stoppen en eigenaar informeren; destructief D1restore vraagt expliciete afgebakende beslissing. Geen rollback alleen omdat Cloud geen eigenaarbrowser heeft.

Vervolg: MAC_NEXT_RUN.md met kopieerbare opdracht; native/hardware zijn nog niet gebouwd/getest als werkend systeem. Andere123REQ/M27 blijven behouden.
