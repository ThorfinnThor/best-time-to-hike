import { getAllDestinations, getManifest } from "@/lib/data/load";
import { absoluteUrl } from "@/lib/site";
import { links } from "@/lib/i18n/links";
import { profileFor } from "@/lib/seo/profile";

export const dynamic = "force-static";

/**
 * A factual index for language models. It states what the dataset is, what it
 * deliberately withholds and why, because a summary that omits the withholds
 * would misrepresent the product more than one that omits the destinations.
 */
export function GET() {
  const manifest = getManifest();
  const destinations = getAllDestinations();
  const withheld = destinations.filter((destination) => !destination.recommendationEligible);
  const lines: string[] = [
    "# BestTimeToHike",
    "",
    "> Historical hiking-season suitability for mountain and trail destinations, derived from the",
    "> ERA5-Land 1991-2020 climate normal. Not a forecast and not trail or safety information.",
    "",
    "## Dataset",
    `- Status: ${manifest.datasetStatus} (algorithm ${manifest.algorithmVersion})`,
    `- Source: ERA5-Land hourly time series, ${manifest.climateNormal.startYear}-${manifest.climateNormal.endYear}, DOI 10.24381/ee82e357`,
    `- Destinations: ${destinations.length}; each represented by one selected 0.1 degree model grid cell`,
    `- Recommendation-eligible destination-months: ${destinations.reduce((sum, d) => sum + d.months.filter((m) => m.recommendationEligible).length, 0)} of ${destinations.length * 12}`,
    "",
    "## What this data does not support",
    "- It is a climate normal, not a forecast for any date.",
    "- Each destination is one model grid cell, not a whole region and not any specific trail.",
    "- Wind is coarse 10 metre grid wind. It is not exposed-trail or gust information.",
    `- ${withheld.length} destinations carry no recommendation at all; see below.`,
    "",
    "## Destinations with no recommendation",
    ...withheld.map((destination) => {
      const reason = destination.recommendationHoldReason === "persistent-snow"
        ? "snow in all twelve months at the selected cell"
        : `no month clears every critical component (${profileFor(destination).limitingFactor ?? "mixed"})`;
      return `- ${destination.name} (${destination.countryName}): ${reason}`;
    }),
    "",
    "## Recommendable destinations",
    ...destinations.filter((destination) => destination.recommendationEligible).map((destination) => {
      const profile = profileFor(destination);
      return `- ${destination.name} (${destination.countryName}), ${profile.eligibleMonths.length}/12 months: ${absoluteUrl(links.destination("en", destination.slug))}`;
    }),
    "",
  ];
  return new Response(lines.join("\n"), {headers: {"content-type": "text/plain; charset=utf-8"}});
}
