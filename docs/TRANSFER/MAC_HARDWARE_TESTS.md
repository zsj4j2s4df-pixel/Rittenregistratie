# Cloud → Mac — ontvangstproef en fysieke acceptatie

19 oktober 2026, Europe/Amsterdam. Referentie **MAC-CLOUD-20261019-PR27**. Cloud leidt; Mac ondersteunt Apple-toolchain/iPhone/Jeep/hardware. Geen externe Cloudflare-configuratie gelijktijdig wijzigen; Mac onderzoekt Access/ruleset in eigen PR. Geen aankopen, kosten, productiepublicatie, securityuitschakeling, mainmerge of forcepush.

## Ontvangst en uitvoeringsbewijs: eerst deze gratis proef

Cloud heeft PR27 op **4af50d3a1fa3408cb563a2924ce9aec2784c4290** volledig gelezen: één memo56regels, PRomschrijving, lege issuecomments/reviews/reviewcomments. Bestaande opgeslagen Cloudbasis: PR26 **ec44dc8ddda1361a61f9f0c8bdceebe4e20e8a01**, branch `cloud/cloud-005-detection-quotas`. Lokale checkpoint `c7771e5` is synthetische werkgeschiedenis, niet de te pushen GitHubparent.

In Cloud zijn GitHub-/web-/shelltools aanwezig, maar geen tool om een taak naar bestaande thread `01a15055-77ad-7963-a105-d40398e16a7f` hostlocal te sturen. Lokale subagents zijn niet dezelfde Mac-thread. De eigenaar heeft één veilige terugmelding geautoriseerd; technische directe aflevering kan hier niet worden uitgevoerd. `/scale` en `/do` zijn geen beschikbare tools/ondersteunde opdrachten in deze sessie; geen effect verzonnen. Nieuwe subagentruns niet starten om dit te omzeilen: eerdere run meldde workspacecredits op; niets gekocht of geactiveerd.

**MAC-ACK-01 — klaar om op te pakken, NIET UITGEVOERD:**

1. Lees dit bestand en het memo via GitHub op de exacte head van deze onderzoeks-PR, zonder Mac-bestanden te overschrijven of eigen wijzigingen te verliezen.
2. Lees remote PR26-head en PR27-head terug. Verwacht de twee SHA's hierboven; bij afwijking eerst rapporteren en niet rebasen/mergen.
3. Schrijf op een eigen veilige branch een klein bewijsbestand `docs/TRANSFER/MAC_CLOUD_ACK_RESULT.md` met referentie, gelezen onderzoekscommit, beide waargenomen SHA's, lokale datum/tijdzone, resultaat PASS/FAIL en tekst `MAC-CLOUD-20261019-PR27-ACK-01`.
4. Voeg toe: is echte iPhone/Jeep beschikbaar, welke Swift/Xcode-versie is werkelijk gemeten, welke controles NIET GETEST zijn. Geen VIN, kenteken, e-mail, tokens of screenshots met persoonsgegevens.
5. Sla als draft-PR op; geen merge. Cloud kan dat bewijs teruglezen. Een opdrachtbestand/PR is slechts verzending/opslag, **geen ontvangst of uitvoering**; pas dit aparte resultaat bewijst terugkoppeling.

Status samenwerking: inkomende eigenaar-delegatie ontvangen; directe automatische tweewegagentuitvoering NIET bewezen. GitHub-opdrachtoverdracht wordt hier concreet voorbereid. Onbekende productinstelling of toestemming niet raden; een geschikte hostlocal-threadtool zou technisch nodig zijn voor directe verzending. Gebruiker geeft ontwikkelopdrachten aan Cloud; Mac krijgt de concrete GitHub-hardwaretaken. Geen nieuwe koppeling of account nodig voor deze proef.

## Fysieke testmatrix — alleen waar hardware al aanwezig/toegestaan is

Voer schermbediening stilstaand uit; rijden door bestuurder, meten door passagier of achteraf. Niet meerdere diagnose-apps om één OBD-verbinding laten concurreren. Registreer PASS/FAIL/NIET GETEST, exacte iPhone/iOS/Uconnect/adaptermodel/firmware, herhalingen en afwijkingen. Publiek bewijs zonder privé-GPS, adressen, VIN, telefoonnamen/ID's of credentials. Gebruik rollen vader/moeder/derde en synthetische fixture-ID's.

| ID | Procedure | Acceptatie / terugkoppeling |
|---|---|---|
| MAC-J01 gratis nulmeting | Leg werkelijk Uconnect-model/software/markt vast; verbind iedere iPhone afzonderlijk via bestaande USB-datapoort; test bellen/audio/navigatie | Werkt bedrade CarPlay echt? Welke poort/kabel? Geen adaptercompatibiliteit afleiden uit alleen modeljaar |
| MAC-J02 gratis triggers | Observeer Jeep-Bluetooth én CarPlayconnect/disconnect, voertuigaan/uit/elektrisch, telefoonblijftnabij/weg; bekijk beschikbare Shortcuts-trigger/runinstellingen op huidige iOS | Tijdstempels, late/ontbrekende/valse triggers; geen auto-stopbewijs uit disconnect alleen |
| MAC-J03 native vóór hardware | Typecheck bestaande SwiftCore met Apple-toolchain; integreer bronvoorbereiding in juiste target; test notificationcategorieën zonder netwerk | Swift/XCTest/build werkelijk PASS of foutregels; Cloudtests zijn geen nativebewijs |
| MAC-J04 meldingsacties | Zakelijk/Privé lokaal, telefoon vergrendeld/onvergrendeld, uitklappen/ingedrukthouden, Focus, meldingenuit, appachtergrond/terminated, actie later/dubbel/accountwissel | Correcte geautoriseerde lokale context; geen verloren rit bij gemiste melding, geen verkeerde actor/classificatie. Alleen zodra prototype in een echte app is geïntegreerd |
| MAC-J05 einde en120seconden | Twee minuten klantparkeren met werkelijk einde en nieuw vertrek; daarnaast120seconden stoplicht/file zonder einde; EV-rit zonder benzinemotor; kort signaalverlies | Eerste levert twee ritten, verkeer één, geen vroeg einde door RPM0/disconnect; onbekende grens expliciet te controleren. Nog geen werkende implementatieclaim |
| MAC-J06 prioriteit (na aankoopakkoord/leenhardware) | Pair vader/moeder/derde.20coldstarts alle3aanwezig;20starts vaderafwezig moeder+derde; wissel laatstgebruikt; vaderstapt30s/120slaterin | Screenshots van echte prioriteitsinstelling zonder namen, winnaar/verbindingstijd perrun. Vastevolgorde en laterovername afzonderlijk beoordelen. Falen niet verbergen achter gemiddelde |
| MAC-J07 draadloze duurproef | Per kandidaat meerdere korte/lange ritten met bellen/audio/navigatie, warm/koudstart, USBblijftgevoed en in/uitstappen | Uitval/audiolatentie/hersteltijd, batterij-/warmteverschil tegen bedrade nulmeting; geen exacte prestatienorm zonder eigenaaracceptatie |
| MAC-J08 optioneelOBDread | Alleen eigen/toegestane adapter, fabrikantapp/read-only. Meet supportedPID/voertuigsnelheid/0xA6 of gedocumenteerde OEMteller en EVready indien beschikbaar | Dashboardvergelijking vóór/na EV-rit, eenheden/resolutie, bron/PID/supportedstatus; ontbrekend=onbekend. Geen wissen/coderen/gatewaybypass/extra betaalapp |
| MAC-J09 OBDslaap | Met toegestane meetmethode controleren na uitschakelen, ook samen met CarPlay; test herstart/telefoonachtergrond | Gemeten sleep/wake en12V-effect; geen voertuigbedrading wijzigen of accu leegrijden voor proef |
| MAC-J10 driegebruikers/dedup | Laat2/3geautoriseerde telefoons dezelfde synthetische voertuigritclaim aanleveren, responses verliezen/herhalen en offline terugkomen | Eén canonieke voertuigrit of zichtbare overlapbeoordeling; geen stille dubbele rapportage, geen bestuurder afleiden uit CarPlaywinnaar |

Een hardwareaankoop is geen automatische toestemming voor andere aankopen/licenties. Niet beschikbare hardwaretests blijven NIET GETEST. Mac levert testresultaten via eigen draft-PR; Cloud verwerkt pas echte bewijsresultaten in de acceptatiestatus.
