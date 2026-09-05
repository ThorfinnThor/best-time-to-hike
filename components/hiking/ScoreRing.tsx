import type { Locale } from "@/lib/data/types";
import { t } from "@/lib/i18n/dict";

export function ScoreRing({score,size="large",locale}:{score:number;size?:"large"|"small";locale:Locale}) {
  const color = score >= 85 ? "#416f52" : score >= 65 ? "#c38b3d" : "#c65f42";
  return <div className={`score-ring ${size}`} style={{background:`conic-gradient(${color} ${score*3.6}deg, rgba(255,255,255,.22) 0deg)`}} aria-label={t(locale).common.scoreOutOf(score)}><span><strong>{score}</strong><small>/100</small></span></div>;
}
