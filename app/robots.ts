import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
export const dynamic = "force-static";
export default function robots():MetadataRoute.Robots {
  const published = process.env.NEXT_PUBLIC_DATA_STATUS === "production";
  return {
    rules: published ? {userAgent:"*",allow:"/",disallow:["/go/","/en/finder/","/de/finder/"]} : {userAgent:"*",disallow:"/"},
    sitemap: published ? absoluteUrl("/sitemap.xml") : undefined,
  };
}
