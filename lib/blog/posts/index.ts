import type { BlogPost } from "@/lib/blog/content";
import { daylightAndHikingSeason } from "./daylight-and-hiking-season";
import { dryDoesNotMeanHikeable } from "./dry-does-not-mean-hikeable";
import { mildHikingAroundTheYear } from "./mild-hiking-around-the-year";
import { rainfallTotalVersusWetDays } from "./rainfall-total-versus-wet-days";
import { shoulderSeasonHikingWorldwide } from "./shoulder-season-hiking-worldwide";
import { wideAndNarrowHikingSeasons } from "./wide-and-narrow-hiking-seasons";

export const BLOG_POSTS: readonly BlogPost[] = [
  dryDoesNotMeanHikeable,
  wideAndNarrowHikingSeasons,
  shoulderSeasonHikingWorldwide,
  daylightAndHikingSeason,
  rainfallTotalVersusWetDays,
  mildHikingAroundTheYear,
];
