import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { PublishedAffiliateActivityOffer, PublishedAffiliateDestinationSearch } from "@/lib/affiliate/types";

const root = join(process.cwd(), "public", "data", "affiliate");
const cache = new Map<string, unknown>();

function read<T>(name: string): T[] {
  const hit = cache.get(name);
  if (hit) return hit as T[];
  const path = join(root, name);
  if (!existsSync(path)) return [];
  const value = JSON.parse(readFileSync(path, "utf8")) as T[];
  cache.set(name, value);
  return value;
}

export const publishedAffiliateDestinationSearches = () => read<PublishedAffiliateDestinationSearch>("destination-searches.json");
export const publishedAffiliateActivityOffers = () => read<PublishedAffiliateActivityOffer>("activity-offers.json");
