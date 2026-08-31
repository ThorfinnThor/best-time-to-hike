import LocalizedPage, { generateMetadata as localizedMetadata } from "./[...segments]/page";

export const dynamicParams = false;
export const dynamic = "force-static";
export const generateMetadata = localizedMetadata;
export function generateStaticParams() { return [{locale:"en"},{locale:"de"}]; }

export default function LocalePage({params}:{params:Promise<{locale:string}>}) {
  return LocalizedPage({params});
}
