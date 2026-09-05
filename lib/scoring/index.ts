import curves from "@/data-config/scoring/curves.json";
import weights from "@/data-config/scoring/weights.json";
import confidenceConfig from "@/data-config/methodology/confidence-v1.json";
import levels from "@/data-config/scoring/levels.json";
import climateAggregation from "@/data-config/methodology/climate-aggregation-v1.json";
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
  const required = [metrics.wetDayProbability,metrics.heavyRainDayProbability,metrics.snowDayProbability,metrics.snowDepthMeanOnSnowDaysM,metrics.hotDayProbability,metrics.severeHotDayProbability,metrics.windHikingMeanKmh,metrics.highWindHourProbability,metrics.daylightHoursMean];
  if(!metrics.temperatureUtilitySamplesC.length||!metrics.temperatureUtilitySamplesC.every(Number.isFinite)||!required.every(Number.isFinite))throw new Error("SCORE001 missing or invalid required component metric");
  const probabilities=[metrics.wetDayProbability,metrics.heavyRainDayProbability,metrics.snowDayProbability,metrics.hotDayProbability,metrics.severeHotDayProbability,metrics.highWindHourProbability];
  if(!probabilities.every((value)=>value>=0&&value<=1)||metrics.snowDepthMeanOnSnowDaysM<0||metrics.windHikingMeanKmh<0||metrics.daylightHoursMean<0||metrics.daylightHoursMean>24)throw new Error("SCORE001 required component metric outside physical bounds");
  const temperature = Number.isFinite(metrics.temperatureUtilityScore)
    ? metrics.temperatureUtilityScore!
    : metrics.temperatureUtilitySamplesC.reduce((sum, value) => sum + interpolate(value, curves.temperature as Curve), 0) / metrics.temperatureUtilitySamplesC.length;
  if (temperature < 0 || temperature > 100) throw new Error("SCORE001 temperature utility score outside 0..100");
  const precipitation = 0.75 * interpolate(metrics.wetDayProbability, curves.wetDay as Curve) + 0.25 * interpolate(metrics.heavyRainDayProbability, curves.heavyRain as Curve);
  const snowBase = interpolate(metrics.snowDayProbability, curves.snowDay as Curve);
  const snow = Math.max(0, snowBase - (metrics.snowDepthMeanOnSnowDaysM >= curves.snowDepthPenalty.thresholdM ? curves.snowDepthPenalty.points : 0));
  const heatStress = 0.7 * interpolate(metrics.hotDayProbability, curves.hotDay as Curve) + 0.3 * interpolate(metrics.severeHotDayProbability, curves.severeHotDay as Curve);
  const wind = 0.6 * interpolate(metrics.windHikingMeanKmh, curves.meanWind as Curve) + 0.4 * interpolate(metrics.highWindHourProbability, curves.highWind as Curve);
  const daylight = interpolate(metrics.daylightHoursMean, curves.daylight as Curve);
  return { temperature, precipitation, snow, heatStress, wind, daylight };
}

export function overallScore(components: ComponentScores): number {
  const values=Object.keys(weights.overall).map((key)=>components[key as keyof ComponentScores]);
  if(values.length!==6||!values.every(Number.isFinite))throw new Error("SCORE001 missing or invalid required component");
  const weightTotal=Object.values(weights.overall).reduce((sum,value)=>sum+value,0);
  if(Math.abs(weightTotal-1)>1e-9)throw new Error("SCORE002 weights do not sum to one");
  return Object.entries(weights.overall).reduce((sum, [key, weight]) => sum + components[key as keyof ComponentScores] * weight, 0);
}

export function confidenceScore(metrics: BandClimateMonth): number {
  const required=[metrics.dataCompleteness,metrics.meanElevationMismatchM,metrics.samplePointCount,metrics.samplePointMaxSeparationKm,metrics.polygonEquivalentDiameterKm,metrics.interannualScoreSd,metrics.validInterannualYearCount,metrics.terrainReliefM,metrics.highWindHourProbability];
  if(!required.every(Number.isFinite))throw new Error("DATA001 missing or invalid confidence metric");
  if(metrics.dataCompleteness<0||metrics.dataCompleteness>1||metrics.meanElevationMismatchM<0||!Number.isInteger(metrics.samplePointCount)||metrics.samplePointCount<1||metrics.samplePointMaxSeparationKm<0||metrics.polygonEquivalentDiameterKm<0||metrics.interannualScoreSd<0||!Number.isInteger(metrics.validInterannualYearCount)||metrics.validInterannualYearCount<0||metrics.terrainReliefM<0||metrics.highWindHourProbability<0||metrics.highWindHourProbability>1)throw new Error("DATA001 confidence metric outside valid bounds");
  const completeness = interpolate(metrics.dataCompleteness, confidenceConfig.curves.completeness as Curve);
  const elevation = interpolate(metrics.meanElevationMismatchM, confidenceConfig.curves.elevationMismatchM as Curve);
  const spatialConfig=confidenceConfig.spatial;
  let spatial = metrics.samplePointCount >= 3 ? spatialConfig.threeOrMorePoints : metrics.samplePointCount === 2 ? spatialConfig.twoPoints : spatialConfig.onePoint;
  if(metrics.samplePointCount>=2&&metrics.samplePointMaxSeparationKm<spatialConfig.clusteredMaxSeparationKm&&metrics.polygonEquivalentDiameterKm>spatialConfig.largeAreaMinimumDiameterKm)spatial=Math.max(0,spatial-spatialConfig.clusteredPenalty);
  let interannual = interpolate(metrics.interannualScoreSd, confidenceConfig.curves.interannualScoreSd as Curve);
  if(metrics.validInterannualYearCount<confidenceConfig.interannual.minimumValidYears)interannual=Math.min(interannual,confidenceConfig.interannual.lowYearCountComponentCap);
  let terrainWind = interpolate(metrics.terrainReliefM, confidenceConfig.curves.terrainReliefM as Curve);
  if (metrics.highWindHourProbability > confidenceConfig.terrainWind.highWindProbabilityThreshold && metrics.terrainReliefM > confidenceConfig.terrainWind.highReliefThresholdM) terrainWind = Math.max(0, terrainWind - confidenceConfig.terrainWind.penalty);
  const c = confidenceConfig.weights;
  // ERA5-Land 10 m wind is currently a coarse grid-cell value, not a
  // validated exposed-trail/gust model. It must not increase destination
  // representativeness confidence before the wind gate is approved.
  const includeTerrainWind = confidenceConfig.terrainWind.confidenceContribution !== "excluded-unvalidated-grid-wind";
  const activeWeight = c.completeness + c.elevation + c.spatial + c.interannual + (includeTerrainWind ? c.terrainWind : 0);
  const weighted = c.completeness * completeness + c.elevation * elevation + c.spatial * spatial + c.interannual * interannual + (includeTerrainWind ? c.terrainWind * terrainWind : 0);
  return weighted / activeWeight;
}

export function confidenceLevel(score: number): ConfidenceLevel {
  return score >= confidenceConfig.levels.highMinimum ? "high" : score >= confidenceConfig.levels.moderateMinimum ? "moderate" : "low";
}

/**
 * The only definition of the score ladder. `confidenceLevel` above is the only
 * definition of the confidence ladder. Both read their boundaries from config
 * so a methodology edit moves every label in the product at once; a second
 * hardcoded copy is the defect recorded as mistakes.md #13.
 */
export function scoreLevel(score: number): ScoreLevel {
  const band = levels.score;
  return score >= band.excellentMinimum ? "excellent"
    : score >= band.veryGoodMinimum ? "very-good"
    : score >= band.goodMinimum ? "good"
    : score >= band.fairMinimum ? "fair"
    : "poor";
}

export function adjustTemperature(rawC: number, era5LandGridElevationM: number, targetElevationM: number) {
  const rawCorrection = ((targetElevationM - era5LandGridElevationM) / 1000) * climateAggregation.temperatureLapseRateCPer1000M;
  const cap = climateAggregation.maxAutomaticTemperatureCorrectionC;
  const correctionC = Math.max(-cap, Math.min(cap, rawCorrection));
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
