# Eisen en bewijs — CLOUD-006

Datum: 18 oktober 2026. Bronbasis: commit d37d8c913aaa253d6297cf57d3379d40c5795573.
Dit register beschrijft eisen, geen gerealiseerde functionaliteit. Alle hieronder genoemde appcode ontbreekt op de gecontroleerde basis; alle app-tests zijn NIET GETEST. Voorgestelde testcodes verwijzen naar TEST_PLAN.md. Bronhoofdstuk is de inhoudelijke verwijzing in de masterprompt. Dubbel genoemde eisen blijven in de bron behouden.

| ID | Bron § | Eis | Codebewijs | Testplan / status |
|---|---|---|---|---|
| REQ-001 | 1 — Doel, voertuig en centrale oplossing | Native iPhone-app en webinterface met centrale backend/database en synchronisatie | ONTBREEKT | T-01; NIET GETEST |
| REQ-002 | 1 — Doel, voertuig en centrale oplossing | Exacte Jeep-uitvoering/modeljaar/markt verifiëren; geen verzonnen voertuigwaarden | ONTBREEKT | T-01; NIET GETEST |
| REQ-003 | 1 — Doel, voertuig en centrale oplossing | Uitbreiding naar meer voertuigen en gebruikers mogelijk houden | ONTBREEKT | T-01; NIET GETEST |
| REQ-004 | 2 — Proces en toestemming | Onderzoek vóór bouwen; bestaande functionaliteit behouden en geen onnodige herbouw | ONTBREEKT | T-02; NIET GETEST |
| REQ-005 | 2 — Proces en toestemming | Veilige omkeerbare keuzes zelfstandig; materiële keuzes, kosten en publicatie alleen met toestemming | ONTBREEKT | T-02; NIET GETEST |
| REQ-006 | 2 — Proces en toestemming | Eerlijke scheiding automatisch/simulator/browser/echte iPhone; geen verzonnen resultaten | ONTBREEKT | T-02; NIET GETEST |
| REQ-007 | 2 — Proces en toestemming | Geen Codex-aan/uit-functie en geen onofficiële omwegen | ONTBREEKT | T-02; NIET GETEST |
| REQ-008 | 3 — Gebruikers | Dennis, Ingrid en Jesse: eigen accounts, allen beheerder en bestuurder met dezelfde beschreven rechten | ONTBREEKT | T-03; NIET GETEST |
| REQ-009 | 3 — Gebruikers | iPhone en computer ondersteunen; centrale gegevensbron | ONTBREEKT | T-03; NIET GETEST |
| REQ-010 | 3 — Gebruikers | Wijzigingen vastleggen met wie, wat, wanneer, oude en nieuwe waarde | ONTBREEKT | T-03; NIET GETEST |
| REQ-011 | 4 — Ritdetectie | GPS en beweging, aangevuld met aantoonbaar ondersteunde Bluetooth/CarPlay/OBD2-signalen | ONTBREEKT | T-04; NIET GETEST |
| REQ-012 | 4 — Ritdetectie | Automatisch starten/eindigen, vertrek/bestemming, datum/tijden, echte GPS-route en afstand | ONTBREEKT | T-04; NIET GETEST |
| REQ-013 | 4 — Ritdetectie | Tussenstops, tijdelijke GPS-uitval, onvolledige en gemiste ritten signaleren | ONTBREEKT | T-04; NIET GETEST |
| REQ-014 | 4 — Ritdetectie | Drempels/tijdscontroles; batterij en iOS-achtergrondlimieten zichtbaar | ONTBREEKT | T-04; NIET GETEST |
| REQ-015 | 4 — Ritdetectie | Telefoon afwezig, garage, korte stop, herstart, appbeëindiging en verbindingsverlies testen | ONTBREEKT | T-04; NIET GETEST |
| REQ-016 | 4 — Ritdetectie | Zonder OBD2/Bluetooth bruikbaar met GPS-terugval; zekerheid en controlebehoefte zichtbaar | ONTBREEKT | T-04; NIET GETEST |
| REQ-017 | 5 — Meldingen | Jeep-Bluetooth-melding uitsluitend waar iOS dat werkelijk toestaat; geen altijd-belofte | ONTBREEKT | T-05; NIET GETEST |
| REQ-018 | 5 — Meldingen | Lokale meldingen onderscheiden van serverpush; toestemming en Focus respecteren | ONTBREEKT | T-05; NIET GETEST |
| REQ-019 | 5 — Meldingen | Grote PRIVÉ/ZAKELIJK-keuzes met één tik; meldingsactie of direct geopend keuzescherm | ONTBREEKT | T-05; NIET GETEST |
| REQ-020 | 5 — Meldingen | Privé als voorlopige standaard; latere controle uitleggen zonder fiscale garantie | ONTBREEKT | T-05; NIET GETEST |
| REQ-021 | 5 — Meldingen | Herverbindingen ontdubbelen; fallback bij aankomst of in rittenlijst | ONTBREEKT | T-05; NIET GETEST |
| REQ-022 | 5.1 — CarPlay | Appcategorie/entitlement en actuele Apple-regels onderzoeken vóór implementatie | ONTBREEKT | T-06; NIET GETEST |
| REQ-023 | 5.1 — CarPlay | Alleen toegestane eenvoudige bediening zonder afleiding; anders iPhone-fallback | ONTBREEKT | T-06; NIET GETEST |
| REQ-024 | 6 — Bestuurder en samenvoegen | Meerdere telefoonwaarnemingen centraal samenvoegen tot één definitieve rit per voertuigbeweging | ONTBREEKT | T-07; NIET GETEST |
| REQ-025 | 6 — Bestuurder en samenvoegen | Dennis → Ingrid → Jesse als instelbare kandidaat-tie-breaker; nooit bewijs van bestuurder | ONTBREEKT | T-07; NIET GETEST |
| REQ-026 | 6 — Bestuurder en samenvoegen | Bij onzekerheid bevestiging of bestuurder onbekend met zichtbare zekerheid | ONTBREEKT | T-07; NIET GETEST |
| REQ-027 | 6 — Bestuurder en samenvoegen | Voorlopige detectie, voorlopige rit en definitieve rit apart modelleren | ONTBREEKT | T-07; NIET GETEST |
| REQ-028 | 6 — Bestuurder en samenvoegen | Tijd, route, voertuig en beschikbare signalen gebruiken; herhaalde inzending idempotent verwerken | ONTBREEKT | T-07; NIET GETEST |
| REQ-029 | 6 — Bestuurder en samenvoegen | Samenvoeg- en wijzigingshistorie controleerbaar bewaren | ONTBREEKT | T-07; NIET GETEST |
| REQ-030 | 7 — Classificatie | Zakelijk/privé/te controleren; onzekerheid nooit automatisch zakelijk | ONTBREEKT | T-08; NIET GETEST |
| REQ-031 | 7 — Classificatie | Eén tik achteraf corrigeren met historie; geen ritdoel of fiscale waarde verzinnen | ONTBREEKT | T-08; NIET GETEST |
| REQ-032 | 7 — Classificatie | Optionele doel/klant/toelichting; reden en zekerheid van suggestie tonen | ONTBREEKT | T-08; NIET GETEST |
| REQ-033 | 7.1 — Voorkeursadressen | Instellingen: toevoegen, wijzigen, uitschakelen, verwijderen, zoeken en zo mogelijk kaartkeuze | ONTBREEKT | T-09; NIET GETEST |
| REQ-034 | 7.1 — Voorkeursadressen | Herkenbare naam en optionele toelichting; match is aanwijzing met benoemde regel, geen bewijs | ONTBREEKT | T-09; NIET GETEST |
| REQ-035 | 7.1 — Voorkeursadressen | Suggestie accepteren/wijzigen; conflict privé-eerst; regelversie/correctiehistorie bewaren | ONTBREEKT | T-09; NIET GETEST |
| REQ-036 | 7.1 — Voorkeursadressen | Adres- en locatiegegevens beveiligen | ONTBREEKT | T-09; NIET GETEST |
| REQ-037 | 8 — Lijst, kaarten en routes | Lijst: datum/tijden, vertrek/bestemming, afstand, classificatie, bestuurder/zekerheid en kaartpreview | ONTBREEKT | T-10; NIET GETEST |
| REQ-038 | 8 — Lijst, kaarten en routes | Filters periode, bestuurder, classificatie; voertuig voorbereid voor later | ONTBREEKT | T-10; NIET GETEST |
| REQ-039 | 8 — Lijst, kaarten en routes | Detailkaart met start/einde, route, stops, tijden, afstand en beschikbare tellerstanden | ONTBREEKT | T-10; NIET GETEST |
| REQ-040 | 8 — Lijst, kaarten en routes | Classificatie vanuit lijst/detail; passende Open in Apple Kaarten-optie | ONTBREEKT | T-10; NIET GETEST |
| REQ-041 | 8 — Lijst, kaarten en routes | GPS-route, achteraf berekende route en geschatte afstand apart benoemen | ONTBREEKT | T-10; NIET GETEST |
| REQ-042 | 8 — Lijst, kaarten en routes | Geen stilzwijgende routevervanging; waarschuwing bij gaten; compact/vergroten op mobiel | ONTBREEKT | T-10; NIET GETEST |
| REQ-043 | 9 — Kilometers en tarief | Totalen privé/zakelijk per bestuurder, maand, kwartaal en jaar | ONTBREEKT | T-11; NIET GETEST |
| REQ-044 | 9 — Kilometers en tarief | Instelbaar historisch tarief; latere tariefwijziging verandert oud rapport niet ongemerkt | ONTBREEKT | T-11; NIET GETEST |
| REQ-045 | 9 — Kilometers en tarief | Actuele regels verifiëren; geen hardcoded voorbeeldtarief | ONTBREEKT | T-11; NIET GETEST |
| REQ-046 | 9 — Kilometers en tarief | GPS, kilometerteller, handmatig en automatisch als herkomst onderscheiden | ONTBREEKT | T-11; NIET GETEST |
| REQ-047 | 10 — Rapportage | Actuele Belastingdienst-eisen scheiden van aanbevelingen en opties; geen fiscale goedkeuring claimen | ONTBREEKT | T-12; NIET GETEST |
| REQ-048 | 10 — Rapportage | Voertuig/kenteken uit Instellingen automatisch in PDF/CSV; waarschuwing bij ontbrekend kenteken | ONTBREEKT | T-12; NIET GETEST |
| REQ-049 | 10 — Rapportage | Waar van toepassing bestuurder/periode/datum/tijden/adressen/tellerstanden/afstand/classificatie/doel/stops | ONTBREEKT | T-12; NIET GETEST |
| REQ-050 | 10 — Rapportage | Ontbrekende/gecorrigeerde gegevens, totalen, toegepast tarief en berekening zichtbaar | ONTBREEKT | T-12; NIET GETEST |
| REQ-051 | 10 — Rapportage | Ontbrekende tellerstanden/adressen/doelen niet fabriceren; aanvullen ondersteunen | ONTBREEKT | T-12; NIET GETEST |
| REQ-052 | 10 — Rapportage | PDF met paginanummers, herhaalde kolomkoppen, geen afgekapt lange inhoud; CSV met ritdetails | ONTBREEKT | T-12; NIET GETEST |
| REQ-053 | 10 — Rapportage | Periodeoverzicht, ritdetails en rapport per bestuurder; extra exportopties onderzoeken | ONTBREEKT | T-12; NIET GETEST |
| REQ-054 | 10 — Rapportage | Vóór export waarschuwen voor dubbelen, ontbrekende standen, onlogische tijd, negatieve afstand, onbekende bestuurder/classificatie en GPS-gaten | ONTBREEKT | T-12; NIET GETEST |
| REQ-055 | 10 — Rapportage | Controleerbare wijzigingshistorie behouden | ONTBREEKT | T-12; NIET GETEST |
| REQ-056 | 11.1 — Vormgeving | Premium, rustig en functioneel; mobiel grote bediening en responsive op tablet/computer | ONTBREEKT | T-13; NIET GETEST |
| REQ-057 | 11.2 — Thema's | Instellingen Donker/Licht zandkleurig; Automatisch alleen indien passend gekozen | ONTBREEKT | T-13; NIET GETEST |
| REQ-058 | 11.2 — Thema's | Themakeuze overal inclusief submenu's, formulieren, rapportvoorbeelden en kaarten waar ondersteund | ONTBREEKT | T-13; NIET GETEST |
| REQ-059 | 11.2 — Thema's | Voorkeur per gebruiker met uitgelegde synchronisatie; contrast/leesbaarheid in beide thema's | ONTBREEKT | T-13; NIET GETEST |
| REQ-060 | 11.2 — Thema's | Geen onverwachte kleurwissel; donker antraciet/zilver/groen, licht zand/crème/taupe/antraciet | ONTBREEKT | T-13; NIET GETEST |
| REQ-061 | 11.3 — Mock-ups | Mock-ups uitsluitend visuele richting; geen bewijs van werkende app of technische haalbaarheid | ONTBREEKT | T-13; NIET GETEST |
| REQ-062 | 11.3 — Mock-ups | Geen ongeautoriseerd Jeep-logo/woordmerk; gegenereerde auto niet als echte foto | ONTBREEKT | T-13; NIET GETEST |
| REQ-063 | 11.3 — Mock-ups | Illustratieve plaatsen, datums, tarief en voertuigspecificaties niet als feit gebruiken | ONTBREEKT | T-13; NIET GETEST |
| REQ-064 | 11.3 — Mock-ups | TrailLog is conceptnaam; mock-up-CarPlay-knoppen blijven voorwaardelijk | ONTBREEKT | T-13; NIET GETEST |
| REQ-065 | 11.4 — Hoofdfoto | Foto juiste uitvoering met herkomst/licentie/rechten; Jesse levert later eigen foto | ONTBREEKT | T-14; NIET GETEST |
| REQ-066 | 11.4 — Hoofdfoto | Tot dan gemarkeerde placeholder; foto schaalt zonder ritinformatie te verdringen | ONTBREEKT | T-14; NIET GETEST |
| REQ-067 | 11.5 — Naam en logo | Vijf professionele naamopties met korte uitleg en onderzoek naar bestaand gebruik/domein zonder juridische claim | ONTBREEKT | T-14; NIET GETEST |
| REQ-068 | 11.5 — Naam en logo | Jesse kiest definitief; naam consequent in app/logo/login/rapport/documentatie; eigen logo | ONTBREEKT | T-14; NIET GETEST |
| REQ-069 | 11.6 — Animaties | Subtiel sober antraciet/graniet/zilver/beperkt amber; functionaliteit en veiligheid voorop | ONTBREEKT | T-15; NIET GETEST |
| REQ-070 | 11.6 — Animaties | Loginillustratie: detecteren → route → classificeren → rapport; login blijft voorgrond en data is illustratief | ONTBREEKT | T-15; NIET GETEST |
| REQ-071 | 11.6 — Animaties | Concepten voor detectie, route, classificatieovergang, maandtotaal, exportladen en lege staat | ONTBREEKT | T-15; NIET GETEST |
| REQ-072 | 11.6 — Animaties | Animatie verandert nooit opgeslagen route, definitieve classificatie of echte berekende totalen | ONTBREEKT | T-15; NIET GETEST |
| REQ-073 | 11.6 — Animaties | Voorkeur lichte CSS/SVG; bibliotheeklicentie/grootte/compatibiliteit/onderhoud toetsen | ONTBREEKT | T-15; NIET GETEST |
| REQ-074 | 11.6 — Animaties | Reduced-motion, schermlezer, statische fallback en uitschakelen; geen info alleen in kleur/beweging | ONTBREEKT | T-15; NIET GETEST |
| REQ-075 | 11.6 — Animaties | Geen flitsen/afleiding, pauzeren op achtergrond; vooraf klein visueel concept met plaats/techniek | ONTBREEKT | T-15; NIET GETEST |
| REQ-076 | 12.1 — Mijn Jeep | Geverifieerde merk/model/uitvoering/jaar, kenteken, maten/wielbasis en motor/vermogens/koppel | ONTBREEKT | T-16; NIET GETEST |
| REQ-077 | 12.1 — Mijn Jeep | Brandstof/PHEV/transmissie/aandrijving/trekgewicht/bodemvrijheid/waden/offroadhoeken alleen verifieerbaar | ONTBREEKT | T-16; NIET GETEST |
| REQ-078 | 12.1 — Mijn Jeep | Bluetooth/CarPlay/OBD2-info met bron en motor/markt/uitvoering-afhankelijkheid; geen verzonnen data | ONTBREEKT | T-16; NIET GETEST |
| REQ-079 | 12.2 — OBD2 | Geen adapter gekocht en geen aankoop zonder toestemming; uitbreidbare adapterlaag | ONTBREEKT | T-17; NIET GETEST |
| REQ-080 | 12.2 — OBD2 | OBDLink CX/MX+, Vgate iCar Pro 2S/4.0 BLE, Veepeak OBDCheck BLE+ zijn onderzoekskandidaten | ONTBREEKT | T-17; NIET GETEST |
| REQ-081 | 12.2 — OBD2 | Vergelijk iOS/protocol/Jeep/data/achtergrond/slaap/stroom/security/kosten/licentie | ONTBREEKT | T-17; NIET GETEST |
| REQ-082 | 12.2 — OBD2 | Officiële tellerstand en gewenste data niet veronderstellen; hardwarepraktijktest vereist | ONTBREEKT | T-17; NIET GETEST |
| REQ-083 | 13 — MCP | Beveiligde remote HTTPS-MCP-laag boven dezelfde backend; geen extra databases of dubbele bedrijfslogica | ONTBREEKT | T-18; NIET GETEST |
| REQ-084 | 13 — MCP | Copilot eerst onderzoeken; daarna ChatGPT en Claude alleen waar platform/account/plan ondersteunt | ONTBREEKT | T-18; NIET GETEST |
| REQ-085 | 13 — MCP | Consumenten-Copilot onderscheiden van Microsoft 365 Copilot en werkgeverkoppeling niet aannemen | ONTBREEKT | T-18; NIET GETEST |
| REQ-086 | 13 — MCP | Officieel ondersteunde OAuth-flow; backend autoriseert per gebruiker, nooit het model | ONTBREEKT | T-18; NIET GETEST |
| REQ-087 | 13 — MCP | Eerst read-only search_trips/get_trip_details/get_trip_summary/list_business_addresses/generate_trip_report/validate_trip_log | ONTBREEKT | T-18; NIET GETEST |
| REQ-088 | 13 — MCP | suggest_trip_classification levert voorstel met uitleg/onzekerheid | ONTBREEKT | T-18; NIET GETEST |
| REQ-089 | 13 — MCP | update_trip_classification uitsluitend met expliciete bevestiging, backend-rechten en auditlog | ONTBREEKT | T-18; NIET GETEST |
| REQ-090 | 13 — MCP | Geen definitieve fiscale wijzigingen/verwijderingen zonder bevestiging; minste rechten | ONTBREEKT | T-18; NIET GETEST |
| REQ-091 | 13 — MCP | Geen directe DB-omweg; minimale logging; geen geheimen in frontend/prompts/Git/logs | ONTBREEKT | T-18; NIET GETEST |
| REQ-092 | 13 — MCP | TypeScript/SDK/Cloudflare zijn kandidaten; compatibiliteit/auth/kosten/limieten onderzoeken; één platform eerst | ONTBREEKT | T-18; NIET GETEST |
| REQ-093 | 14 — Beveiliging en infrastructuur | Veilige authenticatie/sessies, passkeys waar ondersteund, platformbiometrie en optionele MFA | ONTBREEKT | T-19; NIET GETEST |
| REQ-094 | 14 — Beveiliging en infrastructuur | TLS en server-side autorisatie op iedere actie; geheimen server-side | ONTBREEKT | T-19; NIET GETEST |
| REQ-095 | 14 — Beveiliging en infrastructuur | Locatie/adressen/routes afschermen, minimale data, auditlog, back-up/herstel, bewaartermijnen, accountverwijdering | ONTBREEKT | T-19; NIET GETEST |
| REQ-096 | 14 — Beveiliging en infrastructuur | Kritieke kwetsbaarheden vóór gereed oplossen; onafhankelijke reviews waar mogelijk, beperking eerlijk melden | ONTBREEKT | T-19; NIET GETEST |
| REQ-097 | 14 — Beveiliging en infrastructuur | Native achtergrondregistratie onderzoeken; web alleen is daarvoor niet vanzelf voldoende | ONTBREEKT | T-19; NIET GETEST |
| REQ-098 | 14 — Beveiliging en infrastructuur | Installatie/updates voor drie iPhones: toegestane Apple-routes, kosten/certificaten/verlenging en herinstallatielast | ONTBREEKT | T-19; NIET GETEST |
| REQ-099 | 14 — Beveiliging en infrastructuur | Web: login, bekijken/corrigeren/classificeren, kaarten, adressen, rapport/export, gebruikers/instellingen/sync | ONTBREEKT | T-19; NIET GETEST |
| REQ-100 | 14 — Beveiliging en infrastructuur | Datamodel: gebruikers/rechten, voertuigen/detecties/ritten/bestuurders/GPS/locaties/classificaties/standen/tarieven/rapporten/correcties/audit | ONTBREEKT | T-19; NIET GETEST |
| REQ-101 | 14 — Beveiliging en infrastructuur | Apparaten/OBD2/adressen/instellingen/prioriteitsregels, relaties/integriteit/deduplicatie/historie/migraties | ONTBREEKT | T-19; NIET GETEST |
| REQ-102 | 14 — Beveiliging en infrastructuur | Tools/integraties vergelijken op functie/compatibiliteit/kosten/licentie/betrouwbaarheid/security/rechten/onderhoud; geen ongeautoriseerde koppeling | ONTBREEKT | T-19; NIET GETEST |
| REQ-103 | 15 — Kwaliteit | Concreet testplan voor alle beschreven flows inclusief uitval, fouten en regressies | ONTBREEKT | T-20; NIET GETEST |
| REQ-104 | 15 — Kwaliteit | Echte iPhones waar mogelijk; simulatie/hardwareblokkades apart melden; geen verzonnen bewijs | ONTBREEKT | T-20; NIET GETEST |
| REQ-105 | 16 — Onderzoeksuitvoer | Officiële actuele bronnen met datum; haalbaarheid A technisch/B voorwaarden/C praktijk/D niet ondersteund | ONTBREEKT | T-02; NIET GETEST |
| REQ-106 | 16 — Onderzoeksuitvoer | Scopevoorstel MVP/later/onderzoek/mogelijk niet haalbaar met redenen, zonder wensen te schrappen | ONTBREEKT | T-02; NIET GETEST |
| REQ-107 | 16 — Onderzoeksuitvoer | Samenvatting, specificatieanalyse, conflicten, risico's, architectuur, security/privacy, MCP/iOS/CarPlay en kosten | ONTBREEKT | T-02; NIET GETEST |
| REQ-108 | 16 — Onderzoeksuitvoer | Alleen nodige vragen; zelfstandige bouwprompt, behoudcontrole en bronnen; geen fictieve Claude-review | ONTBREEKT | T-02; NIET GETEST |
| REQ-109 | 17 — Bouwvolgorde | Repository eerst; plan en goedgekeurde MVP; kleine fases met acceptatie, tests, regressies en security | ONTBREEKT | T-02; NIET GETEST |
| REQ-110 | 17 — Bouwvolgorde | Alle twaalf bouwfasen bewaren, inclusief onderzoek, architectuur, basis, GPS, deduplicatie, adressen, kaarten, Jeep/OBD2, export, MCP, QA en installatie | ONTBREEKT | T-02; NIET GETEST |
| REQ-111 | 17 — Bouwvolgorde | Eindrapport scheidt gebouwd/getest/afhankelijkheden/risico's/kosten; alle voorwaardelijke eindwensen behouden | ONTBREEKT | T-02; NIET GETEST |
| REQ-112 | 18 — Intake | Technische feiten zelf onderzoeken; alleen persoonlijke voorkeuren/besluiten vragen; veilige omkeerbare standaarden | ONTBREEKT | T-02; NIET GETEST |
| REQ-113 | 19 — Behoudcontrole | Alle 26 checklistpunten behouden; een vinkje betekent documentdekking volgens bron, geen geslaagde app-test | ONTBREEKT | T-02; NIET GETEST |
| REQ-114 | 20 — Bronhistorie | Historische bronverwijzingen bewaren; ontbrekende losse mock-ups/Excel/gesprekken niet als gelezen claimen | ONTBREEKT | T-02; NIET GETEST |
| REQ-115 | 21 — Context | Dennis privé-eigenaar; VOF met Dennis en oma genoemd; moeder/oom-rol onbevestigd | ONTBREEKT | T-21; NIET GETEST |
| REQ-116 | 21 — Context | Appgebruiker/bestuurder/eigenaar/vennoot apart; fiscale behandeling onderzoeken | ONTBREEKT | T-21; NIET GETEST |
| REQ-117 | 21 — Context | Cloudflare niet bevestigd; Copilot via werkgever geen toestemming; actuele Sol-regie toepassen | ONTBREEKT | T-21; NIET GETEST |
| REQ-118 | 22 — Persoonlijke acties | OWNER_ACTIONS alleen noodzakelijke persoonlijke stappen, bestaande nummers/historie behouden; Tool Scout eerst gratis/bestaand | ONTBREEKT | T-02; NIET GETEST |
| REQ-119 | 22 — Persoonlijke acties | Operator onderhoudt namens Sol; technische/model/controlewerkzaamheden blijven bij agents | ONTBREEKT | T-02; NIET GETEST |
| REQ-120 | laatste procesafspraak — Regie | Sol dagelijks, Astra alleen zwaarwegende besluiten; Mac coördineert/integreert/accepteert, Cloud levert afgebakende PR's | ONTBREEKT | T-02; NIET GETEST |
| REQ-121 | laatste procesafspraak — Regie | Lichtste geschikt beschikbare model; geen onnodige parallelle agents; selecteerbare redeneerinstelling controleren | ONTBREEKT | T-02; NIET GETEST |
| REQ-122 | laatste procesafspraak — Regie | Twee onafhankelijke securityreviews blijven vereist; geen automatische modelrouting/usage-grens claimen | ONTBREEKT | T-02; NIET GETEST | 
| REQ-123 | 0 — Algemene spelregels | Helder Nederlands; alle wensen behouden; veranderlijke feiten met actuele officiële bron/datum; feit/aanname/onderzoek scheiden; geen onbewezen uitvoering of fiscale garantie | Procescontrole in documentreview | T-02; documentcontrole uitgevoerd, app NIET GETEST |

## Controle van behoud

De volledige originele broninhoud blijft in de bijgewerkte masterprompt staan; uitsluitend een actuele leeswijzer is toegevoegd. Hoofdstuk 19 blijft ongewijzigd met 26 ongevinkte bronchecklistregels. Het register omvat functionele eisen én proces-/onderzoeksvoorwaarden. Samengestelde eisen moeten bij implementatie worden gesplitst in afzonderlijke testasserties. Dit document is geen automatische volledigheidsgarantie: de Mac-review blijft open.
