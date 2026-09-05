import type { MetadataRoute } from "next";
import { routeCatalog } from "@/lib/seo/route-catalog";
import { routes } from "@/lib/i18n/config";
import { absoluteUrl } from "@/lib/site";
export const dynamic = "force-static";
export default function sitemap():MetadataRoute.Sitemap {
  if(process.env.NEXT_PUBLIC_DATA_STATUS !== "production") return [];
  return routeCatalog()
    .filter((route)=>route.segments[0] !== routes.finder[route.locale])
    .map((route)=>({
      url: absoluteUrl(`/${route.locale}${route.segments.length ? `/${route.segments.join("/")}` : ""}`),
      lastModified: new Date("2026-08-31"),
      changeFrequency: "monthly" as const,
      priority: route.segments.length === 0 ? .9 : .7,
    }));
}
