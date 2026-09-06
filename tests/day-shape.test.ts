import test from "node:test";
import assert from "node:assert/strict";
import { dayShape, dayShapeDomain, type DayNote } from "../lib/hiking/day-shape";
import type { ClimateMetrics } from "../lib/data/types";

const metrics = (p10: number, mean: number, p90: number, humidity = 55): ClimateMetrics => ({
  temperatureHikingMeanC: mean, temperatureHikingP10C: p10, temperatureHikingP90C: p90,
  temperatureUtilitySamplesC: [], wetDayProbability: .2, heavyRainDayProbability: .05,
  precipitationMonthlyMeanMm: 60, snowDayProbability: 0, snowDepthMeanOnSnowDaysM: 0,
  windHikingMeanKmh: 12, highWindHourProbability: .02, severeWindHourProbability: 0,
  hotDayProbability: .05, severeHotDayProbability: 0, daylightHoursMean: 12,
  relativeHumidityHikingMeanPct: humidity, sampleYearCount: 30, dataCompleteness: .99,
});
const notes = (...args: Parameters<typeof metrics>): DayNote[] => dayShape(metrics(...args)).notes;

test("day shape reads the two ends of the walking window, not the mean", () => {
  const flat = dayShape(metrics(16, 18, 20));
  const swinging = dayShape(metrics(8, 18, 27));
  assert.equal(flat.meanC, swinging.meanC);
  assert.notDeepEqual(flat.notes, swinging.notes);
  assert.equal(swinging.swingC, 19);
});

test("day shape names a freezing cold end before a merely cold one", () => {
  assert.equal(notes(-3, 6, 13)[0], "freezingStart");
  assert.deepEqual(notes(3, 10, 16), ["coldStart"]);
});

test("day shape separates damp heat from dry heat at the same temperature", () => {
  assert.ok(notes(18, 24, 30, 78).includes("muggyAfternoon"));
  assert.ok(notes(18, 24, 30, 40).includes("hotAfternoon"));
});

test("day shape gives every month a reading, and reserves the strong claim", () => {
  assert.deepEqual(notes(16, 18, 21), ["steady"]);
  assert.deepEqual(notes(11, 17, 22), ["moderate"]);
  assert.ok(notes(6, 14, 22).includes("wideSwing"));
  assert.ok(notes(-4, 8, 30, 80).length <= 2, "at most two notes so the section stays readable");
});

test("day shape domain covers every month and never collapses", () => {
  const wide = dayShapeDomain([{metrics: metrics(-8, 0, 4)}, {metrics: metrics(9, 15, 22)}]);
  assert.ok(wide.minC <= -8 && wide.maxC >= 22);
  const flat = dayShapeDomain([{metrics: metrics(17, 18, 19)}]);
  assert.ok(flat.maxC - flat.minC >= 6, "a flat destination still gets a drawable scale");
});
