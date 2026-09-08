import {readFileSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import scope from '../../data-config/methodology/validity-comparison-scope-v1.json';
const inventory=scope.destinations.map(id=>{
  const climate=JSON.parse(readFileSync(`data-snapshots/climate/${id}.json`,'utf8'));
  const source=climate.sourceDownloads[0];
  const path=`generated/intermediate/era5-raw/${source.key}`;
  return {id,available:climate.sourceDownloads.length===1&&existsSync(`${path}.meta.json`)&&existsSync(`${path}.ndjson.gz`),key:source.key};
});
mkdirSync('generated/intermediate/validity-pilot',{recursive:true});
writeFileSync('generated/intermediate/validity-pilot/cache-inventory.json',JSON.stringify({scope,inventory},null,2),{flag:'wx'});
// Missing points are reported explicitly, never substituted with a different cell.
for(const item of inventory) if(item.available) console.log(item.id);
