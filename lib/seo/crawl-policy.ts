import type { MetadataRoute } from "next";
import type { DatasetStatus } from "@/lib/data/types";

export const ANSWER_ENGINES = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-Web", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot"] as const;

/** One decision shared by metadata, sitemap and the release gate. */
export function datasetMayBeIndexed(status: DatasetStatus): boolean {
  return status === "production";
}

export function robotsForDataset(status: DatasetStatus, sitemapUrl: string): MetadataRoute.Robots {
  if (!datasetMayBeIndexed(status)) return {rules: {userAgent: "*", disallow: "/"}};
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
