# SEO and answer-engine audit — 2026-09-27

## Outcome

The technical SEO and answer-engine layer is implemented and public indexing is explicitly enabled for pages that pass the conservative page-level quality gate. The published dataset remains `provisional`; editorial indexing approval does not represent or fabricate scientific production approval.

No code change in this audit fabricates outstanding scientific, licensing, legal, accessibility/performance, or release approvals. As of 2026-10-07, the sitemap is capped at 370 URLs: the existing editorial index plus 22 approved bilingual blog URLs. Repetitive month pages, tools, legal boilerplate, unapproved comparisons and the other destination articles remain `noindex` and are omitted from the sitemap.

## Implemented

- Locale-specific canonical URLs and reciprocal English/German `hreflang`, including `x-default`.
- Unique titles and descriptions for destinations, rankings, areas, themes and approved comparisons.
- Explicit `noindex` for repetitive month pages, tools, legal boilerplate, withheld recommendations, low-confidence destinations and unapproved comparisons.
- A version-controlled shortlist of 94 destination articles per language. Every selected article must have recommendable months, at least 95 percent data completeness, a licensed image, at least three substantive sections, at least 120 words and at least two internal alternatives.
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
- Search Console and Bing Webmaster Tools verification/submission remain external account actions.

## Activation checklist

1. Verify live `robots.txt`, `sitemap.xml`, canonical tags and a sample of English/German pages.
2. Submit `https://besttimetohike.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
3. Monitor indexing, Core Web Vitals, rich-result validation and query/citation coverage; improve pages from evidence rather than increasing the number of indexable templates.
4. Complete the scientific production approvals with real evidence independently of the editorial indexing release.
