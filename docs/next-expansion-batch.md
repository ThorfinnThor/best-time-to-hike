# Carry these into the next expansion batch

Work that needs an ERA5-Land download and is not worth a run of its own. The
expansion workflow has a 330-minute timeout because CDS queue times are
unpredictable, so three destinations do not justify dispatching it; folded into
a batch that is already queued, they cost almost nothing.

## Three representative cells to re-pick

Found by the golden season labels (`tests/fixtures/known-hiking-seasons.json`),
each currently carrying an accepted deviation that names the same cause.
Alternative cells were located in the cached ERA5-Land invariant geopotential at
`generated/intermediate/era5-invariants/`, so the coordinates below cost no
download to find — only confirming what the climate is there does.

| destination | current cell | why it is wrong | candidate | distance |
| --- | --- | --- | --- | --- |
| `zermatt` | 46.0, 7.7 · 2,996 m | 2.9–4.0 m snow depth in July and August: a permanent snowfield, not the Gornergrat and Sunnegga trails | 46.2, 7.8 · 2,215 m | 3 cells |
| `el-chalten` | -49.3, -72.9 · 946 m | 6.7–7.6 m snow depth in every month: the edge of the Southern Patagonian Ice Field, not the Fitz Roy trailheads | -49.4, -72.7 · 698 m, land 0.93 | 3 cells |
| `annapurna` | 28.5, 83.9 · 4,296 m | about 1,300 m above the circuit; October and November score 52 and 33 on temperature and would reach 92 and 79 at the candidate | 28.4, 84.1 · 3,130 m | 3 cells |

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
