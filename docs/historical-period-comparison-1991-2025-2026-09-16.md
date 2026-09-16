# Historical-period comparison: 1991–2025

Status: **staging only — not a production release**.

The GitHub Actions staging run `35073854396` completed successfully. It
retrieved one selected ERA5-Land grid point for each of the 315 active
destinations, with the padded UTC range `1990-12-31` through `2026-01-01` and
`306,864` hourly observations per point. The resulting 315 climate snapshots
all contain 35 complete years (1991–2025), with no missing year in the
aggregation metadata.

The candidate was scored with the existing weights, curves and eligibility
gates. No calibration or publication decision was made in this step.

## Comparison with the current 1991–2020 release

- 315 destinations compared.
- 3,384 months had a score in both periods; held/null months are excluded from
  the numeric comparison.
- Mean score change: `+0.057` points.
- Mean absolute score change: `0.379` points.
- Largest absolute score change: `29` points.
- 17 month-level eligibility changes occurred. These are the cases that need
  scientific review before any production switch.

| Destination | Month | 1991–2020 | 1991–2025 | Old score | New score |
|---|---:|---|---|---:|---:|
| durmitor | 11 | eligible | blocked | 48 | 46 |
| torres-del-paine | 1 | blocked | eligible | 49 | 54 |
| gran-paradiso | 10 | blocked | eligible | 48 | 49 |
| beskids | 4 | eligible | blocked | 60 | 49 |
| arches | 12 | blocked | eligible | 49 | 55 |
| grand-canyon | 12 | blocked | eligible | 49 | 60 |
| great-smoky-mountains | 2 | blocked | eligible | 49 | 52 |
| chapada-dos-veadeiros | 9 | eligible | blocked | 72 | 49 |
| coorg | 4 | eligible | blocked | 56 | 49 |
| flinders-ranges | 3 | eligible | blocked | 78 | 49 |
| low-tatras | 4 | eligible | blocked | 61 | 49 |
| monti-sibillini | 12 | blocked | eligible | 49 | 51 |
| yorkshire-dales | 1 | eligible | blocked | 45 | 45 |
| kashmir-pahalgam | 6 | blocked | eligible | 49 | 66 |
| zhangjiajie | 8 | eligible | blocked | 60 | 49 |
| cape-breton-highlands | 5 | blocked | eligible | 49 | 63 |
| lanin | 5 | eligible | blocked | 48 | 45 |

The comparison is reproducible with:

```sh
pnpm science:compare-period
```

The machine-readable output is written to
`generated/intermediate/historical-period-comparison.json` and is intentionally
ignored by Git because it is derived staging evidence.

## Interpretation

The overall distribution is stable, but the 17 gate-boundary changes are not
safe to auto-publish. They must be checked against the Golden Cases and the
independent precipitation/extreme-weather evidence. The active production
dataset therefore remains 1991–2020 until the Sol scientific review accepts
or rejects these changes.
