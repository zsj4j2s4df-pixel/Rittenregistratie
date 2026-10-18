# CLOUD-005 — app-API, standaard gesloten

18 oktober2026. cloud/cloud-005-api-runtime, base server-reports/draft-PR #11. Geen externe publicatie.

Catchall app/api/vehicles/[vehicleId]/[...path]/route.ts verbindt ritten/settings/rapporten met gedeelde HTTP-adapter. DB, APP_ORIGIN, ACCESS_ISSUER en ACCESS_AUDIENCE moeten alle vier geldig via Workerbindings aanwezig zijn. Identiteit uitsluitend via cryptografisch geverifieerd Access-JWT en expliciete interne usermapping. Geen Host-/e-mailheaderfallback of demo-identiteit. Ontbrekend/ongeldig geeft generieke503/no-store; geconfigureerd maar niet geauthenticeerd geeft401. CSRF/origin/objectrechten behouden.

Node-preview ondersteunt cloudflare:workers niet: dynamische import met gesloten fallback voorkomt500opmodule-load. Workerbindings één keer per module-instantie gelezen; nieuwe configuratie vraagt herstart/redeployment, nooit requestgestuurd.

## Verificatie
105/105 Node-tests PASS (4runtimeconfigregressies); TypeScript/lint/build PASS. Build herkent API-route. Werkelijke gebouwde lokale Node-server met tests/api-closed-smoke.mjs: vier API-reads en gespooftePOST503/no-store/nosniff/generieke fout, demopagina200. Eerste statische Workerimport gaf500; opgelost en opnieuw bewezen503. Geen vooruitlopende succesclaim.
Lokale workerd/D1-smokePASS incl rapport/CSV/rollback. Gerichte onafhankelijke runtimeconfigreview: geen concrete fout; reviewer testte gebouwde Node-server niet. Fix door hoofdagent op gebouwde server gecontroleerd. Bestaande Chromium-demoregressie apart uitgevoerd; actuele uitkomst DEVELOPMENT_PROGRESS.md.

## Grenzen / volgende groep
Geen Cloudflare-app geactiveerd/gepubliceerd. Demo gebruikt nieuwe API nog niet en bewaart wijzigingen nog niet centraal. Echteproviderlogin, remoteJWKS, WorkerCPU/quotum/privacy/logoutrevocation, nativeapp en productieNIETGETEST. Volgende technische groep: web/backendadapter en voertuigselectie/centralebeheerinterface. Echte centrale end-to-endtest vraagt account-/Accessinrichting; niet alle lokale ontwikkeling geblokkeerd.
