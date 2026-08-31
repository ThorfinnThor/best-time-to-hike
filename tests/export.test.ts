import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
test("public export has a fixture manifest and five destinations",()=>{assert.equal(existsSync("public/data/hiking/manifest.json"),true);const manifest=JSON.parse(readFileSync("public/data/hiking/manifest.json","utf8"));assert.equal(manifest.datasetStatus,"fixture");assert.equal(manifest.destinationCount,5);assert.deepEqual(manifest.climateNormal,{startYear:1991,endYear:2020})});
