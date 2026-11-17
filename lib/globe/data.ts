import { getAllDestinations, getRanking } from "@/lib/data/load";
import type { Locale } from "@/lib/data/types";
import { countryName, destinationName } from "@/lib/i18n/names";
import { scoreLevel } from "@/lib/scoring/index";

/**
 * Compact per-destination data for the hiking globe.
 *
 * Built on the server and passed to the client as a prop, so the globe needs no
 * runtime request (the architecture guard forbids one) and the payload stays
 * small (mistakes.md #15): about 110 bytes a destination.
 *
 * Every colour on the globe comes from here, and only from the published
 * recommendation gate: a month that is not recommendable has a null score and
 * level "-", so a withheld destination is grey in every month and is never
 * coloured by a score it does not have.
 */
export interface GlobeDestination {
  /** slug */ s: string;
  /** localised name */ n: string;
  /** localised country */ c: string;
  la: number;
  lo: number;
  /** Twelve scores, null where the month is not recommendable. */
  m: Array<number | null>;
  /** Twelve level codes: E excellent, V very good, G good, F fair, P poor, - not recommended. */
  l: string;
}

const LEVEL_CODE = {excellent: "E", "very-good": "V", good: "G", fair: "F", poor: "P"} as const;

export function globeDestinations(locale: Locale): GlobeDestination[] {
  return getAllDestinations()
    .map((destination) => {
      const months = Array.from({length: 12}, (_, index) => destination.months[index]);
      const scores = months.map((month) => month?.recommendationEligible && month.overallScore !== null ? month.overallScore : null);
      return {
        s: destination.slug,
        n: destinationName(destination, locale),
        c: countryName(destination, locale),
        la: Math.round(destination.coordinates.lat * 100) / 100,
        lo: Math.round(destination.coordinates.lon * 100) / 100,
        m: scores,
        l: scores.map((score) => score === null ? "-" : LEVEL_CODE[scoreLevel(score)]).join(""),
      };
    })
    .sort((a, b) => a.s.localeCompare(b.s));
}

/** The three leading destinations of each month's published ranking, for the page's static summary. */
export function globeMonthLeaders(locale: Locale): Array<{month: number; count: number; leaders: Array<{slug: string; name: string; score: number}>}> {
  const names = new Map(getAllDestinations().map((destination) => [destination.slug, destinationName(destination, locale)]));
  return Array.from({length: 12}, (_, index) => {
    const entries = getRanking(index + 1).entries;
    return {
      month: index + 1,
      count: entries.length,
      leaders: entries.slice(0, 3).map((entry) => ({slug: entry.slug, name: names.get(entry.slug) ?? entry.name, score: entry.score})),
    };
  });
}
