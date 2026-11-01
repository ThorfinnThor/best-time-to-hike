import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import manifest from "../../data-config/sources/destination-images.json";
import { cardFileFor } from "../../lib/media/images";

/**
 * Card-sized copies of the destination photographs.
 *
 * fetch-images.ts keeps a 2400px source so article heroes stay sharp, and every
 * card used to load that same file: Lighthouse on the November ranking measured
 * a 10.2 s mobile LCP behind an 856 KiB Table Mountain photograph shown 400px
 * wide. A card never needs more than about 960px, so each photograph gets a
 * `-card.webp` sibling at that width, from the committed source and offline.
 *
 * Rerun after fetch-images.ts. The output is committed like the sources;
 * tests/images.test.ts fails while any usable photograph lacks its card copy.
 */
const PUBLIC = "public";
export const CARD_WIDTH = 960;

async function main() {
  let written = 0;
  for (const {file} of manifest.images as Array<{file: string}>) {
    const source = join(PUBLIC, file);
    if (!existsSync(source)) continue;
    await sharp(source)
      .resize({width: CARD_WIDTH, withoutEnlargement: true})
      .webp({quality: 72, effort: 6})
      .toFile(join(PUBLIC, cardFileFor(file)));
    written += 1;
  }
  console.log(`Card images: ${written} written at ${CARD_WIDTH}px.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
