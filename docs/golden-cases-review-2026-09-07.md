# Golden cases and release blockers, 2026-09-07

The committed catalogue contains 315 destinations. The Golden fixture contains 31 signed
labels: 25 agree with the engine's selected best months, four partly agree, and two have
no recommendation. Six accepted deviations make the existing Golden gate pass. This is
approval of a documented review state, not evidence that all 31 engine results agree.

## Fixed validation defects

- The release report previously checked signatures and exception counts without comparing
  labels with published months. It could report a passing Golden gate despite new mismatches.
  It now checks destination existence, unique cases, valid month sets, signatures, actual
  answers and the exact month sets covered by accepted deviations.
- A test required at least one disagreement even after all scientific discrepancies were
  resolved. It now uses the same evidence gate as the release report. Full agreement is valid.
- The report now includes per-case results and a checksum of the reference fixture.

No reference seasons, approvals, scoring thresholds or destination data were changed.

## Remaining discrepancies

| Destination | Reference months | Engine best months | Existing review state |
| --- | --- | --- | --- |
| Zermatt | July–September | None | Persistent-snow hold; tested route cell rejected for glacier indicator |
| El Chaltén | November–March | None | Persistent-snow hold; staged replacement rejected after route-coordinate review |
| Atlas Mountains | April–June, September–October | May–July | Accepted scoring discrepancy |
| Mount Kenya | January–February, July–September | January–March | Accepted scoring discrepancy |
| Annapurna | March–April, October–November | May, September, October | Staged replacement needs route and season review |
| Langtang | March–April, October–November | May, October, November | Accepted scoring discrepancy |

The seven production blockers remain source semantics and the six release approvals:
geometry/elevation, licensing/attribution, legal/operator details, accessibility/performance,
science/data audit and the project's custom production domain. A completed deployment does
not resolve any of these approvals. Besttravelclimate.com belongs to the sibling project and
is not a failed BestTimeToHike route.

Validation: 11 focused Golden tests pass; TypeScript passes; release report regenerates
with seven blockers. Hunza's monthly-temperature-jump warning remains visible.
