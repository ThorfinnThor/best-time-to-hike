import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { PublicDestination } from "../../lib/data/types";
import { readJson, ROOT, writeJson } from "../lib/io";

type Warning = {code:string;destinationId:string;month?:number;detail:string};
const config = readJson<any>("data-config/methodology/data-quality-v1.json");
const manifest = readJson<any>("public/data/hiking/manifest.json");
const destinationRoot = join(ROOT, "public/data/hiking/destinations");
const destinations = readdirSync(destinationRoot, {withFileTypes:true}).flatMap((country)=>country.isDirectory()
  ? readdirSync(join(destinationRoot,country.name)).map((file)=>JSON.parse(readFileSync(join(destinationRoot,country.name,file),"utf8")) as PublicDestination)
  : []
);
const warnings:Warning[]=[];
for(const destination of destinations){
  for(let index=1;index<destination.months.length;index+=1){
    const jump=Math.abs(destination.months[index].metrics.temperatureHikingMeanC-destination.months[index-1].metrics.temperatureHikingMeanC);
    if(jump>config.monthlyTemperatureJumpWarningC)warnings.push({code:"TEMP_MONTHLY_JUMP",destinationId:destination.id,month:index+1,detail:`${jump.toFixed(1)}C from previous month`});
  }
  for(const month of destination.months)if(month.metrics.dataCompleteness<config.minimumCompletenessWarning)warnings.push({code:"DATA_LOW_COMPLETENESS",destinationId:destination.id,month:month.month,detail:`${month.metrics.dataCompleteness}`});
}
for(let first=0;first<destinations.length;first+=1)for(let second=first+1;second<destinations.length;second+=1){
  const vector=(destination:PublicDestination)=>destination.months.map((month)=>[month.metrics.temperatureHikingMeanC,month.metrics.wetDayProbability,month.metrics.snowDayProbability,month.metrics.windHikingMeanKmh]);
  if(JSON.stringify(vector(destinations[first]))===JSON.stringify(vector(destinations[second])))warnings.push({code:"IDENTICAL_CLIMATE_VECTOR",destinationId:destinations[first].id,detail:`identical to ${destinations[second].id}`});
}
for(const destination of destinations){
  const sampling=readJson<any>(`data-snapshots/sampling/${destination.slug}.json`);
  for(const [bandId,band] of Object.entries(sampling.bands) as Array<[string,any]>){
    const coordinates=new Set(band.points.map((point:any)=>`${point.lat},${point.lon}`));
    if(band.points.length>1&&coordinates.size===1)warnings.push({code:"COLLAPSED_SAMPLING",destinationId:destination.id,detail:`all ${bandId} points share one coordinate`});
    const mismatch=Math.max(...band.points.map((point:any)=>point.elevationMismatchM));
    if(mismatch>config.strongElevationMismatchAboveM)warnings.push({code:"STRONG_ELEVATION_MISMATCH",destinationId:destination.id,detail:`${bandId} maximum ${mismatch}m`});
  }
}
const report={reportVersion:1,datasetVersion:manifest.datasetVersion,generatedFromManifestAt:manifest.generatedAt,datasetStatus:manifest.datasetStatus,warningCount:warnings.length,warnings};
writeJson("generated/reports/data-quality.json",report);
console.log(`Data-quality report: ${warnings.length} warning(s); generated/reports/data-quality.json`);
