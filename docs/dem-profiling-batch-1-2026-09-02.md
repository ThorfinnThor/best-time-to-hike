# DEM profiling — destination batch 1

Status: **staging-only; no candidate is active**  
Retrieved: 2026-09-02  
Source: Copernicus DEM GLO-30 DGED, 2021 release, metres, EPSG:4326  
Geometry evidence: `docs/geometry-intake-batch-1-2026-09-02.md`

The Luna profiler measured all positive-elevation GLO-30 pixels inside the 15 reviewed OSM polygons. It did not define elevation bands, assign hiking weights, alter release approvals or publish data. Per-destination source-object metadata and full quantiles remain in the ignored staging directory `generated/intermediate/dem-profiles-batch-1/`.

Run result: **15/15 profiles, 19,491,709 land pixels, 0 unavailable source tiles**.

| Candidate | Pixels | Min m | P10 m | P25 m | Median m | P75 m | P90 m | Max m | Tiles |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| benasque | 331,921 | 1,084.6 | 1,608.9 | 1,935.1 | 2,259.7 | 2,544.9 | 2,768.4 | 3,364.9 | 1 |
| cairngorms | 5,790,836 | 102.5 | 280.3 | 374.9 | 513.4 | 669.0 | 802.0 | 1,307.5 | 6 |
| durmitor | 466,203 | 531.8 | 797.2 | 1,049.6 | 1,521.5 | 1,802.6 | 1,997.8 | 2,497.4 | 2 |
| gavarnie | 119,316 | 1,178.9 | 1,588.6 | 1,842.2 | 2,103.1 | 2,360.9 | 2,600.3 | 3,242.2 | 2 |
| grindelwald | 260,836 | 729.9 | 1,236.7 | 1,646.8 | 2,091.2 | 2,641.7 | 3,127.8 | 4,093.2 | 2 |
| innsbruck | 161,627 | 559.5 | 578.8 | 658.0 | 1,130.0 | 1,813.5 | 2,130.5 | 2,634.2 | 1 |
| jotunheimen | 1,259,375 | 982.1 | 1,317.7 | 1,444.0 | 1,607.8 | 1,805.6 | 1,973.7 | 2,459.0 | 2 |
| kitzbuhel | 2,855,929 | 479.0 | 764.0 | 975.5 | 1,328.2 | 1,671.6 | 1,922.0 | 2,551.2 | 2 |
| lake-district | 2,816,517 | 0.3 | 55.3 | 128.0 | 237.0 | 385.2 | 531.9 | 974.0 | 2 |
| lofotodden | 118,308 | 0.0 | 34.7 | 141.1 | 293.3 | 452.5 | 588.8 | 1,015.5 | 4 |
| ordino | 120,760 | 1,237.3 | 1,562.8 | 1,828.2 | 2,149.3 | 2,395.2 | 2,548.3 | 2,903.8 | 1 |
| rila | 1,100,377 | 815.6 | 1,610.0 | 1,819.2 | 2,060.4 | 2,286.5 | 2,435.1 | 2,921.4 | 2 |
| snowdonia | 2,452,416 | 0.0 | 100.0 | 199.2 | 309.1 | 430.8 | 533.7 | 1,074.5 | 4 |
| triglav | 1,272,115 | 201.1 | 751.8 | 1,020.9 | 1,342.4 | 1,674.4 | 1,940.9 | 2,801.0 | 2 |
| zermatt | 365,173 | 1,488.9 | 2,251.8 | 2,578.1 | 2,939.8 | 3,304.5 | 3,620.7 | 4,536.3 | 2 |

Values displayed as `0.0 m` are positive source values that round to one decimal place; the configured land filter excludes raw elevations less than or equal to zero.

## Next gate

Sol must use these distributions together with intended hiking scope and terrain masks to define defensible elevation-band boundaries and weights. Until that review is complete, `destinationGeometryAndElevation.approved` remains false and none of these 15 destinations may enter the public build.
