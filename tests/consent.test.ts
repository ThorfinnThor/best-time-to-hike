import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DICT } from "../lib/i18n/dict";

/**
 * Google Analytics runs only after an explicit opt-in. These checks keep the
 * three places that promise that in agreement: the loader, the CSP that lets
 * it through, and the privacy notice that describes it.
 */
test("gtag.js is injected by the consent module and nowhere else", () => {
  const consent = readFileSync("lib/client/consent.ts", "utf8");
  assert.match(consent, /G-8JZ4DZKHX1/);
  assert.match(consent, /analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied"/);
  assert.match(consent, /allow_google_signals: false/);
  const files = (dir: string): string[] => readdirSync(dir, {withFileTypes: true}).flatMap((entry) =>
    entry.isDirectory() ? files(join(dir, entry.name)) : /\.tsx?$/.test(entry.name) ? [join(dir, entry.name)] : []);
  const loaders = ["app", "components", "lib"].flatMap(files).filter((file) => readFileSync(file, "utf8").includes("googletagmanager.com"));
  assert.deepEqual(loaders, [join("lib", "client", "consent.ts")]);
});

test("the CSP admits Google Analytics", () => {
  const csp = /Content-Security-Policy: (.*)/.exec(readFileSync("public/_headers", "utf8"))?.[1] ?? "";
  const directive = (name: string) => new RegExp(`${name} [^;]*`).exec(csp)?.[0] ?? "";
  assert.match(directive("script-src"), /https:\/\/www\.googletagmanager\.com/);
  assert.match(directive("connect-src"), /https:\/\/\*\.google-analytics\.com/);
  assert.match(directive("connect-src"), /https:\/\/\*\.analytics\.google\.com/);
});

test("the privacy notice describes Google Analytics in both languages", () => {
  for (const [locale, needles] of [
    ["en", ["Google Ireland Limited", "Art. 6(1)(a) GDPR", "§ 25(1) TDDDG", "14 months", "2 years", "Data Privacy Framework", "Cookie settings"]],
    ["de", ["Google Ireland Limited", "Art. 6 Abs. 1 lit. a DSGVO", "§ 25 Abs. 1 TDDDG", "14 Monate", "2 Jahren", "Data Privacy Framework", "Cookie-Einstellungen"]],
  ] as const) {
    const text = JSON.stringify(DICT[locale].info.privacy);
    for (const needle of needles) assert.ok(text.includes(needle), `${locale} privacy notice is missing "${needle}"`);
  }
});

test("no exported page loads gtag.js before consent", {skip: !existsSync("out/en/index.html")}, () => {
  for (const path of ["out/en/index.html", "out/de/index.html"]) {
    const html = readFileSync(path, "utf8");
    assert.doesNotMatch(html, /<script[^>]+googletagmanager\.com/);
  }
});

test("the privacy notice discloses Cloudflare Web Analytics and GetYourGuide on-device storage", () => {
  for (const locale of ["en", "de"] as const) {
    const text = JSON.stringify(DICT[locale].info.privacy);
    for (const needle of ["Cloudflare Web Analytics", "static.cloudflareinsights.com", "/cdn-cgi/rum", "session_id", "gyg_visitor_id", "partner_id", "collector.getyourguide.com"]) {
      assert.ok(text.includes(needle), `${locale} privacy notice is missing "${needle}"`);
    }
  }
});
