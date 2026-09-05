import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { DICT, t } from "../lib/i18n/dict";
import { locales, monthNumber, monthSlug, routes } from "../lib/i18n/config";
import { altLanguages, links } from "../lib/i18n/links";
import { pathFor, resolvePageId, type PageId } from "../lib/i18n/resolve";
import { routeCatalog } from "../lib/seo/route-catalog";
import type { Locale } from "../lib/data/types";

type Shape = string | Shape[] | { [key: string]: Shape };

/** Structural fingerprint of a dictionary subtree, ignoring the actual words. */
function shapeOf(value: unknown, path: string): Shape {
  if (typeof value === "string") return "string";
  if (typeof value === "function") return `fn/${(value as (...args: unknown[]) => string).length}`;
  if (Array.isArray(value)) return value.map((item, index) => shapeOf(item, `${path}[${index}]`));
  if (value && typeof value === "object") {
    const out: Record<string, Shape> = {};
    for (const [key, inner] of Object.entries(value)) out[key] = shapeOf(inner, `${path}.${key}`);
    return out;
  }
  throw new Error(`Unsupported dictionary value at ${path}: ${typeof value}`);
}

function walkStrings(value: unknown, path: string, visit: (text: string, path: string) => void): void {
  if (typeof value === "string") return visit(value, path);
  if (Array.isArray(value)) return value.forEach((item, index) => walkStrings(item, `${path}[${index}]`, visit));
  if (value && typeof value === "object") {
    for (const [key, inner] of Object.entries(value)) walkStrings(inner, `${path}.${key}`, visit);
  }
}

test("every locale carries the same dictionary shape", () => {
  const reference = shapeOf(DICT.en, "en");
  for (const locale of locales) {
    assert.deepEqual(shapeOf(DICT[locale], locale), reference, `dictionary shape drifted for "${locale}"`);
  }
});

test("no dictionary string is empty", () => {
  for (const locale of locales) {
    walkStrings(DICT[locale], locale, (text, path) => {
      assert.ok(text.trim().length > 0, `empty string at ${path}`);
    });
  }
});

test("German copy avoids the Gedankenstrich", () => {
  // A spaced en/em dash is the prose dash that reads as machine-written.
  // Unspaced dashes are numeric ranges (1991-2020, 1500-2200 m) and are fine.
  walkStrings(DICT.de, "de", (text, path) => {
    assert.ok(!/ [–—] /.test(text), `Gedankenstrich in ${path}: ${text}`);
  });
});

test("every catalogued route resolves to a page identity and rebuilds itself", () => {
  for (const route of routeCatalog()) {
    const page = resolvePageId(route.locale, route.segments);
    assert.ok(page, `unresolvable route: /${route.locale}/${route.segments.join("/")}`);
    const expected = `/${route.locale}${route.segments.length ? `/${route.segments.join("/")}` : ""}`;
    assert.equal(pathFor(page, route.locale), expected, `path round-trip failed for ${expected}`);
  }
});

test("a page identity survives a locale switch in both directions", () => {
  for (const route of routeCatalog()) {
    const page = resolvePageId(route.locale, route.segments)!;
    for (const target of locales) {
      const translated = pathFor(page, target);
      assert.ok(translated.startsWith(`/${target}`), `translated path lost its locale prefix: ${translated}`);
      const back = resolvePageId(target, translated.split("/").slice(2).filter(Boolean));
      assert.deepEqual(back, page, `round-trip through "${target}" changed the page identity of ${translated}`);
    }
  }
});

test("unknown segments resolve to nothing rather than to the home page", () => {
  assert.equal(resolvePageId("en", ["not-a-route"]), null);
  assert.equal(resolvePageId("en", [routes.destination.de, "mallorca"]), null, "German segments must not resolve under /en");
  assert.equal(resolvePageId("en", [routes.destination.en, "mallorca", "juni"]), null, "German month slug must not resolve under /en");
});

test("hreflang alternates cover every locale plus x-default", () => {
  const page: PageId = { kind: "destinationMonth", slug: "mallorca", month: 6 };
  const alternates = altLanguages((locale) => pathFor(page, locale), "de");
  for (const locale of locales) assert.ok(alternates.languages[locale]?.endsWith(pathFor(page, locale)), `missing hreflang for ${locale}`);
  assert.equal(alternates.languages["x-default"], alternates.languages.en, "x-default must point at the default locale");
  assert.ok(alternates.canonical.endsWith(pathFor(page, "de")), "canonical must be the current locale");
  assert.notEqual(alternates.languages.en, alternates.languages.de, "alternates must not collapse to one URL");
});

test("month slugs round-trip inside their own locale only", () => {
  for (const locale of locales) {
    for (let month = 1; month <= 12; month += 1) {
      assert.equal(monthNumber(monthSlug(month, locale), locale), month);
    }
  }
  assert.equal(monthNumber("juni", "en"), undefined);
  assert.equal(monthNumber("june", "de"), undefined);
});

/**
 * The i18n leak guard. A locale path written by hand survives every later
 * refactor and quietly sends readers to the wrong language, so components must
 * build hrefs through lib/i18n/links.ts instead.
 */
test("no component builds a locale path by hand", () => {
  const roots = ["components", "app"];
  const offenders: string[] = [];
  const scan = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) { scan(full); continue; }
      if (!/\.tsx?$/.test(entry)) continue;
      const source = readFileSync(full, "utf8");
      for (const [index, line] of source.split("\n").entries()) {
        const handWritten = /href=\{?["'`]\/(en|de)\b/.test(line)
          || /\(["'`]\/(en|de)["'`]\)/.test(line)
          || /`\/\$\{locale\}/.test(line);
        if (handWritten) offenders.push(`${full}:${index + 1}`);
      }
    }
  };
  for (const root of roots) scan(root);
  assert.deepEqual(offenders, [], `build these through links.*(locale): ${offenders.join(", ")}`);
});

test("the dictionary accessor returns the requested locale", () => {
  for (const locale of locales) assert.equal(t(locale).brand, DICT[locale].brand);
  assert.notEqual(t("de").home.heading, t("en").home.heading);
});

test("link builders stay inside their locale", () => {
  for (const locale of locales as Locale[]) {
    const built = [
      links.home(locale), links.finder(locale), links.destination(locale, "mallorca"),
      links.destinationMonth(locale, "mallorca", 6), links.ranking(locale, 6),
      links.themeRanking(locale, "warm", 5), links.compare(locale, "mallorca-vs-madeira"),
      links.methodology(locale), links.about(locale), links.privacy(locale),
      links.imprint(locale), links.credits(locale),
    ];
    for (const href of built) assert.ok(href.startsWith(`/${locale}/`) || href === `/${locale}`, `${href} escaped /${locale}`);
  }
});
