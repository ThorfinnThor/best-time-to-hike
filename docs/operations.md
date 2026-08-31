# Operations

Normal code changes run the offline gate: rebuild from committed snapshots, validate, test, typecheck, and static build. No remote scientific source is required.

The full gate is `pnpm verify`. A successful run also proves export determinism and writes `generated/reports/release-report.json`. That report is diagnostic and cannot approve a source or Golden label; unresolved gates remain explicit `BLOCKED_*` entries.

`pnpm data:quality` writes the companion `generated/reports/data-quality.json`. Its configured warnings cover abrupt adjacent-month temperature changes, low completeness, identical cross-destination climate vectors, collapsed sampling coordinates, and strong elevation mismatch. Warnings are review signals and are never silently corrected.

The data-ingest workflow is manual. It may write snapshots/public JSON only after every normalization, validation, test, and build step succeeds. If any source or gate fails, no commit and no deployment is created; the prior Git commit remains the last known good release.

Rollback is a normal Git revert followed by the Cloudflare deployment workflow. Rotate GitHub/Cloudflare/CDS/CDSE credentials in their respective secret stores, never in repository files.
