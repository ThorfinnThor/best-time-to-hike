import type { Locale } from "@/lib/data/types";
import { t } from "@/lib/i18n/dict";
import { scoreLevel } from "@/lib/scoring/index";

// The ring colour follows the published score ladder. It used to carry its own
// 85/65 boundaries, which were the *confidence* thresholds applied to a score,
// so a "very-good" 82 was drawn in the middling colour (mistakes.md #13).
const RING_COLOR = {
  excellent: "#416f52",
  "very-good": "#416f52",
  good: "#c38b3d",
  fair: "#c65f42",
  poor: "#c65f42",
} as const;

export function ScoreRing({score,size="large",locale}:{score:number;size?:"large"|"small";locale:Locale}) {
  const color = RING_COLOR[scoreLevel(score)];
  return <div className={`score-ring ${size}`} style={{background:`conic-gradient(${color} ${score*3.6}deg, rgba(255,255,255,.22) 0deg)`}} aria-label={t(locale).common.scoreOutOf(score)}><span><strong>{score}</strong><small>/100</small></span></div>;
}
