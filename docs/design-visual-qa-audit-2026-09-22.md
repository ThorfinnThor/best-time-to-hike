# Design and visual QA audit — 2026-09-22

## Scope

- Public static URLs discovered in the production export: **6,482**
- Viewports: **1440 × 1000**, **1280 × 800**, **768 × 1024**, **390 × 844**
- Automated page/viewport checks: **25,928**
- Additional narrow-screen review: **360 px**
- Languages: English and German

Every exported URL was measured. The review records document width and horizontal overflow, hero height, H1 size and approximate line count, heading wrapping rules, long-form text width, body-copy size, large vertical gaps, wide-table containment, and elements extending beyond the viewport.

## Initial findings

The first scan produced 14,738 raw page/viewport warnings. Triage separated four diagnostic patterns:

1. **624 actionable small-copy warnings across 156 URLs.** These came from three shared components: area-guide explanations, the finder legend, and local planning-source notes. The smallest source note was 12 px.
2. **1,500 false overflow warnings.** The flagged planning tables were intentionally wider than the phone/tablet viewport and already lived inside accessible horizontal scroll containers. The document itself never overflowed.
3. **12,946 false wide-column warnings.** The old detector measured the CSS box of short captions rather than their actual readable line length. Long explanatory copy was nevertheless capped as a defensive improvement.
4. **6 false narrow-column warnings.** These came from short paragraphs in deliberate card grids on the home pages, not from the H1 or long-form copy.

No route showed document-level horizontal overflow, a clipped H1, automatic H1 hyphenation, an uncontained wide table, an excessively tall hero, too many H1 lines, or an unexplained large vertical gap.

## Corrections

- Raised area-guide notes and the finder legend to 14.4 px with a controlled line height.
- Raised local planning-source notes from 12 px to 14 px.
- Limited planning and method-note paragraphs to 75 characters per line.
- Added a repeatable `pnpm audit:visual-layout` audit runner that discovers routes from the current static export instead of relying on a hand-maintained sample.
- Taught the audit runner to distinguish intentionally scrollable tables from page overflow and to evaluate long-form copy separately from short captions and card labels.
- Excluded the visually reviewed four-card trust grid from the narrow-prose heuristic; its 238 px text measure is deliberate compact-card copy, not a long-form reading column.
- Disabled image loading inside the measurement frames so future full-site audits measure layout without downloading thousands of decorative images.

The fix is shared CSS. No individual URL needed a one-off override.

## Visual spot checks

Real browser screenshots and geometry were reviewed on desktop and mobile for the independent page families and the longest-content edge cases, including:

- German and English home pages, including the longest German home H1
- finder and comparison tools
- ranking landing pages, monthly rankings and long regional rankings
- warm-hiking, snow-free and low-rain landing/month pages
- methodology, about, image credits, privacy and imprint pages
- normal destination overviews and month pages
- a scientific-review hold page (Zermatt)
- long German titles such as Golden Gate Highlands National Park and Neuseeländisches Vulkanplateau
- the mobile planning table and its horizontal-scroll affordance

The 360 px privacy-page check confirmed that the long German word “Datenschutzerklärung” remains intact and inside the viewport.

## Final validation

- Full visual scan: **25,928 checks completed** in 724,033 ms
- Final raw diagnostics: **6**, all manually cleared as the intentional four-card trust grid on the three home routes at the two desktop sizes
- Final actionable layout problems: **0**
- Horizontal-overflow, clipped-element, uncontained-table, small-copy, overwide-copy, hero-height, H1-line and large-gap warnings: **0**
- Production build: **passed**, 6,489 generated routes
- TypeScript: **passed**
- CSS architecture guard: **passed**, 599 rules and 172 classes
- Main tests: **255 passed**
- Rendered-page, heading, link and hreflang tests: **16 passed**
- Static-data validation: **passed**, 375 destinations and 430 public data files
- Scientific audit: **passed with claim restrictions**, zero scientific production blockers

The release report still contains the pre-existing non-design production blockers (legal/operator approval, the formal accessibility/performance sign-off, and the custom domain). They are outside this visual-layout change.
