import type { BandClimateMonth, ComponentScores, DestinationConfig, PublicBandMonth, PublicMonth } from "../../lib/data/types";
import { confidenceLevel, confidenceScore, overallScore, roundHalfAwayFromZero, scoreComponents, scoreLevel } from "../../lib/scoring";
import { readJson, round, writeJson } from "../lib/io";

type Normalized = { destination: DestinationConfig; dem: any; sampling: any; climate: { bands: Record<string, {months: BandClimateMonth[]}> } };
const normalized = readJson<Normalized[]>("generated/intermediate/normalized.json");

function weightedComponents(bands: PublicBandMonth[], destination: DestinationConfig): ComponentScores {
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

function reasonCodes(month: PublicMonth) {
  const reasons: string[] = [];
  if (month.components.temperature >= 85) reasons.push("comfortable-temperatures");
  if (month.components.precipitation >= 82) reasons.push("lower-rain-risk");
  if (month.components.snow >= 90) reasons.push("mostly-snow-free");
  if (month.components.daylight >= 90) reasons.push("long-daylight");
  if (reasons.length < 2) reasons.push("seasonal-tradeoffs");
  return reasons.slice(0, 3);
}

const scored = normalized.map(({destination, dem, climate}) => {
  const months: PublicMonth[] = Array.from({length:12}, (_, monthIndex) => {
    const bands: PublicBandMonth[] = destination.elevationBands.map((config) => {
      const metrics = climate.bands[config.id].months[monthIndex];
      const components = scoreComponents(metrics);
      const score = overallScore(components);
      const confidence = confidenceScore(metrics);
      return {...metrics, components, overallScore: roundHalfAwayFromZero(score), confidenceScore: roundHalfAwayFromZero(confidence), confidenceLevel: confidenceLevel(confidence)};
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
    const output: PublicMonth = {month: monthIndex+1, overallScore: roundHalfAwayFromZero(score), scoreLevel: scoreLevel(score), confidenceScore: roundHalfAwayFromZero(confidence), confidenceLevel: confidenceLevel(confidence), components:roundedComponents(internalComponents), metrics, bands:publicBands, reasons: [], caveats: ["historical-climatology-not-a-forecast"]};
    output.reasons = reasonCodes(output);
    return output;
  });
  return {destination, dem, months};
});
writeJson("generated/intermediate/scored.json", scored);
console.log(`Scored ${scored.length * 12} destination-months.`);
