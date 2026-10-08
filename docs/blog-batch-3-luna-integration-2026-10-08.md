# Blog batch 3: LUNA integration check

Date: 2026-10-08  
Status: technically integrated as drafts; not published

## Build evidence

- The production Next build completed with 5,305 static pages.
- TypeScript passed.
- Blog and evidence tests passed: 10/10.
- Rendered-page checks passed: 16/16.
- Image QA passed: 313 usable images across 315 destinations, 0 hard findings.
- The normal `pnpm build` wrapper is locally blocked by the sandbox's `tsx` IPC `listen EPERM`; the equivalent build was completed with `node --import tsx` followed by `next build` and the static-language postbuild step.

## Indexing safety

Both new article routes render successfully in English and German:

- `/en/blog/two-90s-two-different-hiking-worlds/`
- `/de/blog/two-90s-two-different-hiking-worlds/`
- `/en/blog/cappadocia-between-snow-and-heat/`
- `/de/blog/cappadocia-between-snow-and-heat/`

Each route has `robots: noindex, follow`. None of the four draft URLs appears in the generated sitemap. They remain `status: draft`, have no publication date, and are excluded from the blog index.

## Image review

- The Cappadocia candidate is licensed and visually usable at 1200×800, but it is not a high-density source for a very wide retina hero. Replace or re-fetch a larger licensed source before publication if the displayed crop is soft.
- The original snow-covered Lofotodden candidate was rejected during SOL review. It has been replaced by a sharp 2400×1600 photograph made inside Lofotodden National Park on 22 July 2025. The CC BY 4.0 source, author and attribution are stored in the destination image manifest and the batch evidence file.
- No image was silently substituted or generated. The pending editorial image decision documented during the LUNA integration pass is resolved by the later SOL final review.

## Next handoff

The next step is SOL final review: confirm the articles' arguments, numeric wording, German editorial independence, and image decision. Only after that review may the status change from `draft` to `approved`, dates be assigned, and the two localized URLs enter the sitemap.
