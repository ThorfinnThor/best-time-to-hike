# BestTimeToHike — project guide

> Brand: **BestTimeToHike**. Domain default `https://besttimetohike.com` (`NEXT_PUBLIC_APP_URL`).
> Host: **Cloudflare Pages**, connected directly to this repo. Git author: **ThorfinnThor**.
> Sibling project: **Best Travel Climate** (`climate-decision-engine`) — same architecture, opposite
> centre of gravity. Read its `CLAUDE.md` and `mistakes.md` before building any UI here.

A bilingual (EN + DE), JSON-only hiking-season decision engine. It turns versioned ERA5-Land and
Copernicus DEM snapshots into transparent monthly scores, rankings, comparisons and a client-side
finder. **This project is science-first.** The scientific layer is the product; the interface exists
to communicate it honestly, never to flatter it.

> **Golden rule:** process scientific sources in CI, publish static JSON, render statically.
> No runtime database, weather API, DEM call, or climate call. Pages read only committed JSON.

## Current state (tag `v1-provisional`)

| | |
| --- | --- |
| Dataset | ERA5-Land 1991–2020 normal, one representative 0.1° model-grid cell per destination |
| Destinations | 50 published, 46 exposed in the finder |
| Destination-months | 600 — **244 recommendation-eligible, 356 deliberately excluded** |
| Holds | `zermatt`, `el-chalten` (persistent snow); `torres-del-paine`, `sikkim` (no eligible month) |
| Algorithm | `1.1.0` |
| Status | `provisional`, `noindex`, robots disallow all, sitemap empty |
| Approvals | **all six flags in `release-approvals.json` are `false`** |

`v1-provisional` is the rollback point for the web-app phase: `git reset --hard v1-provisional`.

## Operating model — Sol and Luna

Two roles, and the boundary between them is the main safety control in this repo.

- **Sol** reviews science and grants scientific decisions. Sol's decisions are written into versioned
  `data-config/methodology/*.json` files and into a dated report under `docs/`. Sol decides thresholds,
  representativeness, and whether a method may support a public claim.
- **Luna** implements. Luna may build anything the versioned config already authorises, and may write
  code, tests, exports and UI.

**Luna never changes an approval flag, never relaxes a gate, and never invents a threshold.** If a
change needs a number that is not already in a methodology config, it needs Sol. When a gate blocks
something, the gate is the answer, not the obstacle — Zermatt's 600 m orography block is the canonical
example (see `mistakes.md` #5).

Currently pending Sol: representative-cell approval for the five override destinations, the wind
model, and the four non-recommendable destinations.

## Run

```bash
pnpm install
pnpm data:pipeline     # seed -> normalize -> score -> export -> validate (offline)
pnpm data:rebuild      # normalize -> score -> export -> validate (from committed snapshots)
pnpm test              # tsx --test tests/*.test.ts
pnpm dev
pnpm verify            # the full gate — run this before any commit that touches data or scoring
```

`pnpm verify` = rebuild + architecture guard + determinism guard + tests + build + typecheck +
release report. The determinism guard regenerates the whole export and compares **every byte**;
if your change is legitimate but non-deterministic, fix the non-determinism, don't relax the guard.

Real ingest runs only in the manual GitHub Action `Refresh real static data`. `publish: false`
produces a private 14-day staging artifact and changes nothing. `publish: true` fails closed unless
the source and geometry approvals carry an approver and timestamp. `CDSAPI_KEY` is an encrypted
Actions secret and never reaches Cloudflare, snapshots, logs, or the public build.

## Stack

Next.js 15 App Router + React 19 + TypeScript, Tailwind 3, static export to `out/`, `tsx` for ETL,
`ajv` for schema validation, `geotiff` for DEM reads. No chart library — CSS/SVG only. No runtime
service of any kind. Dependencies are allowlisted in `config/dependency-allowlist.json`; adding one
is an architecture decision, not a convenience.

## Architecture

```
ERA5-Land time-series + ERA5-Land invariant geopotential + Copernicus DEM GLO-30 + OSM geometry
  -> scripts/import   (fetch-dem, fetch-era5, download_era5*.py, source-preflight)
  -> scripts/geo      (build-sampling, prepare-representative-50, fetch-osm-boundaries)
  -> scripts/normalize (aggregate-hourly, normalize)
  -> scripts/score    -> scripts/export
  -> public/data/hiking/**   <- the ONLY thing pages read
  -> scripts/validate (schemas, invariants, checksums, determinism, architecture)
  -> next build -> out/ -> Cloudflare Pages
```

`generated/intermediate/` is gitignored. `data-snapshots/**` and `public/data/hiking/**` are committed.
The finder is a client-side computation over the compact static search index and can never change a
published score.

## Data-config — source of truth, edit these

- `data-config/sources/destinations.json` — destination master.
- `data-config/sources/destination-candidates.json` — planning-only catalogue.
- `data-config/sources/destination-science-decisions-batch-1.json` — Sol's per-destination bands,
  weights, intended hiking scope, excluded terrain classes, cited evidence, geometry hash.
- `data-config/sources/representative-cell-overrides.json` — explicit non-nearest grid cells, each
  with a written reason. **Five destinations are overrides; the UI must not call these "nearest".**
- `data-config/geography/destination-areas.geojson` + `destination-overrides.json` — polygons and
  exclusions, each carrying provenance status, intended scope and excluded classes.
- `data-config/methodology/*.json` — Sol's versioned decisions (see below).
- `data-config/scoring/{weights,curves}.json` — weights must sum to exactly 1 (`SCORE002`).
- `data-config/seo/{page-definitions,project-seo-config}.json`, `taxonomies/months.json`.

## The scientific boundary — non-negotiables

These are settled, cost real time to get right, and are enforced by tests. Do not re-derive them.

**Two elevations, never conflated.**
`terrainElevationM` is a 1 km GLO-30 window median, used **only** to match a candidate cell to a
destination band. `era5LandGridElevationM` comes from ECMWF's official ERA5-Land invariant
geopotential (`z / 9.80665`, hash-pinned NetCDF) and is the **only** valid reference for the
temperature lapse correction. Observed divergence between them across 34 staged points: 0.7 m to
877.4 m. The naming and data flow are enforced by tests — keep them.

**A point must pass both gates.** Terrain match and model match are independent. Innsbruck had a
Foothill point 44.1 m from target in local GLO-30 terrain and 767.4 m off in the ERA5-Land model.
Passing one is not passing.

**The 600 m model-orography gate does not move.** ≤300 m good, 301–600 m review, >600 m blocked.
Temperature can be lapse-corrected; snow, precipitation, humidity and wind cannot. A capped
temperature correction is a representativeness failure, not a confidence penalty.

**ERA5-Land source semantics.** Total precipitation in the ARCO time-series product is *already*
de-accumulated — `INCREMENTAL_PER_TIMESTEP_M`, never de-accumulate twice. Snow cover arrives in `%`
and is divided by 100 (`PERCENT_TO_FRACTION`). Physical snow height is `sde` in metres; `sd` is snow
water equivalent and is **not** an accepted alias. Exactly 262,992 hourly records per point.
Unexpected units, missing variables, non-contiguous time axes and material negative physical values
all fail closed.

**Negative-value floor.** Packed de-accumulation produces tiny signed artifacts. Clamp to zero no
lower than `-1e-6 m`; reject below it; record count and original minimum. This is a *local versioned
policy*, not an ECMWF threshold — say so wherever it is documented.

**Glacier indicator.** ERA5-Land snow depth ≥ 10 m indicates a glacier cell where snow depth is not
well known. Such a cell is **excluded** when the destination scope excludes glacier ice — never
scored as "very poor hiking".

**Persistent snow.** Twelve months at `snowDayProbability === 1` (below the 10 m sentinel) triggers a
manual route-representativeness hold, read from `glacier.persistentSnowReviewMonthCount`.

**Time handling.** UTC instants are the observation identity. IANA local dates supply grouping labels,
including 23- and 25-hour DST days and historical two-hour shifts. Missing observations are never
replaced by zero, and completeness denominators come from the normal period.

## Recommendation policy (v1.1.0)

Versioned in `data-config/methodology/recommendation-eligibility-v1.json`, implemented in
`lib/scoring/recommendations.ts`. Every layer that shows a score must route through it.

- A month is eligible only when **every unrounded** critical component (`temperature`,
  `precipitation`, `snow`, `heatStress`, `wind`, `daylight`) is **> 20**.
- An ineligible month is capped at **49 / `poor`** and excluded from best-months, every ranking,
  every theme and the finder.
- **Best-month lists are never padded.** Zero, one or two best months is a valid answer.
- A held destination keeps its detail route as a **provenance/review page carrying no hiking-score or
  best-month claim**.
- One representative point with unapproved destination scope: confidence capped at **64 / `low`**.

These are conservative release-policy controls. They are **not** production science approval.

## Honesty rules

The whole product's value is that it does not overclaim. Every one of these came from a real finding.

- Values are **historical climatology, not a forecast**. Say it on-page, in the footer, in methodology.
- The score describes **one selected representative ERA5-Land grid cell**, not the whole region and
  not any specific route. When a `representative-cell-override` exists, say "selected representative
  cell", never "nearest".
- **Wind is coarse 10 m grid wind.** It is not an exposed-trail or gust model. 43 of 50 destinations
  record zero high-wind hours across 30 years. `allowTrailSafetyClaimsV1: false` is an architecture
  invariant — no copy, badge, or icon may imply trail safety.
- Confidence measures **record completeness and representativeness**, not scientific uncertainty.
  Never merge the two into one unexplained percentage.
- Never invent data. Unknown stays unknown. Missing never becomes zero.
- Rankings order by suitability then confidence. `affiliateInfluencesRanking: false` is an invariant.
- German copy avoids the em/en dash (reads as AI). Use commas or "bis" for ranges; compound hyphens
  are fine. English uses "to" for ranges.

## The finder

The finder is the product surface, not a widget. `lib/finder/match.ts` is a pure client-side
computation over `public/data/hiking/search/destination-index.json` (~75 KB); it can never change a
published score, only produce a separate match value.

- **Filter options come from the data.** `facetsFor()` derives continents, regions and tags from the
  index and skips withheld destinations. Never hand-list options (mistakes.md #17).
- **The science gate is absolute.** A destination with `recommendationEligible: false`, and any month
  with `recommendationEligible: false`, is never a candidate, whatever the preferences say. This
  holds for "any month" search too: it picks the best *eligible* month, not the best month.
- **Hard filters vs penalties.** Continent, region, tags and the daylight floor exclude. Temperature,
  rain, snow and heat are penalties, so a near-miss still surfaces with an explanation.
- **Never pad, never fake.** An empty result list says so and names which constraint to relax. There
  is deliberately no confidence filter: every published month is capped at 64/low, so the control
  would do nothing while implying variation the data does not have.

Catalogue reality as of `v1-provisional`: 46 destinations are recommendable, 34 have three or more
eligible months, 30 have four or more, 4 are year-round. Many filter combinations legitimately return
a handful of results. That is the gate working, not a bug to design around.

## Guards — keep them, don't route around them

- `pnpm guard:architecture` — scans runtime code for network clients, databases and imports across
  the ingest boundary, against `config/architecture-invariants.json`.
- `pnpm guard:determinism` — byte-identical export reproduction.
- `pnpm data:validate` — schemas, cross-file invariants, checksums, byte totals, duplicate slugs.
- `pnpm data:quality` — warn-only review signals (abrupt month-to-month jumps, low completeness,
  identical cross-destination vectors, collapsed sampling coordinates, strong elevation mismatch).
  **Warnings are review signals and are never silently corrected.**
- `pnpm release:report` — every unresolved approval appears as an explicit `BLOCKED_*` production
  blocker. The report is diagnostic; it cannot approve anything.

## i18n

EN and DE, both path-prefixed. English is the default: `/` permanently redirects to `/en`, and `en`
is the hreflang `x-default`. Four files, four jobs:

- `lib/i18n/config.ts` — **what the slugs are**: locales, the translated `routes` segment map, month
  slug/name helpers, theme and info route keys.
- `lib/i18n/links.ts` — **how URLs are built**: `links.*(locale, …)` plus `altLanguages()` for
  hreflang. Every internal href goes through here.
- `lib/i18n/dict.ts` — **what the interface says**: every user-visible string, per locale.
- `lib/i18n/resolve.ts` — **which page this is**: `resolvePageId()` turns locale-specific segments
  into a locale-independent `PageId`, and `pathFor()` rebuilds that page's URL in any locale. This is
  what makes correct hreflang and a page-preserving language switch possible.

Three rules, all enforced by `tests/i18n.test.ts`:

1. **Never hardcode a locale path.** A hand-written `/de/...` survives every later refactor and
   quietly sends readers to the wrong language. The test scans `components/` and `app/` for
   `href="/de` and `` `/${locale}` `` and fails the build.
2. **Never inline `locale === "de" ? "…" : "…"` in a component.** Add a key to `dict.ts`. The test
   compares the two locale trees structurally and fails if a key exists in one and not the other.
3. **German prose carries no Gedankenstrich.** A spaced en/em dash reads as machine-written; use a
   comma, a semicolon or "bis". Numeric ranges (`1991-2020`, `1500-2200 m`) are data and keep their
   dash. The test enforces the spaced-dash rule on the whole German tree.

`lib/site.ts` is the single source of the base URL for robots, sitemap and page metadata.

The postbuild step `scripts/export/fix-static-languages.ts` deterministically sets `lang="de"` on
every exported German document and **fails if even one page cannot be localized**.

## Deploy

Cloudflare Pages builds every push to `main` and publishes `out/`. No Worker, no deploy token, no
runtime. Rollback is a normal Git revert; Pages redeploys automatically. A failed data refresh leaves
the last known-good commit and deployment untouched.

Production activation requires `NEXT_PUBLIC_DATA_STATUS=production` **and** all six approval flags —
see `docs/going-live.md`. Setting the flag without the approvals is prohibited.

## Web-app phase — what to take from the sibling project

`climate-decision-engine` is ~4,500 lines of `lib`+`components`+`app` against this project's ~1,470.
It solved the presentation and SEO problems this project has not started. **Take its UI/UX, not its
scientific posture.**

Worth porting: the i18n system (`dict.ts`, `links.ts`, `names.ts`, `altLanguages` hreflang, localized
slugs with round-trip tests), JSON-LD, per-page metadata, OG cards (`og.tsx`), area/region hubs,
breadcrumbs, FAQ, the month-selector hub pattern, `llms.txt`, the blog-from-one-JSON-file pattern,
the shared locale-aware view + thin route files rule, and the `isLive()` affiliate safety gate.

**The hard rule for every port:** the sibling's generators assume every destination-month has a
publishable score. This project has three states it never had — `recommendationEligible: false`,
`recommendationHoldReason`, and `overallScore: null`. Any ported generator must consult
`recommendationDecision` and the hold flag before it writes a sentence, and must ship a regression
test against `sikkim`, `zermatt`, `el-chalten` and `torres-del-paine`. Generating 900 words of
confident prose about Sikkim's best months would reproduce blocker B1 as copy.

Do **not** port: NASA POWER handling, sea-temperature logic, the `sun_hours` estimate, or any
threshold. Thresholds here come from Sol.

## Read before building a feature

- **[mistakes.md](mistakes.md)** — every bug class that shipped or nearly shipped here, grouped by
  root cause, each with the rule that prevents it.
- `docs/representative-50-science-release-audit-2026-09-02.md` — the current audit of record.
- `docs/science-data-pre-audit-2026-09-01.md` — source semantics and the open operator decisions.
- `docs/candidate-climate-science-audit-pilot-2026-09-02.md` — why Zermatt and Innsbruck are held.
