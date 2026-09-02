import type { SearchDestination } from "@/lib/data/types";

export interface FinderPreferences {
  month: number;
  region: string;
  minTemp: number;
  maxTemp: number;
  avoidRain: boolean;
  avoidSnow: boolean;
}

export function matchDestinations(destinations: SearchDestination[], preferences: FinderPreferences) {
  return destinations
    .filter((destination) => destination.recommendationEligible && (preferences.region === "all" || destination.continent === preferences.region || destination.region === preferences.region))
    .map((destination) => {
      const month = destination.monthly.find((item) => item.m === preferences.month && item.recommendationEligible);
      if (!month) return null;
      const temperaturePenalty = month.temp < preferences.minTemp ? (preferences.minTemp - month.temp) * 3 : month.temp > preferences.maxTemp ? (month.temp - preferences.maxTemp) * 3 : 0;
      const rainPenalty = preferences.avoidRain ? month.wet * 32 : month.wet * 8;
      const snowPenalty = preferences.avoidSnow ? month.snow * 45 : month.snow * 6;
      const match = Math.max(0, Math.min(100, month.score - temperaturePenalty - rainPenalty - snowPenalty + 12));
      return { destination, month, match: Math.round(match) };
    }).filter((result): result is NonNullable<typeof result> => result !== null)
    .sort((a, b) => b.match - a.match || b.month.score - a.month.score || a.destination.slug.localeCompare(b.destination.slug));
}
