# Supabase beschermd LIVE — 24 oktober 2026

## Actueel resultaat
Na specifiek eigenaarakkoord op publicatie, enige Supabase-provider en impact op
bestaande Access-only native sessies is de nieuwe aanmeldrelease uitgevoerd.
De eerdere veiligheidsafwijzing is niet omzeild: eerst concreet toestemming
gevraagd en gekregen. Oude afwijzingscheckpoint is historie.

- Worker da1419ca-5b85-4e52-a02f-34d4ab675971, deployment
  6b5c31bd-02f5-4504-8d05-96638b7d4fba,100%, teruggelezen.
- Geteste PR66-webcode plus expliciete configuratie uit lokale commit a3bbacd.
  Native bron eveneens in PR66 maar nog NIET opnieuw fysiek geïnstalleerd.
- Officiële Wrangler4.92 dryrun PASS, deploy/triggerupload PASS. CLI-Workers-recht
  werkt; eerdere D1-export CLI10000 is geen bewijs van ontbrekend Workers-recht.
- AUTH_PROVIDER=supabase, apart projectURL/publieke publishable key toegevoegd.
  DB/APP_ORIGIN/ACCESS_ISSUER/ACCESS_AUDIENCE en compatibilitydate/flags behouden.
  Config + gegenereerde types in repository; geen service_role/SMTPgeheim.
- Bestaande Access-app, workerbestemming en accountmembers-policy teruggelezen
  en ongewijzigd; geen nieuwe projecten/abonnementen/hoofdbranchmerge.
- Officiële Supabase Auth UI: één persoonlijke Jesse-uitnodiging daadwerkelijk
  verstuurd; aparte testauthuser blijft ongemapt. Geen nieuwe beheerdersrechten.
- Eén expliciete issuer/subjectmapping naar bestaande Jesse-user en Jeep-recht
  plus één immutable auditregel via D1 atomic batch. Bestaande IDs/name/email/
  external_auth_id/vehicle_membership ongewijzigd; geen nieuw voertuig/bestuurder.
  Subject en persoonlijk adres uitsluitend in private beheercontext, niet Git.
- Dennis/Ingrid accounts/mappings/invites nog OPEN, niet stilzwijgend aanmaken.

## Werkelijk gecontroleerd
- Verse privé-export, AES-backup/ontsleuteling/restore: alle26tabellen PASS.
- Na migratie/koppeling verse export: alle24niet-bedoeld-veranderde tabellen gelijk;
  precies één identitymapping en één auditappend; alle oude audits behouden;
  quickcheck/integriteit/FK PASS. Ledger blijft18/0017, niet opnieuw migreren.
- Live ingelogde Access-browser op /login: velden en Inloggen enabled; oude
  onbeschikbaarmelding verdwenen. /api/auth/status toont supabase/false.
  Zonder appaanmelding /api/vehicles: Aanmelden vereist, geen privédata.
- Externe anonieme requests /login,/api/auth/status,/api/vehicles,/ritten blijven
 302 naar Access. Dit is bewust nog geen openbare Supabase-loginpagina.
- 302Node-tests en TypeScript opnieuw PASS na configuratiewijziging.
  Vorige79Swift en unsigneddevicebuild blijven bronbewijs, geen iPhoneupdate.
- Mailacceptatie: eigenaar toont na klikken de echte Cloudflare Access-pagina.
  Authreadback bevestigt dat het persoonlijke e-mailadres inmiddels is bevestigd.
  Dit bewijst alleen invite-verificatie, NIET volledig appinloggen of eigen
  wachtwoordkeuze. Geen wachtwoord/hash/token gelezen.
- Native fysieke app, echte wachtwoordsetup/appsession/refresh/logout en
  driepersoonacceptatie blijven NIET GETEST.

## Direct hervatpunt met eigenaar
De eigenaar is op Jesse's iPhone. Outlook-mail-link opent Safari en toont de
bestaande Cloudflarepoort; eerdere appbrowser had waarschijnlijk een andere
Accesssessie. Wacht op eigen Cloudflare-aanmelding door eigenaar. Niet namens
hem credentials kiezen of huidige bescherming alsnog uitschakelen.

De invite is nu verbruikt/bevestigd. Geen dezelfde invite opnieuw versturen of
een oude tokenlink delen. Als de herstel-/invitefragmenten na Access niet
doorkomen: eerst Accesssessie in Safari afronden, dan op de loginpagina
Wachtwoord vergeten voor dit bestaande account een nieuwe recoverymail starten.
Eigenaar kiest vervolgens zelf >=12tekens, geen wachtwoord in chat.
Geen ontvangen-mailtoken inspecteren/opslaan/publiceren; geen SQL-authmutatie.

Pas na echte appaanmelding persoonlijke scope/Jeep, reset, refresh, onthouden en
logout bewijzen; geen ritten vervuilen zonder expliciete testcontext. Accesspoort
alleen apart en gecontroleerd vervangen na bewezen appauth plus concreet akkoord.
Nieuwe auth is nu LIVE; niet opnieuw blokkeren op niet-geactiveerde provider.

## Terugweg
Compatibele vorige code/config a315a6ed + Accessprovider met bestaande vier
bindings zijn bekend; Accesspoort blijft steeds bestaan. Bij onverwachte
appauthstoring gecontroleerd oude providerconfig én passende code herstellen,
geen automatische identityfallback en geen D1downgrade/rittenrestore.
De additieve0017 en auditgeschiedenis behouden. Geen permanente monitoringclaim.
