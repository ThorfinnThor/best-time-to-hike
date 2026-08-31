import curves from "@/data-config/scoring/curves.json";
import weights from "@/data-config/scoring/weights.json";
import confidenceConfig from "@/data-config/methodology/confidence-v1.json";
import type { BandClimateMonth, ComponentScores, ConfidenceLevel, ScoreLevel } from "@/lib/data/types";

export type Curve = Array<[number, number]>;

export function interpolate(x: number, curve: Curve): number {
  const points = [...curve].sort((a, b) => a[0] - b[0]);
  if (x <= points[0][0]) return points[0][1];
  if (x >= points.at(-1)![0]) return points.at(-1)![1];
  for (let i = 1; i < points.length; i += 1) {
    const [x2, y2] = points[i];
    const [x1, y1] = points[i - 1];
    if (x <= x2) return y1 + ((x - x1) / (x2 - x1)) * (y2 - y1);
  }
  throw new Error("Curve interpolation failed");
}

export function roundHalfAwayFromZero(value: number): number {
  return Math.sign(value) * Math.round(Math.abs(value));
}

export function scoreComponents(metrics: BandClimateMonth): ComponentScores {
  const temperature = metrics.temperatureUtilitySamplesC.reduce((sum, value) => sum + interpolate(value, curves.temperature as Curve), 0) / metrics.temperatureUtilitySamplesC.length;
  const precipitation = 0.75 * interpolate(metrics.wetDayProbability, curves.wetDay as Curve) + 0.25 * interpolate(metrics.heavyRainDayProbability, curves.heavyRain as Curve);
  const snowBase = interpolate(metrics.snowDayProbability, curves.snowDay as Curve);
  const snow = Math.max(0, snowBase - (metrics.snowDepthMeanOnSnowDaysM >= curves.snowDepthPenalty.thresholdM ? curves.snowDepthPenalty.points : 0));
  const heatStress = 0.7 * interpolate(metrics.hotDayProbability, curves.hotDay as Curve) + 0.3 * interpolate(metrics.severeHotDayProbability, curves.severeHotDay as Curve);
  const wind = 0.6 * interpolate(metrics.windHikingMeanKmh, curves.meanWind as Curve) + 0.4 * interpolate(metrics.highWindHourProbability, curves.highWind as Curve);
  const daylight = interpolate(metrics.daylightHoursMean, curves.daylight as Curve);
  return { temperature, precipitation, snow, heatStress, wind, daylight };
}

export function overallScore(components: ComponentScores): number {
  return Object.entries(weights.overall).reduce((sum, [key, weight]) => sum + components[key as keyof ComponentScores] * weight, 0);
}

export function confidenceScore(metrics: BandClimateMonth): number {
  const completeness = interpolate(metrics.dataCompleteness, [[0.7,0],[0.8,35],[0.9,65],[0.95,85],[0.98,95],[0.995,100]]);
  const elevation = interpolate(metrics.meanElevationMismatchM, [[150,100],[300,90],[600,65],[800,35],[801,0]]);
  const spatial = metrics.samplePointCount >= 3 ? 100 : metrics.samplePointCount === 2 ? 80 : 55;
  const interannual = interpolate(metrics.interannualScoreSd, [[5,100],[10,85],[15,65],[20,40],[30,10]]);
  let terrainWind = interpolate(metrics.terrainReliefM, [[200,100],[500,90],[1000,75],[1500,60],[2000,45]]);
  if (metrics.highWindHourProbability > 0.2 && metrics.terrainReliefM > 1000) terrainWind = Math.max(0, terrainWind - 10);
  const c = confidenceConfig.weights;
  return c.completeness * completeness + c.elevation * elevation + c.spatial * spatial + c.interannual * interannual + c.terrainWind * terrainWind;
}

export function confidenceLevel(score: number): ConfidenceLevel {
  return score >= 85 ? "high" : score >= 65 ? "moderate" : "low";
}

export function scoreLevel(score: number): ScoreLevel {
  return score >= 90 ? "excellent" : score >= 80 ? "very-good" : score >= 65 ? "good" : score >= 50 ? "fair" : "poor";
}

export function adjustTemperature(rawC: number, gridElevationM: number, targetElevationM: number) {
  const rawCorrection = ((targetElevationM - gridElevationM) / 1000) * -6.5;
  const correctionC = Math.max(-5, Math.min(5, rawCorrection));
  return { valueC: rawC + correctionC, correctionC, capped: correctionC !== rawCorrection };
}

export function windKmh(uMs: number, vMs: number): number {
  return Math.sqrt(uMs ** 2 + vMs ** 2) * 3.6;
}

export function relativeHumidity(temperatureC: number, dewpointC: number): number {
  const a = 17.625;
  const b = 243.04;
  const gamma = (value: number) => (a * value) / (b + value);
  return Math.max(0, Math.min(100, 100 * Math.exp(gamma(dewpointC) - gamma(temperatureC))));
}
