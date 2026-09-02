# Real-data staging release packet — provenance-complete run

Status: **staging evidence collected; production release still blocked**  
Reviewed: 2026-09-02  
GitHub Actions run: [Refresh real static data #33608647742](https://github.com/ThorfinnThor/best-time-to-hike/actions/runs/33608647742)

This packet supersedes both the older 2026-08-31 packet and run `33564822420`. It was produced with `publish: false`, so it did not modify `data-snapshots/`, `public/data/hiking/`, approval files, or the live Pages deployment. The private GitHub artifact is retained for 14 days as `real-data-staging-33608647742`; its portable inventory is committed as `docs/real-data-staging-33608647742.manifest.json`.

## What was produced

| Item | Result |
| --- | --- |
| Destinations | 5 |
| ERA5-Land unique points | 34 |
| ERA5-Land source downloads | 34 |
| Climate band-month records | 180 |
| Climate normal | 1991–2020 |
| Hourly observations per point | 262,992 for every point |
| Total hourly observations | 8,941,728 |
| Data completeness | 1.0 for every band-month |
| DEM pixels | 17,358,485 |
| Selected sampling points | 34 |
| Maximum terrain mismatch | 266.8 m |
| Fixture snapshots | 0 |
| Artifact inventory | 18 files, 52,617,415 bytes, all SHA-256 recorded |
| Canonical observation hashes | 34 present and unique |
| Importer source hash | `b352a739ca4805de893b2e43a7cfe4ee6de715b57903061a8584e5ab5d3b1d69` |

The staging files are all marked `fixture: false` and use the production source contracts. `snow_cover` is normalized to the canonical fraction, precipitation uses `INCREMENTAL_PER_TIMESTEP_M`, and official ERA5-Land invariant geopotential (`z`, 0.1° grid, `z / 9.80665`) is present for all 34 points.

## What changed from the superseded packet

The 2026-08-31 packet used a GLO-30 terrain median as the temperature-correction reference. Run `33564822420` corrected that separation. This latest run additionally proves the new source chain: all 34 points retain deterministic canonical-output hashes, the exact importer hash, seven-variable unit/normalisation metadata, clamp policies, and exact first/last UTC instants. The 51,898,362-byte invariant NetCDF also matches its pinned SHA-256 exactly.

## Negative artifact evidence

Across 8,941,728 values per variable, the importer clamped 122,741 precipitation values (1.3727%) with a minimum original value of `-5.960464477539063e-8 m`. It clamped 6,454,518 snow-depth values (72.1842%) with a minimum original value of only `-7.3453647229951e-24 m`. Both minima are far above the fail-closed `-1e-6 m` floor. The high snow-depth count represents near-zero signed encoding noise in predominantly snow-free hours; it reinforces the audit requirement to review precipitation and physical snow depth as separate policies before final approval.

## Release decision

No `publish:true` run should be started yet. The repository gates remain correctly closed because:

- source semantics and geometry/elevation provenance are not operator-approved;
- the catalogue contains 5 of the required 50 destinations;
- there are 0 of the required 30 approved Golden cases;
- licensing, legal/operator, accessibility/performance, science-audit and custom-domain approvals remain unset;
- the mask-exclusion evidence, DEM quality-layer policy and time-series fallback decision still need review.

Expansion is now versioned as `5 → 20 → 50` in `data-config/sources/destination-candidates.json`. The first 15 additions can enter geometry/DEM staging after this five-destination evidence review; none should become public before its individual geometry, elevation and data checks pass.

The next safe action is a reviewer decision on those gates. Once the operator records the decisions and approvals, I can start the authorized `publish:true` Action; it will commit the static JSON and Cloudflare Pages will deploy that Git commit automatically.
