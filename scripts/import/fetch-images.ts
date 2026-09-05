/**
 * Destination photography from Wikimedia Commons.
 *
 * Commons is keyless and every file carries an explicit licence, which is what
 * makes the operator rule enforceable: open licence or commercially usable,
 * nothing else. Every candidate is checked against lib/media/licence.ts before
 * it can be downloaded, so a non-commercial or no-derivatives file cannot enter
 * the manifest even if a search returns it first.
 *
 *   pnpm data:images                     fill only destinations without an image
 *   FORCE_IMAGES=slug1,slug2 pnpm data:images   re-fetch specific destinations
 *   IMAGE_LIMIT=10 pnpm data:images      stop after N successful fetches
 *
 * Candidates are ranked by search relevance and orientation, never by file
 * size: the sibling project shipped Muscat as Da Nang by sorting on bytes
 * (climate-decision-engine mistakes.md #10). Always QA a new batch by source
 * filename, which is recorded for exactly that purpose.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";
import type { DestinationConfig } from "../../lib/data/types";
import { normaliseLicence } from "../../lib/media/licence";

const API = "https://commons.wikimedia.org/w/api.php";
const UA = "BestTimeToHike/0.1 (https://besttimetohike.com; data pipeline)";
const OUT_DIR = "public/images/destinations";
const MANIFEST = "data-config/sources/destination-images.json";
const WIDTH = 1200;
const HEIGHT = 800;
const MIN_SOURCE_WIDTH = 1000;
const EARLIEST_YEAR = 1995;

interface ImageRecord {
  slug: string;
  file: string;
  sourceUrl: string;
  sourceFile: string;
  author: string;
  licenceId: string;
  licenceName: string;
  attribution: string;
  fetchedAt: string;
}

const strip = (value: string) => (value ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Subjects Commons happily returns for a place name that are not photographs of
 * it. The artwork patterns matter most: a search for an Alpine valley returns
 * centuries of landscape painting, and the first attempt at this fetcher gave
 * Chamonix a John Robert Cozens watercolour because the title says "Google Art
 * Project" rather than "painting".
 */
const REJECT_TITLE = /\b(map|diagram|chart|coat of arms|flag|logo|seal|painting|engraving|lithograph|drawing|sketch|poster|stamp|banknote|satellite|landsat|sentinel|nasa)\b|art project|\b(museum|gallery|canvas|watercolou?r|etching|woodcut|aquatint|mezzotint|illustration|portrait|fresco|sculpture)\b/i;

/** Commons category names that mark a file as artwork or a reproduction. */
const REJECT_CATEGORY = /paintings|drawings|engravings|prints|artworks|watercolou?r|lithographs|maps of|old photographs|google art project/i;

/**
 * Landmark-anchored queries for destinations where the generic search returned
 * a photograph of somewhere else. Found by scripts/validate/image-qa.ts, which
 * is the check to run after every batch.
 */
/**
 * Destinations where Commons has no photograph that is actually of the place.
 * The placeholder is the honest answer; a near-miss from the next valley or
 * the next country is not.
 *
 *  altai-tavan-bogd: every Mongolian Altai query returns Ukok Plateau, which
 *  is across the border in Russia.
 */
const NO_IMAGE = new Set<string>(["altai-tavan-bogd"]);

const QUERY_OVERRIDE: Record<string, string[]> = {
  "arches": ["Delicate Arch Arches National Park Utah", "Arches National Park Utah red rock fins", "Landscape Arch Devils Garden Utah"],
  "cordillera-real": ["Illimani Cordillera Real Bolivia", "Huayna Potosi Bolivia mountain", "Cordillera Real Bolivia andes peaks"],
  "kitzbuhel": ["Kitzbuheler Horn Tyrol Austria", "Kitzbuheler Alpen summer meadows Austria", "Kitzbuhel Austria alpine pasture"],
  "rocky-mountain": ["Rocky Mountain National Park Colorado Bear Lake", "Rocky Mountain National Park Colorado tundra trail", "Longs Peak Colorado Rocky Mountain National Park"],
  "yoho": ["Emerald Lake Yoho National Park British Columbia", "Takakkaw Falls Yoho National Park", "Yoho National Park British Columbia mountains"],
  // Destinations where the generic query found nothing acceptable: non-ASCII
  // names, compound names, or places with little freely licensed photography.
  "aconcagua": ["Aconcagua Argentina mountain", "Cerro Aconcagua Andes Mendoza", "Aconcagua Provincial Park"],
  "sikkim": ["Yumthang Valley Sikkim India", "Kanchenjunga from Sikkim", "Sikkim mountains India"],
  "kamikochi": ["Kamikochi Kappa Bridge Azusa river", "Kamikochi Nagano Hotaka", "Kamikochi Japan valley"],
  "corsica-gr20": ["GR20 Corsica mountain trail", "Monte Cinto Corsica", "Restonica valley Corsica"],
  "copper-canyon": ["Barranca del Cobre Chihuahua Mexico", "Copper Canyon Chihuahua", "Sierra Tarahumara canyon Mexico"],
  "garhwal": ["Valley of Flowers Uttarakhand India", "Nanda Devi Uttarakhand", "Garhwal Himalaya Uttarakhand"],
  "altai-tavan-bogd": ["Khuiten Peak Mongolia", "Tsagaan Gol Mongolia Altai", "Altai Tavan Bogd National Park Mongolia"],
  "andringitra": ["Andringitra National Park Madagascar", "Pic Boby Madagascar", "Tsaranoro Madagascar"],
  "fouta-djallon": ["Fouta Djallon Guinea plateau", "Fouta Djallon waterfall Guinea", "Doucki Guinea canyon"],
  "elqui-valley": ["Valle del Elqui Chile", "Elqui Valley Chile vineyards", "Elqui river valley Chile"],
  "kumano-kodo": ["Daimonzaka Kumano Kodo", "Nachi Taisha pagoda waterfall Wakayama", "Kumano Kodo stone path Wakayama"],
  "tiger-leaping-gorge": ["Tiger Leaping Gorge Yunnan China", "Hutiao Gorge Yunnan", "Tiger Leaping Gorge Jinsha river"],
  "routeburn": ["Routeburn Track New Zealand", "Harris Saddle Routeburn", "Routeburn Falls New Zealand"],
  "mount-wilhelm": ["Mount Wilhelm Papua New Guinea", "Mount Wilhelm Chimbu Papua", "Mount Wilhelm summit lakes"],
};

function queriesFor(destination: DestinationConfig): string[] {
  const override = QUERY_OVERRIDE[destination.slug];
  if (override) return override;
  const name = destination.name;
  const country = destination.countryName;
  return [
    `${name} ${country} hiking trail landscape`,
    `${name} ${country} mountains landscape`,
    `${name} landscape`,
  ];
}

async function search(query: string): Promise<any[]> {
  const url = `${API}?${new URLSearchParams({
    action: "query", format: "json", generator: "search", gsrsearch: `filetype:bitmap ${query}`,
    gsrnamespace: "6", gsrlimit: "20", prop: "imageinfo",
    iiprop: "url|extmetadata|size|mime", iiurlwidth: String(WIDTH),
    iiextmetadatafilter: "LicenseShortName|Artist|Credit|DateTimeOriginal|Categories|ObjectName",
  })}`;
  const response = await fetch(url, {headers: {"User-Agent": UA}});
  if (!response.ok) throw new Error(`IMAGE001 Commons search failed with ${response.status}`);
  const body = await response.json() as any;
  return Object.values(body?.query?.pages ?? {});
}

interface Candidate { page: any; info: any; licence: ReturnType<typeof normaliseLicence>; author: string }

function acceptable(page: any): Candidate | null {
  const info = page?.imageinfo?.[0];
  if (!info) return null;
  if (!/^image\/(jpeg|png)$/.test(info.mime ?? "")) return null;
  if ((info.width ?? 0) < MIN_SOURCE_WIDTH) return null;
  // Landscape only: a portrait file cannot fill a destination card without a
  // crop that throws most of the subject away.
  if (info.width <= info.height * 1.2) return null;
  if (REJECT_TITLE.test(page.title ?? "")) return null;

  const meta = info.extmetadata ?? {};
  if (REJECT_CATEGORY.test(strip(meta.Categories?.value ?? ""))) return null;
  if (REJECT_TITLE.test(strip(meta.ObjectName?.value ?? ""))) return null;
  const licence = normaliseLicence(strip(meta.LicenseShortName?.value ?? ""));
  if (!licence) return null;

  const dated = strip(meta.DateTimeOriginal?.value ?? "");
  const year = Number((/\b(1[89]\d\d|20\d\d)\b/.exec(dated) ?? [])[1]);
  // Old material on Commons is overwhelmingly artwork and historical scans
  // rather than usable landscape photography.
  if (Number.isFinite(year) && year < EARLIEST_YEAR) return null;

  const author = strip(meta.Artist?.value ?? "") || strip(meta.Credit?.value ?? "") || "Unknown author";
  return {page, info, licence, author};
}

async function fetchFor(destination: DestinationConfig, taken: Set<string>): Promise<ImageRecord | null> {
  for (const query of queriesFor(destination)) {
    let pages: any[];
    try { pages = await search(query); } catch { await sleep(1500); continue; }
    // Commons returns search-relevance order; keep it. Never sort by size.
    for (const page of pages) {
      const candidate = acceptable(page);
      if (!candidate) continue;
      // One photograph cannot honestly illustrate two destinations.
      if (taken.has(String(page.title ?? ""))) continue;
      const source = candidate.info.thumburl ?? candidate.info.url;
      const binary = await fetch(source, {headers: {"User-Agent": UA}});
      if (!binary.ok) continue;
      const buffer = Buffer.from(await binary.arrayBuffer());
      const file = `${destination.slug}.webp`;
      mkdirSync(OUT_DIR, {recursive: true});
      await sharp(buffer).resize(WIDTH, HEIGHT, {fit: "cover", position: "attention"}).webp({quality: 78}).toFile(join(OUT_DIR, file));
      const licence = candidate.licence!;
      return {
        slug: destination.slug,
        file: `/images/destinations/${file}`,
        sourceUrl: candidate.info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        sourceFile: String(page.title ?? "").replace(/^File:/, ""),
        author: candidate.author,
        licenceId: licence.id,
        licenceName: licence.name,
        attribution: licence.requiresAttribution ? `${candidate.author}, ${licence.name}, via Wikimedia Commons` : `${licence.name}, via Wikimedia Commons`,
        fetchedAt: new Date().toISOString(),
      };
    }
    await sleep(400);
  }
  return null;
}

async function main() {
  const destinations = JSON.parse(readFileSync("data-config/sources/destinations.json", "utf8")) as DestinationConfig[];
  const manifest = existsSync(MANIFEST)
    ? JSON.parse(readFileSync(MANIFEST, "utf8")) as {images: ImageRecord[]; fallback: string}
    : {images: [], fallback: "generated-topographic-placeholder"};
  const have = new Map(manifest.images.map((image) => [image.slug, image]));
  const forced = new Set((process.env.FORCE_IMAGES ?? "").split(",").map((value) => value.trim()).filter(Boolean));
  const limit = Number(process.env.IMAGE_LIMIT ?? "0") || Infinity;

  const taken = new Set(
    [...have.entries()].filter(([slug]) => !forced.has(slug)).map(([, image]) => `File:${image.sourceFile}`));
  let added = 0, missed = 0;
  for (const destination of destinations) {
    if (added >= limit) break;
    if (NO_IMAGE.has(destination.slug)) continue;
    if (have.has(destination.slug) && !forced.has(destination.slug)) continue;
    if (forced.size && !forced.has(destination.slug)) continue;
    const record = await fetchFor(destination, taken);
    if (record) { have.set(destination.slug, record); taken.add(`File:${record.sourceFile}`); added += 1; console.log(`  ${destination.slug} ← ${record.sourceFile} [${record.licenceName}]`); }
    else { missed += 1; console.log(`  ${destination.slug}: no acceptably licensed landscape photograph found`); }
    await sleep(300);
  }

  const images = [...have.values()].sort((a, b) => a.slug.localeCompare(b.slug));
  mkdirSync(dirname(MANIFEST), {recursive: true});
  writeFileSync(MANIFEST, `${JSON.stringify({images, fallback: "generated-topographic-placeholder"}, null, 2)}\n`);
  console.log(`\n${added} fetched, ${missed} without a usable image, ${images.length} in the manifest.`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : error); process.exit(1); });
