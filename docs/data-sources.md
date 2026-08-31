# Data sources and approval gates

The planned production climate normal is ERA5-Land 1991–2020. Elevation is planned from Copernicus DEM GLO-30, with daylight calculated astronomically. Current source assumptions live in `data-config/methodology/source-semantics.json` and remain `approved: false`.

Before real ingest, an operator must verify current upstream variable metadata, units, precipitation accumulation/reset semantics, access terms, and attribution. The code supports only explicit incremental-per-timestep precipitation or accumulated values with explicit reset metadata. Unknown semantics block ingestion.

The deployed fixture data is synthetic and only exercises contracts, scoring, rendering, and operational gates.
