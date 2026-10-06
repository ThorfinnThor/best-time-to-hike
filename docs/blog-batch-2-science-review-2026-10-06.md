# Blog batch 2: scientific candidate review

Reviewer: Sol scientific/editorial review
Source for publication: current public 315-destination export
Historical period originally reviewed: 1991–2020
Decision: paused before drafting; every numerical case below requires a fresh 1991–2025 claim review

## Scope decision

The public manifest contains 315 destinations and marks the dataset `provisional`. This does not mean the records are fixtures or that article publication is prohibited. It means the catalogue has no blanket production approval for regional or route-level claims. Each record describes historical conditions at one selected ERA5-Land model cell, and the article must not turn the cell into a statement about every trail in the named destination. Public numeric confidence was retired because an arbitrary single-point cap did not measure the distinct evidence dimensions.

The public manifest and all 315 committed climate snapshots now cover 1991–2025. A separate 375-destination internal audit remains a different inventory and must not be mixed into public claims. The numerical examples below were selected before migration and are retained only as editorial candidates; they are not publication-approved until their exact values, holds and recommendation status are rechecked against the current public files.

The first blog batch established the relevant publication precedent: an article may be approved separately when every numeric claim is traceable, the selected-cell limitation is visible and the text avoids forecasts, route access and safety claims.

## 1. The range hidden inside a monthly average

**Decision:** approved for drafting.

**Primary cases**

- Mount Shasta in May: 6.1°C P10, 14.5°C mean and 23.3°C P90, a 17.2°C span.
- Zion in October: 4.9°C P10, 14.3°C mean and 22.1°C P90, also a 17.2°C span.

Both months are recommendation-eligible in the current export and both destination articles are on the curated indexing list.

**Sources**

- `public/data/hiking/destinations/us/mount-shasta.json`
- `public/data/hiking/destinations/us/zion.json`
- `lib/hiking/climate.ts`
- `data-config/methodology/climate-aggregation-v1.json`

**Required wording boundary:** P10 and P90 are percentiles of historical hourly temperatures sampled in the configured local hiking window. They are not daily minimum and maximum temperatures, a forecast for a particular trip or a promise that a visitor will experience the full span.

**Distinct article shape:** begin with one apparently simple 14°C average, unfold it into the sampled distribution, then compare two destinations with nearly identical means. Use an annotated range graphic rather than a ranking or seasonal calendar.

## 2. Mild air, frequent modelled snow days

**Decision:** approved for drafting.

**Primary cases, all in May**

- Lake Tahoe: 11.5°C hiking-window mean, 65.81% snow-day probability, snow component 0, recommendation-ineligible.
- Yosemite: 11.3°C mean, 63.98% snow-day probability, snow component 0, recommendation-ineligible.
- Berchtesgaden: 10.1°C mean, 79.35% snow-day probability, snow component 0, recommendation-ineligible.

All three destination articles are on the curated indexing list.

**Sources**

- `public/data/hiking/destinations/us/lake-tahoe.json`
- `public/data/hiking/destinations/us/yosemite.json`
- `public/data/hiking/destinations/de/berchtesgaden.json`
- `data-config/methodology/climate-aggregation-v1.json`
- `data-config/methodology/recommendation-eligibility-v1.json`

**Required wording boundary:** a modelled snow day is defined by the configured model-cell snow-cover or snow-depth threshold. It does not prove that a named trail is covered, closed or unsafe. The article may explain why the model withholds a recommendation; it may not report route conditions.

**Distinct article shape:** follow one May decision through three layers: mild sampled air, frequent modelled snow days and the critical-component gate. Present the three places as case files, not as a ranked list.

## 3. Warmest, driest or strongest overall month?

**Decision:** approved for drafting.

**Primary case: Blue Mountains**

- January is the warmest eligible month: 22.4°C, 52.85% wet-day probability, score 74.
- July has the lowest wet-day probability: 9.5°C, 20.65% wet-day probability, score 88.
- September has the highest overall score: 14.5°C, 27.67% wet-day probability, score 92.
- December has the longest mean daylight: 14.3 hours, 21.0°C, 47.20% wet-day probability, score 79.

All twelve months are recommendation-eligible in the current selected-cell export. The destination article is on the curated indexing list.

**Source**

- `public/data/hiking/destinations/au/blue-mountains.json`

**Required wording boundary:** the overall score is the site's configured weighted model result and is not a universal definition of “best.” The article should let the reader compare physical metrics and explain why different preferences point to different months. It must not imply that the longest-day month or warmest month is automatically the safest or most suitable.

**Distinct article shape:** an interactive-feeling decision path in prose: choose warmth, lower rain frequency, balanced score or daylight, then reveal the corresponding month. End with one comparison table that keeps the four choices visible together.

## 4. Same temperature, different air

**Decision:** approved as the replacement for the proposed grid-wind article.

**Primary June pair**

- Bryce Canyon: 20.6°C hiking-window mean, 20.0% relative humidity and 10.78% wet-day probability.
- Mount Roraima: 20.9°C hiking-window mean, 80.2% relative humidity and 95.89% wet-day probability.

Both months are recommendation-eligible in the current export and both destination articles are on the curated indexing list.

**Sources**

- `public/data/hiking/destinations/us/bryce-canyon.json`
- `public/data/hiking/destinations/ve/roraima.json`
- `lib/hiking/climate.ts`
- `data-config/methodology/climate-aggregation-v1.json`

**Required wording boundary:** relative humidity is the historical mean for the sampled hiking hours at the selected cell. It is contextual information and is not an independently calibrated comfort, dehydration or safety index. The article may show that similar temperature means coexist with very different humidity and rain frequency; it may not convert that contrast into a physiological risk claim.

**Distinct article shape:** open with the two nearly identical temperatures, reveal the humidity contrast only afterward, and build two short climate portraits. Use paired “climate fingerprints” rather than the equal-rainfall laboratory structure used in the first blog batch.

## Rejected candidate

The proposed numerical grid-wind article is not approved for this batch. The current method records ERA5-Land 10 m grid-cell wind as context but gives it zero score weight and excludes it from eligibility and best-month selection because exposed-trail and gust validation remains blocked. A transparent methodology article could be written later, but a destination-led planning article risks making the unvalidated number appear more actionable than the evidence supports.

## Drafting requirements

Each language version must preserve the exact numeric meaning above, use its own editorial rhythm and remain within the existing 700–1,200-word quality gate. Every article needs a visible selected-cell and historical-period limitation, at least four source-checked claims, contextual destination links, methodology and finder links, and a licensed high-resolution hero image. The four posts remain drafts until their final bilingual copy and source regression checks receive article-level approval.
