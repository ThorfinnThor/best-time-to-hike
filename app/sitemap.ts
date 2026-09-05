import type { MetadataRoute } from "next";
import { routeCatalog } from "@/lib/seo/route-catalog";
import { locales } from "@/lib/i18n/config";
import { resolvePageId, pathFor } from "@/lib/i18n/resolve";
import { pageSeo } from "@/lib/seo/page-seo";
import { absoluteUrl } from "@/lib/site";
import { getManifest } from "@/lib/data/load";
export const dynamic = "force-static";

/**
 * The sitemap lists what we ask Google to index, which is deliberately far less
 * than what the site renders. A sitemap containing 3,180 structurally identical
 * month pages invites exactly the thin-content judgement the indexability gate
 * exists to avoid.
 */
export default function sitemap():MetadataRoute.Sitemap {
  // Nothing is offered for indexing until the dataset is production. Stated
  // here rather than left to fall out of the per-page decision, so the policy
  // is visible to a reader and to the architecture guard.
  if (getManifest().datasetStatus !== "production") return [];
  const entries: MetadataRoute.Sitemap = [];
  for (const route of routeCatalog()) {
    const page = resolvePageId(route.locale, route.segments);
    if (!page) continue;
    if (!pageSeo(page, route.locale).index) continue;
    entries.push({
      url: absoluteUrl(pathFor(page, route.locale)),
      lastModified: new Date("2026-09-05"),
      changeFrequency: "monthly" as const,
      priority: page.kind === "home" ? 1 : page.kind === "destination" ? 0.8 : 0.6,
      alternates: {languages: Object.fromEntries(locales.map((l) => [l, absoluteUrl(pathFor(page, l))]))},
    });
  }
  return entries;
}
