/** Query values are language-neutral; the destination pathname is already localized. */
export function languageQueryHref(path: string, query: string): string {
  const serialized = new URLSearchParams(query).toString();
  return serialized ? `${path}?${serialized}` : path;
}
