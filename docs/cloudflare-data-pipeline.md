# Cloudflare real-data pipeline

Real source ingestion runs on Cloudflare, independently of the static Pages build:

```text
authenticated request
→ Cloudflare Workflow
→ Cloudflare Container (Python + NetCDF + TypeScript ETL)
→ pinned official ERA5-Land invariant-orography verification
→ SHA-256 verification
→ private R2 artifact
```

The Container is necessary because the ERA5-Land conversion uses Python, NumPy, and NetCDF4 and processes 30 years of hourly observations. The Workflow provides durable retries and status; R2 keeps large results outside Workflow state. Cloudflare Containers require a Workers Paid plan.

## Cloudflare resources

- Worker: `best-time-to-hike-data`
- Workflow: `best-time-to-hike-real-data`
- R2 bucket: `best-time-to-hike-data`
- Container class: `DataPipelineContainer` (`standard-2`, maximum one active instance)
- Required encrypted Worker secrets: `CDSAPI_KEY`, `INGEST_ADMIN_TOKEN`

Create the private R2 bucket once, deploy the Worker/Container through Cloudflare Workers Builds or Wrangler, and add both secrets under **Workers & Pages → best-time-to-hike-data → Settings → Variables and Secrets**. Do not add the CDS token to Pages, GitHub Actions, `.env`, or the repository.

The CDS account must first accept the terms for `reanalysis-era5-land-timeseries`. `INGEST_ADMIN_TOKEN` should be a separately generated high-entropy bearer token used only to authorize the private control API.

## Validation and deployment

```bash
pnpm cloudflare:data:check
pnpm cloudflare:data:deploy
```

The check regenerates binding/runtime types, type-checks the Worker, and performs a Worker bundle dry-run without attempting a local Container build. The production deployment builds the image through Cloudflare Workers Builds when Docker is unavailable on the operator machine.

## Starting and observing a run

Send an authenticated request to the deployed Worker's `/runs` endpoint. An empty destination list means all active destinations:

```json
{
  "destinations": [],
  "refresh": true,
  "publish": false
}
```

The response contains an instance ID. `GET /runs/{id}` returns durable Workflow status, and `GET /runs/{id}/artifact` downloads the checksum-verified R2 archive. Both endpoints require the same bearer token.

Runs stage real outputs by default. `publish: true` invokes the repository's existing source-approval gates before it can replace snapshots or build production output. The Workflow never changes approval files automatically.

## Failure behavior

- CDS, DEM, validation, test, or build failures fail the Workflow and preserve the previous public dataset.
- Workflow steps retry transient failures twice with exponential backoff.
- Raw hourly data stays on ephemeral Container disk and is excluded from the R2 artifact.
- The 51.9 MB pinned ERA5-Land invariant NetCDF is verified by SHA-256, cached only on ephemeral Container disk, and excluded from the R2 artifact; its compact per-point extraction metadata is included.
- The CDS token is passed only as a Container environment variable and is excluded from responses, manifests, logs, and artifacts.
- R2 artifacts include per-file hashes and a deterministic outer archive hash.
