"use client";

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { languageQueryHref } from "@/lib/i18n/language-query";

type Props = { href: string; className?: string; children: ReactNode };

function QueryLink(props: Props) {
  const search = useSearchParams().toString();
  return <Link {...props} href={languageQueryHref(props.href, search)}/>;
}

/** Keep client-side tool state without making the static header depend on a request. */
export function LanguageLink(props: Props) {
  return <Suspense fallback={<Link {...props}/>}><QueryLink {...props}/></Suspense>;
}
