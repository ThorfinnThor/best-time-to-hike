import type { BlogPost } from "@/lib/blog/content";
import { daylightAndHikingSeason } from "./daylight-and-hiking-season";
import { dryDoesNotMeanHikeable } from "./dry-does-not-mean-hikeable";
import { mildHikingAroundTheYear } from "./mild-hiking-around-the-year";
import { rainfallTotalVersusWetDays } from "./rainfall-total-versus-wet-days";
import { shoulderSeasonHikingWorldwide } from "./shoulder-season-hiking-worldwide";
import { wideAndNarrowHikingSeasons } from "./wide-and-narrow-hiking-seasons";
import { temperatureRangeHiddenInAverage } from "./temperature-range-hidden-in-average";
import { mildAirFrequentModelledSnowDays } from "./mild-air-frequent-modelled-snow-days";
import { warmestDriestOrStrongestMonth } from "./warmest-driest-or-strongest-month";
import { sameTemperatureDifferentAir } from "./same-temperature-different-air";

export const BLOG_POSTS: readonly BlogPost[] = [
  dryDoesNotMeanHikeable,
  wideAndNarrowHikingSeasons,
  shoulderSeasonHikingWorldwide,
  daylightAndHikingSeason,
  rainfallTotalVersusWetDays,
  mildHikingAroundTheYear,
  temperatureRangeHiddenInAverage,
  mildAirFrequentModelledSnowDays,
  warmestDriestOrStrongestMonth,
  sameTemperatureDifferentAir,
];
