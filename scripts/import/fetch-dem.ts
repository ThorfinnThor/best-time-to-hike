import { requireApprovedSource } from "./source-preflight";
requireApprovedSource("copernicusDem");
throw new Error("BLOCKED_OPERATOR_SECRET: production CDSE adapter requires approved credentials and operator-reviewed geometry.");
