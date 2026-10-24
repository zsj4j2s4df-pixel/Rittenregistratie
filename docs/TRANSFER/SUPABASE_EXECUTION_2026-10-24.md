# Supabase-uitvoering — 24 oktober 2026

Dit checkpoint vervangt oudere actuele statusregels hieronder/in andere documenten;
historische bewijzen blijven bewaard. GitHub is de centrale ontwikkelbron; geen
automatische synchronisatie of ontvangst door een Cloudrun beweren.

## Werkelijk uitgevoerd

- Apart project RitKompas (vcrhkfqmsaqszvsyfzba), bestaande D1 blijft rittenbron.
- Eigenaar heeft Gmail SMTP en appwachtwoord zelf ingericht. Eén testuitnodiging
  ontvangen; dit testaccount heeft GEEN D1-identiteit/voertuigrecht.
- Exacte Site URL en enige redirect:
  https://rittenregistratie.zsj4j2s4df.workers.dev/login . Geen wildcard.
- Officiële Supabase UI: uitnodigingsonderwerp “RitKompas — stel je account in”
  en herstelonderwerp “RitKompas — herstel je wachtwoord” met Nederlandse inhoud
  opgeslagen en teruggelezen. ConfirmationURL behouden. Sjablonen in
  docs/auth-email/. Geen persoonlijke uitnodigingen opnieuw verstuurd.
- D1-migratie 0017_supabase_identities.sql werkelijk toegepast: ledger 18 regels,
  laatste 0017, nul identity mappings. NIET opnieuw 0016 of 0017 toepassen.
- Vooraf verse export, versleutelde backup, ontsleuteling en lokale restore/
  populated upgrade gecontroleerd. Na migratie verse export: alle 21 bestaande
  datatabellen inhoudelijk ongewijzigd; ledger bewust veranderd. Integrity en FK PASS.
  Privébackups, sleutels en exports uitsluitend lokaal buiten Git.
- CLI-D1-export gaf authenticatiefout10000. Niet op die mislukte preflight
  doorgegaan; officiële bestaande Cloudflare-connector gebruikte beperkte D1 API
  voor export/query en teruglezing. Geen nieuwe rechten/accountkoppeling.
- Native Xcode-bron bevat aparte Supabase-credentialstore, expliciete refresh,
  vier strikte hostcookies, Keychain alleen na onthouden + server/voertuigcontrole,
  providerselectie op serverantwoord, accountwisselafscherming en lokaal sluiten
  vóór afmelden. Geen wachtwoorden of JWT-decodering voor rechten.
- Authstatus geeft alleen na serververificatie/mapping viewer/expiry terug.
  Native statusidentiteit en actuele voertuigscope moeten overeenkomen.
- Onthouden en geheugen-only blijven gescheiden; oude Access-route behouden
  totdat Supabase bewust wordt geactiveerd.

## Testbewijs lokaal

| Controle | Resultaat |
| --- | --- |
| Swift-kern inclusief rotatie/concurrency/logout/identity mismatch | 79 tests PASS |
| Node-regressies incl. authenticatiestatus zonder mapping | 302 tests PASS |
| TypeScript, ESLint, productie-webbuild | PASS |
| Gebouwde Worker met lokale D1, Supabase-provider nagebootst | PASS |
| Gebouwde Worker bestaande Access-route | PASS |
| Gebouwde Worker huisstijlassets/MIME/HEAD/POST | PASS |
| Xcode Debug generic iOS device, CODE_SIGNING_ALLOWED=NO | BUILD SUCCEEDED |
| D1 verse backup/restore, populated upgrade, postexportvergelijking | PASS |
| Echte Supabase-login/reset/refresh/logout door drie personen | NIET GETEST |
| Fysieke iPhone-installatie/CarPlay/OBD2/automatische GPS | NIET GETEST |

Geen synthetische providercheck presenteren als echte Supabase-aanmelding.
Geen unsigned build presenteren als geïnstalleerde iPhone-app.

## Wat LIVE is en wat niet

Website blijft bestaande huisstijlversie a315a6ed-2d6b-4e36-9dbf-258af6965042
(deployment007cde54-22f5-47b5-9e79-3485f7613551/100%). De vier bestaande bindings
en Access-accountledenpoort zijn NIET gewijzigd. AUTH_PROVIDER blijft Access;
nieuwe authcode is NIET gepubliceerd/geactiveerd. Anonieme poort niet omzeild.
Cloudflare heeft alleen de hierboven bevestigde additieve D1-migratie gekregen.
Supabase mail/redirectsjablonen zijn opgeslagen, niet bewijs van volledige login.
Xcodebron bijgewerkt en gebouwd, bestaande toestellen NIET bijgewerkt.

## Volgende veilige taakgroep

1. Lees RESUME en dit checkpoint; bekijk PR-keten boven PR65, niet main mergen.
2. Laat eigenaar aanwezig zijn voor één gecontroleerde persoonlijke setup/login-
   pilot. Persoonlijk wachtwoord nooit in chat/log/Git. Spreek kort testmoment af:
   huidige native Access-only installatie mag niet onverwacht worden afgekoppeld.
3. Controleer actuele runtimeconfig en Access-policy, onafhankelijke adminingang en
   rollback. Alleen publieke Supabase URL/publishable key gebruiken; geen service
   key in Worker/client. Backend blijft Auth tokens + D1-rechten controleren.
4. Maak drie Authaccounts via officiële beheermethode; koppel ieder expliciet aan
   bestaand correct D1-user/voertuig. Geen e-mailzelfregistratie met automatische
   ritrechten, geen testaccount tot bestuurder promoveren.
5. Uitnodiging pas als werkende beschermde callback/recoveryroute gereed is.
   Claim niet dat Cloudflare-accountmail vanzelf Supabase-toegang geeft.
6. Voer echte password-setup/login/reset/onthouden-off/on/refresh/revoke/logout en
   accountisolatie uit. Controleer foutpaden en behoud ritten/correcties.
7. Pas Access pas gecontroleerd aan nadat appauth daadwerkelijk bewezen is en
   eigenaar akkoord heeft met die concrete bereikbaarheidswijziging. Geen
   Allow Everyone/bypass als testoplossing; geen publiek onbeveiligd API-pad.
8. Installeer daarna ondertekende bijgewerkte Xcode-app op aanwezige ontgrendelde
   iPhones met eigenaar; aparte native acceptatie voor Dennis/Ingrid/Jesse.
9. Werk na elk resultaat centrale documenten bij en maak aparte PR; geen mainmerge.

## Alleen eigenaar

Aanwezig zijn bij persoonlijke wachtwoordkeuze en echte pilot; daarna iPhones
beschikbaar maken voor lokale installatie. SMTP is al geregeld: niet opnieuw
providerkeuze/appwachtwoord vragen. Geen aankoop/lidmaatschap nodig voor deze
huidige voorbereiding. Bezorging via Gmail is getest voor één mail, geen garantie
voor structurele aflevering of toekomstige quota.

## Grenzen

Geen mainmerge, force push, kosten, ritmigratie naar Supabase, nieuwe
accountrechten, securityversoepeling, productie-appauthcutover of iPhoneinstallatie
in deze taakgroep. Cloud kan code/tests/docs reviewen; Mac blijft nodig voor
signing, fysieke iPhone en hardware. Een GitHub PR is nog geen Cloudrunontvangst.
