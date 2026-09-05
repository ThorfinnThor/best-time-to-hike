import { getComparisonIndex, getDestinationIndex } from "@/lib/data/load";
import { locales, monthSlug, routes } from "@/lib/i18n/config";
import { areaCatalogue } from "@/lib/seo/areas";
import type { Locale } from "@/lib/data/types";

export interface StaticRoute { locale: Locale; segments: string[] }
export function routeCatalog(): StaticRoute[] {
  const output: StaticRoute[] = [];
  for (const locale of locales) {
    output.push({locale,segments:[]},{locale,segments:["finder"]},{locale,segments:[routes.compare[locale]]});
    for (const key of ["methodology","about","privacy","imprint","credits"] as const) output.push({locale,segments:[routes[key][locale]]});
    for (const destination of getDestinationIndex()) {
      output.push({locale,segments:[routes.destination[locale],destination.slug]});
      for (let month=1;month<=12;month+=1) output.push({locale,segments:[routes.destination[locale],destination.slug,monthSlug(month,locale)]});
    }
    for (const area of areaCatalogue()) output.push({locale,segments:[routes.rankings[locale],area.id]});
    for (let month=1;month<=12;month+=1) {
      output.push({locale,segments:[routes.rankings[locale],monthSlug(month,locale)]});
      for (const key of ["warm","snowFree","lowRain"] as const) output.push({locale,segments:[routes[key][locale],monthSlug(month,locale)]});
    }
    for (const comparison of getComparisonIndex()) output.push({locale,segments:[routes.compare[locale],comparison.slug]});
  }
  return output;
}
