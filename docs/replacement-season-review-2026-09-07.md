# Replacement season review, 2026-09-07

Decision: neither El Chalten nor Annapurna is approved for replacement by this review.
The evidence is the successful staging run 34134806474, downloaded and re-evaluated
without replacing committed snapshots or downloading new climate series.

## El Chalten

Candidate -49.4, -72.7, model elevation 697.6 m: eligible December–March;
best months January–March. These best months are within the signed November–March
reference, but November remains ineligible. This is a promising improvement over
the current persistent-snow hold, not complete validation of the destination's season.

The official Argentina National Parks north-zone brochure documents both the main
Fitz Roy/Torre trails and the shorter Condores/Aguilas viewpoints. It explicitly
distinguishes village weather from mountain conditions. This review has not established
a coordinate-level intersection between the candidate's grid footprint and the intended
trail scope. Keep approval false until that spatial evidence and the November discrepancy
are reviewed. A plausible summer alone does not establish representativeness.

Source: https://www.argentina.gob.ar/sites/default/files/2019/06/folleto_senderos_zona_norte_pnlg_espanol_2024.pdf

### Coordinate follow-up: candidate rejected

Retrieved the KML of map `1jVWRLM4YeROastAfUxr1EWLBSZZvPMk`, embedded by
https://pnlosglaciares.ar/Trekking.php?get=all, on 2026-09-07.
Download: https://www.google.com/maps/d/kml?mid=1jVWRLM4YeROastAfUxr1EWLBSZZvPMk&forcekml=1
SHA256: `fe2524fc162939fc6dbbfbae03535e98e41b90eb674eab075dd7dcbc52a65e05`.

The candidate's nearest-grid footprint is latitude [-49.45, -49.35], longitude
[-72.75, -72.65]. None of the map's 15 route bounding boxes overlaps it. The
easternmost route coordinate is -72.785215 (Bahia Tunel access road), still west
of the cell. Condores trail spans longitude [-72.885835, -72.880082]; Aguilas
[-72.881913, -72.870950]. Disjoint bounding boxes establish non-intersection
without relying on vertex-only tests, which could miss a crossing segment.

This map is used as negative spatial evidence, not as certification of its
positional accuracy, official ownership, or redistribution licence. Together with
the absence of affirmative route evidence, this is sufficient to reject the
unapproved candidate; it does not approve an alternative or any destination-wide claim.
The candidate configuration now records rejection, and the staging workflow no
longer downloads or packages it. Published El Chalten snapshots remain unchanged.

## Annapurna

Candidate 28.4, 84.1, model elevation 3129.8 m: eligible June–October;
best month October only. March, April and November, all part of the signed reference,
remain ineligible. Their snow-day probabilities are respectively 0.9978, 0.9756 and
0.6567; published snow components are 0, 0 and 8. Thus the temperature-only projection
in the earlier expansion note did not establish a working replacement. Temperature
improves but the snow problem remains seasonal rather than year-round.

Summer eligibility is not a best-month recommendation: June–September have precipitation
components 0, 0, 0 and 2, and the separate best-month rule excludes them. October being
inside the reference is therefore insufficient evidence that the full season is fixed.

The Nepal Tourism Board describes a circuit following the Marsyangdi valley toward Manang
and supplies a trekking map. Matching a cell's model height to an approximate circuit
height does not establish that it represents this corridor. Coordinate-level route QA
is still unresolved. Keep approval false and retain the existing published data pending
a supported spatial decision.

Sources:
- https://trade.ntb.gov.np/tourist-destination/annapurna-region/
- https://trade.ntb.gov.np/wp-content/uploads/2012/03/map_annapurnatreks.pdf

## Implemented safeguards and verification

The staging report now checks candidate, downloaded and exported coordinates against the
same 0.1-degree grid identity. It includes best months, out-of-reference best months and
reference months without a recommendation. The latter is a diagnostic, not a new automatic
threshold or a change to the signed Golden labels.

Re-ran the report against the downloaded staging artifact: all four candidate climate
checks complete; Hunza reproduces exactly. TypeScript and diff checks pass. No approvals,
public data or scoring rules changed; no new CDS job or deployment was needed.

After the coordinate follow-up, full `pnpm verify` passed: 171 tests, the fresh
static build (5,801 pages), eight post-build rendered-page checks, typecheck,
architecture and deployment-budget guards, and byte-identical regeneration of
370 public files. The release report retains seven production blockers and the
single Hunza quality warning. No public snapshot or approval flag changed.

## Revised El Chalten staging candidate

The original route count above was corrected from 16 to 15 named route placemarks.
This does not change the non-intersection result. The rejected coordinate and its
reason are preserved as `rejectedCandidate` in the staging configuration.

Resolved four route-intersecting cells against the hash-pinned ECMWF invariant
geopotential and land mask, using `download_era5_land_orography.py`:

| Latitude, longitude | Model height (m) | Land fraction |
| --- | --- | --- |
| -49.3, -72.9 | 946.401 | 0.962736 |
| -49.4, -72.9 | 659.287 | 0.930951 |
| -49.3, -73.0 | 1096.154 | 0.861398 |
| -49.4, -73.0 | 849.194 | 0.934857 |

Select **-49.3, -72.9 for staging only**: its footprint contains the entire mapped
Condores trail vertex set and sections of the Capri and Cerro Torre approaches.
It is selected for this hiking scope, not because it has the lowest model height.
The alternatives cover different route sections and are not interchangeable
representations of the entire destination. The model height is not trail altitude.

The invariant hashes are `6fe9d064e7eae98bfe20348430bc4290bc94daa838b560c355999cd85cb1a559`
(geopotential) and `9df65151d1608990851e2aa8d0e1e4ca063b5181b0568493c42676d2572b202c`
(land mask). Both passed byte-length and SHA256 verification. The complete
1991-2020 series, glacier/snow gates and Golden season review are still required.
Approval remains false and published snapshots remain unchanged.

The next staging workflow is scoped to El Chalten plus the existing Hunza control.
It does not re-download Denali, Annapurna or Garhwal. The artifact now includes
the exact candidate config, Golden fixture and destination index so its report
can be reproduced without reconstructing these inputs manually.
