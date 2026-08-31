import { requireApprovedSource } from "./source-preflight";
requireApprovedSource("era5Land");
throw new Error("BLOCKED_OPERATOR_SECRET: production ERA5 ingest requires approved CDS credentials and source metadata review.");
