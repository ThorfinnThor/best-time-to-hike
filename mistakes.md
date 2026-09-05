# Mistakes and lessons — BestTimeToHike

Every entry below is a real defect from this repository's audit trail: what happened, the root cause,
and the rule that prevents it. Most are easy to reintroduce, because in each case the code was
working exactly as written and still produced a claim the data could not support.

Status labels: **shipped** (was live and had to be corrected), **caught** (blocked before publication
by a gate or review), **latent** (found during review, still unguarded).

---

## 1. Compensatory scoring produced confident recommendations for unhikeable months

**shipped** — commit `809ea80`, corrected in `a7ec90a`. Audit blocker B1.

The overall score was a fully additive weighted mean. A component of zero was simply outvoted.
Sikkim published July, August and September as its **best months at score 79** — with 99.67–100% wet
days and 513–1,024 mm of monthly precipitation. Annapurna published June–August the same way.
Everest entered the global and snow-free rankings on the same mechanism.

Root cause: no non-compensatory state existed anywhere in the model. `export.ts` then published the
three numerically highest months *unconditionally* and ranked destinations by the same value.

**Rule.** Suitability is not an average, it is a conjunction. Compute eligibility from the
**unrounded** components: any critical component ≤ 20 makes the month ineligible, caps the displayed
score at 49/`poor`, and removes it from best-months, every ranking, every theme and the finder.
**Never pad a best-month list to three.** Zero eligible months is a valid, honest answer. All of this
lives in `lib/scoring/recommendations.ts` — every layer that displays a score must go through it,
including any future prose generator.

## 2. A versioned gate existed in config but no code path read it

**shipped** — same commits. Audit blocker B2.

`era5-land-representativeness-v1.json` had set `persistentSnowReviewMonthCount: 12` and a prior audit
had explicitly required a manual review when a cell shows snow in all twelve months below the 10 m
glacier sentinel. The publication path only ever checked the official ≥10 m sentinel. Zermatt
(12/12 months, 2.9–4.9 m mean snow height) and El Chaltén (12/12, 6.0–7.7 m) published normally.

Root cause: the decision was recorded as configuration but never wired into the path that actually
publishes. Passing the hard sentinel was treated as evidence of suitability; it only means the hard
indicator was not reached.

**Rule.** A methodology config value that no code reads is a false assurance. When Sol records a
decision, the implementing change must include the code path *and* a test that fails when the gate is
removed. Grep for every methodology key at least once from application code.

## 3. Confidence measured the wrong thing and then reported it as high

**shipped** — audit finding H1.

All 600 destination-months were labelled **high confidence, 89–93%**, including Sikkim July, whose
recommendation was invalid. The representative batch set `targetElevationM` equal to
`representativeModelElevationM`, so `meanElevationMismatchM` was zero *by construction*; a single
pixel meant `terrainReliefM` was zero too. Both fed ideal contributions. The one-point spatial
subscore of 55 carried only 15% weight and could not pull the total down.

Root cause: a metric that answers "is this source record complete?" was presented as if it answered
"does this point represent hiking across this destination?".

**Rule.** Never combine record completeness and destination representativeness into one unexplained
percentage. For exactly one representative point with unapproved scope, cap confidence at 64/`low`.
When a term is zero *by construction*, it must not earn credit — an identity is not evidence.

## 4. Two different elevations were conflated

**caught** in the 2026-09-01 pre-audit (H1), before any production publication.

`build-sampling.ts` set `gridElevationM` to a 1 km GLO-30 DSM window median, and the temperature
lapse correction used it as the ERA5-Land grid height. Those are different surfaces. Measured across
34 staged points, they differ by **0.7 m to 877.4 m** (mean 360.5 m). The recorded
`elevationMismatchM` therefore did not bound the correction error at all.

**Rule.** `terrainElevationM` (GLO-30) is for terrain matching only. `era5LandGridElevationM`, from
ECMWF's hash-pinned invariant geopotential (`z / 9.80665`), is the only valid lapse reference. The
naming and the data flow are enforced by tests — do not "simplify" them back together. A superseded
artifact built with the proxy is not eligible for publication; rebuild staging after such a fix.

## 5. Terrain match and model match were treated as interchangeable

**caught** — Alpine pilot, finding S1.

Innsbruck's Foothill candidate at 47.3 N, 11.5 E sat **44.1 m** from the 639.3 m target in the local
GLO-30 window, and **767.4 m** away in the ERA5-Land model. It looked ideal by one measure and was
unusable by the other. Innsbruck went on hold.

**Rule.** A point must represent both the intended hiking terrain and the model grid. Passing either
test alone is insufficient. The gate is ≤300 m good, 301–600 m review, >600 m blocked — and it does
not move. Temperature can be lapse-corrected; snow, precipitation, humidity and wind cannot, so a
capped temperature correction signals a representativeness failure, not a confidence penalty.

## 6. An administrative polygon stood in for the hiking scope

**caught** — orography preflight, run `33632003837`.

The Zermatt municipality polygon has a land-surface median of **2,939.8 m**. Only 30,313 of 365,173
pixels — **8.3%** — fall inside the intended 1,500–2,200 m valley band. Local GLO-30 patches looked
suitable while every coarse ERA5-Land cell remained a high-mountain cell, so no valley candidate
existed within 600 m and the run stopped at the gate.

**Rule.** A municipality, park or massif boundary is not a statement about where people hike. Every
geometry carries an intended hiking scope, excluded terrain classes, cited route evidence and a
provenance status; `pending-review` is not an approval. When the polygon and the scope disagree, fix
the geometry — a trail-network or valley-corridor shape — rather than the threshold.

## 7. Glacier cells were scored instead of excluded

**caught** — Alpine pilot, finding S2.

Zermatt's Alpine and High-alpine bands and Grindelwald's High-alpine band drew from cells reaching
21.8–27.1 m snow depth. ECMWF states that ERA5-Land snow depth at or above 10 m marks a glacier
location where snow depth is not well known.

**Rule.** When a destination's reviewed scope excludes glacier ice, a glacier-indicator cell is
**excluded**, not converted into a very poor hiking score. A bad number is still a claim. Five
destinations therefore use explicit non-nearest cells recorded with written reasons in
`representative-cell-overrides.json`.

## 8. Coarse grid wind was allowed to behave like a safety signal

**caught, still open** — finding S3 / H2. `productionGate: blocked`.

Across ten Alpine cells and 30 years, **no** hiking-window hour reached the configured 40 km/h
threshold. In the 50-point release, 43 of 50 destinations record zero high-wind hours in every month
and **506 of 600 months receive a wind component of 100** — up to ten overall points, materially
helping to compensate unusable rain or snow. The unit conversion is correct; the physics is not
resolvable. A 9 km land-surface reanalysis at 10 m does not see exposed ridges or passes.

**Rule.** Correct units do not make a variable fit for purpose. Wind is described strictly as coarse
10 m grid-cell wind; `allowTrailSafetyClaimsV1: false` is an architecture invariant, and grid wind is
excluded from confidence (`confidenceContribution: "excluded-unvalidated-grid-wind"`). Until Sol
approves a validated exposure/gust method, wind may not support a safety claim in copy, badge or icon.

## 9. UI copy outlived the data model

**shipped, corrected** — finding H3. Guard still missing.

`TrustSection.tsx` told users that low, middle and high elevations were evaluated separately and
combined, while all 50 published destinations carried exactly **one** band. A month heading read
"From low ground to the mountains" on a one-band build. Scope copy said the score used the
"nearest" ERA5-Land cell, when five destinations deliberately use an override — offset from the
display centroid by 4.5 km (Zermatt), 10.9 km (Grindelwald), 13.0 km (Torres del Paine), 16.9 km
(Annapurna) and **38.5 km** (Everest Region).

**Rule.** Copy is a claim and ages with the data. Text describing structure must be derived from the
data (`elevationBands.length`, the presence of an override), never written as a constant. Say
"selected representative cell" whenever an override exists. Export and render the resolved cell
coordinate, model elevation and override reason so a reader can audit the number they are shown.
**Guarded since 2026-09-05** by `tests/copy-claims.test.ts`, which compares the words to the data:
the single-cell copy fails if any destination gains a second elevation band, no string may call the
cell "nearest" while `representative-cell-overrides.json` has entries, the methodology paragraph's
percentages must match `weights.json`, and the search index may not contain a destination the science
layer withholds.

## 10. Release evidence described a superseded build

**shipped** — finding H4.

`generated/reports/data-quality.json` and `release-report.json` still described the five-destination
fixture set (`fixture-2026-08-31.1`) while the public manifest described 50 provisional destinations.
The manifest and checksums were internally consistent; the named release reports simply were not
evidence for the build that was live.

**Rule.** Regenerate and read both reports as part of any publication, and check that the report
identifies the same dataset version, destination count, hold list and eligibility counts as the
manifest. An out-of-date report is worse than no report, because it will be trusted.

## 11. Exact UTC coverage is not exact local coverage

**open, low severity** — finding M1.

Every download holds the exact 262,992 hourly UTC instants for 1991–2020. Converting to local dates
leaves one boundary month slightly short for non-zero-offset zones: 27 of 600 completeness values sit
at 0.9994–0.9999, and a partial endpoint day can drop out of yearly precipitation totals under the
daily completeness gate.

**Rule.** When a request window and a reporting window use different clocks, request padding on both
ends, aggregate, then trim to the local dates. Record requested UTC coverage and retained local
coverage separately rather than implying they are the same number.

## 12. Catalogue granularity mixed regions with their own subregions

**open** — findings M6 / M2.

The candidate set contains Dolomites, Alta Badia (~1.3 km from the Dolomites centroid) and Cortina
d'Ampezzo (~19.9 km) as three peer destinations. Counting all three toward a 50-destination gate mixes
regional and subregional concepts, makes rankings look more diverse than the underlying climate cells,
and double-counts one destination concept.

**Rule.** Pick one catalogue level and define overlap rules before adding destinations. Nested
concepts need an explicit parent relationship, not adjacency. Decide this before production indexing,
because it changes URLs.

## 13. The same thresholds were written down three times

**found during review, fixed 2026-09-05.**

`scoreLevel` in `lib/scoring/index.ts` and `scoreLevelFor` in `lib/scoring/recommendations.ts` were
byte-identical ladders (90/80/65/50). `confidenceLevel` read `highMinimum`/`moderateMinimum` from
`confidence-v1.json` while `confidenceLevelFor` hardcoded `85`/`65`; they agreed only by coincidence,
and editing the methodology config would have silently desynchronised them.

The third copy was the worst. `ScoreRing.tsx` coloured the ring with `score >= 85` / `score >= 65` —
the *confidence* boundaries applied to a *score*. A month at 82 published the label "very-good" and
was drawn in the middling colour.

Fixed by moving the score ladder into `data-config/scoring/levels.json` (same values), deleting both
duplicates, and deriving the ring colour from `scoreLevel()`. The published data rebuilt
byte-for-byte, confirming no label moved.

**Rule.** One threshold, one definition, read from config. Before adding a helper, grep for its
thresholds — and check whether the numbers you are about to reuse belong to the quantity you are
actually measuring. `tests/levels.test.ts` states every boundary in terms of the config and fails on
any hardcoded numeric ladder in `lib/`, `scripts/` or `components/`.

## 14. Evidence that could not be replayed from Git

**mostly corrected** — findings M1/M3 of the pre-audit.

Mask exclusions recorded a single diagnostic date and one variable's non-missing count, with no
committed response checksum — plausible decisions that could not be independently reproduced. The
canonical NDJSON had no recorded hash, and no committed test exercised the Python NetCDF parsing.

**Rule.** A decision is only as good as its replayable evidence. Hash the canonical output, persist
importer version and unit/normalisation/clamp metadata into provenance, commit a per-file artifact
manifest against the exact run and commit, and test importers against synthetic fixtures. Raw CDS
responses stay ephemeral, so everything needed to audit a number must survive in the repo.

## 15. Planning documents overstated what the code could do

**corrected** — finding L2.

The candidate plan required 5–9 sample points per band while `sampling-v1.json` caps the sampler at 3
and real bands hold 1–3. Nobody had checked the prose against the config.

**Rule.** Numbers in documentation are assertions and need the same regression tests as code. A
structural test now covers the planning file's status, count, IDs, coordinates, regions and zones.

## 16. Two URLs, one page

**found during the i18n port, fixed 2026-09-05.**

`routeCatalog()` emitted both `/en/best-hiking-destinations/june` and
`/en/best-hiking-destinations/europe/june`. The page component read the month with
`segments.at(-1)`, so the `europe` segment was accepted and then ignored: both URLs rendered the
identical global ranking. That is 24 published URLs of exact duplication, in a product whose own
`evaluateIndexability` lists `cannibalization` as a reason to withhold a page from the index.

It survived because nothing ever asked whether two routes could describe the same page. The i18n
port surfaced it immediately: resolving a URL to a page identity and rebuilding it could not
round-trip, because the rebuild had no idea where `europe` came from.

**Rule.** Every published route must describe a distinct page. A path segment that the renderer
ignores is not a route, it is a duplicate. When a filter or facet appears in a URL, either it changes
what the page shows or it does not belong in the URL.

## 17. A filter that could not reach half the catalogue

**shipped, fixed 2026-09-05.**

The finder's region dropdown offered four options: `all`, `europe`, `alps`, `macaronesia`. The
published catalogue holds 6 continents and 25 regions. Banff, Yosemite, the Himalaya, New Zealand
and Kilimanjaro, 24 of 46 recommendable destinations, had no option that selected them. The list was
written by hand when the fixture set was five Mediterranean destinations and never revisited as the
catalogue grew to 50.

Nothing failed, because a hardcoded option list cannot disagree with data it never reads.

**Rule.** Filter options are derived from the catalogue, never hand-listed: `facetsFor()` builds
continents, regions and tags from the search index and skips withheld destinations, so a filter can
never offer a destination the science layer holds back, nor hide one it publishes.
`tests/copy-claims.test.ts` fails when a published destination sits in a continent the finder cannot
offer, and when a published taxonomy id has no translation in both locales.

A related trap avoided in the same pass: the finder exposes no confidence filter, because every
published month is capped at exactly 64/low. A control whose every setting returns the same result is
a fake affordance, and it would imply the catalogue contains confidence variation it does not have.

## 18. Centroids placed where the place is, not where the model has data

**found during the batch-2 expansion, 2026-09-05.**

A destination is a coordinate handed to a 0.1-degree land-surface reanalysis. Naming the place
correctly is not the same as choosing a cell the model can describe, and four separate ways of getting
that wrong showed up in one batch of 217:

| Failure | Examples | Caught by |
| --- | --- | --- |
| Cell is permanent glacier | gran-paradiso, 262,992/262,992 hours at snow depth >= 10 m | glacier sentinel, during aggregation |
| Cell is sea-dominated, variables masked | amalfi-coast 0.141 land, cinque-terre 0.288, freycinet 0.406 | metadata validator, during aggregation |
| Cell is water-dominated inland | lake-tahoe 0.455, and my first relocation of it at 0.341 | land-mask preflight |
| Cell is far above the hiking corridor | manaslu 5151 m, langtang 5008 m, sierra-nevada-santa-marta 4405 m, kanchenjunga 4270 m | orography preflight |

Every one of these was mine, and all but the last cost a download before surfacing.

**Rule.** Place the centroid where the model has usable land at the elevation people walk, not on the
summit, the icecap or the shoreline that gives the place its name. The preflight now resolves model
elevation and land fraction before any climate request; run it and read both numbers. A destination
whose defining feature is water or ice usually has no representative cell at all, and dropping it is
the honest outcome (freycinet).

## 19. A derived value looked up with different logic than the value it describes

**found while building the land-mask gate, 2026-09-05.**

Measuring land fraction with an independent nearest-neighbour lookup reported 0.998 for a relocated
cinque-terre while the cell actually requested measured 0.501. Both lookups were "nearest grid point";
they disagreed because the request sat on a grid midpoint and the tie broke the other way.

The orography importer already carries a documented tie-breaking rule written so the geopotential and
the time series resolve to the same cell. The new lookup quietly did not use it.

**Rule.** An auxiliary field describing a cell must be read at the same resolved indices, by the same
selection code, as the value it describes. Never re-derive "which cell is this" a second time. Had the
gate shipped on the independent lookup it would have cleared a cell that cannot be downloaded.

## 20. Tests that forbade the operation they were written to protect

**shipped in the same session, fixed 2026-09-05.**

The candidate tests asserted that no candidate id is live and that no candidate shares a grid cell
with a live destination. Both are true before activation and necessarily false after it, so the first
successful expansion failed `pnpm verify` on its own guard rails, after the science had passed.

The assertions described the state at the moment they were written rather than the invariant. Rewritten,
they are stronger than the originals: a published candidate's coordinates must still match the candidate
file, which catches drift the old test could not see, and grid-cell uniqueness compares places rather
than files by deduplicating on id.

**Rule.** Assert the invariant, not the current state. Before writing a guard, ask what the system looks
like after the operation it is guarding succeeds, and make sure the assertion still holds there.

## 21. Operator inputs pasted into CI shell and cache keys

**found during the expansion, 2026-09-05.**

A hundred-destination selection is 1139 characters. It was interpolated straight into a GitHub cache
key, which caps at 512, so the first run failed key validation. The same value was being interpolated
into `run:` strings, which is a script-injection surface even when the input comes from an operator.

**Rule.** Workflow inputs reach the shell through the job environment, never through `${{ }}` inside a
`run:` string. Anything unbounded that has to appear in a key is digested first.

---

## Inherited lessons — sibling project

`climate-decision-engine/mistakes.md` documents 16 bug classes from a product with the same
architecture and a much larger presentation layer. These transfer directly and are worth reading in
full before building any UI here:

- **#1 evidence-to-copy** — generated prose claiming what the data does not support. The single
  highest risk for this project's web-app phase.
- **#3 eligibility rules re-derived inconsistently across layers** — see #13 above; the same class.
- **#4 ties and empty states interpolated into broken sentences** — with `bestMonths` legitimately
  empty for four destinations here, this is a certainty, not a risk.
- **#13 a single point sold as a whole region; misleading labels** — already paid for there, and it
  is exactly finding H3 above.
- **#5 numbers shown at one precision and compared at another**, **#6 rankings that don't match what
  they show**, **#8 i18n leaks and locale-coupled logic**, **#14 copy mechanics**,
  **#15 a giant dataset passed as a client-component prop** (mobile-only failure).

Do not inherit its thresholds, its NASA POWER handling, or its sea-temperature logic. Thresholds here
come from Sol.

---

## Process notes

- The gate is the answer. Every hold in this repo — Zermatt, Innsbruck, El Chaltén, Sikkim, Torres
  del Paine — exists because a threshold held while a plausible-looking build wanted through. The
  correct response to a blocked gate is better geometry, better evidence, or a Sol decision.
- Structural validity is not scientific validity. Every rejected build in this repo passed schema
  validation, checksums and its tests. "50/50 destinations, 262,992 observations each, all hashes
  agree" was true of the build that recommended hiking Sikkim in a 1,024 mm monsoon month.
- Implementation may not grant approval. Luna can build the gate; only Sol can decide the number, and
  no automated step may write a release-approval flag.
- Read the producer before patching the consumer. Cinque Terre's rejection looked like an
  over-strict validator, and the fix would have been to relax a finiteness check. Reading the Python
  first showed that the field is the maximum over every finite snow-depth value, so a null means the
  variable is masked and the validator was right. One file read separated a correct diagnosis from
  disabling a real gate.
- Write the audit down and date it. The `docs/` reports are why every item above could be recorded
  with its evidence instead of rediscovered.
