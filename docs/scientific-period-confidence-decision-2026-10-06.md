# Scientific decision: 1991–2025 and evidence quality

Date: 2026-10-06
Decision scope: the existing public catalogue of 315 destinations

## Decision

The 315-destination catalogue may migrate from 1991–2020 to the complete 1991–2025 ERA5-Land record. The public label must describe a project-defined 35-year historical period, not a WMO climatological standard normal.

The provisional single-point confidence cap of 64 is rejected. It must not be replaced by a higher arbitrary cap. The public model will instead separate temporal data quality, source integrity, spatial scope, route representativeness and elevation context.

## Evidence reviewed

The recovered migration and final scientific review record:

- 315 destinations and 3,780 destination-months;
- 306,864 hourly observations per source cell including UTC boundary padding;
- 35 complete years per month and minimum completeness of 1;
- unchanged scoring weights, curves and eligibility gates during the period comparison;
- mean monthly score change of 0.1371 points and mean absolute change of 0.3572 points;
- maximum absolute monthly score change of 3.5803 points;
- 17 eligibility changes, comprising 13 snow-threshold releases and four heat-threshold exclusions;
- no scientific hold changes;
- no changes among 33 reviewed extreme destinations;
- no monthly number-one ranking changes;
- Golden Case gate passed after the recorded Atlas Mountains and Annapurna decisions.

Every eligibility change is caused by an exact crossing of an existing critical-component boundary. No threshold or weight was retuned to preserve the older result. The recovered final review therefore supports the period migration.

## Period terminology

The World Meteorological Organization defines the current climatological standard normal as the latest consecutive 30-year period ending in a year ending in zero, presently 1991–2020. Therefore:

- permitted: “Based on the last 35 complete years (1991–2025)”;
- permitted: “1991–2025 historical average”;
- prohibited: “WMO climate normal 1991–2025”;
- prohibited: treating the data as a forecast or current weather.

ERA5-Land provides a historical reanalysis record extending to the present. ECMWF distinguishes preliminary ERA5-Land-T from consolidated ERA5-Land and normally replaces the preliminary month after roughly two months. The recovered migration's 2026 retrieval date is late enough for 2025 to be consolidated, but the implementation must still verify source metadata and hashes for every cell.

## Confidence decision

The value 64 is not a measured uncertainty. It is a presentation guard applied whenever a provisional destination uses one model cell. It hides the reason for uncertainty and incorrectly makes a complete 35-year record look equivalent to incomplete data.

The replacement contract is:

1. Temporal data quality is either complete or withheld. Publication requires all 35 years, every required variable, no missing or duplicate hour, and no imputation.
2. Source integrity is verified or withheld. Units, accumulation semantics, hashes and consolidated product state must be reproducible.
3. Spatial scope is stated directly as one selected ERA5-Land cell. It is not converted into a percentage.
4. Route representativeness is separately marked as supported or not assessed.
5. Model elevation and route or destination elevation context are shown directly rather than compressed into confidence points.
6. Unvalidated grid wind cannot increase evidence quality or support trail-wind claims.

The legacy confidence score must no longer affect rankings, recommendations, SEO indexability or user-facing copy. Rankings use hiking score followed by a deterministic slug tie-breaker. Missing scientific inputs cause withholding rather than a lower confidence label.

## Claim restrictions retained

The migrated publication remains selected-cell climatology. It is not a whole-region average, a route-specific forecast, current trail information, a safety decision or an empirically calibrated probability.

## Implementation hand-off

Luna may now implement the recovered 1991–2025 pipeline and the evidence-quality contract. The 375-destination audit remains out of scope. Blog drafting stays paused until the regenerated 315-destination export passes the final scientific audit.

## Primary references

- WMO climatological normals: https://wmo.int/wmo-climatological-normals
- Copernicus ERA5-Land time-series catalogue: https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land-timeseries
- ECMWF ERA5-Land documentation: https://confluence.ecmwf.int/pages/viewpage.action?pageId=355336451
