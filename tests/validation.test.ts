import test from "node:test";
import assert from "node:assert/strict";
import destinations from "../data-config/sources/destinations.json";
test("destination and elevation weights are closed",()=>{assert.equal(new Set(destinations.map((item)=>item.slug)).size,destinations.length);for(const destination of destinations){assert.ok(Math.abs(destination.elevationBands.reduce((sum,band)=>sum+band.weight,0)-1)<1e-9);assert.ok(Intl.DateTimeFormat(undefined,{timeZone:destination.timezone}))}});
