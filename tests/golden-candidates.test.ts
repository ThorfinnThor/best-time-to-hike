import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { loadGoldenCases } from "../scripts/lib/golden-cases";

const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, "utf8"));
const registry = readJson<any>("data-config/methodology/golden-case-candidates-v1.json");
const approved = readJson<any>("tests/fixtures/known-hiking-seasons.json");
const destinationFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => entry.isDirectory() ? destinationFiles(join(directory, entry.name)) : [join(directory, entry.name)]);
const destinations = destinationFiles("public/data/hiking/destinations")
  .map((path) => readJson<any>(path));
const destinationBySlug = new Map(destinations.map((destination) => [destination.slug, destination]));

test("the whole Golden candidate batch is signed and promoted without filtering", () => {
  assert.equal(registry.status, "APPROVED");
  assert.equal(registry.productionEffect, "included-in-signed-golden-set");
  assert.equal(registry.approvalDecision.approvedBy, "ThorfinnThor");
  assert.ok(Number.isFinite(Date.parse(registry.approvalDecision.approvedAt)));
  assert.match(registry.selectionRule, /whole/i);
  assert.match(registry.selectionRule, /not remove/i);
  assert.equal(registry.candidates.length, 10);
  assert.equal(new Set(registry.candidates.map((candidate: any) => candidate.slug)).size, 10);
  const approvedSlugs = new Set(approved.cases.map((candidate: any) => candidate.slug));
  for (const candidate of registry.candidates) {
    assert.ok(!approvedSlugs.has(candidate.slug), `${candidate.slug} is already an approved Golden case`);
    const destination = destinationBySlug.get(candidate.slug);
    assert.ok(destination, `${candidate.slug} is not a published destination`);
    assert.equal(destination.recommendationHoldReason, undefined, `${candidate.slug} is currently held`);
    assert.ok(candidate.expectedMonths.length > 0);
    assert.equal(new Set(candidate.expectedMonths).size, candidate.expectedMonths.length);
    assert.ok(candidate.expectedMonths.every((month: number) => Number.isInteger(month) && month >= 1 && month <= 12));
    assert.ok(candidate.basis.length > 80);
    assert.ok(["high", "medium"].includes(candidate.confidence));
    assert.ok(candidate.source.publisher.length > 3);
    assert.ok(candidate.source.title.length > 3);
    assert.match(candidate.source.url, /^https:\/\//);
    assert.ok(Number.isFinite(Date.parse(candidate.source.reviewedAt)));
    assert.equal(candidate.approvedBy, "ThorfinnThor");
    assert.equal(candidate.approvedAt, registry.approvalDecision.approvedAt);
  }
  const combined = loadGoldenCases();
  assert.equal(combined.status, "APPROVED");
  assert.equal(combined.cases.length, approved.cases.length + registry.candidates.length);
});
