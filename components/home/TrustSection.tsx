import type { Locale } from "@/lib/data/types";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const icons = {
  data: <svg viewBox="0 0 24 24" aria-hidden="true" {...iconProps}><path d="M4 20V10m6 10V4m6 16v-7m6 7H2" /></svg>,
  elevation: <svg viewBox="0 0 24 24" aria-hidden="true" {...iconProps}><path d="m3 19 6-10 4 6 3-5 5 9H3Z" /><path d="m7.5 11.5 1.5 1 1.5-1" /></svg>,
  method: <svg viewBox="0 0 24 24" aria-hidden="true" {...iconProps}><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5M8.5 11l1.7 1.7 3.4-3.7" /></svg>,
  limits: <svg viewBox="0 0 24 24" aria-hidden="true" {...iconProps}><path d="M12 3 3.5 19h17L12 3Z" /><path d="M12 9v4m0 3h.01" /></svg>,
};

const copy = {
  en: {
    heading: "Why you can trust the result",
    items: [
      ["data", "Historical climate data", "Monthly hiking conditions are derived from long-term climate records, not marketing copy."],
      ["elevation", "Selected-cell scope", "Each current destination uses one selected representative ERA5-Land model-grid cell, not a whole-region or route average."],
      ["method", "Transparent scoring", "Temperature, rain, snow, heat, coarse grid-cell wind and daylight remain visible behind every score."],
      ["limits", "Clear limitations", "Climate suitability is not a forecast. Current weather, trail and safety information still matter."],
    ],
  },
  de: {
    heading: "Warum du dem Ergebnis vertrauen kannst",
    items: [
      ["data", "Historische Klimadaten", "Monatliche Wanderbedingungen stammen aus langfristigen Klimareihen, nicht aus Werbetexten."],
      ["elevation", "Ausgewählte Zelle", "Jedes aktuelle Ziel nutzt eine ausgewählte repräsentative ERA5-Land-Modellgitterzelle, nicht eine ganze Region oder einzelne Route."],
      ["method", "Transparente Wertung", "Temperatur, Regen, Schnee, Hitze, grober Gitterwind und Tageslicht bleiben hinter jedem Wert sichtbar."],
      ["limits", "Klare Grenzen", "Klimaeignung ist keine Vorhersage. Aktuelles Wetter, Wege und Sicherheit müssen geprüft werden."],
    ],
  },
} as const;

export function TrustSection({ locale }: { locale: Locale }) {
  const content = copy[locale];

  return (
    <section className="content-section trust-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{locale === "de" ? "Nachvollziehbar entscheiden" : "Decide with context"}</span>
          <h2>{content.heading}</h2>
        </div>
      </div>
      <div className="trust-grid">
        {content.items.map(([icon, title, text]) => (
          <article className="trust-card" key={title}>
            <span className="trust-icon">{icons[icon]}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
