import periodConfig from "../../data-config/methodology/historical-period-1991-2025-v1.json";

export const historicalPeriod = periodConfig.period;
export const historicalPeriodRange = `${historicalPeriod.startYear}-${historicalPeriod.endYear}`;
export const historicalPeriodPublicLabel = {
  en: historicalPeriod.publicLabelEn,
  de: historicalPeriod.publicLabelDe,
};
export const historicalPeriodDescription = {
  en: `the last ${historicalPeriod.completeCalendarYears} complete years (${historicalPeriodRange})`,
  de: `die letzten ${historicalPeriod.completeCalendarYears} vollständigen Jahre (${historicalPeriodRange})`,
};
