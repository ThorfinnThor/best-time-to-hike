import type { ClimateMetrics } from "@/lib/data/types";
import { interpolate } from "@/lib/scoring";
import curves from "@/data-config/scoring/curves.json";

/**
 * The month metrics carry a cold and a warm end of the walking window that the
 * score uses but nothing on the site ever showed. A mean of 14 degrees reads the
 * same whether the day holds steady or swings from four to twenty-four, and only
 * one of those two needs a second layer in the pack. This turns the two
 * percentiles and the humidity mean into that reading.
 *
 * Thresholds come from the temperature curve the scorer already uses rather than
 * from fresh numbers: a note fires where the curve says comfort has dropped off.
 */
export type DayNote = "freezingStart" | "coldStart" | "muggyAfternoon" | "hotAfternoon" | "wideSwing" | "moderate" | "steady";

export interface DayShape {
  coldC: number;
  meanC: number;
  warmC: number;
  swingC: number;
  humidityPct: number;
  notes: DayNote[];
}

const comfortable = 60;
const easy = 85;
const wideSwingC = 14;

export function dayShape(metrics: ClimateMetrics): DayShape {
  const coldC = Math.round(metrics.temperatureHikingP10C);
  const warmC = Math.round(metrics.temperatureHikingP90C);
  const coldComfort = interpolate(metrics.temperatureHikingP10C, curves.temperature as [number, number][]);
  const warmComfort = interpolate(metrics.temperatureHikingP90C, curves.temperature as [number, number][]);
  const humidityPct = Math.round(metrics.relativeHumidityHikingMeanPct);
  const swingC = Math.round(metrics.temperatureHikingP90C - metrics.temperatureHikingP10C);
  const notes: DayNote[] = [];
  if (metrics.temperatureHikingP10C <= 0) notes.push("freezingStart");
  else if (coldComfort < comfortable) notes.push("coldStart");
  if (warmComfort < comfortable) notes.push(humidityPct >= 65 ? "muggyAfternoon" : "hotAfternoon");
  if (notes.length < 2 && swingC >= wideSwingC) notes.push("wideSwing");
  // Every month says something. "Steady" makes a strong claim (one layer, all
  // day) so it is reserved for days that are genuinely flat and comfortable at
  // both ends; anything else without a note gets the neutral reading.
  if (!notes.length) notes.push(coldComfort >= easy && warmComfort >= easy && swingC < 8 ? "steady" : "moderate");
  return { coldC, meanC: Math.round(metrics.temperatureHikingMeanC), warmC, swingC, humidityPct, notes };
}

/**
 * Months share one scale so the reader can compare them by eye down the year.
 * The domain is the destination's own range, padded to whole degrees.
 */
export function dayShapeDomain(months: { metrics: ClimateMetrics }[]): { minC: number; maxC: number } {
  const lows = months.map((month) => month.metrics.temperatureHikingP10C);
  const highs = months.map((month) => month.metrics.temperatureHikingP90C);
  const minC = Math.floor(Math.min(...lows) - 1);
  const maxC = Math.ceil(Math.max(...highs) + 1);
  return maxC - minC < 6 ? { minC: minC - 3, maxC: maxC + 3 } : { minC, maxC };
}
