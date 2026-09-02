import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

interface Candidate {
  id: string;
  region: string;
  timezone: string;
  candidateCentroid: { lat: number; lon: number };
}

const plan = JSON.parse(readFileSync("data-config/sources/destination-candidates.json", "utf8")) as {
  status: string;
  commonDataRequirements: { sampling: string };
  regionRequirements: Record<string, string>;
  plannedBatches: Array<{targetDestinationCount:number;add:string[];gate:string}>;
  candidates: Candidate[];
};
const active = JSON.parse(readFileSync("data-config/sources/destinations.json", "utf8")) as Array<{id:string}>;

test("destination intake remains a structurally valid planning-only set", () => {
  assert.equal(plan.status, "planning-only");
  assert.equal(plan.candidates.length, 45);
  assert.equal(new Set(plan.candidates.map((candidate) => candidate.id)).size, 45);
  assert.equal(plan.candidates.some((candidate) => active.some((destination) => destination.id === candidate.id)), false);
  assert.match(plan.commonDataRequirements.sampling, /1-3 valid points per band/);

  assert.deepEqual(plan.plannedBatches.map((batch) => batch.targetDestinationCount), [20, 50]);
  assert.deepEqual(plan.plannedBatches.map((batch) => batch.add.length), [15, 30]);
  const plannedIds = plan.plannedBatches.flatMap((batch) => batch.add);
  assert.equal(new Set(plannedIds).size, 45);
  assert.deepEqual(
    [...plannedIds].sort(),
    plan.candidates.map((candidate) => candidate.id).sort()
  );
  assert.ok(plan.plannedBatches.every((batch) => batch.gate.length > 40));

  const usedRegions = new Set(plan.candidates.map((candidate) => candidate.region));
  assert.deepEqual([...usedRegions].sort(), Object.keys(plan.regionRequirements).sort());
  for (const candidate of plan.candidates) {
    assert.match(candidate.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(candidate.candidateCentroid.lat >= -90 && candidate.candidateCentroid.lat <= 90);
    assert.ok(candidate.candidateCentroid.lon >= -180 && candidate.candidateCentroid.lon <= 180);
    assert.doesNotThrow(() => new Intl.DateTimeFormat("en", { timeZone: candidate.timezone }));
  }
});
