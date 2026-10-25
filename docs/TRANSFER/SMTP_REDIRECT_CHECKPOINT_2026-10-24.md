# SMTP en terugkeerlink — 24 oktober 2026

Alleen het aparte RitKompas-project vcrhkfqmsaqszvsyfzba gewijzigd.
Eigenaar heeft Gmailaccount zelf aangemaakt, tweestapsverificatie aangezet,
appwachtwoord zelf gemaakt en rechtstreeks in Supabase bewaard. Wachtwoord
niet opgevraagd, gelezen of naar GitHub gekopieerd. Dashboard na reload:
custom SMTP aan, smtp.gmail.com:465, Sender name RitKompas, opgeslagen
wachtwoord verborgen, Save changes disabled. Gmailwaarschuwing voor
transactionele bezorging blijft; geen algemene aflevergarantie.

Eigenaar keurde één officiële testuitnodiging goed naar het expliciete testadres.
Eén invite via Auth Users verstuurd, dashboard bevestigt verzending; eigenaar
bevestigt ontvangst. Alleen Auth-testgebruiker, geen D1mapping/ritrecht of
dashboardlidmaatschap toegekend. Geen herhaalde uitnodiging sturen.

Daarna drie persoonlijke adressen door eigenaar verstrekt; niet in publieke
documentatie opnemen. Nog GEEN drie persoonlijke uitnodigingen verzonden.
Eerst URLcontrole: SiteURL was http://localhost:3000, redirectlijst leeg.
Eigenaar gaf expliciet akkoord om deze te corrigeren naar de eigen /login.
Werkelijk bewaard en via dashboard teruggelezen:

- Site URL: https://rittenregistratie.zsj4j2s4df.workers.dev/login
- Redirect URLs: exact dezelfde URL, totaal1, geen wildcards/extra origins.
- Successmeldingen voor SiteURL en ene URL gezien; bewijscreenshot getoond.

Alleen callbackconfig gewijzigd. Bestaande Cloudflare-Accesspoort,
AUTH_PROVIDER en D1 ongewijzigd. Geen migratie0017, identitymapping,
nativecookie/Keychain-refresh/logoutactivering of iPhone-installatie in deze groep.
Mailbezorgingstest is geen bewijs van werkende wachtwoordinstelling/inloggen.

Volgende stap: SUPABASE_CUTOVER_MAC.md uitvoeren vanaf actuele PR65-code.
Eerst veilige auth/mapping-/recoveryvoorbereiding met verse private backup,
gecontroleerde pilot onder bestaande bescherming en echte accountacceptatie.
Persoonlijke invites pas als de terugkeerpagina veilig kan functioneren;
de exact ingestelde URL alleen bewijst dit niet. Geen securitybypass of
dashboardrechten toevoegen als mailomweg. Geen testaccount automatisch mappen.
