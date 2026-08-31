# BestTimeToHike

A bilingual, static hiking-season decision engine. It turns versioned climate/elevation snapshots into transparent monthly scores, rankings, comparisons, and a client-side preference finder.

The public build currently ships a five-destination **fixture dataset** and therefore remains deliberately `noindex`. The repository now includes working real-data adapters: polygon-clipped Copernicus DEM GLO-30 ingestion from the unsigned public COG distribution, DEM-derived ERA5 grid sampling, and credential-driven ERA5-Land 1991–2020 hourly ingestion. Production publication remains gated until the source/geometry approvals are recorded and the ERA5 download has actually completed.

## Stack

- Next.js 15 App Router + React 19 + TypeScript
- Tailwind CSS 3 and custom CSS/SVG-style visuals
- Static export to `out/`
- Cloudflare Pages hosting
- JSON-only public data, no runtime database or climate API
- GitHub Actions for offline CI, rebuilds, guarded ingest, and Pages deployment

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

## Real-data ingest

Stage the real terrain and sampling audit without altering committed/public data:

```bash
pnpm data:dem
pnpm data:sampling
pnpm data:era5 -- --plan
```

The ERA5 plan currently contains 35 unique point requests. To execute it, accept the dataset licence in the CDS portal, create a personal access token, then run:

```bash
pnpm data:setup-python
CDSAPI_KEY='your-personal-access-token' pnpm data:era5
```

This writes only ignored staging artifacts. `--publish` is required to replace committed snapshots and remains blocked until the operator approval registry is complete. See `docs/data-sources.md`.

## Deployment

The static export deploys to Cloudflare Pages:

```bash
pnpm deploy:cloudflare
```

GitHub Actions expects `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. See `docs/going-live.md` before enabling production indexing or real data.

## Data boundary

Public pages only read `public/data/hiking/**` during the build. `next build` never downloads source data. Heavy real ingest is an explicit operator workflow and must preserve the last-known-good committed snapshots on any failure.

The exact hourly processing implementation lives in `lib/hiking/climate.ts`. It keeps UTC instants canonical, groups by IANA local date without collapsing repeated DST hours, supports only explicit precipitation semantics, calculates daily hiking-window metrics, and derives monthly climatology without replacing missing observations with zero.
