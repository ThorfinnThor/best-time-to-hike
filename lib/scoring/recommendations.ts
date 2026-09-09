import representativenessConfig from "@/data-config/methodology/era5-land-representativeness-v1.json";
import recommendationConfig from "@/data-config/methodology/recommendation-eligibility-v1.json";
import { confidenceLevel, scoreLevel } from "@/lib/scoring/index";
import type { ComponentScores, ConfidenceLevel, DatasetStatus, PublicMonth, ScoreLevel } from "@/lib/data/types";

export const COMPONENT_KEYS = ["temperature", "precipitation", "snow", "heatStress", "wind", "daylight"] as const;
export type ComponentKey = (typeof COMPONENT_KEYS)[number];
export type CriticalComponentKey = ComponentKey;
export const BEST_MONTH_COMPONENT_KEYS: readonly ComponentKey[] = COMPONENT_KEYS
  .filter((key) => (recommendationConfig.bestMonthComponents as string[]).includes(key));

/**
 * The components that can veto a month, read from config rather than fixed here.
 *
 * Precipitation was one of them through 1.1.0, and it did nearly all the
 * vetoing: 15 of the 22 destinations carrying no recommendation were refused
 * on rain alone, in every month of the year, several of them with temperature,
 * snow, heat, wind and daylight all scoring in the nineties. The distinction
 * that matters is not how pleasant a component makes the walk but whether it
 * makes the walk a bad idea, and rain does not belong on that side of it.
 * Precipitation keeps its full 20 percent of the score, so a wet destination
 * ranks low on its own merits instead of vanishing from the catalogue.
 */
export const CRITICAL_COMPONENT_FLOOR = recommendationConfig.criticalComponentMinimumExclusive;

export const CRITICAL_COMPONENT_KEYS: readonly CriticalComponentKey[] =
  COMPONENT_KEYS.filter((key) => (recommendationConfig.criticalComponents as string[]).includes(key));

export interface RecommendationDecision {
  recommendationEligible: boolean;
  overallScore: number;
  scoreLevel: ScoreLevel;
  failingComponents: CriticalComponentKey[];
  /**
   * Components at or below the same floor that no longer veto the month.
   *
   * Demoting precipitation stopped it hiding destinations, and put a different
   * problem in its place: at 20 percent of the score, a precipitation component
   * of 1 still leaves a ceiling near 80, so a place where it rains almost every
   * day can be published as good or very good hiking. The score is arithmetically
   * right and reads as an overclaim, so the month carries the reason with it.
   */
  belowFloorComponents: ComponentKey[];
}

/**
 * The published label for a score, held down by a component at the floor.
 *
 * Demoting precipitation let a month with rain at 1 out of 100 reach 82 and
 * carry the "very good" label, because 20 percent weight cannot cost more than
 * 20 points. The arithmetic is right and the word is not: nothing should be
 * called very good hiking while one of the six things we measure is at the
 * bottom of its scale. The number stands, the label stops at "good", and the
 * month page names the component. Only the label moves, so the score, the
 * ranking order and every comparison are untouched.
 */
export function cappedScoreLevel(score: number, belowFloorComponents: readonly ComponentKey[]): ScoreLevel {
  const level = scoreLevel(score);
  if (!belowFloorComponents.length) return level;
  return level === "excellent" || level === "very-good" ? "good" : level;
}

export function recommendationDecision(
  components: ComponentScores,
  overallScore: number,
  destinationHold = false,
): RecommendationDecision {
  const failingComponents = CRITICAL_COMPONENT_KEYS.filter((key) => {
    const value = components[key];
    return !Number.isFinite(value) || value <= recommendationConfig.criticalComponentMinimumExclusive;
  });
  const recommendationEligible = !destinationHold && failingComponents.length === 0;
  const guardedScore = recommendationEligible
    ? Math.max(0, Math.min(100, overallScore))
    : Math.min(recommendationConfig.ineligibleScoreMaximum, Math.max(0, overallScore));
  const belowFloorComponents = COMPONENT_KEYS.filter((key) => {
    if (CRITICAL_COMPONENT_KEYS.includes(key)) return false;
    const value = components[key];
    return !Number.isFinite(value) || value <= recommendationConfig.criticalComponentMinimumExclusive;
  });
  return {
    recommendationEligible,
    overallScore: guardedScore,
    scoreLevel: cappedScoreLevel(guardedScore, belowFloorComponents),
    failingComponents,
    belowFloorComponents,
  };
}

/**
 * The critical components that keep every scored month of a destination out.
 *
 * The methodology page listed the withheld destinations but said only that no
 * month clears every critical component, which is true of all of them and so
 * tells the reader nothing. Naming the component that actually does the
 * withholding is the same honesty the destination pages already keep: for most
 * of these it is rain, in every month of the year, and a reader deciding
 * whether to trust the catalogue deserves to know that.
 *
 * Only components failing in *every* scored month are returned, since those
 * are the ones a different month could not fix.
 */
export function blockingComponents(months: Array<{components: ComponentScores | null}>): CriticalComponentKey[] {
  const scored = months.filter((month): month is {components: ComponentScores} => month.components !== null);
  if (!scored.length) return [];
  return CRITICAL_COMPONENT_KEYS.filter((key) => scored.every((month) => {
    const value = month.components[key];
    return !Number.isFinite(value) || value <= recommendationConfig.criticalComponentMinimumExclusive;
  }));
}

/**
 * The months a destination is published as best for.
 *
 * One definition, called by the exporter that writes the list and by the
 * validator that checks it; they held separate copies of this and drifted the
 * moment the rule changed.
 *
 * A month with a component at the very bottom of its scale is not a candidate,
 * whatever it adds up to. Demoting precipitation in 1.2.0 stopped rain hiding a
 * destination and left it able to win instead: Annapurna in July scores 0 out
 * of 100 on rain, rains on every day of the month, and was the highest-scoring
 * month of the year — the middle of the monsoon. Such a month keeps its page,
 * its score and its place in the rankings; it just cannot be the answer to
 * "when should I go".
 *
 * The threshold is its own number, not the recommendation floor of 20, because
 * the two ask different questions. Reusing 20 also took July and August off the
 * Dolomites, whose rain component is 14 because of afternoon storms nobody
 * stays home for, and left Torres del Paine with no season at all.
 */
export function bestMonthsFor(months: Array<{month: number; recommendationEligible: boolean; overallScore: number | null; components: ComponentScores | null}>): number[] {
  return months
    .filter((month) => month.recommendationEligible && month.overallScore !== null && month.components !== null
      && !BEST_MONTH_COMPONENT_KEYS.some((key) => month.components![key] <= recommendationConfig.bestMonthComponentMinimumExclusive))
    .sort((a, b) => b.overallScore! - a.overallScore! || a.month - b.month)
    .slice(0, 3)
    .map((month) => month.month)
    .sort((a, b) => a - b);
}

export function hasPersistentSnowHold(months: Array<Pick<PublicMonth, "metrics">>): boolean {
  const reviewMonthCount = representativenessConfig.glacier.persistentSnowReviewMonthCount;
  return months.filter((month) => month.metrics.snowDayProbability === 1).length === reviewMonthCount;
}

export function isUnapprovedProvisionalSinglePoint(
  datasetStatus: DatasetStatus,
  samplePointCount: number,
  representativenessApproved: boolean | undefined,
): boolean {
  return datasetStatus === recommendationConfig.provisionalSinglePointConfidenceCap.datasetStatus
    && samplePointCount === recommendationConfig.provisionalSinglePointConfidenceCap.samplePointCount
    && representativenessApproved !== true;
}

export function guardConfidence(
  confidence: number,
  datasetStatus: DatasetStatus,
  samplePointCount: number,
  representativenessApproved: boolean | undefined,
): { score: number; level: ConfidenceLevel } {
  if (isUnapprovedProvisionalSinglePoint(datasetStatus, samplePointCount, representativenessApproved)) {
    const maximum = recommendationConfig.provisionalSinglePointConfidenceCap.maximumScore;
    return { score: Math.min(maximum, Math.max(0, confidence)), level: "low" };
  }
  return { score: Math.max(0, Math.min(100, confidence)), level: confidenceLevel(confidence) };
}
