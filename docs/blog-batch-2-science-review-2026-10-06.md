# Blog batch 2: scientific candidate review

Reviewer: Sol scientific/editorial review
Source for publication: current public 315-destination export
Historical period: 1991–2025
Dataset version: `era5-land-representative-point-1991-2025-v1`
Decision: four bilingual articles scientifically and editorially approved; repository publication flags remain `draft` until the separate release step

## Final SOL approval

The completed bilingual copy was rechecked on 2026-10-06 against the same public artifacts and methodology files cited below. All four posts now satisfy the 700–1,200-word publication range in both languages, retain distinct ordered block structures, use licensed destination imagery and carry visible selected-cell, 1991–2025 and no-forecast limitations.

- `temperature-range-hidden-in-average`: 812 English words, 755 German words.
- `mild-air-frequent-modelled-snow-days`: 750 English words, 724 German words.
- `warmest-driest-or-strongest-month`: 715 English words, 718 German words.
- `same-temperature-different-air`: 779 English words, 750 German words.

Source-regression tests now pin the exact percentile, snow, eligibility, score, humidity, wet-day and daylight claims to the current public destination JSON. The review found no remaining scientific blocker. The posts deliberately remain `draft` and absent from the blog index and sitemap until the publication step sets an explicit date and reruns the full release checks.

## Scope decision

The public manifest contains 315 destinations and marks the dataset `provisional`. This does not mean the records are fixtures or that article publication is prohibited. It means the catalogue has no blanket production approval for regional or route-level claims. Each record describes historical conditions at one selected ERA5-Land model cell, and the article must not turn the cell into a statement about every trail in the named destination. Public numeric confidence was retired because an arbitrary single-point cap did not measure the distinct evidence dimensions.

The public manifest and all 315 committed climate snapshots cover 1991–2025. A separate 375-destination internal audit remains a different inventory and must not be mixed into public claims. Every numerical example below has now been rechecked against the current public export. All cited month records have 35 valid sample years, `dataCompleteness: 1`, no destination-level scientific hold, and a matching destination article in the curated indexing set.

Algorithm 1.3.0 excludes unvalidated ERA5-Land grid wind from the score, eligibility gate and best-month selection. Public numeric confidence is retired. The articles may describe published physical metrics, the configured score and recommendation eligibility, but may not invent a replacement confidence value or use grid wind as trail evidence.

The first blog batch established the relevant publication precedent: an article may be approved separately when every numeric claim is traceable, the selected-cell limitation is visible and the text avoids forecasts, route access and safety claims.

## 1. The range hidden inside a monthly average

**Decision:** approved for drafting against the 1991–2025 export.

**Primary cases**

- Mount Shasta in May: 6.1°C P10, 14.6°C mean and 23.2°C P90, a 17.1°C span; recommendation-eligible, score 78.
- Zion in October: 5.0°C P10, 14.4°C mean and 22.4°C P90, a 17.4°C span; recommendation-eligible, score 89.

Both months are recommendation-eligible in the current export and both destination articles are on the curated indexing list.

**Sources**

- `public/data/hiking/destinations/us/mount-shasta.json`
- `public/data/hiking/destinations/us/zion.json`
- `lib/hiking/climate.ts`
- `data-config/methodology/climate-aggregation-v1.json`

**Required wording boundary:** P10 and P90 are percentiles of historical hourly temperatures sampled in the daylight-limited local 08:00–18:00 hiking window. They are not daily minimum and maximum temperatures, a forecast for a particular trip or a promise that a visitor will experience the full span. The two means are close, but neither the distributions nor their spans are identical.

**Distinct article shape:** begin with one apparently simple 14°C average, unfold it into the sampled distribution, then compare two destinations with nearly identical means. Use an annotated range graphic rather than a ranking or seasonal calendar.

## 2. Mild air, frequent modelled snow days

**Decision:** approved for drafting against the 1991–2025 export.

**Primary cases, all in May**

- Lake Tahoe: 11.6°C hiking-window mean, 66.91% snow-day probability, snow component 0, recommendation-ineligible.
- Yosemite: 11.5°C mean, 61.57% snow-day probability, snow component 1, recommendation-ineligible.
- Berchtesgaden: 10.1°C mean, 76.87% snow-day probability, snow component 0, recommendation-ineligible.

All three destination articles are on the curated indexing list.

**Sources**

- `public/data/hiking/destinations/us/lake-tahoe.json`
- `public/data/hiking/destinations/us/yosemite.json`
- `public/data/hiking/destinations/de/berchtesgaden.json`
- `data-config/methodology/climate-aggregation-v1.json`
- `data-config/methodology/recommendation-eligibility-v1.json`

**Required wording boundary:** a modelled snow day is a complete local day on which the selected cell crosses either 10% snow cover or 0.02 m physical snow depth. It does not prove that a named trail is covered, closed or unsafe. The article may explain that snow, a critical component, withholds these May recommendations; it may not report route conditions. Berchtesgaden also has a low precipitation component, but precipitation is not a critical gate and therefore is not the withholding reason.

**Distinct article shape:** follow one May decision through three layers: mild sampled air, frequent modelled snow days and the critical-component gate. Present the three places as case files, not as a ranked list.

## 3. Warmest, driest or strongest overall month?

**Decision:** approved for drafting against the 1991–2025 export.

**Primary case: Blue Mountains**

- January is the warmest eligible month: 22.2°C, 54.84% wet-day probability, score 71.
- July has the lowest wet-day probability: 9.5°C, 21.75% wet-day probability, score 86.
- September has the highest overall score: 14.6°C, 28.00% wet-day probability, score 91.
- December has the longest mean daylight: 14.3 hours, 21.1°C, 47.47% wet-day probability, score 77.

All twelve months are recommendation-eligible in the current selected-cell export. The destination article is on the curated indexing list.

**Source**

- `public/data/hiking/destinations/au/blue-mountains.json`

**Required wording boundary:** the overall score is the site's configured algorithm 1.3.0 result and is not a universal definition of “best.” Grid wind contributes zero weight. The article should let the reader compare physical metrics and explain why different preferences point to different months. It must not imply that the longest-day month or warmest month is automatically the safest or most suitable.

**Distinct article shape:** an interactive-feeling decision path in prose: choose warmth, lower rain frequency, balanced score or daylight, then reveal the corresponding month. End with one comparison table that keeps the four choices visible together.

## 4. Same temperature, different air

**Decision:** approved against the 1991–2025 export as the replacement for the proposed grid-wind article.

**Primary June pair**

- Bryce Canyon: 20.8°C hiking-window mean, 20.0% relative humidity and 11.05% wet-day probability; recommendation-eligible, score 90.
- Mount Roraima: 20.9°C hiking-window mean, 80.4% relative humidity and 95.81% wet-day probability; recommendation-eligible, score 75.

The selected-cell means differ by only 0.1°C, while relative humidity differs by 60.4 percentage points and wet-day probability by 84.76 percentage points.

Both months are recommendation-eligible in the current export and both destination articles are on the curated indexing list.

**Sources**

- `public/data/hiking/destinations/us/bryce-canyon.json`
- `public/data/hiking/destinations/ve/roraima.json`
- `lib/hiking/climate.ts`
- `data-config/methodology/climate-aggregation-v1.json`

**Required wording boundary:** relative humidity is the historical mean for the sampled hiking hours at the selected cell. It is contextual information and is not an independently calibrated comfort, dehydration or safety index. A wet day crosses the configured 1 mm full-local-day precipitation threshold; it does not describe timing, duration or trail impact. The article may show that similar temperature means coexist with very different humidity and rain frequency; it may not convert that contrast into a physiological risk claim. Roraima's June eligibility means only that all critical components clear the gate. It is not a claim that a month with a 95.81% wet-day probability suits every hiker.

**Distinct article shape:** open with the two nearly identical temperatures, reveal the humidity contrast only afterward, and build two short climate portraits. Use paired “climate fingerprints” rather than the equal-rainfall laboratory structure used in the first blog batch.

## Rejected candidate

The proposed numerical grid-wind article is not approved for this batch. The current method records ERA5-Land 10 m grid-cell wind as context but gives it zero score weight and excludes it from eligibility and best-month selection because exposed-trail and gust validation remains blocked. A transparent methodology article could be written later, but a destination-led planning article risks making the unvalidated number appear more actionable than the evidence supports.

## Drafting requirements

Each language version must preserve the exact numeric meaning above, use its own editorial rhythm and remain within the existing 700–1,200-word quality gate. Every article needs a visible selected-cell and 1991–2025 historical-period limitation, at least four source-checked claims, contextual destination links, methodology and finder links, and a licensed high-resolution hero image. The four posts remain drafts until their final bilingual copy and source regression checks receive article-level approval.
