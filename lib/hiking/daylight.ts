const rad = Math.PI / 180;
const deg = 180 / Math.PI;
const normalize = (value: number, max: number) => ((value % max) + max) % max;

function dayOfYear(date: Date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  return Math.floor((date.getTime() - start) / 86_400_000);
}

function solarEventUtcHours(date: Date, lat: number, lon: number, sunrise: boolean): number | null {
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
  if (cosHourAngle > 1 || cosHourAngle < -1) return null;
  let hourAngle = sunrise ? 360 - deg * Math.acos(cosHourAngle) : deg * Math.acos(cosHourAngle);
  hourAngle /= 15;
  const localMeanTime = hourAngle + rightAscension - 0.06571 * t - 6.622;
  return normalize(localMeanTime - lngHour, 24);
}

export function daylight(date: Date, lat: number, lon: number) {
  const sunriseUtcHours = solarEventUtcHours(date, lat, lon, true);
  const sunsetUtcHours = solarEventUtcHours(date, lat, lon, false);
  if (sunriseUtcHours === null || sunsetUtcHours === null) {
    const summerNorth = lat >= 0 ? date.getUTCMonth() >= 3 && date.getUTCMonth() <= 8 : date.getUTCMonth() <= 2 || date.getUTCMonth() >= 9;
    return { sunriseUtcHours: null, sunsetUtcHours: null, daylightHours: summerNorth ? 24 : 0, polarState: summerNorth ? "polar_day" as const : "polar_night" as const };
  }
  return { sunriseUtcHours, sunsetUtcHours, daylightHours: normalize(sunsetUtcHours - sunriseUtcHours, 24), polarState: "normal" as const };
}

export function inHikingWindow(localMinutes: number, sunriseLocalMinutes: number | null, sunsetLocalMinutes: number | null) {
  if (sunriseLocalMinutes === null || sunsetLocalMinutes === null) return false;
  const start = Math.max(8 * 60, sunriseLocalMinutes);
  const end = Math.min(18 * 60, sunsetLocalMinutes);
  return end > start && localMinutes >= start && localMinutes < end;
}
