# Release work: evidence and remaining gates

This is a partial technical/scientific review, not independent scientific
certification or operator approval. No release approval flag is changed.

## 1. Source and Golden review

Checked all 315 committed climate snapshots: all identify the ERA5-Land
time-series product, all remain provisional, all 315 downloads record 262,992
observations, and every download records raw and canonical checksums. Every
snow-depth mapping is `sde`, metres, identity; every snow-cover mapping is
`snowc`, percent converted to fraction. This is a metadata/completeness audit,
not a fresh independent recomputation of all raw hourly records.

The CDS catalogue confirms snow thickness in metres and snow cover in percent.
The cited PUG version confirms precipitation de-accumulation to hourly values.
The current-version PUG link timed out during this review; do not imply that
its latest revision was fully checked. Importer mappings match the checked
documentation. The DEM mirror documentation was also retrieved, but a complete
licence and terrain-sampling approval is still outstanding.

Sources:
- https://cds.climate.copernicus.eu/datasets/reanalysis-era5-land-timeseries
- https://confluence.ecmwf.int/pages/viewpage.action?pageId=699689224
- https://copernicus-dem-30m.s3.amazonaws.com/readme.html

Golden review: 31 signed cases, 25 agree, four partly agree, two have no answer.
The exact reviewed exceptions remain Zermatt, El Chalten, Atlas Mountains,
Mount Kenya, Annapurna and Langtang. Existing signatures and exception matching
pass, but do not resolve the season discrepancies. Neither labels nor scoring
thresholds were changed to make them agree.

## 2. Exceptional destinations

El Chalten's second candidate is rejected from the completed official-data run;
see `replacement-season-review-2026-09-07.md`. Zermatt and Garhwal retain their
published holds. Annapurna retains its existing provisional result; its staged
alternative is not approved. Independent route/snow evidence remains required.
These four destinations are not scientifically resolved by this execution.

## 3. Technical QA and correction

Live Cloudflare smoke tests:
- EN finder rendered and the June snow-free preset changed the result count
  from 212 to 245 and encoded the filters in the URL.
- Language switching discarded that query and restored May: confirmed bug.
- German finder at 390 x 844 rendered without horizontal document overflow
  (document width 390). Screenshot inspected; this is not a full accessibility audit.
- Comparison search added Mallorca and Madeira and rendered both columns;
  the browser recorded no error-level console entries during that check.

Fix: desktop and mobile language links read the current search parameters,
including updates through Next's history integration. A narrow Suspense boundary
keeps the rest of the header static. Query values are language-neutral and the
existing locale path resolver remains authoritative. Regression tests cover
finder and comparison queries and all three header language links.

The going-live checklist incorrectly called the site a fixture demo. Corrected
to real-source provisional data while retaining noindex. No data or scoring
change is included. Full accessibility/keyboard/contrast and performance
measurements remain outstanding; a smoke test is not their sign-off.

## 4–5. Operator approval and deployment boundary

Requested the intended BestTimeToHike domain and publishable operator name,
postal address and contact email from the user. Do not copy these from another
project without confirmation. Do not change besttravelclimate.com.

Seven production blockers remain: source semantics, geometry/elevation,
licensing/attribution, legal/operator details, accessibility/performance,
science/data audit and custom production domain. The user request to perform
the checklist does not supply the missing evidence or operator details.

The UX correction can be deployed provisionally through the existing Cloudflare
Git integration. Production indexing and catalogue expansion remain deferred
until their prerequisites are satisfied. No source token is needed at runtime.

### Deployment verification

Commit `0319ec3` passed full local verification and GitHub CI. Cloudflare Pages
deployment `6d4fd62b-0570-4b44-aef9-63c1cc06c689` serves the correction. Verified
the language switch both on its immutable deployment URL and on
https://best-time-to-hike.pages.dev: June filters `m=6&tmin=8&rain=0` survive
EN to DE, and 245 English results become 245 German results rather than 212.
No browser error-level console entry was recorded in the final main-origin test.
The ranking navigation and El Chalten's no-recommendation page were also checked.

A separate check, `Workers Builds: best-time-to-hike-data`, failed for the same
commit. It is not the Pages deployment; its cause was not diagnosed here. No
Worker was deleted or disconnected. This residual infrastructure issue and the
full accessibility/performance audit remain open.

### Follow-up: obsolete Worker build disconnected

Inspected Cloudflare build `2a522f6b-38d6-4533-943b-2093946238ed`.
Its build command `pnpm cloudflare:data:typecheck` fails because that script
was removed when the project became static. Its deploy command also refers
to the retired `cloudflare/data-pipeline/wrangler.jsonc` configuration.
Disconnected only this Worker's Git build integration in Cloudflare; the
settings now show Git repository / Connect. The Worker itself, its secrets,
runtime data and the Pages integration were not removed or modified.
Historical failed checks remain historical; a new push has not yet verified
the absence of a new Worker check.

### Targeted accessibility corrections

Read the live Finder's computed text/background colors. Filter-label contrast
was 4.19:1 and the intro eyebrow 2.81:1, below the 4.5:1 minimum for small text
([WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)).
Darkened the secondary green text token and only the pale-intro orange text:
the same pairs now calculate to 5.73:1 and 4.79:1. Decorative orange, typography
and layout remain unchanged. Added two targeted palette regression tests.
These calculations do not certify all text, imagery, focus or interaction states.

The performance skill requires Chrome DevTools navigation/trace tools, which
are unavailable in this session. No performance trace, Lighthouse score or
complete accessibility/performance approval is claimed. The seven production
gates remain unchanged. Domain purchase and operator details are explicitly
deferred at the user's request, not requested again as prerequisites for this work.

### Deployment and audit follow-up

Commit `4952dc8` passed GitHub CI (`34153964907`) and Cloudflare Pages published
the production deployment at
https://9228b295.best-time-to-hike.pages.dev. Live computed styles now use
`#a34825` for the pale-intro eyebrow and `#526b58` for secondary labels. The
keyboard smoke test reached the Finder selects, number inputs and toggle buttons
in order, with a visible 3 px focus outline on each.

The generated static output contains 1.2 MB of Next static JS/CSS and 12302
files; the larger 430 MB local `out/` total is dominated by prerendered HTML,
JSON and destination imagery. This is an inventory, not a Core Web Vitals
measurement. A Chrome DevTools MCP trace is still required for LCP, CLS, FCP,
TBT and network-chain findings.
