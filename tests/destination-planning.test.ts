import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { planningPilots, isPlanningPilot, typicalWetDays, planningNumber, daylightDuration } from "../lib/presentation/destination-planning";
import { planningCopy } from "../lib/i18n/planning";
import { getDestination } from "../lib/data/load";
import { links } from "../lib/i18n/links";

test("planning pilot is restricted to five explicit destinations", () => {
  assert.deepEqual(Object.keys(planningPilots).sort(), ["chamonix", "dolomites", "madeira", "mallorca", "tenerife"]);
  assert.equal(isPlanningPilot("banff"), false);
  assert.equal(isPlanningPilot("toString"), false);
  assert.deepEqual(Object.keys(planningCopy.en), Object.keys(planningCopy.de));
});

test("readable metrics preserve frequencies, calendar length and nonzero values", () => {
  assert.equal(typicalWetDays(1, 8), 31);
  assert.equal(typicalWetDays(1, 2), 28 + 8 / 30);
  assert.equal(planningNumber(typicalWetDays(0.1226, 8), "en"), "3.8");
  assert.equal(planningNumber(0.01, "en"), "<0.1");
  assert.equal(planningNumber(0.01, "de"), "<0,1");
  assert.equal(planningNumber(0, "en"), "0");
  assert.equal(planningNumber(NaN, "en"), "—");
  assert.equal(daylightDuration(13.3), "13 h 18 min");
  assert.equal(daylightDuration(13.999), "14 h 00 min");
});

const built = existsSync("out/en/index.html");
const html = (path: string) => readFileSync(`out${path}/index.html`, "utf8").replace(/<script[\s\S]*?<\/script>/g, "");

test("five pilots render useful metrics and only link eligible months in both languages", {skip: !built}, () => {
  for (const locale of ["en", "de"] as const) for (const slug of Object.keys(planningPilots)) {
    const destination = getDestination(slug)!;
    const overview = html(links.destination(locale, slug));
    const table = /<table class="planning-table"[\s\S]*?<\/table>/.exec(overview)![0];
    assert.equal((table.match(/<tr>/g) ?? []).length, 13);
    assert.doesNotMatch(overview, /class="score-ring/);
    for (const month of destination.months) {
      const path = links.destinationMonth(locale, slug, month.month);
      assert.equal(table.includes(`href="${path}/"`), month.recommendationEligible, path);
      if (!month.recommendationEligible) continue;
      const detail = html(path);
      assert.match(detail, /class="planning-metrics"/);
      assert.doesNotMatch(detail, /class="score-ring|class="component-grid/);
      assert.ok(detail.includes(planningCopy[locale].percentile));
      assert.ok(detail.includes(planningCopy[locale].snowNote));
      assert.ok(detail.includes(planningCopy[locale].wind));
      assert.ok(detail.includes(planningPilots[slug].url));
    }
  }
});

test("all exported pages remove public confidence and component-score cards", {skip: !built}, () => {
  for (const locale of ["en", "de"]) {
    for (const entry of readdirSync(`out/${locale}`, {recursive: true, encoding: "utf8"})) {
      if (!entry.endsWith(".html")) continue;
      const content = readFileSync(`out/${locale}/${entry}`, "utf8").replace(/<script[\s\S]*?<\/script>/g, "");
      assert.doesNotMatch(content, /data confidence|Datenvertrauen|Six components|class="component-grid/i, entry);
    }
  }
});
