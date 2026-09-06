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
  /**
   * Set when the label is signed and the engine disagrees anyway. It says the
   * operator looked, decided the label is right and the engine is not, and
   * chose to record the gap rather than resolve it now. A deviation keeps the
   * disagreement in the report where it can be argued with; widening the label
   * would have hidden it.
   */
  acceptedDeviation?: {reason: string; recordedBy: string; recordedAt: string; engineMonths: number[]};
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

test("a signed label carries an approver and a date, and APPROVED means all of them", () => {
  for (const item of golden.cases) {
    if (!item.approvedBy && !item.approvedAt) continue;
    assert.ok(item.approvedBy, `${item.slug} has an approval date but no approver`);
    assert.ok(item.approvedAt && Number.isFinite(new Date(item.approvedAt).getTime()), `${item.slug} has an approver but no date`);
  }
  if (!approved) return;
  const unsigned = golden.cases.filter((item) => !item.approvedBy).map((item) => item.slug);
  assert.deepEqual(unsigned, [], `status is APPROVED while these are unsigned: ${unsigned.join(", ")}`);
});

test("the signed labels are not only the ones the engine already agrees with", () => {
  // A set filtered to the passing cases cannot fail, and a check that cannot
  // fail is decoration. This does not forbid the state — signing the easy ones
  // first is reasonable — it forbids finishing there and calling it approved.
  const signed = golden.cases.filter((item) => item.approvedBy);
  if (!approved || !signed.length) return;
  const disagreeing = signed.filter((item) => compare(item).verdict !== "agrees");
  assert.ok(disagreeing.length > 0,
    "every signed label agrees with the engine, so the golden set is a mirror of it; sign at least one case where they differ, having decided which of the two is wrong");
});

test("the engine's best months fall inside the labelled season", {skip: !approved && "labels are not approved yet; see the report below"}, () => {
  const failures = golden.cases
    .map((item) => ({item, result: compare(item)}))
    .filter(({item, result}) => result.verdict !== "agrees" && !item.acceptedDeviation)
    .map(({item, result}) => `${item.slug}: labelled ${item.label} (${item.expectedMonths.join(",")}), engine says ${result.best.join(",") || "no month"}`);
  assert.deepEqual(failures, [], `\n  ${failures.join("\n  ")}\n`);
});

test("an accepted deviation still describes the disagreement it was written for", () => {
  // A deviation recorded against one answer must not go on quietly covering a
  // different one. If the engine moves, the note is re-read or it is gone.
  for (const item of golden.cases) {
    const deviation = item.acceptedDeviation;
    if (!deviation) continue;
    assert.ok(item.approvedBy, `${item.slug} records a deviation but is not signed`);
    assert.ok(deviation.reason.length > 60, `${item.slug}: a deviation needs a reason someone can disagree with`);
    assert.deepEqual(compare(item).best, deviation.engineMonths,
      `${item.slug}: the engine now says ${compare(item).best.join(",") || "no month"}, not ${deviation.engineMonths.join(",") || "no month"}. Re-read the deviation and update or remove it.`);
  }
});

test("deviations stay the exception, not the way the suite passes", () => {
  if (!approved) return;
  const deviations = golden.cases.filter((item) => item.acceptedDeviation).length;
  assert.ok(deviations <= golden.cases.length / 4,
    `${deviations} of ${golden.cases.length} labels are accepted deviations. Past a quarter the set has stopped checking the engine and started excusing it.`);
});

test("report: how the engine currently compares with the labels", () => {
  const tally: Record<string, number> = {};
  const lines: string[] = [];
  for (const item of golden.cases) {
    const result = compare(item);
    tally[result.verdict] = (tally[result.verdict] ?? 0) + 1;
    if (result.verdict !== "agrees") {
      const flag = item.acceptedDeviation ? " [accepted]" : "";
      lines.push(`  ${result.verdict.padEnd(10)} ${item.slug.padEnd(22)} labelled ${item.expectedMonths.join(",").padEnd(16)} engine ${result.best.join(",") || "none"}${flag}`);
    }
  }
  console.log(`\ngolden seasons (${golden.status}): ${Object.entries(tally).map(([k, v]) => `${v} ${k}`).join(", ")}`);
  if (lines.length) console.log(lines.join("\n"));
  assert.ok(golden.cases.length > 0);
});
