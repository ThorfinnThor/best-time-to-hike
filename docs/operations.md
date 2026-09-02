# Operations

Normal code changes run the offline gate: rebuild from committed snapshots, validate, test, typecheck, and static build. No remote scientific source is required.

Candidate batch 1 uses the manual `Refresh real static data` workflow with `publish=false` and `candidate_batch=1`. An optional comma-separated `destinations` input limits the staging run. Candidate mode rebuilds sourced geometry, DEM profiles, isolated configs, sampling and ERA5-Land outputs under `generated/intermediate/candidate-batch-1/`; the workflow rejects `publish=true` for every candidate batch. A checksummed `staging-evidence-manifest.json` is generated inside that isolated directory before upload.

The full gate is `pnpm verify`. A successful run also proves export determinism and writes `generated/reports/release-report.json`. That report is diagnostic and cannot approve a source or Golden label; unresolved gates remain explicit `BLOCKED_*` entries.

`pnpm data:quality` writes the companion `generated/reports/data-quality.json`. Its configured warnings cover abrupt adjacent-month temperature changes, low completeness, identical cross-destination climate vectors, collapsed sampling coordinates, and strong elevation mismatch. Warnings are review signals and are never silently corrected.

The data-ingest workflow is the manually triggered GitHub Action `Refresh real static data`. With `publish: false`, it downloads and processes the sources and uploads only the compact staging evidence as a private Actions artifact retained for 14 days. With `publish: true`, existing source and geometry checks must pass before it can rebuild, validate, and commit the static snapshots. Cloudflare Pages then builds that Git commit automatically. If any source or gate fails, the prior Git commit and deployment remain the last known good release.

Rollback is a normal Git revert; the connected Cloudflare Pages project deploys it automatically. Rotate the CDS credential in GitHub Actions repository secrets, never in repository files or Pages variables.
