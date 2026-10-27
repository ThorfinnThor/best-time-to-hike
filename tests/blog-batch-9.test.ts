import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import sharp from "sharp";
import { BLOG_POSTS, blockSignature, blogPostMayBeIndexed } from "../lib/blog/content";
import { locales } from "../lib/i18n/config";
import { imageFor } from "../lib/media/images";
import { pageSeo } from "../lib/seo/page-seo";
import sitemap from "../app/sitemap";

type JsonRecord = Record<string, any>;

const manifest = JSON.parse(fs.readFileSync("data-config/blog/batch-9-evidence.json", "utf8")) as JsonRecord;
const countryBySlug: Record<string, string> = {
  "table-mountain": "za",
  cederberg: "za",
  drakensberg: "za",
  "blyde-river": "za",
  "atlas-mountains": "ma",
  mgoun: "ma",
  "anti-atlas": "ma",
  rif: "ma",
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

function selectedActual(month: JsonRecord, expected: JsonRecord): JsonRecord {
  const available: JsonRecord = {
    eligible: month.recommendationEligible,
    score: month.overallScore,
    meanTemperatureC: month.metrics.temperatureHikingMeanC,
    temperatureP10C: month.metrics.temperatureHikingP10C,
    temperatureP90C: month.metrics.temperatureHikingP90C,
    wetDayProbability: month.metrics.wetDayProbability,
    precipitationMonthlyMeanMm: month.metrics.precipitationMonthlyMeanMm,
    snowDayProbability: month.metrics.snowDayProbability,
    hotDayProbability: month.metrics.hotDayProbability,
    daylightHours: month.metrics.daylightHoursMean,
  };
  return Object.fromEntries(Object.keys(expected).map((key) => [key, available[key]]));
}

function assertArticleEvidence(article: JsonRecord): void {
  for (const slug of Object.keys(article.representativeCells)) {
    const country = countryBySlug[slug];
    assert.ok(country, `${slug}: missing country mapping`);
    const destination = readJson(`public/data/hiking/destinations/${country}/${slug}.json`);
    assert.deepEqual(destination.historicalPeriod, {
      startYear: 1991,
      endYear: 2025,
      classification: "project-defined-historical-climate-average",
    });
    assert.ok(destination.months.every((month: JsonRecord) => month.metrics.sampleYearCount === 35 && month.metrics.dataCompleteness === 1));
    assert.deepEqual({
      lat: destination.representativeCell.lat,
      lon: destination.representativeCell.lon,
      modelElevationM: destination.representativeCell.modelElevationM,
    }, article.representativeCells[slug]);
    assert.deepEqual(
      destination.months.filter((month: JsonRecord) => month.recommendationEligible).map((month: JsonRecord) => month.month),
      article.claims.eligibleMonths[slug],
    );
    assert.deepEqual(destination.bestMonths, article.claims.bestMonths[slug]);
    for (const [monthNumber, expected] of Object.entries(article.claims.selectedMonths[slug] ?? {}) as Array<[string, JsonRecord]>) {
      const month = destination.months.find((item: JsonRecord) => item.month === Number(monthNumber));
      assert.ok(month, `${slug}: missing month ${monthNumber}`);
      assert.deepEqual(selectedActual(month, expected), expected, `${slug}: month ${monthNumber} evidence drifted`);
    }
  }
  const common = Object.values(article.claims.eligibleMonths as Record<string, number[]>).reduce((shared, months) => shared.filter((month) => months.includes(month)));
  assert.deepEqual(common, article.claims.commonEligibleMonths);
}

test("batch nine is documented and approved by the final Sol review", async () => {
  assert.equal(manifest.datasetVersion, "era5-land-representative-point-1991-2025-v1");
  assert.equal(manifest.algorithmVersion, "1.3.0");
  assert.equal(manifest.checkedAt, "2026-10-27");
  assert.equal(manifest.status, "approved");
  assert.equal(manifest.scienceReview.status, "approved");
  assert.equal(manifest.scienceReview.reviewedAt, "2026-10-27");
  assert.equal(manifest.scienceReview.reviewer, "SOL final scientific and editorial audit");
  assert.equal(manifest.scienceReview.publicationHold, null);
  assert.equal(manifest.articles.length, 2);
  for (const article of manifest.articles) {
    assert.equal(article.status, "approved");
    for (const path of article.sources) assert.equal(fs.existsSync(path), true, `${article.slug}: missing ${path}`);
    assert.equal(fs.existsSync(article.image.file), true);
    assert.equal(article.image.status, "approved");
    assert.ok(imageFor(article.image.slug));
    const metadata = await sharp(article.image.file).metadata();
    assert.ok((metadata.width ?? 0) >= 2400 && (metadata.height ?? 0) >= 1200);
    assert.equal(metadata.width, article.image.width);
    assert.equal(metadata.height, article.image.height);
  }
});

test("the bilingual articles clear the editorial floor and enter the index", () => {
  const slugs = manifest.articles.map((article: JsonRecord) => article.slug);
  const posts = BLOG_POSTS.filter((post) => slugs.includes(post.slug));
  assert.equal(posts.length, 2);
  assert.notEqual(blockSignature(posts[0], "en"), blockSignature(posts[1], "en"));
  const existingSignatures = new Set(BLOG_POSTS.filter((post) => !slugs.includes(post.slug)).flatMap((post) => locales.map((locale) => `${locale}:${blockSignature(post, locale)}`)));
  for (const post of posts) {
    assert.equal(post.status, "approved");
    assert.equal(post.publishedAt, "2026-10-27");
    assert.equal(post.modifiedAt, "2026-10-27");
    assert.ok(post.evidence.length >= 3);
    const evidenceKeys = new Set(post.evidence.map((item) => item.key));
    for (const locale of locales) {
      const translation = post.translations[locale];
      const count = wordCount(translation.blocks);
      assert.ok(count >= 700 && count <= 1200, `${post.slug}/${locale}: ${count} words`);
      assert.ok(translation.title.length >= 20 && translation.title.length <= 60, `${post.slug}/${locale}: title length ${translation.title.length}`);
      assert.ok(translation.description.length >= 80 && translation.description.length <= 155, `${post.slug}/${locale}: description length ${translation.description.length}`);
      if (locale === "de") assert.equal(JSON.stringify(translation.blocks).includes("—"), false);
      const signature = `${locale}:${blockSignature(post, locale)}`;
      assert.equal(existingSignatures.has(signature), false, `${post.slug}/${locale}: repeated structure`);
      const refs = translation.blocks.flatMap((block) => "evidenceKey" in block ? [block.evidenceKey] : []);
      assert.ok(refs.length >= 3);
      for (const key of refs) assert.equal(evidenceKeys.has(key), true);
      const related = translation.blocks.find((block) => block.type === "destinationLinks");
      assert.ok(related && related.links.length >= 6);
      for (const link of related?.links ?? []) assert.ok(link.href.startsWith(`/${locale}/`));
      assert.equal(pageSeo({kind: "blogPost", slug: post.slug}, locale).index, true);
      assert.equal(sitemap().some((entry) => entry.url.endsWith(`/${locale}/blog/${post.slug}/`)), true);
    }
    assert.equal(blogPostMayBeIndexed(post), true);
  }
});

test("the South Africa article reproduces all four public records", () => {
  const article = manifest.articles.find((item: JsonRecord) => item.slug === "best-time-to-hike-south-africa-cape-drakensberg");
  assert.ok(article);
  assertArticleEvidence(article);
});

test("the Morocco article reproduces all four public records", () => {
  const article = manifest.articles.find((item: JsonRecord) => item.slug === "best-time-to-hike-morocco-atlas-rif-anti-atlas");
  assert.ok(article);
  assertArticleEvidence(article);
});
