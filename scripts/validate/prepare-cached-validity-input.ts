import { createReadStream, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';

async function main() {
const id=process.argv[2];
if(!['hunza','el-chalten'].includes(id)) throw Error('Only the reviewed Hunza and El Chalten pilot is allowed');
const json=(p:string)=>JSON.parse(readFileSync(p,'utf8'));
const climate=json(`data-snapshots/climate/${id}.json`);
const sampling=json(`data-snapshots/sampling/${id}.json`);
const destination=json('data-config/sources/destinations.json').find((d:{id:string})=>d.id===id);
if(climate.sourceDownloads.length!==1) throw Error('Pilot requires one source point');
const source=climate.sourceDownloads[0];
if(!/^[a-z0-9_-]+$/.test(source.key)) throw Error('Invalid source key');
const path=`generated/intermediate/era5-raw/${source.key}`;
const metadata=json(`${path}.meta.json`);
const raw=readFileSync(`${path}.ndjson.gz`);
const hash=createHash('sha256').update(raw).digest('hex');
if(hash!==metadata.canonicalObservation?.sha256 || metadata.canonicalObservation?.encoding!=='gzip-ndjson-utf8') throw Error('Cache integrity mismatch');
if(JSON.stringify(metadata.request)!==JSON.stringify(source.request)) throw Error('Cached request differs from published point request');
for(const key of ['latitude','longitude']) if(Math.abs(metadata.resolvedLocation[key]-source.resolvedLocation[key])>1e-4) throw Error('Cached point differs');
if(metadata.variables?.snowDepthM?.netcdfVariable!=='sde'||metadata.variables?.snowDepthM?.canonicalUnit!=='m'||metadata.variables?.snowCover?.normalization!=='PERCENT_TO_FRACTION') throw Error('Unexpected snow semantics');
const observations=[];
const lines=createInterface({input:createReadStream(`${path}.ndjson.gz`).pipe(createGunzip()),crlfDelay:Infinity});
for await(const line of lines) if(line.trim()) observations.push(JSON.parse(line));
if(observations.length!==262992||metadata.observationCount!==262992) throw Error('Incomplete normal');
for(let i=0;i<observations.length;i++) if(observations[i].utcInstant!==new Date(Date.UTC(1991,0,1)+i*3600000).toISOString()) throw Error('Non-contiguous normal');
const output='generated/intermediate/validity-pilot';mkdirSync(output,{recursive:true});
writeFileSync(`${output}/${id}-input.json`,JSON.stringify({schemaVersion:2,datasetStatus:'provisional',source:'era5Land',destinationId:id,samplePointId:`${id}-representative-1`,timezone:destination.timezone,coordinates:{lat:source.resolvedLocation.latitude,lon:source.resolvedLocation.longitude},era5LandGridElevationM:source.era5LandGridElevationM,targetElevationM:sampling.bands.representative.targetElevationM,precipitationSemantics:'INCREMENTAL_PER_TIMESTEP_M',climateNormal:{startYear:1991,endYear:2020},observations}),{flag:'wx'});
writeFileSync(`${output}/${id}-source-evidence.json`,JSON.stringify({destinationId:id,cacheSha256:hash,publishedCanonicalSha256:source.canonicalObservation.sha256,identicalToPublishedCanonical:hash===source.canonicalObservation.sha256,request:metadata.request,resolvedLocation:metadata.resolvedLocation,observationCount:observations.length,comparisonScope:'Both algorithms use this exact cached source; a differing published hash is not silently treated as identical source data.'},null,2),{flag:'wx'});
console.log(`${id}: verified ${observations.length} cached hours; source matches published hash: ${hash===source.canonicalObservation.sha256}`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
