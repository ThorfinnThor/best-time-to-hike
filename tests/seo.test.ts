import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { longformSections } from "../lib/seo/longform";
import { profileFor, profileKey } from "../lib/seo/profile";
import { pageSeo } from "../lib/seo/page-seo";
import { locales } from "../lib/i18n/config";
import type { PublicDestination } from "../lib/data/types";
import { datasetLd, destinationFaqEntries, destinationFaqLd } from "../lib/seo/jsonld";
import { getDestination } from "../lib/data/load";
import { imageFor } from "../lib/media/images";
import { destinationArticleQualityPolicy, editorialDestinationSlugs } from "../lib/seo/editorial-index";

const root = "public/data/hiking/destinations";
const files: string[] = [];
const walk = (dir: string) => { for (const entry of readdirSync(dir, {withFileTypes: true})) entry.isDirectory() ? walk(join(dir, entry.name)) : files.push(join(dir, entry.name)); };
walk(root);
const destinations = files.filter((file) => !file.endsWith("index.json")).map((file) => JSON.parse(readFileSync(file, "utf8")) as PublicDestination);

test("a withheld destination's article makes no recommendation claim", () => {
  // Match the sentences that only a recommendable article produces. A denial
  // such as "no best months" is the correct thing to say and must not trip this.
  const asserts = [
    /strongest scored month/i, /am besten bewertete Monat/i,
    /hiking season at .+ runs/i, /Wandersaison in .+ umfasst/i,
    /no closed hiking season/i, /keine geschlossene Wandersaison/i,
    /meets our recommendation criteria/i, /erfüllt nur .+ unsere Empfehlungskriterien/i,
  ];
  for (const destination of destinations.filter((item) => !item.recommendationEligible)) {
    for (const locale of locales) {
      const prose = longformSections(destination, locale).flatMap((section) => [section.heading, ...section.paragraphs]).join(" ");
      for (const pattern of asserts) {
        assert.ok(!pattern.test(prose), `${destination.slug} (${locale}) asserts a season it withholds: ${pattern}`);
      }
    }
  }
});

test("wind is only ever mentioned as a disclaimer, never as a condition", () => {
  for (const destination of destinations.slice(0, 40)) {
    for (const locale of locales) {
      const sentences = longformSections(destination, locale)
        .flatMap((section) => section.paragraphs).join(" ").split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        if (!/\bwind\b|\bgusts?\b|\bBöen\b/i.test(sentence)) continue;
        assert.ok(/\bnot\b|\bkeine\b|\bnicht\b/i.test(sentence),
          `${destination.slug} (${locale}) mentions wind without the disclaimer: "${sentence}"`);
      }
    }
  }
});

test("German articles carry no Gedankenstrich", () => {
  for (const destination of destinations) {
    const prose = longformSections(destination, "de").flatMap((section) => [section.heading, ...section.paragraphs]).join(" ");
    assert.ok(!/ [–—] /.test(prose), `${destination.slug} uses a prose dash in German`);
  }
});

test("destination titles are unique across the catalogue", () => {
  for (const locale of locales) {
    const titles = destinations.map((destination) => pageSeo({kind: "destination", slug: destination.slug}, locale).title);
    const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
    assert.deepEqual([...new Set(duplicates)], [], `duplicate titles in ${locale}`);
  }
});

test("the index is far smaller than the render, and month pages are the reason", () => {
  const monthPages = destinations.flatMap((destination) => destination.months.map((month) => ({destination, month: month.month})));
  const indexed = monthPages.filter(({destination, month}) => pageSeo({kind: "destinationMonth", slug: destination.slug, month}, "en").index);
  // Only best months are indexed, so the indexed set must be a small fraction.
  assert.ok(indexed.length < monthPages.length * 0.3,
    `${indexed.length} of ${monthPages.length} month pages would be indexed, which is a doorway set`);
});

test("every withheld destination is kept out of the index", () => {
  for (const destination of destinations.filter((item) => !item.recommendationEligible)) {
    const seo = pageSeo({kind: "destination", slug: destination.slug}, "en");
    assert.equal(seo.index, false, `${destination.slug} is withheld but would be indexed`);
    assert.ok(seo.reasons.length > 0);
  }
});

test("every editorial destination meets the documented quality floor", () => {
  const policy = destinationArticleQualityPolicy();
  assert.equal(editorialDestinationSlugs().length, policy.targetPerLocale);
  assert.equal(new Set(editorialDestinationSlugs()).size, policy.targetPerLocale);
  for (const slug of editorialDestinationSlugs()) {
    const destination = getDestination(slug);
    assert.ok(destination, `${slug} is not a published destination`);
    assert.equal(destination.recommendationEligible, true, `${slug} has no eligible month`);
    assert.equal(destination.recommendationHoldReason, undefined, `${slug} is on recommendation hold`);
    assert.ok(Math.min(...destination.months.map((month) => month.metrics.dataCompleteness)) >= policy.minimumDataCompleteness,
      `${slug} misses the completeness floor`);
    assert.ok(destination.alternatives.length >= policy.minimumInternalAlternatives, `${slug} has too few internal alternatives`);
    if (policy.requireLicensedImage) assert.ok(imageFor(slug), `${slug} has no licensed image`);
    for (const locale of locales) {
      const sections = longformSections(destination, locale);
      const words = sections.flatMap((section) => section.paragraphs).join(" ").split(/\s+/).length;
      assert.ok(sections.length >= policy.minimumArticleSections, `${slug} (${locale}) has only ${sections.length} sections`);
      assert.ok(words >= policy.minimumArticleWords, `${slug} (${locale}) has only ${words} words`);
      assert.equal(pageSeo({kind: "destination", slug}, locale).index, true, `${slug} (${locale}) is not indexable`);
    }
  }
});

test("articles vary in shape, not only in numbers", () => {
  const shapes = new Set(destinations.map((destination) => profileKey(profileFor(destination))));
  assert.ok(shapes.size >= 40, `only ${shapes.size} distinct article shapes across ${destinations.length} destinations`);
  const headings = new Set(destinations.flatMap((destination) => longformSections(destination, "en").map((section) => section.heading)));
  assert.ok(headings.size >= 50, `only ${headings.size} distinct headings`);
});

test("FAQ structured data contains exactly the visible destination answers", () => {
  const destination = getDestination("madeira");
  assert.ok(destination);
  const entries = destinationFaqEntries(destination, "en");
  const ld = destinationFaqLd(destination, "en") as {mainEntity: Array<{name: string; acceptedAnswer: {text: string}}>};
  assert.deepEqual(ld.mainEntity.map((item) => ({q: item.name, a: item.acceptedAnswer.text})), entries);
});

test("methodology dataset markup identifies source, period and downloads", () => {
  const ld = datasetLd("en") as Record<string, unknown>;
  assert.equal(ld["@type"], "Dataset");
  assert.equal(ld.temporalCoverage, "1991/2025");
  assert.equal(ld.isBasedOn, "https://doi.org/10.24381/ee82e357");
  assert.ok(Array.isArray(ld.distribution));
});

test("unapproved comparisons stay out of the index and have readable metadata", () => {
  const seo = pageSeo({kind: "compare", slug: "madeira-vs-tenerife"}, "en");
  assert.equal(seo.index, false);
  assert.match(seo.title, /^Madeira vs Tenerife:/);
  assert.match(seo.description, /Madeira and Tenerife/);
  assert.ok(seo.reasons.includes("comparison-not-approved-for-indexing"));
});
