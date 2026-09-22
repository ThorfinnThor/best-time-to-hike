"use client";

import { Suspense, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Locale, RankingEntry } from "@/lib/data/types";
import { monthName, type ThemeKey } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dict";
import { links } from "@/lib/i18n/links";
import { degreesC } from "@/lib/format";
import { ScoreRing } from "./ScoreRing";
import { DestinationImage } from "@/components/media/DestinationImage";
import { filterRankingRegion, parseRankingRegion, rankingRegionHref, rankingRegions, type RankingRegion } from "@/lib/hiking/ranking-region";

/** Plain links keep month selection usable without JavaScript. */
export function RankingMonths({ locale, theme, selectedMonth, region = "worldwide" }: { locale: Locale; theme?: ThemeKey; selectedMonth?: number; region?: RankingRegion }) {
  return <nav className="ranking-months" aria-label={t(locale).ranking.chooseMonth}>
    {Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      return <Link key={month} href={rankingRegionHref(theme ? links.themeRanking(locale, theme, month) : links.ranking(locale, month), region)}
        aria-current={month === selectedMonth ? "page" : undefined}>
        {monthName(month, locale)}
      </Link>;
    })}
  </nav>;
}

type ExplorerProps = { locale: Locale; theme?: ThemeKey; selectedMonth?: number; entries?: Array<RankingEntry & { continent: string }> };

function ExplorerView({ locale, theme, selectedMonth, entries = [], region, onRegionChange }: ExplorerProps & { region: RankingRegion; onRegionChange?: (region: RankingRegion) => void }) {
  const copy = t(locale);
  const filtered = filterRankingRegion(entries, region);
  return <>
    <div className="ranking-filter">
      <label><span>{copy.ranking.region}</span><select value={region} disabled={!onRegionChange}
        onChange={(event) => onRegionChange?.(parseRankingRegion(event.target.value))}>
        {rankingRegions.map((value) => <option key={value} value={value}>{copy.ranking.regions[value]}</option>)}
      </select></label>
      {selectedMonth ? <p role="status">{copy.ranking.resultCount(filtered.length)}</p> : null}
    </div>
    <RankingMonths locale={locale} theme={theme} selectedMonth={selectedMonth} region={region}/>
    {selectedMonth ? <section className="ranking-results" aria-label={copy.ranking.heading}>
      {filtered.map((entry, index) => <article className="ranking-result-card" key={entry.slug}>
        <Link className="ranking-result-art" href={links.destinationMonth(locale, entry.slug, selectedMonth)} aria-label={`${entry.name} · ${monthName(selectedMonth, locale)}`}>
          <DestinationImage slug={entry.slug} name={entry.name} region={entry.countryCode}/>
          <span className="ranking-result-number">{String(index + 1).padStart(2, "0")}</span>
          <span className="ranking-result-score"><ScoreRing score={entry.score} size="small" locale={locale}/></span>
        </Link>
        <div className="ranking-result-body">
          <div className="ranking-result-heading"><div><span>{entry.countryCode}</span><h2>{entry.name}</h2></div></div>
          <p>{degreesC(entry.tempC, locale)} · {Math.round(entry.wet * 100)}% {copy.common.wetDays}</p>
          <Link className="ranking-result-link" href={links.destinationMonth(locale, entry.slug, selectedMonth)}>{copy.destination.exploreDestination} <span aria-hidden="true">→</span></Link>
        </div>
      </article>)}
      {!filtered.length ? <p className="ranking-empty">{copy.ranking.emptyRegion}</p> : null}
    </section> : null}
  </>;
}

const subscribeHydration = () => () => {};
const clientHydrated = () => true;
const serverHydrated = () => false;

function QueryExplorer(props: ExplorerProps) {
  const search = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  // Static HTML is worldwide. Match it on the first client render before
  // applying the browser-only query, including on shared links and reloads.
  const hydrated = useSyncExternalStore(subscribeHydration, clientHydrated, serverHydrated);
  const region = hydrated ? parseRankingRegion(search.get("region")) : "worldwide";
  return <ExplorerView {...props} region={region} onRegionChange={(value) => {
    const query = new URLSearchParams(search.toString());
    if (value === "worldwide") query.delete("region"); else query.set("region", value);
    router.replace(query.size ? `${pathname}?${query}` : pathname, { scroll: false });
  }}/>;
}

export function RankingExplorer(props: ExplorerProps) {
  return <div className="ranking-explorer"><Suspense fallback={<ExplorerView {...props} region="worldwide"/>}>
    <QueryExplorer {...props}/>
  </Suspense></div>;
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
