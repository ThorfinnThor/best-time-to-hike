import type { Locale, PublicDestination } from "@/lib/data/types";
import { destinationFaqEntries } from "@/lib/seo/jsonld";

/** Visible answers and FAQ structured data deliberately share one source. */
export function DestinationFaq({destination, locale}: {destination: PublicDestination; locale: Locale}) {
  const entries = destinationFaqEntries(destination, locale);
  return <section className="content-section destination-faq" aria-labelledby="destination-faq-heading">
    <div className="destination-faq-heading">
      <span className="eyebrow">{locale === "de" ? "Kurz beantwortet" : "Quick answers"}</span>
      <h2 id="destination-faq-heading">{locale === "de" ? `Häufige Fragen zu ${destination.name}` : `Questions about ${destination.name}`}</h2>
    </div>
    <dl>{entries.map((entry) => <div key={entry.q}>
      <dt>{entry.q}</dt>
      <dd>{entry.a}</dd>
    </div>)}</dl>
  </section>;
}
