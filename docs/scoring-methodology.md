# Scoring methodology v1

Each elevation band receives six component scores: temperature comfort 30%, precipitation 20%, snow 20%, heat stress 10%, wind 10%, and daylight 10%. Piecewise-linear curves are versioned in `data-config/scoring/curves.json`; weights live in `weights.json` and must sum to exactly one.

Band scores are aggregated using curated elevation-band weights. Missing components are never replaced by zero or silently renormalized. Public scores round to the nearest integer after all internal calculations.

Hourly temperature utility is averaged before band aggregation. Public destination distribution samples are derived from the weighted band samples rather than copied from one elevation band. Destination sample-year count uses the minimum contributing band count so the summary cannot overstate temporal coverage.

Temperature aggregation version 2 applies the fixed, capped lapse correction from the official ERA5-Land invariant-geopotential model height to the GLO-30-derived elevation-band target. GLO-30 candidate-window height is retained separately for terrain matching and is never the correction reference.

Confidence combines data completeness (35%), elevation match (25%), spatial coverage (15%), interannual stability (15%), and terrain/wind uncertainty (10%). It is a product-confidence heuristic, not a scientific uncertainty interval.
