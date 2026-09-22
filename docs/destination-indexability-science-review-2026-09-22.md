# Destination indexability science review — 2026-09-22

## Decision

The 29 destination guides in `data-config/seo/destination-indexability-science-v1.json` are scientifically cleared for search indexing under the existing **selected-model-cell climatology** claim. This is an indexability decision, not an increase in the numerical climate confidence and not a general production approval.

All current scored months retain the provisional single-point confidence cap of **64 / low**. The pages may be indexed because the public answer is explicitly limited to what the evidence supports: historical climatology for one named ERA5-Land cell, accompanied by an independently labelled hiking season and an explanation of the spatial limitation.

## Reproduced evidence

The automated review reproduces every approved destination against `generated/reports/science-audit.json` and the signed Golden Cases. All 29 pass:

| Check | Result |
| --- | ---: |
| Recommendation-eligible and without a hold | 29 / 29 |
| Complete internal coordinate chain | 29 / 29 |
| Complete approved-period source observations | 29 / 29 |
| Spatial audit errors | 0 |
| Independent climate-diagnostic flags | 0 |
| Signed Golden Case verdict `agrees` | 29 / 29 |
| Golden Case errors or scientific-review exclusions | 0 |
| At most 20 km from the configured point, or independent route evidence | 29 / 29 |

Twenty-eight selected cells lie no more than 13.04 km from their configured destination coordinate. Denali is the single distance exception at 74.32 km: its selected cell intersects the official NPS Savage Canyon Trail geometry and the audit records `independentRouteEvidence=true`. Torres del Paine uses the documented eastern trail-sector override at 13.04 km to avoid the western permanent ice-field indicator cell.

The independent NASA POWER comparison is a conservative flagging diagnostic, not station truth. A page is not approved merely because it has no flag; the decision requires the entire evidence conjunction above.

## Claim boundary

The approval permits:

- a historical 1991–2025 climatology for the selected ERA5-Land model cell;
- a transparent relative climate-fit index;
- comparison with the signed independent season label;
- explicit discussion of months that pass or fail the project's climate gate.

It does not permit:

- a claim that the cell represents every route or the entire named region;
- current weather, forecasts, trail conditions or safety advice;
- removal or inflation of the 64/low climate-confidence cap;
- automatic approval of any destination outside the fixed 29-page list.

## Fail-closed behavior

The test suite joins the signed allowlist back to the final science audit. A missing destination, changed audit status, broken coordinate chain, incomplete source record, new spatial or independent-diagnostic flag, failed Golden Case, excessive distance without route evidence, or unsupported claim scope fails the build. The sitemap remains empty while the public manifest is `provisional`.

## Remaining production boundary

The scientific SEO review is complete. The release report remains `blocked-for-production` for three independent approvals only:

1. legal and operator details;
2. accessibility and performance;
3. custom production domain.

Those approvals must not be inferred from this science decision.
