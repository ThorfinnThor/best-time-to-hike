import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {title:{default:"BestTimeToHike",template:"%s · BestTimeToHike"},description:"A transparent hiking season decision engine using historical climate and elevation data."};
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body>{children}</body></html>; }
