import type { DestinationConfig } from "@/lib/data/types";
import { affiliatePartnerId } from "@/lib/affiliate/config";
import type { AffiliateActivityOffer, AffiliateConfig, AffiliateDestinationSearch, AffiliatePartner } from "@/lib/affiliate/types";

export const affiliateRel = () => "sponsored nofollow";

const replace = (template: string, values: Record<string, string>) =>
  template.replace(/\{([A-Za-z]+)\}/g, (_match, key: string) => {
    if (!(key in values)) throw new Error(`Unsupported affiliate placeholder {${key}}`);
    return values[key];
  });

function assertHttpsHost(url: URL, partner: AffiliatePartner): void {
  if (url.protocol !== "https:") throw new Error(`${partner.id} must use HTTPS`);
  if (!partner.allowedHosts.includes(url.hostname)) throw new Error(`${partner.id} target host is not allowed: ${url.hostname}`);
  for (const parameter of partner.requiredQueryParameters) {
    if (!url.searchParams.get(parameter)) throw new Error(`${partner.id} is missing ${parameter}`);
  }
}

export function partnerById(config: AffiliateConfig, id: string): AffiliatePartner | null {
  return config.partners.find((partner) => partner.id === id) ?? null;
}

export function buildDestinationSearchUrl(
  config: AffiliateConfig,
  search: AffiliateDestinationSearch,
  destination: DestinationConfig,
): string | null {
  const partner = partnerById(config, search.partnerId);
  if (!partner || !partner.enabled || !partner.destinationSearchEnabled || !search.enabled) return null;
  const affiliateId = affiliatePartnerId(partner);
  if (!affiliateId) throw new Error(`${partner.id} is enabled without a public affiliate ID`);
  if (!partner.destinationUrlTemplate || !partner.urlTemplate) throw new Error(`${partner.id} is missing its destination URL templates`);
  const destinationUrl = replace(partner.destinationUrlTemplate, {query: encodeURIComponent(search.query)});
  const nested = new URL(destinationUrl);
  if (nested.protocol !== "https:" || nested.hostname !== "www.booking.com") {
    throw new Error(`${partner.id} has an invalid nested accommodation search`);
  }
  const url = new URL(replace(partner.urlTemplate, {
    affiliateId: encodeURIComponent(affiliateId),
    destinationSlug: encodeURIComponent(destination.slug),
    destinationUrl: encodeURIComponent(destinationUrl),
  }));
  assertHttpsHost(url, partner);
  return url.toString();
}

export function buildActivityOfferUrl(config: AffiliateConfig, offer: AffiliateActivityOffer): string | null {
  const partner = partnerById(config, offer.partnerId);
  if (!partner || !partner.enabled || !offer.enabled) return null;
  if (partner.type !== "activity") throw new Error(`${offer.id} is not assigned to an activity partner`);
  const affiliateId = affiliatePartnerId(partner);
  if (!affiliateId) throw new Error(`${partner.id} is enabled without a public affiliate ID`);
  const url = new URL(replace(offer.urlTemplate, {affiliateId: encodeURIComponent(affiliateId)}));
  assertHttpsHost(url, partner);
  if (partner.id === "getyourguide-activities" && !/-t\d+\/?$/.test(url.pathname)) {
    throw new Error(`${offer.id} must link to a direct GetYourGuide product`);
  }
  return url.toString();
}

export function validateAffiliateSources(
  config: AffiliateConfig,
  searches: AffiliateDestinationSearch[],
  offers: AffiliateActivityOffer[],
  destinations: DestinationConfig[],
): void {
  const destinationIds = new Set(destinations.map((destination) => destination.id));
  const partnerIds = new Set<string>();
  for (const partner of config.partners) {
    if (partnerIds.has(partner.id)) throw new Error(`Duplicate affiliate partner: ${partner.id}`);
    partnerIds.add(partner.id);
    if (partner.enabled && !affiliatePartnerId(partner)) throw new Error(`${partner.id} is enabled without a public affiliate ID`);
    if (partner.allowedHosts.length === 0) throw new Error(`${partner.id} needs an allowed host`);
  }
  const searchKeys = new Set<string>();
  for (const search of searches) {
    const key = `${search.partnerId}:${search.destinationId}`;
    if (searchKeys.has(key)) throw new Error(`Duplicate affiliate destination search: ${key}`);
    searchKeys.add(key);
    if (!partnerIds.has(search.partnerId)) throw new Error(`Unknown affiliate partner on ${key}`);
    if (!destinationIds.has(search.destinationId)) throw new Error(`Unknown destination on ${key}`);
    if (!search.query.trim() || !search.areaName.en.trim() || !search.areaName.de.trim()) throw new Error(`Incomplete accommodation search: ${key}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(search.lastReviewedAt)) throw new Error(`Invalid review date on ${key}`);
  }
  const offerIds = new Set<string>();
  for (const offer of offers) {
    if (offerIds.has(offer.id)) throw new Error(`Duplicate affiliate activity offer: ${offer.id}`);
    offerIds.add(offer.id);
    if (!partnerIds.has(offer.partnerId)) throw new Error(`Unknown affiliate partner on ${offer.id}`);
    if (!destinationIds.has(offer.destinationId)) throw new Error(`Unknown destination on ${offer.id}`);
    if (!offer.title.en.trim() || !offer.title.de.trim() || !offer.description.en.trim() || !offer.description.de.trim()) {
      throw new Error(`Incomplete editorial copy on ${offer.id}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(offer.lastReviewedAt)) throw new Error(`Invalid review date on ${offer.id}`);
    const raw = new URL(offer.urlTemplate.replace("{affiliateId}", "AFFILIATE_ID"));
    const partner = partnerById(config, offer.partnerId)!;
    if (raw.protocol !== "https:" || !partner.allowedHosts.includes(raw.hostname)) throw new Error(`Disallowed offer target on ${offer.id}`);
  }
}
