import test from "node:test";
import assert from "node:assert/strict";
import {
  aggregateDailyClimate,
  aggregateMonthlyClimate,
  nearestRank,
  precipitationIncrements,
  type HourlyClimateObservation
} from "../lib/hiking/climate";
import { expectedHourlyInstants, toLocalDateTime } from "../lib/hiking/daylight";

const completeObservation = (utcInstant: string, overrides: Partial<HourlyClimateObservation> = {}): HourlyClimateObservation => ({
  utcInstant,
  temperatureK: 293.15,
  dewpointK: 283.15,
  windUMs: 3,
  windVMs: 4,
  precipitationM: 0.0001,
  snowCover: 0,
  snowDepthM: 0,
  ...overrides
});

const utcDay = (date: string, precipitationM = 0.0001) => Array.from({ length: 24 }, (_, hour) =>
  completeObservation(`${date}T${hour.toString().padStart(2, "0")}:00:00.000Z`, { precipitationM })
);

test("nearest-rank percentiles use ceil(p*n) without interpolation", () => {
  assert.equal(nearestRank([9, 1, 3, 7, 5], 0.1), 1);
  assert.equal(nearestRank([9, 1, 3, 7, 5], 0.9), 9);
  assert.equal(nearestRank([], 0.9), null);
});

test("explicit precipitation modes preserve missingness and reset semantics", () => {
  const incremental = [
    completeObservation("2020-01-01T00:00:00.000Z", { precipitationM: 0.001 }),
    completeObservation("2020-01-01T01:00:00.000Z", { precipitationM: null })
  ];
  assert.deepEqual([...precipitationIncrements(incremental, "INCREMENTAL_PER_TIMESTEP_M").values()], [0.001, null]);

  const accumulated = [
    completeObservation("2020-01-01T00:00:00.000Z", { precipitationM: 0.001, precipitationReset: true }),
    completeObservation("2020-01-01T01:00:00.000Z", { precipitationM: 0.003 }),
    completeObservation("2020-01-01T02:00:00.000Z", { precipitationM: 0.0005, precipitationReset: true }),
    completeObservation("2020-01-01T03:00:00.000Z", { precipitationM: 0.001 })
  ];
  assert.deepEqual([...precipitationIncrements(accumulated, "ACCUMULATED_WITH_EXPLICIT_RESET_METADATA").values()], [0.001, 0.002, 0.0005, 0.0005]);
  assert.throws(() => precipitationIncrements([
    completeObservation("2020-01-01T00:00:00.000Z", { precipitationM: 0.003, precipitationReset: true }),
    completeObservation("2020-01-01T01:00:00.000Z", { precipitationM: 0.002 })
  ], "ACCUMULATED_WITH_EXPLICIT_RESET_METADATA"), /decreased without reset/);
  assert.throws(()=>precipitationIncrements(incremental,"UNKNOWN" as any),/SRC001/);
});

test("capped lapse adjustment remains explicit in aggregation output",()=>{
  const [day]=aggregateDailyClimate(utcDay("2020-06-01"),{timezone:"UTC",lat:0,lon:0,era5LandGridElevationM:0,targetElevationM:1500,precipitationSemantics:"INCREMENTAL_PER_TIMESTEP_M"});
  assert.equal(day.temperatureCorrectionC,-5);
  assert.equal(day.temperatureCorrectionCapped,true);
});

test("DST fallback keeps repeated wall-clock hours as distinct UTC identities", () => {
  const first = toLocalDateTime(new Date("2020-11-01T05:30:00.000Z"), "America/New_York");
  const second = toLocalDateTime(new Date("2020-11-01T06:30:00.000Z"), "America/New_York");
  assert.deepEqual(first, { localDate: "2020-11-01", localMinutes: 90 });
  assert.deepEqual(second, first);
  assert.equal(expectedHourlyInstants("2020-11-01", "America/New_York"), 25);
  assert.equal(expectedHourlyInstants("2020-03-08", "America/New_York"), 23);
});

test("hourly source coordinates must be canonical and monotonic", () => {
  assert.throws(()=>precipitationIncrements([
    completeObservation("2020-01-01T01:00:00.000Z"),
    completeObservation("2020-01-01T00:00:00.000Z")
  ],"INCREMENTAL_PER_TIMESTEP_M"),/TIME002/);
  assert.throws(()=>precipitationIncrements([completeObservation("2020-01-01T00:30:00.000Z")],"INCREMENTAL_PER_TIMESTEP_M"),/TIME001/);
  assert.throws(()=>toLocalDateTime(new Date("2020-01-01T00:00:00.000Z"),"Not/AZone"),/TIME001/);
});

test("daily metrics use all-day precipitation and hiking-window weather", () => {
  const [day] = aggregateDailyClimate(utcDay("2020-06-01"), {
    timezone: "UTC",
    lat: 0,
    lon: 0,
    era5LandGridElevationM: 500,
    targetElevationM: 1000,
    precipitationSemantics: "INCREMENTAL_PER_TIMESTEP_M"
  });
  assert.equal(day.observationCount, 24);
  assert.equal(day.precipitationDailyMm, 2.4);
  assert.equal(day.adjustedTemperaturesHikingC.length, 10);
  assert.equal(day.temperatureMeanHikingC, 16.75);
  assert.equal(day.windMeanHikingKmh, 18);
  assert.equal(day.windP90HikingKmh, 18);
  assert.equal(day.snowDay, false);
  assert.equal(day.hotDay, false);
  assert.ok(day.relativeHumidityHikingPct.every((value) => value > 50 && value < 53));
});

test("incomplete precipitation is missing rather than silently becoming zero", () => {
  const records = utcDay("2020-06-01").map((record, index) => index < 3 ? { ...record, precipitationM: null } : record);
  const [day] = aggregateDailyClimate(records, {
    timezone: "UTC",
    lat: 0,
    lon: 0,
    era5LandGridElevationM: 0,
    targetElevationM: 0,
    precipitationSemantics: "INCREMENTAL_PER_TIMESTEP_M"
  });
  assert.equal(day.precipitationDailyMm, null);
});

test("daily classification uses the exact rain, snow, heat, and wind thresholds", () => {
  const records=utcDay("2020-06-01",0).map((record,hour)=>({...record,
    precipitationM:hour===0?.001:0,
    snowCover:hour===0?.1:0,
    temperatureK:hour===12?301.15:293.15,
    windUMs:hour===12?40/3.6:hour===13?60/3.6:0,
    windVMs:0
  }));
  const [day]=aggregateDailyClimate(records,{timezone:"UTC",lat:0,lon:0,era5LandGridElevationM:0,targetElevationM:0,precipitationSemantics:"INCREMENTAL_PER_TIMESTEP_M"});
  assert.equal(day.precipitationDailyMm,1);
  assert.equal(day.snowDay,true);
  assert.equal(day.hotDay,true);
  assert.equal(day.severeHotDay,false);
  assert.equal(day.highWindHourShare,.2);
  assert.equal(day.severeWindHourShare,.1);
});

test("monthly climatology uses valid-day denominators and yearly totals", () => {
  const records = Array.from({ length: 31 }, (_, day) => utcDay(`2020-01-${(day + 1).toString().padStart(2, "0")}`, 0.0012 / 24)).flat();
  const daily = aggregateDailyClimate(records, {
    timezone: "UTC",
    lat: 0,
    lon: 0,
    era5LandGridElevationM: 0,
    targetElevationM: 0,
    precipitationSemantics: "INCREMENTAL_PER_TIMESTEP_M"
  });
  const month = aggregateMonthlyClimate(daily, 1, { timezone: "UTC", lat: 0, lon: 0, startYear: 2020, endYear: 2020 });
  assert.equal(month.wetDayProbability, 1);
  assert.equal(month.heavyRainDayProbability, 0);
  assert.ok(Math.abs(month.precipitationMonthlyMeanMm! - 37.2) < 1e-9);
  assert.equal(month.snowDayProbability, 0);
  assert.equal(month.sampleYearCount, 1);
  assert.equal(month.dataCompleteness, 1);
});
