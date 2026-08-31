import test from "node:test";
import assert from "node:assert/strict";
import { daylight, inHikingWindow } from "../lib/hiking/daylight";
test("hiking window is start-inclusive and end-exclusive",()=>{assert.equal(inHikingWindow(8*60,6*60,20*60),true);assert.equal(inHikingWindow(18*60,6*60,20*60),false);assert.equal(inHikingWindow(8*60+59,9*60,17*60),false);assert.equal(inHikingWindow(9*60,9*60,17*60),true)});
test("astronomical daylight is plausible at equinox",()=>{const value=daylight(new Date("2020-03-20T12:00:00Z"),0,0);assert.equal(value.polarState,"normal");assert.ok(value.daylightHours>11.8&&value.daylightHours<12.3)});
