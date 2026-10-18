# CLOUD-005 — serverritinvoer en veilige herhaling

18 oktober 2026. cloud/cloud-005-server-create, base cloud/cloud-005-server-core (draft-PR #7).

De geteste kern kan handmatige ritten aanmaken met geverifieerde actor/voertuigrechten. Server genereert rit-/mutatie-ID en tijd; route=estimated, afstand=manual, status=provisional en needs_review blijven eerlijk. Onbekende bestuurder mogelijk; opgegeven bestuurder vereist actieve toegang. De invoer mag geen GPS-bewijs, actor of ID afdwingen.

Additieve migratie 0005 voegt scoped receipts toe: (voertuig, gebruiker, requestId). Genormaliseerde aanvraag en oorspronkelijke response worden bewaard. Identieke herhaling levert dezelfde oorspronkelijke response op, ook na latere correctie. Dezelfde code met andere gegevens geeft409. Trip, receipt en create-audit zijn één D1-batchtransactie. Intrekking tussen toegangstest en batch schrijft niets. Geen destructieve migratie/live data.

## Verificatie
-65/65 Node-tests PASS (15 servicetests), TypeScript/lint/build PASS.
-Lokale workerd/D1-binding PASS: twee gelijktijdige identieke aanmaakverzoeken leveren één rit/audit; conflicterende payload409; geforceerde auditfout rolt rit én receipt terug. Geen account/deploy nodig.
-Eén onafhankelijke gerichte nacontrole op nieuwe create/idempotentielogica: geen concrete fout gevonden,15servicetests PASS. Geen volledige productieauth/securityacceptatie.
-Patroonscan en diffcontrole vóór publicatie; geen echte persoonsgegevens/GPS/geheimen.

Run dezelfde commando's als SERVER_CORE.md; D1-smoke omvat nu ook aanmaak. Nog niet publiek aangesloten: sessionprovider, HTTP/CSRF-adapter en UI-opslag/sync blijven open. Een receipt is alleen toegankelijk onder dezelfde actieve voertuig-/gebruikersscope, en geldt als oorspronkelijke aanmaakbevestiging, niet als actuele ritversie; lees de rit opnieuw voor de huidige revision.

Volgende uitvoerbare groep: providerneutrale HTTP-adapter met objectrechten en CSRF-/requestgrenzen, daarna duurzame instellingen/rapporten en UI-sync. Externe identiteit/hosting pas na OWNER_ACTIONS-keuze. Alle mastereisen behouden.
