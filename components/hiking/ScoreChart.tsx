import Link from "next/link";
import type { PublicMonth, Locale } from "@/lib/data/types";
import { monthName, monthNameShort } from "@/lib/i18n/config";
import { t } from "@/lib/i18n/dict";
import { destinationPath } from "@/lib/i18n/links";

export function ScoreChart({months,locale,slug}:{months:PublicMonth[];locale:Locale;slug:string}) {
  return <div className="score-chart" role="img" aria-label={t(locale).destination.scoreChartAria}>
    {months.map((month)=>{const score=month.overallScore ?? 0; return <Link key={month.month} href={destinationPath(locale,slug,month.month)} className="score-column" aria-label={`${monthName(month.month,locale)}: ${month.overallScore ?? "review"}`}><span className="score-value">{month.overallScore ?? "—"}</span><span className="bar-track"><span className="bar-fill" style={{height:`${Math.max(8,score)}%`}} /></span><span className="month-label">{monthNameShort(month.month,locale)}</span></Link>})}
  </div>;
}
