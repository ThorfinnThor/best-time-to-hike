import test from "node:test";
import assert from "node:assert/strict";
import batch2 from "../data-config/sources/destination-candidates-batch-2.json";
import live from "../data-config/sources/destinations.json";
import { DICT } from "../lib/i18n/dict";
import { locales } from "../lib/i18n/config";

const candidates = batch2.candidates;
const liveIds = new Set(live.map((destination) => destination.id));

/** The ERA5-Land model grid is 0.1 degrees. Two points in one cell get identical climate. */
const cell = (lat: number, lon: number) => `${Math.round(lat / 0.1)}:${Math.round(lon / 0.1)}`;

test("the batch stays planning-only until it is prepared", () => {
  assert.equal(batch2.status, "planning-only");
  assert.ok(candidates.length > 0);
});

test("candidate ids are unique, and an activated candidate still describes the same place", () => {
  const ids = candidates.map((candidate) => candidate.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate id inside the batch");
  // Activation is the expected end state: once a candidate is published, the
  // candidate file and the destination master describe the same destination.
  // What must not happen is the two drifting apart.
  for (const candidate of candidates) {
    const published = live.find((destination) => destination.id === candidate.id);
    if (!published) continue;
    assert.equal(published.coordinates.lat, candidate.candidateCentroid.lat, `${candidate.id}: published latitude drifted from the candidate file`);
    assert.equal(published.coordinates.lon, candidate.candidateCentroid.lon, `${candidate.id}: published longitude drifted from the candidate file`);
  }
});

test("every candidate carries a resolvable IANA time zone", () => {
  const bad = candidates.filter((candidate) => {
    try { new Intl.DateTimeFormat("en-US", {timeZone: candidate.timezone}); return false; }
    catch { return true; }
  });
  assert.deepEqual(bad.map((candidate) => `${candidate.id}:${candidate.timezone}`), []);
});

test("every candidate centroid is a plausible coordinate", () => {
  for (const candidate of candidates) {
    const {lat, lon} = candidate.candidateCentroid;
    assert.ok(Number.isFinite(lat) && lat >= -90 && lat <= 90, `${candidate.id}: latitude out of range`);
    assert.ok(Number.isFinite(lon) && lon >= -180 && lon <= 180, `${candidate.id}: longitude out of range`);
    assert.ok(lat !== 0 || lon !== 0, `${candidate.id}: null island`);
  }
});

test("no two distinct destinations share an ERA5-Land grid cell", () => {
  // Compare places, not files: an activated candidate appears in both the
  // candidate file and the destination master, and that is one destination.
  const byId = new Map<string, {lat: number; lon: number}>();
  for (const destination of live) byId.set(destination.id, destination.coordinates);
  for (const candidate of candidates) if (!byId.has(candidate.id)) byId.set(candidate.id, candidate.candidateCentroid);
  const taken = new Map<string, string>();
  const collisions: string[] = [];
  for (const [id, coordinates] of byId) {
    const key = cell(coordinates.lat, coordinates.lon);
    const owner = taken.get(key);
    if (owner) collisions.push(`${id} shares a cell with ${owner}`);
    else taken.set(key, id);
  }
  assert.deepEqual(collisions, [], "two destinations in one grid cell would publish identical climate under different names");
});

test("every candidate taxonomy id has a label in both locales", () => {
  const missing: string[] = [];
  for (const locale of locales) {
    const taxonomy = DICT[locale].taxonomy;
    for (const candidate of candidates) {
      if ((taxonomy.continents as Record<string, string>)[candidate.continent] === undefined) missing.push(`${locale}.continents.${candidate.continent}`);
      if ((taxonomy.regions as Record<string, string>)[candidate.region] === undefined) missing.push(`${locale}.regions.${candidate.region}`);
      for (const tag of candidate.tags) if ((taxonomy.tags as Record<string, string>)[tag] === undefined) missing.push(`${locale}.tags.${tag}`);
    }
  }
  assert.deepEqual([...new Set(missing)], [], "a candidate would render an untranslated filter option");
});

test("live destinations also have labels, including the withheld ones", () => {
  // The published-search guard cannot see withheld destinations, so patagonia
  // went unlabelled until this batch surfaced it.
  const missing: string[] = [];
  for (const locale of locales) {
    const taxonomy = DICT[locale].taxonomy;
    for (const destination of live) {
      if ((taxonomy.regions as Record<string, string>)[destination.region] === undefined) missing.push(`${locale}.regions.${destination.region}`);
    }
  }
  assert.deepEqual([...new Set(missing)], []);
});
