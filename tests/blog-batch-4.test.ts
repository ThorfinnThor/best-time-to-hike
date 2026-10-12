import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import weights from "../data-config/scoring/weights.json";
import eligibility from "../data-config/methodology/recommendation-eligibility-v1.json";
import manifest from "../data-config/blog/batch-4-evidence.json";
import { BLOG_POSTS, blockSignature, blogPostMayBeIndexed } from "../lib/blog/content";
import { madeiraVsTenerifeWinterHikingWeather } from "../lib/blog/posts/madeira-vs-tenerife-winter-hiking-weather";
import { bestTimeToHikeJapanByRoute } from "../lib/blog/posts/best-time-to-hike-japan-by-route";
import { imageFor } from "../lib/media/images";
import { routeCatalog } from "../lib/seo/route-catalog";
import { pageSeo } from "../lib/seo/page-seo";
import sitemap from "../app/sitemap";

const destination = (country: string, slug: string) => JSON.parse(fs.readFileSync(`public/data/hiking/destinations/${country}/${slug}.json`, "utf8")) as any;
const month = (record: any, number: number) => record.months.find((item: any) => item.month === number);
const closeTo = (actual: number, expected: number, message: string) => assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} !== ${expected}`);
const monthNumber: Record<string, number> = {
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
const wordCount = (value: unknown): number => {
  if (typeof value === "string") return value.trim().split(/\s+/u).filter(Boolean).length;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + wordCount(item), 0);
  if (value && typeof value === "object") return Object.values(value).reduce((sum, item) => sum + wordCount(item), 0);
  return 0;
};

test("batch-four evidence is public, current, and approved for publication", () => {
  assert.equal(manifest.batch, "2026-10-11-blog-batch-4");
  assert.equal(manifest.datasetVersion, "era5-land-representative-point-1991-2025-v1");
  assert.equal(manifest.algorithmVersion, "1.3.0");
  assert.equal(manifest.checkedAt, "2026-10-11");
  assert.equal(manifest.status, "approved");
  assert.equal(manifest.scienceReview.status, "approved");
  assert.equal(manifest.scienceReview.reviewedAt, "2026-10-12");
  assert.equal(manifest.scienceReview.publicationHold, null);
  assert.deepEqual(manifest.articles.map((article) => article.slug), [
    "madeira-vs-tenerife-winter-hiking-weather",
    "best-time-to-hike-japan-by-route",
  ]);
  for (const article of manifest.articles) {
    assert.equal(article.status, "approved");
    const registered = BLOG_POSTS.find((post) => post.slug === article.slug);
    assert.ok(registered, `${article.slug}: approved article should be registered`);
    assert.equal(registered?.status, "approved");
    assert.equal(registered?.publishedAt, "2026-10-12");
    assert.equal(blogPostMayBeIndexed(registered!), true);
    assert.equal(pageSeo({ kind: "blogPost", slug: article.slug }, "en").index, true);
    assert.equal(sitemap().some((entry) => entry.url.includes(`/blog/${article.slug}`)), true);
    for (const source of article.sources) assert.equal(fs.existsSync(source), true, `${article.slug}: missing ${source}`);
    assert.ok(article.titles.en.length >= 20 && article.titles.en.length <= 60);
    assert.ok(article.titles.de.length >= 20 && article.titles.de.length <= 60);
    assert.match(article.narrative.blockSignature, /^[a-zA-Z]+(?:>[a-zA-Z]+)+$/u);
    assert.ok(article.narrative.prohibitedClaims.length >= 3);
    assert.ok(imageFor(article.image.slug), `${article.slug}: image is not in the licensed image registry`);
    assert.ok(article.image.width >= 1200 && article.image.height >= 800);
    assert.ok(article.image.sourceUrl.startsWith("https://"));
    assert.ok(article.image.author.length > 0);
    assert.ok(article.image.licenceId.length > 0);
  }
  assert.notEqual(manifest.articles[0].narrative.blockSignature, manifest.articles[1].narrative.blockSignature);
  assert.equal(manifest.articles[0].image.status, "approved");
  assert.equal(manifest.articles[1].image.status, "approved");
  assert.ok(manifest.articles[1].image.width >= 2400, "Japan image meets the high-resolution editorial target");
});

test("batch-four bilingual articles are complete, distinct, and published", () => {
  const drafts = [madeiraVsTenerifeWinterHikingWeather, bestTimeToHikeJapanByRoute];
  const draftSignatures = new Set<string>();
  for (const draft of drafts) {
    assert.equal(draft.status, "approved");
    assert.equal(draft.publishedAt, "2026-10-12");
    assert.equal(BLOG_POSTS.find((post) => post.slug === draft.slug)?.status, "approved", `${draft.slug}: article must be approved`);
    const evidenceKeys = new Set(draft.evidence.map((item) => item.key));
    assert.ok(evidenceKeys.size >= 2);
    for (const item of draft.evidence) {
      assert.equal(item.datasetVersion, manifest.datasetVersion);
      assert.equal(item.checkedAt, manifest.checkedAt);
      for (const sourcePath of item.sourcePaths) assert.equal(fs.existsSync(sourcePath), true, `${draft.slug}: missing ${sourcePath}`);
    }
    for (const locale of ["en", "de"] as const) {
      const translation = draft.translations[locale];
      const words = wordCount(translation.blocks);
      assert.ok(words >= 700 && words <= 1200, `${draft.slug}/${locale}: ${words} words`);
      assert.ok(translation.title.length >= 20 && translation.title.length <= 60);
      assert.ok(translation.description.length >= 80 && translation.description.length <= 155);
      if (locale === "de") assert.doesNotMatch(JSON.stringify(translation), /—/u);
      const signature = blockSignature(draft, locale);
      const localisedSignature = `${locale}:${signature}`;
      assert.equal(draftSignatures.has(localisedSignature), false, `${draft.slug}/${locale}: reused batch-four block signature`);
      draftSignatures.add(localisedSignature);
      const referenced = translation.blocks.flatMap((block) => "evidenceKey" in block ? [block.evidenceKey] : []);
      assert.ok(referenced.length >= 3);
      assert.ok(referenced.every((key) => evidenceKeys.has(key)));
      const related = translation.blocks.find((block) => block.type === "destinationLinks");
      assert.ok(related && related.links.length >= 5);
      const routes = new Set(routeCatalog().filter((route) => route.locale === locale).map((route) => `/${locale}/${route.segments.join("/")}`.replace(/\/$/u, "")));
      assert.ok(related?.links.every((link) => routes.has(link.href)), `${draft.slug}/${locale}: contextual link has no static route`);
    }
  }
  assert.equal(madeiraVsTenerifeWinterHikingWeather.heroImageSlug, "madeira");
  assert.equal(bestTimeToHikeJapanByRoute.heroImageSlug, "kumano-kodo");
});

test("Madeira and Tenerife winter claims reproduce the public records", () => {
  const article = manifest.articles[0] as any;
  const records: Record<string, any> = { madeira: destination("pt", "madeira"), tenerife: destination("es", "tenerife") };
  assert.equal(records.madeira.historicalPeriod.startYear, 1991);
  assert.equal(records.madeira.historicalPeriod.endYear, 2025);
  assert.deepEqual(records.madeira.representativeCell, article.representativeCells.madeira);
  assert.deepEqual(records.tenerife.representativeCell, article.representativeCells.tenerife);
  for (const record of Object.values(records) as any[]) {
    for (const monthRecord of record.months) {
      assert.equal(monthRecord.metrics.sampleYearCount, 35);
      assert.equal(monthRecord.metrics.dataCompleteness, 1);
    }
  }
  for (const [name, expectedPair] of Object.entries(article.claims.months) as any) {
    const number = monthNumber[name];
    for (const [slug, expected] of Object.entries(expectedPair) as any) {
      const actual = month(records[slug], number);
      assert.equal(actual.recommendationEligible, expected.eligible, `${slug}/${name} eligibility`);
      assert.equal(actual.overallScore, expected.score, `${slug}/${name} score`);
      assert.equal(actual.metrics.temperatureHikingMeanC, expected.meanTemperatureC, `${slug}/${name} temperature`);
      assert.equal(actual.metrics.temperatureHikingP10C, expected.temperatureP10C, `${slug}/${name} p10`);
      assert.equal(actual.metrics.temperatureHikingP90C, expected.temperatureP90C, `${slug}/${name} p90`);
      assert.equal(actual.metrics.wetDayProbability, expected.wetDayProbability, `${slug}/${name} wet days`);
      assert.equal(actual.metrics.precipitationMonthlyMeanMm, expected.precipitationMonthlyMeanMm, `${slug}/${name} precipitation`);
      assert.equal(actual.metrics.daylightHoursMean, expected.daylightHoursMean, `${slug}/${name} daylight`);
      assert.equal(actual.metrics.relativeHumidityHikingMeanPct, expected.relativeHumidityHikingMeanPct, `${slug}/${name} humidity`);
    }
  }
  const madeira = records.madeira;
  const tenerife = records.tenerife;
  for (const [name, expected] of Object.entries(article.claims.derivedContrasts.madeiraWarmerC) as any) {
    const n = monthNumber[name];
    closeTo(month(madeira, n).metrics.temperatureHikingMeanC - month(tenerife, n).metrics.temperatureHikingMeanC, expected, `${name} warmth contrast`);
  }
  for (const [name, expected] of Object.entries(article.claims.derivedContrasts.madeiraWetDayProbabilityHigher) as any) {
    const n = monthNumber[name];
    closeTo(month(madeira, n).metrics.wetDayProbability - month(tenerife, n).metrics.wetDayProbability, expected, `${name} wet-day contrast`);
  }
  for (const [name, expected] of Object.entries(article.claims.derivedContrasts.madeiraPrecipitationHigherMm) as any) {
    const n = monthNumber[name];
    closeTo(month(madeira, n).metrics.precipitationMonthlyMeanMm - month(tenerife, n).metrics.precipitationMonthlyMeanMm, expected, `${name} precipitation contrast`);
  }
});

test("Japan route-family claims reproduce the five public eligibility calendars", () => {
  const article = manifest.articles[1] as any;
  const records: Record<string, any> = {
    "kumano-kodo": destination("jp", "kumano-kodo"),
    yakushima: destination("jp", "yakushima"),
    daisetsuzan: destination("jp", "daisetsuzan"),
    kamikochi: destination("jp", "kamikochi"),
    tateyama: destination("jp", "tateyama"),
  };
  for (const [slug, expected] of Object.entries(article.claims.routeFamilies) as any) {
    const record = records[slug];
    assert.deepEqual(record.representativeCell, expected.cell, `${slug} representative cell`);
    assert.equal(record.historicalPeriod.startYear, 1991);
    assert.equal(record.historicalPeriod.endYear, 2025);
    const eligible = record.months.filter((item: any) => item.recommendationEligible).map((item: any) => item.month);
    assert.deepEqual(eligible, expected.eligibleMonths, `${slug} eligibility calendar`);
    for (const item of record.months) {
      assert.equal(item.metrics.sampleYearCount, 35, `${slug}/${item.month} sample years`);
      assert.equal(item.metrics.dataCompleteness, 1, `${slug}/${item.month} completeness`);
    }
  }
  for (const [slug, claims] of Object.entries(article.claims.selectedMonths) as any) {
    for (const [name, expected] of Object.entries(claims) as any) {
      const actual = month(records[slug], monthNumber[name]);
      assert.equal(actual.recommendationEligible, expected.eligible, `${slug}/${name} eligibility`);
      assert.equal(actual.overallScore, expected.score, `${slug}/${name} score`);
      assert.equal(actual.metrics.temperatureHikingMeanC, expected.meanTemperatureC, `${slug}/${name} temperature`);
      assert.equal(actual.metrics.wetDayProbability, expected.wetDayProbability, `${slug}/${name} wet days`);
      if ("snowDayProbability" in expected) assert.equal(actual.metrics.snowDayProbability, expected.snowDayProbability, `${slug}/${name} snow days`);
      for (const [key, value] of Object.entries(expected)) {
        if (key.endsWith("Component")) assert.equal(actual.components[key.replace("Component", "")], value, `${slug}/${name}/${key}`);
      }
    }
  }
  assert.equal(eligibility.criticalComponentMinimumExclusive, article.claims.gate.criticalComponentMinimumExclusive);
  assert.deepEqual(eligibility.criticalComponents, article.claims.gate.criticalComponents);
  assert.equal(eligibility.ineligibleScoreMaximum, article.claims.gate.ineligibleScoreMaximum);
  assert.equal(weights.overall.wind, article.claims.gate.windWeight);
  assert.equal(article.claims.gate.precipitationIsGate, false);
});
