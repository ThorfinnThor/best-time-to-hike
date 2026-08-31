import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function robots():MetadataRoute.Robots { const fixture=process.env.NEXT_PUBLIC_DATA_STATUS!=="production"; return {rules:fixture?{userAgent:"*",disallow:"/"}:{userAgent:"*",allow:"/",disallow:["/go/","/en/finder/","/de/finder/"]},sitemap:fixture?undefined:`${process.env.NEXT_PUBLIC_APP_URL ?? "https://besttimetohike.com"}/sitemap.xml`}; }
