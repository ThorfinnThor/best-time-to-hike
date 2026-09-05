import Link from "next/link";
import { Finder } from "@/components/finder/Finder";
import { FixtureNotice, MethodNote } from "@/components/hiking/Pages";
import { TrustSection } from "@/components/home/TrustSection";
import { getAllDestinations, getSearchIndex } from "@/lib/data/load";
import { monthName } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dict";
import { destinationPath, links } from "@/lib/i18n/links";
import type { Locale } from "@/lib/data/types";

export function HomePage({ locale }: { locale: Locale }) {
  const content = t(locale).home;
  const common = t(locale).common;
  const destinations = getAllDestinations().filter((destination) => destination.recommendationEligible);

  return (
    <>
      <FixtureNotice locale={locale} />
      <section className="home-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="home-hero-inner">
          <span className="hero-kicker">{content.eyebrow}</span>
          <h1>{content.heading}</h1>
          <p>{content.sub}</p>
        </div>
      </section>

      <section className="finder-wrap">
        <Finder destinations={getSearchIndex()} locale={locale} compact />
      </section>

      <section className="content-section home-destinations">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{content.exploreEyebrow}</span>
            <h2>{content.destinations}</h2>
            <p>{content.destinationSub}</p>
          </div>
          <Link className="section-link" href={links.ranking(locale, 6)}>{content.rankings} →</Link>
        </div>
        <div className="destination-summary-grid">
          {destinations.map((destination) => {
            const bestMonth = destination.bestMonths[0];
            if (!bestMonth) return null;
            const month = destination.months[bestMonth - 1];
            return (
              <article className="destination-summary-card" key={destination.slug}>
                <div className="destination-card-art" aria-hidden="true">
                  <span>{destination.region}</span>
                  <div className="mini-mountain mini-mountain-back" />
                  <div className="mini-mountain mini-mountain-front" />
                </div>
                <div className="destination-card-body">
                  <div className="destination-card-heading">
                    <div>
                      <span>{destination.countryName}</span>
                      <h3>{destination.name}</h3>
                    </div>
                    <div className="score-pill"><strong>{month.overallScore}</strong><span>/100</span></div>
                  </div>
                  <p className="card-caption">{content.score} · {content.shown}: {monthName(bestMonth, locale)}</p>
                  <div className="climate-facts">
                    <span><b>☀</b>{Math.round(month.metrics.temperatureHikingMeanC)}°C</span>
                    <span><b>☂</b>{Math.round(month.metrics.wetDayProbability * 100)}% {common.wetDays}</span>
                    <span><b>↕</b>{destination.elevation.minM}–{destination.elevation.maxM} m</span>
                  </div>
                  <Link href={destinationPath(locale, destination.slug)}>{content.allMonths} →</Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="content-section month-link-section">
        <h2>{content.byMonth}</h2>
        <div className="month-chips">
          {Array.from({ length: 12 }, (_, index) => {
            const month = index + 1;
            return <Link key={month} href={links.ranking(locale, month)}>{monthName(month, locale)}</Link>;
          })}
        </div>
      </section>

      <TrustSection locale={locale} />
      <MethodNote locale={locale} />
    </>
  );
}
