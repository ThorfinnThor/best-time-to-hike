import Link from "next/link";
import type { Comparison, ComponentScores, Locale, PublicDestination, Ranking } from "@/lib/data/types";
import { monthName, monthNameShort } from "@/lib/i18n/config";
import { cellLabel, degreesC, metreRange, metres } from "@/lib/format";
import { t, taxonomyLabel } from "@/lib/i18n/dict";
import { destinationPath, rankingPath } from "@/lib/i18n/links";
import { getDestination, getManifest } from "@/lib/data/load";
import { COMPONENT_KEYS, CRITICAL_COMPONENT_FLOOR, CRITICAL_COMPONENT_KEYS, type ComponentKey } from "@/lib/scoring/recommendations";
import { dayShapeDomain } from "@/lib/hiking/day-shape";
import { ScoreRing } from "./ScoreRing";
import { ScoreChart } from "./ScoreChart";
import { ComponentGrid } from "./ComponentGrid";
import { DayRange } from "./DayRange";
import { DestinationImage } from "@/components/media/DestinationImage";


function RecommendationReviewNotice({locale, destination}:{locale:Locale; destination:PublicDestination}) {
  const copy = t(locale).notices;
  if (!destination.recommendationHoldReason) return null;
  const cell = destination.representativeCell;
  const body=destination.recommendationHoldReason === "persistent-snow" ? copy.holdBody : copy.precipitationHoldBody;
  return <aside className="method-note recommendation-review" role="status"><span>⚠</span><div><strong>{copy.holdTitle}</strong><p>{body}</p><p>{copy.selectedCell(cellLabel(cell.lat, cell.lon), metres(cell.modelElevationM, locale))}</p></div></aside>;
}

/** Which critical components closed a month, for the summary on the detail page. */
function failing(components: ComponentScores): ComponentKey[] {
  return CRITICAL_COMPONENT_KEYS.filter((key) => components[key] <= CRITICAL_COMPONENT_FLOOR);
}

export function DestinationPage({destination,locale}:{destination:PublicDestination;locale:Locale}) {
  const copy = t(locale); const c = copy.destination;
  const held = Boolean(destination.recommendationHoldReason);
  const unavailable = !destination.recommendationEligible;
  const hasEligibleMonth = destination.months.some((month)=>month.recommendationEligible);
  const peak = Math.max(0,...destination.months.flatMap((month)=>month.overallScore===null?[]:[month.overallScore]));
  const cell = destination.representativeCell;
  const closed = destination.months.filter((month)=>!month.recommendationEligible);
  return <>
    
    <section className="destination-hero"><DestinationImage slug={destination.slug} name={destination.name} className="destination-hero-photo"/><span className="destination-hero-scrim" aria-hidden="true"/><div className="eyebrow">{destination.countryName} · {taxonomyLabel(locale, "regions", destination.region)}</div><div className="destination-title"><div><h1>{held ? c.titleHeld(destination.name) : unavailable ? c.titleUnavailable(destination.name) : c.title(destination.name)} </h1><p>{c.cellScope(metres(cell.modelElevationM, locale))}</p></div>{unavailable ? null : <ScoreRing score={peak} locale={locale}/>}</div><div className="topo-lines" aria-hidden="true"/></section>
    <RecommendationReviewNotice locale={locale} destination={destination}/>
    {!unavailable ? <section className="content-section"><div className="section-heading"><div><span className="eyebrow">12 {copy.common.months}</span><h2>{c.best}</h2></div><p>{destination.bestMonths.map((month)=>monthName(month,locale)).join(" · ")}</p></div><ScoreChart months={destination.months} locale={locale} slug={destination.slug}/></section> : null}
    {unavailable && !hasEligibleMonth && !held ? <aside className="method-note recommendation-review" role="status"><span>⚠</span><div><strong>{copy.notices.noEligibleMonthTitle}</strong><p>{copy.notices.noEligibleMonthBody}</p></div></aside> : null}
    <section className="content-section split"><div><span className="eyebrow">{unavailable ? c.provenanceEyebrow : c.elevation}</span><h2>{unavailable ? c.selectedCellHeading : c.referencePointHeading}</h2><p>{held ? destination.recommendationHoldReason === "persistent-snow" ? c.heldBody : c.precipitationHeldBody : unavailable ? c.unavailableBody : c.scopeBody}</p><p>{cellLabel(cell.lat, cell.lon)} · {metres(cell.modelElevationM, locale)}</p></div><div className="elevation-list">{destination.elevationBands.map((band)=><div key={band.id}><span>{band.id.replaceAll("-"," ")}</span><strong>{metreRange(band.minM, band.maxM, locale)}</strong><small>{Math.round(band.weight*100)}% {copy.common.weight}</small></div>)}</div></section>
    {closed.length ? <section className="content-section closed-months"><div className="section-heading"><div><span className="eyebrow">{c.closedEyebrow}</span><h2>{c.closedHeading(closed.length)}</h2><p>{c.closedIntro}</p></div></div>
      <ul>{closed.map((month)=><li key={month.month}>
        <strong>{monthName(month.month,locale)}</strong>
        <span>{month.metrics ? degreesC(month.metrics.temperatureHikingMeanC, locale) : "—"}</span>
        <span>{month.metrics ? `${Math.round(month.metrics.wetDayProbability*100)}% ${copy.common.wetDays}` : "—"}</span>
        <span>{month.components ? c.closedReason(failing(month.components).map((key)=>copy.components[key]).join(", ")) : c.closedReasonUnknown}</span>
      </li>)}</ul>
    </section> : null}
    <section className="content-section"><div className="section-heading"><div><span className="eyebrow">{c.alternatives}</span><h2>{c.keepExploring}</h2></div></div><div className="card-grid">{destination.alternatives.map((slug)=>{const item=getDestination(slug)!;return <Link className="destination-card" href={destinationPath(locale,slug)} key={slug}><span>{item.countryCode}</span><h3>{item.name}</h3><p>{item.bestMonths.map((month)=>monthName(month,locale)).join(" · ")}</p><strong>{c.exploreDestination}</strong></Link>})}</div></section>
    <MethodNote locale={locale}/>
  </>;
}

/**
 * The components dragging a month's score down without withholding it.
 *
 * Recomputed here from the published components rather than exported as a list:
 * the caveat says a component is below the floor, this says which, and both
 * read the same threshold.
 */
function belowFloor(components: ComponentScores): ComponentKey[] {
  return COMPONENT_KEYS.filter((key) => !CRITICAL_COMPONENT_KEYS.includes(key) && components[key] <= CRITICAL_COMPONENT_FLOOR);
}

export function MonthPage({destination,month,locale}:{destination:PublicDestination;month:number;locale:Locale}) {
  const copy = t(locale); const c = copy.destination; const m = copy.month;
  const data = destination.months[month-1];
  // Adjacent months that the gate withholds no longer have a route, so the nav
  // steps to the nearest one that does.
  const open = destination.months.filter((item)=>item.recommendationEligible).map((item)=>item.month);
  const step = (from: number, direction: 1 | -1) => {
    for (let offset=1; offset<=12; offset+=1) {
      const candidate = ((from - 1 + direction * offset + 12 * 12) % 12) + 1;
      if (open.includes(candidate)) return candidate;
    }
    return null;
  };
  const previous = step(month, -1); const next = step(month, 1);
  const cell = destination.representativeCell;
  if (destination.recommendationHoldReason) return <><section className="page-intro prose-intro"><span className="eyebrow">{destination.name} · {monthName(month,locale)}</span><h1>{m.reviewTitle(destination.name)}</h1><p>{destination.recommendationHoldReason === "persistent-snow" ? m.reviewBody : m.precipitationReviewBody}</p></section><RecommendationReviewNotice locale={locale} destination={destination}/><MethodNote locale={locale}/></>;
  if (!data || data.overallScore === null || data.confidenceScore === null || data.confidenceLevel === null || data.components === null || data.scoreLevel === null) return <><section className="page-intro prose-intro"><span className="eyebrow">{destination.name} · {monthName(month,locale)}</span><h1>{m.noDataTitle}</h1><p>{m.noDataBody}</p></section><MethodNote locale={locale}/></>;
  return <>
    
    {!data.recommendationEligible ? <aside className="method-note recommendation-review" role="status"><span>⚠</span><div><strong>{copy.notices.ineligibleMonthTitle}</strong><p>{copy.notices.ineligibleMonthBody}</p></div></aside> : null}
    {data.recommendationEligible && data.caveats.includes("non-critical-component-floor")
      ? <aside className="method-note below-floor" role="status"><span>ⓘ</span><div><strong>{copy.notices.belowFloorTitle}</strong><p>{copy.notices.belowFloorBody(belowFloor(data.components).map((key)=>copy.components[key]).join(", "))}</p></div></aside>
      : null}
    <section className="month-hero"><div><span className="eyebrow">{destination.name} · {monthName(month,locale)}</span><h1>{m.heading(destination.name, monthName(month,locale))}</h1><p>{c.method}</p></div><ScoreRing score={data.overallScore} level={data.scoreLevel} locale={locale}/></section>
    <section className="stats-strip"><div><span>{c.confidence}</span><strong>{data.confidenceScore}%</strong></div><div><span>{copy.common.meanTemperature}</span><strong>{degreesC(data.metrics.temperatureHikingMeanC, locale)}</strong></div><div><span>{copy.common.wetDays}</span><strong>{Math.round(data.metrics.wetDayProbability*100)}%</strong></div><div><span>{copy.common.daylight}</span><strong>{data.metrics.daylightHoursMean}h</strong></div></section>
    <section className="content-section"><div className="section-heading"><div><span className="eyebrow">{c.why}</span><h2>{m.componentsHeading}</h2></div></div><ComponentGrid components={data.components} locale={locale}/></section>
    <section className="content-section"><div className="section-heading"><div><span className="eyebrow">{copy.dayShape.eyebrow}</span><h2>{copy.dayShape.heading}</h2></div></div><DayRange metrics={data.metrics} domain={dayShapeDomain(destination.months.filter((item)=>item.metrics))} locale={locale}/></section>
    <section className="content-section"><div className="section-heading"><div><span className="eyebrow">{c.elevation}</span><h2>{destination.elevationBands.length===1 ? m.selectedCellHeading : m.bandsHeading}</h2></div></div><div className="band-table">{data.bands.map((band)=><div key={band.bandId}><div><strong>{band.bandId.replaceAll("-"," ")}</strong><span>{metres(band.targetElevationM, locale)}</span></div><ScoreRing score={band.overallScore ?? 0} size="small" locale={locale}/><div><span>{degreesC(band.temperatureHikingMeanC, locale)}</span><small>{Math.round(band.snowDayProbability*100)}% {copy.common.snowDays}</small></div></div>)}</div></section>
    <nav className="month-nav" aria-label={m.adjacentAria}>{previous && previous!==month ? <Link href={destinationPath(locale,destination.slug,previous)}>← {monthName(previous,locale)}</Link> : <span/>}<Link href={destinationPath(locale,destination.slug)}>{destination.name}</Link>{next && next!==month ? <Link href={destinationPath(locale,destination.slug,next)}>{monthName(next,locale)} →</Link> : <span/>}</nav>
    <MethodNote locale={locale}/>
  </>;
}

/** Ranking themes travel as data ids; readers should never see one. */
function rankingThemeLabel(theme: string, locale: Locale): string {
  const themes = t(locale).ranking.themes;
  if (theme === "warm") return themes.warm;
  if (theme === "snow-free" || theme === "snowFree") return themes.snowFree;
  if (theme === "low-rain" || theme === "lowRain") return themes.lowRain;
  return t(locale).ranking.themeAll;
}

export function RankingPage({ranking,locale,title}:{ranking:Ranking;locale:Locale;title?:string}) {
  const copy = t(locale);
  return <><section className="page-intro"><span className="eyebrow">{monthName(ranking.month,locale)} · {rankingThemeLabel(ranking.theme, locale)}</span><h1>{title ?? copy.ranking.headingIn(monthName(ranking.month,locale))}</h1><p>{copy.ranking.intro}</p></section><section className="ranking-list">{ranking.entries.map((entry)=><Link href={destinationPath(locale,entry.slug,ranking.month)} key={entry.slug}><span className="ranking-number">{String(entry.rank).padStart(2,"0")}</span><div><h2>{entry.name}</h2><p>{entry.countryCode} · {degreesC(entry.tempC, locale)} · {Math.round(entry.wet*100)}% {copy.common.wetDays}</p></div><ScoreRing score={entry.score} size="small" locale={locale}/></Link>)}</section><MethodNote locale={locale}/></>;
}

export function ComparisonPage({comparison,locale}:{comparison:Comparison;locale:Locale}) {
  const copy = t(locale);
  const first=getDestination(comparison.destinations[0])!; const second=getDestination(comparison.destinations[1])!;
  return <><section className="page-intro"><span className="eyebrow">{copy.comparison.eyebrow}</span><h1>{first.name} vs {second.name}</h1><p>{copy.comparison.intro}</p></section><section className="comparison-grid"><div className="comparison-head"><strong>{first.name}</strong><span>{copy.common.month}</span><strong>{second.name}</strong></div>{comparison.months.map((item)=><div key={item.month}><span className={item.winner===first.slug?"winner":""}>{item.firstScore ?? "—"}</span><Link href={rankingPath(locale,item.month)}>{monthNameShort(item.month,locale)}</Link><span className={item.winner===second.slug?"winner":""}>{item.secondScore ?? "—"}</span></div>)}</section><div className="centered-links"><Link className="button secondary" href={destinationPath(locale,first.slug)}>{first.name}</Link><Link className="button secondary" href={destinationPath(locale,second.slug)}>{second.name}</Link></div><MethodNote locale={locale}/></>;
}

export function MethodNote({locale}:{locale:Locale}) {
  const copy = t(locale).notices;
  return <aside className="method-note"><span>ⓘ</span><div><strong>{copy.methodTitle}</strong><p>{copy.methodBody}</p></div></aside>;
}
