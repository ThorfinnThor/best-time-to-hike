# Candidate sampling — destination batch 1

Status: **staging-only; no candidate is active**  
Run: 2026-09-02  
Grid: ERA5-Land 0.1° candidate centres with separate Copernicus GLO-30 1 km-window terrain medians

The candidate workflow prepared 15 isolated destination configs from the reviewed OSM geometries, SOL elevation regimes and exact DEM profiles. It evaluated 226 valid ERA5-Land grid candidates and selected 94 weighted band-point entries representing 85 unique grid cells.

Quality result: **89 good, 4 moderate, 1 strong-penalty, 0 blocked**. No mismatch threshold or release gate was relaxed.

| Destination | Candidates | Unique selected cells | Maximum mismatch m | Good / moderate / strong | Maximum buffer m |
| --- | ---: | ---: | ---: | --- | ---: |
| Benasque | 3 | 3 | 318.1 | 4 / 1 / 0 | 0.0 |
| Cairngorms | 69 | 9 | 117.5 | 9 / 0 / 0 | 0.0 |
| Durmitor | 4 | 3 | 273.6 | 4 / 0 / 0 | 0.0 |
| Gavarnie | 4 | 4 | 436.2 | 4 / 2 / 0 | 3,479.4 |
| Grindelwald | 6 | 3 | 105.1 | 3 / 0 / 0 | 4,716.1 |
| Innsbruck | 6 | 4 | 211.6 | 4 / 0 / 0 | 4,190.6 |
| Jotunheimen | 18 | 7 | 171.3 | 8 / 0 / 0 | 0.0 |
| Kitzbühel Alps | 24 | 9 | 132.6 | 9 / 0 / 0 | 0.0 |
| Lake District | 32 | 9 | 159.0 | 9 / 0 / 0 | 0.0 |
| Lofotodden | 6 | 6 | 238.4 | 7 / 0 / 0 | 2,712.9 |
| Ordino | 2 | 2 | 693.2 | 2 / 0 / 1 | 1,066.1 |
| Rila | 11 | 7 | 78.5 | 7 / 0 / 0 | 0.0 |
| Eryri | 29 | 9 | 78.2 | 9 / 0 / 0 | 0.0 |
| Triglav | 8 | 7 | 162.5 | 7 / 0 / 0 | 0.0 |
| Zermatt | 4 | 3 | 391.4 | 3 / 1 / 0 | 0.0 |

## Bounded small-polygon rule

The initial run reused a single in-polygon cell across all three bands in Innsbruck, Ordino and Gavarnie. For destination areas with fewer than three in-polygon candidate centres, the sampler now supplements the set with centres no farther than the existing 5 km maximum buffer. The exact distance is recorded in `usedBufferM`. This reduced Innsbruck's maximum mismatch from 795.8 m to 211.6 m, Grindelwald from 401.4 m to 105.1 m, Lofotodden from 457.8 m to 238.4 m and Gavarnie's lower-band mismatch from 517.0 m to 240.9 m.

Ordino remains the sole strong-penalty case: its narrow lower valley is not well represented by a 0.1° terrain cell, producing 693.2 m mismatch for the lower band. This is below the 800 m block threshold and will receive a confidence penalty, but it requires explicit representative-route QA before activation.

## Remaining gates

- Official Copernicus quality layers remain unavailable through the unsigned public mirror; see `docs/copernicus-quality-layer-access-2026-09-02.md`.
- ERA5-Land mask evidence and real 1991–2020 climate observations have not yet been downloaded for these 85 unique cells.
- The sampling outputs remain below `generated/intermediate/candidate-batch-1/` and are not consumed by the public build.
