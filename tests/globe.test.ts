import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { getAllDestinations, getRanking } from "../lib/data/load";
import { globeDestinations, globeMonthLeaders } from "../lib/globe/data";
import { readGlobeQuery, writeGlobeQuery } from "../lib/globe/query";
import { links } from "../lib/i18n/links";
import { pathFor, resolvePageId } from "../lib/i18n/resolve";
import { pageSeo } from "../lib/seo/page-seo";
import { scoreLevel } from "../lib/scoring/index";

const LEVEL_CODE: Record<string, string> = {excellent: "E", "very-good": "V", good: "G", fair: "F", poor: "P"};

test("the globe carries every destination, with twelve months each", () => {
  const globe = globeDestinations("en");
  assert.equal(globe.length, getAllDestinations().length);
  for (const point of globe) {
    assert.equal(point.m.length, 12, point.s);
    assert.equal(point.l.length, 12, point.s);
    assert.ok(Math.abs(point.la) <= 90 && Math.abs(point.lo) <= 180, point.s);
  }
});

test("a light is coloured only by a published, recommendable score", () => {
  const bySlug = new Map(getAllDestinations().map((destination) => [destination.slug, destination]));
  for (const point of globeDestinations("en")) {
    const destination = bySlug.get(point.s)!;
    point.m.forEach((score, index) => {
      const month = destination.months[index];
      if (!month?.recommendationEligible || month.overallScore === null) {
        assert.equal(score, null, `${point.s} month ${index + 1}`);
        assert.equal(point.l[index], "-", `${point.s} month ${index + 1}`);
      } else {
        assert.equal(score, month.overallScore);
        assert.equal(point.l[index], LEVEL_CODE[scoreLevel(month.overallScore)]);
      }
    });
  }
});

test("the globe's count each month matches the published ranking", () => {
  const globe = globeDestinations("en");
  for (let month = 1; month <= 12; month += 1) {
    const lit = globe.filter((point) => point.l[month - 1] !== "-").map((point) => point.s).sort();
    const ranked = getRanking(month).entries.map((entry) => entry.slug).sort();
    assert.deepEqual(lit, ranked, `month ${month}`);
  }
  const leaders = globeMonthLeaders("en");
  assert.equal(leaders.length, 12);
  for (const item of leaders) assert.equal(item.count, getRanking(item.month).entries.length);
});

test("German globe uses the German destination names", () => {
  const de = new Map(globeDestinations("de").map((point) => [point.s, point]));
  const en = new Map(globeDestinations("en").map((point) => [point.s, point]));
  assert.equal(de.size, en.size);
  assert.ok([...de.values()].some((point) => point.n !== en.get(point.s)!.n), "at least one name differs");
});

test("the globe page resolves in both locales and is indexable", () => {
  assert.equal(links.globe("en"), "/en/hiking-globe");
  assert.equal(links.globe("de"), "/de/wander-globus");
  for (const locale of ["en", "de"] as const) {
    const segment = links.globe(locale).split("/").pop()!;
    const page = resolvePageId(locale, [segment]);
    assert.deepEqual(page, {kind: "globe"});
    assert.equal(pathFor(page!, locale), links.globe(locale));
    assert.equal(pageSeo(page!, locale).index, true);
  }
});

test("land dots are a sane, deterministic sample", () => {
  const land = JSON.parse(readFileSync("lib/globe/land-points.json", "utf8")) as {samples: number; latLon: number[]};
  assert.equal(land.latLon.length % 2, 0);
  const count = land.latLon.length / 2;
  // Land is about 29 percent of the earth's surface.
  assert.ok(count > land.samples * 0.24 && count < land.samples * 0.34, `${count} land points`);
});

test("the built globe page is a readable document without WebGL", {skip: !existsSync("out/en/index.html")}, () => {
  for (const locale of ["en", "de"] as const) {
    const html = readFileSync(`out${links.globe(locale)}/index.html`, "utf8");
    assert.match(html, /<h1[^>]*>/);
    for (const item of globeMonthLeaders(locale)) {
      for (const leader of item.leaders) assert.ok(html.includes(`href="${links.destination(locale, leader.slug)}`), `${locale} ${leader.slug}`);
      assert.ok(html.includes(`href="${links.ranking(locale, item.month)}`), `${locale} ranking ${item.month}`);
    }
  }
});

test("the globe page shares its own preview picture", {skip: !existsSync("out/en/index.html")}, () => {
  for (const locale of ["en", "de"] as const) {
    assert.ok(existsSync(`public/images/social/hiking-globe-${locale}.jpeg`), locale);
    const html = readFileSync(`out${links.globe(locale)}/index.html`, "utf8");
    assert.match(html, new RegExp(`<meta property="og:image" content="https://besttimetohike\\.com/images/social/hiking-globe-${locale}\\.jpeg"`));
  }
});

const SHARE_SLUGS = ["pirin", "dolomites", "torres-del-paine"];

test("a shared globe link opens on its month and destination", () => {
  assert.deepEqual(readGlobeQuery("?month=7&to=dolomites", SHARE_SLUGS), {month: 7, index: 1});
  assert.deepEqual(readGlobeQuery("?month=13&to=atlantis", SHARE_SLUGS), {month: null, index: null});
  assert.deepEqual(readGlobeQuery("?month=2.5", SHARE_SLUGS), {month: null, index: null});
  assert.deepEqual(readGlobeQuery("", SHARE_SLUGS), {month: null, index: null});
});

test("the globe address keeps other parameters and drops the destination when none is selected", () => {
  const shared = writeGlobeQuery("https://besttimetohike.com/de/wander-globus/?utm_source=x", 7, "pirin");
  assert.equal(shared, "https://besttimetohike.com/de/wander-globus/?utm_source=x&month=7&to=pirin");
  assert.equal(writeGlobeQuery(shared, 8, null), "https://besttimetohike.com/de/wander-globus/?utm_source=x&month=8");
});

test("every real destination round-trips through a share link", () => {
  const real = globeDestinations("en").map((destination) => destination.s);
  real.forEach((slug, index) => {
    const url = writeGlobeQuery("https://besttimetohike.com/en/hiking-globe/", 5, slug);
    assert.deepEqual(readGlobeQuery(new URL(url).search, real), {month: 5, index}, slug);
  });
});
