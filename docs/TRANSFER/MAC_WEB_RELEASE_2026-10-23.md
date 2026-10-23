# Mac — nieuwste Cloudwebsite werkelijk live, 23 oktober 2026

Eigenaar vroeg PR59 uit te voeren/site live te zetten en waarschuwde dat Cloud de
site had verbouwd. Daarom PR63 exact ce94803cf7b15f92f667c82a362932f5e87425c1,
tree a48371c78e18838e03ff4c706c2196489750b34e opgehaald, boven PR62/61.
Bestaande Xcode-checkout/persoonlijke signing/installatie behouden. Geen native
bronwijziging of nieuwe iPhone-update. Geen mainmerge/forcepush/kostenactivatie.

Live: https://rittenregistratie.zsj4j2s4df.workers.dev/ritten

Versie638dcf97-999a-4df6-afd7-d3fc1ae42723, deployment
83e16f83-dfd3-42b3-8a8b-f11467301b9d,100%verkeer, API teruggelezen.
Publicatie2026-10-23T18:43:50Z. Alle vier oorspronkelijke bindings exact behouden:
DB/origin/issuer/audience. Voorganger ba2a2a9d/9c7c3f88 vóór upload geverifieerd.
Beperkte bestaande Wrangler-OAuth werkte; geen nieuwe/bredere rechten gevraagd.

## Gegevensbehoud daadwerkelijk getest

Verse volledige privé-D1-export; AES-256-GCM-backup, decrypt en lokale restore
PASS. Exact0015ledger/kolommen/indexen/FK/triggers met lokale migraties vergeleken.
Gevulde lokale0016upgrade behoudt alle oude waarden. Alleen geautoriseerde0016
en ledger toegepast,3statements success.0017 NIET toegepast, geen accounts.
Volledige nieuwe privé-exports na migratie EN deployment lokaal vergeleken:
alle oorspronkelijke waarden in21datatabellen ongewijzigd.17ledgerregels tot0016,
quick_check ok, foreign_key_check leeg. Geen test-ritten of accountwrites live.

Lokale eerste exportimport strandde op FK-volgorde; nieuwe geïsoleerde import
met FK uit tijdens import, daarna FK/integrity PASS. Geen productieherstel.
Eerste postread had SQL-syntaxfout op ongequote metadata-veld notnull; geen
volgende mutatie totdat gecorrigeerde alleen-lezen controles PASS waren.
Geen destructieve restore, beveiligingsbypass of automatische rollback.

## Exact gepubliceerde bron gecontroleerd

299Node/0failures, TypeScript, volledige ESLint, productiebuild en dry-run PASS.
61release-modules/28publiekeassets. PayloadSHA256:
075d2e51ca03615a15895ee808939fa643cb2d9b9319841c6d5559d2ec8d5212.
Uploadcirca1,9MiB/586KiBgzip, startup25ms. Gebouwde wrapper/framework + werkelijke
lokale workerd/D1 in Accessmodus: auth/scope/rechten/receipt/exactretry/adressen/
review/materialisatie PASS met synthetische identiteit. Chromium→HTTP/SQLite:
maand/filter/totaal/correctie/historie/CSV/PDFartifact, zes breedtes375–1920,
themaherstel en dataverwijdering bij autorisatieverlies PASS. Geen Safari/iPhone-
of echte Supabasebewijs. Beperkte scan406files/1046historischeblobs zonder
bevindingen, geen volledige securitycertificering. Geen privéassets/secrets/logs.

Anoniem /,/beheer,/api/vehicles,/ritten302 naar bestaande Accessorganisatie PASS.
Gate/policies NIET gewijzigd. Browser vroeg opnieuw om Cloudflare-aanmelding;
ingelogde live-UI/save/reload/assets dus NIET GETEST in deze groep. Geen cookies
uit andere browser geïmporteerd/fakelogin. Eigenaar meldt persoonlijk aan via
de rittenlink, geen codes/wachtwoorden delen.

## Volgende groep, niet als voltooid melden

AUTH_PROVIDER blijft bestaande Access. Supabasebron wel meegeleverd maar NIET
geactiveerd:0017/mail/uitnodiging/drieidentitymappings/nativecookie+binding+
refresh/logout/drie iPhone-updates OPEN volgens SUPABASE_CUTOVER_MAC.md. Niet
/login als werkende nieuwe persoonlijke login aanbieden. Access pas vervangen
na bewezen nieuwe appauth. Geen automatische/background-GPSclaim.

Geselecteerde publieke Jeep/logo/iconkopieën en visuele gelijkmaking uit
MAC_WEB_VISUAL_ASSETS.md OPEN; geen oude privéassets in release gestopt.
Privéherstelbewijs uitsluitend lokaal beveiligd bewaard; geen exportlinks,
sleutel, echte rijen, toestel-/accountgegevens publiek. Niet code-only naar
vóór0016 terugrollen; compatibele rollforward. Destructief herstel apart besluit.
