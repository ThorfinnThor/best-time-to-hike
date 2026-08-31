import { Container } from "@cloudflare/containers";
import {
  WorkflowEntrypoint,
  type WorkflowEvent,
  type WorkflowStep,
} from "cloudflare:workers";

type IngestRequest = {
  destinations: string[];
  publish: boolean;
  refresh: boolean;
  diagnostic?: "cds";
};

type ArtifactResult = {
  artifactKey: string;
  artifactSha256: string;
  byteLength: number;
  published: boolean;
};

type CdsDiagnosticResult = {
  credentialPresent: boolean;
  results: Record<string, {
    ok: boolean;
    dataset: string;
    downloadBytes?: number;
    error?: string;
  }>;
};

const MAX_REQUEST_BYTES = 8 * 1024;
const MAX_ARTIFACT_BYTES = 64 * 1024 * 1024;
const DESTINATION_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class DataPipelineContainer extends Container<Env> {
  defaultPort = 8080;
  requiredPorts = [8080];
  sleepAfter = "30m";
  enableInternet = true;
  pingEndpoint = "/health";

  override onStart() {
    console.log(JSON.stringify({ event: "data_container_started" }));
  }

  override onStop() {
    console.log(JSON.stringify({ event: "data_container_stopped" }));
  }

  override onError(error: unknown) {
    console.error(JSON.stringify({
      event: "data_container_error",
      message: error instanceof Error ? error.message : String(error),
    }));
  }
}

function json(value: unknown, status = 200) {
  return Response.json(value, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function encode(value: string) {
  return new TextEncoder().encode(value);
}

async function authorized(request: Request, expectedToken: string) {
  const authorization = request.headers.get("authorization") ?? "";
  const suppliedToken = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const [supplied, expected] = await Promise.all([
    crypto.subtle.digest("SHA-256", encode(suppliedToken)),
    crypto.subtle.digest("SHA-256", encode(expectedToken)),
  ]);
  const suppliedBytes = new Uint8Array(supplied);
  const expectedBytes = new Uint8Array(expected);
  let difference = 0;
  for (let index = 0; index < expectedBytes.length; index += 1) {
    difference |= suppliedBytes[index] ^ expectedBytes[index];
  }
  return difference === 0;
}

async function readRequest(request: Request): Promise<IngestRequest> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_REQUEST_BYTES) throw new Error("request body is too large");
  const reader = request.body?.getReader();
  const chunks: Uint8Array[] = [];
  let byteLength = 0;
  if (reader) {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      byteLength += result.value.byteLength;
      if (byteLength > MAX_REQUEST_BYTES) {
        await reader.cancel();
        throw new Error("request body is too large");
      }
      chunks.push(result.value);
    }
  }
  const bytes = new Uint8Array(byteLength);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  const raw = new TextDecoder().decode(bytes);
  const input = raw ? JSON.parse(raw) as Record<string, unknown> : {};
  const destinations = input.destinations === undefined ? [] : input.destinations;
  if (!Array.isArray(destinations)
    || destinations.length > 100
    || !destinations.every((value) => typeof value === "string" && DESTINATION_SLUG.test(value))) {
    throw new Error("destinations must be an array of valid destination slugs");
  }
  return {
    destinations: [...new Set(destinations as string[])].sort(),
    publish: input.publish === true,
    refresh: input.refresh !== false,
  };
}

async function limitedError(response: Response) {
  const reader = response.body?.getReader();
  if (!reader) return `container returned HTTP ${response.status}`;
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (length < 16_384) {
    const result = await reader.read();
    if (result.done) break;
    const remaining = 16_384 - length;
    const value = result.value.subarray(0, remaining);
    chunks.push(value);
    length += value.byteLength;
    if (value.byteLength < result.value.byteLength) break;
  }
  await reader.cancel();
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(bytes) || `container returned HTTP ${response.status}`;
}

function bytesToHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

async function writeRunState(bucket: R2Bucket, instanceId: string, value: unknown) {
  await bucket.put(`runs/${instanceId}/status.json`, JSON.stringify(value, null, 2), {
    httpMetadata: { contentType: "application/json", cacheControl: "no-store" },
  });
}

export class RealDataIngestWorkflow extends WorkflowEntrypoint<Env, IngestRequest> {
  override async run(event: WorkflowEvent<IngestRequest>, step: WorkflowStep) {
    if (event.payload.diagnostic === "cds") {
      return step.do<CdsDiagnosticResult>("compare CDS dataset authorization", { timeout: "10 minutes" }, async () => {
        const container = this.env.DATA_PIPELINE.getByName("real-data-ingest");
        await container.destroy();
        await container.startAndWaitForPorts({
          startOptions: {
            enableInternet: true,
            envVars: { CDSAPI_KEY: this.env.CDSAPI_KEY.trim() },
          },
        });
        const response = await container.fetch("http://container/diagnose-cds", { method: "POST" });
        if (!response.ok) throw new Error(await limitedError(response));
        return response.json<CdsDiagnosticResult>();
      });
    }
    const artifactKey = `runs/${event.instanceId}/real-data.tar.gz`;
    await step.do("record start", async () => {
      await writeRunState(this.env.DATA_ARTIFACTS, event.instanceId, {
        status: "running",
        instanceId: event.instanceId,
        startedAt: event.timestamp.toISOString(),
        request: event.payload,
      });
      return { recorded: true };
    });

    try {
      const result = await step.do<ArtifactResult>(
        "run verified real-data pipeline",
        {
          retries: { limit: 2, delay: "5 minutes", backoff: "exponential" },
          timeout: "12 hours",
        },
        async () => {
          const container = this.env.DATA_PIPELINE.getByName("real-data-ingest");
          // Start every ingestion from the currently deployed image instead of
          // reusing a warm instance that may still run an older release.
          await container.destroy();
          await container.startAndWaitForPorts({
            startOptions: {
              enableInternet: true,
              envVars: { CDSAPI_KEY: this.env.CDSAPI_KEY.trim() },
            },
          });
          const response = await container.fetch("http://container/run", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(event.payload),
          });
          if (!response.ok) throw new Error(await limitedError(response));
          const declaredLength = Number(response.headers.get("content-length"));
          if (!Number.isSafeInteger(declaredLength)
            || declaredLength < 1
            || declaredLength > MAX_ARTIFACT_BYTES) {
            throw new Error(`container returned invalid artifact length: ${declaredLength}`);
          }
          const artifact = await response.arrayBuffer();
          if (artifact.byteLength !== declaredLength) throw new Error("artifact length mismatch");
          const actualSha256 = bytesToHex(await crypto.subtle.digest("SHA-256", artifact));
          const declaredSha256 = response.headers.get("x-bth-artifact-sha256") ?? "";
          if (!/^[a-f0-9]{64}$/.test(declaredSha256) || declaredSha256 !== actualSha256) {
            throw new Error("artifact SHA-256 mismatch");
          }
          await this.env.DATA_ARTIFACTS.put(artifactKey, artifact, {
            httpMetadata: {
              contentType: "application/gzip",
              contentDisposition: `attachment; filename="best-time-to-hike-${event.instanceId}.tar.gz"`,
            },
            customMetadata: {
              sha256: actualSha256,
              published: String(event.payload.publish),
            },
            sha256: actualSha256,
          });
          return {
            artifactKey,
            artifactSha256: actualSha256,
            byteLength: artifact.byteLength,
            published: event.payload.publish,
          };
        },
      );

      await step.do("record completion", async () => {
        await writeRunState(this.env.DATA_ARTIFACTS, event.instanceId, {
          status: "complete",
          instanceId: event.instanceId,
          completedAt: new Date().toISOString(),
          request: event.payload,
          result,
        });
        return { recorded: true };
      });
      return result;
    } catch (error) {
      const message = (error instanceof Error ? error.message : String(error)).slice(0, 16_384);
      await step.do("record failure", async () => {
        await writeRunState(this.env.DATA_ARTIFACTS, event.instanceId, {
          status: "errored",
          instanceId: event.instanceId,
          failedAt: new Date().toISOString(),
          request: event.payload,
          error: message,
        });
        return { recorded: true };
      });
      throw error;
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health" && request.method === "GET") {
      return json({ ok: true, service: "best-time-to-hike-data" });
    }
    if (!(await authorized(request, env.INGEST_ADMIN_TOKEN))) return json({ error: "unauthorized" }, 401);

    if (url.pathname === "/runs" && request.method === "POST") {
      try {
        const params = await readRequest(request);
        const id = crypto.randomUUID();
        const instance = await env.INGEST_WORKFLOW.create({
          id,
          params,
          retention: { successRetention: "30 days", errorRetention: "30 days" },
        });
        return json({ id: instance.id, status: "queued" }, 202);
      } catch (error) {
        return json({ error: error instanceof Error ? error.message : String(error) }, 400);
      }
    }

    const match = url.pathname.match(/^\/runs\/([a-zA-Z0-9_-]+)(\/artifact)?$/);
    if (match && request.method === "GET") {
      const [, id, artifactRoute] = match;
      if (artifactRoute) {
        const object = await env.DATA_ARTIFACTS.get(`runs/${id}/real-data.tar.gz`);
        if (!object?.body) return json({ error: "artifact not found" }, 404);
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set("etag", object.httpEtag);
        headers.set("x-content-type-options", "nosniff");
        return new Response(object.body, { headers });
      }
      const instance = await env.INGEST_WORKFLOW.get(id);
      return json(await instance.status());
    }

    return json({ error: "not found" }, 404);
  },
} satisfies ExportedHandler<Env>;
