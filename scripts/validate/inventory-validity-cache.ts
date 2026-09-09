import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import scope from '../../data-config/methodology/validity-comparison-scope-v1.json';
const destinations=JSON.parse(readFileSync('data-config/sources/destinations.json','utf8')) as Array<{id:string}>;
const globalScope=process.env.BTH_VALIDITY_SCOPE==='all';
const allowed=globalScope?destinations.map(destination=>destination.id):scope.destinations;
const requested=process.env.BTH_VALIDITY_DESTINATIONS?.split(',').map(value=>value.trim()).filter(Boolean)??[];
if(requested.some(id=>!allowed.includes(id))) throw Error('Comparison subset outside permitted scope');
const shardCount=Number(process.env.BTH_VALIDITY_SHARD_COUNT??1);
const shardIndex=Number(process.env.BTH_VALIDITY_SHARD_INDEX??0);
if(!Number.isInteger(shardCount)||shardCount<1||!Number.isInteger(shardIndex)||shardIndex<0||shardIndex>=shardCount) throw Error('Invalid validity shard');
const selected=(requested.length?requested:allowed).filter((_,index)=>index%shardCount===shardIndex);
const inventory=allowed.map(id=>{
  const climate=JSON.parse(readFileSync(`data-snapshots/climate/${id}.json`,'utf8'));
  const source=climate.sourceDownloads[0];
  const path=`generated/intermediate/era5-raw/${source.key}`;
  return {id,available:climate.sourceDownloads.length===1&&existsSync(`${path}.meta.json`)&&existsSync(`${path}.ndjson.gz`),key:source.key};
});
mkdirSync('generated/intermediate/validity-pilot',{recursive:true});
writeFileSync('generated/intermediate/validity-pilot/cache-inventory.json',JSON.stringify({scope:globalScope?'all-current-destinations':scope,shard:{index:shardIndex,count:shardCount},selected,inventory},null,2),{flag:'wx'});
// Missing points are reported explicitly, never substituted with a different cell.
const missing=inventory.filter(item=>selected.includes(item.id)&&!item.available);
if(process.env.BTH_VALIDITY_REQUIRE_ALL==='1'&&missing.length) throw Error(`Missing ${missing.length} cached points: ${missing.map(item=>item.id).join(',')}`);
for(const item of inventory) if(item.available&&selected.includes(item.id)) console.log(item.id);
