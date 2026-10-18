# Aanvulling op bestaand eisenregister — geen vervanging

18 oktober 2026. Het Cloudregister met 123 REQ-ID's en 21 T-ID's blijft behouden. Hieronder uitsluitend nieuw codebewijs; deelbewijs maakt een samengestelde eis/testcase niet AFGEROND.

| Bestaande eisen / test | Nieuw bewijs | Beperking |
|---|---|---|
| REQ-010/029/031/055, T-03/08 | app/trip-domain.ts, trip-editor.tsx; before/after, reden, revisiecontrole | Alleen browserstate; geen serveraudit of sync |
| REQ-024–028, T-07 | lib/access-policy.ts; overlap/driverconflict-tests | Signaal voor review, geen centrale definitieve deduplicatie |
| REQ-030–032, T-08 | Classificatie/ritcorrectie; controles en geen automatische zakelijke keuze | Geen native meldingsflow |
| REQ-037/038, T-10 | app/page.tsx; datum-, bestuurder- en classificatiefilters | UI-browsercontrole laatste wijzigingen NIET GETEST |
| REQ-041/042/063, T-10/13 | Demo-/routewaarschuwingen; geen echte GPS-claims | Geen geregistreerde of berekende routekaart |
| REQ-049/051/054, T-11/12 | validateTrip/validateLog, tellerstanden en tijd/afstandcontroles | Geen actuele fiscale volledigheidsacceptatie |
| REQ-052, T-12/19 | trip-utils CSV-escaping/formuleprefixen; exportwaarschuwing | Alleen demo-CSV, geen PDF of spreadsheetimporttest |
| REQ-056–060, T-13 | Donker/zand-CSS, responsive opzet, focusstyles | Laatste visuele test geweigerd; geen volledige a11yacceptatie |
| REQ-065/066, T-14 | SVG-placeholder in overdracht | Originele privéfoto bewust niet gepubliceerd |
| REQ-093/094, T-03/19 | canAccessVehicle, negatieve beleidstests | Geen aangesloten authenticatie/API; headerhelper ongebruikt |
| REQ-100/101, T-19 | db/schema, SQL-migratie; in-memory SQLite-tests | Schema mist integriteitsdelen; geen echte DB-migratie uitgevoerd |
| REQ-103/104, T-20 | tests/*.test.mjs: 31 tests; scripts | Macbewijs opnieuw uitvoeren in Cloud; geen coverageclaim |
| REQ-120/121/122, T-02 | AGENTS, CLOUD_HANDOVER, nieuwe gebruikersbesluiten | Oude Mac-hoofdrol vervangen; onafhankelijke reviewers nog niet gelukt |

Alle overige functionaliteit blijft volgens bron/eisenregister open, ook wanneer er ontwerpdocumentatie is. Gate B: Mac heeft structuur, afhankelijkheden, historie en geselecteerde inhoud gecontroleerd; geen complete fiscale/architectuuracceptatie of merge verleend.
