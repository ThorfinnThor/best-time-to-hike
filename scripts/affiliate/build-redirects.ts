import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import destinationsSource from "../../data-config/sources/destinations.json";
import { affiliateActivityOffers, affiliateConfig, affiliateDestinationSearches } from "../../lib/affiliate/config";
import { buildActivityOfferUrl, buildDestinationSearchUrl, partnerById, validateAffiliateSources } from "../../lib/affiliate/affiliate";
import { staticAffiliateRedirectHtml } from "../../lib/affiliate/static-redirect";
import type { DestinationConfig } from "../../lib/data/types";
import type { PublishedAffiliateActivityOffer, PublishedAffiliateDestinationSearch, PublishedAffiliateManifest } from "../../lib/affiliate/types";

const root = process.cwd();
const redirectRoot = join(root, "public", "go");
const dataRoot = join(root, "public", "data", "affiliate");
const destinations = destinationsSource as DestinationConfig[];
const destinationById = new Map(destinations.map((destination) => [destination.id, destination]));

rmSync(redirectRoot, {recursive: true, force: true});
rmSync(dataRoot, {recursive: true, force: true});
mkdirSync(redirectRoot, {recursive: true});
mkdirSync(dataRoot, {recursive: true});

validateAffiliateSources(affiliateConfig, affiliateDestinationSearches, affiliateActivityOffers, destinations);

const searches: PublishedAffiliateDestinationSearch[] = [];
const offers: PublishedAffiliateActivityOffer[] = [];
const manifest: PublishedAffiliateManifest = {schemaVersion: 1, entries: []};

function writeRedirect(path: string, target: string): void {
  const file = join(root, "public", path.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(file), {recursive: true});
  writeFileSync(file, staticAffiliateRedirectHtml(target), "utf8");
}

for (const search of affiliateDestinationSearches.filter((item) => item.enabled)) {
  const destination = destinationById.get(search.destinationId);
  if (!destination || !destination.active) continue;
  const target = buildDestinationSearchUrl(affiliateConfig, search, destination);
  if (!target) continue;
  const partner = partnerById(affiliateConfig, search.partnerId)!;
  const redirectPath = `/go/${partner.id}/${destination.slug}/`;
  writeRedirect(redirectPath, target);
  searches.push({
    partnerId: partner.id,
    partnerName: partner.name,
    destinationId: destination.id,
    destinationSlug: destination.slug,
    areaName: search.areaName,
    redirectPath,
    lastReviewedAt: search.lastReviewedAt,
  });
  manifest.entries.push({kind: "destination-search", partnerId: partner.id, destinationId: destination.id, path: redirectPath, targetHost: new URL(target).hostname});
}

for (const offer of affiliateActivityOffers.filter((item) => item.enabled)) {
  const destination = destinationById.get(offer.destinationId);
  if (!destination || !destination.active) continue;
  const target = buildActivityOfferUrl(affiliateConfig, offer);
  if (!target) continue;
  const partner = partnerById(affiliateConfig, offer.partnerId)!;
  const redirectPath = `/go/${partner.id}/offer/${offer.id}/`;
  writeRedirect(redirectPath, target);
  offers.push({
    id: offer.id,
    partnerId: partner.id,
    partnerName: partner.name,
    destinationId: destination.id,
    kind: offer.kind,
    title: offer.title,
    description: offer.description,
    redirectPath,
    lastReviewedAt: offer.lastReviewedAt,
  });
  manifest.entries.push({kind: "activity-offer", partnerId: partner.id, destinationId: destination.id, path: redirectPath, targetHost: new URL(target).hostname});
}

const writeJson = (name: string, value: unknown) => writeFileSync(join(dataRoot, name), `${JSON.stringify(value, null, 2)}\n`, "utf8");
writeJson("destination-searches.json", searches);
writeJson("activity-offers.json", offers);
writeJson("manifest.json", manifest);
console.log(`Built ${manifest.entries.length} static affiliate redirect(s): ${searches.length} stay search(es), ${offers.length} reviewed activity offer(s).`);
