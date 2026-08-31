# Data sources and approval gates

The production climate normal is ERA5-Land 1991–2020. Elevation comes from Copernicus DEM GLO-30, and daylight is calculated astronomically. Source assumptions and the official evidence reviewed on 2026-08-31 are recorded in `data-config/methodology/source-semantics.json`; operator approval remains deliberately false.

## Copernicus DEM GLO-30

`pnpm data:dem` reads the 2021 COP-DEM_GLO-30-DGED Cloud-Optimized GeoTIFF distribution from the [AWS Registry of Open Data](https://registry.opendata.aws/copernicus-dem/). It requires no cloud credentials. Pixels are clipped to each versioned destination polygon; NoData is honored; source URLs, ETags, timestamps and byte sizes are recorded. For the current destination set, values at or below 0 m are excluded by the versioned land-surface rule because the distribution represents ocean cells as zero and none of the configured hiking areas contain valid below-sea-level terrain.

The default command writes ignored audit artifacts under `generated/intermediate/real-dem/`. `--publish` writes `data-snapshots/dem/` only after the DEM source and geometry/elevation gates contain an approver and timestamp.

Sampling candidates are also checked against versioned ERA5-Land mask evidence. A coastal grid cell that has valid GLO-30 terrain in the configured DEM window but returns fully masked ERA5-Land variables is excluded through `data-config/geography/destination-overrides.json`; the exclusion records its probe date and Workflow evidence instead of silently treating missing climate values as zero.

## ERA5-Land hourly time-series

The implemented dataset is [`reanalysis-era5-land-timeseries`](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land-timeseries), DOI `10.24381/ee82e357`, queried for 1991-01-01 through 2020-12-31. Its current official product guide states that total precipitation is already de-accumulated to hourly values. The importer therefore uses `INCREMENTAL_PER_TIMESTEP_M` and never de-accumulates those values a second time.

The CDS NetCDF conversion can encode physically zero precipitation or snow depth as a tiny negative number. Following [ECMWF's guidance on negative accumulation artifacts](https://confluence.ecmwf.int/display/UDOC/Why+are+there+sometimes+small+negative+precipitation+accumulations+-+ecCodes+GRIB+FAQ), the importer clamps negative values no lower than `-0.000001 m` (`-0.001 mm`) to zero, rejects anything below that bound, and records the clamped counts plus the original minima in every raw-download metadata file.

Required variables are 2 m temperature/dewpoint, 10 m u/v wind, total precipitation, snow cover and snow depth. The converter rejects unexpected units, discontinuous timestamps, material negative precipitation, non-fractional snow cover, missing variables, and any record count other than the expected 262,992 hours per point.

CDS requires a personal account, one-time acceptance of the dataset terms, and a personal access token. The token is stored only as the encrypted `CDSAPI_KEY` secret on the Cloudflare data Worker and is passed to the short-lived ingestion Container at startup. It is never written to a request plan, snapshot, raw file, R2 artifact, GitHub secret, or public build.

```bash
pnpm data:era5 -- --plan
pnpm cloudflare:data:deploy
```

The planning command is credential-free. Actual downloads run through the Cloudflare Workflow documented in `docs/cloudflare-data-pipeline.md`.

The default real ingest writes ignored audit artifacts. Publishing committed snapshots additionally requires `approved: true`, a named approver and a valid timestamp for `era5Land`. Run `pnpm preflight:sources` to verify that gate.

The live site remains a synthetic fixture until all five real climate snapshots are generated, reviewed, committed, rebuilt and redeployed. Removing the fixture label without completing that chain is prohibited.
