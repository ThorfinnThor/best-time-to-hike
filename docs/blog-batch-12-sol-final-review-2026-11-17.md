# Blog batch 12: final scientific and editorial review

Date: 2026-11-17

Reviewer: Codex scientific and editorial review (Sol step)

Decision: approved for publication in English and German.

## Evidence and limits

The evidence manifest is `data-config/blog/batch-12-evidence.json`. All eight compared destinations use the public 1991–2025 ERA5-Land selected-cell records, algorithm 1.3.0. Each month contains 35 sample years and complete inputs. The review checks the articles against these published records and the project's aggregation and recommendation rules. It is not independent validation of ERA5-Land or a production approval of the whole provisional catalogue.

The local checkout was updated to current main, `52cf4da`, before release preparation. The four localized article URLs increase the qualified sitemap from 394 to 398 URLs. The existing destination allowlist is unchanged.

## Norway findings

- The common eligible calendar is exactly July–September. July and August belong to every compared destination's three best months; this supports the shared summer shortlist without declaring every route accessible.
- June eligibility differs: Lofotodden and Rondane pass, Jotunheimen and Hardangervidda fail the critical snow component. Their June snow-day probabilities are 0%, 29.62%, 84.57% and 74.86%, respectively.
- All quoted model elevations, temperature means and percentiles, precipitation totals, wet-day frequencies and daylight values reproduce the public files.
- The September comparison correctly separates less frequent inland wet days from the wetter Lofotodden sample and the increased inland snow signal.
- The 24-hour June daylight value is astronomical duration. The text explicitly retains the 08:00–18:00 sampling window and does not imply 24 hours of measured or safe hiking conditions.

## Patagonia findings

- January–March is exactly the common eligible calendar for Bariloche, Cerro Castillo, Torres del Paine and Tierra del Fuego.
- December passes at three cells and fails the snow component at Torres del Paine. The 90.23% modelled snow-day signal is correctly distinguished from a park closure or a trail-level snow percentage.
- The Torres cell override is explicitly explained, including its coordinates, 549.6-metre model elevation and replacement of the western ice-field centroid.
- February's lower snow-day probabilities at the two Chilean points, and the January/February temperature contrasts, reproduce the public data.
- March's Tierra del Fuego record correctly combines fewer wet days with a higher monthly precipitation total than February: 101.4 versus 97.0 mm.
- El Chaltén retains its persistent-snow review hold. The article assigns it no scores or best months and does not equate a data hold with the absence of hiking opportunities.

## Editorial, images and indexing

The two articles answer distinct planning questions and have different ordered block structures. Substantive word counts excluding destination-link blocks are Norway 796 English / 738 German, Patagonia 869 English / 808 German. Titles describe the destination and timing question; descriptions fit the site's metadata limits. Both languages link to the destination records, methodology and Finder.

Wet days refer to complete local days with at least 1 mm of precipitation. Snow days use the configured 10% cover or 0.02 m physical-depth thresholds. Temperature percentiles are sampled daytime values, not overnight extremes. Rain is a scored comfort factor, not an independent veto. Grid wind is not used to recommend a month or infer route exposure. Neither article presents the 35-year project average as a forecast or a standard 30-year normal.

The licensed lead images retain source, author and attribution records. Lofotodden is 2400 × 1600 pixels; Patagonia is 2400 × 1351 pixels, resized without enlargement from the licensed 4000 × 2252 original. Blog cards use the existing 960-pixel derivatives while article heroes retain full resolution. The Torres card derivative is regenerated from the upgraded source.

Both records are approved with publication date 2026-11-17. They enter the blog archive first, receive indexable metadata and join the sitemap in both languages. Release verification must pass before merging to main, followed by checks of the production URLs, sitemap membership and canonical metadata.

## Local release verification

`pnpm verify` passes: 305 tests, 22 rendered-page checks, static build, typecheck, architecture/determinism/CSS/cell guards and deployment budget. Image QA has zero hard findings. All four generated pages carry `index, follow`, the intended production canonical and the publication date, and all four appear in the 398-URL sitemap. The archive leads with the new articles in both languages; mobile preview has no page-level horizontal overflow.

The broader dataset audit reports zero scientific errors with claim restrictions. Its existing Hunza temperature-jump warning and five uncompleted production approvals remain outside this article release; none is silently approved by this review.
