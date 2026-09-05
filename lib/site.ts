// Single source of truth for the site identity and absolute URLs.
// robots.ts, sitemap.ts and page metadata previously each carried their own
// base URL and had already drifted apart (two of them said besttimetohike.com,
// page metadata said best-time-to-hike.pages.dev). Read the base from here.
export const SITE = {
  name: "BestTimeToHike",
  defaultLocale: "en",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://besttimetohike.com",
} as const;

export function absoluteUrl(path: string): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
