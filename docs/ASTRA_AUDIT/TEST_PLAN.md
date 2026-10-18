# Testplan en acceptatie — concept

Datum: 18 oktober 2026. Afgeleid van REQUIREMENTS_TRACE.md. Geen tests uitgevoerd op een app: code ontbreekt. Alle onderstaande cases hebben status NIET GETEST. Dit is testontwerp, geen definitieve architectuurkeuze.

Gebruik uitsluitend synthetische locaties, accounts en ritten in tests. Leg per uitvoering commit, platform/OS/apparaat, stappen, verwachte/werkelijke uitkomst en foutbewijs vast. Numerieke drempels voor detectie, batterij en foutmarge moeten vóór de praktijktest worden gekozen op basis van een prototype; er zijn nog geen onderbouwde waarden.

| ID | Onderwerp | Concrete controle en verwacht gedrag | Uitvoering |
|---|---|---|---|
| T-01 | Oplossing en voertuig | Controleer drie clients tegen dezelfde servergegevens; vergelijk iedere getoonde voertuigspecificatie met bron/uitvoering; onbekende waarden blijven onbekend. | Integratie + broncontrole |
| T-02 | Proces en behoud | Vergelijk broninhoud vóór/na; controleer kosten/publicatiegrenzen, brondata en alle checklistpunten; model- en testclaims vragen bewijs. | Documentcontrole |
| T-03 | Accounts en rechten | Log per gebruiker in/uit; verlopen/ingetrokken sessie weigeren; alle drie dezelfde bedoelde beheerrechten; onbevoegde vierde gebruiker geen toegang; mutatie met actor/oud/nieuw/tijd. | API + integratie |
| T-04 | GPS en ritdetectie | Rij korte/lange rit, stoplicht, tussenstop/garage; scherm uit, achtergrond, energiebesparing, telefoon afwezig, permissie ingetrokken, herstart en app geforceerd beëindigd. Registreer start/einde, gaten, batterij en detectielatentie; mislukking zichtbaar. | Echte iPhone; simulator apart |
| T-05 | Meldingen | Test toestemming geweigerd/toegestaan, Focus, lockscreen en herverbindingen. Classificatieactie één keer; offline herhaling geen dubbel effect; fallback direct bereikbaar; geen gevoelige adresinhoud nodig op lockscreen. | Echte iPhone + idempotentie |
| T-06 | CarPlay | Eerst actuele categorie/entitlement/OS vastleggen. Pas daarna simulator en echte Jeep testen: toegestane template/widget/actie, geen afleiding. Zonder bewijs geen CarPlay-gereedstatus. | Broncontrole + Mac + echte auto |
| T-07 | Deduplicatie/bestuurder | Zend dezelfde waarneming herhaald en gelijktijdig vanaf drie apparaten; één definitieve rit. Test offline vertraagde upload, volgordeverschil, twee afzonderlijke vergelijkbare ritten, klokafwijking en samenvoegcorrectie. Prioriteit geeft kandidaat; tegenstrijdig bewijs blijft onzeker. | Unit + concurrency/integratie |
| T-08 | Classificatie | Geen keuze/tegenstrijdige signalen worden nooit automatisch zakelijk; privé/te controleren zichtbaar. Handmatige correctie en optionele velden behouden historie; suggestie toont reden en zekerheid. | Unit + UI + API |
| T-09 | Adressen | Toevoegen/zoeken/wijzigen/uitschakelen/verwijderen met historie; match aan/uit; gewijzigde regel herschrijft oude rit niet. Adresmatch vereist gebruikerskeuze bij onzekerheid. | Unit + integratie + rechten |
| T-10 | Routes en lijst | Test alle kolommen/filters, detail/preview en mobiel vergroten; GPS met gat naast berekende/geschatte route blijft gelabeld; geen kunstmatig GPS-segment. Mapdienst uitgevallen: ritdata en classificatie blijven bereikbaar. | UI + integratie |
| T-11 | Afstand en tarief | Synthetische ritten met nul/negatief, tellerconflict, verschillende bronsoorten, maand/kwartaal/jaargrens en zomertijd. Tariefperiode verandert nieuw rapport correct; opgeslagen oud rapport blijft reproduceerbaar; expliciete herziening apart. | Unit + integratie |
| T-12 | PDF/CSV | Ontbrekend kenteken/stand/bestuurder/classificatie/GPS waarschuwt vóór export. Test lange tabellen/adressen, paginakoppen, Unicode, lege periode, totalen/afronding, herexport en correctieversie. CSV-invoer met spreadsheetformules neutraliseren zonder bronwaarde te verliezen. | Unit + bestandinspectie + regressie |
| T-13 | Thema en bruikbaarheid | Loop alle schermen/submenu's/formulieren/tabellen/kaart/rapportvoorbeelden langs in beide thema's en klein/groot scherm; toetsenbord, VoiceOver en contrast; thema per gebruiker en sessieherstel. | UI + toegankelijkheidscontrole |
| T-14 | Naam/foto/logo | Toon gemarkeerde placeholder tot goedgekeurde foto; controleer rechtenbron en geen Jeep-merkimitatie; na naamkeuze consistentie in login/rapport/documenten. | Bron + UI |
| T-15 | Animaties | Alle zeven conceptplekken: reduced-motion en uitschakelen leveren dezelfde informatie; totalen/route/classificatie ongewijzigd; achtergrond pauzeert decoratie; schermlezer en statische fallback werken. | UI + toegankelijkheid/performance |
| T-16 | Mijn Jeep | Kentekeninstelling komt in PDF/CSV; overige technische waarden alleen met passende bron; geen illustratieve mock-upgetallen als feit. | Integratie + broncontrole |
| T-17 | OBD2 | Eerst adaptercompatibiliteit op officiële documentatie; simulator/stub voor uitval en herverbinding; echte adapter/Jeep nodig voor tellerdata, achtergrond, slaap en stroom. Geen hardware gekocht. | Unit later; hardware vereist |
| T-18 | MCP | Read-only toolset bevat geen mutatie; ontbrekend/verlopen/verkeerde doelgroep-token weigeren; backend objectrechten op iedere tool. Promptinjectie in ritdoel kan geen rechten of bevestiging omzeilen. Later schrijven vereist bevestiging gebonden aan rit/versie/waarde en audit; replay weigeren. | Contract + API/security |
| T-19 | Security en herstel | Ongeauthenticeerde en buiten-scope objectrequests weigeren; input/limieten/paginering; sessierevocatie, CSRF waar cookies gebruikt, XSS/CSV, secretscan en logredactie. Synthetische back-up terugzetten; accountverwijdering/bewaarconflict afzonderlijk toetsen. | Security + integratie/herstel |
| T-20 | Volledige regressie | Per eis werkelijk codebestand/test koppelen; unit/API/browser apart van Mac/simulator/iPhone. Fouten, overgeslagen tests en platformversies vastleggen; geen coveragepercentage zonder meting. | Gecombineerde gate |
| T-21 | Fiscale en juridische rollen | Appgebruiker, bestuurder, eigenaar, VOF-vennoot en fiscale context afzonderlijk tonen. Geen automatische werkgever-/vennootconclusie; instelling/rapport claimt geen fiscale goedkeuring. | Document + model/UI |

## Stopcriteria

Geen acceptatie bij kritieke securityfout, duplicatie van definitieve ritten, stille routevervanging, verloren auditgeschiedenis of fictieve fiscale data. Een geslaagde unit-test bewijst geen iOS-achtergrondbetrouwbaarheid. Twee onafhankelijke securityreviews blijven open; deze ene sessie telt niet als twee reviewers. Acceptatie en integratie wachten op Mac.
