# Science and data pre-audit — 2026-09-01

Status: **pre-audit completed; science/data production approval not recommended yet**  
Scope: ERA5-Land and Copernicus DEM handling, masked-cell evidence, elevation sampling for the five staged destinations, the staging release packet, and the 45 planning-only destination candidates.  
Safety boundary: this review did not change any approval flag, run `publish:true`, replace a committed production snapshot, or deploy anything.

## Executive result

The implemented ERA5-Land variable semantics are substantially correct:

- `reanalysis-era5-land-timeseries` total precipitation is already de-accumulated to hourly increments in metres; a second de-accumulation would be wrong.
- `snow_cover` is delivered with `%` units and is correctly divided by 100 before the canonical 0–1 contract is enforced.
- physical snow height is `snow_depth` / ECMWF short name `sde`, in metres. ECMWF `sd` is snow water equivalent and is correctly not accepted as the physical-height alias.
- material negative precipitation, non-fractional snow cover, material negative snow height, missing variables, unexpected units and non-contiguous time coordinates fail closed.

At the time of this pre-audit, two methodology issues blocked a science/data approval. First, `gridElevationM` was a 1 km Copernicus GLO-30 median, not the official ERA5-Land grid orography, yet it was used as the reference for a post-hoc temperature lapse correction. Second, the destination polygons, elevation bands and band weights did not carry reviewable geographic/trail-source provenance. The current approval gates correctly remain false.

Implementation update, 2026-09-01: H1 has been corrected in code. The sampler now labels the GLO-30 window median `terrainElevationM` and uses it only for terrain matching. A hash-pinned importer extracts `z` from ECMWF's official 0.1° ERA5-Land invariant NetCDF, converts it with `z / 9.80665`, verifies that the time-series and invariant products resolve to the same grid coordinate, and passes only `era5LandGridElevationM` to the lapse correction. The previous 34-point staging artifact was superseded and required a rebuild; the corrected rebuild is recorded below. H2 and the remaining findings still block science/data approval.

Corrected staging evidence, reviewed 2026-09-02: GitHub Actions run [#33564822420](https://github.com/ThorfinnThor/best-time-to-hike/actions/runs/33564822420) completed successfully with `publish:false`. It contains 34 production-marked source points, 262,992 observations per point, 180 complete band-month records, and official invariant-orography metadata for all 34 points. H1 is therefore resolved for the rebuilt staging evidence; H2 and the remaining findings still block science/data approval. See `docs/release-packet-real-data-staging-2026-09-02.md`.

## Authoritative sources reviewed

Accessed 2026-09-01:

1. [ERA5-Land ARCO Product User Guide, current version](https://confluence.ecmwf.int/spaces/CKB/pages/536218894/ERA5-Land+hourly+Analysis+Ready+Cloud+Optimised+ARCO+data+on+single+levels+from+1950+to+present+Product+User+Guide+PUG): the ARCO process de-accumulates accumulation variables; the parameter tables identify total precipitation as de-accumulated, snow cover as `%`, and snow depth as `m`; point requests are mapped to the 0.1° grid. The guide also says this access path may be disabled or deprecated, may change format/structure and has lower operational support than the parent entry.
2. [ERA5-Land time-series catalogue](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land-timeseries?tab=overview), DOI [10.24381/ee82e357](https://doi.org/10.24381/ee82e357): hourly, 0.1° regular-grid time-series; nearest grid point selection; NetCDF/CSV; snow cover `%`, snow depth `m`.
3. [ERA5-Land data documentation](https://confluence.ecmwf.int/pages/viewpage.action?pageId=177471794): ECMWF provides the land-sea mask and geopotential/orography used for ERA5-Land on the 0.1° grid. These are the appropriate invariant fields for land masking and grid-height reference.
4. [ECMWF parameter database: physical snow depth (`sde`, ID 3066)](https://codes.ecmwf.int/grib/param-db/3066) and [snow water equivalent (`sd`, ID 141)](https://codes.ecmwf.int/grib/param-db/141): these are distinct quantities and units.
5. [ECMWF negative precipitation accumulation FAQ](https://confluence.ecmwf.int/spaces/UDOC/pages/208501579/Why+are+there+sometimes+small+negative+precipitation+accumulations+-+ecCodes+GRIB+FAQ): de-accumulation of packed values can create small negative or positive artifacts; threshold selection is product- and use-case-specific.
6. [Copernicus DEM Product Handbook v5.0](https://dataspace.copernicus.eu/sites/default/files/media/files/2024-06/geo1988-copernicusdem-spe-002_producthandbook_i5.0.pdf): GLO-30 DGED is a 32-bit edited digital surface model in geographic WGS84-G1150, vertical datum EGM2008 (EPSG:3855), vertical unit metres; it provides Editing, Filling, Height Error and Water Body quality layers.
7. [Copernicus DEM catalogue/licensing page](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM), DOI [10.5270/ESA-c5d3d65](https://doi.org/10.5270/ESA-c5d3d65): product identity, attribution obligations and public GLO-30/GLO-90 licence information.

## Findings by severity

### High — release blockers

#### H1. The lapse correction does not use ERA5-Land grid orography

Resolution status (2026-09-01): **implemented in code; corrected staging evidence still required.** The historical finding below describes the superseded implementation.

`scripts/geo/build-sampling.ts` sets `gridElevationM` to the median GLO-30 DSM height within 1 km of the nominal 0.1° coordinate. `lib/hiking/climate.ts` and `lib/scoring/index.ts` then apply a fixed `-6.5 °C/km` correction from that value to the elevation-band median.

The GLO-30 local median is valuable for selecting terrain near the point, but it is not the surface height represented by ERA5-Land's model grid. ECMWF publishes the actual ERA5-Land geopotential/orography invariant. In steep terrain, the unknown difference between model orography and the 1 km DSM proxy can be larger than the recorded `elevationMismatchM`; therefore the current confidence metric does not bound the temperature-correction error.

Observed scope: 34 selected points; 1–3 points per band; recorded GLO-30 target mismatch ranges up to 266.8 m, so the correction computed from the proxy is at most 1.73 °C. That number does **not** bound error relative to ERA5-Land model orography.

Required resolution: ingest the official ERA5-Land geopotential at every selected grid point, convert it to model elevation with a documented convention, use it as the lapse-correction reference, and retain the GLO-30 value separately for terrain matching. Alternatively, remove the post-hoc correction and validate uncorrected results against Golden cases. Rebuild staging after either change.

#### H2. Destination geometry, band definitions and weights lack auditable provenance

The five polygons are coarse, manually encoded polygons with only `destinationId` properties. The configured elevation band cut-offs and weights have no cited trail network, park/massif boundary, hiking-use distribution or named reviewer. GLO-30 band coverage is internally coherent (Madeira and Mallorca 100%, Tenerife 99.99%, Chamonix 96.65%, Dolomites 95.05%), but coverage alone does not establish that the polygon or weighting represents where users hike.

Required resolution: for each destination, record the boundary/trail source, licence, version/date, intended hiking scope, excluded water/urban/glacier areas, band rationale, weight rationale and reviewer. Visual review and representative trail/POI checks are required before setting `destinationGeometryAndElevation.approved`.

### Medium — material evidence or robustness gaps

#### M1. Mask exclusions are plausible but under-evidenced

The four Madeira/Mallorca exclusions record only one diagnostic date (`2020-01-01`) and the non-missing count for 2 m temperature. The Madeira reason says every required variable is masked, but the committed evidence contains only temperature. Workflow instance IDs are recorded, yet no immutable diagnostic output or response checksum is committed with the exclusion.

The successful staged outputs for the remaining selected points have 30 valid years and completeness 1.0, so this finding does not indicate missingness in selected cells. It does mean the exclusion decisions themselves are not independently reproducible from Git.

Required resolution: use ECMWF's invariant 0.1° land-sea mask as primary evidence and attach a small, checksummed diagnostic record for every exclusion. If a runtime probe is retained, test all required variables across multiple dates/seasons and store resolved coordinates, units, missing counts and source-response hash.

#### M2. DEM water and quality layers are not ingested

The importer reads only the GLO-30 elevation TIFF and excludes elevations `<= 0 m`. That removes ocean-zero cells for the current above-sea-level scope but does not identify positive-elevation lakes/rivers, edited/filled terrain, local height error, forest canopy or buildings. Copernicus explicitly provides Water Body, Editing, Filling and Height Error layers. This becomes material for planned destinations such as Lake District, Salzkammergut, Jotunheimen, Banff, Fiordland and Cradle Mountain.

Required resolution: ingest at least WBM and retain EDM/FLM/HEM quality summaries. Exclude or explicitly classify water pixels before calculating band medians and point-window elevations. Document that GLO-30 is a DSM.

#### M3. The canonical source chain is not fully reproducible from release artifacts

Raw metadata records variable names, units, normalisation and clamp counts, but the final climate snapshot's `sourceDownloads` retains only request, resolved location, observation count, download hash and retrieval time. The canonical NDJSON output has no recorded checksum, and `fetch-era5.ts` does not re-assert dataset ID, per-variable units/normalisation or clamp policy before reuse. There are no committed automated tests that directly exercise `download_era5.py`'s NetCDF parsing and transformation functions.

The release packet supplies a private R2 key and archive SHA-256 but no committed per-file manifest or normalisation summary. This audit could inspect the local staged DEM/sampling outputs; it could not independently re-download the private archive because the current Wrangler OAuth token was expired.

Required resolution: hash the canonical NDJSON, persist importer/version checksums and the essential unit/normalisation/clamp metadata into the climate provenance, commit or attach a non-sensitive per-file artifact manifest, and add deterministic Python tests with synthetic NetCDF fixtures.

#### M4. The `-1e-6 m` negative-value floor is a local policy, not an ECMWF threshold

ECMWF confirms that de-accumulating packed precipitation can create small signed artifacts, but its threshold examples are context-specific and do not prescribe `-1e-6 m`. The current hard fail below that floor is conservative relative to the observed staged precipitation minimum and is operationally reasonable, but it must be documented as a versioned local decision. Snow depth is instantaneous physical height, so the precipitation packing FAQ is not direct evidence for applying the same numeric floor to snow depth.

Required resolution: add committed importer tests at the exact boundary, retain empirical distributions of clamped values per download, and review separate precipitation and snow-height tolerances after a larger destination sample.

#### M5. The time-series access path needs a production fallback

The current ECMWF guide says the ARCO time-series entry has lower operational support than the parent ERA5-Land entry and may be disabled, deprecated or structurally changed. The importer's strict unit/shape checks are good, but no fallback or source-change monitor is documented.

Required resolution: define a tested fallback to the parent `reanalysis-era5-land` product with explicit de-accumulation, or formally accept the availability risk and add a source-contract canary.

#### M6. The 45-candidate plan contains taxonomy overlap

The file is correctly marked `planning-only`, has 45 unique IDs, valid coordinate ranges, valid IANA time zones and complete region requirements. However, candidate Alta Badia is only about 1.3 km from the current Dolomites centroid and Cortina d'Ampezzo about 19.9 km away; both are subregions inside the same broad product concept. Counting all three toward a 50-destination gate would mix regional and subregional granularity and can create near-duplicate rankings.

Required resolution: choose one catalogue level (broad regions or trail bases/subregions), define overlap rules, and replace or explicitly relate nested candidates before activation.

### Low — documentation and maintenance

#### L1. The source registry links an older PUG revision

`source-semantics.json` points to a July 2026 historical PUG revision. Its relevant semantics remain consistent with the current guide, so this is not a data error. The next operator review should replace or supplement it with the current canonical PUG URL and update the review timestamp without auto-approving the source.

#### L2. Planning guidance overstated sampling capacity — corrected

The candidate plan required 5–9 points per band, while `sampling-v1.json` caps the sampler at 3 and current staged bands contain 1–3 points. The text now matches the implemented 1–3 range, and a structural regression test covers the planning-only status, count, IDs, coordinates, regions and time zones.

## Destination evidence reviewed

| Destination | DEM pixels | Candidate cells after exclusions | Selected points | Max recorded elevation mismatch | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| Madeira | 709,610 | 5 | 5 | 214.9 m | One committed mask exclusion; low and mountain bands each use one point. |
| Tenerife | 2,240,456 | 19 | 8 | 150.4 m | No committed mask exclusion; full band coverage except 158 top-end pixels. |
| Mallorca | 4,648,801 | 37 | 7 | 188.5 m | Three committed mask exclusions; one requested ocean-only/absent DEM tile; mountain band uses one point. |
| Dolomites | 8,510,904 | 63 | 9 | 139.7 m | Three points per band; broad polygon and manual weights need provenance review. |
| Chamonix | 1,248,714 | 9 | 5 | 266.8 m | Valley band uses one point; official grid-orography gap matters in steep relief. |

The final staging packet reports 5 destinations, 34 source downloads, 180 band-month records, 30 valid years per band-month and completeness 1.0. These internal completeness results are consistent with the local staged sampling/DEM inventory and do not resolve the methodology findings above.

## Code and control assessment

Controls that passed review:

- publishing DEM/sampling snapshots requires source and geometry approvals;
- publishing climate snapshots requires ERA5-Land source approval;
- approval registries remain false;
- requests are pinned to 1991-01-01 through 2020-12-31 and expect 262,992 hourly timestamps;
- unexpected units, missing variables, invalid time axes and material negative physical values fail closed;
- fixture data remain noindex and distinct from real staging artifacts.

Controls still needed:

- official ERA5-Land invariant land-sea-mask ingestion (geopotential ingestion is implemented; corrected staging remains to be rebuilt);
- source/output transformation hashes and a portable artifact evidence bundle;
- committed Python importer unit tests;
- versioned destination geometry/band provenance;
- catalogue overlap policy for the 45-candidate expansion.

## Operator decisions required

Do not change approvals until the operator decides all of the following:

The operator selected the first remediation path: ingest official ERA5-Land geopotential and retain the fixed, capped lapse correction. That decision is implemented but still requires corrected staging and Golden-case review. The remaining decisions are:

1. Which authoritative geometry/trail sources and catalogue granularity define a “destination”.
2. Whether WBM plus selected DEM quality layers are mandatory before adding lake/glacier/forest-heavy destinations.
3. Whether the ARCO time-series operational risk is accepted or a parent-product fallback is required before production.
4. Whether the current four mask exclusions must be re-probed with immutable multi-variable evidence.
5. Whether the local tiny-negative thresholds are accepted after boundary tests and a larger empirical sample.

Only after those decisions, rebuilt real-data staging, at least 30 reviewed Golden cases and the existing release gates pass should the science/data approval be considered.

## Files changed by this pre-audit

- `docs/science-data-pre-audit-2026-09-01.md` — this report.
- `docs/data-sources.md` — corrected source caveats, DSM/quality-layer limitations, ERA5 grid-orography requirement and threshold wording.
- `data-config/sources/destination-candidates.json` — corrected planned samples per band from 5–9 to the implemented 1–3.
- `tests/destination-candidates.test.ts` — planning-file structural regression test.

No approval registry, production snapshot, public dataset or deployment configuration was changed.
