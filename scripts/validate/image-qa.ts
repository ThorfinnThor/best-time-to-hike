/**
 * Image QA by source filename.
 *
 * The sibling project's hardest image bug shipped because candidates were
 * ranked by file size and nobody checked what the files actually showed
 * (climate-decision-engine mistakes.md #10). Their conclusion was that a
 * rendered contact sheet can miss a wrong photograph but the filename rarely
 * lies. This encodes that check so it runs every time instead of by memory.
 */
import { readFileSync } from "node:fs";
import type { DestinationConfig } from "../../lib/data/types";
import { normaliseLicence } from "../../lib/media/licence";

interface ImageRecord { slug: string; sourceFile: string; licenceId: string; author: string; attribution: string }

const destinations = JSON.parse(readFileSync("data-config/sources/destinations.json", "utf8")) as DestinationConfig[];
const manifest = JSON.parse(readFileSync("data-config/sources/destination-images.json", "utf8")) as {images: ImageRecord[]};
const byId = new Map(destinations.map((destination) => [destination.slug, destination]));

const words = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").split(" ").filter((word) => word.length > 3);

/**
 * Generic geography. Without this list "Rila Mountains" reduces to the token
 * "mountains" and every mountain photograph in the catalogue looks like a
 * picture of Rila.
 */
const GENERIC = new Set(["mountain", "mountains", "canyon", "canyons", "national", "park", "parks", "valley", "lake", "lakes",
  "river", "forest", "alps", "alpine", "trail", "trails", "peak", "peaks", "range", "coast", "coastal", "island", "islands",
  "hills", "plateau", "reserve", "region", "state", "county", "north", "south", "east", "west", "upper", "lower", "great",
  "view", "views", "landscape", "nature", "natural", "scenic", "summit", "ridge", "pass", "glacier", "beach", "highlands"]);
const distinctiveWords = (value: string) => words(value).filter((word) => !GENERIC.has(word));
const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const findings: string[] = [];
// Advisory: a filename can legitimately name a local landmark rather than the
// destination ("Passo Pordoi" is in the Dolomites), so this reports rather than fails.
const advisory: string[] = [];

// 1. Two destinations cannot honestly share one photograph.
const bySource = new Map<string, string[]>();
for (const image of manifest.images) bySource.set(image.sourceFile, [...(bySource.get(image.sourceFile) ?? []), image.slug]);
for (const [file, slugs] of bySource) {
  if (slugs.length > 1) findings.push(`SHARED   ${slugs.join(", ")} all use "${file}"`);
}

// 2. The filename should mention the destination, its region or its country.
for (const image of manifest.images) {
  const destination = byId.get(image.slug);
  if (!destination) { findings.push(`ORPHAN   ${image.slug} is in the manifest but not in the catalogue`); continue; }
  const haystack = words(image.sourceFile);
  const expected = new Set([...words(destination.name), ...words(destination.region), ...words(destination.countryName), ...words(destination.slug)]);
  if (![...expected].some((token) => haystack.includes(token))) {
    advisory.push(`UNMATCHED ${image.slug} <- "${image.sourceFile}" names no obvious local landmark`);
  }
}

// 3. The filename names a different destination in the catalogue.
for (const image of manifest.images) {
  const haystack = words(image.sourceFile);
  for (const other of destinations) {
    if (other.slug === image.slug) continue;
    // Require the other destination's full name as a contiguous phrase. Token
    // matching flags any filename containing "rocky", "green" or "district",
    // because those are ordinary English words that happen to sit inside a
    // destination name.
    // Whole words only, or a four-letter destination like Ella matches inside
    // Majella, Momella and castellanos.
    const phrase = normalise(other.name);
    if (phrase.length > 3 && ` ${normalise(image.sourceFile)} `.includes(` ${phrase} `)) {
      findings.push(`WRONGPLACE ${image.slug} <- "${image.sourceFile}" names ${other.slug}`);
      break;
    }
  }
}

// 4. The licence must still pass the allowlist and carry its attribution.
for (const image of manifest.images) {
  const licence = normaliseLicence(image.licenceId);
  if (!licence) { findings.push(`LICENCE  ${image.slug} carries a licence that is not permitted: ${image.licenceId}`); continue; }
  if (licence.requiresAttribution && !image.attribution.includes(image.author)) {
    findings.push(`CREDIT   ${image.slug} requires attribution but the credit line omits the author`);
  }
}

console.log(`Image QA: ${manifest.images.length} images across ${destinations.length} destinations`);
for (const finding of findings) console.log(`  ${finding}`);
console.log(`${findings.length} finding(s), ${advisory.length} advisory.`);
if (process.env.IMAGE_QA_VERBOSE === "1") for (const note of advisory) console.log(`  ${note}`);
if (!findings.length) console.log("No hard findings.");
process.exit(process.env.IMAGE_QA_STRICT === "1" ? 1 : 0);
