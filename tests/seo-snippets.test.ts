import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { getAllDestinations, getRanking } from "../lib/data/load";
import { monthSpan } from "../lib/i18n/config";
import { links } from "../lib/i18n/links";
import { pageSeo } from "../lib/seo/page-seo";
import { areaById, areaCatalogue, areasFor, areasOpenIn, relatedAreas } from "../lib/seo/areas";

/**
 * Titles and snippets are what a searcher sees before the page, and internal
 * links are how a crawler finds the area pages at all. These pin both.
 */
test("monthSpan reads as a phrase, wraps the new year and never joins with slashes", () => {
  assert.equal(monthSpan([4], "en"), "in April");
  assert.equal(monthSpan([5, 6, 7, 8, 9], "de"), "von Mai bis September");
  assert.equal(monthSpan([11, 12, 1], "en"), "from November to January");
  assert.equal(monthSpan([1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12], "de"), "ganzjährig außer September");
  assert.equal(monthSpan([3, 6, 7, 8], "en"), "in March and from June to August");
  assert.equal(monthSpan(Array.from({length: 12}, (_, i) => i + 1), "de"), "ganzjährig");
  assert.equal(monthSpan([], "en"), "");
});

test("recommendable destinations lead with the best-time phrase; withheld ones never do", () => {
  for (const destination of getAllDestinations()) {
    for (const locale of ["en", "de"] as const) {
      const title = pageSeo({kind: "destination", slug: destination.slug}, locale).title;
      const recommendable = destination.months.some((month) => month.recommendationEligible);
      const lead = locale === "de" ? "Beste Wanderzeit für " : "Best time to hike ";
      if (recommendable) assert.ok(title.startsWith(lead), `${destination.slug} ${locale}: ${title}`);
      else assert.ok(!title.startsWith(lead), `${destination.slug} ${locale} claims a best time: ${title}`);
    }
  }
  // The named regression set from CLAUDE.md. Torres del Paine has since gained
  // eligible months, so each is checked against its data rather than assumed held.
  for (const slug of ["sikkim", "zermatt", "el-chalten", "torres-del-paine"]) {
    const destination = getAllDestinations().find((item) => item.slug === slug);
    if (!destination || destination.months.some((month) => month.recommendationEligible)) continue;
    assert.doesNotMatch(pageSeo({kind: "destination", slug}, "en").title, /^Best time to hike/);
    assert.doesNotMatch(pageSeo({kind: "destination", slug}, "de").title, /^Beste Wanderzeit/);
  }
});

test("area and month-ranking descriptions are concrete and readable", () => {
  for (const area of areaCatalogue()) {
    for (const locale of ["en", "de"] as const) {
      const {description} = pageSeo({kind: "areaRanking", area: area.id}, locale);
      assert.doesNotMatch(description, / \/ /, `${area.id} ${locale}`);
      assert.ok(description.includes(area.destinations[0].name) || description.endsWith("…"), `${area.id} ${locale} names no destination`);
    }
  }
  for (let month = 1; month <= 12; month += 1) {
    const ranking = getRanking(month);
    const {description} = pageSeo({kind: "ranking", month}, "en");
    assert.ok(description.startsWith(`${ranking.entries.length} destinations`), description);
    if (ranking.entries.length) assert.ok(description.includes(ranking.entries[0].name) || description.endsWith("…"), description);
  }
});

test("related-area helpers only return pages that exist", () => {
  for (const destination of getAllDestinations()) {
    for (const area of areasFor(destination)) assert.ok(areaById(area.id));
  }
  for (let month = 1; month <= 12; month += 1) {
    for (const {area, count} of areasOpenIn(month)) {
      assert.ok(count > 0 && areaById(area.id));
    }
  }
  for (const area of areaCatalogue()) {
    const {parents, children} = relatedAreas(area);
    if (area.kind === "region") assert.equal(children.length, 0);
    else assert.equal(parents.length, 0);
    for (const item of [...parents, ...children]) assert.ok(areaById(item.id));
  }
});

test("the removed East Africa area redirects to the Africa page in both languages", () => {
  const redirects = readFileSync("public/_redirects", "utf8");
  assert.ok(areaById("africa"), "the redirect target must exist");
  assert.equal(areaById("east-africa-highlands"), null);
  for (const locale of ["en", "de"] as const) {
    const from = links.areaRanking(locale, "east-africa-highlands");
    const to = `${links.areaRanking(locale, "africa")}/`;
    assert.ok(redirects.includes(`${from} ${to} 301`), `${from} missing`);
    assert.ok(redirects.includes(`${from}/ ${to} 301`), `${from}/ missing`);
  }
});

test("built destination pages link to their area page and their best months", {skip: !existsSync("out/en/index.html")}, () => {
  const destination = getAllDestinations().find((item) => item.bestMonths.length && areasFor(item).length)!;
  const html = readFileSync(`out${links.destination("en", destination.slug)}/index.html`, "utf8");
  assert.ok(html.includes(`href="${links.areaRanking("en", areasFor(destination)[0].id)}/"`) || html.includes(`href="${links.areaRanking("en", areasFor(destination)[0].id)}"`));
  assert.ok(html.includes(`href="${links.ranking("en", destination.bestMonths[0])}/"`) || html.includes(`href="${links.ranking("en", destination.bestMonths[0])}"`));
});
