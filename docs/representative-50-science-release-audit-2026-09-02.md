# Representative-50 scientific release audit

Status: **audited source build NO-GO; corrected v1.1.0 build received conditional provisional GO after re-audit**
Reviewed: 2026-09-02
Audited source commit: `809ea80` (`data: publish 50 representative ERA5-Land destinations`)
Safety boundary: this audit changed no climate, DEM, sampling, scoring, approval or deployment state. All release approvals remain `false`.

Final re-audit: the v1.1.0 corrective build passed the recommendation, persistent-snow hold, confidence, search, ranking, comparison, provenance, schema, TypeScript, test and static-build gates. It contains 50 provisional destinations and 600 destination-months: 244 are recommendation-eligible and 356 are ineligible. Search exposes 46 destinations and only eligible months. This is a conditional GO solely for a clearly labelled, `noindex` provisional beta; production remains NO-GO with all approval flags unchanged.

## Executive decision

The committed source chain is structurally strong: all 50 destinations have one explicit ERA5-Land grid cell, official invariant model orography, an exact 1991–2020 hourly series, complete unit and normalization metadata, canonical hashes and 12 monthly aggregates. The 50 time series contain 13,149,600 hourly observations and no official `snow_depth >= 10 m` glacier-indicator hour. The recorded physical values remain inside their declared contracts.

The recommendation layer is not scientifically safe to keep live in its present form. Three independent defects make the current build a NO-GO:

1. The additive overall score lets an unusable component be fully compensated by other components. Sikkim therefore publishes July–September as its best months with scores of 79 despite 99.67–100% wet days and 513.0–1,023.6 mm mean monthly precipitation. Annapurna publishes June–August as best at 99.78–100% wet days and 360.2–575.7 mm.
2. Zermatt and El Chaltén each have `snowDayProbability = 1` in all 12 months, but the already versioned persistent-snow manual review gate is not applied by the one-point publication path.
3. Every one of the 600 destination-months is labelled high confidence (89–93%). In this release the model elevation is assigned as its own target, the elevation mismatch is therefore zero by construction, and the one-cell terrain relief is also zero. The resulting number is not a valid high-confidence statement about destination-level hiking representativeness.

The operator has adopted the conservative provisional-release rules in this report. They are new release policy and must be encoded and tested before another provisional publication. They do not constitute production science approval.

## Audited inventory and checks that passed

| Check | Result |
| --- | --- |
| Destination climate / sampling / elevation snapshots | 50 / 50 / 50 |
| Public destination-months | 600 |
| Hourly observations | 262,992 per point; 13,149,600 total |
| Requested UTC coverage | `1991-01-01T00:00:00Z` through `2020-12-31T23:00:00Z` at every point |
| Climate-normal/sample years | 1991–2020 and 30 sample years for every month |
| Source and canonical hashes | 50 unique download SHA-256 values and 50 unique canonical-observation SHA-256 values |
| ERA5-Land point/orography agreement | All sampling coordinates and model elevations agree with the climate request and pinned invariant grid, subject only to the harmless Lake District floating-coordinate notation noted below |
| Source variables | `tp` in m, `snowc` `% -> 0..1`, physical snow height `sde` in m, `t2m/d2m` in K and `u10/v10` in m s^-1 for all 50 downloads |
| Precipitation semantics | `INCREMENTAL_PER_TIMESTEP_M` for the de-accumulated time-series product at all points |
| Official glacier sentinel | Threshold 10 m, zero indicator hours across all points; maximum observed source snow height 9.09765625 m |
| Negative packing artifacts | 142,681 precipitation values, minimum `-5.960464477539063e-8 m`; 6,436,754 snow-height values, minimum `-7.3453647229951e-24 m`; all are well inside the local `-1e-6 m` fail-closed floor and were recorded/clamped |
| Monthly physical ranges | Temperature mean -16.1–33.2 C; wet-day probability 0.0022–1; precipitation 3.9–1,023.6 mm/month; snow probability 0–1; snow height 0–7.7 m; wind mean 2.1–32.9 km/h; daylight 0.4–24 h; RH 18.5–92.6% |
| Polar behavior | Lofotodden records 24 h mean daylight in June and 0.4 h in December; its best months are June–August, so no polar-season inversion was found |
| Public manifest | `provisional`, 50 destinations, 48 ranking files, 154 checksummed files |

Authoritative source contracts are the [ERA5-Land time-series Product User Guide](https://confluence.ecmwf.int/spaces/CKB/pages/576394633/ERA5-Land+hourly+time-series+data+on+single+levels+from+1950+to+present+Product+User+Guide+PUG), the [CDS time-series catalogue and DOI 10.24381/ee82e357](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land-timeseries), and the [ERA5-Land documentation and invariant fields](https://confluence.ecmwf.int/spaces/CKB/pages/140385202/ERA5-Land+data+documentation). The repository source-semantics implementation was previously reviewed in `docs/science-data-pre-audit-2026-09-01.md`.

## Findings by severity

### BLOCKER B1 — compensatory scores generate false best-month recommendations

`lib/scoring/index.ts` calculates a fully additive weighted average. `scripts/export/export.ts` then publishes the three numerically highest months unconditionally and ranks every destination by that same value. There is no non-compensatory eligibility state.

Concrete failures:

| Destination/month | Wet days | Heavy-rain days | Mean precipitation | Precipitation component | Overall | Published effect |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Sikkim Jul | 100% | 94.09% | 1,023.6 mm | 0 | 79 | best month; global and warm/snow-free ranking entry |
| Sikkim Aug | 100% | 86.99% | 870.5 mm | 0 | 79 | best month |
| Sikkim Sep | 99.67% | 55.89% | 513.0 mm | 0 | 79 | best month |
| Annapurna Jun | 99.78% | 74.22% | 360.2 mm | 1 | 73 | best month |
| Annapurna Jul/Aug | 100% | 74.19% / 59.78% | 575.7 / 500.2 mm | 0 | 75 / 74 | best months |
| Everest Jul/Aug | 100% / 99.89% | 66.67% / 54.52% | 517.1 / 419.9 mm | 0 | 75 / 77 | global and snow-free ranking entries |

This is not a data-range error; it is a decision-model error. A rain component of zero is offset by snow-free, wind, heat and daylight components. The same issue can affect months with zero snow, temperature, heat or wind utility.

**Adopted minimum provisional rule:** calculate the gate from the unrounded component values. If any critical component (`temperature`, `precipitation`, `snow`, `heatStress`, `wind`, `daylight`) is `<= 20`, set `recommendationEligible = false`, cap the displayed overall score at 49 / `poor`, exclude the month from `bestMonths` and every ranking/theme, and show an explicit unsuitable/trade-off status. Never fill the result back to three months; zero, one or two eligible best months are valid. The `20` critical floor and 49 cap are a conservative operator decision aligned with the existing curves and the existing `poor < 50` level, not a previously approved scientific threshold.

### BLOCKER B2 — the known twelve-month persistent-snow gate is bypassed

`data-config/methodology/era5-land-representativeness-v1.json` sets `persistentSnowReviewMonthCount` to 12. The prior candidate audit explicitly requires 12 snow-covered months below the 10 m official sentinel to trigger manual route-representativeness review. The provisional import path only blocks the official `>=10 m` source sentinel.

| Destination | Months with snow probability 1 | Monthly mean snow height range | Maximum source snow height | Decision |
| --- | ---: | ---: | ---: | --- |
| Zermatt | 12/12 | 2.9–4.9 m | 6.498046875 m | hold |
| El Chaltén | 12/12 | 6.0–7.7 m | 9.09765625 m | hold |

Passing the official 10 m sentinel is not evidence that a cell is representative hiking terrain. It only means the official hard glacier-indicator value was not reached.

**Adopted minimum provisional rule:** hold Zermatt and El Chaltén out of home cards, rankings, `bestMonths` and recommendation pages until a human-reviewed hiking-corridor/cell decision clears the anomaly. A provenance-only evidence page may remain only if it carries no hiking score or best-month claim. Re-entry requires documented corridor evidence and a repeated 30-year sentinel/persistent-snow check.

### HIGH H1 — the one-point confidence score overstates destination representativeness

All 600 public months are labelled `high` confidence at 89–93%. The representative batch sets `targetElevationM` equal to `representativeModelElevationM`, so `meanElevationMismatchM = 0`. It also represents the cell as one elevation pixel, so `terrainReliefM = 0`. Both receive ideal confidence contributions even though neither measures how well the point represents routes across the destination. The one-point spatial subscore of 55 receives only 15% weight and cannot prevent a high total.

Sikkim July illustrates the semantic failure: its confidence is 93/high even while the suitability recommendation is invalid and its single point has no reviewed route-network coverage.

**Adopted minimum provisional rule:** for exactly one representative point whose destination-level geometry/elevation scope is not explicitly operator-approved, cap confidence at 64 and label it `low`. This derives the cap from the existing `moderateMinimum = 65` boundary and prevents a high/moderate destination-representativeness claim. After explicit representative-cell review, an operator may choose a separate at-most-moderate cap (84, immediately below the existing high threshold of 85). The UI should distinguish source-record completeness from destination representativeness rather than combining them into one unexplained percentage.

### HIGH H2 — unvalidated grid wind supplies optimistic score points

The versioned representativeness decision marks wind `review-required` with `productionGate: blocked`, because 10 m ERA5-Land grid wind is not an exposed-trail wind/gust model. In the 50-point release, 43 destinations have zero configured high-wind hours in every month, and 506 of 600 months receive a wind component of 100. That component contributes up to ten overall points and materially helps compensate unusable rain or snow.

For an honest provisional beta, wind must not be described as exposed-route safety. Until a validated exposure/gust method exists, either remove wind from recommendation eligibility/overall scoring and explicitly version the replacement weights, or label it strictly as coarse 10 m grid-cell wind and prevent it from improving a hard-ineligible month. The adopted B1 gate is the minimum immediate protection; final wind handling remains a science/operator decision.

### HIGH H3 — UI and exported provenance contain incorrect one-point claims

The top beta notice correctly says the product uses one representative model-grid cell. Other live copy contradicts that scope:

- `components/home/TrustSection.tsx` claims low, middle and high elevations are evaluated separately and combined. The current 50 destinations all have exactly one `representative` band.
- `components/hiking/Pages.tsx` uses the month-section heading “From low ground to the mountains” even for the one-band build.
- The destination scope copy says the score uses the “nearest” ERA5-Land cell. Five explicit overrides are intentionally not simply the nearest configured centroid cell: Zermatt, Grindelwald, Annapurna, Everest Region and Torres del Paine.
- Public destination JSON exposes the display centroid and generic source labels but not the actual representative-cell coordinate, override label/reason, invariant hash or model height provenance needed to audit the displayed score.

The override file itself is structurally explicit, and source climate/invariant coordinates agree. The offsets from display centroid to selected model cell are approximately 4.5 km (Zermatt), 10.9 km (Grindelwald), 13.0 km (Torres del Paine), 16.9 km (Annapurna) and 38.5 km (Everest Region). The latter four particularly need cited hiking-corridor evidence before destination-representativeness approval.

**Required provisional fix:** make all global/month copy one-point-specific; say “selected representative cell,” not “nearest,” when an override exists; export and render the resolved cell coordinate, model elevation and override reason; retain the whole-region/route-specific limitation next to the score.

### HIGH H4 — release evidence reports describe the superseded fixture build

`generated/reports/data-quality.json` and `generated/reports/release-report.json` still describe a five-destination fixture dataset (`fixture-2026-08-31.1`), while the public manifest describes 50 provisional destinations. The public manifest and checksums are internally consistent, but the named release/quality reports are not evidence for the live build.

Regenerate and review both reports after the Luna corrections. The new report must identify the 50-point provisional dataset, the two held destinations or revised public count, the recommendation-ineligibility counts, one-point confidence caps, sentinel/persistent-snow decisions and all public checksums. Approval flags must remain unchanged.

### MEDIUM M1 — the exact UTC normal does not provide exact endpoint local days

All source downloads contain the exact 262,992 hourly UTC instants for 1991–2020. Conversion to destination local dates leaves one boundary month slightly incomplete for non-zero-offset time zones: 27 of 600 monthly completeness values are 0.9994–0.9999. Sample-year count remains 30 and no large gap exists, but one endpoint local day is partial and yearly precipitation totals can omit that day under the daily completeness gate.

For the next full refresh, request sufficient UTC padding before and after the normal, aggregate, and then trim to local dates `1991-01-01` through `2020-12-31`. Record both requested UTC coverage and retained local-date coverage. This is not the cause of the ranking blockers.

### MEDIUM M2 — destination/cell granularity remains a planning-level catalogue risk

The 50-point catalogue mixes broad regions and nearby subregions (for example Dolomites, Alta Badia and Cortina d'Ampezzo). This can make global rankings appear more diverse than their underlying climate cells and double-count closely related destination concepts. It was already identified in the planning audit and remains unresolved. Add an explicit destination taxonomy/parent relationship before production indexing.

### LOW L1 — nominal grid coordinates have harmless floating representations

Lake District is stored as longitude `-3.200012` from the pinned invariant grid and resolves as about `-3.2` in the time-series response. Both products select the same nominal 0.1-degree cell and the model elevations agree. Equality checks should continue using nominal grid indices or the existing tolerance rather than decimal-string identity.

### LOW L2 — polar-day/night calculations are plausible, but the daylight curve has a non-zero floor

The polar implementation and tests correctly preserve astronomical 24/0-hour states while using a deterministic local clock window for weather sampling. In the current output Lofotodden does not receive a false winter recommendation. However, the daylight curve awards 20 points for every value at or below 8 hours, including near-zero daylight. The adopted `<=20` recommendation gate prevents such a month from becoming a best/ranking month; a later methodology revision should decide whether the daylight component itself should reach zero during polar night.

## Verification performed

- `node --import tsx --test tests/*.test.ts` — 43/43 tests passed, including polar dates, historical two-hour time-zone changes, precipitation semantics, source contracts and current export inventory.
- `node --import tsx scripts/validate/validate.ts` — passed: 50 destinations and 155 public files.
- `./node_modules/.bin/tsc --noEmit` — passed.
- `generated/intermediate/data-venv/bin/python3 -m unittest tests/test_download_era5.py` — 4/4 passed.
- Independent read-only audit across all 50 sampling, climate, invariant and public destination artifacts — source/coordinate/elevation/provenance/range results summarized above.

The standard `pnpm` wrapper attempted a dependency-store refresh and could not run offline/non-interactively, so the equivalent installed binaries were invoked directly. No dependency files changed; the pre-existing untracked `.pnpm-store/` was not modified by this audit.

## Release recommendation and operator actions

### Current build

**NO-GO for the current provisional live build.** The raw ERA5-Land monthly data may be retained as evidence, but the present best-month, ranking and high-confidence claims should not remain user-facing.

### Conditional provisional GO

A new provisional beta can receive a conditional GO only after all of the following are true:

1. Luna implements the adopted unrounded `<=20` critical-component eligibility gate, 49/poor cap, non-padding `bestMonths`, and ranking exclusion with regression tests for Sikkim, Annapurna, Everest, 100% snow and polar daylight.
2. Zermatt and El Chaltén are held out of recommendations under the existing 12-month persistent-snow gate, or separately cleared by documented human corridor/cell review.
3. Exactly-one-point, unapproved-scope confidence is capped at 64/low and the UI distinguishes record completeness from destination representativeness.
4. One-point and override UI/provenance claims are corrected, including selected grid coordinate, model height and override rationale.
5. All public files are regenerated, validation passes, the scientific anomaly scan returns no hard-ineligible best/ranking month, and the 50-point release/data-quality reports are regenerated and reviewed.

This conditional GO applies only to an explicitly labelled, noindex provisional beta. Production remains NO-GO while the repository approvals remain false and the wind, corridor/override, taxonomy and other production-science decisions are unresolved.

Luna can implement the mechanical gate, cap, hold filtering, export/UI fields and regression tests. Sol should review the regenerated anomaly table and the final semantics before the next provisional publication. No approval flag should be changed by either implementation step.
