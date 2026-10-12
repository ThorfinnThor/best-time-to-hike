# Blog batch 4: final SOL scientific and editorial review

Date: 2026-10-12  
Decision: content approved; publication held for the Japan lead image  
Evidence base: public 315-destination ERA5-Land representative-cell dataset, 1991–2025  
Algorithm: 1.3.0

## Overall finding

Both bilingual drafts pass the final scientific and editorial review. Their quantitative claims reproduce the public destination records, their interpretations remain within the representative-cell scope, and their titles answer recognisable search questions. The articles use different narrative structures and do not reduce their conclusions to a score or a universal “best month”.

The content is ready for release. Production approval remains held only because the Japan article does not yet have a licensed lead image meeting the 2,400 px editorial width target. The existing 1,200 × 800 Kumano Kodo asset must not be upscaled and must not be used as the final full-width hero.

## Madeira versus Tenerife review

### Claims verified

- The December to February mean-temperature differences are 2.4, 2.5 and 2.0 °C in Madeira's favour at the selected cells.
- Madeira's wet-day probability is higher by 15.30, 14.65 and 13.58 percentage points.
- Madeira's mean monthly precipitation is higher by 39.5, 27.2 and 21.8 mm.
- Tenerife's score lead is 5, 3 and 2 points, and the draft correctly refuses to treat those differences as a universal winner.
- The text shows the selected cell elevations of 628.3 m and 1,867.0 m rather than presenting either record as island-wide weather.
- The daylight and relative-humidity comparisons reproduce the public records and are not turned into route-surface, visibility or personal-comfort claims.

### Interpretation verified

The article's conclusion is appropriately conditional: Madeira is the warmer historical profile, while Tenerife is the drier historical profile at the selected cells. Both remain recommendation-eligible in all three winter months. The copy distinguishes wet-day frequency from accumulated precipitation and directs the reader to current route, access and forecast information.

No unsupported safety, forecast, guaranteed-weather or whole-island claim remains.

## Japan route-context review

### Claims verified

- Kumano Kodo and Yakushima have twelve recommendation-eligible climate months in their public records.
- Daisetsuzan, Kamikochi and Tateyama each have a June-to-October eligible window.
- January temperatures, wet-day probabilities, snow-day probabilities, scores and snow-component values reproduce the five source files.
- The June and July wet-day examples correctly show that an eligible climate month need not be dry.
- The October and November examples reproduce the transition from an eligible Daisetsuzan October to withheld Kamikochi and Tateyama November records.
- The critical gate is described correctly: temperature, snow, heat stress and daylight must each be strictly greater than 20. Precipitation remains scored but is not a critical gate, and grid-cell wind has weight zero.

### Interpretation verified

The draft does not claim that Japan has one national hiking season. It explicitly limits the comparison to five selected route contexts and treats model-cell elevation as context rather than a universal causal rule. “Eligible” is not rewritten as open, safe or dry, and “withheld” is not rewritten as closed or impossible.

Mount Fuji is deliberately excluded so the project's historical climate gate cannot be mistaken for access guidance. The conclusion correctly hands the final decision to current official route, transport, forecast and safety information.

## Editorial, SEO and structural review

- English and German titles are clear, search-oriented and no longer than 60 characters.
- All four descriptions are between 80 and 155 characters.
- English and German drafts contain 785 / 725 and 907 / 818 words respectively.
- The two articles have different ordered block signatures and neither duplicates a published article structure.
- Every quantitative block references a registered evidence key.
- Contextual links resolve to static localized routes.
- German copy contains no typographic em dash.
- Both draft pages render with `noindex` and remain absent from the sitemap and public blog index.

## Verification evidence

- Batch-four evidence tests: 4 passed.
- Full test suite: 227 passed, 0 failed.
- TypeScript check: passed.
- Production static build: passed; 5,309 static pages generated.
- Exported English draft pages contain `noindex`.

## Release handoff

LUNA may complete the release after all of the following are true:

1. Add a genuinely high-resolution, commercially usable Japan lead image with an original width of at least 2,400 px.
2. Record source URL, author, licence identifier, licence URL, attribution and original dimensions in the image registry and batch evidence manifest.
3. Set the Japan article's `heroImageSlug` to that reviewed asset.
4. Re-run image checks, batch-four tests, the complete test suite, TypeScript and the production build.
5. Change both article records from `draft` to `approved`, set the publication date, confirm both locales enter the blog index and sitemap, then commit and push to `main` for deployment.

No additional scientific copy change is required unless the image, destination scope or underlying public dataset changes.
