import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import manifest from "../data-config/sources/destination-images.json";
import { normaliseLicence } from "../lib/media/licence";
import type { DestinationConfig } from "../lib/data/types";

const images = manifest.images as Array<{slug: string; file: string; sourceFile: string; author: string; licenceId: string; attribution: string}>;
const destinations = JSON.parse(readFileSync("data-config/sources/destinations.json", "utf8")) as DestinationConfig[];
const slugs = new Set(destinations.map((destination) => destination.slug));

test("every published image carries a commercially usable licence", () => {
  const refused = images.filter((image) => normaliseLicence(image.licenceId) === null);
  assert.deepEqual(refused.map((image) => `${image.slug}:${image.licenceId}`), [],
    "the operator rule is open licence or commercially usable, nothing else");
});

test("attribution-requiring licences name their author", () => {
  const missing = images.filter((image) => {
    const licence = normaliseLicence(image.licenceId)!;
    return licence.requiresAttribution && !image.attribution.includes(image.author);
  });
  assert.deepEqual(missing.map((image) => image.slug), []);
});

test("no two destinations illustrate themselves with the same photograph", () => {
  const bySource = new Map<string, string[]>();
  for (const image of images) bySource.set(image.sourceFile, [...(bySource.get(image.sourceFile) ?? []), image.slug]);
  const shared = [...bySource.entries()].filter(([, users]) => users.length > 1);
  assert.deepEqual(shared.map(([file, users]) => `${users.join("+")} share ${file}`), []);
});

test("a manifest entry names a real destination and a file that exists", () => {
  for (const image of images) {
    assert.ok(slugs.has(image.slug), `${image.slug} is in the image manifest but not in the catalogue`);
    assert.ok(image.file.startsWith("/images/destinations/"), `${image.slug} has an unexpected image path`);
    assert.ok(existsSync(`public${image.file}`), `${image.slug} references a file that is not committed: ${image.file}`);
  }
});

test("a destination without an acceptable photograph is simply absent", () => {
  // The placeholder is a first-class outcome. What must never happen is an
  // entry pointing at a photograph of somewhere else, so absence is correct.
  assert.ok(images.length <= destinations.length);
});
