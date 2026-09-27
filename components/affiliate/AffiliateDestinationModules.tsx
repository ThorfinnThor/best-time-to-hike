import { DestinationImage } from "@/components/media/DestinationImage";
import { GetYourGuideAutoWidget } from "@/components/affiliate/GetYourGuideAutoWidget";
import { ViatorDynamicWidget } from "@/components/affiliate/ViatorDynamicWidget";
import { affiliateRel } from "@/lib/affiliate/affiliate";
import { publishedAffiliateDestinationSearches } from "@/lib/affiliate/load-published";
import type { Locale } from "@/lib/data/types";

const COPY = {
  en: {
    eyebrow: "Plan the trip",
    heading: (name: string) => `Stays and guided experiences around ${name}`,
    intro: "Compare a practical accommodation base and current activity listings after checking that the climate fits your hike. Commercial links never affect scores or ranking order.",
    disclosure: "Affiliate disclosure: if you book through a labelled link, we may earn a commission at no extra cost to you.",
    bookingTag: "Find a base",
    bookingHeading: (area: string) => `Where to stay around ${area}`,
    bookingBody: "Choose a practical base for your hiking days. Compare current availability, prices and cancellation terms on Booking.com.",
    bookingLink: "Find places to stay",
    experiencesTag: "Guided experiences",
    experiencesHeading: (name: string) => `Tours and activities around ${name}`,
    experiencesBody: "Add a guided walk, a boat trip or a local experience after checking that the climate fits your plans.",
    check: "Check the date, meeting point, difficulty, inclusions, trail access and cancellation terms before booking.",
    newTab: "opens in a new tab",
  },
  de: {
    eyebrow: "Reise planen",
    heading: (name: string) => `Unterkünfte und geführte Erlebnisse rund um ${name}`,
    intro: "Vergleiche nach der Klimaprüfung einen praktischen Übernachtungsort und aktuelle Aktivitäten. Kommerzielle Links beeinflussen weder Werte noch Rangfolge.",
    disclosure: "Affiliate-Hinweis: Wenn du über einen gekennzeichneten Link buchst, können wir ohne Mehrkosten für dich eine Provision erhalten.",
    bookingTag: "Unterkunft finden",
    bookingHeading: (area: string) => `Wo du rund um ${area} übernachten kannst`,
    bookingBody: "Wähle eine praktische Basis für deine Wandertage. Vergleiche aktuelle Verfügbarkeit, Preise und Stornierungsbedingungen auf Booking.com.",
    bookingLink: "Unterkünfte finden",
    experiencesTag: "Geführte Erlebnisse",
    experiencesHeading: (name: string) => `Touren und Aktivitäten rund um ${name}`,
    experiencesBody: "Ergänze deine Reise nach der Klimaprüfung um eine geführte Wanderung, Bootstour oder ein lokales Erlebnis.",
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

  return <section className={`content-section affiliate-module${compact ? " affiliate-module-compact" : ""}`} aria-labelledby={titleId}>
    <header>
      <span className="eyebrow">{copy.eyebrow}</span>
      <h2 id={titleId}>{copy.heading(destinationName)}</h2>
      <p>{copy.intro}</p>
    </header>

    {activitySearches.length > 0 ? <section className="affiliate-experiences" aria-label={copy.experiencesHeading(destinationName)}>
      <header className="affiliate-experiences-header">
        <span className="eyebrow">{copy.experiencesTag}</span>
        <h3>{copy.experiencesHeading(destinationName)}</h3>
        <p>{copy.experiencesBody}</p>
      </header>
      <GetYourGuideAutoWidget locale={locale} destinationName={destinationName} />
      <ViatorDynamicWidget locale={locale} destinationName={destinationName} />
    </section> : null}

    {stay ? <article className="affiliate-plan-card affiliate-booking-card" aria-describedby={disclosureId}>
      <DestinationImage slug={slug} name={destinationName} region={copy.bookingTag} className="affiliate-plan-image" />
      <div className="affiliate-plan-body">
        <span>{copy.bookingTag}</span>
        <h3>{copy.bookingHeading(area)}</h3>
        <p>{copy.bookingBody}</p>
        <a className="affiliate-booking-cta" href={stay.redirectPath} target="_blank" rel={`${affiliateRel()} noopener noreferrer`} aria-label={`${copy.bookingLink} · Booking.com (${copy.newTab})`}>
          <span>Booking.com</span><strong>{copy.bookingLink}</strong><i aria-hidden="true">↗</i>
        </a>
        <small>{copy.check}</small>
      </div>
    </article> : null}

    <p className="affiliate-disclosure" id={disclosureId}>{copy.disclosure}</p>
  </section>;
}
