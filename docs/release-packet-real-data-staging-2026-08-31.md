# Real-data staging release packet

Status: **staging evidence collected; production release blocked**  
Prepared: 2026-09-01  
Scope: the five currently configured destinations only. This packet is evidence for review; it does not set an approval flag, modify public snapshots, or publish a dataset.

> Superseded-method warning (2026-09-01): this artifact predates the official ERA5-Land invariant-orography implementation and used a GLO-30 window median as the lapse-correction reference. It remains useful as historical pipeline evidence but is not eligible for science approval or publication. A new `publish:false` staging run is required.

## What was produced

The Cloudflare Workflow `best-time-to-hike-real-data` completed a `publish:false` run for all active destinations after an automatic platform retry. The resulting artifact is stored privately in R2 and was downloaded independently for checksum and content validation.

| Item | Value |
| --- | --- |
| Workflow instance | `cf_70f04f6ff9f7b94c7ac3ea9d4f8ab58e1e4055ad501243da8ba1bfd3b1773a02` |
| Artifact key | `runs/cf_70f04f6ff9f7b94c7ac3ea9d4f8ab58e1e4055ad501243da8ba1bfd3b1773a02/real-data.tar.gz` |
| Artifact SHA-256 | `e1fa1d23f73a3930c4ab1d423d6ab3c9f8a0a977aeabacc34fe54cd668589b25` |
| Artifact size | 41,322 bytes |
| Publication flag | `false` |
| Climate normal | 1991–2020 |
| Destinations | 5 |
| Source downloads | 34 |
| Band-month records | 180 |
| Valid interannual years | 30 for every band-month |
| Completeness | 1.0 for every band-month |

The archive contains real ERA5-Land time-series-derived climate outputs and Copernicus DEM-derived elevation/sampling outputs for Madeira, Tenerife, Mallorca, Chamonix and the Dolomites. No fixture files were included in the artifact. The empty `manifest.destinations` value means “all active destinations” for this request and is expected for this run.

## Validation evidence

- Artifact archive paths, per-file sizes and SHA-256 values matched its manifest.
- All five destinations have finite numeric values, 36 band-months, 30 valid years and completeness 1.0.
- The importer clamps only tiny NetCDF negative accumulation noise (floor `-1e-6 m`) and rejects material negative values.
- ERA5-Land `snow_cover` percent values are normalized to the canonical 0–1 fraction.
- Versioned ocean/invalid-cell exclusions are recorded for Madeira and Mallorca in `data-config/geography/destination-overrides.json`.
- Historical repository checks for this superseded packet: `pnpm test` (32/32), TypeScript checks, Python compilation and `git diff --check` passed at capture time.

## Current release report

The committed Pages dataset remains `fixture-2026-08-31.1` with five destinations and zero approved Golden cases. The current report is [generated/reports/release-report.json](../generated/reports/release-report.json). Its production blockers are intentionally unchanged:

1. ERA5-Land and Copernicus DEM source semantics are not operator-approved.
2. The catalog is below the 50-destination minimum (5/50).
3. There are no operator-approved Golden cases (0/30).
4. Destination geometry/elevation, licensing/attribution, legal/operator details, accessibility/performance, science/data audit and custom-domain approvals are unset.

The values in `data-config/methodology/source-semantics.json` and `data-config/methodology/release-approvals.json` must remain unchanged until the operator reviews the evidence. A `publish:true` run must not be started from this packet.

## Review handoff

### Sol review

- Confirm the ERA5-Land de-accumulation and `snow_cover` normalization assumptions.
- Review the Madeira/Mallorca masked-cell exclusions and the five destinations’ elevation-band choices.
- Review scoring anomalies and the planned Golden-case labels once those cases exist.

### Operator review

- Approve or reject source semantics and destination geometry/elevation with a name and timestamp.
- Supply the licensing/legal/operator decisions and the production-domain decision.
- Decide whether the five-destination real-data artifact should first be exposed as a private/noindex review build after the science audit.

Until those actions occur, the public Pages deployment remains the fixture/noindex safety release by design.
