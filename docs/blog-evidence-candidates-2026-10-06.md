# Blog batch 2: evidence candidates

Status: archived Luna evidence scan from before the period migration; it must not be used for publication claims.
Dataset at time of scan: `era5-land-representative-point-1991-2020-v1`. The current public dataset is `era5-land-representative-point-1991-2025-v1`.

## Dataset checks

- The export contains 315 destination records, each with 12 monthly records.
- Every destination currently has exactly one `representative` elevation band with weight 1. A vertical-profile article cannot be supported by this export.
- The manifest and destination records say `datasetStatus: provisional`. Article publication therefore requires a separate claim-level review and selected-cell wording; the status does not automatically prohibit editorial publication.
- Temperature P10/P90 are percentiles of hourly temperatures sampled within the local hiking window. They are not daily minima/maxima or a forecast.
- Grid-cell wind appears in the monthly metrics and score components. The methodology explicitly says it is not validated as exposed-trail or gust information; any article must explain that limitation and must not present it as route-safety advice.

## Candidate 1 — The range hidden inside a monthly temperature average

**Working angle:** A monthly mean can hide a large spread in temperatures sampled during the hiking window. Show the mean beside P10 and P90, and explain what those percentiles do and do not represent.

**Initial example:** Crater Lake, September: P10 6.5°C, mean 16.0°C, P90 24.5°C; the P90–P10 span is 18.0°C. The month is recommendation-eligible in the current export.

**Source:** `public/data/hiking/destinations/us/crater-lake.json` (`months[8].metrics` and eligibility fields); aggregation definition in `lib/hiking/climate.ts`.

**Editorial shape:** Annotated distribution graphic around one month, then a second counterexample selected by Sol. Avoid implying these percentiles are a daily forecast or a guaranteed trip range.

## Candidate 2 — Mild average, frequent modelled snow days

**Working angle:** A comfortable-looking hiking-window temperature does not settle the snow question.

**Initial example:** Bregenzerwald, May: mean 10.2°C, snow-day probability 64.84%, snow component 0, recommendation-ineligible. The dataset uses one representative cell at 1,279.9 m model elevation.

**Source:** `public/data/hiking/destinations/at/bregenzerwald.json`; eligibility threshold: `data-config/methodology/recommendation-eligibility-v1.json`; snow definition: `data-config/methodology/climate-aggregation-v1.json`.

**Editorial shape:** A case-file narrative following the same month through temperature, snow-day probability and the eligibility gate. State clearly that modelled snow probability does not establish trail cover, access or closure.

## Candidate 3 — Warmest month or driest month?

**Working angle:** “Best month” changes with what a traveller values; compare physical metrics rather than adding component scores into one unexplained number.

**Initial example:** Zhangjiajie: July is its warmest eligible month in this export (26.9°C; wet-day probability 65.59%). December has the lowest wet-day probability among its eligible months (28.06%) and a 7.0°C hiking-window mean. Both months are eligible.

**Source:** `public/data/hiking/destinations/cn/zhangjiajie.json`, July and December monthly records.

**Editorial shape:** A two-path planning story with the reader choosing a priority, followed by a compact metric comparison. Do not call either month universally best; Sol should also assess whether Zhangjiajie is an appropriate and representative editorial example.

## Candidate 4 — What a grid-wind number can tell a hiker

**Working angle:** Explain why historical 10 m grid-cell wind is not the same thing as wind on an exposed ridge, gusts, or a current forecast.

**Initial example:** Lofotodden, January: grid-cell mean wind 32.9 km/h and high-wind-hour probability 29.4% in the export. These figures describe the sampled model cell and historical period only.

**Source:** `public/data/hiking/destinations/no/lofotodden.json`; `data-config/methodology/era5-land-representativeness-v1.json`; `data-config/methodology/confidence-v1.json`; `data-config/scoring/weights.json`.

**Archived decision:** this pre-migration idea assumed a 10% wind weight and is scientifically obsolete. Under algorithm 1.3.0, grid wind has zero score weight and cannot affect eligibility or best-month selection. Any future wind article must be re-scoped as a limitations explainer and re-reviewed from scratch.

## Sol handoff

The four candidates were reviewed against the migrated public dataset and the claim-level evidence manifest in `docs/blog-batch-2-science-review-2026-10-06.md`. They were approved and published bilingually on 2026-10-07. The publication decision remains editorial: it does not upgrade the destination dataset from `provisional` or turn grid-cell wind into route-safety evidence.
