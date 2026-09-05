import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { CompactMonth, CompactSearchDestination, Comparison, DatasetStatus, DestinationConfig, PublicDestination, Ranking } from "../../lib/data/types";
import pageDefinitions from "../../data-config/seo/page-definitions.json";
import { readJson, ROOT, sha256, writeJson } from "../lib/io";

type Scored = {destination: DestinationConfig; dem: {source?:string;sourceProduct?:string;area:{minM:number;medianM:number;maxM:number}}; months: PublicDestination["months"]; recommendationEligible:boolean; recommendationHoldReason?:"persistent-snow"; representativeCell:{lat:number;lon:number;modelElevationM:number;overrideLabel?:string;overrideReason?:string}; datasetStatus:DatasetStatus; climateSource:string; climateSourceDataset?:string; climateSourceDoi?:string; retrievedAt:string};
const scored = readJson<Scored[]>("generated/intermediate/scored.json");
const statuses = new Set(scored.map((item) => item.datasetStatus));
if (statuses.size !== 1) throw new Error(`EXPORT001 mixed dataset statuses: ${[...statuses].join(", ")}`);
const datasetStatus = [...statuses][0];
const updatedAt = scored.map((item) => item.retrievedAt).sort().at(-1) ?? "2026-08-31T00:00:00.000Z";
const publicDestinations: PublicDestination[] = scored.map(({destination, dem, months, recommendationEligible, recommendationHoldReason, representativeCell, climateSource, climateSourceDataset, climateSourceDoi}) => {
  const eligibleMonths = months.filter((item) => item.recommendationEligible && item.overallScore !== null);
  const bestMonths = [...eligibleMonths].sort((a,b) => b.overallScore!-a.overallScore! || a.month-b.month).slice(0,3).map((item)=>item.month).sort((a,b)=>a-b);
  const alternatives = scored.filter((item)=>item.destination.slug!==destination.slug && item.recommendationEligible).sort((a,b)=>b.months.filter((m)=>m.recommendationEligible && m.overallScore !== null).reduce((s,m)=>s+m.overallScore!,0)-a.months.filter((m)=>m.recommendationEligible && m.overallScore !== null).reduce((s,m)=>s+m.overallScore!,0)).slice(0,3).map((item)=>item.destination.slug);
  const fixture = datasetStatus === "fixture";
  const sourceLabel = fixture ? "synthetic fixture shaped like ERA5-Land" : `${climateSourceDataset ?? climateSource}${climateSourceDoi ? ` (DOI ${climateSourceDoi})` : ""}`;
  return {schemaVersion:1,algorithmVersion:"1.1.0",datasetStatus,id:destination.id,slug:destination.slug,name:destination.name,countryCode:destination.countryCode,countryName:destination.countryName,continent:destination.continent,region:destination.region,timezone:destination.timezone,tags:destination.tags,coordinates:destination.coordinates,elevationBands:destination.elevationBands,elevation:{minM:dem.area.minM,medianM:dem.area.medianM,maxM:dem.area.maxM},months,recommendationEligible,recommendationHoldReason,representativeCell,bestMonths,alternatives,provenance:{temperature:sourceLabel,precipitation:sourceLabel,snow:sourceLabel,wind:`${sourceLabel}; coarse 10 m grid-cell wind, not exposed-trail or gust validation`,elevation:fixture?"synthetic fixture shaped like Copernicus DEM GLO-30":"selected representative ERA5-Land model-grid cell",daylight:"deterministic astronomical calculation from coordinates and local date",scope:"one selected representative model-grid cell; not a whole-region or route-specific average",...(representativeCell.overrideLabel ? {representativeCellOverrideLabel:representativeCell.overrideLabel,representativeCellOverrideReason:representativeCell.overrideReason ?? ""} : {})},updatedAt};
});

for (const destination of publicDestinations) {
  // The destination file already carries its months. A second per-destination
  // copy under monthly/ was written by this exporter and read by nothing:
  // half the published dataset, duplicated.
  writeJson(`public/data/hiking/destinations/${destination.countryCode.toLowerCase()}/${destination.slug}.json`, destination);
}
writeJson("public/data/hiking/destinations/index.json", publicDestinations.map(({id,slug,name,countryCode,countryName,continent,region,tags,recommendationEligible,bestMonths})=>({id,slug,name,countryCode,countryName,continent,region,tags,recommendationEligible,bestMonths})));

// The finder is a client component, so this file is serialised into the RSC
// payload of every page that renders one. Keys repeated across 1,500 month
// entries dominate the size, so months are tuples rather than objects, and
// three fields are dropped: wind and confidence are unused by the finder, and
// confidence is a constant 64 under the provisional cap. Eligibility is not
// carried either, because only eligible months are exported here at all.
// Field order is [month, score, temperature, wetDays, snowDays, hotDays, daylight].
const round2 = (value: number) => Math.round(value * 100) / 100;
const search: CompactSearchDestination[] = publicDestinations
  .filter((destination) => destination.recommendationEligible)
  .map((destination) => ({
    slug: destination.slug,
    name: destination.name,
    countryCode: destination.countryCode,
    continent: destination.continent,
    region: destination.region,
    tags: destination.tags,
    monthly: destination.months
      .filter((month) => month.recommendationEligible && month.overallScore !== null)
      .map((month) => [
        month.month,
        month.overallScore!,
        round2(month.metrics.temperatureHikingMeanC),
        round2(month.metrics.wetDayProbability),
        round2(month.metrics.snowDayProbability),
        round2(month.metrics.hotDayProbability),
        round2(month.metrics.daylightHoursMean),
      ] as CompactMonth),
  }));
writeJson("public/data/hiking/search/destination-index.json", search);

const rankingIds: string[] = [];
for (let month = 1; month <= 12; month += 1) {
  for (const theme of ["all","warm","snow-free","low-rain"] as const) {
    const filtered = publicDestinations.filter((destination)=> {
      const data = destination.months[month-1];
      return destination.recommendationEligible && data.recommendationEligible && data.overallScore !== null && (theme === "all" || (theme === "warm" && data.metrics.temperatureHikingMeanC >= 15) || (theme === "snow-free" && data.metrics.snowDayProbability <= .08) || (theme === "low-rain" && data.metrics.wetDayProbability <= .2));
    });
  const sorted = filtered.sort((a,b)=>b.months[month-1].overallScore!-a.months[month-1].overallScore! || b.months[month-1].confidenceScore!-a.months[month-1].confidenceScore! || a.slug.localeCompare(b.slug));
    const id = `${theme === "all" ? "global" : theme}-${month}`;
  const ranking: Ranking = {schemaVersion:1,id,month,region:"global",theme,indexable:false,entries:sorted.map((destination,index)=>{const m=destination.months[month-1];return{rank:index+1,slug:destination.slug,name:destination.name,countryCode:destination.countryCode,score:m.overallScore!,confidence:m.confidenceScore!,tempC:m.metrics.temperatureHikingMeanC,wet:m.metrics.wetDayProbability,snow:m.metrics.snowDayProbability}})};
    writeJson(`public/data/hiking/rankings/${id}.json`, ranking);
    rankingIds.push(id);
  }
}

const comparisons: Comparison[] = pageDefinitions.comparisons.map((definition) => {
  const [firstSlug, secondSlug] = definition.destinations;
  const first = publicDestinations.find((destination)=>destination.slug===firstSlug)!;
  const second = publicDestinations.find((destination)=>destination.slug===secondSlug)!;
  return {
    schemaVersion: 1,
    slug: definition.slug,
    destinations: [firstSlug, secondSlug],
    indexable: false,
    months: first.months.map((month, index) => {
      const other = second.months[index];
      const available = month.recommendationEligible && other.recommendationEligible && month.overallScore !== null && other.overallScore !== null;
      return {
        month: month.month,
        firstScore: available ? month.overallScore : null,
        secondScore: available ? other.overallScore : null,
        winner: available ? (month.overallScore === other.overallScore ? "tie" : month.overallScore! > other.overallScore! ? firstSlug : secondSlug) : null,
      };
    }),
  };
});
comparisons.forEach((comparison)=>writeJson(`public/data/hiking/comparisons/${comparison.slug}.json`, comparison));
writeJson("public/data/hiking/comparisons/comparison-index.json", comparisons.map(({slug,destinations,indexable})=>({slug,destinations,indexable})));

function files(dir: string): string[] { return readdirSync(dir,{withFileTypes:true}).flatMap((entry)=>entry.isDirectory()?files(join(dir,entry.name)):[join(dir,entry.name)]); }
const dataRoot = join(ROOT,"public/data/hiking");
const existing = files(dataRoot).filter((path)=>!path.endsWith("manifest.json"));
const fileChecksums = Object.fromEntries(existing.sort().map((path)=>[relative(dataRoot,path),sha256(readFileSync(path))]));
writeJson("public/data/hiking/manifest.json",{schemaVersion:1,algorithmVersion:"1.1.0",datasetVersion:datasetStatus==="fixture"?"fixture-2026-08-31.1":"era5-land-representative-point-1991-2020-v1",datasetStatus,generatedAt:updatedAt,climateNormal:{startYear:1991,endYear:2020},sourceVersions:{climate:datasetStatus==="fixture"?"synthetic-era5-compatible-fixture":"reanalysis-era5-land-timeseries DOI 10.24381/ee82e357",elevation:datasetStatus==="fixture"?"synthetic-dem-compatible-fixture":"ERA5-Land auxiliary invariant geopotential pinned SHA-256"},destinationCount:publicDestinations.length,rankingIds,fileChecksums,totalBytes:existing.reduce((sum,path)=>sum+statSync(path).size,0)});
console.log(`Exported ${publicDestinations.length} destinations, ${rankingIds.length} rankings and ${comparisons.length} comparisons.`);
