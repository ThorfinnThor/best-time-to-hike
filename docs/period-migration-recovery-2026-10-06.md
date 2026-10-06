# 1991–2025 migration recovery note

Date: 2026-10-06
Scope: the public 315-destination catalogue only

## Finding

The current branch `codex/merge-ranking-cards` is still publishing the 1991–2020 catalogue:

- 315 destinations
- manifest dataset version `era5-land-representative-point-1991-2020-v1`
- climate period 1991–2020
- current climate snapshots with the legacy aggregation policy

The 1991–2025 work was not lost. Commit `dd80403` contains the migrated 315-destination snapshots and public export. Its Madeira snapshot has 35 complete years (1991–2025), uses `observation-validity-v1`, and the historical-period manifest reports 315 destinations and 1991–2025.

The follow-up scientific review in commit `942e5fb` records:

- 315 destinations and 3,780 destination-months
- 306,864 hourly observations per source cell
- 35 complete years per month
- frozen scoring weights and gates
- 17 eligibility changes versus 1991–2020, all explained by configured component crossings
- no hold changes, no reviewed extreme-destination changes, and no monthly number-one ranking changes
- scientific evidence gate passed and migration authorized
- production release approval still false

## Safe recovery boundary

The old migrated snapshots must not be copied blindly into `main`: they contain historical migration metadata and must be reconciled with the current scoring, confidence, public schema, and release gates. The 375-destination audit is outside this recovery and remains excluded from the public dataset.

## Next hand-off

The next step is Sol's scientific confirmation of the recovered 1991–2025 evidence and the replacement of the capped confidence semantics. No blog article work is resumed until that review and the regenerated 315-destination export are complete.
