import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import config from "../data-config/sources/route-above-model-cell.json";
import representativeness from "../data-config/methodology/era5-land-representativeness-v1.json";
import { getAllDestinations, getDestination } from "../lib/data/load";
import { routeAboveModel, routeAboveModelIds } from "../lib/hiking/route-above-model";
import { locales } from "../lib/i18n/config";
import { destinationPath } from "../lib/i18n/links";

/**
 * The route-above-model notice is a claim about two heights, so the list that
 * drives it is checked against the published cell rather than trusted.
 */
const goodMismatchMaxM = representativeness.modelOrography.goodMismatchMaxM;
const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

test("every listed destination is published and its route clears the cell by more than the good band", () => {
  assert.ok(routeAboveModelIds().length > 0);
  for (const id of routeAboveModelIds()) {
    const destination = getDestination(id);
    assert.ok(destination, `${id} is not published`);
    const entry = routeAboveModel(id)!;
    assert.equal(entry.routeElevationM, median(entry.routePoints.map((point) => point.elevationM)), `${id} routeElevationM is not the median of its route points`);
    const cellM = destination.representativeCell.modelElevationM;
    assert.ok(entry.routeElevationM - cellM > goodMismatchMaxM, `${id}: route ${entry.routeElevationM} m is within ${goodMismatchMaxM} m of the ${cellM} m cell`);
    assert.ok(entry.sources.length > 0 && entry.sources.every((source) => source.url.startsWith("https://")), `${id} needs an https source`);
  }
});

test("no nearby cell could be picked instead", () => {
  for (const [id, entry] of Object.entries(config.destinations)) {
    const cellM = getDestination(id)!.representativeCell.modelElevationM;
    assert.ok(entry.highestNearbyCellM >= Math.round(cellM), `${id}: highest nearby cell is below the published one`);
    assert.ok(entry.highestNearbyCellM < entry.routeElevationM, `${id}: a nearby cell reaches the route`);
  }
});

test("reviewed-but-unlisted destinations are not also listed", () => {
  for (const id of Object.keys(config.reviewedNotListed)) assert.equal(routeAboveModel(id), null, id);
});

const built = existsSync("out/en/index.html");
const html = (path: string) => readFileSync(`out${path}/index.html`, "utf8").replace(/<script[\s\S]*?<\/script>/g, "");
const NOTICE = /class="[^"]*\broute-above-model\b/;

test("the notice renders on exactly the listed destination pages, in both languages", {skip: !built}, () => {
  const listed = new Set(routeAboveModelIds());
  for (const destination of getAllDestinations()) {
    for (const locale of locales) {
      const page = html(destinationPath(locale, destination.slug));
      assert.equal(NOTICE.test(page), listed.has(destination.id), `${locale} ${destination.id}`);
    }
  }
});

test("the notice renders on the listed destinations' month pages", {skip: !built}, () => {
  for (const id of routeAboveModelIds()) {
    const destination = getDestination(id)!;
    for (const month of destination.months.filter((item) => item.recommendationEligible)) {
      for (const locale of locales) assert.match(html(destinationPath(locale, destination.slug, month.month)), NOTICE, `${locale} ${id} ${month.month}`);
    }
  }
});
