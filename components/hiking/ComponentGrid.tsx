import type { ComponentScores, Locale } from "@/lib/data/types";
import { t } from "@/lib/i18n/dict";

export function ComponentGrid({components,locale}:{components:ComponentScores;locale:Locale}) {
  const labels = t(locale).components;
  return <div className="component-grid">{(Object.keys(components) as Array<keyof ComponentScores>).map((key)=><div className="component-card" key={key}><div><span>{labels[key]}</span><strong>{Math.round(components[key])}</strong></div><div className="meter"><span style={{width:`${components[key]}%`}} /></div></div>)}</div>;
}
