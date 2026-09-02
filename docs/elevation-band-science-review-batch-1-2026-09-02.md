# Elevation-band science review — destination batch 1

Status: **SOL science draft; staging is allowed, release approval is not**  
Reviewed: 2026-09-02  
Decision config: `data-config/sources/destination-science-decisions-batch-1.json`  
DEM evidence: `docs/dem-profiling-batch-1-2026-09-02.md`

## Decision rule

Each destination receives three contiguous elevation regimes that are climatically distinct and represented in official hiking material. Boundaries are rounded to operationally stable 50 m or 100 m levels and checked against the exact GLO-30 distribution. Elevation tails dominated by unrelated lowland, glacier, cliff or climbing-only terrain are not allowed to determine a hiking band merely because they occur inside the administrative polygon.

Weights are conservative staging priors rounded to 0.05 from the documented mix of lower, middle and upper hiking opportunities. They are not visitor-frequency estimates. The middle regime normally receives half the weight; a high or low regime receives more only where official route material and the terrain distribution both support that emphasis.

| Destination | Lower regime | Middle regime | Upper regime | Weights |
| --- | --- | --- | --- | --- |
| Zermatt | 1,500–2,200 m | 2,200–2,800 m | 2,800–3,400 m | 0.20 / 0.50 / 0.30 |
| Grindelwald | 700–1,500 m | 1,500–2,300 m | 2,300–3,000 m | 0.20 / 0.55 / 0.25 |
| Innsbruck | 550–1,000 m | 1,000–1,800 m | 1,800–2,400 m | 0.25 / 0.40 / 0.35 |
| Kitzbühel Alps | 450–1,000 m | 1,000–1,600 m | 1,600–2,200 m | 0.25 / 0.50 / 0.25 |
| Ordino | 1,200–1,800 m | 1,800–2,400 m | 2,400–2,950 m | 0.20 / 0.50 / 0.30 |
| Gavarnie | 1,150–1,800 m | 1,800–2,400 m | 2,400–3,000 m | 0.30 / 0.50 / 0.20 |
| Benasque | 1,050–1,800 m | 1,800–2,500 m | 2,500–3,400 m | 0.15 / 0.50 / 0.35 |
| Lake District | 0–250 m | 250–600 m | 600–1,000 m | 0.35 / 0.45 / 0.20 |
| Eryri | 0–250 m | 250–600 m | 600–1,100 m | 0.30 / 0.45 / 0.25 |
| Cairngorms | 100–400 m | 400–800 m | 800–1,350 m | 0.30 / 0.45 / 0.25 |
| Lofotodden | 0–200 m | 200–600 m | 600–1,050 m | 0.30 / 0.55 / 0.15 |
| Jotunheimen | 950–1,400 m | 1,400–1,900 m | 1,900–2,500 m | 0.15 / 0.50 / 0.35 |
| Rila | 800–1,600 m | 1,600–2,300 m | 2,300–2,950 m | 0.15 / 0.50 / 0.35 |
| Triglav | 200–1,000 m | 1,000–1,800 m | 1,800–2,850 m | 0.20 / 0.50 / 0.30 |
| Durmitor | 500–1,400 m | 1,400–2,000 m | 2,000–2,550 m | 0.15 / 0.50 / 0.35 |

## Evidence and limitations

The decision config records the official route or park source used for every destination, the exact geometry hash, intended hiking scope and excluded terrain classes. Particularly clear vertical anchors include Zermatt's official 2,570–2,928 m Matterhorn Glacier Trail and 3,260 m Hörnli hiking terminus; Grindelwald's official 1,616–2,348 m Eiger Trail and 1,967–2,681 m high route; Ordino routes from about 1,365 m to peaks above 2,700 m; Lofotodden's beach-to-Ryten route at 543 m; and Durmitor's official 500–2,523 m range.

This review resolves the elevation-regime hypothesis needed for staging. It does not close the release gate. Luna has measured exact pixels per proposed band and must still resolve the official quality-layer gate, build ERA5-Land sampling, and compare selected points with representative official routes. Any empty/sparse band, material water/urban/glacier contamination or sampling mismatch over the configured gate returns to Sol.

## Exact DEM band check

Luna reran the exact GLO-30 histogram after this decision. Every proposed band contains at least 46,127 positive-elevation pixels; no band is empty or sparse. Proposed ranges cover 80.38–100% of each polygon's positive-elevation pixels.

| Destination | Range coverage | DEM share lower / middle / upper | Staging prior lower / middle / upper |
| --- | ---: | --- | --- |
| Zermatt | 80.38% | 8.3% / 30.9% / 41.2% | 20% / 50% / 30% |
| Grindelwald | 86.50% | 18.5% / 42.2% / 25.8% | 20% / 55% / 25% |
| Innsbruck | 98.44% | 46.5% / 27.9% / 24.0% | 25% / 40% / 35% |
| Kitzbühel Alps | 98.33% | 26.6% / 43.3% / 28.4% | 25% / 50% / 25% |
| Ordino | 100% | 23.1% / 52.4% / 24.5% | 20% / 50% / 30% |
| Gavarnie | 98.82% | 21.8% / 56.3% / 20.7% | 30% / 50% / 20% |
| Benasque | 100% | 17.3% / 53.8% / 28.9% | 15% / 50% / 35% |
| Lake District | 100% | 53.0% / 41.2% / 5.8% | 35% / 45% / 20% |
| Eryri | 100% | 36.3% / 58.2% / 5.5% | 30% / 45% / 25% |
| Cairngorms | 100% | 29.6% / 60.2% / 10.2% | 30% / 45% / 25% |
| Lofotodden | 100% | 34.2% / 56.6% / 9.2% | 30% / 55% / 15% |
| Jotunheimen | 100% | 19.0% / 65.4% / 15.6% | 15% / 50% / 35% |
| Rila | 100% | 9.5% / 67.1% / 23.5% | 15% / 50% / 35% |
| Triglav | 100% | 23.5% / 59.8% / 16.7% | 20% / 50% / 30% |
| Durmitor | 100% | 43.3% / 46.8% / 9.9% | 15% / 50% / 35% |

The Zermatt and Grindelwald coverage gaps are intentional exclusions of high-elevation glacier/summit tails rather than missing data. Innsbruck, Lake District, Eryri, Cairngorms and Durmitor have material differences between terrain area and route-catalogue priors. Those differences are scientifically plausible because hiking use is not proportional to land area, but they require trail-network and representative-route validation before approval.
