# Going live checklist

The current Pages deployment is a fixture demo and must remain `noindex`.

Production activation requires: approved ERA5/DEM semantics and licensing; secure CDS/CDSE credentials; reviewed destination polygons and elevation weights; real DEM/sampling/climate snapshots; no seed data; at least 50 destinations; at least 30 operator-approved Golden cases; calibration and anomaly review; complete legal/operator details; image attribution; accessibility/performance QA; custom domain; and a final science/data audit.

Only after those gates pass should `NEXT_PUBLIC_DATA_STATUS=production` and the public canonical URL be set for the build.
