import { readJson, round, sha256, writeJson } from "../lib/io";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

type Destination = {id:string; coordinates:{lat:number;lon:number};elevationBands:Array<{id:string}>};
type PowerResponse = {
  type:string;
  geometry:{type:string;coordinates:[number,number,number]};
  properties:{parameter:{T2M:Record<string,number>;PRECTOTCORR:Record<string,number>}};
  header:{api:{version:string;name:string};sources:string[];fill_value:number;time_standard:string;start:string;end:string};
};

const destinations = readJson<Destination[]>("data-config/sources/destinations.json");
const endpoint = "https://power.larc.nasa.gov/api/temporal/monthly/point";
const startYear = 1991;
const endYear = 2020;
const retrievedAt = new Date().toISOString();

const sleep = (milliseconds:number) => new Promise((resolve)=>setTimeout(resolve,milliseconds));
const execFileAsync=promisify(execFile);

async function request(coordinates:{lat:number;lon:number}):Promise<PowerResponse>{
  const query = new URLSearchParams({parameters:"T2M,PRECTOTCORR",community:"AG",longitude:String(coordinates.lon),latitude:String(coordinates.lat),start:String(startYear),end:String(endYear),format:"JSON"});
  let lastError:unknown;
  for(let attempt=1;attempt<=5;attempt+=1){
    try{
      // curl uses the host trust store in environments where Node's bundled
      // certificate chain cannot validate nasa.gov. No credentials are sent.
      const {stdout}=await execFileAsync("curl",["-fsSL","--max-time","45","--user-agent","best-time-to-hike-scientific-audit/1.0",`${endpoint}?${query}`],{maxBuffer:16*1024*1024});
      return JSON.parse(stdout) as PowerResponse;
    }catch(error){
      lastError=error;
      await sleep(500*attempt);
    }
  }
  throw lastError;
}

function monthlyNormal(values:Record<string,number>,month:number,fill:number){
  const selected=[] as number[];
  for(let year=startYear;year<=endYear;year+=1){
    const value=values[`${year}${String(month).padStart(2,"0")}`];
    if(Number.isFinite(value)&&value!==fill)selected.push(value);
  }
  if(selected.length!==30)throw new Error(`NASA POWER month ${month} has ${selected.length}/30 valid years`);
  return selected.reduce((sum,value)=>sum+value,0)/selected.length;
}

async function main(){
 const entries=[] as unknown[];
 for(let index=0;index<destinations.length;index+=1){
  const destination=destinations[index];
  const sampling=readJson<any>(`data-snapshots/sampling/${destination.id}.json`);
  const point=sampling.bands[destination.elevationBands[0].id].points[0];
  const selectedCellCoordinates={lat:point.lat,lon:point.lon};
  const response=await request(selectedCellCoordinates);
  const fill=response.header.fill_value;
  const temperatureMeanC=Array.from({length:12},(_,month)=>round(monthlyNormal(response.properties.parameter.T2M,month+1,fill),3));
  const precipitationMonthlyMeanMm=Array.from({length:12},(_,month)=>{
    let total=0;
    for(let year=startYear;year<=endYear;year+=1){
      const value=response.properties.parameter.PRECTOTCORR[`${year}${String(month+1).padStart(2,"0")}`];
      if(!Number.isFinite(value)||value===fill)throw new Error(`${destination.id} precipitation ${year}-${month+1} is missing`);
      total+=value*new Date(Date.UTC(year,month+1,0)).getUTCDate();
    }
    return round(total/30,3);
  });
  entries.push({
    destinationId:destination.id,
    destinationCoordinates:destination.coordinates,
    requestedCoordinates:selectedCellCoordinates,
    sourceGridCoordinates:{lon:response.geometry.coordinates[0],lat:response.geometry.coordinates[1],elevationM:response.geometry.coordinates[2]},
    temperatureMeanC,
    precipitationMonthlyMeanMm,
    annualPrecipitationMeanMm:round(precipitationMonthlyMeanMm.reduce((sum,value)=>sum+value,0),1),
    sourceResponseSha256:sha256(response),
  });
  if((index+1)%25===0||index+1===destinations.length)console.log(`NASA POWER audit: ${index+1}/${destinations.length}`);
  await sleep(100);
 }

 writeJson("data-snapshots/external-audit/nasa-power-1991-2020.json",{
  schemaVersion:1,
  status:"independent-model-diagnostic-not-ground-truth",
  source:"NASA POWER monthly API / MERRA-2",
  sourceUrl:"https://power.larc.nasa.gov/api/temporal/monthly/point",
  documentationUrl:"https://power.larc.nasa.gov/docs/methodology/meteorology/",
  retrievedAt,
  normal:{startYear,endYear},
  request:{parameters:["T2M","PRECTOTCORR"],community:"AG",timeStandard:"LST"},
  interpretation:"Independent coarse-grid reanalysis diagnostic. It can corroborate seasonal direction and flag large disagreements, but it is not station truth and cannot approve an ERA5-Land hiking cell.",
   entries,
 });
}

main().catch((error)=>{console.error(error);process.exitCode=1;});
