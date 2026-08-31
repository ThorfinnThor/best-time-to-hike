import type { MetadataRoute } from "next";
import { routeCatalog } from "@/lib/seo/route-catalog";
export const dynamic = "force-static";
export default function sitemap():MetadataRoute.Sitemap { if(process.env.NEXT_PUBLIC_DATA_STATUS!=="production") return []; const base=process.env.NEXT_PUBLIC_APP_URL ?? "https://besttimetohike.com"; return routeCatalog().filter((route)=>route.segments[0]!=="finder").map((route)=>({url:`${base}/${route.locale}/${route.segments.join("/")}`,lastModified:new Date("2026-08-31"),changeFrequency:"monthly",priority:route.segments.length===0?.9:.7})); }
