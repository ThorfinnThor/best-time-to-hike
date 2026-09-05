import type { Locale } from "@/lib/data/types";
import { t } from "@/lib/i18n/dict";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const icons: Record<string, React.ReactNode> = {
  data: <svg viewBox="0 0 24 24" aria-hidden="true" {...iconProps}><path d="M4 20V10m6 10V4m6 16v-7m6 7H2" /></svg>,
  elevation: <svg viewBox="0 0 24 24" aria-hidden="true" {...iconProps}><path d="m3 19 6-10 4 6 3-5 5 9H3Z" /><path d="m7.5 11.5 1.5 1 1.5-1" /></svg>,
  method: <svg viewBox="0 0 24 24" aria-hidden="true" {...iconProps}><circle cx="11" cy="11" r="6" /><path d="m20 20-4.5-4.5M8.5 11l1.7 1.7 3.4-3.7" /></svg>,
  limits: <svg viewBox="0 0 24 24" aria-hidden="true" {...iconProps}><path d="M12 3 3.5 19h17L12 3Z" /><path d="M12 9v4m0 3h.01" /></svg>,
};

export function TrustSection({ locale }: { locale: Locale }) {
  const copy = t(locale).trust;

  return (
    <section className="content-section trust-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">{copy.eyebrow}</span>
          <h2>{copy.heading}</h2>
        </div>
      </div>
      <div className="trust-grid">
        {copy.items.map(([icon, title, text]) => (
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
