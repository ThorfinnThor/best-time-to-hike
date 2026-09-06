import representativenessConfig from "@/data-config/methodology/era5-land-representativeness-v1.json";
import recommendationConfig from "@/data-config/methodology/recommendation-eligibility-v1.json";
import { confidenceLevel, scoreLevel } from "@/lib/scoring/index";
import type { ComponentScores, ConfidenceLevel, DatasetStatus, PublicMonth, ScoreLevel } from "@/lib/data/types";

export const CRITICAL_COMPONENT_KEYS = ["temperature", "precipitation", "snow", "heatStress", "wind", "daylight"] as const;
export type CriticalComponentKey = (typeof CRITICAL_COMPONENT_KEYS)[number];

export interface RecommendationDecision {
  recommendationEligible: boolean;
  overallScore: number;
  scoreLevel: ScoreLevel;
  failingComponents: CriticalComponentKey[];
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
  return {
    recommendationEligible,
    overallScore: guardedScore,
    scoreLevel: scoreLevel(guardedScore),
    failingComponents,
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

