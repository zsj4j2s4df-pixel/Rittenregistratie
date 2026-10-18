# CLOUD-002/004 — database-integriteit

18 oktober 2026. Eigen controle; onafhankelijke securityreview en echte D1-uitvoering blijven open.

Additieve custom Drizzle-migratie 0001_guard_trip_integrity.sql: BEFORE INSERT/UPDATE-triggers bewaken classificatie, status, route-/afstandherkomst, gehele tijdstippen, positieve tijdvolgorde en niet-negatieve eindige afstanden. Oude migratie ongewijzigd; geen tabelherbouw, verwijdering of cascade van routepunten. Journal en snapshot zijn door Drizzle gegenereerd.

Voorlopige detecties mogen nog ontbrekende eindtijd/afstand of nulafstand hebben. Opslagintegriteit is geen acceptatie als complete definitieve fiscale rit. Geen gegevens verzonnen.

## Bewijs
- 37/37 Node-tests PASS, met vijf nieuwe integriteitscases.
- Behoud van rit, routepunten en auditgeschiedenis bewezen; ongeldige insert/update geweigerd; mislukte update laat vorige rij intact.
- Oude ongeldige data wordt niet stil verwijderd: blijft zichtbaar en vraagt herleidbare correctie vóór verdere update.
- TypeScript, ESLint en webbuild PASS op bestaande dependencies; beperkte patroonscan 0 treffers, geen volledige securitygarantie.

## Voor een toekomstige echte database
Geen live migratie uitgevoerd. Eerst back-up en stagingkopie; controleer bestaande ritten op de voorwaarden uit de trigger. Corrigeer via herleidbare wijzigingen, niet automatisch verwijderen of ontbrekende waarden op nul zetten. Triggers onderzoeken historische rijen niet bij installatie. Test daarna migraties 0000/0001 op de gekozen D1-runtime met foreign keys en herstel. Nog geen aangesloten database of live-migratietoestemming.

Volgende groep CLOUD-005: rapportage/webbediening op de bestaande demo. Serverauthenticatie, centrale opslag/sync en native detectie nog niet als productie aangesloten. Alle mastereisen blijven open waar geen code/testbewijs bestaat.
