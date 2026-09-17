# Historical-period comparison: 1991–2025

Status: **mechanically migrated and final scientific evidence gate passed; not yet a production release**.

## Superseded evidence

GitHub Actions run `35073854396` and its comparison are superseded. That run
rounded monthly climate metrics before scoring and therefore did not apply the
same aggregation contract as the 1991–2020 baseline. Its reported score deltas,
eligibility changes and maximum change must not be used for a release decision.

The corrected evidence is GitHub Actions run
[`35092846294`](https://github.com/ThorfinnThor/best-time-to-hike/actions/runs/35092846294)
at commit `3919be180e8f2493566a825cb9f5346852b0b04a`. It uses the unchanged
`observation-validity-v1` aggregation, unrounded metrics, and the frozen scoring
weights, curves, gates and holds.

## Evidence integrity

- Artifact: `real-data-staging-35092846294`
- 315 ERA5-Land representative cells and 3,780 destination-months
- 306,864 padded hourly observations per cell
- 35 complete years per month for 1991–2025 and completeness `1`
- 950 manifest files, 221,099,613 uncompressed bytes
- Manifest SHA-256:
  `48d18cce336eeeb281ab86cadd6b033ecca26299b1c4385a9851897b97e170a8`
- Comparison SHA-256:
  `1d5cc8e0999654c33864f33ae4380cc365565d2a6712215f2e92b60949e66ce4`
- All 950 file sizes and SHA-256 values verified with zero mismatches
- Locally reproduced comparison is byte-identical to the workflow comparison

The candidate remains explicitly marked `provisional` and
`candidate-not-published`.

## Comparison with the current 1991–2020 release

- 3,384 public scores are numerically comparable; held/null months are excluded.
- Mean exact score change: `+0.1371` points.
- Mean absolute exact score change: `0.3572` points.
- Maximum absolute exact score change: `3.5803` points (Torres del Paine,
  January).
- 17 month-level recommendation-eligibility changes.
- 33 exact critical-component threshold crossings, of which 17 change public
  eligibility and 16 remain blocked or held by another rule.
- 28 destinations change one of their displayed best months, except Torres del
  Paine, which adds January.
- No scientific hold changes.
- No change for any of the 33 reviewed extreme or held destinations.
- No change to any monthly number-one ranking.

### Public eligibility changes

All 17 changes are explained by the existing critical-component gate at an
exact component score of `20`; none is caused by rounding or a new rule.

| Destination | Month | 1991–2020 | 1991–2025 | Crossing |
|---|---:|---|---|---|
| Torres del Paine | January | blocked | eligible | Snow `17.5986 → 32.4731` |
| Garmisch-Partenkirchen | May | blocked | eligible | Snow `12.8674 → 27.0661` |
| Gran Paradiso | October | blocked | eligible | Snow `19.0323 → 23.2565` |
| Gran Sasso | March | blocked | eligible | Snow `19.7581 → 23.8710` |
| Arches | December | blocked | eligible | Snow `17.9677 → 22.3963` |
| Grand Canyon | December | blocked | eligible | Snow `19.0941 → 23.8710` |
| Great Smoky Mountains | February | blocked | eligible | Snow `19.3565 → 22.9932` |
| Cerro Castillo | December | blocked | eligible | Snow `18.8441 → 22.0276` |
| Chapada dos Veadeiros | September | eligible | blocked | Heat stress `22.1537 → 19.8270` |
| Almaty Mountains | June | blocked | eligible | Snow `17.7500 → 23.6825` |
| Coorg | April | eligible | blocked | Heat stress `23.3093 → 19.1698` |
| Flinders Ranges | March | eligible | blocked | Heat stress `21.9220 → 19.2984` |
| Monti Sibillini | December | blocked | eligible | Snow `18.8710 → 22.2734` |
| Kashmir Pahalgam | June | blocked | eligible | Snow `19.9167 → 23.6825` |
| Zhangjiajie | August | eligible | blocked | Heat stress `22.0968 → 19.4988` |
| Cape Breton Highlands | May | blocked | eligible | Snow `19.6057 → 21.9816` |
| Rara | April | blocked | eligible | Snow `17.0000 → 22.6667` |

The newly eligible snow cases reflect lower 35-year snow-day or conditional
snow-depth averages. The four newly blocked heat cases reflect higher hot-day
or severe-hot-day frequencies. These are expected period-extension effects at
a deliberately strict gate boundary.

### Metric stability across all 3,780 months

| Metric | Mean absolute change | 95th percentile | Maximum |
|---|---:|---:|---:|
| Hiking-hours temperature | `0.124 °C` | `0.309 °C` | `0.527 °C` |
| Wet-day probability | `0.00662` | `0.0172` | `0.04424` |
| Monthly precipitation | `3.07 mm` | `9.34 mm` | `74.88 mm` |
| Snow-day probability | `0.00478` | `0.0247` | `0.0949` |
| Conditional snow depth | `0.00525 m` | `0.0294 m` | `0.1198 m` |

The maximum precipitation change is at held Rwenzori and is approximately a
one-percent annual-period change; it does not create a public recommendation or
a new anomaly.

## Golden Cases

The baseline result is 33 agreements, 2 partial agreements, 0 disagreements
and 6 cases without an independent seasonal answer. The corrected candidate is
34 agreements, 1 partial agreement, 0 disagreements and 6 without an answer.

The two changed registry entries were explicitly re-approved by
`ThorfinnThor` on 2026-09-16 for the 1991–2025 period:

1. **Atlas Mountains:** the candidate changes from `[May, June, July]` to
   `[May, June, September]`, which fully agrees with the independent season
   `[April, May, June, September, October]`. The obsolete accepted deviation
   was removed for the candidate period and the case was re-signed.
2. **Annapurna:** the candidate changes from `[May, September, October]` to
   `[May, October, November]`. It now matches two independent months instead of
   one; May remains the documented deviation. The updated deviation was
   re-signed without changing the independent label.

After applying these two period-specific decisions, the candidate Golden gate
passes with 34 agreements, 1 partial agreement, 0 disagreements, 6 cases
without an independent answer and 5 accepted deviations. The signed
post-review comparison has SHA-256
`f546f3559a91165303c19878fb0e6d0159d2873431b6a23640ed8dddb513a0aa`.

Torres del Paine changes from `[February, March]` to
`[January, February, March]` and continues to agree with its independent season.

## Scientific decision

The corrected 1991–2025 candidate passes the period-migration review because:

- the baseline and candidate use the same validity aggregation and scoring
  method;
- overall changes are small;
- every eligibility change is traceable to an exact, existing threshold;
- no hold or reviewed-extreme result changes;
- Golden Case agreement improves; and
- no unexplained metric discontinuity was found.

This decision accepts the **historical-period migration only**. It does not
authorize an automatic threshold or weight change, and it is not itself the
final production-release approval. The Atlas Mountains and Annapurna decisions
are stored as period-specific approvals, so the current 1991–2020 Golden
records remain unchanged until the corresponding public data are migrated.
The snapshot, provenance and public-export migration is complete. The final Sol
audit passed on 2026-09-17 with the selected-model-cell and prohibited-claim
restrictions unchanged. See
`docs/final-scientific-audit-1991-2025-2026-09-17.md`.

The machine-readable decision is recorded in
`data-config/methodology/historical-period-1991-2025-review-v1.json`.
