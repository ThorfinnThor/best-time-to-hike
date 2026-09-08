import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import scope from '../../data-config/methodology/validity-comparison-scope-v1.json';
const requested=process.env.BTH_VALIDITY_DESTINATIONS?.split(',').map(value=>value.trim()).filter(Boolean)??[];
const selected=requested.length?requested:scope.destinations;
if(selected.some(id=>!scope.destinations.includes(id))) throw Error('Comparison subset outside bounded scope');
const inventory=scope.destinations.map(id=>{
  const climate=JSON.parse(readFileSync(`data-snapshots/climate/${id}.json`,'utf8'));
  const source=climate.sourceDownloads[0];
  const path=`generated/intermediate/era5-raw/${source.key}`;
  return {id,available:climate.sourceDownloads.length===1&&existsSync(`${path}.meta.json`)&&existsSync(`${path}.ndjson.gz`),key:source.key};
});
mkdirSync('generated/intermediate/validity-pilot',{recursive:true});
writeFileSync('generated/intermediate/validity-pilot/cache-inventory.json',JSON.stringify({scope,selected,inventory},null,2),{flag:'wx'});
// Missing points are reported explicitly, never substituted with a different cell.
for(const item of inventory) if(item.available&&selected.includes(item.id)) console.log(item.id);
