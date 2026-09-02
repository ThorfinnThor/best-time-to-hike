import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
test("public export matches the active static destination inventory",()=>{assert.equal(existsSync("public/data/hiking/manifest.json"),true);const manifest=JSON.parse(readFileSync("public/data/hiking/manifest.json","utf8"));const configs=JSON.parse(readFileSync("data-config/sources/destinations.json","utf8"));assert.ok(["fixture","provisional","production"].includes(manifest.datasetStatus));assert.equal(manifest.destinationCount,configs.filter((item:{active:boolean})=>item.active).length);assert.deepEqual(manifest.climateNormal,{startYear:1991,endYear:2020})});
