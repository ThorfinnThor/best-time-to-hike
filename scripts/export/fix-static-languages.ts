import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT } from "../lib/io";

const germanRoot=join(ROOT,"out/de");
const files=(directory:string):string[]=>readdirSync(directory,{withFileTypes:true}).flatMap((entry)=>entry.isDirectory()?files(join(directory,entry.name)):[join(directory,entry.name)]);
const htmlFiles=files(germanRoot).filter((file)=>file.endsWith(".html"));
let changed=0;
for(const file of htmlFiles){
  const source=readFileSync(file,"utf8");
  const localized=source.replace('<html lang="en"','<html lang="de"');
  if(localized!==source){writeFileSync(file,localized);changed+=1;}
}
if(!htmlFiles.length||changed!==htmlFiles.length)throw new Error(`Static language post-process changed ${changed}/${htmlFiles.length} German HTML files.`);
console.log(`Localized the document language in ${changed} German static pages.`);
