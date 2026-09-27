import partners from "@/data-config/sources/affiliate-partners.json";
import searches from "@/data-config/sources/affiliate-destination-searches.json";
import offers from "@/data-config/sources/affiliate-activity-offers.json";
import type { AffiliateActivityOffer, AffiliateConfig, AffiliateDestinationSearch } from "@/lib/affiliate/types";

export const affiliateConfig = partners as AffiliateConfig;
export const affiliateDestinationSearches = searches.searches as AffiliateDestinationSearch[];
export const affiliateActivityOffers = offers.offers as AffiliateActivityOffer[];

export function affiliatePartnerId(partner: AffiliateConfig["partners"][number]): string {
  return process.env[partner.affiliateIdEnvironmentVariable]?.trim() || partner.affiliateId.trim();
}
