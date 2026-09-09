# Review conclusion and next priorities

> Historical priority snapshot. The global observation-validity migration and the fixed ten-case Golden extension were completed afterward. Use `generated/reports/release-report.json` for the current gate inventory.

## El Chalten: what the evidence establishes

The completed run 34139951879 validates retrieval and aggregation, not hiking
representativeness. The route-intersecting cell remains snow-covered in every
monthly aggregate and provides no eligible month. The earlier lower cell had a
plausible summer but no intersection with the mapped routes. Neither is approved.

This does not establish that ERA5-Land is unusable throughout El Chalten. It
establishes that neither tested replacement supports the intended claim.
Coarse-grid terrain and snow representativeness remain the working explanation,
not an independently demonstrated cause. A route crossing a cell is necessary
spatial evidence, but it does not validate that cell's snow climate for that route.

ECMWF documents a native resolution of approximately 9 km and distribution on a
0.1-degree grid. The Argentina National Parks overview describes seasonal visits
and winter snow restrictions, rather than year-round closure. This qualitative
regional evidence warrants investigating the mismatch, but is not a quantitative
snow observation or a replacement Golden label for specific trails.

Sources checked 2026-09-07:
- https://confluence.ecmwf.int/pages/viewpage.action?pageId=505384848
- https://www.argentina.gob.ar/node/302065
- https://github.com/ThorfinnThor/best-time-to-hike/actions/runs/34139951879

Keep El Chalten review-only. Do not weaken snow thresholds, substitute expected
seasons for measured inputs, or launch more full-series candidate downloads
without a written trail scope and independent snow evidence. The static
architecture does not need to change for this decision.

## Ordered work

1. **Sol: source and scientific audit.** Resolve source-semantics evidence and
   review the six Golden exceptions: Atlas, Mount Kenya, Annapurna, Langtang,
   Zermatt and El Chalten. Prioritize checks that affect all 315 destinations,
   including snow-variable semantics, completeness, score claims and sampling
   representativeness. Keep accepted exceptions distinct from scientific agreement.
2. **Sol: exceptional destinations.** Define the supported hiking scope for
   El Chalten, Zermatt and Garhwal; compare model snow with independent evidence
   before considering any alternative cell or source. Annapurna also needs
   route and seasonal QA. A retained no-recommendation page is an acceptable
   release outcome, not a reason to fabricate a score.
3. **Luna: technical release evidence.** Verify deployed EN/DE finder, rankings,
   comparison, withheld pages, mobile layout, accessibility and performance.
   Record results and fix defects; passing checks does not itself grant approval.
4. **Operator plus relevant reviewer: release approvals.** Seven blockers remain:
   source semantics, geometry/elevation, licensing/attribution, legal/operator,
   accessibility/performance, scientific audit and custom production domain.
   Implement missing approved details with Luna; do not self-sign operator decisions.
5. **Luna after approval: release and expansion.** Publish the approved static
   build on Cloudflare, verify it, and only then broaden the catalogue using the
   same checks. There are already 315 published destination records; more records
   are not the current bottleneck. Keep noindex until production gates pass.

Current verified report: 31 Golden cases (25 agree, four partly agree, two have
no answer), seven production blockers. CI and static rebuild for commit 9778f9b
completed successfully. This document changes no source data or approval flag.
