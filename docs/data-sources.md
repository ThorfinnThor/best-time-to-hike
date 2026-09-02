# Data sources and approval gates

The production climate normal is ERA5-Land 1991–2020. Copernicus DEM GLO-30 supplies terrain matching and destination elevation summaries; the official ERA5-Land invariant geopotential supplies model-grid height for temperature correction; daylight is calculated astronomically. Source assumptions and the official evidence reviewed on 2026-08-31 are recorded in `data-config/methodology/source-semantics.json`; operator approval remains deliberately false.

## Copernicus DEM GLO-30

`pnpm data:dem` reads the 2021 COP-DEM_GLO-30-DGED Cloud-Optimized GeoTIFF distribution from the [AWS Registry of Open Data](https://registry.opendata.aws/copernicus-dem/). It requires no cloud credentials. Copernicus describes this elevation layer as an edited digital surface model (DSM), not a bare-earth terrain model. Pixels are clipped to each versioned destination polygon; NoData is honored; source URLs, ETags, timestamps and byte sizes are recorded. For the current destination set, values at or below 0 m are excluded by the versioned land-surface rule because the distribution represents ocean cells as zero and none of the configured hiking areas contain valid below-sea-level terrain. The current importer does not yet ingest the product's Water Body, Editing, Filling or Height Error quality layers; those layers must be considered before scaling to lake-, river-, forest- or glacier-heavy destinations.

The default command writes ignored audit artifacts under `generated/intermediate/real-dem/`. `--publish` writes `data-snapshots/dem/` only after the DEM source and geometry/elevation gates contain an approver and timestamp.

Sampling candidates are also checked against versioned ERA5-Land mask evidence. A coastal grid cell that has valid GLO-30 terrain in the configured DEM window but returns fully masked ERA5-Land variables is excluded through `data-config/geography/destination-overrides.json`; the exclusion records its probe date and Workflow evidence instead of silently treating missing climate values as zero. Every active geometry also carries an explicit pending/reviewed provenance status, intended scope, excluded classes and draft band/weight rationale; `pending-review` is not a release approval.

The sampler records a 1 km-window GLO-30 median as `terrainElevationM` and uses it only to match candidate cells to a destination elevation band. It is never used as ERA5-Land model-grid height. The lapse correction instead receives `era5LandGridElevationM`, extracted independently from ECMWF's official ERA5-Land invariant geopotential. This naming and data-flow separation is enforced by tests.

## ERA5-Land invariant geopotential

ECMWF publishes the invariant geopotential used for ERA5-Land, already interpolated to its regular 0.1° latitude/longitude grid. The pipeline pins the official NetCDF attachment URL and SHA-256 in `data-config/methodology/era5-land-orography-v1.json`. Before use, the 51,898,362-byte download must match SHA-256 `6fe9d064e7eae98bfe20348430bc4290bc94daa838b560c355999cd85cb1a559`.

`scripts/import/download_era5_land_orography.py` selects the nearest invariant grid coordinate for every unique point in the ERA5 request plan, requires parameter `z` in `m**2 s**-2`, and converts geopotential to model elevation using `elevation_m = z / 9.80665`. It records requested and resolved coordinates, raw geopotential, converted height, pinned source metadata and retrieval time in `generated/intermediate/era5-invariants/era5-land-orography.json`. The climate importer also verifies that the invariant and time-series downloads resolve to the same grid coordinate before aggregation.

The pinned NetCDF is used only on the ephemeral GitHub Actions runner and is excluded from the uploaded staging artifact. The compact checksummed extraction metadata is included. A diagnostic extraction over the previous 34 staged points found absolute GLO-30-window versus ERA5-Land model-height differences from 0.705 m to 877.413 m (mean 360.492 m), confirming that the two values must not be conflated. These diagnostics do not constitute production approval; staging must be rebuilt with the corrected method.

## ERA5-Land hourly time-series

The implemented dataset is [`reanalysis-era5-land-timeseries`](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land-timeseries), DOI `10.24381/ee82e357`, queried for 1991-01-01 through 2020-12-31. Its [current official product guide](https://confluence.ecmwf.int/spaces/CKB/pages/536218894/ERA5-Land+hourly+Analysis+Ready+Cloud+Optimised+ARCO+data+on+single+levels+from+1950+to+present+Product+User+Guide+PUG) states that total precipitation is already de-accumulated to hourly values. The importer therefore uses `INCREMENTAL_PER_TIMESTEP_M` and never de-accumulates those values a second time. The same guide warns that this time-series access path has lower operational support than the parent ERA5-Land entry and may be disabled, deprecated or structurally changed, so source-format monitoring and a fallback ingestion path remain release requirements.

The CDS conversion can encode physically zero precipitation as a tiny negative number after de-accumulation. [ECMWF's guidance on negative precipitation artifacts](https://confluence.ecmwf.int/spaces/UDOC/pages/208501579/Why+are+there+sometimes+small+negative+precipitation+accumulations+-+ecCodes+GRIB+FAQ) supports thresholding packing artifacts, but it does not prescribe this pipeline's numeric threshold. The importer therefore applies a local, deliberately conservative policy: clamp negative precipitation no lower than `-0.000001 m` (`-0.001 mm`) to zero, reject anything below that bound, and record the count plus original minimum. Tiny negative physical snow-height values are handled under the same physical-bound policy, based on the observed NetCDF output rather than the precipitation FAQ; material negative snow height is rejected.

ERA5-Land time-series snow cover is delivered in percent. The importer records that source unit and an explicit `PERCENT_TO_FRACTION` normalization before enforcing the canonical `FRACTION_0_TO_1` contract used by the climate aggregation.

Required variables are 2 m temperature/dewpoint, 10 m u/v wind, total precipitation, snow cover and snow depth. The converter rejects unexpected units, discontinuous timestamps, material negative precipitation, non-fractional snow cover, missing variables, and any record count other than the expected 262,992 hours per point.

CDS requires a personal account, one-time acceptance of the dataset terms, and a personal access token. The token is stored as the encrypted GitHub Actions repository secret `CDSAPI_KEY` and is passed only to the short-lived refresh runner. It is never written to a request plan, snapshot, raw file, uploaded artifact, or public build.

```bash
pnpm data:era5 -- --plan
```

The planning command is credential-free. Actual remote downloads run through `.github/workflows/refresh-real-data.yml`, or locally when `CDSAPI_KEY` is set explicitly.

The default real ingest writes ignored audit artifacts. Publishing committed snapshots additionally requires `approved: true`, a named approver and a valid timestamp for `era5Land`. Run `pnpm preflight:sources` to verify that gate. A pre-change artifact that used a GLO-30 proxy for lapse correction is not eligible for production publication.

The live site remains a synthetic fixture until all five real climate snapshots are generated, reviewed, committed, rebuilt and redeployed. Removing the fixture label without completing that chain is prohibited.
