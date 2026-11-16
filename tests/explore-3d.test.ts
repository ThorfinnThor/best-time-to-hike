import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { getAllDestinations, getDestination } from "../lib/data/load";
import { googleEarthUrl } from "../lib/hiking/earth";
import { links } from "../lib/i18n/links";

test("the 3D link centres on the walking-area coordinate, not the model cell", () => {
  const dolomites = getDestination("dolomites")!;
  assert.equal(googleEarthUrl(dolomites), `https://earth.google.com/web/@${dolomites.coordinates.lat.toFixed(5)},${dolomites.coordinates.lon.toFixed(5)},${Math.round(dolomites.elevation.medianM)}a,12000d,35y,0h,60t,0r`);
  for (const destination of getAllDestinations()) {
    assert.match(googleEarthUrl(destination), /^https:\/\/earth\.google\.com\/web\/@-?\d+\.\d{5},-?\d+\.\d{5},\d+a,12000d,35y,0h,60t,0r$/, destination.slug);
  }
});

test("destination pages open the 3D view in a new tab without passing a referrer", {skip: !existsSync("out/en/index.html")}, () => {
  for (const [locale, label] of [["en", "Explore in 3D"], ["de", "In 3D erkunden"]] as const) {
    const html = readFileSync(`out${links.destination(locale, "dolomites")}/index.html`, "utf8");
    const anchor = /<a[^>]+href="https:\/\/earth\.google\.com\/web\/[^"]+"[^>]*>[^<]*/.exec(html)?.[0] ?? "";
    assert.match(anchor, /target="_blank"/);
    assert.match(anchor, /rel="noopener noreferrer"/);
    assert.ok(anchor.includes(label), `${locale} label`);
  }
});
