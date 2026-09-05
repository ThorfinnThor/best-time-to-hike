import { permanentRedirect } from "next/navigation";
import { defaultLocale } from "@/lib/i18n/config";
import { links } from "@/lib/i18n/links";

export default function RootPage() {
  permanentRedirect(links.home(defaultLocale));
}
