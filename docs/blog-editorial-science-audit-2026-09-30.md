# Blog editorial and science audit — 2026-09-30

## Decision

All six articles in the first bilingual batch are **approved for publication**. The approval covers editorial quality, traceability of the stated climate figures, bilingual completeness and search-quality safeguards. It does not change the provisional status of the underlying destination dataset and is not a general scientific production approval for every site claim.

| Article | Editorial decision | Scientific decision |
| --- | --- | --- |
| `dry-does-not-mean-hikeable` | Approved | Approved |
| `wide-and-narrow-hiking-seasons` | Approved | Approved |
| `shoulder-season-hiking-worldwide` | Approved | Approved |
| `daylight-and-hiking-season` | Approved | Approved |
| `rainfall-total-versus-wet-days` | Approved | Approved |
| `mild-hiking-around-the-year` | Approved | Approved |

The articles remain marked `draft` until the separate release step applies the approval, publication date, sitemap entries and deployment verification.

## What was checked

- Every article has complete English and German copy, a unique title, a distinct ordered block structure and 700–1,200 words per locale.
- Titles and search descriptions stay within the publication limits of 60 and 155 characters.
- Each article links to the methodology, an appropriate finder or ranking surface and at least three relevant destination pages in the same locale.
- Hero images resolve to the licensed local image registry.
- Every evidence record points to an existing published destination artifact, identifies dataset version `era5-land-representative-point-1991-2020-v1` and carries the review date.
- Exact source regressions now cover the central numeric claims: heat risk in nominally dry months, recommendation windows, shoulder-season examples, annual daylight ranges, matched rainfall totals versus wet-day frequency and the 12-stop mild-climate itinerary.
- The copy distinguishes historical monthly climate summaries from forecasts and does not infer route safety, trail condition, storm timing or exposed-trail wind from data that cannot support those claims.

## Corrections made during the audit

- Shortened the English rainfall article title and description so the search snippet is concise without changing the scientific claim.
- Added maximum metadata-length assertions to the bilingual quality gate.
- Added `tests/blog-science.test.ts`, which fails if the cited source values or recommendation windows drift away from the published article claims.

## Release conditions

The publication step may set all six posts to `approved` with publication date `2026-09-30` when the full test, typecheck and production build remain green. It must then verify:

1. both localized blog indexes and all twelve localized article URLs are indexable;
2. canonical and language-alternate URLs use `https://besttimetohike.com`;
3. exactly fourteen blog URLs enter the sitemap;
4. every article renders one H1 and valid `BlogPosting` structured data;
5. the Cloudflare production deployment completes successfully.
