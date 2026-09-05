import Link from "next/link";
import { defaultLocale } from "@/lib/i18n/config";
import { links } from "@/lib/i18n/links";

export default function NotFound(){return <main className="language-page"><span className="brand-mark">▲</span><h1>Trail not found</h1><p>This path is outside our published map.</p><Link className="button" href={links.home(defaultLocale)}>Back to basecamp</Link></main>}
