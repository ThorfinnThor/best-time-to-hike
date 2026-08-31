# Going live checklist

The current Pages deployment is a fixture demo and must remain `noindex`.

Production activation requires: a Workers Paid plan for Cloudflare Containers; the deployed data Workflow and private R2 bucket; approved ERA5/DEM semantics and licensing; a CDS personal access token stored as a Cloudflare Worker secret; reviewed destination polygons and elevation weights; real DEM/sampling/climate snapshots; no seed data; at least 50 destinations; at least 30 operator-approved Golden cases; calibration and anomaly review; complete legal/operator details; image attribution; accessibility/performance QA; custom domain; and a final science/data audit. The implemented unsigned public Copernicus DEM distribution does not require CDSE credentials.

Only after those gates pass should `NEXT_PUBLIC_DATA_STATUS=production` and the public canonical URL be set for the build.

Human approvals are recorded in `data-config/methodology/release-approvals.json` with approver and timestamp fields. Changing a flag is an operator act, not an automated build step. `pnpm release:report` exposes every unresolved approval as a production blocker.
