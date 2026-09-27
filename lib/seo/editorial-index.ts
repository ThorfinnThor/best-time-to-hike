import seoConfig from "../../data-config/seo/project-seo-config.json";

const destinationArticles = seoConfig.publicIndexing.destinationArticles;
const DESTINATION_SLUGS = new Set<string>(destinationArticles.slugs);

if (DESTINATION_SLUGS.size !== destinationArticles.targetPerLocale) {
  throw new Error(`Editorial destination index has ${DESTINATION_SLUGS.size} unique slugs; expected ${destinationArticles.targetPerLocale}.`);
}

export const editorialDestinationSlugs = (): readonly string[] => destinationArticles.slugs;
export const editorialDestinationApproved = (slug: string): boolean => DESTINATION_SLUGS.has(slug);
export const publicIndexTargetUrlCount = (): number => seoConfig.publicIndexing.targetUrlCount;
export const destinationArticleQualityPolicy = () => destinationArticles;
