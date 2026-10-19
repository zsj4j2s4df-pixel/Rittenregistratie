# Expliciete afronding van logboekcontrole

CLOUD-005/CLOUD-002, vervolg op PR41-checkpoint28dc75e8c8060ea1829633321188e32be3a05358. Schema0013 alleen draft/lokaal. Geen livepublicatie/migratie/provisioning.

## Controle en betekenis

POST /api/vehicles/:vehicle/trips/:trip/review verlangt echte geverifieerde sessie/voertuigrecht, CSRF/Origin/JSON16KiB, passende viewerheader, expectedRevision, confirmed:true en reden. De opgeslagen rit moet bekende geldige tijden, adressen, positieve veiligberekenbare afstand, expliciete privé/zakelijkkeuze en actieve bestuurder hebben. Onbekende verplichte kerngegevens worden niet ingevuld of stil goedgekeurd. Optionele ontbrekende tellerstanden/ritdoelen/tarieven blijven ontbreken en blijven waarschuwingen in rapporten.

Final/needs_review0 betekent uitsluitend handmatig gecontroleerde logboekgegevens. Geen fiscale goedkeuring, fysieke chauffeursattestatie of GPSwaarheid. Audit noteert physicalVerification:false en fiscalApproval:false. De bestaande PR41-guard zet iedere latere inhoudelijke correctie weer naar provisional/needs_review1. Oude rapporten blijven vast.

## Betrouwbare verwerking

Eén D1-transactie wijzigt status/flag/revisie, slaat een onveranderlijke scoped reviewreceipt op en schrijft audit met voor/na/reden. Actor- en bestuurderslidmaatschap worden in de UPDATE opnieuw getoetst. Unieke trip/reviewrevision en actor/vehicle/request beschermen gelijktijdigheid. Auditfailure rolt alles terug. Receiptgroei is SQLbegrensd tot1000pertrip en10000peruser/vehicle; geen stille verwijdering.

Exacte retry geeft hetzelfde historische bewijs. Een oude receipt kan een latere correctie niet opnieuw goedkeuren: replay doet geen UPDATE, de actuele rit blijft opnieuwtecontroleren. Gewijzigde body met dezelfde code, verouderde revisie of een nieuwe dubbele review geeft409. Revoked replay wordt geweigerd. Receiptupdate/delete en onjuiste trip/voertuig/revisiecombinaties worden door DBguards geweigerd.

## Webflow

Bij de correctie/historie van een onvoltooide logboekrit kan de gebruiker reden en expliciete controlebevestiging invullen. Bij onzeker antwoord blijft exact dezelfde aanvraag alleen in dit tabblad voor handmatige retry; correcties blijven zolang geblokkeerd. Geen automatische resend. Herladen/account-/voertuigwissel kan dit geheugenherstel verliezen, serverreceipt blijft bestaan. De response moet trip/viewer/request/revisie/status exact matchen. Na bevestiging wordt de actuele snapshot gelezen; een late readfout maakt een bevestigde mutatie niet opnieuw pending. Een actuele gecontroleerde rit toont geen nieuwe reviewknop. Na een correctie verschijnt de nieuwe controleflow weer.

## Bewijs en grenzen

240Node-tests/typecheck/volledige lint/build/lokaleworkerdD1 PASS. Vijf nieuwe SQL/HTTP-regressiegroepen: expliciete review/exactretry/audit, oude receipt na nieuwe correctie zonder hergoedkeuring, gelijktijdige reviewers, missingcritical/expired/foreign/unconfirmed, auditrollback en actor/driverrevocation, HTTPactor/CSRF/no-store/revokedreplay. Gebouwde embedded Worker/framework/echtecookie/JWKS/HTTP/D1 review/retry PASS. Chromium: verplichteveldengeenwrite, expliciete bevestiging, servercommit+verlorenantwoord→exactretry→éénreceipt/audit, correcties geblokkeerd bij onzekerheid, gecontroleerde status→nieuwecorrectie→opnieuwcontroleren PASS.

Echte iPhone/Safari-opslagmelding, nativecapture/achtergrond, drie echte accounts/telefoons, Jeep/CarPlay/OBD2, onafhankelijke security/fiscaleacceptatie en live schemarelease NIET GETEST. Het live platform blijft PR34. Verdere veilige bronontwikkeling staat in OPEN_WORK; niet het hele project als af markeren.
