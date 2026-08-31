# BestTimeToHike

A bilingual, static hiking-season decision engine. It turns versioned climate/elevation snapshots into transparent monthly scores, rankings, comparisons, and a client-side preference finder.

This repository currently ships a five-destination **fixture dataset**. The UI is deliberately `noindex`, labels the data as synthetic, and must not be used for travel or safety decisions. Real ERA5-Land and Copernicus DEM ingestion remains blocked until source semantics, credentials, geometries, licensing, and Golden calibration are operator-approved.

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

## Deployment

The static export deploys to Cloudflare Pages:

```bash
pnpm deploy:cloudflare
```

GitHub Actions expects `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. See `docs/going-live.md` before enabling production indexing or real data.

## Data boundary

Public pages only read `public/data/hiking/**` during the build. `next build` never downloads source data. Heavy real ingest is an explicit operator workflow and must preserve the last-known-good committed snapshots on any failure.

The exact hourly processing implementation lives in `lib/hiking/climate.ts`. It keeps UTC instants canonical, groups by IANA local date without collapsing repeated DST hours, supports only explicit precipitation semantics, calculates daily hiking-window metrics, and derives monthly climatology without replacing missing observations with zero.
