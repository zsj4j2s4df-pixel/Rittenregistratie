# RitKompas — projectbestanden vinden

Behoud de bestaande paden en Git-geschiedenis; geen onnodige verplaatsing waardoor
Cloudwerk/imports breken. Deze index organiseert de bestaande bron, niet privédata.

| Onderdeel | Vindplaats |
| --- | --- |
| Website, aanmelden, publieke uitleg | `app/`, uitleg `/hulp` |
| Backend, authenticatie, centrale registratie | `lib/` en `app/api/` |
| Databaseschema en migraties | `drizzle/` |
| Native iPhone-bron en Xcode-project | `ios/` |
| Tests en lokale verificatie | `tests/`, `scripts/` |
| Goedgekeurde publieke beelden/iconen | `public/brand/`, inclusief assetmanifest |
| Bindende huisstijl en semantische tokens | `docs/design/`, `skills/ritkompas-huisstijl/` |
| Accountmails en uitleg voor gebruikers | `docs/auth-email/`, `docs/onboarding/` |
| Technische overdracht en testbewijs | `docs/TRANSFER/` |
| Actuele taken, eigenaaracties, hervatten | `CLOUD_TASKS.md`, `OWNER_ACTIONS.md`, `RESUME.md` |
| Overzicht, voortgang, Cloudoverdracht | `README.md`, `DEVELOPMENT_PROGRESS.md`, `CLOUD_HANDOVER.md` |

## Niet naar het publieke GitHub

Echte ritten/adressen/locatiehistorie, database-exports, persoonlijke accountlijsten,
uitnodigingslinks, cookies, tokens, wachtwoorden, certificaten, signingprofielen,
privésleutels, privéfoto-originelen, caches en builds blijven buiten Git.
Alleen beoordeelde publicatiekopieën en veilige voorbeeldconfiguraties delen.
Lokale privéback-ups horen in uitgesloten `work/`, niet in deze structuurindex.

Een GitHub-PR is geen bewijs dat Codex Cloud de opdracht daadwerkelijk ontvangen
of uitgevoerd heeft. Geen mainmerge zonder eigenaarbesluit.
