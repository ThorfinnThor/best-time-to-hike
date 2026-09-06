import type { Metadata } from "next";
import Link from "next/link";
import { DICT } from "@/lib/i18n/dict";
import { links } from "@/lib/i18n/links";

export const metadata: Metadata = {title: "Trail not found · Weg nicht gefunden"};

/**
 * One page serves every unknown path, in both languages.
 *
 * A static export has a single 404 document, so it cannot know which locale the
 * reader came from. Sending everyone to the English home meant a German reader
 * who mistyped a /de/ URL lost their language as well as their page; showing
 * both is the only honest option at this layer.
 */
export default function NotFound() {
  return <main className="language-page not-found">
    <span className="brand-mark">▲</span>
    {(["en", "de"] as const).map((locale) => <div key={locale} lang={locale}>
      <h1>{DICT[locale].notFound.title}</h1>
      <p>{DICT[locale].notFound.body}</p>
      <Link className="button" href={links.home(locale)}>{DICT[locale].notFound.home}</Link>
    </div>)}
  </main>;
}
