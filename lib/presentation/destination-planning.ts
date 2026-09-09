import aggregation from "@/data-config/methodology/climate-aggregation-v1.json";
import type { Locale } from "@/lib/data/types";

export const planningPilots: Record<string, { url: string; source: string }> = {
  madeira: { url: "https://visitmadeira.com/en/what-to-do/nature-seekers/activities/hiking/", source: "Visit Madeira" },
  mallorca: { url: "https://caminsdepedra.conselldemallorca.es/en/hiking", source: "Consell de Mallorca" },
  tenerife: { url: "https://www.tenerife.es/senderos-de-tenerife", source: "Cabildo de Tenerife" },
  dolomites: { url: "https://www.dolomiti.org/en/marmolada/experiences/t/excursions", source: "Dolomiti.org · Marmolada" },
  chamonix: { url: "https://en.chamonix.com/things-to-see-and-do/sports-and-outdoor/hiking", source: "Chamonix-Mont-Blanc" },
};
export const isPlanningPilot = (slug: string) => Object.hasOwn(planningPilots, slug);
export const planningRules = aggregation;

/** Translate a historical day fraction into an approximate calendar-month count. */
export function typicalWetDays(probability: number, month: number): number {
  let days = 0;
  const { startYear, endYear } = aggregation.normal;
  for (let year = startYear; year <= endYear; year++) days += new Date(Date.UTC(year, month, 0)).getUTCDate();
  return probability * days / (endYear - startYear + 1);
}

export function planningNumber(value: number, locale: Locale): string {
  if (!Number.isFinite(value)) return "—";
  if (value > 0 && value < 0.1) return locale === "de" ? "<0,1" : "<0.1";
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value);
}

export function daylightDuration(hours: number): string {
  if (!Number.isFinite(hours)) return "—";
  const minutes = Math.round(hours * 60);
  return `${Math.floor(minutes / 60)} h ${String(minutes % 60).padStart(2, "0")} min`;
}
