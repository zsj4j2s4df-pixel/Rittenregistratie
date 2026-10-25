# Rechtstreekse RitKompas-aanmelding — 24 oktober 2026

## Uitgevoerd met concreet eigenaarakkoord
Eigenaar bevestigde afzonderlijk het verwijderen van uitsluitend de extra
Cloudflare-inlog vóór RitKompas, met persoonlijke Supabase-appauth als toegang.
Geen algemene Cloudflare-securityuitschakeling, geen AllowEveryone-policy.

Vooraf actuele app/policy/bestemming en zeven bindings + live versie gecontroleerd.
Volledige oude appconfig privé bewaard in lokale
work/supabase-pilot-private-20261024/access-before-removal.json (0600, map0700).
Alleen Access-app4fa445ac-ed67-487b-8ecb-a60d49bec944 verwijderd via officiële API;
exact één workerbestemming1026df227e1c461eb762830407dd0732. API202success, ID gelijk.
Readback Access-app afwezig. Geen policy/IdP/dashboard/accountwijziging uitgevoerd.
Andere Access-apps waren niet aanwezig; vergelijkende readback gelijk.
De bestaande herbruikbare accountmembers-policy niet apart verwijderd.

## Actuele live situatie
- URL https://rittenregistratie.zsj4j2s4df.workers.dev/login .
- Worker da1419ca-5b85-4e52-a02f-34d4ab675971 blijft100%;
  deployment6b5c31bd-02f5-4504-8d05-96638b7d4fba blijft gelijk.
- Alle7bindings exact gelijk teruggelezen, AUTH_PROVIDER=supabase.
- Geen appcode gepubliceerd, geen DB/migratie/account/ritmutatie in deze groep.
- Bestaande Accessissuer/audience blijven alleen als ongebruikte legacybindings;
  Supabase-appauth heeft geen Access/headerfallback.
- Login en publieke UI-shells rechtstreeks bereikbaar; ritdata blijft server-
  geverifieerde Supabasecookie+browserbinding+actieve interne mapping/rechten eisen.
- Dashboard/overige Cloudflare-diensten zijn niet aangepast of getest als gebruiker;
  niet beweren dat deze productbeveiliging volledig opnieuw geaudit is.

## Werkelijk van buitenaf getest zonder cookies — PASS
- GET /login200, geen Accessredirect; geen bestaande interne identiteit in HTML.
- GET /api/auth/status200: uitsluitend provider supabase/authenticatedfalse,
  no-store en geen viewer/expiry.
- GET /api/vehicles en vijf private voertuigsubroutes (session/settings/trips/
  devices/journeys):401, no-store, uitsluitend foutmelding.
- Vervalste cf-access-jwt-assertion, oude CFcookie en bearer geven geen toegang401.
- Foreign-origin POST auth/logout403, geen echte gebruikerssessie gebruikt.
- GET /ritten en /beheer200: publieke UI-shell zonder bestaande interne identiteit.
Deze checks doen geen loginpogingen met wachtwoorden en veranderen geen ritten.
De aanvullende gebouwde lokale Workerproef met synthetische provider blijft PASS,
incl. mapping/rechtenintrekking/accountisolatie/CSRF/refresh/logout-replay.
Niet presenteren als volledige onafhankelijke audit of fysieke nativeacceptatie.

## Eigenaartest en vervolg
Jesse's webaanmelding vóór deze poortvervanging is door eigenaar bevestigd.
Na deze wijziging opnieuw laden of Safari privévenster gebruiken: alleen de
RitKompas-aanmelding hoort te verschijnen. Eigenaar meldt zelf met zijn persoonlijke
account aan; wachtwoord nooit vragen/lezen of namens hem wijzigen.
Nieuwe password-resetmail moet nu rechtstreeks naar /login kunnen terugkeren,
zonder de eerdere buitenpoort die het herstelproces onderbrak.
Postverwijdering echte eigenaarlogin/reset/remember/logout nog NIET GETEST.
De vier Supabasecookies in nativebron hoeven nu niet langer door een tweede
Accesspoort; dit verwijdert de bekende configuratieblokkade, geen nativepass.
Nog geen iPhone bereikbaar op Mac; ondertekende updates/3persoonacceptatie OPEN.
Dennis/Ingrid provisioning blijft afzonderlijke volgende taak met private
adressen, verse DBbackup en audit, geen gedeeld Cloudflarebeheeraccount nodig.

## Herstelbaarheid
De verwijderde app heeft geen éénklik-undo; configuratie/bestemming/policyreferentie
zijn privé vastgelegd zodat de begrensde buitenpoort via officiële Accessworkflow
kan worden heraangemaakt. Nieuw app-ID/audience kan bij heraanmaak veranderen:
nooit ongetest oude identifiers als werkend beschouwen. Geen DBrestore/downgrade
of automatische Accessidentiteitsfallback nodig. Bij beveiligingsfout eerst
bereikbaarheid opnieuw beschermen met de opgeslagen smalle configuratie.
