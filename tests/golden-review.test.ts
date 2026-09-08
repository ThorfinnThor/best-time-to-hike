import test from "node:test";
import assert from "node:assert/strict";
import { reviewGoldenCases, type GoldenCase } from "../scripts/lib/golden-review";

function fixture() {
  const cases: GoldenCase[] = Array.from({ length: 30 }, (_, index) => ({
    slug: `destination-${index}`, expectedMonths: [6, 7, 8],
    approvedBy: "reviewer", approvedAt: "2026-09-07",
  }));
  const destinations: Array<{slug:string;bestMonths:number[];recommendationHoldReason?:string}> =
    cases.map((item) => ({ slug: item.slug, bestMonths: [6, 7, 8] }));
  return { golden: { status: "APPROVED", cases }, destinations };
}

test("all independent reference cases may agree without requiring an artificial failure", () => {
  const { golden, destinations } = fixture();
  assert.equal(reviewGoldenCases(golden, destinations).passed, true);
});

test("signed labels cannot conceal a new month mismatch or missing destination", () => {
  const { golden, destinations } = fixture();
  destinations[0].bestMonths = [12];
  let review = reviewGoldenCases(golden, destinations);
  assert.equal(review.passed, false);
  assert.ok(review.cases[0].errors.includes("unaccepted-deviation"));
  destinations.shift();
  review = reviewGoldenCases(golden, destinations);
  assert.ok(review.cases[0].errors.includes("missing-destination"));
});

test("accepted deviations cover only the reviewed set of months", () => {
  const { golden, destinations } = fixture();
  golden.cases[0].acceptedDeviation = {
    reason: "Reviewed regional season differs from the representative model cell; retain the independent label pending resolution.",
    recordedBy: "reviewer", recordedAt: "2026-09-07", engineMonths: [11, 12],
  };
  destinations[0].bestMonths = [12, 11];
  assert.equal(reviewGoldenCases(golden, destinations).passed, true);
  destinations[0].bestMonths = [10, 11];
  assert.equal(reviewGoldenCases(golden, destinations).passed, false);
});

test("duplicate cases cannot satisfy the thirty-destination minimum", () => {
  const { golden, destinations } = fixture();
  golden.cases[1] = { ...golden.cases[0] };
  assert.equal(reviewGoldenCases(golden, destinations).passed, false);
});

test("a scientific review hold quarantines the engine answer without rewriting the signed label", () => {
  const { golden, destinations } = fixture();
  destinations[0] = { ...destinations[0], bestMonths: [], recommendationHoldReason: "precipitation-validation" };
  const review = reviewGoldenCases(golden, destinations);
  assert.equal(review.passed, true);
  assert.equal(review.reviewedCaseCount, 29);
  assert.deepEqual(review.excludedForScientificReview, ["destination-0"]);
  assert.deepEqual(review.cases[0].expectedMonths, [6, 7, 8]);
  assert.deepEqual(review.cases[0].errors, []);
});
