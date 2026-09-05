import test from "node:test";
import assert from "node:assert/strict";
import { defaultPreferences, facetsFor, matchDestinations, type FinderPreferences } from "../lib/finder/match";
import type { SearchDestination } from "../lib/data/types";

const prefs = (patch: Partial<FinderPreferences> = {}): FinderPreferences => ({...defaultPreferences, ...patch});

interface Options { continent?: string; region?: string; tags?: string[]; daylight?: number; hot?: number; eligible?: boolean }
const destination = (slug: string, temp: number, wet: number, snow: number, score: number, options: Options = {}): SearchDestination => ({
  id: slug, slug, name: slug, countryCode: "XX",
  continent: options.continent ?? "europe",
  region: options.region ?? "test",
  tags: options.tags ?? [],
  recommendationEligible: options.eligible ?? true,
  monthly: Array.from({length: 12}, (_, i) => ({
    m: i + 1, score, temp, wet, snow, hot: options.hot ?? 0, wind: 10,
    daylight: options.daylight ?? 12, confidence: 64, recommendationEligible: true,
  })),
});

test("finder keeps hiking score distinct from user match", () => {
  const results = matchDestinations([destination("dry", 18, .05, 0, 80), destination("wet", 18, .6, 0, 90)], prefs({month: 1}));
  assert.equal(results[0].destination.slug, "dry");
  assert.equal(results[0].month.score, 80);
  assert.notEqual(results[0].match, results[0].month.score);
});

test("finder ignores non-eligible months in the search artifact", () => {
  const item = destination("gated", 18, .05, 0, 80);
  item.monthly[0].recommendationEligible = false;
  assert.equal(matchDestinations([item], prefs({month: 1})).length, 0);
  assert.equal(matchDestinations([item], prefs({month: 2})).length, 1);
});

test("a withheld destination is never offered", () => {
  const held = destination("held", 18, .05, 0, 80, {eligible: false});
  assert.equal(matchDestinations([held], prefs({month: 1})).length, 0);
  assert.equal(matchDestinations([held], prefs({month: "any"})).length, 0);
});

test("the continent filter reaches destinations outside Europe", () => {
  const catalogue = [
    destination("banff", 14, .2, 0, 80, {continent: "north-america", region: "canadian-rockies"}),
    destination("chamonix", 14, .2, 0, 80, {continent: "europe", region: "alps"}),
  ];
  assert.deepEqual(matchDestinations(catalogue, prefs({month: 7, continent: "north-america"})).map((r) => r.destination.slug), ["banff"]);
  assert.deepEqual(matchDestinations(catalogue, prefs({month: 7, continent: "europe"})).map((r) => r.destination.slug), ["chamonix"]);
  assert.equal(matchDestinations(catalogue, prefs({month: 7})).length, 2);
});

test("the region filter narrows inside a continent", () => {
  const catalogue = [
    destination("chamonix", 14, .2, 0, 80, {continent: "europe", region: "alps"}),
    destination("rila", 14, .2, 0, 80, {continent: "europe", region: "balkans"}),
  ];
  assert.deepEqual(matchDestinations(catalogue, prefs({month: 7, continent: "europe", region: "balkans"})).map((r) => r.destination.slug), ["rila"]);
});

test("facets are derived from the catalogue and skip withheld destinations", () => {
  const facets = facetsFor([
    destination("a", 14, .2, 0, 80, {continent: "asia", region: "himalaya", tags: ["trekking", "high-altitude"]}),
    destination("b", 14, .2, 0, 80, {continent: "europe", region: "alps", tags: ["alpine"]}),
    destination("hidden", 14, .2, 0, 80, {continent: "africa", region: "atlas", tags: ["desert"], eligible: false}),
  ]);
  assert.deepEqual(facets.continents, ["asia", "europe"]);
  assert.deepEqual(facets.regionsByContinent.asia, ["himalaya"]);
  assert.deepEqual(facets.tags, ["alpine", "high-altitude", "trekking"]);
  assert.equal(facets.regionsByContinent.africa, undefined, "a withheld destination must not create a filter option");
});

test("any-month search returns the destination's best eligible month", () => {
  const item = destination("seasonal", 5, .5, .8, 60);
  item.monthly[6] = {...item.monthly[6], temp: 18, wet: .05, snow: 0, score: 88};
  const [result] = matchDestinations([item], prefs({month: "any"}));
  assert.equal(result.month.m, 7);
  assert.equal(result.month.score, 88);
});

test("any-month search never returns a month the science layer withholds", () => {
  const item = destination("seasonal", 5, .5, .8, 60);
  item.monthly[6] = {...item.monthly[6], temp: 18, wet: .05, snow: 0, score: 88, recommendationEligible: false};
  const [result] = matchDestinations([item], prefs({month: "any"}));
  assert.notEqual(result.month.m, 7, "the best-scoring month was ineligible and must not be offered");
});

test("a destination with no eligible month at all disappears from any-month search", () => {
  const item = destination("none", 5, .5, .8, 60);
  item.monthly = item.monthly.map((month) => ({...month, recommendationEligible: false}));
  assert.equal(matchDestinations([item], prefs({month: "any"})).length, 0);
});

test("minimum daylight is a hard floor, not a penalty", () => {
  const dark = destination("dark", 14, .1, 0, 90, {daylight: 7});
  assert.equal(matchDestinations([dark], prefs({month: 1, minDaylight: 10})).length, 0);
  assert.equal(matchDestinations([dark], prefs({month: 1, minDaylight: 0})).length, 1);
});

test("selected tags must all be present", () => {
  const item = destination("coastal-forest", 14, .1, 0, 80, {tags: ["coastal", "forest"]});
  assert.equal(matchDestinations([item], prefs({month: 6, tags: ["coastal"]})).length, 1);
  assert.equal(matchDestinations([item], prefs({month: 6, tags: ["coastal", "forest"]})).length, 1);
  assert.equal(matchDestinations([item], prefs({month: 6, tags: ["coastal", "desert"]})).length, 0);
});

test("avoiding heat penalises hot months", () => {
  const hot = destination("hot", 22, .05, 0, 80, {hot: .8});
  const cool = destination("cool", 22, .05, 0, 80, {hot: 0});
  const [first] = matchDestinations([hot, cool], prefs({month: 7, avoidHeat: true}));
  assert.equal(first.destination.slug, "cool");
  const without = matchDestinations([hot, cool], prefs({month: 7, avoidHeat: false}));
  assert.ok(without.find((r) => r.destination.slug === "hot")!.match > matchDestinations([hot], prefs({month: 7, avoidHeat: true}))[0].match);
});

test("results can be sorted without changing which destinations match", () => {
  const catalogue = [
    destination("alpha", 12, .1, 0, 70),
    destination("zulu", 26, .1, 0, 95),
  ];
  const base = prefs({month: 7, minTemp: 5, maxTemp: 30});
  const slugs = (sort: FinderPreferences["sort"]) => matchDestinations(catalogue, {...base, sort}).map((r) => r.destination.slug);
  assert.deepEqual(slugs("name"), ["alpha", "zulu"]);
  assert.deepEqual(slugs("warmest"), ["zulu", "alpha"]);
  assert.deepEqual(slugs("score"), ["zulu", "alpha"]);
  assert.deepEqual([...slugs("match")].sort(), ["alpha", "zulu"], "sorting must not add or drop results");
});

test("every result carries an explanation", () => {
  const [result] = matchDestinations([destination("clear", 16, .05, 0, 85, {daylight: 15})], prefs({month: 6}));
  assert.ok(result.reasons.includes("comfortable"));
  assert.ok(result.reasons.includes("dry"));
  assert.ok(result.reasons.includes("snowFree"));
  assert.ok(result.reasons.includes("longDays"));
});
