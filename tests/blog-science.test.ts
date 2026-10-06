import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import type { Locale, PublicDestination, PublicMonth } from "../lib/data/types";
import { getBlogPost } from "../lib/blog/content";

const DATA_ROOT = "public/data/hiking/destinations";

function destination(relativePath: string): PublicDestination {
  return JSON.parse(fs.readFileSync(`${DATA_ROOT}/${relativePath}.json`, "utf8")) as PublicDestination;
}

function month(data: PublicDestination, value: number): PublicMonth {
  const result = data.months.find((item) => item.month === value);
  assert.ok(result, `${data.slug}: missing month ${value}`);
  return result;
}

function articleText(slug: string, locale: Locale): string {
  const post = getBlogPost(slug);
  assert.ok(post, `missing article ${slug}`);
  return JSON.stringify(post.translations[locale].blocks);
}

function assertLocalizedClaim(slug: string, english: string, german: string): void {
  assert.ok(articleText(slug, "en").includes(english), `${slug}/en: missing checked claim ${english}`);
  assert.ok(articleText(slug, "de").includes(german), `${slug}/de: missing checked claim ${german}`);
}

test("the dry-climate article keeps heat-risk claims tied to destination artifacts", () => {
  const wadiRumJuly = month(destination("jo/wadi-rum"), 7);
  const archesJuly = month(destination("us/arches"), 7);
  const mallorcaJuly = month(destination("es/mallorca"), 7);

  assert.deepEqual([
    wadiRumJuly.metrics.wetDayProbability,
    wadiRumJuly.metrics.temperatureHikingMeanC,
    wadiRumJuly.metrics.hotDayProbability,
    wadiRumJuly.recommendationEligible,
  ], [0, 30.1, 0.9972, false]);
  assert.deepEqual([
    archesJuly.metrics.wetDayProbability,
    archesJuly.metrics.temperatureHikingMeanC,
    archesJuly.metrics.hotDayProbability,
    archesJuly.recommendationEligible,
  ], [0.0839, 30.8, 0.9742, false]);
  assert.deepEqual([
    mallorcaJuly.metrics.wetDayProbability,
    mallorcaJuly.metrics.temperatureHikingMeanC,
    mallorcaJuly.metrics.hotDayProbability,
    mallorcaJuly.recommendationEligible,
  ], [0.0581, 27.7, 0.7991, false]);
  assertLocalizedClaim("dry-does-not-mean-hikeable", "99.72%", "99,72%");
  assertLocalizedClaim("dry-does-not-mean-hikeable", "30.8 °C", "30,8 °C");
  assertLocalizedClaim("dry-does-not-mean-hikeable", "79.91%", "79,91%");
});

test("the season-width article uses the exact eligibility windows", () => {
  const paths = {
    "ar/quebrada-de-humahuaca": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "es/tenerife": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "za/table-mountain": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "pt/madeira": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    "us/grand-teton": [7, 8, 9],
    "ca/jasper": [7, 8, 9],
    "fr/chamonix": [7, 8, 9],
    "ch/grindelwald": [7, 8, 9],
    "is/landmannalaugar": [7, 8, 9],
    "no/jotunheimen": [7, 8, 9],
    "cl/cerro-castillo": [1, 2, 3, 12],
  } as const;

  for (const [path, expected] of Object.entries(paths)) {
    const eligible = destination(path).months.filter((item) => item.recommendationEligible).map((item) => item.month);
    assert.deepEqual(eligible, [...expected], `${path}: eligibility window changed`);
  }
  assertLocalizedClaim("wide-and-narrow-hiking-seasons", "July–September", "Juli–September");
  assertLocalizedClaim("wide-and-narrow-hiking-seasons", "January–March", "Januar–März");
});

test("the shoulder-season examples match the published month metrics", () => {
  const cases = [
    ["es/tenerife", 5, 16, 0.0562, 13.6],
    ["gr/samaria-crete", 5, 17.5, 0.165, 14],
    ["au/grampians", 3, 18.6, 0.1567, 12.3],
    ["us/sequoia-kings-canyon", 9, 15.4, 0.1933, 12.4],
    ["za/cederberg", 10, 19.4, 0.1594, 12.9],
  ] as const;

  for (const [path, number, temperature, wetDays, daylight] of cases) {
    const metrics = month(destination(path), number).metrics;
    assert.deepEqual([metrics.temperatureHikingMeanC, metrics.wetDayProbability, metrics.daylightHoursMean], [temperature, wetDays, daylight]);
  }
  assertLocalizedClaim("shoulder-season-hiking-worldwide", "5.62%", "5,62%");
  assertLocalizedClaim("shoulder-season-hiking-worldwide", "15.94%", "15,94%");
});

test("the daylight article preserves the measured annual ranges", () => {
  const ranges = [
    ["no/lofotodden", 0.4, 24],
    ["is/landmannalaugar", 4.4, 20.7],
    ["us/denali", 4.6, 20.5],
    ["ug/rwenzori", 12.1, 12.1],
    ["ke/mount-kenya", 12.1, 12.1],
    ["ec/cotopaxi", 12.1, 12.2],
  ] as const;

  for (const [path, expectedMin, expectedMax] of ranges) {
    const daylight = destination(path).months.map((item) => item.metrics.daylightHoursMean);
    assert.deepEqual([Math.min(...daylight), Math.max(...daylight)], [expectedMin, expectedMax], `${path}: daylight range changed`);
  }
  assertLocalizedClaim("daylight-and-hiking-season", "0.4–24.0 h", "0,4–24,0 h");
  assertLocalizedClaim("daylight-and-hiking-season", "4.6–20.5 h", "4,6–20,5 h");
});

test("the rainfall article compares total and frequency without conflating them", () => {
  const salkantay = month(destination("pe/salkantay"), 9).metrics;
  const cederberg = month(destination("za/cederberg"), 6).metrics;
  const jeju = month(destination("kr/jeju"), 10).metrics;

  assert.deepEqual([salkantay.precipitationMonthlyMeanMm, salkantay.wetDayProbability, salkantay.temperatureHikingMeanC], [85.1, 0.8533, 9.2]);
  assert.deepEqual([cederberg.precipitationMonthlyMeanMm, cederberg.wetDayProbability], [86.9, 0.281]);
  assert.deepEqual([jeju.precipitationMonthlyMeanMm, jeju.wetDayProbability, jeju.temperatureHikingMeanC], [81.3, 0.2442, 17]);
  assertLocalizedClaim("rainfall-total-versus-wet-days", "85.33%", "85,33%");
  assertLocalizedClaim("rainfall-total-versus-wet-days", "24.42%", "24,42%");
});

test("the mild-year itinerary keeps every selected month tied to its source", () => {
  const cases = [
    ["dz/hoggar", 1, 13, 0.0194],
    ["jo/wadi-rum", 2, 13.2, 0.0729],
    ["mx/copper-canyon", 3, 14.7, 0.0949],
    ["es/tenerife", 4, 13.8, 0.1305],
    ["gr/samaria-crete", 5, 17.5, 0.165],
    ["pt/madeira", 6, 18.7, 0.1752],
    ["au/larapinta", 7, 15.9, 0.0396],
    ["us/mount-rainier", 8, 16.2, 0.1991],
    ["us/sequoia-kings-canyon", 9, 15.4, 0.1933],
    ["za/table-mountain", 10, 16.9, 0.1908],
    ["ma/anti-atlas", 11, 15.1, 0.1495],
    ["th/doi-inthanon", 12, 19.5, 0.1364],
  ] as const;

  for (const [path, number, temperature, wetDays] of cases) {
    const selected = month(destination(path), number);
    assert.equal(selected.recommendationEligible, true, `${path}/${number}: itinerary month is no longer eligible`);
    assert.deepEqual([selected.metrics.temperatureHikingMeanC, selected.metrics.wetDayProbability], [temperature, wetDays]);
  }
  assertLocalizedClaim("mild-hiking-around-the-year", "Hoggar Mountains", "Hoggar-Gebirge");
  assertLocalizedClaim("mild-hiking-around-the-year", "Doi Inthanon", "Doi Inthanon");
});
