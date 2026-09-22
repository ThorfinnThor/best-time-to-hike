# SEO indexability strategy — 2026-09-22

## Decision

BestTimeToHike will use an explicit, quality-gated allowlist of at most 200 URLs across English and German. Two hundred is a ceiling and a planning target, not a quota. A page that fails a content or science gate remains `noindex` even when that leaves the index below the target.

This avoids the Climate Decision Engine failure mode: a large route catalogue must not become a large search index merely because every route can be rendered. Creating many pages with the same structure and only swapped place or month values does not make those pages independent answers.

## Planned index

| Stage | Page family | EN + DE URLs | Cumulative |
| --- | ---: | ---: | ---: |
| 1 | Home, methodology, about | 6 | 6 |
| 1 | Twelve global monthly rankings | 24 | 30 |
| 1 | Twenty-nine area guides | 58 | 88 |
| 2 | Warm and low-rain rankings for twelve months | 48 | 136 |
| 3 | Three enriched comparisons | 6 | 142 |
| 4 | Twenty-nine scientifically cleared destination guides | 58 | 200 |

The canonical machine-readable decision is in `data-config/seo/indexability-strategy-v1.json`.

## What is indexable first

The 88 stage-one URLs have distinct planning intent and enough underlying data to support a useful answer:

- the home page and the two substantive explanatory pages in both languages;
- global monthly rankings, each answering where to hike in a particular month;
- area guides with at least five recommendable destinations, a real regional season profile, elevation range, country coverage, ranked options and named withheld destinations.

They may enter the sitemap only when the published dataset is marked `production` and normal metadata, canonical, localization and claim checks pass.

## Conditional families

### Theme rankings

Only `warm` and `low-rain` are approved. Every monthly page contains at least twelve results and its full result set has Jaccard similarity of at most 0.70 with that month's global ranking. The implemented pages explain their threshold, the month's temperature and wet-day ranges, and the trade-off between the theme filter and overall hiking suitability.

`snow-free` is excluded. Its current top twelve are identical to the global top twelve in every month. Indexing both would create two pages that appear to answer different questions but deliver the same leading result set. It may be reconsidered only after its product meaning and content are genuinely redesigned.

### Comparisons

The three existing comparisons now pass their content gate. They explain season length, the shared hiking window and the drier option across jointly recommendable months, followed by the twelve-month suitability table and links to both destination guides. Their public machine flag remains false while the dataset is provisional and becomes eligible only in a production export.

### Destination guides

The 29 selected destinations are recommendation-eligible, have no hold and agree with a signed independent Golden Case. The final Sol review also confirmed for every selected page: a valid internal coordinate chain, complete approved-period observations, no spatial-audit error, no independent climate-diagnostic flag, and either no more than 20 km centroid-to-cell distance or independent named-route evidence. Denali is the sole distance exception and is supported by official NPS Savage Canyon Trail geometry.

This authorizes indexing only for the site's explicitly restricted selected-model-cell climatology claim. It does not raise the underlying climate confidence: all current scored months retain the 64/low cap, and the pages must continue to say that they do not describe a whole region, a particular trail, a forecast or safety. The decision is recorded in `data-config/seo/destination-indexability-science-v1.json`.

Every selected destination has now passed both:

1. the scientific selected-cell claim and evidence decision; and
2. the destination content gate, including a direct seasonal answer, unsuitable months and reasons, useful climate metrics, walking-day shape, honest elevation/scope context and alternatives.

Any future change that breaks one of those checks returns the page to `noindex`. A fallback may replace it only if the fallback independently passes the same gates.

## Permanently excluded under this strategy

Destination-month pages, finder/query states, the comparison tool, ranking/theme chooser pages and legal/credit boilerplate are not search entry pages. They can remain useful in navigation, but they must stay out of the sitemap and carry `noindex` where applicable.

## Rollout controls

Each stage must be deployed and evaluated before the next one is released. The implementation must generate the sitemap from this allowlist, test exact family counts, prevent accidental route-family expansion and keep `noindex` pages crawlable so search engines can observe the directive. Search Console inspection, coverage and query quality should be reviewed after each stage; raw impression growth is not a reason to weaken the gate.

## Current approval boundary

The Luna implementation and final Sol evidence review are complete for all four stages. The complete 200-URL allowlist can contribute only after the dataset itself reaches production. Until then, the manifest keeps the sitemap empty and every page `noindex`. The 64/low climate-confidence cap remains unchanged and is disclosed through the selected-cell scope rather than rewritten as higher certainty.
