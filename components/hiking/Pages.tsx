import Link from "next/link";
import type { Comparison, Locale, PublicDestination, Ranking } from "@/lib/data/types";
import { monthName, monthNameShort } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dict";
import { destinationPath, rankingPath } from "@/lib/i18n/links";
import { getDestination, getManifest } from "@/lib/data/load";
import { ScoreRing } from "./ScoreRing";
import { ScoreChart } from "./ScoreChart";
import { ComponentGrid } from "./ComponentGrid";
import { DestinationImage } from "@/components/media/DestinationImage";

export function FixtureNotice({locale}:{locale:Locale}) {
  const copy = t(locale).notices;
  const realData = getManifest().datasetStatus !== "fixture";
  return <div className="fixture-notice"><strong>{realData ? copy.realDataTitle : copy.fixtureTitle}</strong><span>{realData ? copy.realDataBody : copy.fixtureBody}</span></div>;
}

function RecommendationReviewNotice({locale, destination}:{locale:Locale; destination:PublicDestination}) {
  const copy = t(locale).notices;
  if (!destination.recommendationHoldReason) return null;
  const cell = destination.representativeCell;
  return <aside className="method-note recommendation-review" role="status"><span>⚠</span><div><strong>{copy.holdTitle}</strong><p>{copy.holdBody}</p><p>{copy.selectedCell(cell.lat, cell.lon, cell.modelElevationM)}</p></div></aside>;
}

export function DestinationPage({destination,locale}:{destination:PublicDestination;locale:Locale}) {
  const copy = t(locale); const c = copy.destination;
  const held = destination.recommendationHoldReason === "persistent-snow";
  const unavailable = !destination.recommendationEligible;
  const hasEligibleMonth = destination.months.some((month)=>month.recommendationEligible);
  const peak = Math.max(0,...destination.months.flatMap((month)=>month.overallScore===null?[]:[month.overallScore]));
  const cell = destination.representativeCell;
  return <>
    <FixtureNotice locale={locale}/>
    <section className="destination-hero"><DestinationImage slug={destination.slug} name={destination.name} className="destination-hero-photo"/><span className="destination-hero-scrim" aria-hidden="true"/><div className="eyebrow">{destination.countryName} · {destination.region}</div><div className="destination-title"><div><h1>{held ? c.titleHeld(destination.name) : unavailable ? c.titleUnavailable(destination.name) : c.title(destination.name)} </h1><p>{c.cellScope(cell.modelElevationM)}</p></div>{unavailable ? null : <ScoreRing score={peak} locale={locale}/>}</div><div className="topo-lines" aria-hidden="true"/></section>
    <RecommendationReviewNotice locale={locale} destination={destination}/>
    {!unavailable ? <section className="content-section"><div className="section-heading"><div><span className="eyebrow">12 {copy.common.months}</span><h2>{c.best}</h2></div><p>{destination.bestMonths.map((month)=>monthName(month,locale)).join(" · ")}</p></div><ScoreChart months={destination.months} locale={locale} slug={destination.slug}/></section> : null}
    {unavailable && !hasEligibleMonth && !held ? <aside className="method-note recommendation-review" role="status"><span>⚠</span><div><strong>{copy.notices.noEligibleMonthTitle}</strong><p>{copy.notices.noEligibleMonthBody}</p></div></aside> : null}
    <section className="content-section split"><div><span className="eyebrow">{unavailable ? c.provenanceEyebrow : c.elevation}</span><h2>{unavailable ? c.selectedCellHeading : c.referencePointHeading}</h2><p>{held ? c.heldBody : unavailable ? c.unavailableBody : c.scopeBody}</p><p>{cell.lat}, {cell.lon} · {cell.modelElevationM} m</p></div><div className="elevation-list">{destination.elevationBands.map((band)=><div key={band.id}><span>{band.id.replaceAll("-"," ")}</span><strong>{band.minM}–{band.maxM} m</strong><small>{Math.round(band.weight*100)}% {copy.common.weight}</small></div>)}</div></section>
    <section className="content-section"><div className="section-heading"><div><span className="eyebrow">{c.alternatives}</span><h2>{c.keepExploring}</h2></div></div><div className="card-grid">{destination.alternatives.map((slug)=>{const item=getDestination(slug)!;return <Link className="destination-card" href={destinationPath(locale,slug)} key={slug}><span>{item.countryCode}</span><h3>{item.name}</h3><p>{item.bestMonths.map((month)=>monthName(month,locale)).join(" · ")}</p><strong>{c.exploreDestination}</strong></Link>})}</div></section>
    <MethodNote locale={locale}/>
  </>;
}

export function MonthPage({destination,month,locale}:{destination:PublicDestination;month:number;locale:Locale}) {
  const copy = t(locale); const c = copy.destination; const m = copy.month;
  const data = destination.months[month-1];
  const previous = month===1?12:month-1; const next = month===12?1:month+1;
  const cell = destination.representativeCell;
  if (destination.recommendationHoldReason === "persistent-snow") return <><FixtureNotice locale={locale}/><section className="page-intro prose-intro"><span className="eyebrow">{destination.name} · {monthName(month,locale)}</span><h1>{m.reviewTitle(destination.name)}</h1><p>{m.reviewBody}</p><p>{copy.notices.selectedCell(cell.lat, cell.lon, cell.modelElevationM)}</p></section><RecommendationReviewNotice locale={locale} destination={destination}/><MethodNote locale={locale}/></>;
  if (!data || data.overallScore === null || data.confidenceScore === null || data.confidenceLevel === null || data.components === null || data.scoreLevel === null) return <><FixtureNotice locale={locale}/><section className="page-intro prose-intro"><span className="eyebrow">{destination.name} · {monthName(month,locale)}</span><h1>{m.noDataTitle}</h1><p>{m.noDataBody}</p></section><MethodNote locale={locale}/></>;
  return <>
    <FixtureNotice locale={locale}/>
    {!data.recommendationEligible ? <aside className="method-note recommendation-review" role="status"><span>⚠</span><div><strong>{copy.notices.ineligibleMonthTitle}</strong><p>{copy.notices.ineligibleMonthBody}</p></div></aside> : null}
    <section className="month-hero"><div><span className="eyebrow">{destination.name} · {monthName(month,locale)}</span><h1>{m.heading(destination.name, monthName(month,locale))}</h1><p>{c.method}</p></div><ScoreRing score={data.overallScore} locale={locale}/></section>
    <section className="stats-strip"><div><span>{c.confidence}</span><strong>{data.confidenceScore}%</strong></div><div><span>{copy.common.meanTemperature}</span><strong>{data.metrics.temperatureHikingMeanC}°C</strong></div><div><span>{copy.common.wetDays}</span><strong>{Math.round(data.metrics.wetDayProbability*100)}%</strong></div><div><span>{copy.common.daylight}</span><strong>{data.metrics.daylightHoursMean}h</strong></div></section>
    <section className="content-section"><div className="section-heading"><div><span className="eyebrow">{c.why}</span><h2>{m.componentsHeading}</h2></div></div><ComponentGrid components={data.components} locale={locale}/></section>
    <section className="content-section"><div className="section-heading"><div><span className="eyebrow">{c.elevation}</span><h2>{destination.elevationBands.length===1 ? m.selectedCellHeading : m.bandsHeading}</h2></div></div><div className="band-table">{data.bands.map((band)=><div key={band.bandId}><div><strong>{band.bandId.replaceAll("-"," ")}</strong><span>{band.targetElevationM} m</span></div><ScoreRing score={band.overallScore ?? 0} size="small" locale={locale}/><div><span>{band.temperatureHikingMeanC}°C</span><small>{Math.round(band.snowDayProbability*100)}% {copy.common.snowDays}</small></div></div>)}</div></section>
    <nav className="month-nav" aria-label={m.adjacentAria}><Link href={destinationPath(locale,destination.slug,previous)}>← {monthName(previous,locale)}</Link><Link href={destinationPath(locale,destination.slug)}>{destination.name}</Link><Link href={destinationPath(locale,destination.slug,next)}>{monthName(next,locale)} →</Link></nav>
    <MethodNote locale={locale}/>
  </>;
}

export function RankingPage({ranking,locale,title}:{ranking:Ranking;locale:Locale;title?:string}) {
  const copy = t(locale);
  return <><FixtureNotice locale={locale}/><section className="page-intro"><span className="eyebrow">{monthName(ranking.month,locale)} · {ranking.theme}</span><h1>{title ?? copy.ranking.headingIn(monthName(ranking.month,locale))}</h1><p>{copy.ranking.intro}</p></section><section className="ranking-list">{ranking.entries.map((entry)=><Link href={destinationPath(locale,entry.slug,ranking.month)} key={entry.slug}><span className="ranking-number">{String(entry.rank).padStart(2,"0")}</span><div><h2>{entry.name}</h2><p>{entry.countryCode} · {entry.tempC}°C · {Math.round(entry.wet*100)}% {copy.common.wetDays}</p></div><ScoreRing score={entry.score} size="small" locale={locale}/></Link>)}</section><MethodNote locale={locale}/></>;
}

export function ComparisonPage({comparison,locale}:{comparison:Comparison;locale:Locale}) {
  const copy = t(locale);
  const first=getDestination(comparison.destinations[0])!; const second=getDestination(comparison.destinations[1])!;
  return <><FixtureNotice locale={locale}/><section className="page-intro"><span className="eyebrow">{copy.comparison.eyebrow}</span><h1>{first.name} vs {second.name}</h1><p>{copy.comparison.intro}</p></section><section className="comparison-grid"><div className="comparison-head"><strong>{first.name}</strong><span>{copy.common.month}</span><strong>{second.name}</strong></div>{comparison.months.map((item)=><div key={item.month}><span className={item.winner===first.slug?"winner":""}>{item.firstScore ?? "—"}</span><Link href={rankingPath(locale,item.month)}>{monthNameShort(item.month,locale)}</Link><span className={item.winner===second.slug?"winner":""}>{item.secondScore ?? "—"}</span></div>)}</section><div className="centered-links"><Link className="button secondary" href={destinationPath(locale,first.slug)}>{first.name}</Link><Link className="button secondary" href={destinationPath(locale,second.slug)}>{second.name}</Link></div><MethodNote locale={locale}/></>;
}

export function MethodNote({locale}:{locale:Locale}) {
  const copy = t(locale).notices;
  return <aside className="method-note"><span>ⓘ</span><div><strong>{copy.methodTitle}</strong><p>{copy.methodBody}</p></div></aside>;
}
