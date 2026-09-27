import type { Locale } from "@/lib/data/types";
import { affiliateRel } from "@/lib/affiliate/affiliate";
import { publishedAffiliateActivityOffers, publishedAffiliateDestinationSearches } from "@/lib/affiliate/load-published";

const COPY = {
  en: {
    eyebrow: "Plan the trip",
    heading: (name: string) => `Stays and guided options around ${name}`,
    intro: "These links open current partner listings. They are separate from the climate assessment and never affect scores or ranking order.",
    disclosure: "Affiliate disclosure: if you book through a labelled link, we may earn a commission at no extra cost to you.",
    stays: "Accommodation base",
    stayHeading: (area: string) => `Search stays around ${area}`,
    stayBody: "The search starts with an accommodation base in the destination area, not the representative climate cell. Confirm the exact trailhead and travel time before booking.",
    stayLink: "Search stays on Booking.com",
    hiking: "Guided hiking",
    regional: "Regional activity",
    check: "Check the date, meeting point, difficulty, inclusions and cancellation terms on the provider page before booking.",
    view: (partner: string) => `View on ${partner}`,
    newTab: "opens in a new tab",
  },
  de: {
    eyebrow: "Reise planen",
    heading: (name: string) => `Unterkünfte und geführte Angebote rund um ${name}`,
    intro: "Diese Links öffnen aktuelle Angebote der Partner. Sie sind von der Klimabewertung getrennt und beeinflussen weder Werte noch Rangfolge.",
    disclosure: "Affiliate-Hinweis: Wenn du über einen gekennzeichneten Link buchst, können wir ohne Mehrkosten für dich eine Provision erhalten.",
    stays: "Übernachtungsort",
    stayHeading: (area: string) => `Unterkünfte rund um ${area} suchen`,
    stayBody: "Die Suche startet mit einer Unterkunftsbasis im Zielgebiet, nicht mit der repräsentativen Klimazelle. Prüfe vor der Buchung den genauen Wanderstart und die Anfahrtszeit.",
    stayLink: "Unterkünfte bei Booking.com suchen",
    hiking: "Geführte Wanderung",
    regional: "Aktivität in der Region",
    check: "Prüfe vor der Buchung Datum, Treffpunkt, Schwierigkeit, Leistungen und Stornierungsbedingungen auf der Anbieterseite.",
    view: (partner: string) => `Bei ${partner} ansehen`,
    newTab: "öffnet einen neuen Tab",
  },
} as const;

export function AffiliateDestinationModules({destinationId, destinationName, locale, compact = false}: {
  destinationId: string;
  destinationName: string;
  locale: Locale;
  compact?: boolean;
}) {
  const stay = publishedAffiliateDestinationSearches().find((item) => item.destinationId === destinationId) ?? null;
  const offers = publishedAffiliateActivityOffers().filter((item) => item.destinationId === destinationId);
  if (!stay && offers.length === 0) return null;
  const copy = COPY[locale];
  const disclosureId = `affiliate-disclosure-${destinationId}${compact ? "-month" : ""}`;
  return <section className={`content-section affiliate-module${compact ? " affiliate-module-compact" : ""}`} aria-labelledby={`affiliate-title-${destinationId}${compact ? "-month" : ""}`}>
    <header>
      <span className="eyebrow">{copy.eyebrow}</span>
      <h2 id={`affiliate-title-${destinationId}${compact ? "-month" : ""}`}>{copy.heading(destinationName)}</h2>
      <p>{copy.intro}</p>
      <p className="affiliate-disclosure" id={disclosureId}><strong>{copy.disclosure}</strong></p>
    </header>
    <div className="affiliate-grid">
      {stay ? <article className="affiliate-card affiliate-card-stay" aria-describedby={disclosureId}>
        <span>{copy.stays} · {stay.partnerName}</span>
        <h3>{copy.stayHeading(stay.areaName[locale])}</h3>
        <p>{copy.stayBody}</p>
        <a href={stay.redirectPath} target="_blank" rel={`${affiliateRel()} noopener noreferrer`} aria-label={`${copy.stayLink} (${copy.newTab})`}>{copy.stayLink} <span aria-hidden="true">↗</span></a>
      </article> : null}
      {offers.map((offer) => <article className="affiliate-card" aria-describedby={disclosureId} key={offer.id}>
        <span>{offer.kind === "hiking" ? copy.hiking : copy.regional} · {offer.partnerName}</span>
        <h3>{offer.title[locale]}</h3>
        <p>{offer.description[locale]}</p>
        <small>{copy.check}</small>
        <a href={offer.redirectPath} target="_blank" rel={`${affiliateRel()} noopener noreferrer`} aria-label={`${copy.view(offer.partnerName)}: ${offer.title[locale]} (${copy.newTab})`}>{copy.view(offer.partnerName)} <span aria-hidden="true">↗</span></a>
      </article>)}
    </div>
  </section>;
}
