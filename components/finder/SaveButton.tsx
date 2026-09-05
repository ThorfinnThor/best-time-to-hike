"use client";
import type { Locale } from "@/lib/data/types";
import { t } from "@/lib/i18n/dict";

export function SaveButton({slug, name, saved, onToggle, locale}:
  {slug: string; name: string; saved: boolean; onToggle: (slug: string) => void; locale: Locale}) {
  const copy = t(locale).finder;
  return <button type="button" className={saved ? "save-button saved" : "save-button"}
    aria-pressed={saved}
    aria-label={saved ? copy.unsaveLabel(name) : copy.saveLabel(name)}
    title={saved ? copy.unsaveLabel(name) : copy.saveLabel(name)}
    onClick={(event) => {event.preventDefault(); event.stopPropagation(); onToggle(slug);}}>
    {saved ? "★" : "☆"}
  </button>;
}
