import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import sharp from "sharp";
import { BLOG_POSTS, blogPostMayBeIndexed, blogPostsForLocale, blockSignature } from "../lib/blog/content";
import type { BlogBlock } from "../lib/blog/content";
import { imageFor } from "../lib/media/images";
import { links } from "../lib/i18n/links";
import { pageSeo } from "../lib/seo/page-seo";
import sitemap from "../app/sitemap";

type JsonRecord = Record<string, any>;
const read = (path: string): JsonRecord => JSON.parse(fs.readFileSync(path, "utf8"));
const manifest = read("data-config/blog/batch-12-evidence.json");
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

test("batch twelve matches complete public 1991–2025 records and the metric definitions", () => {
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
    const eligibleSets: number[][] = [];
    for (const [slug, expectedCell] of Object.entries(article.representativeCells)) {
      const path = article.sources.find((source: string) => source.endsWith(`/${slug}.json`));
      assert.ok(path);
      const destination = read(path);
      assert.equal(destination.algorithmVersion, manifest.algorithmVersion);
      assert.equal(destination.historicalPeriod.startYear, 1991);
      assert.equal(destination.historicalPeriod.endYear, 2025);
      assert.ok(destination.months.every((month: JsonRecord) => month.metrics.sampleYearCount === 35 && month.metrics.dataCompleteness === 1));
      assert.deepEqual(destination.representativeCell, expectedCell);
      assert.deepEqual(destination.bestMonths, article.claims.bestMonths[slug]);
      const eligible = destination.months.filter((month: JsonRecord) => month.recommendationEligible).map((month: JsonRecord) => month.month);
      assert.deepEqual(eligible, article.claims.eligibleMonths[slug]);
      eligibleSets.push(eligible);
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
    assert.deepEqual(article.claims.commonEligibleMonths, eligibleSets[0].filter((month) => eligibleSets.every((set) => set.includes(month))));
  }
  assert.deepEqual(manifest.articles[0].claims.commonEligibleMonths, [7, 8, 9]);
  assert.deepEqual(manifest.articles[1].claims.commonEligibleMonths, [1, 2, 3]);
});

test("the two approved bilingual articles are distinct, substantive and published in the archive and sitemap", () => {
  assert.equal(posts.length, 2);
  assert.equal(manifest.status, "approved");
  assert.deepEqual(manifest.scienceReview, {
    status: "approved", reviewedAt: "2026-11-17",
    reviewer: "Codex scientific and editorial review (Sol step)", publicationHold: null,
  });
  for (const locale of ["en", "de"] as const) {
    const signatures = new Set(BLOG_POSTS.filter((post) => !slugs.includes(post.slug)).map((post) => blockSignature(post, locale)));
    for (const post of posts) {
      assert.equal(post.status, "approved");
      assert.equal(post.publishedAt, "2026-11-17");
      assert.equal(blogPostMayBeIndexed(post), true);
      assert.equal(pageSeo({ kind: "blogPost", slug: post.slug }, locale).index, true);
      assert.equal(blogPostsForLocale(locale).some((entry) => entry.slug === post.slug), true);
      assert.equal(sitemap().some((entry) => entry.url.endsWith(`/${locale}/blog/${post.slug}/`)), true);
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
    }
  }
});

test("visible table numbers reproduce the data, including the snow veto and Torres override", () => {
  const norway = posts.find((post) => post.slug.startsWith("norway-"))!;
  const patagonia = posts.find((post) => post.slug.startsWith("patagonia-"))!;
  for (const locale of ["en", "de"] as const) {
    const decimal = (value: number, digits: number) => value.toFixed(digits).replace(".", locale === "de" ? "," : ".");
    const norwayTable = norway.translations[locale].blocks.find((block) => block.type === "comparisonTable")!;
    for (const [i, path] of manifest.articles[0].sources.entries()) {
      const month = read(path).months.find((value: JsonRecord) => value.month === 6);
      assert.equal(norwayTable.rows[i].values[1], `${decimal(month.metrics.temperatureHikingMeanC, 1)} °C`);
      const snow = month.metrics.snowDayProbability;
      assert.equal(norwayTable.rows[i].values[2], snow === 0 ? "0%" : `${decimal(snow * 100, 2)}%`);
      if (!month.recommendationEligible) assert.ok(month.components.snow <= 20);
    }
    const torres = read("public/data/hiking/destinations/cl/torres-del-paine.json");
    assert.ok(torres.representativeCell.overrideLabel && torres.representativeCell.overrideReason);
    const torresTable = patagonia.translations[locale].blocks.find((block) => block.type === "comparisonTable")!;
    for (const [i, number] of [12, 1, 2, 3].entries()) {
      const month = torres.months.find((value: JsonRecord) => value.month === number);
      assert.deepEqual(torresTable.rows[i].values.slice(0, 3), [
        `${decimal(month.metrics.temperatureHikingMeanC, 1)} °C`,
        `${decimal(month.metrics.snowDayProbability * 100, 2)}%`,
        `${decimal(month.metrics.wetDayProbability * 100, 2)}%`,
      ]);
      if (number === 12) assert.ok(!month.recommendationEligible && month.components.snow <= 20);
    }
  }
  const held = manifest.heldReferences[0];
  const destination = read(held.path);
  assert.equal(destination.recommendationHoldReason, held.holdReason);
  assert.equal(held.holdReason, "persistent-snow");
  assert.deepEqual(destination.bestMonths, []);
  assert.ok(destination.months.every((month: JsonRecord) => !month.recommendationEligible && month.overallScore === null));
});

test("both approved heroes have actual high resolution and matching licensed provenance", async () => {
  const images = read("data-config/sources/destination-images.json");
  for (const article of manifest.articles) {
    const record = images.images.find((entry: JsonRecord) => entry.slug === article.image.slug);
    assert.ok(record && imageFor(record.slug));
    assert.equal(article.image.status, "approved");
    for (const key of ["sourceUrl", "author", "licenceId", "licenceUrl", "attribution", "width", "height"]) assert.equal(article.image[key], record[key]);
    const metadata = await sharp(article.image.file).metadata();
    assert.ok(metadata.width! >= 2400 && metadata.height! >= 1200);
    assert.equal(metadata.width, article.image.width);
    assert.equal(metadata.height, article.image.height);
  }
});
