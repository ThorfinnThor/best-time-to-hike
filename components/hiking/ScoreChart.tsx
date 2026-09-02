import type { PublicMonth, Locale } from "@/lib/data/types";
import { destinationPath, monthName } from "@/lib/i18n/config";
import Link from "next/link";

export function ScoreChart({months,locale,slug}:{months:PublicMonth[];locale:Locale;slug:string}) {
  return <div className="score-chart" role="img" aria-label={locale === "de" ? "Wanderwerte über zwölf Monate" : "Hiking scores across twelve months"}>
    {months.map((month)=>{const score=month.overallScore ?? 0; return <Link key={month.month} href={destinationPath(locale,slug,month.month)} className="score-column" aria-label={`${monthName(month.month,locale)}: ${month.overallScore ?? "review"}`}><span className="score-value">{month.overallScore ?? "—"}</span><span className="bar-track"><span className="bar-fill" style={{height:`${Math.max(8,score)}%`}} /></span><span className="month-label">{monthName(month.month,locale).slice(0,3)}</span></Link>})}
  </div>;
}
