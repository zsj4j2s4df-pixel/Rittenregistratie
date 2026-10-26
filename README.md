## Actueel: gerichte Mac-Siri-validatie en accountvoorbereiding

[PR70 Macbewijs](docs/automatic-trips/MAC_VALIDATION_2026-10-26.md):87Swift-tests,
unsigned device/simulator en Nederlandse Siri-metadata PASS. Echte iPhone-/lockscreen-
Siri en automatische ritstart blijven OPEN. [Dennis/Ingrid-accountdraaiboek](docs/auth-email/ACCOUNT_PREPARATION_2026-10-26.md)
voorbereid; geen uitnodigingen of rechten gewijzigd, wacht op beheerlogin.

## Actueel: echte iPhone-app voor drie toestellen voorbereid, niet downloadklaar

[Native voorbereiding, actuele status en operatorstappen](docs/installatie/NATIVE_READINESS_2026-10-24.md).
Build1.0(2) unsigned device+simulator PASS,79Swift/312Node PASS. Goedgekeurd
merkbeeld in echte registratie en offroadfoto in gelabelde demo; simulatorbeide
thema's bekeken. Geen fysieke installatie/TestFlight. Twee accounts en signing/
drieaccountacceptatie open. PDF+mobielHTML-artifact gemaakt; geen IPA of webapp.

## Actueel: eenvoudige startuitleg en veilige loginvolgorde

[Uitleg en reviewmail](docs/onboarding/README.md) · [Resultaat/hervatpunt](docs/onboarding/DELIVERY_STATUS_2026-10-24.md) · [Projectstructuur](docs/PROJECT_STRUCTURE.md).
Nieuwe publieke route `/hulp`; remember-keuze vóór credentials, standaard uit.
Eerst Jesse's review, dan pas overige persoonlijke uitnodigingen. Mail NIET
verzonden; doorstuurbare uitleg beschikbaar. Native/hardware nog open.
Actuele livestatus staat uitsluitend in bovenstaand resultaatdocument.

## Actueel: goedgekeurde iconen LIVE in bewezen RitKompas-account

[Exact account-, publicatie- en testbewijs](docs/design/APP_ICON_LIVE_2026-10-24.md).
PR67bron558c89ec gepubliceerd als b919671a/deploymentd634c2cc/100%. Doelaccount
expliciet e9922d90… met subdomain/Worker/DB geverifieerd; andere koppeling niet
gebruikt.7bindings/directe Supabase-login behouden. Zeven liveassets MIME/hash,
manifest/HTML, zes private routes401 en foreign-origin403PASS. Verse encrypted
restore26tabellen + na-export alle26ongewijzigdPASS. Geen mainmerge/kosten/DBmutatie.
NativeAppIcon wel gebouwd maar nog NIET op telefoon geïnstalleerd. Safari kan
oud homescreenicoon cachen; echte nieuwe homescreentest nog open. Historie hieronder.

## Actueel: extra Cloudflare-inlog verwijderd, Supabase beschermt ritgegevens

[Exact uitvoeringsbewijs en hervatpunt](docs/TRANSFER/DIRECT_LOGIN_2026-10-24.md).
Met concreet eigenaarakkoord alleen de RitKompas-Accessapp verwijderd; privé
herstelconfig bewaard. Website /login direct200, status supabasefalse/no-store,
zes private routes anoniem401, vervalste Access/bearer401, foreign-origin403.
Versie da1419ca/deployment6b5c31bd/100% en7bindings gelijk; geen DB/codepublicatie.
Jesse-login eerder eigenaarbevestigd; na poortvervanging eigenaarlogin/reset nog
niet opnieuw getest. Native dubbelepoortblokkade vervallen, fysieke update nog open.
Dennis/Ingrid accounts nog open. Dashboard/andere diensten niet gewijzigd.
Oudere behouden-poort/akkoord-nodigregels hieronder zijn historie, niet hervatpunt.

## Actueel: Jesse webaanmelding door eigenaar bevestigd

[Acceptatie, aanvullende securitytests en direct vervolg](docs/TRANSFER/JESSE_WEB_ACCEPTANCE_2026-10-24.md).
Eigenaar bevestigt geslaagde iPhone-weblogin en tevreden huidig ontwerp. Nieuwe
gebouwde Workerproef zonder buitenpoort PASS: zes private routes anoniem401,
identity-/membership-/account-/viewer-/CSRFguards en logoutreplay. Provider synthetisch.
Eigenaar wil extra Cloudflarelogin straks weg; eerst gericht akkoord op concrete
poortvervanging en rollback, dashboard/andere diensten ongewijzigd. Native dubbele-
poortacceptatie nog niet bewezen; geen iPhone nu lokaal bereikbaar. Dennis/Ingrid
nog open. Supabase leaked-passwordwarning vereist betaald plan: niet activeren.
Geen nieuwe publicatie/DB/gatewijziging door deze testgroep. Historie hieronder.

## Nieuwste status: Supabase beschermd LIVE, eigenaarpilot bij Accesspoort

[Leidend livebewijs en direct hervatpunt](docs/TRANSFER/SUPABASE_PROTECTED_LIVE_2026-10-24.md).
Versie da1419ca/100%,deployment6b5c31bd;7bindings met Supabase actief, Accesspoort
ongewijzigd. Formulier enabled; zonder appsessie geen rittoegang. Jesse officieel
uitgenodigd en expliciet gekoppeld aan bestaande rechten met audit; mailadres
bevestigd. Eigenaar ziet na Outlook→Safari de Cloudflarepoort: eerst zelf bestaande
Cloudflare-aanmelding afronden, zo nodig daarna nieuwe recoverymail. Nog GEEN
bewezen appaanmelding/wachtwoordsetup/nativeinstallatie. Dennis/Ingrid nog OPEN.
Verse restore26tabellen en24overige tabellen gelijk;302Node/TypeScript PASS.
Oudere 'niet geactiveerd'/afwijzingsregels hieronder zijn historie. Geen mainmerge,
securitybypass of nieuwe kosten. Alleen publieke publishable key inconfig.

## Actueel — 24 oktober 2026: Supabase-voorbereiding uitgevoerd, live-pilot open

[Leidend uitvoeringsbewijs en hervatplan](docs/TRANSFER/SUPABASE_EXECUTION_2026-10-24.md).
SMTP/redirect en Nederlandse invite/reset-sjablonen opgeslagen. D1 **0017 LIVE**,
ledger18, nul mappings, verse backup/restore en 21 bestaande datatabellen behouden.
Native Supabase login/refresh/Keychain/logout geïntegreerd in bron; **79 Swift en
302 Node-tests**, type/lint/webbuild, beide gebouwde Worker-authroutes en unsigned
Xcode-devicebuild PASS. **Niet geïnstalleerd; echte drieaccountacceptatie NIET GETEST.**
Website blijft a315a6ed/Access; nieuwe authcode NIET geactiveerd/gepubliceerd.
Drie persoonlijke accounts/uitnodigingen/mappings nog open. Volgende groep:
eigenaar aanwezig voor gecontroleerde beschermde setup/login/reset-pilot, daarna
pas gecontroleerde overgang en fysieke iPhoneupdates. Geen mainmerge/bypass/kosten.
Oudere statusregels hieronder zijn historische checkpoints, niet het hervatpunt.

# RitKompas — Rittenregistratie

> **Live eigenaarstoegang, 19 oktober:** bindings en uitsluitend eigenaar/voertuigrecht met toestemming ingericht. De ingelogde backend weigert echter nog; geen geslaagde centrale login claimen. Anonieme toegang blijft gesloten. [Testresultaat en vervolg](docs/TRANSFER/OWNER_ACCESS_RESULT_2026-10-19.md). Geen nieuwe appcode gepubliceerd.

> **Gezamenlijke actuele basis:** CloudPR28/29 en MacPR30 zijn gecombineerd. Cloud heeft PR27 aantoonbaar verwerkt; Mac heeft de GitHub-retourtest uitgevoerd. Zie [ontvangstbewijs](docs/TRANSFER/MAC_CLOUD_ACK_RESULT.md).197Node-tests/type/lint/build op Mac PASS, native iOS/hardware nog open. Volgende runs starten met RESUME.md en centrale Cloudplanning PR27_PLAN.md.

> **Nieuwste overdracht, 19 oktober 2026:** lees [PR27-plan](docs/TRANSFER/PR27_EXECUTION_PLAN.md), [hervatpunt](RESUME.md), [Mac-/Cloud-ontvangstbewijs](docs/TRANSFER/MAC_CLOUD_CHANNEL_TEST.md) en [Zero Trust-resultaat](docs/TRANSFER/MAC_ZERO_TRUST_2026-10-19.md). De bestaande keten loopt tot PR #26; het parallelle memo #27 is hier meegenomen. GitHub is centraal, Cloud coördineert, Mac valideert native/hardware, eigenaar beslist over belangrijke wijzigingen. Corecompile op Mac en187Node-tests PASS; geen iPhone-acceptatieclaim.

Project voor de Jeep Wrangler Unlimited 80th Anniversary 4xe: native iPhone-app, webinterface en centrale gegevensbron volgens de masterprompt.
Deze overdrachtsbranch bevat nu de bestaande webcode, gegevenscontroles, databaseontwerp en 31 automatische tests. De app is een tijdelijke demo, geen productieklare registratie. Native iPhone-app, echte GPS, accounts, opslag/sync, PDF en MCP ontbreken nog.

## Actuele besturing — 18 oktober 2026

**Cloud ontwikkelt; Mac ondersteunt; jij beslist.** GitHub is de centrale bron van waarheid. Sol is voorkeur voor dagelijkse regie indien beschikbaar, Astra alleen voor belangrijke beslissingen. Geen automatische overdracht van agents, sessies of modelinstellingen. Zie [CLOUD_HANDOVER](CLOUD_HANDOVER.md), [RESUME](RESUME.md), [DEVELOPMENT_PROGRESS](DEVELOPMENT_PROGRESS.md) en [AGENTS](AGENTS.md).

## Testen en starten

Node 24 aanbevolen. Pure tests zonder package-installatie: `node --experimental-strip-types --test tests/*.test.mjs`. Met bestaande/toegestane lockfile-dependencies: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm build`, lokaal `pnpm dev`. Geen secrets nodig voor de demo. Cloud-installatie en tests worden apart geverifieerd; Mac-uitvoer is geen Cloudbewijs.

## Begin hier

- [Masterprompt en functionele wensen](Jeep_4xe_Rittenregistratie_Masterprompt_BIJGEWERKT.md)
- [Uitvoeringsvolgorde en nieuwste Sol-regie](RitKompas_Astra_Opperagent_Complete_Opdracht.md)
- [Mac/Cloud-samenwerking](RitKompas_Codex_Mac_Cloud_Samenwerking.md)
- [Cloud-taken en blokkades](CLOUD_TASKS.md)
- [Persoonlijke acties](OWNER_ACTIONS.md)
- [Voortgang en bewijs](docs/ASTRA_AUDIT/PROGRESS.md)
- [Eisenregister](docs/ASTRA_AUDIT/REQUIREMENTS_TRACE.md)
- [Testplan](docs/ASTRA_AUDIT/TEST_PLAN.md)
- [Documentbevindingen](docs/ASTRA_AUDIT/DOCUMENT_REVIEW.md)
- [Brononderzoek en kosten](docs/ASTRA_AUDIT/FEASIBILITY_RESEARCH.md)
- [Securityvoorcontrole](docs/ASTRA_AUDIT/SECURITY_PRECHECK.md)
- [Code-auditstatus](docs/ASTRA_AUDIT/CODE_AUDIT.md)
- [Voorbereidende backend/webtaken](docs/ASTRA_AUDIT/BACKEND_WEB_CANDIDATES.md)

## Werkwijze

Cloud coördineert de ontwikkeling; Mac ondersteunt lokale/iOS/hardwaretaken. Wijzigingen via branches en PR's; alleen de eigenaar mag toestemming geven voor main-merge en andere belangrijke handelingen. Geen automatische merge of productiepublicatie.
Open op iPhone de GitHub-branch of PR om voorgestelde documenten te bekijken; bestanden verschijnen pas na goedgekeurde samenvoeging op main.

## Huidige beperking

De broncode is als overdrachtsvoorstel toegevoegd boven op PR #2; PR #2 hangt af van PR #1. Geen van deze PR's is automatisch gemerged. Bestaande Cloud-documentatie en de aparte [Mac-snapshot](docs/MAC_SNAPSHOT_2026-10-18/README.md) blijven behouden. Foto en sociale preview blijven lokaal; de app gebruikt een gemarkeerde placeholder. Main-bescherming/eigenaarreview is nog niet technisch bevestigd: zie [ACT-002](OWNER_ACTIONS.md).
