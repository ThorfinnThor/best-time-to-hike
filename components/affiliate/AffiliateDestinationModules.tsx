import { DestinationImage } from "@/components/media/DestinationImage";
import { GetYourGuideAutoWidget } from "@/components/affiliate/GetYourGuideAutoWidget";
import { affiliateRel } from "@/lib/affiliate/affiliate";
import { publishedAffiliateDestinationSearches } from "@/lib/affiliate/load-published";
import type { Locale } from "@/lib/data/types";

const COPY = {
  en: {
    eyebrow: "Plan the trip",
    heading: (name: string) => `Stays and guided experiences around ${name}`,
    intro: "Compare a practical accommodation base and current activity listings after checking that the climate fits your hike. Commercial links never affect scores or ranking order.",
    disclosure: "Affiliate disclosure: if you book through a labelled link, we may earn a commission at no extra cost to you.",
    planTag: "Stay and explore",
    planHeading: (area: string) => `Turn the climate choice into a trip around ${area}`,
    planBody: "Open live partner results for places to stay, guided walks and other local experiences. Availability, prices and exact locations are confirmed on the provider page.",
    stayLink: "Find places to stay",
    getYourGuideLink: "Tours and activities",
    viatorLink: "Tours and tickets",
    check: "Check the date, meeting point, difficulty, inclusions, trail access and cancellation terms before booking.",
    newTab: "opens in a new tab",
  },
  de: {
    eyebrow: "Reise planen",
    heading: (name: string) => `Unterkünfte und geführte Erlebnisse rund um ${name}`,
    intro: "Vergleiche nach der Klimaprüfung einen praktischen Übernachtungsort und aktuelle Aktivitäten. Kommerzielle Links beeinflussen weder Werte noch Rangfolge.",
    disclosure: "Affiliate-Hinweis: Wenn du über einen gekennzeichneten Link buchst, können wir ohne Mehrkosten für dich eine Provision erhalten.",
    planTag: "Übernachten und erleben",
    planHeading: (area: string) => `Aus der Klimawahl wird eine Reise rund um ${area}`,
    planBody: "Öffne aktuelle Partnerergebnisse für Unterkünfte, geführte Wanderungen und weitere Erlebnisse vor Ort. Verfügbarkeit, Preise und den genauen Standort bestätigst du auf der Anbieterseite.",
    stayLink: "Unterkünfte finden",
    getYourGuideLink: "Touren und Aktivitäten",
    viatorLink: "Touren und Tickets",
    check: "Prüfe vor der Buchung Datum, Treffpunkt, Schwierigkeit, Leistungen, Wegzugang und Stornierungsbedingungen.",
    newTab: "öffnet einen neuen Tab",
  },
} as const;

export function AffiliateDestinationModules({destinationId, destinationName, locale, compact = false}: {
  destinationId: string;
  destinationName: string;
  locale: Locale;
  compact?: boolean;
}) {
  const searches = publishedAffiliateDestinationSearches().filter((item) => item.destinationId === destinationId);
  const stay = searches.find((item) => item.partnerId === "booking-stay-search") ?? null;
  const activitySearches = searches.filter((item) => item.partnerId === "getyourguide-activities" || item.partnerId === "viator-activities");
  if (!stay && activitySearches.length === 0) return null;

  const copy = COPY[locale];
  const slug = searches[0]?.destinationSlug ?? destinationId;
  const area = stay?.areaName[locale] ?? activitySearches[0]?.areaName[locale] ?? destinationName;
  const disclosureId = `affiliate-disclosure-${destinationId}${compact ? "-month" : ""}`;
  const titleId = `affiliate-title-${destinationId}${compact ? "-month" : ""}`;
  const linkLabel = (partnerId: string) => partnerId === "getyourguide-activities" ? copy.getYourGuideLink : copy.viatorLink;

  return <section className={`content-section affiliate-module${compact ? " affiliate-module-compact" : ""}`} aria-labelledby={titleId}>
    <header>
      <span className="eyebrow">{copy.eyebrow}</span>
      <h2 id={titleId}>{copy.heading(destinationName)}</h2>
      <p>{copy.intro}</p>
      <p className="affiliate-disclosure" id={disclosureId}><strong>{copy.disclosure}</strong></p>
    </header>

    <GetYourGuideAutoWidget locale={locale} destinationName={destinationName} />

    <article className="affiliate-plan-card" aria-describedby={disclosureId}>
      <DestinationImage slug={slug} name={destinationName} region={copy.planTag} className="affiliate-plan-image" />
      <div className="affiliate-plan-body">
        <span>{copy.planTag}</span>
        <h3>{copy.planHeading(area)}</h3>
        <p>{copy.planBody}</p>
        <div className="affiliate-actions">
          {stay ? <a href={stay.redirectPath} target="_blank" rel={`${affiliateRel()} noopener noreferrer`} aria-label={`${copy.stayLink} · Booking.com (${copy.newTab})`}>
            <span>Booking.com</span><strong>{copy.stayLink}</strong><i aria-hidden="true">↗</i>
          </a> : null}
          {activitySearches.map((search) => <a href={search.redirectPath} target="_blank" rel={`${affiliateRel()} noopener noreferrer`} aria-label={`${linkLabel(search.partnerId)} · ${search.partnerName} (${copy.newTab})`} key={search.partnerId}>
            <span>{search.partnerName}</span><strong>{linkLabel(search.partnerId)}</strong><i aria-hidden="true">↗</i>
          </a>)}
        </div>
        <small>{copy.check}</small>
      </div>
    </article>
  </section>;
}
