# Blog batch 4: editorial and scientific plan

Date: 2026-10-11  
Stage: SOL topic and evidence selection complete; drafting and publication not yet approved  
Public evidence base: 315-destination dataset, ERA5-Land representative cells, 1991–2025  
Scoring version: 1.3.0

## Editorial and scientific rules

- Both articles answer a recognisable search question in the title. Neither title depends on an unexplained score, metaphor, or internal project term.
- Every quantitative claim must resolve to the current public JSON and receive a mechanical regression check before drafting.
- The score is a project-configured ranking shorthand, not a climate measurement, forecast, safety rating, or universal definition of a good hiking month.
- Each destination is represented by one selected ERA5-Land model cell. The values do not describe every route, elevation, ridge, or local microclimate.
- Recommendation eligibility is a climate-model result. It is not evidence that a trail is open, safe, snow-free, or accessible.
- Grid-cell wind has weight zero and must not be presented as validated trail wind or gust information.
- Current forecasts, trail access, closures, permits, hazards, and official seasons remain outside this historical dataset and require current local sources.
- English and German versions need independently edited prose, not sentence-by-sentence translation.
- The two articles must use different narrative structures and must not copy a heading sequence, introduction, conclusion, or block signature from the existing twelve posts.
- Lead images must be licensed, correctly attributed, relevant to the named destination, and genuinely high resolution. Target at least 2,400 px width; do not upscale a small source.

## Article 1 — a winter choice between warmth and dryness

### Search identity

- English title: **Madeira vs Tenerife: winter hiking weather compared**
- German title: **Madeira oder Teneriffa: Wanderwetter im Winter**
- Slug: `madeira-vs-tenerife-winter-hiking-weather`
- Primary search intent: compare Madeira and Tenerife for winter hiking using temperature and rain, not generic island tourism advice.
- Scope: December, January, and February at the two selected representative model cells.
- Format: a preference-led comparison. The article must not declare a universal winner.

### Public evidence

Madeira uses the selected cell at 32.700001, -17.000000 and 628.3 m model elevation. Tenerife uses the selected cell at 28.299999, -16.600006 and 1,867.0 m model elevation. Every cited month has 35 sample years and 100% data completeness.

| Month | Destination | Eligible | Score | Mean °C | P10–P90 °C | Wet days | Monthly precipitation | Daylight | Relative humidity |
| --- | --- | --- | ---: | ---: | --- | ---: | ---: | ---: | ---: |
| December | Madeira | yes | 83 | 14.4 | 11.8–17.0 | 43.50% | 90.5 mm | 10.0 h | 74.0% |
| December | Tenerife | yes | 88 | 12.0 | 8.2–15.9 | 28.20% | 51.0 mm | 10.4 h | 68.7% |
| January | Madeira | yes | 86 | 13.5 | 10.7–16.2 | 35.48% | 59.9 mm | 10.3 h | 72.6% |
| January | Tenerife | yes | 89 | 11.0 | 6.6–15.2 | 20.83% | 32.7 mm | 10.6 h | 66.4% |
| February | Madeira | yes | 88 | 13.1 | 10.3–16.1 | 35.35% | 58.4 mm | 11.0 h | 72.1% |
| February | Tenerife | yes | 90 | 11.1 | 6.4–15.4 | 21.77% | 36.6 mm | 11.2 h | 65.1% |

Mechanically derived contrasts:

- Madeira's representative cell is 2.4 °C warmer in December, 2.5 °C warmer in January, and 2.0 °C warmer in February.
- Madeira's wet-day probability is higher by 15.30, 14.65, and 13.58 percentage points respectively.
- Madeira's mean monthly precipitation is higher by 39.5, 27.2, and 21.8 mm respectively.
- Tenerife's score advantage narrows from 5 points in December to 3 in January and 2 in February. These small differences do not establish a universal winner.
- Tenerife's selected cell is much higher than Madeira's. The article must show both elevations beside the figures and must not generalise these values to either whole island.

### Scientific interpretation

Both destinations remain recommendation-eligible throughout the three-month comparison, but the model cells express different trade-offs. Madeira is milder; Tenerife is cooler and historically drier. The useful decision is therefore based on the reader's preference between extra warmth and lower rain exposure, not on the headline score alone.

The article may say that the selected Tenerife cell is drier in these historical monthly summaries. It may not claim that Tenerife always has better hiking weather, that Madeira is rainy everywhere, or that either island will be dry on a particular trip.

### Distinct story shape

`decisionIntro > winterComparisonTable > warmthSection > rainSection > preferenceChooser > representativeCellCaveat > practicalChecklist > destinationLinks`

The opening should immediately frame a two-variable decision. A short “choose Madeira if / choose Tenerife if” section may summarise the measured trade-off without turning it into a generic listicle.

### Required internal links

- Madeira destination page
- Tenerife destination page
- relevant December, January, and February destination-month pages
- finder or winter month-ranking page
- methodology page, anchored to representative-cell interpretation

## Article 2 — Japan has no single hiking season

### Search identity

- English title: **Best time to hike Japan: why the route changes the season**
- German title: **Beste Wanderzeit in Japan: Die Route bestimmt die Saison**
- Slug: `best-time-to-hike-japan-by-route`
- Primary search intent: understand why the best hiking period in Japan depends on the selected route and elevation context.
- Scope: Kumano Kodo and Yakushima as lower/maritime representative cells; Daisetsuzan, Kamikochi, and Tateyama as higher mountain representative cells.
- Format: a route-family calendar with a seasonal transition narrative, not a destination-versus-destination winner.

### Eligibility calendar

| Destination | Selected cell elevation | Eligible climate months | Strongest scored month(s) |
| --- | ---: | --- | --- |
| Kumano Kodo | 412.5 m | January–December | April and November, 86 |
| Yakushima | 520.2 m | January–December | April, 84 |
| Daisetsuzan | 1,361.9 m | June–October | July and September, 81 |
| Kamikochi | 1,858.9 m | June–October | September, 81 |
| Tateyama | 1,832.3 m | June–October | September, 78 |

Every cited month has 35 sample years and 100% data completeness. “Eligible climate month” is the project's historical climate gate, not an operating calendar.

### Gate and transition evidence

| Destination and month | Eligible | Score | Mean °C | Wet days | Snow days | Gate-relevant observation |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Kumano Kodo, January | yes | 74 | 5.9 | 23.50% | 12.53% | lower selected cell remains above every critical component threshold |
| Yakushima, January | yes | 75 | 9.8 | 53.73% | 0% | mild but historically wet; eligibility does not mean dry |
| Daisetsuzan, January | no | 22 | -13.3 | 69.77% | 100% | temperature and snow components reach zero |
| Kamikochi, January | no | 24 | -7.5 | 67.56% | 100% | snow component reaches zero |
| Tateyama, January | no | 21 | -7.5 | 76.77% | 100% | snow component reaches zero |
| Daisetsuzan, June | yes | 74 | 13.1 | 56.76% | 19.52% | first eligible month in this model-cell series |
| Kamikochi, June | yes | 79 | 15.4 | 62.86% | 1.52% | eligible but not dry |
| Tateyama, July | yes | 77 | 19.2 | 81.75% | 0% | very high wet-day probability despite eligibility |
| Daisetsuzan, October | yes | 53 | 5.4 | 55.39% | 44.88% | remains barely eligible; snow component is 27 |
| Kamikochi, November | no | 46 | 3.5 | 49.05% | 57.71% | snow component falls to 14 |
| Tateyama, November | no | 41 | 3.2 | 58.48% | 63.81% | snow component falls to 10 |

### Scientific interpretation

The article's central finding is not that Japan has one best month. In these selected model cells, Kumano Kodo and Yakushima remain above the project's critical climate thresholds all year, while the three higher mountain cells form a June–October window. Winter cold and snow explain the mountain contrast. The October-to-November change shows the gate closing again as snow probability rises and the snow component falls below the strict greater-than-20 rule.

The summer section must also challenge a common shortcut: climate eligibility does not mean dry weather. Wet-day probability ranges from 56.76% for Daisetsuzan in June to 81.75% for Tateyama in July among the cited examples.

Do not include Mount Fuji in this article. Its official climbing season, access rules, and safety context could be confused with the historical climate gate. Do not claim that any route is open or walkable in an eligible month. The close must direct readers to current official access, forecast, and safety information.

### Distinct story shape

`routeFamilyMapIntro > eligibilityCalendar > winterContrast > summerRainReality > octoberNovemberTransition > routeChoiceQuestions > accessDisclaimer > destinationLinks`

This article starts with a five-route calendar and follows elevation-related seasonal transitions. It must not use the paired “choose A / choose B” structure of article 1.

### Required internal links

- Kumano Kodo, Yakushima, Daisetsuzan, Kamikochi, and Tateyama destination pages
- selected January, June, July, October, and November month pages used as evidence
- Japan-relevant finder or ranking routes where available
- methodology page, anchored to the recommendation gate

## Originality review against the current blog

- Article 1 answers a direct Madeira-versus-Tenerife winter query and uses a three-month preference comparison. None of the twelve existing posts covers this destination pair or this warmth-versus-rain decision.
- Article 2 answers a country-level timing query through five route contexts. It is neither another two-destination comparison nor another single-destination annual profile.
- Article 1's conclusion is a preference chooser; article 2's conclusion is a route-and-access checklist. They must not share the same ending or callout sequence.
- Neither article may reuse the earlier “same score, different climate,” “warmest versus driest,” or “snow versus heat” argument as its main device.

## Source files

- `public/data/hiking/destinations/pt/madeira.json`
- `public/data/hiking/destinations/es/tenerife.json`
- `public/data/hiking/destinations/jp/kumano-kodo.json`
- `public/data/hiking/destinations/jp/yakushima.json`
- `public/data/hiking/destinations/jp/daisetsuzan.json`
- `public/data/hiking/destinations/jp/kamikochi.json`
- `public/data/hiking/destinations/jp/tateyama.json`
- `data-config/scoring/weights.json`
- `data-config/methodology/recommendation-eligibility-v1.json`
- `data-config/methodology/climate-aggregation-v1.json`

## LUNA handoff

The next step is mechanical evidence preparation only:

1. Create a machine-readable evidence manifest for both articles from the public JSON, including every cited value, derived contrast, selected-cell coordinate and elevation, sample-year count, completeness value, algorithm version, and period.
2. Add regression tests for the planned claims, strict recommendation gate, 1991–2025 period, algorithm 1.3.0, and weight-zero wind rule.
3. Prove every article claim is represented in the manifest and reject any draft sentence that exceeds the evidence scope.
4. Check title length, slug uniqueness, search intent, article block signatures, and topic overlap against all twelve published posts.
5. Record licensed lead-image candidates with creator, original source URL, licence, attribution, and original pixel dimensions. Reject upscaled, soft, or unrelated images.
6. Prepare bilingual draft/noindex article records only after all checks pass. Do not add the articles to the sitemap, publish them, or mark the final SOL review complete in this step.
