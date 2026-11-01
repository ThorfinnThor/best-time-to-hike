import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import sharp from "sharp";
import { BLOG_POSTS, blogPostMayBeIndexed, blockSignature } from "../lib/blog/content";
import type { BlogBlock } from "../lib/blog/content";
import { imageFor } from "../lib/media/images";
import { links } from "../lib/i18n/links";
import { pageSeo } from "../lib/seo/page-seo";
import sitemap from "../app/sitemap";

type JsonRecord = Record<string, any>;
const read = (path: string): JsonRecord => JSON.parse(fs.readFileSync(path, "utf8"));
const manifest = read("data-config/blog/batch-11-evidence.json");
const slugs = manifest.articles.map((article: JsonRecord) => article.slug) as string[];
const posts = BLOG_POSTS.filter((post) => slugs.includes(post.slug));

function substantiveText(block: BlogBlock): string {
  switch (block.type) {
    case "paragraph": case "heading": case "caveat": case "pullQuote": return block.text;
    case "metricCallout": return [block.label, block.value, block.detail].join(" ");
    case "comparisonTable": return [block.caption, ...block.columns, ...block.rows.flatMap((row) => [row.label, ...row.values])].join(" ");
    case "timeline": return [block.caption, ...block.points.flatMap((point) => [point.label, point.value, point.detail ?? ""])].join(" ");
    case "monthStrip": return [block.caption, ...block.months.flatMap((month) => [month.label, month.note])].join(" ");
    case "destinationLinks": return "";
  }
}

test("batch eleven reproduces the public climate records and metric definitions", () => {
  assert.equal(manifest.datasetVersion, "era5-land-representative-point-1991-2025-v1");
  assert.equal(manifest.algorithmVersion, "1.3.0");
  const config = read("data-config/methodology/climate-aggregation-v1.json");
  for (const [key, expected] of Object.entries(manifest.metricDefinitions)) {
    const actual = key === "hikingWindowLocal"
      ? { start: config[key].start, end: config[key].end, limitToDaylight: config[key].limitToDaylight }
      : config[key];
    assert.deepEqual(actual, expected, `${key}: metric definition drifted`);
  }
  for (const article of manifest.articles) {
    for (const [slug, expectedCell] of Object.entries(article.representativeCells)) {
      const path = article.sources.find((source: string) => source.endsWith(`/${slug}.json`));
      assert.ok(path, `${slug}: missing source`);
      const destination = read(path);
      assert.equal(destination.historicalPeriod.startYear, 1991);
      assert.equal(destination.historicalPeriod.endYear, 2025);
      assert.ok(destination.months.every((month: JsonRecord) => month.metrics.sampleYearCount === 35 && month.metrics.dataCompleteness === 1));
      assert.deepEqual(destination.representativeCell, expectedCell);
      assert.deepEqual(destination.bestMonths, article.claims.bestMonths[slug]);
      assert.deepEqual(destination.months.filter((month: JsonRecord) => month.recommendationEligible).map((month: JsonRecord) => month.month), article.claims.eligibleMonths[slug]);
      const minWet = Math.min(...destination.months.map((month: JsonRecord) => month.metrics.wetDayProbability));
      assert.deepEqual({ months: destination.months.filter((month: JsonRecord) => month.metrics.wetDayProbability === minWet).map((month: JsonRecord) => month.month), wetDayProbability: minWet }, article.claims.annualWetDayMinima[slug]);
      for (const [number, expected] of Object.entries(article.claims.selectedMonths[slug])) {
        const month = destination.months.find((value: JsonRecord) => value.month === Number(number));
        const metric = month.metrics;
        assert.deepEqual({
          eligible: month.recommendationEligible, score: month.overallScore,
          meanTemperatureC: metric.temperatureHikingMeanC,
          temperatureP10C: metric.temperatureHikingP10C, temperatureP90C: metric.temperatureHikingP90C,
          wetDayProbability: metric.wetDayProbability, precipitationMonthlyMeanMm: metric.precipitationMonthlyMeanMm,
          snowDayProbability: metric.snowDayProbability, daylightHours: metric.daylightHoursMean,
        }, expected, `${slug}/${number}: factual evidence drifted`);
      }
    }
  }
});

test("the approved bilingual articles are substantive, distinct and indexable", () => {
  assert.equal(posts.length, 2);
  assert.equal(manifest.status, "approved");
  assert.equal(manifest.checkedAt, "2026-11-01");
  assert.deepEqual(manifest.scienceReview, { status: "approved", reviewedAt: "2026-11-01", reviewer: "Codex scientific and editorial review (Sol step)", publicationHold: null });
  for (const locale of ["en", "de"] as const) {
    const signatures = new Set(BLOG_POSTS.filter((post) => !slugs.includes(post.slug)).map((post) => blockSignature(post, locale)));
    for (const post of posts) {
      assert.equal(post.status, "approved");
      assert.equal(post.publishedAt, "2026-11-01");
      assert.equal(blogPostMayBeIndexed(post), true);
      assert.equal(pageSeo({ kind: "blogPost", slug: post.slug }, locale).index, true);
      assert.equal(sitemap().some((item) => item.url.endsWith(`/${locale}/blog/${post.slug}/`)), true);
      const translation = post.translations[locale];
      const signature = blockSignature(post, locale);
      assert.equal(signatures.has(signature), false, `${post.slug}: repeated editorial structure`);
      signatures.add(signature);
      const words = translation.blocks.map(substantiveText).join(" ").trim().split(/\s+/u).length;
      assert.ok(words >= 700 && words <= 1200, `${post.slug}/${locale}: ${words} substantive words`);
      assert.ok(translation.title.length >= 20 && translation.title.length <= 60);
      assert.ok(translation.description.length >= 80 && translation.description.length <= 155);
      if (locale === "de") assert.equal(JSON.stringify(translation.blocks).includes("—"), false);
      const refs = translation.blocks.flatMap((block) => "evidenceKey" in block ? [block.evidenceKey] : []);
      assert.ok(refs.length >= 3);
      for (const key of refs) assert.ok(post.evidence.some((entry) => entry.key === key));
      for (const item of post.evidence) for (const path of item.sourcePaths) assert.ok(fs.existsSync(path));
      const related = translation.blocks.find((block) => block.type === "destinationLinks");
      assert.ok(related);
      assert.ok(related.links.filter((link) => link.href.startsWith(links.destination(locale, ""))).length >= 3);
      assert.ok(related.links.some((link) => link.href === links.methodology(locale)));
      assert.ok(related.links.some((link) => link.href === links.finder(locale)));
      for (const link of related.links) assert.ok(link.href.startsWith(`/${locale}/`));
    }
  }
});

test("Peru's paired conclusion preserves the separate precipitation review holds", () => {
  const peru = manifest.articles.find((article: JsonRecord) => article.slug === "salkantay-vs-ausangate-trekking-months-peru");
  assert.deepEqual(peru.claims.bestMonths.salkantay.filter((month: number) => peru.claims.bestMonths.ausangate.includes(month)), [6, 7]);
  assert.ok(Math.abs(peru.representativeCells.ausangate.modelElevationM - peru.representativeCells.salkantay.modelElevationM - 18.8) < 0.001);
  for (const ref of manifest.heldReferences) {
    const destination = read(ref.path);
    assert.equal(destination.recommendationHoldReason, "precipitation-validation");
    assert.equal(ref.holdReason, destination.recommendationHoldReason);
    assert.equal(destination.recommendationEligible, false);
    assert.deepEqual(destination.bestMonths, []);
    assert.ok(destination.months.every((month: JsonRecord) => !month.recommendationEligible && month.overallScore === null));
  }
});

test("both approved heroes have high resolution and matching licensed provenance", async () => {
  const images = read("data-config/sources/destination-images.json");
  for (const article of manifest.articles) {
    const record = images.images.find((item: JsonRecord) => item.slug === article.image.slug);
    assert.ok(record && imageFor(record.slug));
    for (const key of ["sourceUrl", "author", "licenceId", "licenceUrl", "attribution"]) assert.equal(article.image[key], record[key]);
    assert.equal(article.image.status, "approved");
    const metadata = await sharp(article.image.file).metadata();
    assert.equal(metadata.width, 2400);
    assert.equal(metadata.height, 1600);
  }
});
