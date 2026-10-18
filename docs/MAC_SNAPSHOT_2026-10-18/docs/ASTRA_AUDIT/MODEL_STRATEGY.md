# Fase C — rollen en reviews

17 oktober 2026. Centrale coördinator blijft aanspreekpunt en vervult voorlopig documentatie, Operator, Tool Scout, UX, web/backend en QA. Architectuur/iOS/GPS/fiscaliteit worden als aparte taakgebieden behandeld; nog geen afzonderlijke uitvoering daarvan geclaimd. Maximaal beschikbare agentslots worden gerespecteerd; rollen hoeven niet permanent een agent te bezetten.

| Taak | Eigenaar / model | Reden | Controle en acceptatie | Kosten/limieten |
|---|---|---|---|---|
| Lokale correcties en tests | Centrale coördinator / geërfd model | Bestaande context behouden | Reproduceerbare tests; reviews hieronder | Bestaande sessie, geen abonnement/installatie; exacte verbruikskosten onbekend |
| Security 1: dreigingsmodel/auth/data | security_auth / gpt-6-astra | Kritieke beoordeling conform opdracht | Bewijs per bestand, geen aannames als exploit; coördinator verwerkt | Beschikbaar volgens toolcatalogus; verbruik onbekend |
| Security 2: implementatie/export/misbruik | security_integrity / gpt-6-astra | Onafhankelijke kritieke controle | Eigen inspectie, geen inzage in review 1 vooraf; coördinator verwerkt | Zelfde grenzen |

Geen hoofdmodelwissel geclaimd. Reviewers krijgen dezelfde codebasis maar geen elkaars conclusies. Ze wijzigen geen appcode en doen geen installaties, accounts, deployments of externe koppelingen. Resultaten worden pas na ontvangst als uitgevoerd geregistreerd. Kritieke tekortkomingen blokkeren productieacceptatie, niet lokale correcties aan een demo.

Uitkomst 17 oktober: beide agentaanroepen aangemaakt, maar beide uitvoeringen gefaald wegens kredietlimiet vóór review. Dus **geen onafhankelijke review**. Alternatief: centrale statische inspectie plus reproduceerbare tests in CODE_AUDIT en TESTS_2026-10-17; nadrukkelijk geen vervanging van onafhankelijke acceptatie. Geen herhaalde pogingen, aankoop of verzonnen modelbesparing. Geen persoonlijke actie vereist voor de huidige lokale correcties.
