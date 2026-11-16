import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import names from "../data-config/i18n/destination-names.json";
import { getAllDestinations } from "../lib/data/load";
import { countryName, destinationName } from "../lib/i18n/names";
import { links } from "../lib/i18n/links";
import { pageSeo } from "../lib/seo/page-seo";

const destinations = getAllDestinations();
const bySlug = new Map(destinations.map((destination) => [destination.slug, destination]));

test("every German name belongs to a published destination and actually differs", () => {
  for (const [slug, german] of Object.entries(names.de)) {
    const destination = bySlug.get(slug);
    assert.ok(destination, `${slug} is not a destination`);
    assert.notEqual(german, destination.name, `${slug} repeats its catalogue name`);
    assert.doesNotMatch(german, / [–—] /, `${slug}: no spaced dash in German`);
  }
});

test("English keeps the catalogue name; German falls back to it when no form is listed", () => {
  const dolomites = bySlug.get("dolomites")!;
  assert.equal(destinationName(dolomites, "en"), "Dolomites");
  assert.equal(destinationName(dolomites, "de"), "Dolomiten");
  const madeira = bySlug.get("madeira")!;
  assert.equal(destinationName(madeira, "de"), madeira.name);
});

test("country names follow the page language", () => {
  const dolomites = bySlug.get("dolomites")!;
  assert.equal(countryName(dolomites, "en"), dolomites.countryName);
  assert.equal(countryName(dolomites, "de"), "Italien");
  for (const destination of destinations) assert.ok(countryName(destination, "de").length > 1, destination.slug);
});

test("German titles use the German name", () => {
  assert.match(pageSeo({kind: "destination", slug: "dolomites"}, "de").title, /^Beste Wanderzeit für Dolomiten/);
  assert.match(pageSeo({kind: "destination", slug: "dolomites"}, "en").title, /^Best time to hike Dolomites/);
});

test("built German destination pages show German destination and country names", {skip: !existsSync("out/de/index.html")}, () => {
  const html = readFileSync(`out${links.destination("de", "dolomites")}/index.html`, "utf8");
  assert.match(html, /<h1>[^<]*Dolomiten/);
  assert.match(html, /Italien/);
});
