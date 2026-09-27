import type { Metadata } from "next";
import "./globals.css";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase:new URL(SITE.url),
  title:{default:"BestTimeToHike",template:"%s · BestTimeToHike"},
  description:"A transparent hiking season decision engine using historical climate and elevation data.",
  applicationName:SITE.name,
  category:"travel",
  referrer:"origin-when-cross-origin",
};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><head><script async defer src="https://widget.getyourguide.com/dist/pa.umd.production.min.js" data-gyg-partner-id="BKWM9K1" /></head><body>{children}</body></html>; }
