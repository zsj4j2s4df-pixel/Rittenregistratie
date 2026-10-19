# Mac ↔ Cloud: werkelijke mogelijkheden en ontvangst

Referentie `MAC-CLOUD-20261019-PR27`, 19 oktober 2026. De eigenaar heeft deze test en overdracht expliciet opgedragen.

## Feitelijk bewezen

- Bestaande taak **Cloud agent**, id `01a14d33-9ca7-7293-88b9-d7a787c7e064`, host `durable`, stond idle vóór de test.
- De bestaande send_message_to_thread-tool accepteerde één samenhangend bericht met PR #27, de exacte head, alle memo-eisen, ontwikkelcyclus en veiligheidsgrenzen.
- Readback toont dat exacte bericht als userMessage in de nieuwe Cloud-turn `01a153c4-b260-76b9-ad8b-3e4ee8dfb0ee`; threadstatus werd active/inProgress.
- Er is nog geen antwoord van de agent, noncebevestiging, tooluitvoer of teruggestuurde Mac-testopdracht waargenomen tijdens dit checkpoint.

Dus: **transport en registratie in de Cloud-taak BEVESTIGD; verwerking door de agent en automatische retoursturing NIET BEVESTIGD**. Niet claimen dat Cloud PR #27 al heeft gelezen of uitgevoerd.

De laatste afgeronde poging vóór deze test gaf “Your workspace is out of credits. Add credits to continue.” Dat verklaart die eerdere mislukking, niet automatisch de huidige actieve status. Er zijn geen credits gekocht, modellen omgewisseld of herhaalde nieuwe runs gestart. Alleen na een echte ontvangstbevestiging/uitvoeringsuitkomst de status bijwerken.

## Bestendig overdrachtskanaal

Gebruik de GitHub-branch/PR met dit document, PR27_EXECUTION_PLAN.md en het volledige memo. Een GitHub-upload is een opdracht die kan worden opgepakt, geen bewijs van automatische consumptie. Cloud moet bij hervatten eerst `MAC-CLOUD-20261019-PR27` in DEVELOPMENT_PROGRESS bevestigen en een concrete Mac-testopdracht met resultaatvelden maken. De eigenaar heeft voor deze test ook één directe terugmelding naar Mac-taak `01a15055-77ad-7963-a105-d40398e16a7f` toegestaan als de Cloud-tooling dit werkelijk kan.

Geef inhoudelijke ontwikkelopdrachten aan **Cloud agent** zodra uitvoering daar werkt. Gebruik deze Mac-taak voor lokale build-/iPhone-/Jeep-/CarPlay-/OBD2-opdrachten. Tot wederzijdse ontvangst bewezen is blijft GitHub het betrouwbare gedeelde hervatpunt; geen tweede coördinator of onbeperkte retrylus starten.

## /scale en /do

De actuele officiële desktop- en CLI-opdrachtenlijsten vermelden deze twee namen niet. De lokale CLI-help toont `cloud exec/status/list/apply/diff`, maar geen scale/do-subcommando. Geen eigen scale/do-skill of prompt aangetroffen in de beschikbare catalogus. Computer Use kan de browser bedienen, maar toegang tot de ChatGPT-app zelf werd door de tool voor veiligheid geweigerd; de slash-menucontrole is daarom **NIET GETEST** en niet via een andere UI-route omzeild.

**Conclusie: /scale en /do zijn voor deze sessie NIET AANGETOOND als ondersteunde opdrachten.** Gebruik gewone concrete prompts en opgeslagen taakgroepen. Een onbekende slash-opdracht als tekst versturen bewijst geen functie. Geen commando of automatische doorloop verzinnen.

Bronnen, geraadpleegd 19 oktober 2026: [Slash commands](https://learn.chatgpt.com/docs/reference/slash-commands), [Developer commands](https://learn.chatgpt.com/docs/developer-commands?surface=cli), [Codex Cloud](https://learn.chatgpt.com/docs/cloud). Productdocumentatie bewijst geen specifieke accounttoegang; de threadtest hierboven staat apart.
