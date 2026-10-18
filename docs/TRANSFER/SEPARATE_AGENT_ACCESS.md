# Aparte agenttoegang — uitvoerbaar plan, nog niet ingericht

18 oktober 2026. De eigenaar heeft opdracht gegeven voor aparte agenttoegang. De keuze hoeft niet opnieuw bevestigd te worden; de beschikbare connector kan de vereiste identiteitswissel niet uitvoeren. Deze opdracht is geen bewijs dat de identiteit of beveiliging al is ingericht. Alleen onderzoek en dit document zijn uitgevoerd; geen account, App, secret, koppeling of repositoryinstelling gewijzigd.

## Huidige bewijsgrens

Volgens de eerdere read-only API-controle in [MAIN_SECURITY_CHECK.md](MAIN_SECURITY_CHECK.md) gebruikt de connector eigenaaridentiteit `zsj4j2s4df-pixel` (296047649). De actieve main-ruleset vereiste toen nul goedkeuringen en had geen bypass-actors. Vervolgcontrole in dezelfde uitvoering: github_get_user_login bevestigt login/id opnieuw; ruleset25339571 is active met drie regels, geen bypass en0verplichte approvals. GET /user via de generieke fetchroute werd geweigerd; de daarvoor bestemde logintool is gebruikt. Geen instellingen gewijzigd.

De beschikbare GitHub-tools bieden lezen/schrijven van repositorygegevens, maar geen accountwissel, installatie-tokenuitgifte, selectie van een eigen GitHub App of injectie van een andere GitHub-identiteit. De geïnstalleerde GitHub-plugin is bevestigd. De read-only permissiecontrole meldde `Use my default` / `Allow low-risk actions`: dat zijn ChatGPT-actiegoedkeuringen, geen GitHub-repositoryrechten en geen bewijs van een andere identiteit. Er is geen werkende connectorwissel vastgesteld.

## Keuze voor de eigenaar

| Route | Rechten en praktische grens |
| --- | --- |
| Eigen GitHub App met installatie-identiteit | Kan één repository en fijnmazige rechten krijgen. De uitvoerende integratie moet installatie-tokens daadwerkelijk ondersteunen. De huidige connector kan niet aantoonbaar naar een zelfgemaakte App worden omgeschakeld. |
| Apart GitHub-gebruikersaccount als collaborator | Kan via een ondersteunde accountkoppeling werken, mits die werkelijk onder dat account authenticeert. Een persoonlijke privérepository geeft collaborators write; geen read-only-collaboratorrol. Dit is minder fijnmazig dan een App. Accountaanmaak en nieuwe koppeling blijven aparte handelingen voor de eigenaar. |

Een App registreren of installeren verandert de bestaande ChatGPT-koppeling niet vanzelf. Een GitHub App kan ook namens een gebruiker authenticeren; dat is niet hetzelfde als de gewenste installatie-identiteit. Een andere commitnaam of ander e-mailadres verandert evenmin de API-actor.

## Stappenplan voor een GitHub App

1. Eigenaar controleert eerst of de beoogde uitvoerende integratie eigen GitHub App-installatiecredentials ondersteunt. Vraag hoe de requestactor wordt vastgesteld en welke repository-API's worden gebruikt. Zolang dat ontbreekt: App-route als OPEN laten staan; geen privésleutel aanmaken of delen om deze lacune te omzeilen.
2. Eigenaar registreert, indien ondersteund en afzonderlijk geautoriseerd, een App en installeert deze uitsluitend op `zsj4j2s4df-pixel/Rittenregistratie` via **Only select repositories**. Geen organisatie-, account- of andere repositorytoegang aanvragen.
3. Start met **Metadata: read**, **Contents: read and write**, **Pull requests: read and write**. Contents write is nodig voor agentbranches/commits; PR write voor draft-PR's en bijwerken. Geen **Administration**, **Workflows**, **Secrets**, **Environments** of **Deployments** write. Alleen indien nodig voor CI-diagnose **Actions: read**, **Checks: read**, **Commit statuses: read**; Issues write alleen bij een expliciete taak. Endpointvereisten kunnen aanvullende read-rechten vragen: eerst vaststellen, niet preventief verbreden.
4. Uitvoerende integratie gebruikt kortlevende installatie-tokens, beperkt tot die repository en noodzakelijke rechten. App-privésleutel blijft in de daarvoor bestemde secretvoorziening; niet in chat, repository, document, URL of commandoutput. De agent krijgt geen eigenaarcredential als terugval.
5. Eigenaar versterkt de bestaande main-ruleset: enforcement **Active**, target `main` of de bedoelde default branch, geen uitzondering voor de App, verplichte PR, minimaal **1 approving review**, **Dismiss stale approvals** en **Require approval of the most recent reviewable push**. Behoud blokkade op deletion en non-fast-forward. Neem bestaande geldige CI-checks over indien aanwezig; verzin geen checknaam.
6. Laat de bypasslijst leeg voor deze reviewregels; voeg ook geen brede administrator-/rolbypass toe. Controleer alle overlappende rulesets en oudere branch protection. Met meerdere bevoegde menselijke reviewers betekent één goedkeuring niet automatisch dat uitsluitend de eigenaar kan goedkeuren. Als eigenaarsgoedkeuring expliciet moet worden afgedwongen, beoordeel aanvullend CODEOWNERS met alleen de eigenaar en vereiste code-owner-review, inclusief bescherming van het CODEOWNERS-bestand. Dat vergt een afzonderlijke concrete configuratiereview.

**Relevante grens:** Contents write plus Pull requests write is geen technisch verbod op mergen. Na geldige menselijke goedkeuring kan de agent mogelijk ook de merge uitvoeren. De projectregel blijft daarom expliciet: agent maakt branches/PR's, eigenaar beslist over merge; geen agentmerge zonder expliciete toestemming. Als zelfs na goedkeuring uitsluitend de eigenaar technisch moet kunnen mergen, is aanvullend een afzonderlijk beoordeelde mergebeperking of credentialbroker nodig. Zet niet zomaar `Restrict updates` aan: die regel staat updates alleen aan bypass-actors toe en kan de normale mergeflow blokkeren. Geef de App daarvoor geen bypass.

Voor een persoonlijke privérepository vereisen branch-rulesets volgens GitHub een passend betaald plan zoals GitHub Pro; voor publieke repositories zijn ze ook op Free beschikbaar. Controleer het bestaande plan en de zichtbaarheid, zonder een abonnement te wijzigen of de repository openbaar te maken. De eerder geconstateerde actieve ruleset vervangt die actuele controle niet.

## Alternatief via aparte gebruiker

Eigenaar controleert in ChatGPT de GitHub-appverbinding en de aangeboden accountkoppeling. Als geen keuze voor een tweede identiteit beschikbaar is, kan loskoppelen/herkoppelen onder de juiste GitHub-browseridentiteit nodig zijn; dat is hier niet uitgevoerd of als werkend bevestigd. Controleer vooraf gevolgen voor andere Codex-omgevingen en repositorytoegang. Alleen met die daadwerkelijk gekoppelde aparte gebruiker doorgaan; niet aannemen dat de huidige sessie direct wisselt. Behoud de reviewregels hierboven en geef de aparte gebruiker geen owner-/beheerrechten. Gebruik geen persoonlijke eigenaar-PAT om een apart account te simuleren.

## Niet-destructieve verificatie vóór ingebruikname

- Lees de installatieconfiguratie terug: exacte App-ID/slug, installatie-ID, geselecteerde repository en effectieve rechten. Bewaar identifiers, geen tokens. Een installatie-token is geen gebruikerssessie: `GET /user` is daarvoor niet de juiste identiteitsproef.
- Controleer bij gebruikersauthenticatie read-only `GET /user`: login moet verschillen van `zsj4j2s4df-pixel`. Controleer repositorytoegang en effectieve rechten, niet alleen de zichtbare accountnaam in de browser.
- Lees main-rulesetdetails en eventuele aanvullende branch protection terug: active, juiste branch, minimaal één review, stale-dismissal, last-push-review, geen App-/agentbypass. Een 403 of niet-ondersteund connectorendpoint is geen bewijs van beveiliging; laat de eigenaar de instellingen aantonen via het ondersteunde endpoint of de GitHub-interface.
- Bekijk bij een reeds bestaande wijziging van de nieuwe identiteit de PR-auteur en de mergevoorwaarden read-only. Controleer vóór review dat de vereiste goedkeuring ontbreekt en de PR niet mergebaar is. Indien nog geen zo'n PR bestaat: markeer dit verificatiepunt OPEN; de hier beschreven verificatie maakt geen testcommit, PR, push of merge.
- Controleer bij een volgende normaal geautoriseerde agent-PR dat de auteur de aparte gebruiker of App-bot is, de eigenaar onafhankelijk kan goedkeuren en een volgende inhoudelijke push de relevante goedkeuring opnieuw vereist. Verifieer dit binnen regulier werk; geen verboden push, force-push, delete of merge als proef.

Pas na deze bewijsstukken mag ACT-002 als ingerichte identiteitsscheiding worden afgesloten. Ook dan blijft de eigenaar technisch bevoegd zijn eigen repositoryregels te wijzigen; dit plan maakt de agent niet tot beheerder en claimt geen onveranderlijke beveiliging.

## Officiële bronnen en onderzoeksbeperkingen

Onderstaande GitHub-documentatie is op 18 oktober 2026 rechtstreeks read-only opgehaald:

- [GitHub App-permissions kiezen](https://docs.github.com/en/apps/creating-github-apps/setting-up-a-github-app/choosing-permissions-for-a-github-app): onderscheid tussen installatie- en gebruikersauthenticatie, minimale endpointrechten.
- [Authenticatie als GitHub App-installatie](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/authenticating-as-a-github-app-installation): installatie-token en Contents-permissie voor HTTP Git.
- [Rulesets en beschikbaarheid per plan](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets).
- [Beschikbare rulesetregels](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets): reviews, stale approvals, laatste push, bypass en restrict updates.
- [Rechten op een persoonlijke repository](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-user-account-settings/permission-levels-for-a-personal-account-repository).

De officiële [OpenAI GitHub-koppelhandleiding](https://help.openai.com/en/articles/11145903-connecting-github-to-chatgpt) gaf vanuit deze omgeving HTTP 403. Daarom zijn exacte schermnamen, gelijktijdige meerdere accounts en een actuele werkende wisselprocedure niet als geverifieerd beschreven. De beschikbare connectorcapaciteiten en permissiecontrole tonen zelf geen identiteitswisselactie. Geen nieuwe externe account of koppeling is gestart.
