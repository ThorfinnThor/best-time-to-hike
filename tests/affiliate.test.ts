import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import destinationsSource from "../data-config/sources/destinations.json";
import { affiliateActivityOffers, affiliateConfig, affiliateDestinationSearches } from "../lib/affiliate/config";
import { affiliateRel, buildActivityOfferUrl, buildDestinationSearchUrl, validateAffiliateSources } from "../lib/affiliate/affiliate";
import { staticAffiliateRedirectHtml } from "../lib/affiliate/static-redirect";
import type { AffiliateConfig } from "../lib/affiliate/types";
import type { DestinationConfig } from "../lib/data/types";

const destinations = destinationsSource as DestinationConfig[];

test("affiliate sources are internally valid and do not affect ranking inputs", () => {
  assert.doesNotThrow(() => validateAffiliateSources(affiliateConfig, affiliateDestinationSearches, affiliateActivityOffers, destinations));
  assert.equal(new Set(affiliateDestinationSearches.map((item) => item.destinationId)).size, affiliateDestinationSearches.length);
  assert.ok(affiliateDestinationSearches.length >= 25, "the reviewed stay-area pilot should remain substantial");
  assert.equal(affiliateDestinationSearches.length, destinations.length, "every published destination needs a Booking search base");
  assert.deepEqual(new Set(affiliateDestinationSearches.map((item) => item.destinationId)), new Set(destinations.map((destination) => destination.id)));
  assert.equal(JSON.parse(readFileSync("config/architecture-invariants.json", "utf8")).affiliateInfluencesRanking, false);
  for (const path of ["scripts/score/score.ts", "scripts/export/export.ts"]) {
    assert.doesNotMatch(readFileSync(path, "utf8"), /affiliate/i, `${path} must not import commercial data`);
  }
});

test("Booking search keeps its nested destination and site-specific campaign", () => {
  const config = structuredClone(affiliateConfig) as AffiliateConfig;
  const partner = config.partners.find((item) => item.id === "booking-stay-search")!;
  partner.enabled = true;
  partner.affiliateId = "123456789-12345678";
  const search = affiliateDestinationSearches.find((item) => item.destinationId === "madeira")!;
  const destination = destinations.find((item) => item.id === "madeira")!;
  const built = buildDestinationSearchUrl(config, search, destination);
  assert.ok(built);
  const outer = new URL(built);
  assert.equal(outer.hostname, "www.kqzyfj.com");
  assert.equal(outer.searchParams.get("sid"), "besttimetohike-madeira");
  const nested = new URL(outer.searchParams.get("url")!);
  assert.equal(nested.hostname, "www.booking.com");
  assert.equal(nested.searchParams.get("ss"), "Funchal Madeira Portugal");
});

test("activity searches keep the confirmed partner IDs and campaign", () => {
  const source = affiliateDestinationSearches.find((item) => item.destinationId === "madeira")!;
  const destination = destinations.find((item) => item.id === "madeira")!;
  const expected = {
    "getyourguide-activities": {host: "www.getyourguide.com", idKey: "partner_id", id: "BKWM9K1"},
    "viator-activities": {host: "www.viator.com", idKey: "pid", id: "P00314274"},
  } as const;
  for (const [partnerId, values] of Object.entries(expected)) {
    const built = buildDestinationSearchUrl(affiliateConfig, {...source, partnerId}, destination);
    assert.ok(built);
    const url = new URL(built);
    assert.equal(url.hostname, values.host);
    assert.equal(url.searchParams.get(values.idKey), values.id);
    assert.equal(url.searchParams.get("campaign") ?? url.searchParams.get("cmp"), partnerId === "getyourguide-activities" ? "Besttimetohike" : "BestTimeToHike");
    assert.equal(url.searchParams.get("text") ?? url.searchParams.get("q"), "Funchal Madeira Portugal");
  }
});

test("activity offers retain the provider tracking parameters", () => {
  const config = structuredClone(affiliateConfig) as AffiliateConfig;
  for (const partner of config.partners) {
    if (partner.type === "activity") {
      partner.enabled = true;
      partner.affiliateId = partner.id.startsWith("getyourguide") ? "GYG123" : "VIA123";
    }
  }
  for (const offer of affiliateActivityOffers) {
    const built = buildActivityOfferUrl(config, offer);
    assert.ok(built);
    const url = new URL(built);
    if (offer.partnerId === "getyourguide-activities") assert.equal(url.searchParams.get("partner_id"), "GYG123");
    if (offer.partnerId === "viator-activities") {
      assert.equal(url.searchParams.get("pid"), "VIA123");
      assert.equal(url.searchParams.get("mcid"), "42383");
      assert.equal(url.searchParams.get("medium"), "link");
    }
  }
});

test("static forwarding pages cannot be indexed and visibly fall back", () => {
  const html = staticAffiliateRedirectHtml("https://example.com/product?x=1&y=2");
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.match(html, /rel="sponsored nofollow noopener noreferrer"/);
  assert.match(html, /window\.location\.replace/);
  assert.match(html, /x=1&amp;y=2/);
  assert.equal(affiliateRel(), "sponsored nofollow");
});

test("affiliate UI is labelled and legal copy no longer denies its existence", () => {
  const component = readFileSync("components/affiliate/AffiliateDestinationModules.tsx", "utf8");
  const widget = readFileSync("components/affiliate/GetYourGuideAutoWidget.tsx", "utf8");
  const layout = readFileSync("app/layout.tsx", "utf8");
  const headers = readFileSync("public/_headers", "utf8");
  const privacy = readFileSync("lib/i18n/dict.ts", "utf8");
  assert.match(component, /Affiliate disclosure/);
  assert.match(component, /Affiliate-Hinweis/);
  assert.match(component, /affiliateRel\(\)/);
  assert.match(widget, /data-gyg-widget="auto"/);
  assert.match(widget, /data-gyg-cmp="Besttimetohike"/);
  assert.match(layout, /widget\.getyourguide\.com\/dist\/pa\.umd\.production\.min\.js/);
  assert.match(layout, /async defer/);
  assert.match(headers, /frame-src https:\/\/widget\.getyourguide\.com/);
  assert.match(privacy, /GetYourGuide integration analyzer loads on every page/);
  assert.match(privacy, /GetYourGuide-Integrations-Analyzer wird auf jeder Seite geladen/);
  assert.doesNotMatch(privacy, /currently carries no advertising, no affiliate links/);
  assert.doesNotMatch(privacy, /enthält derzeit keine Werbung, keine Affiliate-Links/);
});
