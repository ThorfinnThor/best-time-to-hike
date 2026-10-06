import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import type { PublicDestination } from "../../lib/data/types";
import { robotsDisallowEverything, robotsForDataset, siteMayBeIndexed } from "../../lib/seo/crawl-policy";
import { routeCatalog } from "../../lib/seo/route-catalog";
import { pageSeo } from "../../lib/seo/page-seo";
import { resolvePageId } from "../../lib/i18n/resolve";
import { readJson, ROOT, sha256, writeJson } from "../lib/io";
import { reviewGoldenCasesForPeriod, type GoldenCase } from "../lib/golden-review";

const manifest = readJson<any>("public/data/hiking/manifest.json");
const sourceSemantics = readJson<any>("data-config/methodology/source-semantics.json");
const releaseApprovals = readJson<any>("data-config/methodology/release-approvals.json");
const golden = readJson<{status:string;cases:GoldenCase[]}>("tests/fixtures/known-hiking-seasons.json");
const configFiles = [
  "data-config/methodology/climate-aggregation-v1.json",
  "data-config/methodology/confidence-v1.json",
  "data-config/methodology/data-quality-v1.json",
  "data-config/methodology/data-quality-spatial-scope-v1.json",
  "data-config/methodology/historical-period-1991-2025-review-v1.json",
  "data-config/methodology/historical-period-1991-2025-v1.json",
  "data-config/methodology/independent-climate-review-holds-v1.json",
  "data-config/methodology/observation-validity-v1.json",
  "data-config/methodology/rounding-v1.json",
  "data-config/methodology/release-approvals.json",
  "data-config/methodology/recommendation-eligibility-v1.json",
  "data-config/methodology/sampling-v1.json",
  "data-config/methodology/science-audit-v1.json",
  "data-config/methodology/scientific-release-profile-v1.json",
  "data-config/methodology/season-alignment-calibration-v1.json",
  "data-config/methodology/source-semantics.json",
  "data-config/scoring/curves.json",
  "data-config/scoring/weights.json",
  "data-config/seo/project-seo-config.json",
  "tests/fixtures/known-hiking-seasons.json"
];
const destinationRoot = join(ROOT, "public/data/hiking/destinations");
const destinationFiles = readdirSync(destinationRoot, { withFileTypes: true }).flatMap((country) => country.isDirectory()
  ? readdirSync(join(destinationRoot, country.name)).map((file) => join(destinationRoot, country.name, file))
  : []
);
const destinations = destinationFiles.map((file) => JSON.parse(readFileSync(file, "utf8")) as PublicDestination);
const dataQuality = readJson<{warningCount:number;warnings:unknown[]}>("generated/reports/data-quality.json");
const scienceAudit = readJson<{status:string;errors:unknown[]}>("generated/reports/science-audit-315.json");
const months = destinations.flatMap((destination) => destination.months);
const bands = months.flatMap((month) => month.bands);
const recommendationMonths = months.filter((month) => month.recommendationEligible);
const heldDestinations = destinations.filter((destination) => Boolean(destination.recommendationHoldReason));
const scores = months.flatMap((month) => month.overallScore === null ? [] : [month.overallScore]).sort((a, b) => a - b);
const completeness = bands.map((band) => band.dataCompleteness).sort((a, b) => a - b);
const samplingFiles = readdirSync(join(ROOT, "data-snapshots/sampling")).filter((file) => file.endsWith(".json"));
const samplingPoints = samplingFiles.flatMap((file) => {
  const snapshot = readJson<any>(`data-snapshots/sampling/${file}`);
  return Object.values(snapshot.bands as Record<string, any>).flatMap((band) => band.points);
});
const crawlerPolicy = robotsForDataset(manifest.datasetStatus, "https://example.invalid/sitemap.xml");
const indexedRoutes = routeCatalog().filter((route) => {
  const page = resolvePageId(route.locale, route.segments);
  return page !== null && pageSeo(page, route.locale).index;
});
const crawlLockLayers = {
  robotsDisallowAll: robotsDisallowEverything(crawlerPolicy),
  sitemapEmpty: !siteMayBeIndexed(manifest.datasetStatus),
  pageMetadataNoIndex: indexedRoutes.length === 0,
  rankingsNoIndex: manifest.rankingIds.every((id:string)=>readJson<any>(`public/data/hiking/rankings/${id}.json`).indexable===false),
  comparisonsNoIndex: readdirSync(join(ROOT,"public/data/hiking/comparisons")).filter((file)=>file!=="comparison-index.json").every((file)=>readJson<any>(`public/data/hiking/comparisons/${file}`).indexable===false),
};
const publicIndexingPolicyConsistent = siteMayBeIndexed(manifest.datasetStatus)
  ? !crawlLockLayers.robotsDisallowAll && !crawlLockLayers.sitemapEmpty && indexedRoutes.length > 0
  : Object.values(crawlLockLayers).every(Boolean);
const goldenReview = reviewGoldenCasesForPeriod(golden, destinations, {startYear: 1991, endYear: 2025});
const percentile = (values: number[], fraction: number) => values[Math.ceil(values.length * fraction) - 1];
const checks = {
  publicIndexingPolicyConsistent,
  realSourcesApproved: sourceSemantics.era5Land.approved === true,
  scientificEvidenceGatePassed: scienceAudit.status === "scientific-evidence-gate-passed-with-claim-restrictions"
    && scienceAudit.errors.length === 0,
  destinationMinimumMet: manifest.destinationCount >= 50,
  goldenMinimumMet: goldenReview.passed,
  publicManifestChecksummed: Object.keys(manifest.fileChecksums).length > 0,
  climateNormalExact: manifest.climateNormal.startYear === 1991 && manifest.climateNormal.endYear === 2025,
  releaseApprovals: Object.fromEntries(Object.entries(releaseApprovals.approvals).map(([key,value]:[string,any])=>[key,value.approved===true&&Boolean(value.approvedBy)&&Number.isFinite(new Date(value.approvedAt).getTime())]))
};
const approvalBlockers=Object.entries(checks.releaseApprovals).filter(([,approved])=>!approved).map(([key])=>`BLOCKED_APPROVAL_${key.replace(/([a-z])([A-Z])/g,"$1_$2").toUpperCase()}`);
const blockers = [
  ...(!checks.publicIndexingPolicyConsistent ? ["BLOCKED_PUBLIC_INDEXING_POLICY"] : []),
  ...(!checks.realSourcesApproved ? ["BLOCKED_SOURCE_SEMANTICS"] : []),
  ...(!checks.scientificEvidenceGatePassed ? ["BLOCKED_SCIENTIFIC_EVIDENCE"] : []),
  ...(!checks.destinationMinimumMet ? ["BLOCKED_DESTINATION_MINIMUM"] : []),
  ...(!checks.goldenMinimumMet ? ["BLOCKED_GOLDEN_LABEL"] : []),
  ...approvalBlockers
];
const report = {
  reportVersion: 1,
  datasetVersion: manifest.datasetVersion,
  generatedFromManifestAt: manifest.generatedAt,
  releaseStatus: blockers.length ? "blocked-for-production" : "production-gates-passed",
  blockers,
  checks,
  inventory: {
    destinations: destinations.length,
    destinationMonths: months.length,
    elevationBandMonths: bands.length,
    publicFiles: Object.keys(manifest.fileChecksums).length + 1,
    publicBytes: statSync(join(ROOT, "public/data/hiking/manifest.json")).size + manifest.totalBytes,
    goldenCases: golden.cases.length
  },
  goldenReview: {
    status: golden.status,
    ...goldenReview,
  },
  crawlLockLayers,
  publicIndexing: {
    enabled: siteMayBeIndexed(manifest.datasetStatus),
    indexedRouteCount: indexedRoutes.length,
    scientificProductionApprovalUnaffected: manifest.datasetStatus !== "production",
  },
  dataQuality: { warningCount: dataQuality.warningCount, warnings: dataQuality.warnings },
  recommendationPolicy: {
    eligibleMonths: recommendationMonths.length,
    ineligibleMonths: months.length - recommendationMonths.length,
    heldDestinations: heldDestinations.map((destination) => destination.slug).sort(),
    heldDestinationCounts: {
      persistentSnow: heldDestinations.filter((destination) => destination.recommendationHoldReason === "persistent-snow").length,
      precipitationValidation: heldDestinations.filter((destination) => destination.recommendationHoldReason === "precipitation-validation").length,
    },
    confidenceCappedMonths: 0,
    confidencePolicy: "numeric-public-confidence-retired",
    unvalidatedGridWindCaveatMonths: months.filter((month) => month.caveats.includes("unvalidated-grid-wind")).length
  },
  distributions: {
    overallScore: { min: scores[0], median: percentile(scores, 0.5), max: scores.at(-1) },
    bandCompleteness: { min: completeness[0], median: percentile(completeness, 0.5), max: completeness.at(-1) },
    elevationMismatchM: {
      max: Math.max(...samplingPoints.map((point:any) => point.elevationMismatchM)),
      blockedPointCount: samplingPoints.filter((point:any) => point.elevationMismatchM > 800).length
    }
  },
  methodologyChecksums: Object.fromEntries(configFiles.map((file) => [file, sha256(readFileSync(join(ROOT, file)))])),
  manifestChecksum: sha256(readFileSync(join(ROOT, "public/data/hiking/manifest.json"))),
  destinationFiles: destinationFiles.map((file) => relative(ROOT, file)).sort()
};
writeJson("generated/reports/release-report.json", report);
console.log(`Release report: ${report.releaseStatus}; ${blockers.length} production blocker(s); generated/reports/release-report.json`);
