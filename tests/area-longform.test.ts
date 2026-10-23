import test from "node:test";
import assert from "node:assert/strict";
import { areaById, areaCatalogue, areaFacts } from "../lib/seo/areas";
import { areaSections } from "../lib/seo/area-longform";
import { locales } from "../lib/i18n/config";
import { getDestination } from "../lib/data/load";
import { CRITICAL_COMPONENT_FLOOR } from "../lib/scoring/recommendations";
import type { PublicDestination } from "../lib/data/types";

const prose = (id: string, locale: (typeof locales)[number]) =>
  areaSections(areaById(id)!, locale).flatMap((section) => [section.heading, ...section.paragraphs]).join(" ");
const eligible = (destination: PublicDestination) => destination.months.filter((month) => month.recommendationEligible).map((month) => month.month);

test("area prose never names a withheld destination", () => {
  for (const area of areaCatalogue()) {
    for (const locale of locales) {
      const text = prose(area.id, locale);
      for (const destination of area.withheld) {
        assert.ok(!text.includes(destination.name), `${area.id} (${locale}) names withheld ${destination.slug}`);
      }
    }
  }
});

test("regression: sikkim, zermatt and el-chalten stay out of their area prose; torres-del-paine keeps its own season", () => {
  // The three holds must be counted as withheld, never described.
  for (const [slug, areas] of [["sikkim", ["himalaya", "asia"]], ["zermatt", ["alps", "europe"]], ["el-chalten", ["patagonia", "south-america"]]] as const) {
    const destination = getDestination(slug)!;
    assert.equal(destination.recommendationEligible, false, `${slug} is expected to be withheld`);
    for (const id of areas) {
      const area = areaById(id);
      if (!area) continue;
      assert.ok(area.withheld.some((item) => item.slug === slug), `${slug} missing from ${id}'s withheld list`);
      assert.ok(areaFacts(area).withheldCount >= 1);
      for (const locale of locales) assert.ok(!prose(id, locale).includes(destination.name), `${id} (${locale}) describes ${slug}`);
    }
  }
  // Torres del Paine is recommendable in three months; wherever the prose
  // attributes a season to it, it must be those three.
  const torres = getDestination("torres-del-paine")!;
  for (const id of ["patagonia", "south-america"]) {
    const area = areaById(id);
    if (!area) continue;
    const f = areaFacts(area);
    for (const group of [f.longest, f.shortest]) {
      if (group.destinations.some((item) => item.slug === torres.slug)) assert.equal(group.months, eligible(torres).length);
    }
  }
});

test("area facts agree with the recommendation gate", () => {
  for (const area of areaCatalogue()) {
    const f = areaFacts(area);
    for (const destination of area.destinations) assert.equal(destination.recommendationEligible, true);
    for (const month of f.closedMonths) assert.equal(f.monthCounts[month - 1], 0, `${area.id} calls ${month} closed`);
    for (const month of f.peakMonths) assert.equal(f.monthCounts[month - 1], f.peakCount);
    for (const group of [f.longest, f.shortest]) {
      for (const destination of group.destinations) assert.equal(eligible(destination).length, group.months, `${area.id}: ${destination.slug}`);
    }
    assert.equal(f.openAllYear, area.destinations.filter((destination) => eligible(destination).length === 12).length);
    // Every month named in "conditions" is one where the named destinations are open.
    for (const destination of [f.conditions.coolest, f.conditions.warmest]) {
      assert.ok(destination.months[f.conditionsMonth - 1].recommendationEligible, `${area.id}: ${destination.slug} is closed in ${f.conditionsMonth}`);
    }
    const closedByFactor = f.quietMonthFactors.reduce((sum, [, value]) => sum + value, 0);
    assert.equal(closedByFactor, f.count - f.monthCounts[f.quietMonth - 1], `${area.id}: closures in ${f.quietMonth} not all explained`);
  }
});

test("what closes the quietest month is a component the gate actually failed", () => {
  for (const area of areaCatalogue()) {
    const f = areaFacts(area);
    for (const [key, value] of f.quietMonthFactors) {
      const failed = area.destinations.filter((destination) => {
        const month = destination.months[f.quietMonth - 1];
        return !month.recommendationEligible && month.components![key] <= CRITICAL_COMPONENT_FLOOR;
      });
      assert.ok(failed.length >= value, `${area.id}: ${value} closures attributed to ${key}, ${failed.length} failed it`);
    }
  }
});

test("area prose: both locales, no Gedankenstrich, wind only as a disclaimer", () => {
  for (const area of areaCatalogue()) {
    assert.equal(areaSections(area, "en").length, areaSections(area, "de").length, `${area.id} section count differs by locale`);
    assert.ok(!/ [–—] /.test(prose(area.id, "de")), `${area.id} uses a prose dash in German`);
    for (const locale of locales) {
      // Destination names such as "Wind River Range" are not wind claims.
      const unnamed = area.destinations.reduce((text, destination) => text.replaceAll(destination.name, "X"), prose(area.id, locale));
      for (const sentence of unnamed.split(/(?<=[.!?])\s+/)) {
        if (!/\bwind\b|\bgusts?\b|\bBöen\b/i.test(sentence)) continue;
        assert.ok(/\bnot\b|\bkeine\b|\bnicht\b/i.test(sentence), `${area.id} (${locale}) mentions wind: "${sentence}"`);
      }
      assert.ok(!/nearest|nächstgelegen/i.test(prose(area.id, locale)), `${area.id} (${locale}) calls a cell nearest`);
      assert.ok(!/-0(?!\d|[.,]\d)/.test(prose(area.id, locale)), `${area.id} (${locale}) prints a negative zero`);
    }
  }
});

test("area articles differ in shape, not only in numbers", () => {
  // Strip names, numbers and months, and what is left is the sentence pattern
  // each branch of the generator chose.
  const months = /January|February|March|April|May|June|July|August|September|October|November|December/g;
  const shape = (area: (ReturnType<typeof areaCatalogue>)[number]) => areaSections(area, "en")
    .flatMap((section) => section.paragraphs)
    .map((paragraph) => area.destinations.reduce((text, destination) => text.replaceAll(destination.name, "X"), paragraph).replace(months, "M").replace(/[\d,.]+/g, "N"))
    .join("|");
  const shapes = new Set(areaCatalogue().map(shape));
  assert.ok(shapes.size >= 10, `only ${shapes.size} distinct area article shapes across ${areaCatalogue().length} areas`);
});
