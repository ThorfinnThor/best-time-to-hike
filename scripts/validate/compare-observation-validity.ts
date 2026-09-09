import { readFileSync, mkdirSync, writeFileSync, realpathSync, existsSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import Ajv2020 from 'ajv/dist/2020';
import { aggregatePointClimate, type HourlyClimateObservation, type PrecipitationSemantics } from '../../lib/hiking/climate';
import { aggregateValidDays, aggregateValidMonth } from '../../lib/hiking/climate-validity';
import { screenPhysicalSnow } from '../../lib/hiking/snow-screening';
import { interpolate, type Curve } from '../../lib/scoring';
import curves from '../../data-config/scoring/curves.json';
import { stageValidityExport } from '../../lib/hiking/validity-export';

// Explicit staging command only. No imports from this file in any public pipeline.
const [input,output]=process.argv.slice(2);
if(!input||!output) throw Error('Usage: node --import tsx scripts/validate/compare-observation-validity.ts <hourly-snapshot.json> generated/intermediate/<report.json>');
const root=realpathSync('generated/intermediate');
const target=resolve(output);
const isInside=(path:string)=>{const r=relative(root,path);return r!==''&&!r.startsWith('..')&&!r.startsWith('/');};
if(!isInside(target)) throw Error('Output must be inside generated/intermediate');
mkdirSync(dirname(target),{recursive:true});
if(!isInside(resolve(realpathSync(dirname(target)),target.split('/').at(-1)!))) throw Error('Output parent escapes staging directory');
const raw=readFileSync(input);
const snapshot=JSON.parse(raw.toString());
interface Snapshot {climateNormal:{startYear:number;endYear:number};observations:HourlyClimateObservation[];timezone:string;coordinates:{lat:number;lon:number};era5LandGridElevationM:number;targetElevationM:number;precipitationSemantics:PrecipitationSemantics;destinationId:string}
const validate=new Ajv2020({allErrors:true,strict:false}).compile<Snapshot>(JSON.parse(readFileSync('schemas/hourly-climate.schema.json','utf8')));
if(!validate(snapshot)) throw Error(`Invalid hourly snapshot: ${JSON.stringify(validate.errors)}`);
if(snapshot.climateNormal.startYear!==1991||snapshot.climateNormal.endYear!==2020) throw Error('Comparison requires the 1991-2020 normal');
const records:HourlyClimateObservation[]=snapshot.observations;
const options={timezone:snapshot.timezone,lat:snapshot.coordinates.lat,lon:snapshot.coordinates.lon,era5LandGridElevationM:snapshot.era5LandGridElevationM,targetElevationM:snapshot.targetElevationM,precipitationSemantics:snapshot.precipitationSemantics as PrecipitationSemantics};
const old=aggregatePointClimate(records,options);
for(const month of old.monthly) if(month.temperatureUtilitySamplesC.length)
  month.temperatureUtilityScore=month.temperatureUtilitySamplesC.reduce((sum,value)=>sum+interpolate(value,curves.temperature as Curve),0)/month.temperatureUtilitySamplesC.length;
const daily=aggregateValidDays(records,options);
const monthly=Array.from({length:12},(_,i)=>aggregateValidMonth(daily,i+1));
const snowScreen=screenPhysicalSnow(records.map(r=>r.snowDepthM),monthly.map(m=>m.metrics.snowDayProbability));
const destination=JSON.parse(readFileSync('data-config/sources/destinations.json','utf8')).find((d:{id:string})=>d.id===snapshot.destinationId);
const publishedPath=destination?`public/data/hiking/destinations/${destination.countryCode.toLowerCase()}/${destination.slug}.json`:null;
const published=publishedPath&&existsSync(publishedPath)?JSON.parse(readFileSync(publishedPath,'utf8')):null;
const publishedHold=published?.recommendationHoldReason??null;
const holdReasons=[...snowScreen.reasons,...(publishedHold?['existing-published-hold']:[])];
const confidenceContext=published?{
  datasetStatus:published.datasetStatus,
  representativenessApproved:false,
  source:'existing-published-spatial-geometry' as const,
  months:published.months.map((month:any)=>{
    if(month.bands.length!==1) throw Error('Scoped staging confidence currently requires one published representative band');
    const band=month.bands[0];
    return {meanElevationMismatchM:band.meanElevationMismatchM,samplePointCount:band.samplePointCount,samplePointMaxSeparationKm:band.samplePointMaxSeparationKm,polygonEquivalentDiameterKm:band.polygonEquivalentDiameterKm,terrainReliefM:band.terrainReliefM};
  })
}:undefined;
const stagingExport=stageValidityExport(snapshot.destinationId,monthly,holdReasons,confidenceContext);
const validateExport=new Ajv2020({strict:false}).compile(JSON.parse(readFileSync('schemas/validity-staging.schema.json','utf8')));
if(!validateExport(stagingExport)) throw Error(`Invalid staging export: ${JSON.stringify(validateExport.errors)}`);
const report={status:'staging-only-not-for-publication',sourceSha256:createHash('sha256').update(raw).digest('hex'),destinationId:snapshot.destinationId,
  monthly,changes:monthly.map((m,i)=>({month:i+1,metrics:Object.fromEntries(Object.entries(m.metrics).map(([key,value])=>[key,{before:(old.monthly[i] as unknown as Record<string,unknown>)[key]??null,after:value}]))})),
  snowScreen,stagingExport,
  dailyCoverage:daily.map(d=>({localDate:d.localDate,...d.validity})),
  limitations:['No production activation','No new Golden approval','Requires separate downstream score/export migration and review']};
// Exclusive creation prevents following a pre-existing output symlink or overwriting evidence.
writeFileSync(target,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(`Staging comparison written: ${output}`);
