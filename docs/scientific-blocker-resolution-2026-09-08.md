# Scientific blocker resolution — 2026-09-08

## Decision boundary

This review can approve deterministic processing and conservative publication controls. It cannot impersonate an independent domain expert or the site operator. `productionReleaseApproval` therefore remains `false`.

## 1. Spatial evidence and claim scope

The internal coordinate, selected-cell, model-elevation, source-request and public-provenance chain passes for all 315 destinations. Independent named-route geometry exists for Denali only.

The release class is therefore narrowed to **selected-model-cell climatology**. The public scope text must say that every result describes the selected representative ERA5-Land cell. The site may not describe these values as whole-destination, regional, named-route, route-condition or safety evidence. On that narrow claim, missing route geometry is a prohibited-claim boundary rather than hidden evidence debt.

## 2. Observation-validity migration

All 315 destinations now use `observation-validity-v1`. Cache-only GitHub Actions run `34251408255` recomputed every destination from the exact canonical hourly observations already referenced by the published snapshots. The global migration review verified:

- exactly 315 unique report/source pairs;
- identical cached and published canonical source hashes;
- the exact 1991–2020 hourly series and deterministic boundary-aware local-day coverage;
- twelve ordered monthly results with no missing scoring input;
- matching source and selected-cell coordinates;
- a hash-pinned decision record; and
- continued provisional status and all existing review holds.

The review approved only a global **provisional** migration. It did not approve production, remove any scientific hold, broaden the claim beyond one selected model cell, or validate route conditions, safety, forecasts or independent expert certification. After the versioned snapshots and public exports were rebuilt, the formal science audit passed with zero automated scientific blockers and the same claim restrictions.

## 3. Independent precipitation disagreements

NASA POWER/MERRA-2 is used as an independent diagnostic, not as a replacement truth. Thirty destinations exceed the configured threefold annual-precipitation disagreement threshold. Their provenance pages remain available, but scores, rankings, Finder results and best-month recommendations are withheld under `precipitation-validation` until the disagreement is resolved independently. No values are smoothed, blended or silently substituted.

## 4. Grid-cell wind

ERA5-Land 10 m grid wind is not validated as exposed-trail wind or gust risk. Its scoring weight is zero, and it is absent from critical-component gates and best-month selection. The metric remains visible only as contextual provenance with an explicit caveat.

## 5. Weights and thresholds

The calibration evaluates 1,134 parameter combinations against independent signed season labels using a deterministic destination-level hash split. After the fixed ten-destination extension was approved as a whole on 2026-09-09, the registry contains 41 signed labels. Six labels are excluded because their destinations are under snow or precipitation review holds. The remaining 35 cases split into 27 training and 8 untouched validation cases.

The training optimum improves mean training F1 from 0.7861 to 0.8019 but does not improve validation F1: both it and the conservative baseline score 0.7396. Changing the published parameters is therefore not empirically justified. The retained policy uses wind-free normalized weights, a critical-component floor of 20 and a best-month component floor of 5. This calibrates descriptive season alignment only; it does not validate probabilities, forecasts, trail conditions or safety advice.

## Remaining release boundary

The five scientific evidence and calibration issues in this review are now handled: the claim scope is narrowed, all 315 snapshots are migrated, the 30 precipitation disagreements are quarantined, wind is excluded from scoring, and calibration retains the baseline because no candidate improved validation performance.

Production remains a separate decision. Withheld Golden destinations are quarantined without changing their signed reference months. The fixed extension raises the set to 41 signed cases and 35 currently evaluable cases, so the Golden production gate now passes. Six explicit operator approval flags and the separate source-semantics approval gate remain untouched.
