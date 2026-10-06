# Scoring methodology v1.3

Each elevation band receives six displayed component values. Five enter the overall score: temperature comfort 33.33%, precipitation 22.22%, snow 22.22%, heat stress 11.11%, and daylight 11.11%. ERA5-Land 10 m grid wind has 0% weight and is contextual only until exposed-trail or gust behavior has been independently validated. Piecewise-linear curves are versioned in `data-config/scoring/curves.json`; weights live in `weights.json` and must sum to exactly one.

Band scores are aggregated using curated elevation-band weights. Missing components are never replaced by zero or silently renormalized. Public scores round to the nearest integer after all internal calculations.

Hourly temperature utility is averaged before band aggregation. Public destination distribution samples are derived from the weighted band samples rather than copied from one elevation band. Destination sample-year count uses the minimum contributing band count so the summary cannot overstate temporal coverage.

Temperature aggregation version 2 applies the fixed, capped lapse correction from the official ERA5-Land invariant-geopotential model height to the GLO-30-derived elevation-band target. GLO-30 candidate-window height is retained separately for terrain matching and is never the correction reference.

The former public numeric confidence score and arbitrary single-point cap of 64 are retired. Temporal completeness, source integrity, spatial scope, route representativeness and elevation context are separate evidence dimensions and must not be collapsed into one unsupported public number. Missing evidence causes an explicit review hold where required; it cannot change rankings or indexability through a confidence score.

## Recommendation guard

The recommendation policy is versioned in `data-config/methodology/recommendation-eligibility-v1.json`. A destination-month is eligible only when every unrounded critical component (`temperature`, `snow`, `heatStress`, `daylight`) is greater than 20. Precipitation remains a scored comfort factor and is named when it falls below the floor; unvalidated grid wind is excluded from the score, gate and best-month selection. If any critical component is 20 or lower, the month is marked `recommendationEligible: false`, its displayed score is capped at 49 (`poor`), and it is excluded from best-month lists, rankings and Finder results. Best-month lists are never padded.

The existing representativeness setting `glacier.persistentSnowReviewMonthCount` is read directly. A destination with exactly that many months at `snowDayProbability === 1` is held from recommendations; its detail route remains a provenance/review page without hiking-score or best-month claims. The independently reviewed precipitation-anomaly list is handled the same way until each case is resolved. These safeguards are claim-scope controls, not a forecast or route-level safety decision.
