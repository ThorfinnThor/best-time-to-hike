import type { BlogEvidence } from "@/lib/blog/content";

export const DATASET_VERSION = "era5-land-representative-point-1991-2025-v1";
export const CHECKED_AT = "2026-09-30";

export function evidence(key: string, description: string, sourcePaths: string[], checkedAt = CHECKED_AT): BlogEvidence {
  return { key, datasetVersion: DATASET_VERSION, description, sourcePaths, checkedAt };
}
