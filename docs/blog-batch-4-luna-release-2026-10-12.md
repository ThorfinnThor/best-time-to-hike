# Blog batch 4 — LUNA release record (2026-10-12)

The final publication hold is cleared. The two bilingual articles are now approved and publishable:

- `madeira-vs-tenerife-winter-hiking-weather`
- `best-time-to-hike-japan-by-route`

The Japan article uses a local 2,400 × 1,800 WebP conversion of Nekosuki's 4,608 × 3,456 Kumano Kodo photograph. The source is [Kumano Kodo pilgrimage route Nakahechi Akagigoe 78](https://commons.wikimedia.org/wiki/File:Kumano_Kodo_pilgrimage_route_Nakahechi_Akagigoe_From_Hosshinmon-Oji_To_Yunomine-Onsen_World_heritage_%E7%86%8A%E9%87%8E%E5%8F%A4%E9%81%93_%E4%B8%AD%E8%BE%BA%E8%B7%AF_%E8%B5%A4%E6%9C%A8%E8%B6%8A_%E7%99%BA%E5%BF%83%E9%96%80%E7%8E%8B%E5%AD%90%EF%BD%9E%E6%B9%AF%E3%81%AE%E5%B3%B0%E6%B8%A9%E6%B3%8978.JPG), licensed CC BY-SA 4.0 by Nekosuki. The registry records the author, license and source URL.

Both articles remain constrained to the public ERA5-Land representative-cell dataset (`1991–2025`, algorithm `1.3.0`). No route-safety, access, forecast or island-wide claims were added. The articles are bilingual, have distinct block signatures, and now receive `index` plus sitemap entries for English and German.

Checks completed before push:

- image QA: 313 licensed images, 0 hard findings;
- full TypeScript test suite: 227 passed;
- TypeScript typecheck and diff check passed;
- static build succeeded (5,309 pages);
- generated blog routes contain the approved articles and no `noindex` directive;
- sitemap contains 30 blog URLs (14 articles × 2 locales + 2 index pages).
