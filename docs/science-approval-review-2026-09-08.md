# Scientific cases and approval review, 2026-09-08

Reviewer: Codex AI-assisted technical/scientific review. This is not an independent
field validation or an operator signature. Scope: the five named problem cases,
source semantics, geographic representativeness, licensing evidence and science
release readiness for the current 315-destination catalogue.

## Decisions for the five cases

| Case | Decision | Evidence and remaining requirement |
| --- | --- | --- |
| Zermatt | Retain review-only hold; reject the tested replacement | The prior route-supported candidate triggered the documented glacier indicator; the lower alternative lacks route intersection. Require independent snow/route evidence for a named walking corridor before another candidate is chosen. |
| El Chalten | Retain review-only hold; no repeat download | Run 34139951879 reproduces twelve snowbound months at -49.3, -72.9. This is already the published cell, so the run was a repeat check, not discovery of a new usable replacement. The eastern candidate lacks route support. |
| Garhwal | Reject the current replacement proposal | Its cell is 30.55–30.65 N, 79.15–79.25 E. The only cited hiking scope, Valley of Flowers, has UNESCO reference coordinates 30.733331 N, 79.633331 E outside that footprint. No route evidence supports the proposal. A reference point is not a park polygon and does not prove that all Garhwal trails are outside the cell. The proposal nevertheless fails the required affirmative evidence test. |
| Annapurna | Do not publish the staged replacement | Its March/April/November snow probabilities remain 0.9978/0.9756/0.6567, as documented in the staged review. The existing published cell and accepted Golden deviation remain provisional. A circuit spanning multiple climate zones cannot be validated by matching one nominal height. |
| Hunza | Retain explicit quality warning; no smoothing | Fresh source retrieval reproduces the September-to-October -13.3 C change. This rules against stale aggregate data, but is not independent validation of the local climate. Require station evidence or comparison with the parent ERA5-Land source across individual years to distinguish model behaviour from source processing. |

Garhwal's `stagingDisposition` now rejects the unsupported proposal before another
download. Other published scores, cells and reference seasons are unchanged.

Spatial evidence: [UNESCO component 335bis-002](https://whc.unesco.org/en/list/335/maps/).
Annapurna context: [Nepal Tourism Board](https://trade.ntb.gov.np/tourist-destination/annapurna-region/)
describes the Marsyangdi/Manang corridor, a 5,416 m pass and substantial regional
climate differences. This supports the scope concern, not a replacement cell.
Existing immutable staging details and hashes are in
`replacement-season-review-2026-09-07.md`.

## Source semantics and implementation

The current [ECMWF ARCO PUG](https://confluence.ecmwf.int/spaces/CKB/pages/536218894/ERA5-Land+hourly+Analysis+Ready+Cloud+Optimised+ARCO+data+on+single+levels+from+1950+to+present+Product+User+Guide+PUG)
(revision dated 2026-07-30) confirms hourly de-accumulated precipitation in metres,
snow cover in percent, snow depth in metres, temperature in kelvin and grid wind
in metres/second. It also describes grouped NetCDF files and the limited service
availability commitment. The canonical URL was added to the source registry.

Inspection of all 315 committed climate metadata records found 315 downloads,
each with 262,992 observations, a canonical hash, physical `sde`, percent-to-fraction
snow conversion and incremental precipitation semantics. The recorded totals are
988,735 clamped precipitation values and 51,774,066 clamped snow-depth values;
minimum raw values are respectively -6.307527655735612e-8 m and
-7.3453647229951e-24 m. These are metadata observations, not an independent reread
of all raw source files. The -1e-6 m floor remains an explicit local policy.

Found and fixed: `read_netcdf_files` previously overwrote the resolved coordinate
for each group without comparing it to previous groups. Different-cell variables
could therefore be joined under the last group's coordinate. It now requires one
finite point in every group and checks coordinate agreement using the existing
1e-4 degree importer tolerance; equivalent longitude conventions are normalized.
Synthetic multi-file NetCDF tests cover matching points, equivalent longitudes,
mismatching latitude/longitude, missing coordinates and non-finite coordinates.
No evidence currently establishes that a published download suffered this defect.

## Approval dispositions

| Approval | Disposition | Concrete missing evidence |
| --- | --- | --- |
| Source semantics | Core ERA5 conversions corroborated; production flag remains false | The new cross-group check has not been replayed against all original grouped responses; the DEM processing limitations below remain unresolved. A conversion review is not approval of the entire ingestion source contract. |
| Geometry/elevation | Not approved | Catalogue-wide named trail scope and reviewed coordinate/elevation evidence remain missing; Garhwal supplies a concrete unsupported example. |
| Licensing/attribution | Not approved | 313 image records have allowed licence IDs and credits. Direct licence links, modification notices and same-licence treatment of adapted CC images have now been added. 199 images have ShareAlike licences; original source notices and exact licence variants still need verification. |
| Science/data audit | Not approved | 31 Golden cases contain 25 agreements, four partial agreements and two no-answers, with six accepted exceptions. Five named cases above remain subject to restrictions or further evidence. Golden acceptance is not field validation. |

The [Copernicus DEM documentation](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/COP-DEM)
confirms DSM rather than bare-earth height, EGM2008 vertical reference in metres,
and water/editing/filling/height-error layers. The existing elevation-only importer
does not provide evidence from these quality layers. The site's produced-using
notice exists, but that alone cannot settle all source and image obligations.

[Creative Commons BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
requires attribution, a licence link and indication of changes, and ShareAlike
for adaptations. The importer crops/resizes/re-encodes photographs. A complete
licensing approval needs the actual original notices and applicable versions
checked as well as the rendered credits. This review does not assert that every
transformation legally creates an adaptation.

Implemented the concrete credits gaps in both languages: author and direct
licence link for each CC image, explicit crop/resize/WebP notice, and same-licence
terms for our adapted CC images. Public-domain entries link to their individual
source evidence instead of inventing a licence deed. This is not blanket approval
of the original uploader's rights or any jurisdiction-specific licence variant.

Legal/operator details and domain remain deferred as requested. The prior
Finder keyboard/contrast smoke check did not complete a site-wide accessibility
audit; performance traces are also outstanding. All seven release blockers remain
explicit. No approval flag, accepted Golden exception or production indexability
setting has been changed to manufacture a passing result.

## Verification

175 TypeScript test cases pass (including the Python importer suite), TypeScript
checks pass, Next generates 5,801 static pages and all eight sampled rendered-page
checks pass. Both generated credits pages contain 271 direct Creative Commons
links and the modification notice; the remaining 42 public-domain images link to
their source evidence. All 370 public data files reproduce byte-for-byte, with
315 destinations and 3,780 months. Architecture, CSS, cell and deployment-budget
checks pass; Hunza remains the single quality warning and seven release blockers
remain. The sandbox blocks the tsx CLI's IPC socket, so equivalent scripts were
executed with `node --import tsx`, including the postbuild language step.
