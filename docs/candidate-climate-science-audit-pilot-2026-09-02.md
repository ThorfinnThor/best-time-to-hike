# Candidate climate science audit — Alpine pilot

Status: **scientifically rejected for release; useful staging evidence retained**  
Reviewed: 2026-09-02  
GitHub Actions run: [#33624222565](https://github.com/ThorfinnThor/best-time-to-hike/actions/runs/33624222565)  
Source commit: `60f7b87bf68ba6880d3fd950af98e5ee15659e97`

The pilot produced structurally valid real ERA5-Land 1991–2020 climate for Zermatt, Grindelwald and Innsbruck. It contains 10 unique grid points, 262,992 hourly observations per point, 108 complete band-month records, official invariant orography and matching canonical raw-data hashes. Structural completeness does not make every grid cell representative of the intended hiking terrain.

## Band representativeness

`Model mismatch` is the absolute difference between the target hiking-band elevation and official ERA5-Land invariant grid elevation. `Glacier cells` counts selected cells whose source observations reach the official 10 m snow-depth glacier indicator. `Minimum snow probability` is the lowest monthly snow-day probability across the 30-year normal.

| Destination | Band | Target m | Points | Maximum model mismatch m | Capped correction points | Glacier cells | Minimum snow probability | Maximum source snow depth m | Decision |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Zermatt | Valley | 1,965.8 | 1 | 1,030.2 | 1 | 0 | 1.0000 | 6.5 | blocked: model height and persistent snow |
| Zermatt | Alpine | 2,555.5 | 2 | 440.5 | 0 | 1 | 1.0000 | 22.0 | blocked: glacier contamination |
| Zermatt | High alpine | 3,072.2 | 1 | 56.4 | 0 | 1 | 1.0000 | 27.1 | blocked: glacier cell excluded by scope |
| Grindelwald | Valley | 1,213.4 | 1 | 848.8 | 1 | 0 | 0.0785 | 3.5 | blocked: model height |
| Grindelwald | Alpine | 1,907.6 | 1 | 365.1 | 0 | 0 | 0.0473 | 2.7 | conditional: representative-route QA required |
| Grindelwald | High alpine | 2,604.1 | 1 | 270.9 | 0 | 1 | 1.0000 | 21.8 | blocked: glacier cell excluded by scope |
| Innsbruck | Foothill | 639.3 | 1 | 767.4 | 0 | 0 | 0.0129 | 2.1 | blocked: model height |
| Innsbruck | Mountain | 1,478.9 | 1 | 177.0 | 0 | 0 | 0.0129 | 2.1 | conditional: representative-route QA required |
| Innsbruck | Alpine | 2,063.1 | 2 | 834.4 | 1 | 0 | 0.0215 | 2.0 | blocked: one unrepresentative point |

No pilot destination has a releasable three-band set.

## Findings

### S1 — terrain matching and model orography diverge

The sampler selects points using a 1 km GLO-30 window around the 0.1° coordinate. That describes local surface terrain but does not guarantee that the ERA5-Land grid cell represents the same elevation. Four bands contain a point more than 600 m from the target. Temperature correction cannot repair snow, precipitation, humidity or wind. A capped temperature correction is therefore a representativeness failure, not merely a confidence penalty.

The implementation rule is versioned in `data-config/methodology/era5-land-representativeness-v1.json`: up to 300 m is good, 301–600 m requires review and more than 600 m is blocked.

### S2 — glacier cells contradict the reviewed hiking scope

The Zermatt Alpine and High-alpine bands and Grindelwald High-alpine band use source cells that reach 21.8–27.1 m snow depth. ECMWF states that ERA5-Land snow-depth values at or above 10 m indicate glacier locations where snow depth is not well known. The official ERA5-Land invariant catalogue also publishes a glacier-mask proportion layer. [ERA5-Land data documentation](https://confluence.ecmwf.int/spaces/CKB/pages/140385202/ERA5-Land+data+documentation)

The reviewed scopes explicitly exclude glacier ice. Such a cell must be excluded, not converted into a very poor hiking score. Zermatt's remaining Valley cell never drops below a monthly snow-day probability of 1.0 despite staying below the official 10 m indicator; this remains a mandatory route-level anomaly review.

### S3 — 10 m grid wind is not an exposed-trail hazard model

All pilot band-month means are only 2.7–4.0 km/h, and none of the 10 source cells records a hiking-window hour at or above the configured 40 km/h high-wind threshold across 1991–2020. The conversion and source units are correct, but a 9 km land-grid 10 m wind field does not resolve exposed ridges and passes. ERA5-Land is a 0.1° land-surface reanalysis and nearest-grid time series, not a trail-scale mountain safety product. [CDS ERA5-Land time-series overview](https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land-timeseries?tab=overview)

The existing wind component may be retained only after a separately validated exposure/gust method or with a materially reduced claim and confidence treatment. Production science approval remains blocked.

## Checks that passed

- Temperature seasonality is ordered and broadly plausible after the recorded lapse corrections.
- Precipitation, wet-day, humidity and snow seasonality contain no missing values or discontinuous years.
- All source requests, resolved coordinates, importer hashes, variable units, normalization rules and canonical output hashes agree.
- The public fixture dataset, approval flags and candidate activation state were not modified.

## Required next implementation

1. Resolve official ERA5-Land invariant orography for every candidate before climate downloads; exclude points above the 600 m target-band mismatch gate and rerank remaining candidates.
2. Ingest the official ERA5-Land glacier-mask invariant. Independently reject any downloaded cell reaching the official 10 m snow-depth glacier indicator when the destination scope excludes glaciers.
3. Treat twelve snow-covered months below the glacier threshold as a manual route-representativeness gate.
4. Design and validate the wind exposure/gust treatment before allowing the wind component to support production recommendations.
5. Rerun the three-destination pilot. Do not start the other 12 real-climate downloads until the early orography/glacier preflight prevents known-invalid cells.
