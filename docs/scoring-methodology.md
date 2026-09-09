# Scoring methodology v1.3

Each elevation band receives six component values. Five affect the score: temperature comfort 33.333%, precipitation 22.222%, snow 22.222%, heat stress 11.111% and daylight 11.111%. ERA5-Land 10 m grid wind has weight 0 and is contextual only because it is not validated for exposed trails or gusts. Piecewise-linear curves are versioned in `data-config/scoring/curves.json`; weights live in `weights.json` and must sum to exactly one.

Band scores are aggregated using curated elevation-band weights. Missing components are never replaced by zero or silently renormalized. Public scores round to the nearest integer after all internal calculations.

Hourly temperature utility is averaged before band aggregation. Public destination distribution samples are derived from the weighted band samples rather than copied from one elevation band. Destination sample-year count uses the minimum contributing band count so the summary cannot overstate temporal coverage.

Temperature aggregation version 2 applies the fixed, capped lapse correction from the official ERA5-Land invariant-geopotential model height to the GLO-30-derived elevation-band target. GLO-30 candidate-window height is retained separately for terrain matching and is never the correction reference.

Confidence combines data completeness (35%), elevation match (25%), spatial coverage (15%) and interannual stability (15%). The remaining terrain/wind contribution is excluded while the ERA5-Land 10 m grid wind remains unvalidated for exposed trails and gusts; grid wind therefore cannot increase confidence. It is a product-confidence heuristic, not a scientific uncertainty interval.

## Provisional recommendation guard

The recommendation policy is versioned in `data-config/methodology/recommendation-eligibility-v1.json`. A destination-month is eligible only when every unrounded critical component (`temperature`, `snow`, `heatStress`, `daylight`) is greater than 20. Precipitation remains a scored comfort factor and has its own best-month floor of 5. Grid wind affects neither the critical gate nor best-month selection. If a critical component is 20 or lower, the month is marked `recommendationEligible: false`, its displayed score is capped at 49 (`poor`), and it is excluded from best-month lists, rankings and Finder results. Best-month lists are never padded.

The existing representativeness setting `glacier.persistentSnowReviewMonthCount` is read directly. A destination with exactly that many months at `snowDayProbability === 1` is held from recommendations. Destinations crossing the independent precipitation-disagreement threshold are likewise held under `precipitation-validation`. Their detail routes remain provenance/review pages without hiking-score or best-month claims. For a provisional, unapproved one-point destination, confidence is capped at 64 and labelled `low`. These safeguards are release-policy controls, not production science approval.
