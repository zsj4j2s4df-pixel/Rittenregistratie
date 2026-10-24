# Icoonpublicatie LIVE — 24 oktober 2026

Eigenaar gaf expliciet publicatieakkoord en waarschuwde voor twee gekoppelde
Cloudflare-accounts. Daarom doel niet op naam/default gekozen: huidig connector-
accountoverzicht en bestaande Worker/subdomain/DB/Supabaseconfig teruggelezen.

## Juiste account en bron
- Uitsluitend account e9922d90d4223d8522e44cb000c5d608, subdomain zsj4j2s4df,
  Worker rittenregistratie en bestaande D1 5cee8499-45cf-47a4-8960-4b43e4ab8204.
- Huidige connectortool gaf één toegankelijk account terug. Dit ontkent niet dat
  eigenaar twee koppelingen heeft; geen volledige audit van andere koppeling
  geclaimd. CLI-doel expliciet CLOUDFLARE_ACCOUNT_ID op bovenstaand account gezet.
- PR67bron558c89ec3e0e8879416dad865f4b24d7a5ccea6f,
  treec4067290d4e7a694960fff75a4c8f9b4123a4790 exact gelijk lokale daa8798.
- Alleen getest icoonpakket gepubliceerd, geen mainmerge/andere Workers/account/
  rechten/nieuwe kosten. Geen hernieuwde Cloudflare-inlogpoort.

## Werkelijk LIVE
URL https://rittenregistratie.zsj4j2s4df.workers.dev/ritten .
Versie b919671a-0299-4093-9bd1-9723c405e969,
deployment d634c2cc-d449-42c2-8b41-39971424d47f,100%, via juiste account teruggelezen.
Alle7bindings exact gelijk voor/na; Supabase/APP_ORIGIN/DB behouden.
Exact gekozen zand/antracietlogo in header/login en webapp/Apple-touchmetadata;
vernieuwd Willys-navigatie-icoon in publieke UI-shell teruggelezen.

## Bewijs PASS
- Vorige306Node/type/lint/webbuild/unsignedXcode en beide thema's/zesgroottes
  browserregressies behouden; gebouwde Worker assets+auth PASS.
- Afzonderlijke dryrun vóór publicatie: 2035KiBgzip,7bedoelde bindings.
- Verse officiële D1-export, encryptedbackup, ontsleuteling/restore/integriteit/
  FK en alle26tabellen vergeleken vóór deployment. Privébestanden buiten Git.
- Na deployment verse export: alle26tabelwaarden exact gelijk, integriteit/FK PASS.
- Zeven geselecteerde assets live200, exacte MIME/SHA256 en HEAD PASS.
- Webmanifest200/manifest+json, start_url/ritten; live HTML verwijst naar
  goedgekeurd logo, Apple-touchicoon en manifest.
- Directe login200 zonder Accessredirect; status alleen supabasefalse/no-store.
- Zes private APIroutes zonder appsessie401/no-store/foutobject zonder persoonsgegevens.
- Vervalste Accessheader, oude CFcookie en bearer401; foreign-originlogout403.
- Publieke ritten/beheershell200 zonder bestaande interne identiteit.
Geen wachtwoordlogin namens eigenaar, ritmutatie of authsessierevocatie getest.

## Grenzen en volgende stap
Nieuwe nativeAppIcon/bron is unsigned gebouwd, maar niet geïnstalleerd op iPhone.
Safari/aan-beginscherm-toevoegen kan iconen cachen; eigenaar vernieuwt de pagina
en beoordeelt echte weergave. Nieuwe homescreenicoonacceptatie NIET GETEST.
Jesse's geslaagde webaanmelding vóór deze cosmetische release is eigenaarbevestigd;
persoonlijke naverificatie na nieuwe icoonrelease niet opnieuw geclaimd.
Geen offline/automatische GPS/CarPlayclaim door manifest of publicatie.
Volgende zelfstandige groep: Dennis/Ingrid persoonlijke accounts/mappings met
versebackup/audit en expliciete toegangscontrole; nativeondertekening/installatie
pas op beschikbaar ontgrendeld toestel en met bestaande data behouden.

## Terugweg
Vorige compatibele Supabase/directloginversie da1419ca blijft bekend. Alleen code-
rollback naar passende Supabaseconfig indien nodig; nooit oude Access-only code/
provider als automatische identiteitfallback. Geen D1downgrade/destructieve restore.
