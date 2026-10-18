# Voorbereidende inventaris voor CLOUD-005

> **Overdrachtupdate 18 oktober 2026:** de Mac-code en tests zijn nu op de overdrachtsbranch aangeleverd. Onderstaande nulmeting blijft historie; 'code ontbreekt' geldt voor de toen gecontroleerde basis, niet deze branch. Actuele status: [DEVELOPMENT_PROGRESS](../../DEVELOPMENT_PROGRESS.md), codebewijs: [MAC_CODE_MAPPING](../TRANSFER/MAC_CODE_MAPPING.md). Bestaande eisen-/test-ID's blijven behouden; geen volledige testcase of onafhankelijke review wordt hiermee alsnog geslaagd verklaard. Cloud leidt de ontwikkeling, eigenaar beslist over merges.

Status: concept, geen toegewezen implementatietaken. Geen bestaande backend/webcode beschikbaar.
Eerst toepasselijke gates, bestaande stack en code beoordelen. Geen provider, database, API-pad of framework gekozen.
Iedere later toegewezen taak krijgt eigen CLOUD-nummer, afgebakende bestanden, branch, kosteninschatting en PR.

| Kandidaat | Bron/eisen | Mogelijke kleine scope na code-inspectie | Acceptatie/test | Afhankelijkheid en security |
|---|---|---|---|---|
| Inzending ontdubbelen | Master §6; T-07 | Bestaande detectie-endpoint idempotent maken | Zelfde inzending/retry/parallelle upload → één effect; andere rit niet fout samenvoegen | Bestaande identiteit, transactie en datamodel; objectrechten |
| Classificatiehistorie | §7; T-08 | Bestaande correctieflow versiecontrole geven | Oud/nieuw/actor/tijd correct; stale versie zichtbaar conflict | Rechten en auditmodel; geen stil overschrijven |
| Historische tarieven | §9; T-11 | Bestaande rapportberekening reproduceerbaar maken | Tariefgrens, afronding en opgeslagen oud rapport blijven juist | Fiscale context en rapportversie; geen hardcoded tarief |
| Exportvalidatie | §10; T-12 | Bestaande PDF/CSV-warningflow verbeteren | Ontbrekend kenteken/stand en onlogische data benoemd; lange inhoud intact | Geen fiscale garanties; CSV-formules/markup veilig |
| Routeherkomst | §8; T-10 | Bestaande ritdetailweergave labels/gaten laten tonen | GPS/berekend/geschat gescheiden, geen stille routevervanging | Geen extra data naar kaartprovider zonder onderzoek |
| Read-only MCP | §13; T-18 | Na backendkeuze één lees-tool contract implementeren | Token/objectrechten en begrensde output; geen mutaties | Eerst gekozen platform en auth; geen externe koppeling gestart |

Usage, exacte bestanden, branch en werkelijke tests zijn nog onbekend. CLOUD-005 blijft BACKLOG totdat code en architectuur bekend zijn. Deze inventaris voorkomt dat ontbreken van code wordt omgezet in ongeautoriseerde herbouw.
