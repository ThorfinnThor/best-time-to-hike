import type { Locale } from "@/lib/data/types";

export type AffiliatePartnerType = "stay" | "activity";
export type LocalizedAffiliateText = Record<Locale, string>;

export interface AffiliatePartner {
  id: string;
  name: string;
  type: AffiliatePartnerType;
  enabled: boolean;
  affiliateId: string;
  affiliateIdEnvironmentVariable: string;
  allowedHosts: string[];
  requiredQueryParameters: string[];
  destinationSearchEnabled: boolean;
  destinationUrlTemplate?: string;
  urlTemplate?: string;
}

export interface AffiliateConfig {
  schemaVersion: 1;
  note: string;
  partners: AffiliatePartner[];
}

export interface AffiliateDestinationSearch {
  destinationId: string;
  partnerId: string;
  query: string;
  areaName: LocalizedAffiliateText;
  enabled: boolean;
  lastReviewedAt: string;
}

export interface AffiliateActivityOffer {
  id: string;
  partnerId: string;
  destinationId: string;
  enabled: boolean;
  kind: "hiking" | "regional";
  title: LocalizedAffiliateText;
  description: LocalizedAffiliateText;
  urlTemplate: string;
  lastReviewedAt: string;
}

export interface PublishedAffiliateDestinationSearch {
  partnerId: string;
  partnerName: string;
  destinationId: string;
  destinationSlug: string;
  areaName: LocalizedAffiliateText;
  redirectPath: string;
  lastReviewedAt: string;
}

export interface PublishedAffiliateActivityOffer {
  id: string;
  partnerId: string;
  partnerName: string;
  destinationId: string;
  kind: "hiking" | "regional";
  title: LocalizedAffiliateText;
  description: LocalizedAffiliateText;
  redirectPath: string;
  lastReviewedAt: string;
}

export interface PublishedAffiliateManifest {
  schemaVersion: 1;
  entries: Array<{
    kind: "destination-search" | "activity-offer";
    partnerId: string;
    destinationId: string;
    path: string;
    targetHost: string;
  }>;
}
