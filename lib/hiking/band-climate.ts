import type { ClimateMetrics } from "@/lib/data/types";
import type { MonthlyPointClimate } from "@/lib/hiking/climate";
import { nearestRank } from "@/lib/hiking/climate";
import { interpolate, type Curve } from "@/lib/scoring";
import curves from "@/data-config/scoring/curves.json";

export interface WeightedPointClimate {
  sampleWeight: number;
  metrics: MonthlyPointClimate;
}

const numericMetricKeys = [
  "temperatureHikingMeanC",
  "temperatureHikingP10C",
  "temperatureHikingP90C",
  "wetDayProbability",
  "heavyRainDayProbability",
  "precipitationMonthlyMeanMm",
  "snowDayProbability",
  "snowDepthMeanOnSnowDaysM",
  "windHikingMeanKmh",
  "highWindHourProbability",
  "severeWindHourProbability",
  "hotDayProbability",
  "severeHotDayProbability",
  "daylightHoursMean",
  "relativeHumidityHikingMeanPct",
  "dataCompleteness"
] as const;

function assertWeights(points: WeightedPointClimate[]) {
  if (!points.length) throw new Error("CLIMATE_BAND001 no point metrics supplied");
  const total = points.reduce((sum, point) => sum + point.sampleWeight, 0);
  if (!points.every((point) => Number.isFinite(point.sampleWeight) && point.sampleWeight > 0) || Math.abs(total - 1) > 1e-9) {
    throw new Error("CLIMATE_BAND001 point weights must be positive and sum to one");
  }
}

function weightedValue(points: WeightedPointClimate[], key: typeof numericMetricKeys[number]) {
  return points.reduce((sum, point) => {
    const value = point.metrics[key];
    if (value === null || !Number.isFinite(value)) throw new Error(`CLIMATE_BAND002 missing point metric: ${key}`);
    return sum + value * point.sampleWeight;
  }, 0);
}

function utilityScore(metrics: MonthlyPointClimate) {
  if (Number.isFinite(metrics.temperatureUtilityScore)) return metrics.temperatureUtilityScore!;
  if (!metrics.temperatureUtilitySamplesC.length) throw new Error("CLIMATE_BAND002 missing temperature utility distribution");
  return metrics.temperatureUtilitySamplesC.reduce((sum, value) => sum + interpolate(value, curves.temperature as Curve), 0)
    / metrics.temperatureUtilitySamplesC.length;
}

/**
 * A compact deterministic representation for public/debug output. Exact scoring uses
 * temperatureUtilityScore and therefore does not depend on this 101-quantile sample.
 */
function representativeTemperatureDistribution(points: WeightedPointClimate[]) {
  const representatives = points.flatMap((point) => {
    if (!point.metrics.temperatureUtilitySamplesC.length) throw new Error("CLIMATE_BAND002 missing temperature samples");
    return Array.from({ length: 101 }, (_, index) => ({
      value: nearestRank(point.metrics.temperatureUtilitySamplesC, (index + 1) / 101)!,
      weight: point.sampleWeight / 101
    }));
  }).sort((first, second) => first.value - second.value);
  return Array.from({ length: 101 }, (_, index) => {
    const target = (index + 1) / 101;
    let cumulative = 0;
    for (const representative of representatives) {
      cumulative += representative.weight;
      if (cumulative + 1e-12 >= target) return representative.value;
    }
    return representatives.at(-1)!.value;
  });
}

export function aggregateBandPointMetrics(points: WeightedPointClimate[]): ClimateMetrics {
  assertWeights(points);
  const weighted = Object.fromEntries(numericMetricKeys.map((key) => [key, weightedValue(points, key)])) as unknown as ClimateMetrics;
  return {
    ...weighted,
    temperatureUtilitySamplesC: representativeTemperatureDistribution(points),
    temperatureUtilityScore: points.reduce((sum, point) => sum + utilityScore(point.metrics) * point.sampleWeight, 0),
    sampleYearCount: Math.min(...points.map((point) => point.metrics.sampleYearCount))
  };
}
