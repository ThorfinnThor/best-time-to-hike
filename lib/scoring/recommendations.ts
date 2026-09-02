import representativenessConfig from "@/data-config/methodology/era5-land-representativeness-v1.json";
import recommendationConfig from "@/data-config/methodology/recommendation-eligibility-v1.json";
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
    scoreLevel: scoreLevelFor(guardedScore),
    failingComponents,
  };
}

export function scoreLevelFor(score: number): ScoreLevel {
  return score >= 90 ? "excellent" : score >= 80 ? "very-good" : score >= 65 ? "good" : score >= 50 ? "fair" : "poor";
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
  return { score: Math.max(0, Math.min(100, confidence)), level: confidenceLevelFor(confidence) };
}

export function confidenceLevelFor(score: number): ConfidenceLevel {
  return score >= 85 ? "high" : score >= 65 ? "moderate" : "low";
}
