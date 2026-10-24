# Jesse webacceptatie en Access-vervanging — 24 oktober 2026

## Bevestigde voortgang
Eigenaar meldt expliciet: “Inloggen is allemaal gelukt webapp ziet er goed uit”.
Daarmee is de persoonlijke webaanmelding op Jesse's iPhone door de eigenaar
bevestigd. De voorafgaande Safari-screenshot toont /login na eigen Cloudflarelogin.
De stappen via nieuwe herstelmail/wachtwoordkeuze zijn begeleid; niet als
afzonderlijk door de agent geobserveerde passwordsubmit/refresh/logout claimen.
Read-only Authcontrole bevestigt email bevestigd en provider-signin aanwezig.
Geen wachtwoord, hash, sessietoken of persoonlijk mailadres naar GitHub.

Website blijft da1419ca/6b5c31bd/100%, Supabase actief, bestaande Accesspoort behouden.
Deze taakgroep heeft GEEN livepublicatie, gatewijziging of DBmutatie uitgevoerd.

## Aanvullende gebouwde Worker-securityproef PASS
tests/supabase-built-worker-smoke.mjs uitgebreid en werkelijk uitgevoerd op
bestaande release-entry/framework/workerd/lokale D1, zonder Access-proxy ervoor.
Providerantwoorden en alle accounts/data zijn synthetisch; geen liveproviderbewijs.

- Zes private APIroutes weigeren anoniem401 en zijn no-store.
- Anonieme status geeft geen viewer/expiry.
- Ontbrekende of inactieve interne identitymapping geeft geen loginrechten.
- Geldige JWT zonder browserbinding geeft geen toegang.
- Ander voertuig403, verkeerde interneviewer409.
- Ingetrokken voertuigmembership403, disabledaccount401.
- Foreign-origin logout403; geen CSRF-afzwakking.
- Onthouden-uit levert sessiecookies; onthouden-aan begrensde Secure/HttpOnlycookies.
- Native minimale scope, save/exactretry, refresh, logout en replayweigering PASS.
- Oude external_auth_id onveranderd.
Dit is meer bewijs voor de apppoort, geen automatisch toestemmingbewijs om
externe beveiliging te verwijderen en geen driepersoonacceptatie.

## Eigenaarwens: extra Cloudflare-inlog straks weg
Doel is uitsluitend de buitenste Cloudflare Access-poort van deze RitKompas-site
vervangen door bewezen Supabase-appauth. Cloudflare-dashboard, andere Workers,
accountbeveiliging en organisatiebeleid blijven beschermd/ongewijzigd.
Niet alle Cloudflare-beveiliging verwijderen; geen AllowEveryone-eindoplossing.
Site-/login-/statische UI mag daarna publiek renderen, maar private APIs moeten
zonder geldige appcookie+binding+actieve interne rechten401/403blijven.

Bij feitelijke gatewijziging concreet akkoord op deze bereikbaarheidswijziging
vragen; “straks” is geen huidige opdracht om ongetest te verwijderen.
Vooraf exacte app/policy/destination-config privé bewaren en actuele Worker7bindings
Supabase/DB/origin verifiëren. Pas wijziging bij juiste resource toe; geen delete
op basis van naam alleen. Bij fout herstellen; nooit ad-hoc authbypass.
Direct na wijziging van buitenaf GET /login200, status supabasefalse en private
API401/no-store controleren, vervalste Accessheaders geven geen apprecht.
Eigenaar controleert bestaande persoonlijke login en nieuwe recovery in Safari.
Bij fout eerst de oude buitenpoort terugzetten; geen ritrestore of0017downgrade.

## Native en overige personen
Native bron gebruikt uitsluitend vier appcookies na Supabase-login; zolang de
buitenste Accesspoort bestaat draagt die native APItransport geen buiten-cookie
mee en kan de native scopeprobe dus302 krijgen. Niet doen alsof actuele
nativebron al achter deze dubbele poort fysiek is geaccepteerd. Gecontroleerde
poortvervanging is de beoogde vervolgstap, geen CF-cookie als appidentiteitsfallback.
Daarna ondertekende update testen en accountisolatie/Keychain/refresh/logout
werkelijk uitvoeren op afzonderlijke telefoons.
devicectl inspectie: één eerder gekoppelde Dennis-iPhone bekend, tunnel disconnected
en toestelservices niet beschikbaar. Geen iPhone nu lokaal bereikbaar. Geen
signing/installatie/wipe/pairing uitgevoerd, geen serienummers in publieke docs.
Dennis/Ingrid persoonlijke accounts/mappings/invites blijven OPEN totdat hun
aanmeldpad zonder gedeelde Cloudflarebeheerlogin bruikbaar is. Geen dode invites.

## Supabase-securityadvies
Read-only securityadvisor meldt auth_leaked_password_protection WARN.
Officiële docs: deze bescherming vereist Pro of hoger; bestaand Free-project
niet upgraden/kosten activeren. Gebruik uniek lang wachtwoord; applicatiepassword-
setup vereist minimaal12tekens, maar dit is GEEN gelekte-wachtwoordcontrole.
https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

## Direct vervolg
1. Bewaar deze geslaagde eigenaarwebacceptatie; laat hem niet opnieuw nulmeten.
2. Vraag gerichte toestemming voor uitsluitend bovenstaande buitenpoortvervanging.
3. Voer live controles + eigenaarlogin/recovery uit; geen mainmerge.
4. Provision Dennis/Ingrid met aparte expliciete interne rechten/audit/versebackup.
5. Native update installeren zodra gewenste ontgrendelde iPhone op Mac bereikbaar is.
6. Ontwerpfeedback volgt later; huidige huisstijl niet opnieuw wijzigen.
