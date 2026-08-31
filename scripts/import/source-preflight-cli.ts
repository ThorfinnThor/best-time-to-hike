import { requireApprovedSource } from "./source-preflight";

for (const source of ["era5Land", "copernicusDem"] as const) requireApprovedSource(source);
console.log("Production source semantics preflight passed.");
