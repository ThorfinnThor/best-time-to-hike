# BestTimeToHike

A bilingual, static hiking-season decision engine. It turns versioned climate/elevation snapshots into transparent monthly scores, rankings, comparisons, and a client-side preference finder.

The public build currently ships 315 destinations from committed ERA5-Land 1991–2020 snapshots and remains deliberately `provisional` and `noindex`. Each result is limited to one selected model-grid cell; it is not a whole-region, route-condition, forecast or safety claim. Review-held destinations keep provenance pages but publish no score, ranking or best-month recommendation. Production publication remains gated by independent evidence and operator approvals.

## Stack

- Next.js 15 App Router + React 19 + TypeScript
- Tailwind CSS 3 and custom CSS/SVG-style visuals
- Static export to `out/`
- Cloudflare Pages hosting
- JSON-only public data, no runtime database or climate API
- GitHub Actions for guarded real-data ingestion, deterministic rebuilds, and Pages deployment

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

Real source data is refreshed in the manually triggered `Refresh real static data` GitHub Action. This is the same static publishing model used by Climate Decision Engine: CI downloads and validates the sources, approved compact JSON snapshots are committed, and the website reads only those files.

Run the action with `publish: false` to produce a private, 14-day staging artifact without changing the website. Run it with `publish: true` only after the source and geometry approval files are complete; the existing approval checks fail closed before snapshots can be committed.

`CDSAPI_KEY` is an encrypted GitHub Actions repository secret. It is used only by the data-refresh job and is never passed to Cloudflare Pages or written to snapshots, logs, or the public build. The current static catalogue contains 315 unique point requests.

## Deployment

Cloudflare Pages is connected directly to the GitHub repository. Every push to `main` runs `pnpm build` and publishes `out/`; no Worker, deploy API token, or server runtime is involved.

For an operator-initiated recovery deployment, the same static directory can still be uploaded with an authenticated Wrangler session:

```bash
pnpm deploy:cloudflare
```

See `docs/going-live.md` before enabling production indexing.

## Data boundary

Public pages only read `public/data/hiking/**` during the build. `next build` and Cloudflare Pages never download scientific source data. A failed GitHub refresh leaves the last-known-good committed snapshots and deployed site unchanged.

The exact hourly processing implementation lives in `lib/hiking/climate.ts`. It keeps UTC instants canonical, groups by IANA local date without collapsing repeated DST hours, supports only explicit precipitation semantics, calculates daily hiking-window metrics, and derives monthly climatology without replacing missing observations with zero.
