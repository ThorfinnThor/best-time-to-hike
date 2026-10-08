# Blog batch 3: editorial and scientific plan

Date: 2026-10-08  
Stage: SOL topic and evidence selection complete; drafting and publication not yet approved  
Public evidence base: 315-destination dataset, ERA5-Land representative cells, 1991–2025  
Scoring version: 1.3.0

## Editorial constraints

- The two articles must not share a fixed narrative template with one another or with the ten existing posts.
- Every quantitative statement must resolve to the current public JSON and be checked mechanically before drafting.
- The score is a project-configured ranking shorthand, not a climate measurement, forecast, safety rating, or universal definition of a good hiking month.
- The data describes one selected ERA5-Land model cell per destination. It does not describe every route, elevation, ridge, or local microclimate.
- Grid-cell wind has weight zero and must not be presented as validated trail wind or gust information.
- Recommendation ineligibility means that the project's gate withheld a recommendation. It must never be rewritten as a trail closure or a claim that hiking is impossible.
- Both locales require independent editorial copy rather than sentence-by-sentence translation.
- Each article needs a verified, licensed, high-resolution lead image and descriptive alternative text.

## Article 1 — equal scores, different climates

### Working identity

- English title: **Two 90s, two different hiking worlds**
- German title: **Zweimal 90, zwei verschiedene Wanderwelten**
- Slug: `two-90s-two-different-hiking-worlds`
- Editorial question: What does an identical overall score hide when the underlying physical conditions are very different?
- Format: a tightly argued two-month comparison, not a destination roundup or a generic “best time” list.

### Primary comparison

| Public field | Larapinta Trail, August | Lofotodden National Park, July |
| --- | ---: | ---: |
| Overall score | 90 | 90 |
| Recommendation eligible | yes | yes |
| Hiking-window mean temperature | 19.2 °C | 11.7 °C |
| Temperature P10–P90 | 11.3–27.0 °C | 9.3–14.7 °C |
| Wet-day probability | 2.40% | 35.39% |
| Mean monthly precipitation | 3.6 mm | 53.1 mm |
| Hot-day probability | 14.10% | 0% |
| Mean daylight | 11.3 h | 22.7 h |
| Mean relative humidity | 28.0% | 81.7% |
| Sample years / completeness | 35 / 100% | 35 / 100% |
| Selected model-cell elevation | 605.6 m | 94.2 m |

Useful contrasts to verify in the evidence manifest:

- 7.5 °C difference in the mean hiking-window temperature.
- 32.99 percentage points difference in wet-day probability.
- 49.5 mm difference in mean monthly precipitation.
- 11.4 hours difference in mean daylight.
- 53.7 percentage points difference in mean relative humidity.

### Scientific interpretation

The equal score is real under algorithm 1.3.0, but it does not imply climatic equivalence. Larapinta's month is warmer, much drier, less humid, and far shorter in daylight. Lofotodden's month is cooler, wetter, more humid, and nearly continuously light. The article should teach readers to open the score and compare the raw variables that matter to their own plans.

The article must also explain that temperature, precipitation, snow, heat stress, and daylight contribute with configured weights. Wind is informational only and has weight zero. It must not imply that the two months are interchangeable or equally suitable for every person.

### Distinct proposed story shape

`pullQuote > comparisonTable > paragraph > heading > metricCallout > paragraph > monthStrip > heading > paragraph > caveat > paragraph > destinationLinks`

This is deliberately different from all current post signatures. It opens with the apparent contradiction, resolves it through a side-by-side physical comparison, and closes with a practical score-reading checklist.

### Required internal links

- Larapinta Trail destination page
- Lofotodden National Park destination page
- the relevant month-ranking or finder route
- methodology page, anchored to score interpretation

## Article 2 — one place, two seasonal gates

### Working identity

- English title: **Cappadocia between snow and heat**
- German title: **Kappadokien zwischen Schnee und Hitze**
- Slug: `cappadocia-between-snow-and-heat`
- Editorial question: How can one destination move from a winter snow gate to a midsummer heat gate, with two different eligible shoulders between them?
- Format: a single-destination seasonal case study, not a score comparison and not a twelve-month catalogue.

### Primary evidence

Selected representative cell: 38.599998, 34.900002 at 1,351.1 m. All cited monthly values use 35 sample years with 100% completeness.

| Month | Eligible | Score | Mean °C | P10–P90 °C | Wet days | Snow days | Hot days | Severe-hot days | Gate-relevant component |
| --- | --- | ---: | ---: | --- | ---: | ---: | ---: | ---: | --- |
| February | no | 49 | 2.1 | -6.8–9.8 | 30.64% | 66.43% | 0% | 0% | snow 8 |
| March | yes | 67 | 6.9 | -0.5–14.3 | 37.33% | 33.73% | 0% | 0% | snow 42 |
| May | yes | 88 | 17.1 | 10.7–23.7 | 38.16% | 0.09% | 1.84% | 0% | heat stress 99 |
| June | yes | 87 | 21.6 | 15.5–27.7 | 23.90% | 0% | 19.52% | 1.14% | heat stress 74 |
| July | no | 49 | 25.1 | 18.3–31.3 | 3.50% | 0% | 58.99% | 16.96% | heat stress 18 |
| August | no | 49 | 25.2 | 18.0–31.4 | 3.78% | 0% | 63.78% | 18.06% | heat stress 15 |
| September | yes | 89 | 20.8 | 12.8–27.6 | 8.95% | 0% | 18.19% | 1.71% | heat stress 75 |
| October | yes | 91 | 14.9 | 7.1–22.1 | 16.50% | 0.65% | 0.09% | 0% | snow 99 / heat stress 100 |
| November | yes | 78 | 8.3 | 0.7–15.3 | 20.38% | 16.10% | 0% | 0% | snow 73 |
| December | no | 49 | 2.9 | -4.0–9.5 | 29.40% | 50.32% | 0% | 0% | snow 20 |

The gate requires every critical component to be strictly greater than 20. Therefore December's snow component of exactly 20 is ineligible. Precipitation remains a scored comfort factor and does not independently trigger this gate.

### Scientific interpretation

The narrative should follow the mechanism, not simply list months. In winter the model withholds recommendations because the snow component falls to or below the critical threshold. March crosses back above the threshold. In July and August the heat-stress component falls below it even though those months are very dry. September and October then form a second eligible arc.

“Snow day” is a historical model-cell threshold, not proof of snow on a particular trail. The heat rule is a project-defined suitability gate, not medical advice. Current weather, access, closures, and route safety remain outside the dataset.

### Distinct proposed story shape

`timeline > paragraph > comparisonTable > heading > paragraph > metricCallout > heading > monthStrip > paragraph > pullQuote > caveat > destinationLinks`

This article begins with a seasonal timeline and explains two different failure mechanisms around the eligible shoulders. It intentionally avoids the paired-comparison structure of article 1 and the structures of the existing ten posts.

### Required internal links

- Cappadocia destination page
- selected Cappadocia month pages for winter, summer, and shoulder-season evidence
- the relevant finder or ranking route
- methodology page, anchored to the recommendation gate

## Originality review against the current blog

- Article 1 is not another “warmest, driest, or strongest month” choice. Its subject is the interpretation limit of an equal overall score across two physically different climates.
- Article 1 is not another same-temperature comparison. The controlled value is the overall score; temperature, rain, humidity, and daylight are deliberately allowed to diverge.
- Article 2 is not another “dry does not mean hikeable” desert roundup. It explains two separate gate mechanisms across one destination's annual cycle.
- Article 2 is not another mild-air/snow comparison across destinations. It uses one high-elevation model cell and shows how snow and heat create two different withheld periods.
- Neither article should reuse an existing introduction, heading sequence, block signature, conclusion, or sentence frame.

## Source files

- `public/data/hiking/destinations/au/larapinta.json`
- `public/data/hiking/destinations/no/lofotodden.json`
- `public/data/hiking/destinations/tr/cappadocia.json`
- `data-config/scoring/weights.json`
- `data-config/methodology/recommendation-eligibility-v1.json`
- `data-config/methodology/climate-aggregation-v1.json`

## LUNA handoff

The next step is mechanical evidence preparation only:

1. Create machine-readable evidence manifests for both articles from the public JSON.
2. Add regression checks for every planned quantitative claim, the 1991–2025 period, algorithm 1.3.0, eligibility state, and weight-zero wind rule.
3. Confirm both proposed block signatures remain unique against all published posts.
4. Identify licensed, genuinely high-resolution lead-image candidates and record creator, source URL, licence, and required attribution.
5. Prepare draft/noindex article records only after those checks pass. Do not publish, add to the sitemap, or mark the SOL science review complete in this step.

