import manifest from "@/data-config/sources/destination-images.json";
import { normaliseLicence } from "@/lib/media/licence";

export interface DestinationImage {
  slug: string;
  file: string;
  sourceUrl: string;
  sourceFile: string;
  author: string;
  licenceId: string;
  licenceName: string;
  attribution: string;
}

const RECORDS = manifest.images as DestinationImage[];

/**
 * An image is only usable if its recorded licence still passes the allowlist.
 * Checking here as well as at fetch time means a manifest edited by hand, or
 * carried over from an older policy, cannot put a non-commercial file on a page.
 */
const usable = RECORDS.filter((image) => normaliseLicence(image.licenceId) !== null);
const BY_SLUG = new Map(usable.map((image) => [image.slug, image]));

export const imageFor = (slug: string): DestinationImage | null => BY_SLUG.get(slug) ?? null;
export const allImages = (): DestinationImage[] => [...usable].sort((a, b) => a.slug.localeCompare(b.slug));
