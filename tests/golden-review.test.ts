import test from "node:test";
import assert from "node:assert/strict";
import { reviewGoldenCases, reviewGoldenCasesForPeriod, type GoldenCase } from "../scripts/lib/golden-review";

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

test("a signed period review changes the engine exception without rewriting the independent label", () => {
  const { golden, destinations } = fixture();
  golden.cases[0].acceptedDeviation = {
    reason: "The current production answer has a reviewed mismatch that stays valid until the period migration is published.",
    recordedBy: "reviewer", recordedAt: "2026-09-07", engineMonths: [5, 10],
  };
  golden.cases[0].historicalPeriodApprovals = [{
    startYear: 1991,
    endYear: 2025,
    approvedBy: "ThorfinnThor",
    approvedAt: "2026-09-16T21:02:07Z",
    engineMonths: [6, 7, 8],
    acceptedDeviation: null,
  }];
  const review = reviewGoldenCasesForPeriod(golden, destinations, {startYear: 1991, endYear: 2025});
  assert.equal(review.passed, true);
  assert.deepEqual(review.cases[0].expectedMonths, [6, 7, 8]);
  assert.equal(review.cases[0].acceptedDeviation, false);

  destinations[0].bestMonths = [6, 7, 9];
  const stale = reviewGoldenCasesForPeriod(golden, destinations, {startYear: 1991, endYear: 2025});
  assert.equal(stale.passed, false);
  assert.ok(stale.cases[0].errors.includes("stale-period-approval"));
});
