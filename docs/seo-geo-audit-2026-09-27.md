# SEO and answer-engine audit — 2026-09-27

## Outcome

The technical SEO and answer-engine layer is implemented, but public indexing remains intentionally disabled while the published dataset is `provisional`. This is a release-integrity safeguard, not an SEO defect: provisional builds emit `noindex`, disallow crawling in `robots.txt`, and publish an empty sitemap.

No code change in this audit fabricates the six outstanding scientific, licensing, legal, accessibility/performance, or domain approvals. Once the established release process changes the dataset to `production`, the same code automatically exposes only pages that pass the conservative page-level quality gate.

## Implemented

- Locale-specific canonical URLs and reciprocal English/German `hreflang`, including `x-default`.
- Unique titles and descriptions for destinations, rankings, areas, themes and approved comparisons.
- Explicit `noindex` for repetitive month pages, tools, legal boilerplate, withheld recommendations, low-confidence destinations and unapproved comparisons.
- A sitemap containing only index-approved pages, with language alternates and `x-default`.
- Open Graph and Twitter cards with explicit large-image metadata.
- Google preview directives allowing long snippets and large image previews on indexable pages.
- Visible FAQ answers generated from the same data as the FAQ structured data.
- Organization, WebSite, WebPage/TouristDestination, BreadcrumbList, ItemList, FAQPage and Dataset JSON-LD where the corresponding content is visible.
- Dataset provenance on the methodology page: ERA5-Land DOI, 1991–2020 coverage, aggregation technique, version, variables and machine-readable downloads.
- `llms.txt` with canonical entry points, provenance, limitations, withheld destinations and destination URLs; the file itself is `noindex`.
- Explicit access policy for major search and answer-engine crawlers in the production robots configuration, including OAI-SearchBot, Claude-SearchBot and PerplexityBot.

## Deliberate limits

- `llms.txt` is a convenience for systems that choose to read it; it is not a Google ranking signal.
- Structured data never converts withheld or low-confidence claims into recommendations.
- There is no special “GEO schema”. Answer-engine visibility depends on the same crawlability, evidence, clear language, page quality and source attribution that support conventional search.
- Search Console and Bing Webmaster Tools verification/submission are external account actions and are only useful after production indexing is unlocked.

## Activation checklist

1. Complete the existing release approvals with real evidence.
2. Run the established production release workflow; do not edit the generated manifest by hand.
3. Verify live `robots.txt`, `sitemap.xml`, canonical tags and a sample of English/German pages.
4. Submit `https://besttimetohike.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
5. Monitor indexing, Core Web Vitals, rich-result validation and query/citation coverage; improve pages from evidence rather than increasing the number of indexable templates.
