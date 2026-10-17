import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { BLOG_POSTS, blockSignature, blogPostMayBeIndexed } from "../lib/blog/content";
import { locales } from "../lib/i18n/config";
import { imageFor } from "../lib/media/images";
import { pageSeo } from "../lib/seo/page-seo";
import sitemap from "../app/sitemap";

type JsonRecord = Record<string, any>;

const manifest = JSON.parse(fs.readFileSync("data-config/blog/batch-5-evidence.json", "utf8")) as JsonRecord;
const monthNumbers: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function readJson(path: string): JsonRecord {
  return JSON.parse(fs.readFileSync(path, "utf8")) as JsonRecord;
}

function wordCount(value: unknown): number {
  if (typeof value === "string") return value.trim().split(/\s+/u).filter(Boolean).length;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + wordCount(item), 0);
  if (value && typeof value === "object") return Object.values(value).reduce((sum, item) => sum + wordCount(item), 0);
  return 0;
}

function eligibleMonths(destination: JsonRecord): number[] {
  return destination.months.filter((month: JsonRecord) => month.recommendationEligible).map((month: JsonRecord) => month.month);
}

function assertSelectedClaims(destination: JsonRecord, claims: JsonRecord): void {
  for (const [monthName, expected] of Object.entries(claims)) {
    const month = destination.months.find((item: JsonRecord) => item.month === monthNumbers[monthName]);
    assert.ok(month, `${destination.slug}: missing ${monthName}`);
    const actual = {
      eligible: month.recommendationEligible,
      score: month.overallScore,
      meanTemperatureC: month.metrics.temperatureHikingMeanC,
      ...(expected.temperatureP10C === undefined ? {} : {temperatureP10C: month.metrics.temperatureHikingP10C}),
      wetDayProbability: month.metrics.wetDayProbability,
      precipitationMonthlyMeanMm: month.metrics.precipitationMonthlyMeanMm,
      snowDayProbability: month.metrics.snowDayProbability,
      ...(expected.snowComponent === undefined ? {} : {snowComponent: month.components.snow}),
      ...(expected.precipitationComponent === undefined ? {} : {precipitationComponent: month.components.precipitation}),
    };
    assert.deepEqual(actual, expected, `${destination.slug}: ${monthName} evidence drifted`);
  }
}

test("batch five is documented and approved by the final Sol review", () => {
  assert.equal(manifest.datasetVersion, "era5-land-representative-point-1991-2025-v1");
  assert.equal(manifest.algorithmVersion, "1.3.0");
  assert.equal(manifest.checkedAt, "2026-10-17");
  assert.equal(manifest.status, "approved");
  assert.equal(manifest.scienceReview.status, "approved");
  assert.equal(manifest.scienceReview.reviewedAt, "2026-10-17");
  assert.equal(manifest.scienceReview.reviewer, "SOL final scientific and editorial audit");
  assert.equal(manifest.scienceReview.publicationHold, null);
  assert.equal(manifest.articles.length, 2);
  for (const article of manifest.articles) {
    assert.equal(article.status, "approved");
    for (const path of article.sources) assert.equal(fs.existsSync(path), true, `${article.slug}: missing ${path}`);
    assert.equal(fs.existsSync(article.image.file), true, `${article.slug}: missing hero image`);
    assert.equal(article.image.status, "approved");
    assert.ok(article.image.width >= 2400 && article.image.height >= 1200);
    assert.ok(imageFor(article.image.slug), `${article.slug}: image is absent from the licensed registry`);
    const post = BLOG_POSTS.find((item) => item.slug === article.slug);
    assert.ok(post);
    assert.equal(post.status, "approved");
    assert.equal(post.publishedAt, "2026-10-17");
    assert.equal(blogPostMayBeIndexed(post), true);
    for (const locale of locales) {
      assert.equal(pageSeo({kind: "blogPost", slug: article.slug}, locale).index, true);
      assert.equal(sitemap().some((entry) => entry.url.endsWith(`/${locale}/blog/${article.slug}`)), true);
    }
  }
});

test("the two bilingual articles clear the editorial floor without sharing a template", () => {
  const slugs = manifest.articles.map((article: JsonRecord) => article.slug);
  const posts = BLOG_POSTS.filter((post) => slugs.includes(post.slug));
  assert.equal(posts.length, 2);
  const signatures = new Set<string>();
  for (const post of posts) {
    assert.equal(post.status, "approved");
    assert.equal(post.publishedAt, "2026-10-17");
    assert.ok(post.evidence.length >= 3);
    const evidenceKeys = new Set(post.evidence.map((item) => item.key));
    for (const locale of locales) {
      const translation = post.translations[locale];
      const count = wordCount(translation.blocks);
      assert.ok(count >= 700 && count <= 1200, `${post.slug}/${locale}: ${count} words`);
      assert.ok(translation.title.length >= 20 && translation.title.length <= 60);
      assert.ok(translation.description.length >= 80 && translation.description.length <= 155);
      if (locale === "de") assert.equal(translation.blocks.some((block) => JSON.stringify(block).includes("—")), false);
      const signature = `${locale}:${blockSignature(post, locale)}`;
      assert.equal(signatures.has(signature), false, `${post.slug}/${locale}: repeated block sequence`);
      signatures.add(signature);
      const evidenceRefs = translation.blocks.flatMap((block) => "evidenceKey" in block ? [block.evidenceKey] : []);
      assert.ok(evidenceRefs.length >= 3);
      for (const key of evidenceRefs) assert.equal(evidenceKeys.has(key), true, `${post.slug}/${locale}: missing ${key}`);
      const related = translation.blocks.find((block) => block.type === "destinationLinks");
      assert.ok(related && related.links.length >= 5);
      for (const link of related?.links ?? []) assert.equal(link.href.startsWith(`/${locale}/`), true);
    }
  }
});

test("the Dolomites article reproduces its public destination records", () => {
  const article = manifest.articles.find((item: JsonRecord) => item.slug === "best-time-to-hike-dolomites-by-month");
  assert.ok(article);
  for (const slug of ["dolomites", "brenta"]) {
    const destination = readJson(`public/data/hiking/destinations/it/${slug}.json`);
    assert.equal(destination.historicalPeriod.startYear, 1991);
    assert.equal(destination.historicalPeriod.endYear, 2025);
    assert.equal(destination.historicalPeriod.classification, "project-defined-historical-climate-average");
    assert.ok(destination.months.every((month: JsonRecord) => month.metrics.sampleYearCount === 35 && month.metrics.dataCompleteness === 1));
    assert.deepEqual({
      lat: destination.representativeCell.lat,
      lon: destination.representativeCell.lon,
      modelElevationM: destination.representativeCell.modelElevationM,
    }, article.representativeCells[slug]);
    assert.deepEqual(eligibleMonths(destination), article.claims.eligibleMonths[slug]);
    assertSelectedClaims(destination, article.claims.selectedMonths[slug]);
  }
});

test("the Nepal article reproduces eligible records and preserves the Langtang hold", () => {
  const article = manifest.articles.find((item: JsonRecord) => item.slug === "best-time-to-trek-nepal-annapurna-vs-everest");
  assert.ok(article);
  for (const slug of ["annapurna", "everest-region"]) {
    const destination = readJson(`public/data/hiking/destinations/np/${slug}.json`);
    assert.equal(destination.historicalPeriod.startYear, 1991);
    assert.equal(destination.historicalPeriod.endYear, 2025);
    assert.equal(destination.historicalPeriod.classification, "project-defined-historical-climate-average");
    assert.ok(destination.months.every((month: JsonRecord) => month.metrics.sampleYearCount === 35 && month.metrics.dataCompleteness === 1));
    assert.deepEqual({
      lat: destination.representativeCell.lat,
      lon: destination.representativeCell.lon,
      modelElevationM: destination.representativeCell.modelElevationM,
    }, article.representativeCells[slug]);
    assert.deepEqual(eligibleMonths(destination), article.claims.eligibleMonths[slug]);
    assert.deepEqual(destination.bestMonths, article.claims.bestMonths[slug]);
    assertSelectedClaims(destination, article.claims.selectedMonths[slug]);
  }
  const langtang = readJson("public/data/hiking/destinations/np/langtang.json");
  assert.deepEqual({
    recommendationEligible: langtang.recommendationEligible,
    recommendationHoldReason: langtang.recommendationHoldReason,
    bestMonths: langtang.bestMonths,
  }, article.claims.langtang);
});
