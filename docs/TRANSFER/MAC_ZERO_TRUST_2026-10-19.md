# Mac — Zero Trust-configuratie en verificatie

> Vervolg na expliciete toestemming: runtimebindings en uitsluitend eigenaarprovisioning uitgevoerd, maar livebackendlogin blijft FAIL. [Nieuwste bewijs](OWNER_ACCESS_RESULT_2026-10-19.md). Onderstaande ontbrekende-bindings/geen-databasewijziging betreft de eerdere Access-only-fase.

19 oktober 2026, Europe/Amsterdam. Uitgevoerd op de bestaande RitKompas-Worker, na specifieke eigenaarstoestemming in deze chat. Geen nieuwe Worker-release, abonnement, aankoop of databasewijziging.

## Vastgesteld en toegepast

Het ingelogde Cloudflare-dashboard bevestigt **Zero Trust Free** en Super Administrator. Vooraf bestonden de organisatie en één Cloudflare-identiteitsprovider, maar geen Access-app of policy. De Worker meldde “not protected”. Er zijn geen tunnels of Access-groepen aangetroffen; deze webbeveiliging vereist geen Mac-VPN of tunnel.

Na toestemming is uitsluitend bij Worker `rittenregistratie` **Access → All traffic → Cloudflare account members** toegepast. De policy volgt de Worker op productie- en preview-URL's. Geen accountbrede bescherming of bypass ingesteld. Er was tijdens de controle precies één geaccepteerd accountlid: de eigenaar. Latere toevoeging van accountleden vergroot daarom ook deze allowlist en moet bewust worden beoordeeld. De sessieduur in het goedgekeurde formulier is 24 uur.

Teruggelezen via Access API:

- App `4fa445ac-ed67-487b-8ecb-a60d49bec944`, type `self_hosted`, destination type `worker`.
- Policy `8549572d-560e-4cd3-992a-378042053947`, decision `allow`, één `cloudflare_account_member`-selector; geen Everyone, bypass, uitsluitingen of extra policies.
- Bestaande Cloudflare-provider beperkt tot accountleden.
- Openbare issuer `https://snowy-snowflake-4760.cloudflareaccess.com`.
- Openbare audience `552d760968b163dd31a00c1b880c749970c7e4ab0ee4963073f1af06e6ac7f02`.

Dit is een apart beoordeelde Worker-configuratie. De bestaande conservatieve offline preflight accepteert alleen publieke hostname + expliciete e-mails en zal deze Worker/accountmember-variant afwijzen. De preflight is niet versoepeld om een groene uitslag te krijgen.

## Tests en grenzen

| Controle | Werkelijke uitkomst |
|---|---|
| Dashboard plan | Zero Trust Free bevestigd |
| Dashboard na Apply Access | Worker Access All traffic; login vereist op productie en previews |
| Cookievrije GET `/` | HTTP 302 naar eigen Cloudflare Access-login |
| Cookievrije GET `/beheer` | HTTP 302 naar eigen Cloudflare Access-login |
| Cookievrije GET `/api/vehicles` | HTTP 302 naar eigen Cloudflare Access-login |
| Browserlogin met bestaande Cloudflare-sessie | PASS: na Cloudflare-aanmelding verschijnt de duidelijk gemarkeerde lokale demo |
| Centrale `/beheer` na login | Gesloten backendmelding; geen voorbeeldritten ingevuld |
| Read-only Workerconfiguratie | APP_ORIGIN en DB aanwezig; ACCESS_ISSUER en ACCESS_AUDIENCE ontbreken |
| Andere echte identiteit, ingetrokken sessie, native iPhone | NIET GETEST; geen extra identiteit of toegang aangemaakt |
| Preview URL end-to-end | NIET GETEST; dashboard bevestigt scope, previews staan in bronconfig uit |

Alle anonieme verzoeken waren gewone GET's zonder credentials. Alleen status en redirect-host/pad zijn vastgelegd; cookies, JWT's, OAuth-parameters en persoonlijke claims zijn niet opgeslagen. De aangemelde demo toont geen bewijs van een interne accountkoppeling.

Accountbeveiliging is apart privé gecontroleerd; persoonlijke vervolgstap staat in OWNER_ACTIONS. Billing-API gaf Authentication error, maar het ingelogde dashboard toont het Free-plan. Geen billinginstelling gewijzigd. Bestaande Gateway-regels/profielen zijn gelezen en ongemoeid gelaten; algemene WARP-, DNS- of TLS-inspectie is geen onderdeel van deze appbeveiliging.

## Volgende afgebakende wijziging — toestemming nodig

Bereid de twee openbare runtimebindings hierboven voor, verifieer de gedeployde resolver en provision uitsluitend expliciet toegestane interne gebruikers met `JSON.stringify([issuer, verifiedSubject])` plus voertuiglidmaatschap. Een demo-bestuurdersnaam is geen geverifieerde identiteit. Er is geen automatische adminaanmaak voor iedere Access-login.

Pas na concrete goedkeuring van die live configuratie-/rechtenwijziging: uitvoeren en testen op juiste eigenaar, onbekende gebruiker, ingetrokken rechten en sessie. Geen nieuwe appcode publiceren of alle draftmigraties toepassen onder deze beperkte Access-toestemming. Het huidige gesloten gedrag blijft tot die stap verwacht.

Rollback alleen na expliciete eigenaaropdracht: de zojuist aangemaakte Worker-Access-koppeling wijzigen. Access uitschakelen zou publieke bereikbaarheid herstellen; dat is geen automatisch herstelplan.

Bron voor deze configuratieroute: [Cloudflare Access voor Workers](https://developers.cloudflare.com/workers/configuration/cloudflare-access/), geraadpleegd 19 oktober 2026.
