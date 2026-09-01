# BestTimeToHike

A bilingual, static hiking-season decision engine. It turns versioned climate/elevation snapshots into transparent monthly scores, rankings, comparisons, and a client-side preference finder.

The public build currently ships a five-destination **fixture dataset** and therefore remains deliberately `noindex`. The repository now includes working real-data adapters: polygon-clipped Copernicus DEM GLO-30 terrain ingestion, DEM-derived ERA5 grid sampling, official ERA5-Land invariant-geopotential model heights, and credential-driven ERA5-Land 1991–2020 hourly ingestion. Production publication remains gated until the source/geometry approvals are recorded and corrected real-data staging has completed.

## Stack

- Next.js 15 App Router + React 19 + TypeScript
- Tailwind CSS 3 and custom CSS/SVG-style visuals
- Static export to `out/`
- Cloudflare Pages hosting
- JSON-only public data, no runtime database or climate API
- Cloudflare Workflows + Containers for guarded real-data ingestion
- Cloudflare R2 for private versioned ingest artifacts
- GitHub Actions for CI, deterministic rebuilds, and Pages deployment

## Local commands

```bash
pnpm install
pnpm data:pipeline
pnpm test
pnpm typecheck
pnpm build
```

Or run the full gate:

```bash
pnpm verify
```

`pnpm verify` rebuilds the committed snapshots, validates all public schemas and cross-file invariants, rejects runtime network/database drift, reproduces the export byte-for-byte, runs the scientific regression suite, creates the static site, type-checks it, and writes a local production-readiness report to `generated/reports/release-report.json`.

## Real-data ingest on Cloudflare

The production ingestion runtime does not depend on a developer machine or a GitHub Actions runner. A Cloudflare Workflow starts a Cloudflare Container, which runs the Python/NetCDF and TypeScript processing, verifies the output, and stores a versioned archive in R2.

```bash
pnpm cloudflare:data:check
pnpm cloudflare:data:deploy
```

`CDSAPI_KEY` and `INGEST_ADMIN_TOKEN` are encrypted Cloudflare Worker secrets. They are not repository, Pages-build, or local environment variables. The ERA5 plan currently contains 34 unique point requests. A run stages real DEM, sampling, invariant orography, and climate outputs by default; `publish: true` remains blocked until the source and release approval registries are complete. See `docs/cloudflare-data-pipeline.md`.

## Deployment

The static export deploys to Cloudflare Pages:

```bash
pnpm deploy:cloudflare
```

GitHub Actions expects `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets only for the static Pages deployment. CDS credentials exist only on the data Worker. See `docs/going-live.md` before enabling production indexing or real data.

## Data boundary

Public pages only read `public/data/hiking/**` during the build. `next build` never downloads source data. Heavy real ingest is an explicit Cloudflare Workflow and must preserve the last-known-good committed snapshots on any failure.

The exact hourly processing implementation lives in `lib/hiking/climate.ts`. It keeps UTC instants canonical, groups by IANA local date without collapsing repeated DST hours, supports only explicit precipitation semantics, calculates daily hiking-window metrics, and derives monthly climatology without replacing missing observations with zero.
