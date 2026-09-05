import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import weights from "../data-config/scoring/weights.json";
import overrides from "../data-config/sources/representative-cell-overrides.json";
import { DICT } from "../lib/i18n/dict";
import { locales } from "../lib/i18n/config";
import type { CompactSearchDestination, PublicDestination } from "../lib/data/types";

/**
 * mistakes.md #9: copy is a claim, and it ages with the data. The live build
 * once told readers that low, middle and high elevations were evaluated
 * separately while every published destination carried a single band, and
 * called the grid cell "nearest" while five destinations deliberately use an
 * override. Nothing failed, because no test compared the words to the data.
 */

const root = join(process.cwd(), "public/data/hiking");
const read = <T>(path: string): T => JSON.parse(readFileSync(join(root, path), "utf8")) as T;
const index = read<Array<{slug: string; countryCode: string}>>("destinations/index.json");
const destinations = index.map((entry) => read<PublicDestination>(`destinations/${entry.countryCode.toLowerCase()}/${entry.slug}.json`));

function everyString(value: unknown, path: string, visit: (text: string, path: string) => void): void {
  if (typeof value === "string") return visit(value, path);
  if (Array.isArray(value)) return value.forEach((item, i) => everyString(item, `${path}[${i}]`, visit));
  if (value && typeof value === "object") for (const [key, inner] of Object.entries(value)) everyString(inner, `${path}.${key}`, visit);
}

test("the single-cell claim matches the published band structure", () => {
  // The trust card and the destination scope copy both say each destination is
  // one selected representative cell. That is only honest while it is true.
  const multiBand = destinations.filter((destination) => destination.elevationBands.length !== 1);
  assert.deepEqual(multiBand.map((destination) => destination.slug), [],
    "a destination now has more than one elevation band: the single-cell copy in dict.ts (trust.items, destination.cellScope, month.selectedCellHeading) must be rewritten before this ships");
});

test("published months expose exactly the bands the destination declares", () => {
  for (const destination of destinations) {
    for (const month of destination.months) {
      assert.equal(month.bands.length, destination.elevationBands.length,
        `${destination.slug}/${month.month}: month band count contradicts the destination band list`);
    }
  }
});

test("no copy calls the grid cell the nearest one while overrides exist", () => {
  const overrideCount = Object.keys(overrides.overrides).length;
  if (overrideCount === 0) return;
  for (const locale of locales) {
    everyString(DICT[locale], locale, (text, path) => {
      assert.ok(!/\bnearest\b/i.test(text), `${path} claims the nearest cell while ${overrideCount} destinations use an explicit override`);
      assert.ok(!/n(ä|ae)chstgelegen/i.test(text), `${path} claims the nearest cell while ${overrideCount} destinations use an explicit override`);
    });
  }
});

test("the methodology copy quotes the configured weights", () => {
  const expected = Object.values(weights.overall).map((weight) => Math.round(weight * 100));
  for (const locale of locales) {
    const paragraph = DICT[locale].info.methodology.paragraphs[0];
    const quoted = [...paragraph.matchAll(/(\d+)\s*%/g)].map((match) => Number(match[1]));
    assert.deepEqual(quoted, expected,
      `the ${locale} methodology paragraph quotes ${quoted.join("/")} but data-config/scoring/weights.json says ${expected.join("/")}`);
  }
});

test("the search index never exposes a destination that cannot be recommended", () => {
  // The compact wire format carries no eligibility flag: only eligible
  // destinations and months are exported, so membership IS the claim. That
  // makes this stronger, not weaker, because a withheld destination cannot be
  // present-but-flagged.
  const search = read<CompactSearchDestination[]>("search/destination-index.json");
  const held = destinations.filter((destination) => !destination.recommendationEligible).map((destination) => destination.slug);
  for (const slug of held) {
    assert.ok(!search.some((entry) => entry.slug === slug), `${slug} is withheld from recommendations but present in the search index`);
  }
  for (const entry of search) {
    const destination = destinations.find((item) => item.slug === entry.slug);
    assert.ok(destination, `${entry.slug} is in the search index but not in the catalogue`);
    const eligible = destination!.months.filter((month) => month.recommendationEligible).map((month) => month.month);
    assert.deepEqual(entry.monthly.map((month) => month[0]), eligible,
      `${entry.slug} exposes months the recommendation gate did not pass`);
  }
});
test("a withheld destination publishes no score or best-month claim", () => {
  for (const destination of destinations.filter((item) => !item.recommendationEligible)) {
    assert.deepEqual(destination.bestMonths, [], `${destination.slug} is withheld but still publishes best months`);
    for (const month of destination.months) {
      assert.equal(month.recommendationEligible, false, `${destination.slug}/${month.month}: withheld destination publishes an eligible month`);
    }
  }
});

test("every published taxonomy id has a real label in both locales", () => {
  const search = read<CompactSearchDestination[]>("search/destination-index.json");
  const used = {
    continents: new Set(search.map((entry) => entry.continent)),
    regions: new Set(search.map((entry) => entry.region)),
    tags: new Set(search.flatMap((entry) => entry.tags)),
  } as const;
  const missing: string[] = [];
  for (const locale of locales) {
    for (const kind of ["continents", "regions", "tags"] as const) {
      const table = DICT[locale].taxonomy[kind] as Record<string, string>;
      for (const id of used[kind]) if (table[id] === undefined) missing.push(`${locale}.taxonomy.${kind}.${id}`);
    }
  }
  assert.deepEqual(missing, [], `a published id falls back to a titleized slug instead of a translation: ${missing.join(", ")}`);
});

test("the finder can reach every destination the science layer publishes", () => {
  const search = read<CompactSearchDestination[]>("search/destination-index.json");
  const continents = new Set(Object.keys(DICT.en.taxonomy.continents));
  const unreachable = search.filter((entry) => !continents.has(entry.continent));
  assert.deepEqual(unreachable.map((entry) => entry.slug), [],
    "a destination sits in a continent the finder cannot offer as a filter option");
});
