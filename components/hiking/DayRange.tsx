import type { ClimateMetrics, Locale } from "@/lib/data/types";
import { t } from "@/lib/i18n/dict";
import { dayShape } from "@/lib/hiking/day-shape";
import { degreesC } from "@/lib/format";

/**
 * A single month's walking window on the destination's own temperature scale,
 * so the reader can flip between months and see the band move.
 */
export function DayRange({metrics, domain, locale}:{metrics:ClimateMetrics; domain:{minC:number;maxC:number}; locale:Locale}) {
  const copy = t(locale).dayShape;
  const shape = dayShape(metrics);
  const span = domain.maxC - domain.minC;
  const at = (value:number) => Math.round(Math.min(100, Math.max(0, ((value - domain.minC) / span) * 100)) * 10) / 10;
  const left = at(metrics.temperatureHikingP10C);
  const width = Math.max(2, at(metrics.temperatureHikingP90C) - left);
  const notes = shape.notes.map((note) => {
    if (note === "freezingStart" || note === "coldStart") return {note, text: copy.note[note](shape.coldC)};
    if (note === "muggyAfternoon") return {note, text: copy.note.muggyAfternoon(shape.warmC, shape.humidityPct)};
    if (note === "hotAfternoon") return {note, text: copy.note.hotAfternoon(shape.warmC)};
    if (note === "wideSwing") return {note, text: copy.note.wideSwing(shape.swingC)};
    if (note === "moderate") return {note, text: copy.note.moderate(shape.coldC, shape.warmC, shape.swingC)};
    return {note, text: copy.note.steady(shape.coldC, shape.warmC)};
  });
  return <div className="day-range">
    <div className="day-range-track" role="img" aria-label={copy.rangeAria(shape.coldC, shape.meanC, shape.warmC)}>
      <span className="day-range-band" style={{left:`${left}%`, width:`${width}%`}}/>
      <span className="day-range-mean" style={{left:`${at(metrics.temperatureHikingMeanC)}%`}}/>
    </div>
    <div className="day-range-scale" aria-hidden="true">
      <div><strong>{degreesC(shape.coldC, locale, 0)}</strong><span>{copy.coldEnd}</span></div>
      <div><strong>{degreesC(shape.meanC, locale, 0)}</strong><span>{copy.meanLabel}</span></div>
      <div><strong>{degreesC(shape.warmC, locale, 0)}</strong><span>{copy.warmEnd}</span></div>
    </div>
    <ul className="day-range-notes">{notes.map((item)=><li key={item.note}>{item.text}</li>)}</ul>
    <p className="day-range-method">{copy.method}</p>
  </div>;
}
