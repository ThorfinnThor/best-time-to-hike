import type { BandClimateMonth, DestinationConfig } from "../../lib/data/types";
import { readJson, round, sha256, writeJson } from "../lib/io";

const distanceKm=(a:{lat:number;lon:number},b:{lat:number;lon:number})=>{const radius=6371;const dLat=(b.lat-a.lat)*Math.PI/180;const dLon=(b.lon-a.lon)*Math.PI/180;const value=Math.sin(dLat/2)**2+Math.cos(a.lat*Math.PI/180)*Math.cos(b.lat*Math.PI/180)*Math.sin(dLon/2)**2;return 2*radius*Math.asin(Math.sqrt(value));};
const maximumSeparation=(points:Array<{lat:number;lon:number}>)=>Math.max(0,...points.flatMap((point,index)=>points.slice(index+1).map((other)=>distanceKm(point,other))));

type Profile = { temp: number[]; wet: number[]; snow: number[]; wind: number[]; daylight: number[]; rainMm: number[] };
const profiles: Record<string, Profile> = {
  madeira: { temp:[14,14,15,16,18,20,22,23,22,20,17,15], wet:[.36,.34,.29,.24,.18,.12,.08,.10,.16,.27,.34,.38], snow:[.04,.03,.02,.01,0,0,0,0,0,.01,.02,.04], wind:[19,18,17,16,15,14,13,13,14,16,18,19], daylight:[10.3,11.0,12.0,13.0,13.8,14.2,14.0,13.3,12.3,11.3,10.5,10.0], rainMm:[95,80,65,45,30,18,8,12,35,70,90,105] },
  tenerife: { temp:[16,16,17,18,20,22,24,25,24,22,19,17], wet:[.18,.16,.13,.10,.06,.03,.02,.03,.07,.13,.19,.21], snow:[.05,.04,.03,.01,0,0,0,0,0,0,.02,.04], wind:[18,18,19,20,21,22,23,22,20,18,17,18], daylight:[10.6,11.2,12.0,12.8,13.5,13.9,13.7,13.1,12.3,11.5,10.8,10.4], rainMm:[35,30,24,18,8,3,1,2,8,25,40,45] },
  mallorca: { temp:[11,11,13,16,20,24,27,27,24,20,15,12], wet:[.27,.25,.24,.19,.15,.09,.05,.07,.18,.28,.29,.28], snow:[.08,.06,.03,.01,0,0,0,0,0,0,.02,.06], wind:[18,17,16,15,14,14,14,13,14,16,17,18], daylight:[9.7,10.7,12.0,13.3,14.4,15.0,14.7,13.7,12.4,11.1,10.0,9.4], rainMm:[48,42,38,32,24,12,6,14,45,68,55,52] },
  dolomites: { temp:[-4,-3,2,7,12,16,18,17,13,8,2,-3], wet:[.23,.22,.25,.30,.34,.35,.32,.30,.26,.25,.25,.24], snow:[.86,.84,.72,.47,.18,.04,0,0,.03,.22,.61,.82], wind:[15,15,16,16,15,14,13,13,14,15,15,15], daylight:[9.0,10.2,11.9,13.5,14.8,15.5,15.2,14.0,12.5,10.9,9.5,8.7], rainMm:[42,38,52,75,105,125,118,110,86,70,58,45] },
  chamonix: { temp:[-2,-1,3,7,11,15,17,16,13,8,3,-1], wet:[.34,.32,.34,.36,.39,.37,.34,.33,.32,.34,.36,.35], snow:[.78,.76,.65,.42,.16,.03,0,0,.03,.20,.54,.72], wind:[13,13,14,14,13,12,12,11,12,13,13,13], daylight:[9.0,10.2,11.9,13.5,14.8,15.5,15.2,14.0,12.5,10.9,9.5,8.7], rainMm:[82,72,82,94,112,108,96,92,88,100,96,86] }
};

const destinations = readJson<DestinationConfig[]>("data-config/sources/destinations.json");
const geometry = readJson<any>("data-config/geography/destination-areas.geojson");
const generatedAt = "2026-08-31T00:00:00.000Z";

for (const destination of destinations) {
  const profile = profiles[destination.id];
  const bandMedians = Object.fromEntries(destination.elevationBands.map((band) => [band.id, Math.round((band.minM + band.maxM) / 2)]));
  const minM = Math.min(...destination.elevationBands.map((band) => band.minM));
  const maxM = Math.max(...destination.elevationBands.map((band) => band.maxM));
  const dem = {
    destinationId: destination.id,
    fixture: true,
    source: "synthetic-dem-fixture",
    sourceProduct: "COP-DEM_GLO-30-compatible-fixture",
    retrievedAt: generatedAt,
    area: { minM, p25M: Math.round(minM + (maxM-minM)*.25), medianM: Math.round(minM + (maxM-minM)*.5), p75M: Math.round(minM + (maxM-minM)*.75), maxM },
    bands: Object.fromEntries(destination.elevationBands.map((band, index) => [band.id, { medianM: bandMedians[band.id], pixelCount: 1200 - index * 180 }]))
  };
  writeJson(`data-snapshots/dem/${destination.slug}.json`, dem);

  const samplingBands = Object.fromEntries(destination.elevationBands.map((band, bandIndex) => {
    const target = bandMedians[band.id];
    const points = [-1,0,1].map((offset, pointIndex) => ({
      id: `${destination.id}-${band.id}-${pointIndex + 1}`,
      lat: round(destination.coordinates.lat + offset * .05, 2),
      lon: round(destination.coordinates.lon + (pointIndex - 1) * .05, 2),
      gridElevationM: target + [-90,35,120][pointIndex] + bandIndex * 10,
      targetElevationM: target,
      elevationMismatchM: Math.abs([-90,35,120][pointIndex] + bandIndex * 10),
      sampleWeight: 1/3,
      usedBufferM: 0,
      selectionRank: pointIndex + 1
    }));
    return [band.id, { targetElevationM: target, points }];
  }));
  const sampling = { destinationId: destination.id, fixture: true, samplingVersion: 1, bands: samplingBands };
  writeJson(`data-snapshots/sampling/${destination.slug}.json`, sampling);

  const bands: Record<string, { months: BandClimateMonth[] }> = {};
  const destinationGeometry=geometry.features.find((feature:any)=>feature.properties.destinationId===destination.id).geometry;
  const polygonPositions=(destinationGeometry.type==="Polygon"?destinationGeometry.coordinates.flat(1):destinationGeometry.coordinates.flat(2)) as Array<[number,number]>;
  const polygonCoordinates=polygonPositions.map(([lon,lat])=>({lat,lon}));
  const polygonEquivalentDiameterKm=maximumSeparation(polygonCoordinates);
  destination.elevationBands.forEach((band, bandIndex) => {
    const targetElevationM = bandMedians[band.id];
    const bandSamplingPoints=samplingBands[band.id].points;
    const months = Array.from({ length: 12 }, (_, i): BandClimateMonth => {
      const elevationCooling = bandIndex * (destination.region === "alps" ? 2.8 : 1.8);
      const mean = profile.temp[i] - elevationCooling;
      const seasonalHeat = Math.max(0, (mean - 20) / 12);
      const snow = Math.min(1, profile.snow[i] + bandIndex * (destination.region === "alps" ? .10 : .035));
      const wet = Math.min(1, profile.wet[i] + bandIndex * .015);
      return {
        month: i + 1,
        bandId: band.id,
        targetElevationM,
        meanElevationMismatchM: round(bandSamplingPoints.reduce((sum:number,point:any)=>sum+point.elevationMismatchM*point.sampleWeight,0),1),
        samplePointCount: 3,
        samplePointMaxSeparationKm: round(maximumSeparation(bandSamplingPoints),1),
        polygonEquivalentDiameterKm: round(polygonEquivalentDiameterKm,1),
        terrainReliefM: Math.min(1900, band.maxM - band.minM + bandIndex * 150),
        interannualScoreSd: 7 + bandIndex * 1.5,
        validInterannualYearCount: 30,
        temperatureHikingMeanC: round(mean, 1), temperatureHikingP10C: round(mean - 4.5, 1), temperatureHikingP90C: round(mean + 5, 1),
        temperatureUtilitySamplesC: [mean - 4.5, mean - 2, mean, mean + 2, mean + 5].map((v) => round(v, 1)),
        wetDayProbability: round(wet), heavyRainDayProbability: round(Math.max(0.005, wet * .17)), precipitationMonthlyMeanMm: round(profile.rainMm[i] * (1 + bandIndex*.08), 1),
        snowDayProbability: round(snow), snowDepthMeanOnSnowDaysM: round(snow > .25 ? .12 + bandIndex * .08 : snow > .04 ? .05 : 0, 2),
        windHikingMeanKmh: round(profile.wind[i] + bandIndex * 2.3, 1), highWindHourProbability: round(.02 + bandIndex*.025 + Math.max(0, profile.wind[i]-18)*.008), severeWindHourProbability: round(.003 + bandIndex*.004),
        hotDayProbability: round(Math.min(1, seasonalHeat + (bandIndex === 0 && mean > 23 ? .12 : 0))), severeHotDayProbability: round(Math.max(0, seasonalHeat - .12)),
        daylightHoursMean: profile.daylight[i], relativeHumidityHikingMeanPct: round(62 + wet*20 - seasonalHeat*8, 1), sampleYearCount: 30, dataCompleteness: round(.992 - bandIndex*.002, 3)
      };
    });
    bands[band.id] = { months };
  });
  const climate = { destinationId: destination.id, fixture: true, source: "era5-land-compatible-synthetic-fixture", climateNormal: {startYear:1991,endYear:2020}, retrievedAt: generatedAt, samplingSnapshotHash: sha256(sampling), bands };
  writeJson(`data-snapshots/climate/${destination.slug}.json`, climate);
}

console.log(`Wrote deterministic fixture snapshots for ${destinations.length} destinations.`);
