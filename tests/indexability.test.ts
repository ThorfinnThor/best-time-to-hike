import test from "node:test";
import assert from "node:assert/strict";
import { evaluateIndexability } from "../lib/seo/indexability";
import { routeCatalog } from "../lib/seo/route-catalog";
import { resolvePageId } from "../lib/i18n/resolve";
import { pageSeo } from "../lib/seo/page-seo";
import { datasetMayBeIndexed, robotsDisallowEverything, robotsForDataset } from "../lib/seo/crawl-policy";
const complete={resultCount:5,dataCompleteness:.99,confidence:90,uniqueInsightCount:3,hasUniqueTitle:true,hasUniqueH1:true,hasCanonical:true,internalLinkCount:4,createsCannibalization:false,containsUnsupportedClaims:false,datasetStatus:"production" as const};
test("production quality page can be indexable",()=>assert.deepEqual(evaluateIndexability(complete),{indexable:true,reasons:[]}));
test("non-production content is always noindex",()=>{
  assert.deepEqual(evaluateIndexability({...complete,datasetStatus:"fixture"}),{indexable:false,reasons:["non-production-dataset"]});
  assert.deepEqual(evaluateIndexability({...complete,datasetStatus:"provisional"}),{indexable:false,reasons:["non-production-dataset"]});
});

test("the shared crawler policy locks every non-production dataset", () => {
  for (const status of ["fixture", "provisional"] as const) {
    assert.equal(datasetMayBeIndexed(status), false);
    assert.equal(robotsDisallowEverything(robotsForDataset(status, "https://example.test/sitemap.xml")), true);
  }
  assert.equal(datasetMayBeIndexed("production"), true);
  assert.equal(robotsDisallowEverything(robotsForDataset("production", "https://example.test/sitemap.xml")), false);
});

/**
 * The size and shape of the index, held to a number.
 *
 * The whole strategy is a few hundred pages that each answer a question with
 * substance, rather than a few thousand built from one template. That is easy
 * to state and easy to lose: one component gaining a paragraph, or one page
 * kind quietly becoming indexable, and the set grows by a thousand without
 * anyone deciding to.
 *
 * These count what would be indexed once the dataset reaches production, since
 * everything is noindex until then and a test that only sees zero checks
 * nothing.
 */
const PRE_PRODUCTION = new Set(["non-production-dataset", "low-confidence"]);
const wouldIndexAtProduction = () => {
  const byKind: Record<string, number> = {};
  for (const route of routeCatalog()) {
    const page = resolvePageId(route.locale, route.segments);
    if (!page) continue;
    if (pageSeo(page, route.locale).reasons.every((reason) => PRE_PRODUCTION.has(reason))) {
      byKind[page.kind] = (byKind[page.kind] ?? 0) + 1;
    }
  }
  return byKind;
};

test("no month page is ever an entry point", () => {
  const byKind = wouldIndexAtProduction();
  assert.equal(byKind.destinationMonth ?? 0, 0,
    "month pages are linked and crawlable but never indexed: they are one template with a month name swapped, and the destination page makes the same claim with more around it");
  assert.equal(byKind.finder ?? 0, 0, "the finder is a tool, not a document");
  assert.equal(byKind.info ?? 0, 4, "only methodology and about may be entry points in two locales; legal and credit pages remain excluded");
});

test("the curated production plan is capped at exactly 200 currently selected pages", () => {
  const byKind = wouldIndexAtProduction();
  const total = Object.values(byKind).reduce((sum, count) => sum + count, 0);
  assert.equal(total, 200,
    `${total} pages would be indexed after production under the reviewed selected-cell claim; the ceiling is 200`);
  assert.deepEqual(byKind, {
    home: 2,
    destination: 58,
    ranking: 24,
    areaRanking: 58,
    themeRanking: 48,
    compare: 6,
    info: 4,
  });
});

test("no unreviewed theme, comparison or destination can enter the production plan", () => {
  const byKind = wouldIndexAtProduction();
  assert.equal(byKind.themeRanking, 48, "only warm and low-rain may contribute 24 pages per locale");
  assert.equal(byKind.compare, 6, "only the three enriched comparisons may contribute two locales each");
  assert.equal(byKind.destination, 58, "only 29 scientifically selected destinations may contribute two locales each");
});

test("production robots lets crawlers observe page-level noindex directives", () => {
  const policy = robotsForDataset("production", "https://example.test/sitemap.xml");
  const rules = Array.isArray(policy.rules) ? policy.rules : [policy.rules];
  const wildcard = rules.find((rule) => rule.userAgent === "*");
  assert.deepEqual(wildcard?.disallow, ["/go/"]);
});
