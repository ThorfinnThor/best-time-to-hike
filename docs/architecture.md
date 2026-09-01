# Architecture

BestTimeToHike is a precomputed decision engine. A manually triggered GitHub Action ingests approved public sources, stores staging evidence as a short-lived private Actions artifact, and commits only approved compact snapshots. TypeScript normalizes, scores, exports, and validates those JSON files before Next.js renders a static site. Cloudflare Pages serves only the contents of `out/`.

This deliberately matches Climate Decision Engine's architecture: source processing happens in CI, the published dataset is versioned static JSON, and the CDN has no scientific data pipeline attached to it.

There is no runtime database, ranking API, weather API, DEM call, or climate-source call. The finder is a client-side computation over the compact static search index and never changes the published hiking suitability score.

The current repository is in fixture mode. Production source adapters intentionally stop with explicit `BLOCKED_*` codes until operator approvals exist. A staging refresh can still run without changing the repository or live site.

## Scientific processing boundary

`lib/hiking/climate.ts` is the checked-in hourly-to-daily-to-monthly engine. UTC instants remain the observation identity; IANA timezone conversion supplies local grouping labels, including 23- and 25-hour DST days. The engine applies the configured temperature lapse correction from the official ERA5-Land invariant model height (`era5LandGridElevationM`) to the target terrain elevation. The separate GLO-30 `terrainElevationM` is used only for sampling. The engine also applies the NOAA-style daylight window, Magnus relative humidity, explicit precipitation conversion, snow/heat/wind thresholds, nearest-rank percentiles, and normal-period completeness denominators.

Fixture snapshots start at already aggregated synthetic monthly values and are never presented as output from real ERA5-Land observations. The scientific engine is covered by independent numeric fixtures so a future approved adapter can use it without changing the static runtime architecture.

An approved adapter hands off one point snapshot through the strict version-2 `hourly-climate.schema.json` contract, which requires `era5LandGridElevationM`. `pnpm data:aggregate-hourly -- <input> <output>` only accepts inputs under `data-snapshots/hourly/`, only writes intermediate output, and rechecks production source semantics before aggregation.

## Build guards

The architecture guard scans application/runtime code for network clients, databases, and imports across the ingest boundary. The determinism guard regenerates the JSON export and compares every byte. Schema and semantic validation then cross-checks destination configuration, geometry, scores, rankings, comparisons, search data, manifest inventory, checksums, and byte totals.

Because all localized routes share the required Next.js root layout, the static post-build deterministically sets `lang="de"` on every exported German HTML document. A tiny locale synchronizer also updates the attribute after client-side language navigation. The command fails if even one German page cannot be localized; English pages retain `lang="en"`.
