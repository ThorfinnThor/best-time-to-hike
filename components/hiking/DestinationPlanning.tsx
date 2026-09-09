import Link from "next/link";
import type { Locale, PublicDestination, PublicMonth } from "@/lib/data/types";
import { monthName } from "@/lib/i18n/config";
import { links } from "@/lib/i18n/links";
import { planningCopy } from "@/lib/i18n/planning";
import { cellLabel, degreesC, metres } from "@/lib/format";
import { daylightDuration, planningNumber as number, hikingSources, planningRules as rules, typicalWetDays } from "@/lib/presentation/destination-planning";

export function PlanningContext({ destination, locale }: { destination: PublicDestination; locale: Locale }) {
  const c = planningCopy[locale];
  const cell = destination.representativeCell;
  const source = Object.hasOwn(hikingSources, destination.slug) ? hikingSources[destination.slug] : undefined;
  return <div className="planning-context">
    <div><h3>{c.scope}</h3><p>{c.scopeText}</p><p><strong>{c.elevation}: {metres(cell.modelElevationM, locale)}</strong> · {c.period}: {rules.normal.startYear}–{rules.normal.endYear}</p><p>{c.wind}</p>
      <details><summary>{c.definitions}</summary>
        <p>{c.coordinates}: {cellLabel(cell.lat, cell.lon)}{cell.overrideLabel ? ` · ${cell.overrideLabel}` : ""}</p>
        {cell.overrideReason ? <p>{cell.overrideReason}</p> : null}
        <p>{c.window} {rules.hikingWindowLocal.start}–{rules.hikingWindowLocal.end}.</p>
        <p>{c.wetDefinition} {rules.wetDayThresholdMm} {c.wetEnd}</p>
        <p>{c.snowDefinition} {rules.snowCoverThreshold * 100}% {c.snowCover} {c.or} {rules.snowDepthThresholdM * 100} cm {c.snowDepth}.</p>
      </details>
    </div>
    <div><h3>{c.next}</h3><p>{c.nextText}</p>{source ? <><a href={source.url} target="_blank" rel="noopener noreferrer">{c.routes} ↗</a><p className="planning-source">{source.source} · {c.example}</p></> : null}</div>
  </div>;
}

export function MonthPlanning({ destination, data, locale }: { destination: PublicDestination; data: PublicMonth; locale: Locale }) {
  const c = planningCopy[locale];
  const m = data.metrics;
  const cards = [
    { label: c.temperature, value: degreesC(m.temperatureHikingMeanC, locale), detail: `${c.range}: ${degreesC(m.temperatureHikingP10C, locale)}–${degreesC(m.temperatureHikingP90C, locale)}`, note: `${c.mean}. ${c.percentile}` },
    { label: c.rain, value: `≈ ${number(typicalWetDays(m.wetDayProbability, data.month), locale)} ${c.days}`, detail: `${number(m.wetDayProbability * 100, locale)}% ${c.percentDays} · ${number(m.precipitationMonthlyMeanMm, locale)} mm ${c.perMonth}`, note: c.wetNote },
    { label: c.daylight, value: daylightDuration(m.daylightHoursMean), detail: c.daylightNote, note: "" },
    { label: c.snow, value: `${number(m.snowDayProbability * 100, locale)}%`, detail: c.percentDays, note: c.snowNote, secondary: true },
    { label: `${c.heat} ${rules.hotThresholdC}°C`, value: `${number(m.hotDayProbability * 100, locale)}%`, detail: c.percentDays, note: c.heatNote, secondary: true },
  ];
  return <section className="content-section planning-panel">
    <div className="section-heading"><div><span className="eyebrow">{c.eyebrow}</span><h2>{c.glance}</h2><p>{monthName(data.month, locale)} · {destination.name} · {metres(destination.representativeCell.modelElevationM, locale)}</p></div></div>
    <div className="planning-metrics">{cards.map((card) => <article className={card.secondary ? "planning-secondary" : "planning-primary"} key={card.label}><h3>{card.label}</h3><strong>{card.value}</strong><p>{card.detail}</p>{card.note ? <small>{card.note}</small> : null}</article>)}</div>
    <PlanningContext destination={destination} locale={locale}/>
  </section>;
}

export function DestinationPlanning({ destination, locale }: { destination: PublicDestination; locale: Locale }) {
  const c = planningCopy[locale];
  return <section className="content-section planning-panel">
    <div className="section-heading"><div><span className="eyebrow">{c.eyebrow}</span><h2>{c.season}</h2></div></div>
    {destination.recommendationEligible ? <div className="planning-best"><h3>{c.best}</h3><div className="month-chips">{destination.bestMonths.map((month) => <Link key={month} href={links.destinationMonth(locale, destination.slug, month)}>{monthName(month, locale)} →</Link>)}</div><p>{c.bestNote}</p></div> : null}
    <p className="planning-table-hint">{c.tableHint}</p>
    <div className="planning-table-scroll" role="region" aria-label={c.season} tabIndex={0}><table className="planning-table">
      <caption>{c.tableNote}</caption>
      <thead><tr><th scope="col">{c.month}</th><th scope="col">{c.temperature}</th><th scope="col">{c.rain}</th><th scope="col">{c.snow}</th><th scope="col">{c.daylight}</th><th scope="col">{c.recommendation}</th></tr></thead>
      <tbody>{destination.months.map((data) => <tr key={data.month}>
        <th scope="row">{data.recommendationEligible ? <Link href={links.destinationMonth(locale, destination.slug, data.month)}>{monthName(data.month, locale)} →</Link> : monthName(data.month, locale)}</th>
        <td>{degreesC(data.metrics.temperatureHikingMeanC, locale)}</td><td>≈ {number(typicalWetDays(data.metrics.wetDayProbability, data.month), locale)}</td><td>{number(data.metrics.snowDayProbability * 100, locale)}%</td><td>{daylightDuration(data.metrics.daylightHoursMean)}</td>
        <td>{!data.recommendationEligible ? c.unavailable : destination.bestMonths.includes(data.month) ? <span className="planning-badge">{c.bestBadge}</span> : c.available}</td>
      </tr>)}</tbody>
    </table></div>
    <PlanningContext destination={destination} locale={locale}/>
  </section>;
}
