import type { BandClimateMonth, ComponentScores, ConfidenceLevel, DatasetStatus, DestinationConfig, PublicBandMonth, PublicMonth, ScoreLevel } from "../../lib/data/types";
import { confidenceScore, overallScore, roundHalfAwayFromZero, scoreComponents } from "../../lib/scoring";
import { guardConfidence, hasPersistentSnowHold, recommendationDecision, scoreLevelFor } from "../../lib/scoring/recommendations";
import recommendationConfig from "../../data-config/methodology/recommendation-eligibility-v1.json";
import { readJson, round, writeJson } from "../lib/io";

type Normalized = { destination: DestinationConfig; dem: any; sampling: any; climate: { datasetStatus?:DatasetStatus; fixture?:boolean; representativenessApproved?:boolean; source?:string; sourceDataset?:string; sourceDoi?:string; retrievedAt?:string; bands: Record<string, {months: BandClimateMonth[]}> } };
type InternalBandMonth = Omit<PublicBandMonth, "components" | "overallScore" | "scoreLevel" | "confidenceScore" | "confidenceLevel"> & {components: ComponentScores; overallScore:number; scoreLevel:ScoreLevel; confidenceScore:number; confidenceLevel:ConfidenceLevel};
type ScoredMonth = Omit<PublicMonth, "components" | "overallScore" | "scoreLevel" | "confidenceScore" | "confidenceLevel" | "bands"> & {components: ComponentScores; overallScore:number; scoreLevel:ScoreLevel; confidenceScore:number; confidenceLevel:ConfidenceLevel; bands:InternalBandMonth[]; rawComponents: ComponentScores; rawOverallScore: number};
type RepresentativeCell = {lat:number;lon:number;modelElevationM:number;overrideLabel?:string;overrideReason?:string};
const representativeOverrides = readJson<{overrides:Record<string,{label:string;reason:string}>}>("data-config/sources/representative-cell-overrides.json").overrides;
const normalized = readJson<Normalized[]>("generated/intermediate/normalized.json");

function weightedComponents(bands: InternalBandMonth[], destination: DestinationConfig): ComponentScores {
  const result = {temperature:0,precipitation:0,snow:0,heatStress:0,wind:0,daylight:0};
  for (const band of bands) {
    const weight = destination.elevationBands.find((item) => item.id === band.bandId)!.weight;
    for (const key of Object.keys(result) as Array<keyof ComponentScores>) result[key] += band.components[key] * weight;
  }
  return result;
}

function roundedComponents(components: ComponentScores): ComponentScores {
  return Object.fromEntries(Object.entries(components).map(([key,value])=>[key,roundHalfAwayFromZero(value)])) as unknown as ComponentScores;
}

function reasonCodes(month: Pick<ScoredMonth, "components">) {
  const reasons: string[] = [];
  if (month.components.temperature >= 85) reasons.push("comfortable-temperatures");
  if (month.components.precipitation >= 82) reasons.push("lower-rain-risk");
  if (month.components.snow >= 90) reasons.push("mostly-snow-free");
  if (month.components.daylight >= 90) reasons.push("long-daylight");
  if (reasons.length < 2) reasons.push("seasonal-tradeoffs");
  return reasons.slice(0, 3);
}

const scored = normalized.map(({destination, dem, sampling, climate}) => {
  const datasetStatus = climate.datasetStatus ?? (climate.fixture ? "fixture" : "provisional") as DatasetStatus;
  const representativenessApproved = sampling.representativenessApproved === true || climate.representativenessApproved === true;
  const rawMonths: ScoredMonth[] = Array.from({length:12}, (_, monthIndex) => {
    const bands: InternalBandMonth[] = destination.elevationBands.map((config) => {
      const metrics = climate.bands[config.id].months[monthIndex];
      const components = scoreComponents(metrics);
      const score = overallScore(components);
      const confidence = guardConfidence(confidenceScore(metrics), datasetStatus, metrics.samplePointCount, representativenessApproved);
      return {...metrics, components, overallScore: roundHalfAwayFromZero(score), scoreLevel: scoreLevelFor(score), confidenceScore: roundHalfAwayFromZero(confidence.score), confidenceLevel: confidence.level};
    });
    const internalComponents = weightedComponents(bands, destination);
    const score = overallScore(internalComponents);
    const confidence = destination.elevationBands.reduce((sum, config) => sum + bands.find((band) => band.bandId === config.id)!.confidenceScore * config.weight, 0);
    const metrics = destination.elevationBands.reduce((acc, config) => {
      const band = bands.find((item) => item.bandId === config.id)!;
      const keys = ["temperatureHikingMeanC","temperatureHikingP10C","temperatureHikingP90C","wetDayProbability","heavyRainDayProbability","precipitationMonthlyMeanMm","snowDayProbability","snowDepthMeanOnSnowDaysM","windHikingMeanKmh","highWindHourProbability","severeWindHourProbability","hotDayProbability","severeHotDayProbability","daylightHoursMean","relativeHumidityHikingMeanPct","dataCompleteness"] as const;
      keys.forEach((key) => { (acc as any)[key] = ((acc as any)[key] ?? 0) + (band as any)[key] * config.weight; });
      return acc;
    }, {} as any);
    const utilitySampleCount=Math.min(...bands.map((band)=>band.temperatureUtilitySamplesC.length));
    metrics.temperatureUtilitySamplesC=Array.from({length:utilitySampleCount},(_,index)=>destination.elevationBands.reduce((sum,config)=>sum+bands.find((band)=>band.bandId===config.id)!.temperatureUtilitySamplesC[index]*config.weight,0));
    metrics.sampleYearCount=Math.min(...bands.map((band)=>band.sampleYearCount));
    Object.keys(metrics).forEach((key) => { if (typeof metrics[key] === "number") metrics[key] = round(metrics[key], key.includes("Probability") || key === "dataCompleteness" ? 4 : 1); });
    metrics.temperatureUtilitySamplesC=metrics.temperatureUtilitySamplesC.map((value:number)=>round(value,1));
    const publicBands=bands.map((band)=>({...band,components:roundedComponents(band.components)}));
    const confidenceGuard = guardConfidence(confidence, datasetStatus, Math.min(...bands.map((band) => band.samplePointCount)), representativenessApproved);
    const output: ScoredMonth = {month: monthIndex+1, recommendationEligible: true, overallScore: roundHalfAwayFromZero(score), scoreLevel: scoreLevelFor(score), confidenceScore: roundHalfAwayFromZero(confidenceGuard.score), confidenceLevel: confidenceGuard.level, components:roundedComponents(internalComponents), metrics, bands:publicBands, reasons: [], caveats: ["historical-climatology-not-a-forecast", ...(datasetStatus === "fixture" ? [] : ["unvalidated-grid-wind" as const])], rawComponents: internalComponents, rawOverallScore: score};
    output.reasons = reasonCodes(output);
    return output;
  });
  const destinationHold = hasPersistentSnowHold(rawMonths);
  const months = rawMonths.map((month) => {
    const decision = recommendationDecision(month.rawComponents, month.rawOverallScore, destinationHold);
    const caveats = destinationHold
      ? [...month.caveats, "persistent-snow-review"]
      : decision.failingComponents.length
        ? [...month.caveats, "critical-component-floor"]
        : month.caveats;
    const {rawComponents: _rawComponents, rawOverallScore: _rawOverallScore, ...publicMonth} = month;
    if (destinationHold) {
      return {
        ...publicMonth,
        recommendationEligible: false,
        overallScore: null,
        scoreLevel: null,
        confidenceScore: null,
        confidenceLevel: null,
        components: null,
        bands: publicMonth.bands.map((band) => ({...band, overallScore: null, scoreLevel: null, confidenceScore: null, confidenceLevel: null, components: null})),
        caveats,
      } satisfies PublicMonth;
    }
    const guardedBands = !decision.recommendationEligible
      ? publicMonth.bands.map((band) => ({...band, overallScore: Math.min(recommendationConfig.ineligibleScoreMaximum, band.overallScore), scoreLevel: "poor" as const, confidenceScore: band.confidenceScore, confidenceLevel: band.confidenceLevel, components: band.components}))
      : publicMonth.bands;
    return {...publicMonth, recommendationEligible: decision.recommendationEligible, overallScore: roundHalfAwayFromZero(decision.overallScore), scoreLevel: decision.scoreLevel, bands: guardedBands, caveats};
  });
  const firstBand = destination.elevationBands[0];
  const firstPoint = sampling.bands[firstBand.id].points[0];
  const override = representativeOverrides[destination.id];
  const representativeCell: RepresentativeCell = {
    lat: firstPoint.lat,
    lon: firstPoint.lon,
    modelElevationM: firstPoint.representativeModelElevationM ?? firstPoint.gridElevationM ?? firstPoint.targetElevationM,
    ...(override ? {overrideLabel: override.label, overrideReason: override.reason} : {})
  };
  return {
    destination, dem, months,
    representativeCell,
    recommendationEligible: !destinationHold && months.some((month) => month.recommendationEligible),
    ...(destinationHold ? {recommendationHoldReason: "persistent-snow" as const} : {}),
    datasetStatus,
    climateSource:climate.source ?? "era5-land-compatible-synthetic-fixture",
    climateSourceDataset:climate.sourceDataset,
    climateSourceDoi:climate.sourceDoi,
    retrievedAt:climate.retrievedAt ?? dem.retrievedAt ?? "2026-08-31T00:00:00.000Z"
  };
});
writeJson("generated/intermediate/scored.json", scored);
console.log(`Scored ${scored.length * 12} destination-months.`);
