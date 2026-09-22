import test from "node:test";
import assert from "node:assert/strict";
import batch from "../data-config/sources/destination-candidates-batch-4.json";
import live from "../data-config/sources/destinations.json";
import { DICT } from "../lib/i18n/dict";
import { locales } from "../lib/i18n/config";

const cell = (lat:number,lon:number) => `${Math.round(lat / .1)}:${Math.round(lon / .1)}`;

test("batch four contains exactly twenty distinct planning-only destinations", () => {
  assert.equal(batch.status, "planning-only");
  assert.equal(batch.candidates.length, 20);
  assert.equal(new Set(batch.candidates.map((candidate) => candidate.id)).size, 20);
  assert.equal(new Set(batch.candidates.map((candidate) => candidate.continent)).size, 6);
});

test("batch four coordinates, time zones and taxonomy are publishable", () => {
  const missing:string[] = [];
  for (const candidate of batch.candidates) {
    assert.match(candidate.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(candidate.candidateCentroid.lat >= -90 && candidate.candidateCentroid.lat <= 90);
    assert.ok(candidate.candidateCentroid.lon >= -180 && candidate.candidateCentroid.lon <= 180);
    assert.doesNotThrow(() => new Intl.DateTimeFormat("en", {timeZone:candidate.timezone}));
    const published = live.find((destination) => destination.id === candidate.id);
    if (published) assert.deepEqual(published.coordinates, candidate.candidateCentroid);
    for (const locale of locales) {
      const taxonomy = DICT[locale].taxonomy;
      if ((taxonomy.continents as Record<string,string>)[candidate.continent] === undefined) missing.push(`${locale}.continents.${candidate.continent}`);
      if ((taxonomy.regions as Record<string,string>)[candidate.region] === undefined) missing.push(`${locale}.regions.${candidate.region}`);
      for (const tag of candidate.tags) if ((taxonomy.tags as Record<string,string>)[tag] === undefined) missing.push(`${locale}.tags.${tag}`);
    }
  }
  assert.deepEqual([...new Set(missing)], []);
});

test("batch four does not alias another destination's model cell", () => {
  const owners = new Map(live.map((destination) => [cell(destination.coordinates.lat,destination.coordinates.lon),destination.id]));
  const collisions:string[] = [];
  for (const candidate of batch.candidates) {
    const key = cell(candidate.candidateCentroid.lat,candidate.candidateCentroid.lon);
    const owner = owners.get(key);
    if (owner && owner !== candidate.id) collisions.push(`${candidate.id}:${owner}`);
    owners.set(key,candidate.id);
  }
  assert.deepEqual(collisions, []);
});
