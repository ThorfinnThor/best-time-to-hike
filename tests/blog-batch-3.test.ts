import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import weights from "../data-config/scoring/weights.json";
import eligibility from "../data-config/methodology/recommendation-eligibility-v1.json";
import manifest from "../data-config/blog/batch-3-evidence.json";
import { BLOG_POSTS, blockSignature } from "../lib/blog/content";
import { imageFor } from "../lib/media/images";
import { routeCatalog } from "../lib/seo/route-catalog";

const destination = (country: string, slug: string) => JSON.parse(fs.readFileSync(`public/data/hiking/destinations/${country}/${slug}.json`, "utf8")) as any;
const month = (record: any, number: number) => record.months.find((item: any) => item.month === number);
const closeTo = (actual: number, expected: number, message: string) => assert.ok(Math.abs(actual - expected) < 1e-9, `${message}: ${actual} !== ${expected}`);
const wordCount = (value: unknown): number => {
  if (typeof value === "string") return value.trim().split(/\s+/u).filter(Boolean).length;
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + wordCount(item), 0);
  if (value && typeof value === "object") return Object.values(value).reduce((sum, item) => sum + wordCount(item), 0);
  return 0;
};

test("batch-three evidence manifest is complete and points to existing public sources", () => {
  assert.equal(manifest.datasetVersion, "era5-land-representative-point-1991-2025-v1");
  assert.equal(manifest.algorithmVersion, "1.3.0");
  assert.equal(manifest.checkedAt, "2026-10-08");
  assert.deepEqual(manifest.articles.map((article) => article.slug), [
    "two-90s-two-different-hiking-worlds",
    "cappadocia-between-snow-and-heat",
  ]);
  for (const article of manifest.articles) {
    assert.equal(article.status, "approved");
    for (const source of article.sources) assert.equal(fs.existsSync(source), true, `${article.slug}: missing ${source}`);
    assert.ok(article.image.width >= 1200 && article.image.height >= 800, `${article.slug}: image is below the minimum source dimensions`);
    assert.ok(article.image.sourceUrl.startsWith("https://"));
    assert.ok(article.image.author.length > 0);
    assert.ok(article.image.licenceId.length > 0);
    assert.ok(imageFor(article.image.slug), `${article.slug}: image is not in the licensed image registry`);
    const post = BLOG_POSTS.find((item) => item.slug === article.slug);
    assert.ok(post && post.status === "approved");
    assert.equal(post?.heroImageSlug, article.image.slug);
    assert.equal(blockSignature(post!, "en") !== blockSignature(post!, "de"), false, `${article.slug}: locale structures diverge`);
    for (const locale of ["en", "de"] as const) {
      const translation = post!.translations[locale];
      const words = wordCount(translation.blocks);
      assert.ok(words >= 700 && words <= 1200, `${article.slug}/${locale}: ${words} words`);
      assert.ok(translation.title.length >= 20 && translation.title.length <= 60);
      assert.ok(translation.description.length >= 80 && translation.description.length <= 155);
      if (locale === "de") assert.doesNotMatch(JSON.stringify(translation), /—/u);
      const referenced = post!.translations[locale].blocks.flatMap((block) => "evidenceKey" in block ? [block.evidenceKey] : []);
      assert.ok(referenced.length >= 3, `${article.slug}/${locale}: not enough checked block references`);
      assert.ok(referenced.every((key) => post!.evidence.some((item) => item.key === key)));
      const routes = new Set(routeCatalog().filter((route) => route.locale === locale).map((route) => `/${locale}/${route.segments.join("/")}`.replace(/\/$/u, "")));
      const related = translation.blocks.find((block) => block.type === "destinationLinks");
      assert.ok(related && related.links.every((link) => routes.has(link.href)), `${article.slug}/${locale}: contextual link has no static route`);
    }
  }
});

test("equal-score article claims reproduce the two public month records", () => {
  const plan = manifest.articles[0].claims as any;
  const larapinta = month(destination("au", "larapinta"), 8);
  const lofotodden = month(destination("no", "lofotodden"), 7);
  assert.equal(larapinta.overallScore, plan.equalScore.larapintaAugust.score);
  assert.equal(lofotodden.overallScore, plan.equalScore.lofotoddenJuly.score);
  assert.equal(larapinta.recommendationEligible, plan.equalScore.larapintaAugust.eligible);
  assert.equal(lofotodden.recommendationEligible, plan.equalScore.lofotoddenJuly.eligible);
  for (const [record, expected] of [[larapinta, plan.larapintaAugust], [lofotodden, plan.lofotoddenJuly]] as const) {
    assert.equal(record.metrics.sampleYearCount, expected.sampleYearCount);
    assert.equal(record.metrics.dataCompleteness, expected.dataCompleteness);
    assert.equal(record.metrics.temperatureHikingMeanC, expected.meanTemperatureC);
    assert.equal(record.metrics.temperatureHikingP10C, expected.temperatureP10C);
    assert.equal(record.metrics.temperatureHikingP90C, expected.temperatureP90C);
    assert.equal(record.metrics.wetDayProbability, expected.wetDayProbability);
    assert.equal(record.metrics.precipitationMonthlyMeanMm, expected.precipitationMonthlyMeanMm);
    assert.equal(record.metrics.snowDayProbability, expected.snowDayProbability);
    assert.equal(record.metrics.hotDayProbability, expected.hotDayProbability);
    assert.equal(record.metrics.daylightHoursMean, expected.daylightHoursMean);
    assert.equal(record.metrics.relativeHumidityHikingMeanPct, expected.relativeHumidityHikingMeanPct);
  }
  const derived = plan.derivedContrasts;
  closeTo(larapinta.metrics.temperatureHikingMeanC - lofotodden.metrics.temperatureHikingMeanC, derived.meanTemperatureDifferenceC, "temperature contrast");
  closeTo(lofotodden.metrics.wetDayProbability - larapinta.metrics.wetDayProbability, derived.wetDayProbabilityDifference, "wet-day contrast");
  closeTo(lofotodden.metrics.precipitationMonthlyMeanMm - larapinta.metrics.precipitationMonthlyMeanMm, derived.precipitationDifferenceMm, "precipitation contrast");
  closeTo(lofotodden.metrics.daylightHoursMean - larapinta.metrics.daylightHoursMean, derived.daylightDifferenceHours, "daylight contrast");
  closeTo(lofotodden.metrics.relativeHumidityHikingMeanPct - larapinta.metrics.relativeHumidityHikingMeanPct, derived.relativeHumidityDifferencePct, "humidity contrast");
});

test("Cappadocia article claims reproduce the seasonal gate transitions", () => {
  const plan = manifest.articles[1].claims as any;
  const record = destination("tr", "cappadocia");
  assert.deepEqual(record.representativeCell, {lat: plan.representativeCell.lat, lon: plan.representativeCell.lon, modelElevationM: plan.representativeCell.modelElevationM});
  assert.equal(record.historicalPeriod.startYear, 1991);
  assert.equal(record.historicalPeriod.endYear, 2025);
  assert.equal(record.months.every((item: any) => item.metrics.sampleYearCount === plan.representativeCell.sampleYearCount && item.metrics.dataCompleteness === plan.representativeCell.dataCompleteness), true);
  const monthNames: Record<number, string> = {2:"february",3:"march",5:"may",6:"june",7:"july",8:"august",9:"september",10:"october",11:"november",12:"december"};
  for (const [number, name] of Object.entries(monthNames)) {
    const actual = month(record, Number(number));
    const expected = plan.months[name];
    assert.equal(actual.recommendationEligible, expected.eligible, name);
    assert.equal(actual.overallScore, expected.score, name);
    assert.equal(actual.metrics.temperatureHikingMeanC, expected.meanTemperatureC, name);
    assert.equal(actual.metrics.wetDayProbability, expected.wetDayProbability, name);
    if ("precipitationMonthlyMeanMm" in expected) assert.equal(actual.metrics.precipitationMonthlyMeanMm, expected.precipitationMonthlyMeanMm, name);
    assert.equal(actual.metrics.snowDayProbability, expected.snowDayProbability, name);
    assert.equal(actual.metrics.hotDayProbability, expected.hotDayProbability, name);
    assert.equal(actual.metrics.severeHotDayProbability, expected.severeHotDayProbability, name);
    assert.equal(actual.metrics.daylightHoursMean, expected.daylightHoursMean, name);
    for (const [key, value] of Object.entries(expected)) {
      if (key.endsWith("Component")) assert.equal(actual.components[key.replace("Component", "")], value, `${name}/${key}`);
    }
  }
  assert.equal(eligibility.criticalComponentMinimumExclusive, plan.gate.criticalComponentMinimumExclusive);
  assert.deepEqual(eligibility.criticalComponents, plan.gate.criticalComponents);
  assert.equal(eligibility.ineligibleScoreMaximum, plan.gate.ineligibleScoreMaximum);
  assert.equal(weights.overall.wind, plan.gate.windWeight);
  assert.equal(plan.gate.precipitationIsGate, false);
});
