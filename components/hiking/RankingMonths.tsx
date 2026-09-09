import Link from "next/link";
import type { Locale } from "@/lib/data/types";
import { monthName, type ThemeKey } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dict";
import { links } from "@/lib/i18n/links";

/** Plain links keep month selection usable without JavaScript. */
export function RankingMonths({ locale, theme, selectedMonth }: { locale: Locale; theme?: ThemeKey; selectedMonth?: number }) {
  return <nav className="ranking-months" aria-label={t(locale).ranking.chooseMonth}>
    {Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      return <Link key={month} href={theme ? links.themeRanking(locale, theme, month) : links.ranking(locale, month)}
        aria-current={month === selectedMonth ? "page" : undefined}>
        {monthName(month, locale)}
      </Link>;
    })}
  </nav>;
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
      <RankingMonths locale={locale} theme={theme}/>
    </section>
  </>;
}
