import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { defaultPreferences, preferencesFromQuery, preferencesToQuery, type FinderPreferences } from "../lib/finder/match";

/**
 * The audit's most common finding was a function that worked, was translated,
 * had a passing test, and was never called from anything a reader could reach.
 * A unit test cannot see that; this can.
 */
const SOURCE_ROOTS = ["app", "components", "lib", "scripts"];

function files(dir: string): string[] {
  return readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return files(path);
    return /\.tsx?$/.test(path) ? [path] : [];
  });
}

const sources = SOURCE_ROOTS.flatMap(files);
const corpus = new Map(sources.map((path) => [path, readFileSync(path, "utf8")]));

test("every exported function in the finder and SEO layers is called outside its own file", () => {
  const watched = sources.filter((path) => /^lib\/(finder|seo)\//.test(path));
  const orphans: string[] = [];
  for (const path of watched) {
    for (const [, name] of corpus.get(path)!.matchAll(/^export (?:async )?function (\w+)/gm)) {
      const used = [...corpus].some(([other, text]) => other !== path && new RegExp(`\\b${name}\\b`).test(text));
      if (!used) orphans.push(`${path}: ${name}`);
    }
  }
  assert.deepEqual(orphans, [], `implemented but never called from the app:\n  ${orphans.join("\n  ")}`);
});

test("search state survives a round trip through the URL", () => {
  const cases: Partial<FinderPreferences>[] = [
    {},
    {months: [], minTemp: -8, maxTemp: 3},
    {months: [1, 6, 12], avoidRain: false, avoidSnow: false, avoidHeat: true},
    {continent: "south-america", region: "andes", tags: ["alpine", "glacier"], sort: "warmest"},
    {minDaylight: 12, maxWetDays: 0.25, minElevation: 1000, maxElevation: 2500},
    {query: "Cocora Valley"},
  ];
  for (const patch of cases) {
    const preferences = {...defaultPreferences, ...patch};
    const round = preferencesFromQuery(preferencesToQuery(preferences));
    assert.deepEqual(round, preferences, `lost in the URL: ${JSON.stringify(patch)}`);
  }
});

test("a shared link with junk in it falls back rather than breaking", () => {
  const junk = preferencesFromQuery("?m=99,abc,7&tmin=&tmax=nonsense&sort=chaos&rain=maybe");
  assert.deepEqual(junk.months, [7], "out-of-range and unparseable months are dropped, valid ones kept");
  assert.equal(junk.minTemp, defaultPreferences.minTemp);
  assert.equal(junk.maxTemp, defaultPreferences.maxTemp);
  assert.equal(junk.sort, defaultPreferences.sort);
  assert.equal(junk.avoidRain, defaultPreferences.avoidRain);
});
