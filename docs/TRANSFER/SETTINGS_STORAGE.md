# CLOUD-005 — duurzame instellingen en Cloudflare-voorbereiding

18 oktober 2026. Branch cloud/cloud-005-settings-storage, base cloud/cloud-005-http-adapter / draft-PR #9 (head511c8f3). Geen publiek aangesloten route, Cloudflare-account, live migratie of productiepublicatie.

## Instellingen
- Kenteken, voorkeursadressen en historische tarieven in bestaande database/tabellen, met voertuigscope en gehele micro-eurobedragen. Geen tweede gegevensbron naast de bestaande tabellen.
- Gehele settingssnapshot in één SQL-read; revisionconflict409, actieve voertuigtoegang opnieuw in de schrijfbatch, één atomische audit met actor/tijd/reden/oude/nieuwe waarde.
- GET/PATCH /api/vehicles/{vehicleId}/settings en GET /settings/history in de providerneutrale handler. Zelfde CSRF/origin/JSON16KiB/geen-CORS/no-store-beveiliging als ritten.
- Maximaal40 adressen+tariefperioden per volledige update:44batchstatements +authorisatie/read blijven onder50D1 Free-queries per invocation; honderd bindparameters/query worden niet overschreden. Dit is een huidige API-grens, geen beperking die uit de mastereisen vervalt; bij groei partial-update/paginering ontwerpen.
- Migratie0006 is uitsluitend ALTER ADD; oude records zonder voertuigtoewijzing blijven onaangeroerd en onzichtbaar voor voertuigaccounts. Toewijzing/conversie vraagt gecontroleerde migratie, niet stil aan het eerste voertuig koppelen.
- Toegewezen legacy-IDs en metadata blijven behouden. Adreswijziging maakt oude coördinaten leeg; alleen label/notitie wijzigen bewaart coördinaten/radius/auteur. Tariefwijziging maakt een oude bronverwijzing leeg; ongewijzigd tarief behoudt deze. Geen automatische geocoding of fiscale tariefclaim.
- Fysieke ID-conflicten met andere/onbekende scope breken de gehele transactie af via NOT NULL-controle; geen schijnsucces of toe-eigening. De HTTP-grens schermt interne foutdetails af. Een dergelijke legacybotsing vraagt gecontroleerd herstel; geen automatische hernoeming.

## Access-resolver (voorbereid)
lib/cloudflare-access.ts verifieert RS256 met WebCrypto, vaste geconfigureerde teamissuer/JWKS-host, app-audience, tijdclaims en app-gebruikersclaims. JWKS is begrensd64KiB, met fetch-timeout,60sec-cache en duplicate-key-denial. Geen tokengekozen jku/x5u-fetch, geen e-mailheaderidentiteit en geen automatische accountaanmaak.

Interne gebruiker moet vooraf gekoppeld zijn met external_auth_id=JSON.stringify([issuer,verifiedSubject]); vervolgens bepalen users.disabled en bestaande memberships de toegang. Tokens/geheimen worden niet gelogd. Gebruik als resolveSession bij createTripHttpHandler, uitsluitend nadat een echte Access-app is ingericht/getest. De resolver wordt nog nergens publiek aangeroepen. Applicatiecontext, accountbootstrap en cookies/native flow ontbreken nog.

Een geldig JWT kan tot exp geldig blijven na providerlogout/revocation; geen online revocationcontrole gebouwd of beloofd. Lokale userdisable/membershiprevocation is wel getest. Keyrotatie kan tot60sec wachttijd veroorzaken. ProductionCPU, echte JWKS/Access-login, passkeys/MFA, accountbeheer, native sessies en herstelflows NIET GETEST. Dit is geen volledige productieauthenticatie.

## Uitgevoerd bewijs
89/89 Node-tests PASS; TypeScript/lint/Vinext-build PASS. Runtime Node24.19.0/Linux, bestaande frozen-lockfile-dependencies.
-11settingscases: opslag over service-instances, scope/legacy, overlap/velden, concurrentie/stale revision, atomicrollback, metadata/legacybehoud, fysiekeID-botsing en batchgrens.
-7HTTP-cases waaronder settingsCSRF/revision/audit; bestaande servicetests behouden na extractie gedeelde servertoegang.
-6cryptografische Access-tests met zelf gegenereerde synthetische RSA-sleutel: echte signature, spoof/tamper/alg,issuer/aud/tijden, ongeldigeJWKS/cache en geblokkeerde user. Geen echte providercredentials.
-Lokale workerd/D1-binding PASS voor migratie/settingsHTTP/read/write/rollback en synthetisch ondertekende identiteit→interneuser→rechten. Crypto/handler draait hierbij in Node, D1-SQL via workerd: geen volledige Worker-deployment ofCPU-meting.
-Onafhankelijke gerichte review vond2settingslegacyfouten; beide gerepareerd en hercontrolePASS. Gerichte Access-review: geen concrete fout. Geen volledige productieaudit.
-Patroonscan130bronbestanden/169historischeblobs:0treffers; beperkte scan, geen garantie.

## Eigenaarbesluiten en grenzen
Cloudflare-onderzoek gekozen en afgerond: CLOUDFLARE_RESEARCH.md met officiële prijzen/limieten/privacyvoorwaarden. Aparteagenttoegang opgedragen, plan SEPARATE_AGENT_ACCESS.md; connector kan niet naar een andere identiteit worden omgezet met beschikbare acties. Live read-only hercontrole bevestigt nog eigenaarlogin296047649 en ruleset25339571 active met3regels en0verplichte approvals. Nog geen identiteitsscheiding. Geen nieuwe keuze voor hetzelfde onderzoek vragen.

## Volgende uitvoerbare groep
Serverrapporten met duurzame onveranderlijke snapshots en exportautorisatie, daarna UI koppelen/synchronisatie en detectie-inname. Web blijft tijdelijkedemostate tot daadwerkelijke integratie. Owner moet voor aparteagent een ondersteunde andere account-/App-koppeling verzorgen; Cloudflare-activatie vraagt persoonlijk account/voorwaarden/betaalgegevensbesluit. Geen toestemming voor productie of abonnement afleiden uit onderzoek.
