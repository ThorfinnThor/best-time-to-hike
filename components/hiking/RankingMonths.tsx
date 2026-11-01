import type { Locale, RankingEntry } from "@/lib/data/types";
import { monthName, type ThemeKey } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dict";
import { links } from "@/lib/i18n/links";
import { degreesC } from "@/lib/format";
import { ScoreRing } from "./ScoreRing";
import { DestinationImage } from "@/components/media/DestinationImage";
import { filterRankingRegion, rankingRegions } from "@/lib/hiking/ranking-region";
import { RankingRegionFilter } from "./RankingRegionFilter";

/**
 * Plain anchors, so month selection works without JavaScript. `data-base` is the
 * region-free URL; RankingRegionFilter appends the region to it after hydration.
 */
export function RankingMonths({ locale, theme, selectedMonth }: { locale: Locale; theme?: ThemeKey; selectedMonth?: number }) {
  return <nav className="ranking-months" aria-label={t(locale).ranking.chooseMonth}>
    {Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const href = `${theme ? links.themeRanking(locale, theme, month) : links.ranking(locale, month)}/`;
      return <a key={month} href={href} data-base={href} aria-current={month === selectedMonth ? "page" : undefined}>
        {monthName(month, locale)}
      </a>;
    })}
  </nav>;
}

type ExplorerProps = { locale: Locale; theme?: ThemeKey; selectedMonth?: number; entries?: Array<RankingEntry & { continent: string }> };

/**
 * A ranking, rendered on the server in full.
 *
 * Every card is static HTML with its continent in `data-continent`; the region
 * filter is a small client island that only flips a data attribute. Card links
 * are plain anchors rather than next/link: a destination-month page is a full
 * document either way, and 336 client links were most of the hydration cost.
 */
export function RankingExplorer({ locale, theme, selectedMonth, entries = [] }: ExplorerProps) {
  const copy = t(locale);
  const options = rankingRegions.map((value) => ({value, label: copy.ranking.regions[value]}));
  const counts = selectedMonth ? Object.fromEntries(rankingRegions.map((region) => {
    const count = filterRankingRegion(entries, region).length;
    return [region, {text: copy.ranking.resultCount(count), empty: count === 0}];
  })) : undefined;
  return <div className="ranking-explorer">
    <RankingRegionFilter label={copy.ranking.region} options={options} counts={counts} initialCount={counts?.worldwide.text}/>
    <RankingMonths locale={locale} theme={theme} selectedMonth={selectedMonth}/>
    {selectedMonth ? <section className="ranking-results" aria-label={copy.ranking.heading}>
      {entries.map((entry, index) => {
        const href = `${links.destinationMonth(locale, entry.slug, selectedMonth)}/`;
        return <article className="ranking-result-card" key={entry.slug} data-continent={entry.continent}>
          <a className="ranking-result-art" href={href} aria-label={`${entry.name} · ${monthName(selectedMonth, locale)}`}>
            <DestinationImage slug={entry.slug} name={entry.name} region={entry.countryCode} priority={index < 2}/>
            {/* The number comes from a CSS counter, so it follows the region filter. */}
            <span className="ranking-result-number" aria-hidden="true"/>
            <span className="ranking-result-score"><ScoreRing score={entry.score} size="small" locale={locale}/></span>
          </a>
          <div className="ranking-result-body">
            <div className="ranking-result-heading"><div><span>{entry.countryCode}</span><h2>{entry.name}</h2></div></div>
            <p>{degreesC(entry.tempC, locale)} · {Math.round(entry.wet * 100)}% {copy.common.wetDays}</p>
            <a className="ranking-result-link" href={href}>{copy.destination.exploreDestination}</a>
          </div>
        </article>;
      })}
      <p className="ranking-empty" hidden={entries.length > 0}>{copy.ranking.emptyRegion}</p>
    </section> : null}
  </div>;
}

export function RankingMonthSelectionPage({ locale, theme }: { locale: Locale; theme?: ThemeKey }) {
  const copy = t(locale).ranking;
  return <>
    <section className="page-intro tool-intro">
      <span className="eyebrow">{copy.chooseMonth}</span>
      <h1>{theme ? copy.themes[theme] : copy.heading}</h1>
      <p>{copy.chooseMonthIntro}</p>
    </section>
    <section className="content-section month-selection">
      <h2>{t(locale).common.month}</h2>
      <RankingExplorer locale={locale} theme={theme}/>
    </section>
  </>;
}
