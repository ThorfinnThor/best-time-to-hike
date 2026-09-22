import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { areaCatalogue, MINIMUM_DESTINATIONS } from "../lib/seo/areas";
import { getAllDestinations, getComparisonIndex, getRanking } from "../lib/data/load";
import { loadGoldenCases } from "../scripts/lib/golden-cases";
import { reviewGoldenCasesForPeriod } from "../scripts/lib/golden-review";
import pageDefinitions from "../data-config/seo/page-definitions.json";
import destinationScience from "../data-config/seo/destination-indexability-science-v1.json";
import { pageSeo } from "../lib/seo/page-seo";

type Strategy = {
  status: string;
  productionEffect: string;
  objective: {minimumHighQualityUrls: number; maximumHighQualityUrls: number; plannedUrls: number; localeCount: number};
  families: {
    core: {urlsPerLocale: number};
    globalMonthlyRankings: {urlsPerLocale: number};
    areas: {urlsPerLocale: number; minimumRecommendableDestinations: number; selected: string[]};
    themeMonthlyRankings: {urlsPerLocale: number; selected: string[]; minimumResults: number; maximumFullListJaccardAgainstGlobal: number; excluded: Array<{theme: string}>};
    comparisons: {urlsPerLocale: number; selected: string[]};
    destinations: {urlsPerLocale: number; selected: string[]; fallback: string[]};
  };
  alwaysNoindex: string[];
  rollout: Array<{stage: number; name: string; cumulativeUrls: number}>;
};

const strategy = JSON.parse(readFileSync("data-config/seo/indexability-strategy-v1.json", "utf8")) as Strategy;
const unique = <T>(values: T[]) => new Set(values).size === values.length;
const jaccard = (a: string[], b: string[]) => {
  const left = new Set(a);
  const right = new Set(b);
  const intersection = [...left].filter((item) => right.has(item)).length;
  return intersection / new Set([...left, ...right]).size;
};

test("the quality-first strategy has a bounded, internally consistent 200-URL plan", () => {
  assert.equal(strategy.status, "FULL_200_PLAN_SCIENTIFICALLY_CLEARED_PENDING_PRODUCTION");
  assert.equal(strategy.productionEffect, "all-four-stages-active-only-when-dataset-is-production");
  assert.equal(strategy.objective.localeCount, 2);
  const perLocale = strategy.families.core.urlsPerLocale
    + strategy.families.globalMonthlyRankings.urlsPerLocale
    + strategy.families.areas.urlsPerLocale
    + strategy.families.themeMonthlyRankings.urlsPerLocale
    + strategy.families.comparisons.urlsPerLocale
    + strategy.families.destinations.urlsPerLocale;
  assert.equal(perLocale * strategy.objective.localeCount, strategy.objective.plannedUrls);
  assert.ok(strategy.objective.plannedUrls >= strategy.objective.minimumHighQualityUrls);
  assert.ok(strategy.objective.plannedUrls <= strategy.objective.maximumHighQualityUrls);
  assert.deepEqual(strategy.rollout.map((item) => item.cumulativeUrls), [88, 136, 142, 200]);
});

test("all eligible area guides are explicitly selected and have enough destinations", () => {
  const areas = areaCatalogue();
  assert.ok(unique(strategy.families.areas.selected));
  assert.deepEqual([...strategy.families.areas.selected].sort(), areas.map((area) => area.id).sort());
  assert.equal(strategy.families.areas.minimumRecommendableDestinations, MINIMUM_DESTINATIONS);
  assert.equal(strategy.families.areas.urlsPerLocale, areas.length);
  assert.ok(areas.every((area) => area.destinations.length >= MINIMUM_DESTINATIONS));
});

test("warm and low-rain are distinct enough; snow-free is not", () => {
  const theme = strategy.families.themeMonthlyRankings;
  assert.deepEqual(theme.selected, ["warm", "low-rain"]);
  assert.ok(theme.excluded.some((entry) => entry.theme === "snow-free"));
  for (let month = 1; month <= 12; month += 1) {
    const global = getRanking(month, "all").entries.map((entry) => entry.slug);
    for (const selected of theme.selected as Array<"warm" | "low-rain">) {
      const entries = getRanking(month, selected).entries.map((entry) => entry.slug);
      assert.ok(entries.length >= theme.minimumResults, `${selected}/${month} has only ${entries.length} results`);
      assert.ok(jaccard(entries, global) <= theme.maximumFullListJaccardAgainstGlobal,
        `${selected}/${month} is too similar to the global ranking`);
    }
    const snowFree = getRanking(month, "snow-free").entries.slice(0, 12).map((entry) => entry.slug);
    assert.equal(jaccard(snowFree, global.slice(0, 12)), 1,
      `snow-free/${month} no longer duplicates the global top 12; reconsider its exclusion deliberately`);
  }
});

test("the three enriched comparison candidates are explicitly enabled", () => {
  const comparisons = new Map(getComparisonIndex().map((comparison) => [comparison.slug, comparison]));
  const definitions = new Map(pageDefinitions.comparisons.map((comparison) => [comparison.slug, comparison]));
  assert.ok(unique(strategy.families.comparisons.selected));
  for (const slug of strategy.families.comparisons.selected) {
    assert.ok(comparisons.has(slug), `${slug} is missing`);
    assert.equal(definitions.get(slug)?.indexable, true, `${slug} did not retain its completed content gate`);
    assert.equal(comparisons.get(slug)?.indexable, false, `${slug} bypassed the provisional dataset release gate`);
  }
});

test("destination candidates retain low climate confidence while their restricted pages clear indexing review", () => {
  const destinations = getAllDestinations();
  const bySlug = new Map(destinations.map((destination) => [destination.slug, destination]));
  const golden = reviewGoldenCasesForPeriod(loadGoldenCases(), destinations, {startYear: 1991, endYear: 2025});
  const goldenBySlug = new Map(golden.cases.map((item) => [item.slug, item]));
  const selected = strategy.families.destinations.selected;
  assert.equal(selected.length, 29);
  assert.ok(unique(selected));
  assert.ok(unique([...selected, ...strategy.families.destinations.fallback]));
  assert.deepEqual(destinationScience.approvedDestinations, selected);
  for (const slug of selected) {
    const destination = bySlug.get(slug);
    const review = goldenBySlug.get(slug);
    assert.ok(destination, `${slug} is missing`);
    assert.equal(destination?.recommendationEligible, true, `${slug} is not recommendation-eligible`);
    assert.equal(destination?.recommendationHoldReason, undefined, `${slug} has a recommendation hold`);
    assert.ok((destination?.bestMonths.length ?? 0) >= 3, `${slug} has no useful season answer`);
    assert.equal(review?.verdict, "agrees", `${slug} does not agree with its independent Golden Case`);
    assert.equal(review?.excludedForScientificReview, false, `${slug} is excluded from scientific review`);
    assert.deepEqual(review?.errors, [], `${slug} has Golden Case errors`);
    assert.ok(Math.max(...destination!.months.map((month) => month.confidenceScore ?? 0)) <= 64,
      `${slug} is no longer covered by the provisional confidence boundary; review it before changing the strategy`);
    for (const locale of ["en", "de"] as const) {
      const seo = pageSeo({kind: "destination", slug}, locale);
      assert.deepEqual(seo.reasons, ["non-production-dataset"],
        `${slug}/${locale} has an unresolved indexability reason besides the dataset release gate`);
    }
  }
});

test("the destination science clearance is reproduced from the final audit", () => {
  // The report is intentionally generated and ignored. Rebuild it here so a
  // clean checkout proves the decision from versioned evidence instead of
  // accidentally trusting a developer's stale local report.
  execFileSync(process.execPath, ["--import", "tsx", "scripts/validate/calibrate-season-alignment.ts"], {stdio: "pipe"});
  execFileSync(process.execPath, ["--import", "tsx", "scripts/validate/science-audit.ts"], {stdio: "pipe"});
  type Spatial = {destinationId: string; centroidToCellKm: number; sourceObservationCountPassed: boolean; internalCoordinateChainPassed: boolean; independentRouteEvidence: boolean; claimScope: string; errors: string[]};
  type Diagnostic = {destinationId: string; flags: string[]};
  const audit = JSON.parse(readFileSync("generated/reports/science-audit.json", "utf8")) as {
    status: string;
    scientificEvidenceGatePassed: boolean;
    historicalPeriodAudit: {passed: boolean; startYear: number; endYear: number};
    spatialAudit: {releaseClass: string; destinations: Spatial[]};
    independentClimateDiagnostic: {comparisons: Diagnostic[]};
  };
  assert.equal(destinationScience.status, "APPROVED_FOR_INDEXABILITY_UNDER_SELECTED_CELL_CLAIM");
  assert.equal(audit.status, destinationScience.evidence.scienceAuditStatus);
  assert.equal(audit.scientificEvidenceGatePassed, true);
  assert.equal(audit.historicalPeriodAudit.passed, true);
  assert.deepEqual(
    {startYear: audit.historicalPeriodAudit.startYear, endYear: audit.historicalPeriodAudit.endYear},
    destinationScience.evidence.historicalPeriod,
  );
  assert.equal(audit.spatialAudit.releaseClass, destinationScience.evidence.releaseClass);
  const spatial = new Map(audit.spatialAudit.destinations.map((item) => [item.destinationId, item]));
  const diagnostics = new Map(audit.independentClimateDiagnostic.comparisons.map((item) => [item.destinationId, item]));
  for (const slug of destinationScience.approvedDestinations) {
    const cell = spatial.get(slug);
    assert.ok(cell, `${slug} is absent from the spatial audit`);
    assert.equal(cell?.sourceObservationCountPassed, true, `${slug} has incomplete source observations`);
    assert.equal(cell?.internalCoordinateChainPassed, true, `${slug} has a broken coordinate chain`);
    assert.deepEqual(cell?.errors, [], `${slug} has spatial audit errors`);
    assert.ok((cell?.centroidToCellKm ?? Infinity) <= 20 || cell?.independentRouteEvidence === true,
      `${slug} exceeds the distance rule without independent route evidence`);
    assert.ok(["selected-model-cell-only", "named-route-supported-cell"].includes(cell?.claimScope ?? ""),
      `${slug} has an unsupported claim scope`);
    assert.deepEqual(diagnostics.get(slug)?.flags, [], `${slug} has an independent diagnostic review flag`);
  }
  assert.equal(spatial.get("denali")?.independentRouteEvidence, true);
  assert.ok((spatial.get("denali")?.centroidToCellKm ?? 0) > 20);
});

test("thin and interactive route families can never fill the URL target", () => {
  assert.deepEqual(strategy.alwaysNoindex, [
    "destinationMonth", "finder", "finderQueryState", "compareTool", "rankingIndex",
    "themeIndex", "privacy", "imprint", "credits",
  ]);
});
