# Beschermde Supabase-pilot — preflight 24 oktober 2026

Eigenaar is aanwezig op Jesse's iPhone en vraagt werkende aanmelding. Het bestaande
formulier blijft bewust disabled zolang status503/providerAccess retourneert.
Jesse's eigen Supabase-account bestaat nog niet; bestaande interne Jesse-user en
actief Jeep-recht zijn gevonden. Geen persoonlijke adressen/subjects in dit document.

## Uitgevoerd

- Actuele officiële Supabase changelog/docs gelezen; geen TLSversoepeling nodig.
- Live Worker-settings: vier bestaande bindings, geen Supabasevars. Bestaande
  a315a6ed/007cde54 deployment100% en accountmembers-Accesspoort teruggelezen.
- D1-ledger18/0017 en nulmappings bevestigd, quickcheck/FK PASS.
- Verse officiële D1-export privé gedownload, AES-backup ontsleuteld/hersteld;
  alle26 huidige tabellen behouden en integriteit gecontroleerd. Privébestanden
  onder lokale work/supabase-pilot-private-20261024, nooit GitHub.
- Alleen publieke publishable key van apart RitKompasproject opgehaald; geen
  service_role/password/SMTPgeheim gelezen.

## Geblokkeerd vóór mutatie

Voorgenomen metadata-PATCH (bestaande vier bindings behouden plus AUTH_PROVIDER,
SUPABASE_URL en publieke publishable key) is door de veiligheidscontrole geweigerd
wegens impact op alle livegebruikers zonder bewezen livecanary. Er is GEEN PATCH
uitgevoerd. Niet alsnog via UI/CLI/alternatief endpoint omzeilen. Geen invites,
accounts, mappings, Gatewijziging of codepublicatie in deze pilotpreflight.

Voor doorgaan is gericht eigenaarbesluit nodig voor een korte, beschermde
productietest: Supabase wordt de enige appauthprovider; bestaande Access-only
appsessies kunnen dan niet meer hun oude backendaanmelding gebruiken. Bestaande
externe Cloudflarepoort en vier bindings blijven behouden. Toestemming tot alleen
onderzoek of generiek 'werkend maken' niet gebruiken om deze afwijzing te passeren.

## Voorgenomen uitvoering na concreet akkoord

1. Opnieuw actuele settings/deployment en backupgereedheid controleren.
2. Compatibele geteste code/configselectie expliciet afbakenen; geen gewijzigde
   code als al live bewezen presenteren. Alleen afzonderlijke gecontroleerde
   release, geen mainmerge.
3. Beschermde status/login/recoveryroutes controleren. Bij onverwachte fout de
   oude providerconfig en bijbehorende bescherming terugzetten; additieve0017
   niet downgraden en ritten niet herstellen/overschrijven.
4. Jesse officieel uitnodigen, expliciet naar bestaand intern Jesse/Jeeprecht
   mappen met auditlog. Geen automatische emailmatching tijdenslogin, geen nieuw
   voertuig of testaccountpromotie. Persoonlijke passwordsetup alleen eigenaar.
5. Echte login/refresh/logout bewijzen onder bestaande poort; pas daarna aparte
   concrete toestemming voor eventuele gatevervanging. Geen AllowEveryone/bypass.

Echte persoonlijke login/installatie NIET GETEST. Geen blocker als opgelost melden.
