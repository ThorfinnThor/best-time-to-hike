import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { DICT } from "../lib/i18n/dict";
import { getDestinationIndex } from "../lib/data/load";
import { locales, monthName, themeKeys } from "../lib/i18n/config";
import { links } from "../lib/i18n/links";

/**
 * Assertions against the built HTML.
 *
 * Every finding in the September audit that mattered was invisible to the unit
 * tests: relaxations() passed its own test while nothing rendered it, and the
 * region labeller was correct while two components printed raw slugs past it.
 * The tests below read the export, which is the only place those two classes of
 * fault are observable.
 *
 * They skip when out/ is absent, so `pnpm test` on its own stays fast; `pnpm
 * verify` builds first and then they run for real.
 */
const OUT = "out";
const built = existsSync(`${OUT}/en/index.html`);
const page = (path: string) => readFileSync(`${OUT}/${path}`, "utf8");
/** Visible text only: the RSC payload repeats the page as a JSON string. */
const visible = (html: string) => {
  const body = html.replace(/<script[\s\S]*?<\/script>/g, "");
  const main = /<main[\s\S]*?<\/main>/.exec(body)?.[0] ?? body;
  return main.replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ");
};

const PAGES = [
  "en/index.html", "de/index.html",
  "en/finder/index.html",
  "en/hiking-destinations/dolomites/index.html",
  "en/hiking-destinations/dolomites/october/index.html",
  "en/best-hiking-destinations/june/index.html",
  "en/methodology/index.html",
];

test("category links open unselected month pickers in both languages", {skip: !built}, () => {
  for (const locale of locales) {
    const home = page(`${locale}/index.html`).replace(/<script[\s\S]*?<\/script>/g, "");
    const header = /<header[\s\S]*?<\/header>/.exec(home)![0];
    for (const theme of [undefined, ...themeKeys]) {
      const path = theme ? links.themeIndex(locale, theme) : links.rankingIndex(locale);
      if (theme !== "snowFree") assert.ok(header.includes(`href="${path}/"`), `${path} missing from header`);
      const html = page(`${path.slice(1)}/index.html`).replace(/<script[\s\S]*?<\/script>/g, "");
      const picker = /<nav class="ranking-months"[\s\S]*?<\/nav>/.exec(html)![0];
      assert.equal((picker.match(/<a /g) ?? []).length, 12);
      assert.doesNotMatch(picker, /aria-current/);
      assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
      for (let month = 1; month <= 12; month++) {
        const target = theme ? links.themeRanking(locale, theme, month) : links.ranking(locale, month);
        assert.ok(picker.includes(`href="${target}/"`), `${target} missing from picker`);
        assert.ok(picker.includes(monthName(month, locale)));
        assert.ok(existsSync(`${OUT}${target}/index.html`), `${target} not exported`);
        const result = page(`${target.slice(1)}/index.html`).replace(/<script[\s\S]*?<\/script>/g, "");
        const switcher = /<nav class="ranking-months"[\s\S]*?<\/nav>/.exec(result)![0];
        assert.equal((switcher.match(/aria-current="page"/g) ?? []).length, 1);
        assert.match(switcher, new RegExp(`aria-current="page"[^>]*>${monthName(month, locale)}<`));
        const another = month === 12 ? 1 : month + 1;
        assert.ok(switcher.includes(`href="${theme ? links.themeRanking(locale, theme, another) : links.ranking(locale, another)}/"`));
      }
    }
  }
});

test("no page prints a taxonomy or destination id as text", {skip: !built}, () => {
  // east-africa-highlands reached readers from two components while all 62
  // regions had labels in both locales. Matching against the real id sets
  // rather than a hyphen heuristic keeps ordinary prose (model-grid,
  // 1991-2020) out of it.
  const ids = new Set<string>([
    ...Object.keys(DICT.en.taxonomy.regions),
    ...Object.keys(DICT.en.taxonomy.continents),
    ...Object.keys(DICT.en.taxonomy.tags),
    ...getDestinationIndex().map((entry) => entry.slug),
  ].filter((id) => id.includes("-")));
  // Case-sensitive on purpose: a leaked id is lowercase in the text node, while
  // a legitimate label like "Colorado-Plateau" is not.
  for (const path of PAGES) {
    const words = new Set(visible(page(path)).split(/[^A-Za-z0-9-]+/));
    const found = [...ids].filter((id) => words.has(id));
    assert.deepEqual(found, [], `${path} renders ids as text: ${found.join(", ")}`);
  }
});

test("the finder ships the render path for its empty state", {skip: !built}, () => {
  // The offers only appear once a search returns nothing, so they are absent
  // from the prerendered page by design. What has to be true is that the
  // component shipped them at all: relaxations() spent months implemented,
  // translated and unit-tested while `offers` was computed and never rendered.
  const chunks = readdirSync(`${OUT}/_next/static/chunks`)
    .filter((file) => file.endsWith(".js"))
    .map((file) => readFileSync(`${OUT}/_next/static/chunks/${file}`, "utf8"));
  assert.ok(chunks.some((chunk) => chunk.includes("finder-offers")), "no chunk renders the offers");
  assert.ok(chunks.some((chunk) => chunk.includes(DICT.en.finder.relax.everything)), "the offer labels are not shipped");
});

test("every page has exactly one h1 and no skipped heading level", {skip: !built}, () => {
  for (const path of PAGES) {
    const levels = [...page(path).matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]));
    assert.equal(levels.filter((level) => level === 1).length, 1, `${path} should have exactly one h1`);
    for (let i = 1; i < levels.length; i += 1) {
      assert.ok(levels[i] - levels[i - 1] <= 1, `${path} jumps from h${levels[i - 1]} to h${levels[i]}`);
    }
  }
});

test("no elevation is printed as a range from a value to itself", {skip: !built}, () => {
  // All 315 destinations are one grid cell, so "2136.4-2136.4 m" was on every card.
  for (const path of PAGES) {
    const text = visible(page(path));
    const selfRange = /([\d.,]+)\s*(?:m\s*)?[–-]\s*\1\s*m/.exec(text);
    assert.equal(selfRange, null, `${path} prints ${selfRange?.[0]}`);
  }
});

test("the data notice says nothing about a beta", {skip: !built}, () => {
  for (const path of [...PAGES, "en/privacy/index.html", "de/datenschutz/index.html"]) {
    if (!existsSync(`${OUT}/${path}`)) continue;
    assert.ok(!/\bbeta\b/i.test(visible(page(path))), `${path} still says beta`);
  }
});

test("a provisional export is blocked from indexing at every rendered layer", {skip: !built}, () => {
  const manifest = JSON.parse(readFileSync("public/data/hiking/manifest.json", "utf8"));
  if (manifest.datasetStatus === "production") return;
  assert.match(page("robots.txt"), /User-Agent: \*\s+Disallow: \//);
  assert.doesNotMatch(page("sitemap.xml"), /<url>/);
  for (const path of PAGES) {
    assert.match(page(path), /<meta name="robots" content="noindex, follow"\/>/, `${path} is not noindex`);
  }
});

test("both imprint pages carry the mandatory Copernicus DEM notices", {skip: !built}, () => {
  for (const path of ["en/imprint/index.html", "de/impressum/index.html"]) {
    const text = visible(page(path));
    assert.match(text, /Produced using Copernicus WorldDEM-30 © DLR e\.V\. 2010-2014/);
    assert.match(text, /Copernicus programme|Copernicus-Programm/);
    assert.match(text, /do not incur any liability|haften nicht/);
  }
});

test("hreflang alternates point at pages that link back", {skip: !built}, () => {
  for (const path of PAGES) {
    for (const [, href] of page(path).matchAll(/hrefLang="de" href="https:\/\/besttimetohike\.com([^"]*)"/g)) {
      const target = `${OUT}${href}index.html`;
      assert.ok(existsSync(target), `${path} names a German alternate that does not exist: ${href}`);
      assert.ok(page(`${href.replace(/^\//, "")}index.html`).includes(`hrefLang="en"`),
        `${href} does not link back`);
    }
  }
});
