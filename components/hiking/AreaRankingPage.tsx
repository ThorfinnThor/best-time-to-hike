import Link from "next/link";
import type { Locale } from "@/lib/data/types";
import { monthName, monthNameShort } from "@/lib/i18n/config";
import { t, taxonomyLabel, withArticle } from "@/lib/i18n/dict";
import { destinationPath, links } from "@/lib/i18n/links";
import { areaProfile, type Area } from "@/lib/seo/areas";
import { DestinationImage } from "@/components/media/DestinationImage";
import { ScoreRing } from "@/components/hiking/ScoreRing";

/**
 * An area page answers "where should I hike in the Alps", and the useful part
 * is the season: how much of the area is open in each month. That varies
 * sharply between areas, so the page is different for each rather than the
 * same list with different names.
 *
 * Withheld destinations in the area are named rather than quietly dropped. A
 * reader who knows the Alps will notice Zermatt missing, and the honest answer
 * is better than an unexplained gap.
 */
export function AreaRankingPage({area, locale}: {area: Area; locale: Locale}) {
  const copy = t(locale);
  const profile = areaProfile(area);
  const label = taxonomyLabel(locale, area.kind === "continent" ? "continents" : "regions", area.id);
  const busiest = Math.max(...profile.monthCounts);
  const peakFor = (slug: string) => {
    const destination = area.destinations.find((item) => item.slug === slug)!;
    return Math.max(0, ...destination.months.flatMap((month) => month.overallScore === null ? [] : [month.overallScore]));
  };

  return <>
    <section className="page-intro">
      <span className="eyebrow">{copy.area.eyebrow}</span>
      <h1>{copy.area.heading(locale === "en" ? withArticle(area.id, label) : label)}</h1>
      <p>{copy.area.intro(area.destinations.length, profile.countries.length, profile.elevationMinM, profile.elevationMaxM)}</p>
    </section>

    <section className="content-section area-season">
      <div className="section-heading"><div>
        <span className="eyebrow">{copy.area.seasonEyebrow}</span>
        <h2>{copy.area.seasonHeading(profile.peakMonths.map((month) => monthName(month, locale)).join(" / "))}</h2>
      </div></div>
      <ol className="area-months" aria-label={copy.area.seasonEyebrow}>
        {profile.monthCounts.map((count, index) => <li key={index}>
          <Link href={links.ranking(locale, index + 1)}>
            <span className="area-bar" style={{height: `${busiest ? Math.max(4, (count / busiest) * 100) : 4}%`}} aria-hidden="true"/>
            <strong>{count}</strong>
            <small>{monthNameShort(index + 1, locale)}</small>
          </Link>
        </li>)}
      </ol>
      <p className="area-note">{copy.area.seasonNote(area.destinations.length)}</p>
    </section>

    <section className="content-section">
      <div className="section-heading"><div>
        <span className="eyebrow">{copy.area.rankedEyebrow}</span>
        <h2>{copy.area.rankedHeading(area.destinations.length)}</h2>
      </div></div>
      <div className="destination-summary-grid">
        {area.destinations.map((destination) => <article className="destination-summary-card" key={destination.slug}>
          <DestinationImage slug={destination.slug} name={destination.name} region={destination.countryName}/>
          <div className="destination-card-body">
            <div className="destination-card-heading">
              <div><span>{destination.countryName}</span><h3>{destination.name}</h3></div>
              <ScoreRing score={peakFor(destination.slug)} size="small" locale={locale}/>
            </div>
            <p className="card-caption">{destination.bestMonths.map((month) => monthName(month, locale)).join(" · ")}</p>
            <div className="climate-facts">
              <span><b>↕</b>{Math.round(destination.representativeCell.modelElevationM)} m</span>
              <span><b>✓</b>{destination.months.filter((month) => month.recommendationEligible).length}/12 {copy.common.months}</span>
            </div>
            <Link href={destinationPath(locale, destination.slug)}>{copy.destination.exploreDestination}</Link>
          </div>
        </article>)}
      </div>
    </section>

    {area.withheld.length ? <section className="content-section area-withheld">
      <div className="section-heading"><div>
        <span className="eyebrow">{copy.area.withheldEyebrow}</span>
        <h2>{copy.area.withheldHeading(area.withheld.length)}</h2>
      </div></div>
      <ul>
        {area.withheld.map((destination) => <li key={destination.slug}>
          <Link href={destinationPath(locale, destination.slug)}>{destination.name}</Link>
          <span>{destination.recommendationHoldReason === "persistent-snow" ? copy.area.reasonSnow : copy.area.reasonNoMonth}</span>
        </li>)}
      </ul>
    </section> : null}
  </>;
}
