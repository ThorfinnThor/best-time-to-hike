# Destination expansion tracker

The catalogue grows in two controlled batches. Candidate entries remain planning-only until their own geometry, DEM, sampling and ERA5-Land evidence exists.

## Batch 1 — 5 to 20

Implementation status for all rows: `sourced geometry, SOL elevation-band science draft, DEM and sampling staging complete; water/quality masks and real climate staging pending`.

| Destination | Region | Data preparation | Science review |
| --- | --- | --- | --- |
| Zermatt | Alps | LUNA | SOL if elevation/mask anomalies |
| Grindelwald | Alps | LUNA | SOL if elevation/mask anomalies |
| Innsbruck | Alps | LUNA | SOL if urban-fringe boundary is material |
| Kitzbühel Alps | Alps | LUNA | SOL if elevation/mask anomalies |
| Ordino | Pyrenees | LUNA | SOL if elevation/mask anomalies |
| Gavarnie | Pyrenees | LUNA | SOL if elevation/mask anomalies |
| Benasque | Pyrenees | LUNA | SOL if elevation/mask anomalies |
| Lake District | British Isles | LUNA | SOL required for water-mask edge cases |
| Eryri (Snowdonia) | British Isles | LUNA | SOL if coastal/water masks are anomalous |
| Cairngorms National Park | British Isles | LUNA | SOL if elevation/mask anomalies occur |
| Lofotodden National Park | Scandinavia | LUNA | SOL if coastline/water masks are anomalous |
| Jotunheimen | Scandinavia | LUNA | SOL if glacier/water masks are anomalous |
| Rila Mountains | Balkans | LUNA | SOL if lake/karst masks are anomalous |
| Triglav National Park | Alps | LUNA | SOL if lake/karst masks are anomalous |
| Durmitor | Balkans | LUNA | SOL if canyon/lake masks are anomalous |

Batch 1 is ready to start once each destination has a reviewed boundary source and explicit elevation-band rationale. Then run real DEM, ERA5-Land staging, validation, calibration sample, static build and manual QA. A successful batch changes the real-data target from 5 to 20; it does not by itself authorize production publication.

## Batch 2 — 20 to 50

The remaining 30 candidates are already listed in `data-config/sources/destination-candidates.json`. Before activation, resolve the catalogue-level overlap between Dolomites, Alta Badia and Cortina d'Ampezzo, and add Copernicus water/quality-layer handling for lake-, river- and glacier-heavy areas.

## Routing rule

- `LUNA reicht`: geometry intake implementation, source metadata capture, DEM/ERA5 staging, tests, export and Cloudflare static deployment.
- `SOL erforderlich`: scientific interpretation of anomalies, taxonomy decisions, threshold/methodology changes and final science/data approval.
