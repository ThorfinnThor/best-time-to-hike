import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { getManifest } from "@/lib/data/load";

export const dynamic = "force-static";

/**
 * Crawler policy.
 *
 * Answer engines are named explicitly rather than left to the wildcard. This
 * site's value is a factual, sourced answer to a narrow question, and /llms.txt
 * states plainly what the data does and does not support, including the twenty
 * destinations it refuses to recommend. Being quoted accurately is the point.
 *
 * The finder is excluded everywhere: it is an interactive tool whose output
 * depends on query parameters, not a document.
 */
const ANSWER_ENGINES = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-Web", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot"];

export default function robots(): MetadataRoute.Robots {
  // The manifest is the source of truth for whether this build may be crawled,
  // not an environment variable that can disagree with the published data.
  const published = getManifest().datasetStatus === "production";
  if (!published) return {rules: {userAgent: "*", disallow: "/"}};
  const disallow = ["/go/", "/en/finder", "/de/finder"];
  return {
    rules: [
      {userAgent: "*", allow: "/", disallow},
      ...ANSWER_ENGINES.map((userAgent) => ({userAgent, allow: "/", disallow})),
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
