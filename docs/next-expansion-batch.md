# Carry these into the next expansion batch

Work that needs an ERA5-Land download and is not worth a run of its own. The
expansion workflow has a 330-minute timeout because CDS queue times are
unpredictable, so three destinations do not justify dispatching it; folded into
a batch that is already queued, they cost almost nothing.

## Five representative cells to re-pick

Four were found by `pnpm guard:cells`, which refuses a cell whose snow never melts; the fifth,
Annapurna, by the golden season labels. All five carry an accepted deviation naming the same cause.
Alternative cells were located in the cached ERA5-Land invariant geopotential at
`generated/intermediate/era5-invariants/`, so the coordinates below cost no
download to find — only confirming what the climate is there does.

`pnpm guard:cells` blocks any *new* destination whose cell never loses its snow. These four already
had, and are listed in the guard so they do not block the build while they wait.

| destination | current cell | why it is wrong | candidate | shift |
| --- | --- | --- | --- | --- |
| `zermatt` | 46.0, 7.7 · 2,996 m | 2.9 m of snow in its thinnest month: a permanent snowfield, not the official Zermatt-Sunnegga route | no valid one-cell replacement: the official GPX-intersecting 46.0, 7.8 cell triggers the official ≥10 m glacier indicator; 46.2, 7.8 is outside the cited route | keep review hold; requires a finer or different supported method |
| `el-chalten` | -49.3, -72.9 · 946 m | 6.0 m in its thinnest month: the edge of the Southern Patagonian Ice Field, not the Fitz Roy trailheads | -49.4, -72.7 · 698 m, land 0.93 | −249 m, 3 cells |
| `garhwal` | 30.7, 79.1 · 3,540 m | 6.9 m in its thinnest month, the deepest in the catalogue. The Valley of Flowers is walked at 3,050 to 3,350 m | 30.6, 79.2 · 3,149 m | −390 m, 2 cells |
| `denali` | 63.3, -150.5 · 1,496 m | 1.9 m in its thinnest month and far from the official Savage River trail network | 63.7, -149.3 · official NPS-trail-intersecting cell | route-derived replacement |
| `annapurna` | 28.5, 83.9 · 4,296 m | not snowbound, but about 1,300 m above the circuit; October and November score 52 and 33 on temperature and would reach 92 and 79 at the candidate | 28.4, 84.1 · 3,130 m | −1,166 m, 3 cells |

Both Zermatt and El Chaltén already carry an entry in
`data-config/sources/representative-cell-overrides.json`. Those overrides were
chosen to dodge the official 10 m glacier indicator and landed on cells with 3
to 7 m of permanent snow instead, which is the finding below.

After the download, re-read the three accepted deviations in the golden fixture.
A test fails if the engine's answer moves away from the one a deviation was
written against, so they cannot be left stale.

## The glacier sentinel is too permissive

`officialSnowDepthIndicatorM` is 10 m in
`data-config/methodology/era5-land-representativeness-v1.json`. That is the
official ERA5-Land threshold and should not be changed — it means what it means.
The problem is that it is the only snow check in cell selection, and a cell can
hold 3 to 7 m of year-round snow while passing it. Both cells above did.

The fix belongs in preparation, not in the indicator: a separate rejection for
candidate cells whose minimum monthly snow depth stays above a walking
threshold across all twelve months. It needs climate data for the candidate, so
it fits naturally in the same batch that re-picks the three cells above rather
than as a change on its own.

Until then, `pnpm data:catalogue-preflight` reports model elevation and land
fraction but says nothing about snow, so a candidate high enough to be a
snowfield has to be caught by reading the elevation. Anything above about
2,800 m in the Alps or the Andes deserves a second look before the download.

## Corsica GR20: the model cannot see the route

Found 2026-10-23 because `corsica-gr20` publishes all twelve months as
recommendable, January included. This is not the #23 failure: the coordinate
(42.2, 9.05) is on the route, between Petra Piana and l'Onda. The problem is the
grid.

- The resolved cell is 42.2, 9.1 at **1,226 m** model elevation, land 1.00.
- The **highest ERA5-Land cell on Corsica is 1,426 m** (42.3, 9.0, land 1.00).
  The GR20's refuges sit at roughly 1,400 to 2,000 m and its passes reach about
  2,600 m (approximate, to be replaced by a GPX-derived profile). No cell on the
  island is at route height.
- The catalogue path sets `targetElevationM` to the model elevation, so
  `elevationMismatchM` is 0 by construction and the 600 m orography gate cannot
  fire here (mistakes.md #3: an identity is not evidence).
- At the cell, January has snow on 32% of days with 5 cm mean depth, and the
  deepest snow in 35 years is 0.35 m. January and February score snow 45 and 47,
  temperature 59 and 63, so every critical component clears 20 with room.

Re-picking alone will not change the answer. The best cell gains 200 m. A lapse
correction to ridge height still leaves a January hiking-hours mean around 0 °C
(temperature ≈ 30, the correction is capped at 5 °C), and snow cannot be
corrected at all. So the candidate below is worth a download in a queued batch,
but the winter months stay eligible unless Sol decides otherwise.

| destination | current cell | candidate | shift |
| --- | --- | --- | --- |
| `corsica-gr20` | 42.2, 9.1 · 1,226 m | 42.3, 9.0 · 1,426 m, land 1.00 | +200 m, 1 cell |

**For Sol.** Whether a destination whose route lies above the highest model
cell in reach can carry a recommendation at all, and if so in which months. The
same pattern is worth a look across the twelve-month destinations at mid
latitudes: `sierra-nevada-espana` (2,052 m), `sierra-de-guadarrama` (1,522 m),
`sierra-de-gredos`, `tongariro` and `cradle-mountain` also clear every month,
with snow on 32 to 47% of days in their worst month.
