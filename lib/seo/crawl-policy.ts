import type { MetadataRoute } from "next";
import type { DatasetStatus } from "@/lib/data/types";
import seoConfig from "../../data-config/seo/project-seo-config.json";

export const ANSWER_ENGINES = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-User", "Claude-SearchBot",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended", "CCBot",
] as const;

/** Scientific production status. This remains separate from editorial indexing approval. */
export function datasetMayBeIndexed(status: DatasetStatus): boolean {
  return status === "production";
}

/**
 * Public search release. Fixture data is never publishable. A provisional
 * dataset may expose only pages that independently pass the page-level quality
 * gate when an explicit, version-controlled editorial approval exists.
 */
export function siteMayBeIndexed(status: DatasetStatus): boolean {
  if (status === "fixture") return false;
  return datasetMayBeIndexed(status) || seoConfig.publicIndexing.enabled === true;
}

export function robotsForDataset(status: DatasetStatus, sitemapUrl: string): MetadataRoute.Robots {
  if (!siteMayBeIndexed(status)) return {rules: {userAgent: "*", disallow: "/"}};
  const disallow = ["/go/", "/en/finder", "/de/finder"];
  return {
    rules: [
      {userAgent: "*", allow: "/", disallow},
      ...ANSWER_ENGINES.map((userAgent) => ({userAgent, allow: "/", disallow})),
    ],
    sitemap: sitemapUrl,
  };
}

export function robotsDisallowEverything(policy: MetadataRoute.Robots): boolean {
  const rules = Array.isArray(policy.rules) ? policy.rules : [policy.rules];
  return rules.some((rule) => rule.userAgent === "*" && rule.disallow === "/");
}
