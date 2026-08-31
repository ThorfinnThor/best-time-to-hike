# Architecture

BestTimeToHike is a precomputed decision engine: approved public sources are ingested offline, compact snapshots are committed, TypeScript normalizes/scores/exports them, validation gates the result, and Next.js renders a static site. Cloudflare Pages serves only the contents of `out/`.

There is no runtime database, ranking API, weather API, DEM call, or climate-source call. The finder is a client-side computation over the compact static search index and never changes the published hiking suitability score.

The current repository is in fixture mode. Production source adapters intentionally stop with explicit `BLOCKED_*` codes until operator approvals exist.
