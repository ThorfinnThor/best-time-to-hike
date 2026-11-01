import test from "node:test";
import assert from "node:assert/strict";
import { filterRankingRegion, parseRankingRegion, rankingRegionHref, rankingRegions } from "../lib/hiking/ranking-region";
import { getDestination, getRanking } from "../lib/data/load";
import { links } from "../lib/i18n/links";
import { locales, themeKeys } from "../lib/i18n/config";

test("region parsing is bounded and worldwide is the default", () => {
  for (const region of rankingRegions) assert.equal(parseRankingRegion(region), region);
  for (const value of [null, "", "invalid", "EUROPE"]) assert.equal(parseRankingRegion(value), "worldwide");
});

test("region filtering preserves published order and Americas combines both continents", () => {
  const entries = ["asia", "north-america", "europe", "south-america", "africa"].map((continent, index) => ({continent, score: 100 - index}));
  assert.deepEqual(filterRankingRegion(entries, "worldwide"), entries);
  assert.deepEqual(filterRankingRegion(entries, "americas"), [entries[1], entries[3]]);
  assert.deepEqual(filterRankingRegion(entries, "europe"), [entries[2]]);
  assert.deepEqual(filterRankingRegion(entries, "oceania"), []);
});

test("region links preserve month, category and locale", () => {
  for (const locale of locales) for (let month = 1; month <= 12; month++) {
    for (const href of [links.ranking(locale, month), ...themeKeys.map((theme) => links.themeRanking(locale, theme, month))]) {
      assert.equal(rankingRegionHref(href, "worldwide"), href);
      assert.equal(rankingRegionHref(href, "europe"), `${href}?region=europe`);
    }
  }
});

test("published rankings have continent metadata for every filterable entry", () => {
  for (let month = 1; month <= 12; month++) for (const theme of ["all", "warm", "low-rain", "snow-free"] as const) {
    for (const entry of getRanking(month, theme).entries) {
      const destination = getDestination(entry.slug);
      assert.ok(destination, entry.slug);
      assert.ok(rankingRegions.includes(destination.continent as typeof rankingRegions[number]), entry.slug);
    }
  }
});

test("every region has the CSS rule that hides cards outside it", async () => {
  const { readFileSync } = await import("node:fs");
  const css = readFileSync("app/globals.css", "utf8");
  for (const region of rankingRegions.filter((value) => value !== "worldwide")) {
    assert.ok(css.includes(`.ranking-explorer[data-region="${region}"] .ranking-result-card:not(`), `no hide rule for ${region}`);
  }
  // The rule must agree with filterRankingRegion: americas spans both continents.
  assert.ok(css.includes(`[data-region="americas"] .ranking-result-card:not([data-continent="north-america"]):not([data-continent="south-america"])`));
});
