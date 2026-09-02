const rad = Math.PI / 180;
const deg = 180 / Math.PI;
const normalize = (value: number, max: number) => ((value % max) + max) % max;

function dayOfYear(date: Date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - start) / 86_400_000);
}

function solarEvent(date: Date, lat: number, lon: number, sunrise: boolean) {
  const n = dayOfYear(date);
  const lngHour = lon / 15;
  const t = n + ((sunrise ? 6 : 18) - lngHour) / 24;
  const meanAnomaly = 0.9856 * t - 3.289;
  let trueLongitude = meanAnomaly + 1.916 * Math.sin(meanAnomaly * rad) + 0.02 * Math.sin(2 * meanAnomaly * rad) + 282.634;
  trueLongitude = normalize(trueLongitude, 360);
  let rightAscension = deg * Math.atan(0.91764 * Math.tan(trueLongitude * rad));
  rightAscension = normalize(rightAscension, 360);
  rightAscension += Math.floor(trueLongitude / 90) * 90 - Math.floor(rightAscension / 90) * 90;
  rightAscension /= 15;
  const sinDeclination = 0.39782 * Math.sin(trueLongitude * rad);
  const cosDeclination = Math.cos(Math.asin(sinDeclination));
  const cosHourAngle = (Math.cos(90.833 * rad) - sinDeclination * Math.sin(lat * rad)) / (cosDeclination * Math.cos(lat * rad));
  if (cosHourAngle > 1) return { utcHours: null, polarState: "polar_night" as const };
  if (cosHourAngle < -1) return { utcHours: null, polarState: "polar_day" as const };
  let hourAngle = sunrise ? 360 - deg * Math.acos(cosHourAngle) : deg * Math.acos(cosHourAngle);
  hourAngle /= 15;
  const localMeanTime = hourAngle + rightAscension - 0.06571 * t - 6.622;
  return { utcHours: normalize(localMeanTime - lngHour, 24), polarState: "normal" as const };
}

export function daylight(date: Date, lat: number, lon: number) {
  const sunrise = solarEvent(date, lat, lon, true);
  const sunset = solarEvent(date, lat, lon, false);
  if (sunrise.utcHours === null || sunset.utcHours === null) {
    const polarState = sunrise.polarState === "polar_day" || sunset.polarState === "polar_day" ? "polar_day" as const : "polar_night" as const;
    return { sunriseUtcHours: null, sunsetUtcHours: null, daylightHours: polarState === "polar_day" ? 24 : 0, polarState };
  }
  return { sunriseUtcHours: sunrise.utcHours, sunsetUtcHours: sunset.utcHours, daylightHours: normalize(sunset.utcHours - sunrise.utcHours, 24), polarState: "normal" as const };
}

export function inHikingWindow(
  localMinutes: number,
  sunriseLocalMinutes: number | null,
  sunsetLocalMinutes: number | null,
  polarState: "normal" | "polar_day" | "polar_night" = "normal"
) {
  // Polar days and nights have no discrete sunrise/sunset event. Keep weather
  // sampling deterministic in the nominal 08:00-18:00 local clock window;
  // daylightHours still independently records the astronomical 24 or 0 hours.
  if (polarState !== "normal") return localMinutes >= 8 * 60 && localMinutes < 18 * 60;
  if (sunriseLocalMinutes === null || sunsetLocalMinutes === null) return false;
  const start = Math.max(8 * 60, sunriseLocalMinutes);
  const end = Math.min(18 * 60, sunsetLocalMinutes);
  return end > start && localMinutes >= start && localMinutes < end;
}

export interface LocalDateTime {
  localDate: string;
  localMinutes: number;
}

const localFormatters = new Map<string, Intl.DateTimeFormat>();
const localDayHourCounts = new Map<string, number>();
const localDaylight = new Map<string, ReturnType<typeof daylight> & {sunriseLocalMinutes:number|null;sunsetLocalMinutes:number|null}>();

function localFormatter(timezone: string) {
  let formatter = localFormatters.get(timezone);
  if (!formatter) {
    try {
      formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
      });
    } catch {
      throw new Error(`TIME001 invalid IANA timezone: ${timezone}`);
    }
    localFormatters.set(timezone, formatter);
  }
  return formatter;
}

export function toLocalDateTime(instant: Date, timezone: string): LocalDateTime {
  if (!Number.isFinite(instant.getTime())) throw new Error("TIME001 invalid UTC instant");
  const values = Object.fromEntries(
    localFormatter(timezone)
      .formatToParts(instant)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  );
  const localDate = `${values.year.toString().padStart(4, "0")}-${values.month.toString().padStart(2, "0")}-${values.day.toString().padStart(2, "0")}`;
  return { localDate, localMinutes: values.hour * 60 + values.minute };
}

function eventLocalMinutes(localDate: string, utcHours: number, timezone: string) {
  const [year, month, day] = localDate.split("-").map(Number);
  const midnight = Date.UTC(year, month - 1, day);
  for (const dayOffset of [-1, 0, 1]) {
    const instant = new Date(midnight + dayOffset * 86_400_000 + utcHours * 3_600_000);
    const local = toLocalDateTime(instant, timezone);
    if (local.localDate === localDate) return local.localMinutes;
  }
  throw new Error(`TIME001 could not place solar event on ${localDate} in ${timezone}`);
}

/** Astronomical day length and local-clock events for a destination calendar date. */
export function daylightForLocalDate(localDate: string, lat: number, lon: number, timezone: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) throw new Error(`TIME001 invalid local date: ${localDate}`);
  const cacheKey=`${localDate}|${lat}|${lon}|${timezone}`;
  const cached=localDaylight.get(cacheKey);
  if(cached)return cached;
  // Noon UTC avoids changing the intended calendar day while the NOAA calculation
  // uses the date only as a day-of-year input.
  const result = daylight(new Date(`${localDate}T12:00:00.000Z`), lat, lon);
  const output = {
    ...result,
    sunriseLocalMinutes: result.sunriseUtcHours === null ? null : eventLocalMinutes(localDate, result.sunriseUtcHours, timezone),
    sunsetLocalMinutes: result.sunsetUtcHours === null ? null : eventLocalMinutes(localDate, result.sunsetUtcHours, timezone)
  };
  localDaylight.set(cacheKey,output);
  return output;
}

/** Number of real UTC hours that map to a local date (23/24/25 across DST). */
export function expectedHourlyInstants(localDate: string, timezone: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(localDate)) throw new Error(`TIME001 invalid local date: ${localDate}`);
  const cacheKey=`${localDate}|${timezone}`;
  const cached=localDayHourCounts.get(cacheKey);
  if(cached!==undefined)return cached;
  const [year, month, day] = localDate.split("-").map(Number);
  if (![year, month, day].every(Number.isFinite)) throw new Error(`TIME001 invalid local date: ${localDate}`);
  const approximateMidnightUtc = Date.UTC(year, month - 1, day);
  let count = 0;
  for (let offset = -18; offset <= 42; offset += 1) {
    const instant = new Date(approximateMidnightUtc + offset * 3_600_000);
    if (toLocalDateTime(instant, timezone).localDate === localDate) count += 1;
  }
  if (count < 23 || count > 25) throw new Error(`TIME001 invalid timezone/day mapping for ${localDate} in ${timezone}`);
  localDayHourCounts.set(cacheKey,count);
  return count;
}
