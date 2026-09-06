import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { getDestination } from "../lib/data/load";

/**
 * The engine checked against seasons a person would name.
 *
 * Every other test here checks the engine against itself: the scorer against
 * its own curves, the export against its own schema. None of them can tell you
 * that the answer is wrong, only that it is consistent. This file is the one
 * place an outside fact gets a vote.
 *
 * The labels are approved by an operator, not by this file and not by whoever
 * is editing the code. While `status` is anything but APPROVED the comparison
 * runs as a report and does not fail the build — an unapproved label has no
 * standing to block anything. Once approved it becomes a gate.
 *
 * If a case fails, the fix is in the scoring or in the data. Editing a label so
 * the test passes converts the only independent check in the suite into a
 * mirror of whatever the engine currently believes.
 */
interface GoldenCase {
  slug: string;
  name: string;
  expectedMonths: number[];
  label: string;
  basis: string;
  confidence: "high" | "medium";
  approvedBy: string | null;
  approvedAt: string | null;
}

const golden = JSON.parse(readFileSync("tests/fixtures/known-hiking-seasons.json", "utf8")) as
  {status: string; cases: GoldenCase[]};
const approved = golden.status === "APPROVED";

interface Comparison { verdict: "agrees" | "partly" | "disagrees" | "no answer"; best: number[]; outside: number[] }

function compare(item: GoldenCase): Comparison {
  const destination = getDestination(item.slug);
  if (!destination) return {verdict: "no answer", best: [], outside: []};
  const best = destination.bestMonths;
  if (!best.length) return {verdict: "no answer", best, outside: []};
  const outside = best.filter((month) => !item.expectedMonths.includes(month));
  const inside = best.filter((month) => item.expectedMonths.includes(month));
  return {verdict: outside.length === 0 ? "agrees" : inside.length ? "partly" : "disagrees", best, outside};
}

test("the golden set is large enough and every case names a real destination", () => {
  assert.ok(golden.cases.length >= 30, `${golden.cases.length} cases; the release gate needs 30`);
  for (const item of golden.cases) {
    assert.ok(getDestination(item.slug), `${item.slug} is labelled but not in the catalogue`);
    assert.ok(item.expectedMonths.length > 0 && item.expectedMonths.every((m) => m >= 1 && m <= 12),
      `${item.slug} has an impossible month`);
    assert.ok(item.basis.length > 40, `${item.slug} needs a basis someone can argue with`);
  }
});

test("approved labels carry an approver and a date", () => {
  if (!approved) return;
  for (const item of golden.cases) {
    assert.ok(item.approvedBy, `${item.slug} has no approver`);
    assert.ok(item.approvedAt && Number.isFinite(new Date(item.approvedAt).getTime()), `${item.slug} has no approval date`);
  }
});

test("the engine's best months fall inside the labelled season", {skip: !approved && "labels are not approved yet; see the report below"}, () => {
  const failures = golden.cases
    .map((item) => ({item, result: compare(item)}))
    .filter(({result}) => result.verdict !== "agrees")
    .map(({item, result}) => `${item.slug}: labelled ${item.label} (${item.expectedMonths.join(",")}), engine says ${result.best.join(",") || "no month"}`);
  assert.deepEqual(failures, [], `\n  ${failures.join("\n  ")}\n`);
});

test("report: how the engine currently compares with the labels", () => {
  const tally: Record<string, number> = {};
  const lines: string[] = [];
  for (const item of golden.cases) {
    const result = compare(item);
    tally[result.verdict] = (tally[result.verdict] ?? 0) + 1;
    if (result.verdict !== "agrees") {
      lines.push(`  ${result.verdict.padEnd(10)} ${item.slug.padEnd(22)} labelled ${item.expectedMonths.join(",").padEnd(16)} engine ${result.best.join(",") || "none"}`);
    }
  }
  console.log(`\ngolden seasons (${golden.status}): ${Object.entries(tally).map(([k, v]) => `${v} ${k}`).join(", ")}`);
  if (lines.length) console.log(lines.join("\n"));
  assert.ok(golden.cases.length > 0);
});
