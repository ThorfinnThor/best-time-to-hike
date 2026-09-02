# Real-data staging release packet — corrected run

Status: **staging evidence collected; production release still blocked**  
Reviewed: 2026-09-02  
GitHub Actions run: [Refresh real static data #33564822420](https://github.com/ThorfinnThor/best-time-to-hike/actions/runs/33564822420)

This packet supersedes the older 2026-08-31 packet. It was produced with `publish: false`, so it did not modify `data-snapshots/`, `public/data/hiking/`, approval files, or the live Pages deployment. The private GitHub artifact is retained for 14 days as `real-data-staging-33564822420`.

## What was produced

| Item | Result |
| --- | --- |
| Destinations | 5 |
| ERA5-Land unique points | 34 |
| ERA5-Land source downloads | 34 |
| Climate band-month records | 180 |
| Climate normal | 1991–2020 |
| Hourly observations per point | 262,992 for every point |
| Data completeness | 1.0 for every band-month |
| DEM pixels | 17,358,485 |
| Selected sampling points | 34 |
| Maximum terrain mismatch | 266.8 m |
| Fixture snapshots | 0 |

The staging files are all marked `fixture: false` and use the production source contracts. `snow_cover` is normalized to the canonical fraction, precipitation uses `INCREMENTAL_PER_TIMESTEP_M`, and official ERA5-Land invariant geopotential (`z`, 0.1° grid, `z / 9.80665`) is present for all 34 points.

## What changed from the superseded packet

The previous packet used a GLO-30 terrain median as the temperature-correction reference. This run contains the corrected separation: GLO-30 is retained for terrain matching, while ERA5-Land invariant geopotential supplies `era5LandGridElevationM` for the lapse correction. The old packet must not be used for approval.

## Release decision

No `publish:true` run should be started yet. The repository gates remain correctly closed because:

- source semantics and geometry/elevation provenance are not operator-approved;
- the catalogue contains 5 of the required 50 destinations;
- there are 0 of the required 30 approved Golden cases;
- licensing, legal/operator, accessibility/performance, science-audit and custom-domain approvals remain unset;
- the mask-exclusion evidence, DEM quality-layer policy and time-series fallback decision still need review.

The next safe action is a reviewer decision on those gates. Once the operator records the decisions and approvals, I can start the authorized `publish:true` Action; it will commit the static JSON and Cloudflare Pages will deploy that Git commit automatically.
