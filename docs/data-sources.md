# Data sources and approval gates

The planned production climate normal is ERA5-Land 1991–2020. Elevation is planned from Copernicus DEM GLO-30, with daylight calculated astronomically. Current source assumptions live in `data-config/methodology/source-semantics.json` and remain `approved: false`.

Before real ingest, an operator must verify current upstream variable metadata, units, precipitation accumulation/reset semantics, access terms, and attribution. The code supports only explicit incremental-per-timestep precipitation or accumulated values with explicit reset metadata. Unknown semantics block ingestion.

Approval requires a named approver and valid approval timestamp in addition to `approved: true`. ERA5-Land ingest also verifies Kelvin temperature, metres of precipitation and snow depth, metres per second wind, and explicitly approved fractional snow cover. An accumulated series with no prior value or a missing predecessor remains missing; a negative derived increment without reset metadata is a hard failure.

The deployed fixture data is synthetic and only exercises contracts, scoring, rendering, and operational gates.

Run `pnpm preflight:sources` before any real download. It is expected to fail with `BLOCKED_SOURCE_SEMANTICS` in this fixture repository; a passing exit is meaningful only after the operator has completed and recorded the metadata review.
