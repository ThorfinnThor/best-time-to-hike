import test from "node:test";
import assert from "node:assert/strict";
import { samplingQuality, selectSamplingPoints } from "../lib/hiking/sampling";

test("sampling is deterministic and spatially dispersed",()=>{
  const candidates=[{lat:0,lon:0,gridElevationM:990},{lat:0,lon:.1,gridElevationM:1000},{lat:.1,lon:0,gridElevationM:1020},{lat:.1,lon:.1,gridElevationM:1010}];
  assert.deepEqual(selectSamplingPoints(candidates,1000),selectSamplingPoints(candidates,1000));
  assert.equal(selectSamplingPoints(candidates,1000).length,3);
  assert.ok(Math.abs(selectSamplingPoints(candidates,1000).reduce((sum,item)=>sum+item.sampleWeight,0)-1)<1e-9);
});
test("sampling mismatch gates use exact boundaries",()=>{assert.equal(samplingQuality(300),"good");assert.equal(samplingQuality(301),"moderate");assert.equal(samplingQuality(601),"strong-penalty");assert.equal(samplingQuality(801),"blocked")});
test("sampling never fills from candidates outside the elevation slack",()=>{const selected=selectSamplingPoints([{lat:0,lon:0,gridElevationM:1000},{lat:1,lon:1,gridElevationM:1200}],1000,3,150);assert.equal(selected.length,1);assert.equal(selected[0].sampleWeight,1)});
