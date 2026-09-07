import type { BandClimateMonth } from "../../lib/data/types";
import { readJson, writeJson } from "../lib/io";

interface Replacement {
  approval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  approvalEvidence?: string;
  stagingDisposition: "candidate" | "rejected";
}

interface ClimateSnapshot {
  sourceDataset: string;
  sourceDoi: string;
  climateNormal: {startYear: number; endYear: number};
  sourceDownloads: Array<{observationCount: number}>;
  bands: Record<string, {months: BandClimateMonth[]}>;
}

const onlyArgument = process.argv.slice(2).find((argument) => argument.startsWith("--only="));
if (!onlyArgument) throw new Error("CELL_FINALIZE001 --only is required; publication may never infer its scope");
const selected = [...new Set(onlyArgument.slice("--only=".length).split(",").map((id) => id.trim()).filter(Boolean))];
if (!selected.length) throw new Error("CELL_FINALIZE001 --only is empty");

const config = readJson<{replacements: Record<string, Replacement>}>("data-config/sources/representative-cell-replacements-v1.json");
const holdsPath = "data-config/sources/known-snowbound-cell-holds.json";
const holds = readJson<{schemaVersion: number; destinationIds: string[]; method: string}>(holdsPath);
const results = selected.map((id) => {
  const replacement = config.replacements[id];
  if (!replacement || replacement.stagingDisposition !== "candidate") {
    throw new Error(`CELL_FINALIZE001 ${id} is not an active replacement candidate`);
  }
  if (!replacement.approval || !replacement.approvedBy || !replacement.approvedAt || !replacement.approvalEvidence) {
    throw new Error(`CELL_FINALIZE001 ${id} has no explicit scientific approval`);
  }
  const climate = readJson<ClimateSnapshot>(`data-snapshots/climate/${id}.json`);
  const months = climate.bands.representative?.months;
  if (climate.sourceDataset !== "reanalysis-era5-land-timeseries"
    || climate.sourceDoi !== "10.24381/ee82e357"
    || climate.climateNormal.startYear !== 1991
    || climate.climateNormal.endYear !== 2020
    || climate.sourceDownloads.length !== 1
    || climate.sourceDownloads[0].observationCount !== 262_992
    || months?.length !== 12) {
    throw new Error(`CELL_FINALIZE001 ${id} lacks complete canonical climate evidence`);
  }
  if (months.every((month) => month.snowDayProbability >= 0.999)) {
    throw new Error(`CELL_FINALIZE001 ${id} still has persistent snow in all twelve months`);
  }
  return {destinationId: id, approvedBy: replacement.approvedBy, approvedAt: replacement.approvedAt};
});

holds.destinationIds = holds.destinationIds.filter((id) => !selected.includes(id));
writeJson(holdsPath, holds);
writeJson("generated/reports/finalized-representative-cell-replacements.json", {
  schemaVersion: 1,
  finalizedAt: new Date().toISOString(),
  replacements: results,
  remainingSnowboundHolds: holds.destinationIds,
});
console.log(`Finalized ${selected.length} approved replacement(s); remaining snowbound holds: ${holds.destinationIds.join(", ") || "none"}.`);
