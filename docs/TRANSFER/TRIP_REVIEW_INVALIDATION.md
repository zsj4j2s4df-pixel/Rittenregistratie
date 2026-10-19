# Correctie maakt oude controle ongeldig

CLOUD-002/004, vervolg op PR40. Gevonden fout: een trip met statusfinal/needs_review0 behield die controlemarkering na een inhoudelijke correctie. Een oude controle mocht zo onbedoeld voor nieuwe gegevens blijven gelden.

Elke geautoriseerde correctie zet nu in dezelfde UPDATE de status terug naar provisional/needs_review1, samen met nieuwe inhoud/revisie en audit. Een auditfout rolt ook de controlemarkering terug. De coherente snapshot neemt status en needs_review mee; het correctiescherm toont handmatiggecontroleerd of opnieuwtecontroleren en historie toont het veranderde controleflag. Geen nieuwe route waarmee de client zelf statusfinal kan aanleveren; geen automatische fiscale goedkeuring. Een expliciete afrondingsworkflow voor logboekreview blijft open.

235Node-tests/typecheck/volledige lint/build/lokaleworkerdD1 PASS. Twee nieuwe regressies: gecontroleerde trip corrigeren wist actuele controle maar oude vaste rapport blijft bytegelijk; auditfailure behoudt oude gecontroleerde status/revisie. Chromium centraleCRUD/rapport/periodeselectie/langePDF/revocation PASS, inclusief weergegeven gecontroleerde status→correctie→opnieuwtecontroleren. Geen nieuwe migratie/livewijziging/provisioning/kosten/mainmerge.
