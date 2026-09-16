# Scientific method decision: 1991–2025 historical average

Date: 2026-09-16  
Status: approved for staging implementation; not yet approved for production

## Decision

BestTimeToHike will prepare a project-defined historical climate average covering the last 35 complete calendar years, 1991 through 2025. It is not a WMO climatological standard normal and must not be labelled as one. The intended public wording is:

- English: `Based on the last 35 complete years (1991-2025)`
- German: `Basierend auf den letzten 35 vollständigen Jahren (1991-2025)`

The existing 1991–2020 release remains active until all new source data, comparisons and release gates pass.

## Source-state rule

The source remains the ERA5-Land hourly time-series dataset, DOI `10.24381/ee82e357`. Copernicus documents that near-real-time ERA5-Land-T values are replaced by consolidated ERA5-Land about two months later. The migration therefore accepts 2025 only from a retrieval made at least 90 days after 2025-12-31. ERA5-Land-T is not accepted for the historical average.

This decision is supported by the official [ERA5-Land time-series catalogue](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land-timeseries?tab=overview), [ERA5-Land data documentation](https://confluence.ecmwf.int/spaces/CKB/pages/140385202/ERA5-Land+data+documentation) and the [WMO definition of standard normals](https://community.wmo.int/site/knowledge-hub/programmes-and-initiatives/climate-services/wmo-climatological-normals).

## Completeness and local-date boundaries

The 1991–2025 core contains 306,816 hourly UTC instants. The new request must also fetch one complete UTC day on both sides, producing 306,864 hourly instants from 1990-12-31 00:00 UTC through 2026-01-01 23:00 UTC. Aggregation then retains only local dates from 1991-01-01 through 2025-12-31. This removes the partial local-day boundary weakness documented for the current release.

Every timestamp must be unique and ordered, and all seven required variables must be present. Missing or duplicate hours reject a grid cell. Temporal interpolation and imputation are prohibited. Existing documented handling of tiny negative NetCDF artifacts remains unchanged.

## Weighting and leap years

Each calendar year receives equal weight. Statistics are first calculated within a local year-month and then averaged across the 35 years. February 29 contributes to its own year's February result, but the leap year does not receive extra final weight. Monthly precipitation is calculated as a complete local-calendar total for each year before those yearly totals are averaged.

The existing 90 percent per-metric validity threshold becomes a diagnostic fallback of at least 32 valid years, but it does not authorize publication from an intentionally incomplete new source series. The migration target is all 35 years for every cell and required variable.

## Scores and thresholds

Weights, curves, recommendation gates and season calibration are frozen during the period migration. Changing the time period and scoring system simultaneously would prevent a clear explanation of changed results. Automatic recalibration is prohibited.

After recomputation, every eligibility change, critical-gate crossing, best-month change, hold change, Golden Case and previously identified extreme destination must be reviewed. Diagnostics must also rank the largest score, temperature, precipitation, snow and ranking changes. A change is a review signal, not automatically an error and not something to tune away merely to retain the old result.

## Release condition

Production remains blocked until all 315 cells pass the new completeness checks, all derived artifacts are rebuilt, old and new periods are compared, Golden Cases and holds are re-audited, public wording is corrected, and both technical verification and the final scientific audit pass.
