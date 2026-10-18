# Overdracht aan de Mac-agent — RitKompas

Datum: 18 oktober 2026. Repository: uitsluitend zsj4j2s4df-pixel/Rittenregistratie.
Doel: Cloud-documentatie controleren en gericht verwerken in de bestaande Mac-projectdocumentatie.
Dit bestand bevat geen toestemming voor automatische merge, publicatie, nieuwe kosten of externe koppelingen.

## Bron en reviewvolgorde

- [PR #1 — CLOUD-001, eerste inventaris en documentaudit](https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/1)
- [PR #2 — CLOUD-006, vervolgdocumentatie](https://github.com/zsj4j2s4df-pixel/Rittenregistratie/pull/2)
- Werkbranch met beide resultaten: `cloud/cloud-006-documentatie`.
- Documentbasis vóór deze overdracht: commit `8a57f98d6efa6bbb5e6400e2dac4857b7a33226e`.
- PR #2 heeft de CLOUD-001-branch als base. Beoordeel #1 eerst; richt #2 daarna op main en controleer de uiteindelijke diff. Niet beide PR's blind kopiëren of samenvoegen.

## Leesvolgorde

1. [Voortgang en controlebewijs](docs/ASTRA_AUDIT/PROGRESS.md)
2. [Inventaris en beperkingen](docs/ASTRA_AUDIT/INVENTARIS.md)
3. [Documentbevindingen](docs/ASTRA_AUDIT/DOCUMENT_REVIEW.md)
4. [Besluiten en open punten](docs/ASTRA_AUDIT/DECISIONS.md)
5. [123 eisen en procesvoorwaarden](docs/ASTRA_AUDIT/REQUIREMENTS_TRACE.md)
6. [21 concrete testscenario's](docs/ASTRA_AUDIT/TEST_PLAN.md)
7. [Haalbaarheid, kosten en 18 officiële bronnen](docs/ASTRA_AUDIT/FEASIBILITY_RESEARCH.md)
8. [Securityvoorcontrole](docs/ASTRA_AUDIT/SECURITY_PRECHECK.md)
9. [Code-auditblokkade](docs/ASTRA_AUDIT/CODE_AUDIT.md)
10. [Voorbereidende backend/webtaken](docs/ASTRA_AUDIT/BACKEND_WEB_CANDIDATES.md)
11. [Cloud-taken](CLOUD_TASKS.md) en [persoonlijke acties](OWNER_ACTIONS.md)

Lees daarnaast de vier oorspronkelijke projectdocumenten met hun toegevoegde leeswijzers. Die oorspronkelijke broninhouden zijn exact behouden; er is geen functionele eis stil verwijderd.

## Wat gecontroleerd is

- Alle 17 gewijzigde/toegevoegde documenten teruggelezen via GitHub en exact vergeleken.
- Vier oorspronkelijke broninhouden behouden.
- 123 unieke eisen-ID's, gekoppeld aan 21 bestaande testscenario-ID's.
- 26 interne documentlinks gecontroleerd en 26 oorspronkelijke ongevinkte behoudregels intact.
- Officiële onderzoeksbronnen met raadpleegdatum; ontoegankelijke details benoemd.
- ACT-001 gemarkeerd VERVALLEN met behoud van historie: bestaande code overdragen is agentwerk, geen noodzakelijke persoonlijke actie.
- Geen applicatiecode, builds, unit-tests, simulator-, iPhone-, CarPlay- of OBD2-tests uitgevoerd. Geen twee onafhankelijke securityreviews geclaimd.

## Veilig ophalen op de Mac

Controleer eerst de projectmap, `git status --short` en `git remote -v`. Verifieer dat origin naar deze repository verwijst. Overschrijf geen lokale wijzigingen; gebruik zo nodig een aparte worktree voor review.

Na controle kan de branch veilig worden opgehaald zonder de werkboom te veranderen:

```sh
git fetch origin cloud/cloud-001-documentatie-audit cloud/cloud-006-documentatie
git show origin/cloud/cloud-006-documentatie:MAC_HANDOVER.md
git diff origin/main...origin/cloud/cloud-006-documentatie -- '*.md'
```

De diff vergelijkt met de opgehaalde origin/main; haal die zo nodig ook op. Gebruik geen reset, force push of automatische checkout over een gewijzigde werkboom.
Deze commando's zijn overdrachtsinstructies; Cloud heeft ze niet op de Mac uitgevoerd.

## Controle en verwerking

- Vergelijk met de werkelijke lokale documentatie en bestaande besluiten; deze Cloud-sessie kon de Mac-map niet zien.
- Controleer eerst of de volledige wensen uit de masterprompt juist en voldoende gedetailleerd in het eisenregister zijn overgenomen. Een telling is geen onafhankelijke inhoudelijke goedkeuring.
- Beoordeel de testscenario's en splits samengestelde eisen bij implementatie in concrete asserts.
- Hercontroleer tijdgevoelige bronnen vóór een architectuur-, fiscale, installatie- of kostenbeslissing.
- Behoud originele wensen, ACT-/CLOUD-nummers, historie en lokale aanvullingen. Verwerk gericht; vervang de Mac-documentatie niet blind door het downloadpakket.
- Koppel bevindingen aan bestaande voortgangs-/besluitdocumenten. Registreer afwijkingen en materiële voorstellen apart.
- De fiscale toepasselijkheid, voorgestelde privé-omrijkilometers, onbekende VOF-rollen, hosting/authenticatie, appnaam en distributie zijn niet door Cloud besloten.
- Markeer CLOUD-001/006 pas AFGEROND na daadwerkelijke controle en acceptatie; leg commit en reviewbewijs vast.
- Controleer daarna of bestaande appcode veilig op GitHub kan worden aangeleverd zonder geheimen of echte ritdata. Hervat CLOUD-002/003/004 pas met echte code en toepasselijke gates.

## Open blokkades

Bestaande appcode ontbreekt op de gecontroleerde GitHub-main. Lokale Mac-architectuur en wijzigingen zijn onbekend. Gate B-acceptatie staat open; FASE C–E is niet gestart. Geen automatische merge of deploy.
