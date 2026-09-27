import test from "node:test";
import assert from "node:assert/strict";
import { evaluateIndexability } from "../lib/seo/indexability";
import { routeCatalog } from "../lib/seo/route-catalog";
import { resolvePageId } from "../lib/i18n/resolve";
import { pageSeo } from "../lib/seo/page-seo";
import { ANSWER_ENGINES, datasetMayBeIndexed, robotsDisallowEverything, robotsForDataset, siteMayBeIndexed } from "../lib/seo/crawl-policy";
import { editorialDestinationSlugs, publicIndexTargetUrlCount } from "../lib/seo/editorial-index";
const complete={resultCount:5,dataCompleteness:.99,confidence:90,uniqueInsightCount:3,hasUniqueTitle:true,hasUniqueH1:true,hasCanonical:true,internalLinkCount:4,createsCannibalization:false,containsUnsupportedClaims:false,datasetStatus:"production" as const};
test("production quality page can be indexable",()=>assert.deepEqual(evaluateIndexability(complete),{indexable:true,reasons:[]}));
test("non-production content is always noindex",()=>{
  assert.deepEqual(evaluateIndexability({...complete,datasetStatus:"fixture"}),{indexable:false,reasons:["non-production-dataset"]});
  assert.deepEqual(evaluateIndexability({...complete,datasetStatus:"provisional"}),{indexable:false,reasons:["non-production-dataset"]});
});

test("editorial indexing approval never publishes fixture data and does not fake production", () => {
  assert.equal(datasetMayBeIndexed("fixture"), false);
  assert.equal(datasetMayBeIndexed("provisional"), false);
  assert.equal(datasetMayBeIndexed("production"), true);
  assert.equal(siteMayBeIndexed("fixture"), false);
  assert.equal(robotsDisallowEverything(robotsForDataset("fixture", "https://example.test/sitemap.xml")), true);
  assert.equal(siteMayBeIndexed("provisional"), true);
  assert.equal(robotsDisallowEverything(robotsForDataset("provisional", "https://example.test/sitemap.xml")), false);
  assert.equal(robotsDisallowEverything(robotsForDataset("production", "https://example.test/sitemap.xml")), false);
});

test("production policy names the current search and answer-engine crawlers", () => {
  for (const bot of ["OAI-SearchBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Perplexity-User", "Google-Extended"]) {
    assert.ok((ANSWER_ENGINES as readonly string[]).includes(bot), `${bot} is missing from the explicit policy`);
  }
  assert.ok(!((ANSWER_ENGINES as readonly string[]).includes("Claude-Web")), "the retired Claude-Web token should not survive");
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
 * These count the current, explicitly approved public index set.
 */
const currentIndex = () => {
  const byKind: Record<string, number> = {};
  for (const route of routeCatalog()) {
    const page = resolvePageId(route.locale, route.segments);
    if (!page) continue;
    if (pageSeo(page, route.locale).index) {
      byKind[page.kind] = (byKind[page.kind] ?? 0) + 1;
    }
  }
  return byKind;
};

test("no month page is ever an entry point", () => {
  const byKind = currentIndex();
  assert.equal(byKind.destinationMonth ?? 0, 0,
    "month pages are linked and crawlable but never indexed: they are one template with a month name swapped, and the destination page makes the same claim with more around it");
  assert.equal(byKind.finder ?? 0, 0, "the finder is a tool, not a document");
  assert.equal(byKind.info ?? 0, 4, "only methodology and about may be editorial entry points in both languages");
});

test("the approved index stays at three hundred strong pages, not thousands of templates", () => {
  const byKind = currentIndex();
  const total = Object.values(byKind).reduce((sum, count) => sum + count, 0);
  assert.equal(total, publicIndexTargetUrlCount(),
    `${total} pages are indexable; the version-controlled editorial target is ${publicIndexTargetUrlCount()}.`);
  assert.equal(byKind.destination ?? 0, editorialDestinationSlugs().length * 2,
    "every selected destination article should be indexable in both languages");
  assert.ok((byKind.ranking ?? 0) + (byKind.themeRanking ?? 0) + (byKind.areaRanking ?? 0) > total * 0.5,
    "the majority of the public index should remain substantive ranking and area pages");
});
