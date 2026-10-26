# Dennis en Ingrid — voorbereide accountuitvoering

Status26oktober2026: uitsluitend voorbereiding; geen uitnodiging of rechtenwijziging.
Opdracht: PR68/comment6396862124. Eigenaar bevestigt beide voorbereiden; definitief
uitvoeren wacht op bevoegde Supabase-beheeraanmelding. Geen algemene reviewwachtstap.

## Bekende stand en ontbrekende toegang

Alleen-lezen snapshot25oktober: twee Authaccounts ontbreken; D1 bevat één bestaande
gebruiker/Jeepmembership, geen interne gebruikers voor Dennis/Ingrid. Dit is geen
bewezen spam-/SMTP-storing. Snapshot vóór uitvoering opnieuw controleren.
Bestaande Supabase-project/SMTP/redirect/sjablonen behouden. Geen nieuw Gmailaccount,
appwachtwoord, extra project, provider of beheerdersrechten voor appgebruikers.
Officiële beheerroute: https://supabase.com/dashboard/project/vcrhkfqmsaqszvsyfzba/auth/users
Persoonlijk aanmelden in Chrome op de Mac; iPhone-login opent geen Macsessie.
Geen wachtwoord in chat. Persoonlijke ontvangeradressen alleen uit eigenaarchat.

## Afgebakende operatorvolgorde

1. Vooraf alleen-lezen dubbele-accountcontrole en interne identity/membershipcheck.
   Bij bestaand account niet opnieuw uitnodigen zonder de huidige status te bepalen.
2. Voor D1-mutatie verse versleutelde backup/restore-/integriteitscontrole volgens
   bestaand uitvoerprotocol; eerdere geweigerde export niet als nieuw bewijs gebruiken.
3. Ontbrekende interne personen/memberships niet verzinnen of automatisch uit mail
   afleiden. Bestaand expliciet eigenaarbesluit verifiëren: beide admin_driver,
   Dennisprioriteit1/Ingrid2, Jesse3, hetzelfde bestaande voertuig. Bevoegde actor
   en reden in immutable audit; wijzigingen atomair, idempotent en op aantallen
   gecontroleerd. Geen ritten wijzigen; geen oude0017migratie herhalen.
4. Via officiële Authbeheerfunctie per persoon één uitnodiging met bestaande mailroute
   en callback https://rittenregistratie.zsj4j2s4df.workers.dev/login . Geen directe
   SQLinsert in auth.users; geen service_role opzoeken of een adminbackdoor maken.
   Lees sendacceptatie/fout terug; bij timeout eerst status herlezen vóór herhalen.
5. Exact uitgegeven Authsubject expliciet aan eigen gecontroleerde interne gebruiker
   koppelen, met audit. Geen email-/metadata-autogrant of Jesse-identiteit delen.
   Lees issuer/actieve mapping/membership terug, alleen afgesproken voertuig.
6. Ontvangers openen zelf mail/spam, kiezen zelf wachtwoord en melden persoonlijk aan.
   Geen wachtwoord namens hen instellen. Afzender kilometerjeep@gmail.com;
   verwacht onderwerp ‘RitKompas — stel je account in’. Provideracceptatie is geen
   inboxbewijs. Wachtwoord vergeten/herstel maakt geen ontbrekend account aan.
7. Per persoon ontvangst, setup, login, ingelogd-blijven/refresh/heropenen,
   herstel, logout en juiste voertuigscope afzonderlijk vastleggen. Native volgt
   met Aanmelden en Sessie gebruiken; geen Safari-cookie-import.

## Acceptatie en veilige terugkoppeling

| Bewijs | Dennis | Ingrid |
|---|---|---|
| Officieel Authaccount/uitnodiging | OPEN | OPEN |
| Expliciete eigen interne identiteit/membership/audit | OPEN | OPEN |
| Mail werkelijk ontvangen | NIET GETEST | NIET GETEST |
| Zelf wachtwoord ingesteld/weblogin | NIET GETEST | NIET GETEST |
| Native sessie/installatie | NIET GETEST | NIET GETEST |

Publiceer uitsluitend aantallen/status/tijdstip/redacted foutcategorie. Geen email-
adressen, Authsubjects, privélinks, wachtwoorden, cookies, exports of SMTPcredentials.
Bij gedeeltelijk resultaat niet verwijderen/resetten als oplossing; toestand
noteren, herlezen en precies ontbrekende stap vervolgen zonder dubbele uitnodiging.

Officiële reference26oktober: https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail .
Beschikbare connector heeft geen officiële invite/create-useractie; gebruik eigen
beheerbrowser. Geen mails verstuurd in deze voorbereiding.
