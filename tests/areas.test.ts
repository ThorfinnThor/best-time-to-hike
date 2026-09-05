import test from "node:test";
import assert from "node:assert/strict";
import { areaById, areaCatalogue, areaProfile, MINIMUM_DESTINATIONS } from "../lib/seo/areas";
import { pageSeo } from "../lib/seo/page-seo";
import { pathFor, resolvePageId } from "../lib/i18n/resolve";
import { locales, monthSlug } from "../lib/i18n/config";

const areas = areaCatalogue();

test("an area only gets a page when it can support a ranking", () => {
  assert.ok(areas.length > 0);
  for (const area of areas) {
    assert.ok(area.destinations.length >= MINIMUM_DESTINATIONS,
      `${area.id} has ${area.destinations.length} destinations, below the threshold`);
  }
});

test("a withheld destination is listed as withheld, never ranked", () => {
  for (const area of areas) {
    for (const destination of area.destinations) {
      assert.equal(destination.recommendationEligible, true, `${area.id} ranks ${destination.slug}, which is withheld`);
    }
    for (const destination of area.withheld) {
      assert.equal(destination.recommendationEligible, false);
    }
  }
});

test("month counts never exceed the area's own destinations", () => {
  for (const area of areas) {
    const profile = areaProfile(area);
    assert.equal(profile.monthCounts.length, 12);
    for (const count of profile.monthCounts) {
      assert.ok(count >= 0 && count <= area.destinations.length, `${area.id} reports an impossible month count`);
    }
    assert.ok(profile.peakMonths.length >= 1);
    assert.ok(profile.elevationMinM <= profile.elevationMaxM);
  }
});

test("area routes resolve and rebuild in both locales", () => {
  for (const area of areas.slice(0, 8)) {
    for (const locale of locales) {
      const path = pathFor({kind: "areaRanking", area: area.id}, locale);
      const page = resolvePageId(locale, path.split("/").slice(2).filter(Boolean));
      assert.deepEqual(page, {kind: "areaRanking", area: area.id}, `${area.id} did not round-trip in ${locale}`);
    }
  }
});

test("a month slug is never shadowed by an area", () => {
  // Both live under the rankings segment, so the closed set has to win.
  for (const locale of locales) {
    for (let month = 1; month <= 12; month += 1) {
      const page = resolvePageId(locale, ["best-hiking-destinations", monthSlug(month, locale)].map((segment, index) =>
        index === 0 ? (locale === "de" ? "beste-wanderziele" : "best-hiking-destinations") : segment));
      assert.deepEqual(page, {kind: "ranking", month}, `${monthSlug(month, locale)} resolved to something other than a month`);
    }
  }
});

test("area titles and descriptions are unique", () => {
  for (const locale of locales) {
    const titles = areas.map((area) => pageSeo({kind: "areaRanking", area: area.id}, locale).title);
    assert.equal(new Set(titles).size, titles.length, `duplicate area titles in ${locale}`);
  }
});

test("areas differ in season, not only in name", () => {
  // If every area peaked in the same months the pages would be templates.
  const shapes = new Set(areas.map((area) => areaProfile(area).peakMonths.join(",")));
  assert.ok(shapes.size >= 5, `only ${shapes.size} distinct peak-season shapes across ${areas.length} areas`);
});

test("an unknown area is not a page", () => {
  assert.equal(areaById("not-an-area"), null);
  assert.equal(resolvePageId("en", ["best-hiking-destinations", "not-an-area"]), null);
});
