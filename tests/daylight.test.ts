import test from "node:test";
import assert from "node:assert/strict";
import { daylight, daylightForLocalDate, inHikingWindow } from "../lib/hiking/daylight";
test("hiking window is start-inclusive and end-exclusive",()=>{assert.equal(inHikingWindow(8*60,6*60,20*60),true);assert.equal(inHikingWindow(18*60,6*60,20*60),false);assert.equal(inHikingWindow(8*60+59,9*60,17*60),false);assert.equal(inHikingWindow(9*60,9*60,17*60),true)});
test("polar dates retain a nominal local weather-sampling window without inventing solar events",()=>{assert.equal(inHikingWindow(8*60,null,null,"polar_day"),true);assert.equal(inHikingWindow(12*60,null,null,"polar_night"),true);assert.equal(inHikingWindow(18*60,null,null,"polar_day"),false)});
test("astronomical daylight is plausible at equinox",()=>{const value=daylight(new Date("2020-03-20T12:00:00Z"),0,0);assert.equal(value.polarState,"normal");assert.ok(value.daylightHours>11.8&&value.daylightHours<12.3)});
test("solar events are converted to destination local clock time",()=>{const value=daylightForLocalDate("2020-06-01",0,0,"UTC");assert.ok(value.sunriseLocalMinutes!>350&&value.sunriseLocalMinutes!<370);assert.ok(value.sunsetLocalMinutes!>1070&&value.sunsetLocalMinutes!<1090)});
test("polar state follows the solar solution, including September",()=>{assert.equal(daylight(new Date("2020-09-01T12:00:00Z"),89,0).polarState,"polar_day");assert.equal(daylight(new Date("2020-12-01T12:00:00Z"),89,0).polarState,"polar_night")});
