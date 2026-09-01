#!/usr/bin/env python3
"""HTTP adapter that runs the existing ETL inside a Cloudflare Container."""

from __future__ import annotations

import gzip
import hashlib
import io
import json
import os
import re
import subprocess
import tarfile
from collections import deque
from datetime import UTC, datetime
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from typing import Any


ROOT = Path(os.environ.get("BTH_APP_ROOT", "/app")).resolve()
ARTIFACT = Path("/tmp/best-time-to-hike-real-data.tar.gz")
MAX_REQUEST_BYTES = 8 * 1024
SLUG = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def run_command(command: list[str], environment: dict[str, str]) -> list[str]:
    tail: deque[str] = deque(maxlen=200)
    process = subprocess.Popen(
        command,
        cwd=ROOT,
        env=environment,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1,
    )
    assert process.stdout is not None
    for line in process.stdout:
        clean = line.rstrip()
        print(clean, flush=True)
        tail.append(clean)
    exit_code = process.wait()
    if exit_code != 0:
        raise RuntimeError(
            f"command failed ({exit_code}): {' '.join(command)}\n" + "\n".join(tail)
        )
    return list(tail)


def artifact_inputs(publish: bool) -> list[Path]:
    values = [
        ROOT / "generated/intermediate/real-dem",
        ROOT / "generated/intermediate/real-sampling",
        ROOT / "generated/intermediate/real-climate",
        ROOT / "generated/intermediate/era5-invariants/era5-land-orography.json",
        ROOT / "generated/intermediate/era5-request-plan.json",
        ROOT / "generated/intermediate/cloudflare-run-manifest.json",
    ]
    if publish:
        values.extend([ROOT / "data-snapshots", ROOT / "public/data/hiking"])
    return [path for path in values if path.exists()]


def manifest_files(paths: list[Path]) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    for path in paths:
        files = [path] if path.is_file() else sorted(item for item in path.rglob("*") if item.is_file())
        for file_path in files:
            content = file_path.read_bytes()
            result.append(
                {
                    "path": file_path.relative_to(ROOT).as_posix(),
                    "bytes": len(content),
                    "sha256": hashlib.sha256(content).hexdigest(),
                }
            )
    return result


def normalized_tar_info(path: Path) -> tarfile.TarInfo:
    relative = path.relative_to(ROOT).as_posix()
    info = tarfile.TarInfo(relative)
    info.mtime = 0
    info.uid = 0
    info.gid = 0
    info.uname = ""
    info.gname = ""
    if path.is_dir():
        info.type = tarfile.DIRTYPE
        info.mode = 0o755
    else:
        info.size = path.stat().st_size
        info.mode = 0o644
    return info


def build_artifact(paths: list[Path]) -> tuple[int, str]:
    with ARTIFACT.open("wb") as raw:
        with gzip.GzipFile(filename="", mode="wb", fileobj=raw, mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode="w") as archive:
                for root in sorted(paths):
                    items = [root]
                    if root.is_dir():
                        items.extend(sorted(root.rglob("*")))
                    for path in items:
                        info = normalized_tar_info(path)
                        if path.is_file():
                            with path.open("rb") as stream:
                                archive.addfile(info, stream)
                        else:
                            archive.addfile(info)
    content = ARTIFACT.read_bytes()
    return len(content), hashlib.sha256(content).hexdigest()


def run_pipeline(payload: dict[str, Any]) -> tuple[int, str]:
    destinations = payload.get("destinations", [])
    if not isinstance(destinations, list) or len(destinations) > 100:
        raise ValueError("destinations must be an array")
    if not all(isinstance(value, str) and SLUG.fullmatch(value) for value in destinations):
        raise ValueError("invalid destination slug")
    publish = payload.get("publish") is True
    refresh = payload.get("refresh") is not False
    token = (os.environ.get("CDSAPI_KEY") or "").strip()
    if not token:
        raise RuntimeError("BLOCKED_OPERATOR_SECRET: CDSAPI_KEY is not configured in Cloudflare")

    environment = {
        **os.environ,
        "BTH_DESTINATIONS": ",".join(sorted(set(destinations))),
        "BTH_EXECUTION_MODE": "ingest-staging",
        "CDSAPI_KEY": token,
    }
    publish_args = ["--publish"] if publish else []
    climate_args = [*publish_args, *(["--refresh"] if refresh else [])]
    def npm_script(name: str, arguments: list[str] | None = None) -> list[str]:
        values = arguments or []
        return ["npm", "run", name, *(["--", *values] if values else [])]

    commands = [
        npm_script("data:dem", publish_args),
        npm_script("data:sampling", publish_args),
        npm_script("data:era5", climate_args),
    ]
    if publish:
        commands.extend(
            [
                npm_script("data:normalize"),
                npm_script("data:score"),
                npm_script("data:export"),
                npm_script("data:validate"),
                npm_script("test"),
                npm_script("typecheck"),
                npm_script("build"),
            ]
        )

    logs: list[dict[str, Any]] = []
    for command in commands:
        logs.append({"command": command, "tail": run_command(command, environment)})

    manifest_path = ROOT / "generated/intermediate/cloudflare-run-manifest.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    preliminary_paths = artifact_inputs(publish)
    manifest = {
        "schemaVersion": 1,
        "runtime": "cloudflare-container",
        "dataset": "ERA5-Land 1991-2020 + official ERA5-Land invariant geopotential + Copernicus DEM GLO-30",
        "destinations": sorted(set(destinations)),
        "published": publish,
        "completedAt": datetime.now(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
        "commands": [entry["command"] for entry in logs],
        "files": manifest_files([path for path in preliminary_paths if path != manifest_path]),
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    return build_artifact(artifact_inputs(publish))


def diagnose_cds() -> dict[str, Any]:
    environment = {**os.environ, "CDSAPI_KEY": (os.environ.get("CDSAPI_KEY") or "").strip()}
    python = environment.get("BTH_DATA_PYTHON", "python3")
    lines = run_command([python, "scripts/import/diagnose_cds.py"], environment)
    if not lines:
        raise RuntimeError("CDS diagnostic returned no result")
    result = json.loads(lines[-1])
    if not isinstance(result, dict):
        raise RuntimeError("CDS diagnostic returned an invalid result")
    return result


class Handler(BaseHTTPRequestHandler):
    server_version = "BestTimeToHikeData/1"

    def send_json(self, status: int, value: Any) -> None:
        content = (json.dumps(value, separators=(",", ":")) + "\n").encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(content)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(content)

    def do_GET(self) -> None:
        if self.path == "/health":
            self.send_json(200, {"ok": True})
        else:
            self.send_json(404, {"error": "not found"})

    def do_POST(self) -> None:
        if self.path == "/diagnose-cds":
            try:
                self.send_json(200, diagnose_cds())
            except Exception as error:  # noqa: BLE001 - diagnostic HTTP boundary
                print(f"CDS diagnostic failed: {error}", flush=True)
                self.send_json(500, {"error": str(error)[-16_384:]})
            return
        if self.path != "/run":
            self.send_json(404, {"error": "not found"})
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            if length < 0 or length > MAX_REQUEST_BYTES:
                raise ValueError("invalid request length")
            payload = json.loads(self.rfile.read(length) or b"{}")
            if not isinstance(payload, dict):
                raise ValueError("request body must be an object")
            byte_length, sha256 = run_pipeline(payload)
            self.send_response(200)
            self.send_header("Content-Type", "application/gzip")
            self.send_header("Content-Length", str(byte_length))
            self.send_header("X-BTH-Artifact-SHA256", sha256)
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            with ARTIFACT.open("rb") as stream:
                while chunk := stream.read(1024 * 1024):
                    self.wfile.write(chunk)
        except (BrokenPipeError, ConnectionResetError):
            print("workflow connection closed while returning the artifact", flush=True)
        except (ValueError, json.JSONDecodeError) as error:
            self.send_json(400, {"error": str(error)})
        except Exception as error:  # noqa: BLE001 - this is the HTTP process boundary
            print(f"pipeline failed: {error}", flush=True)
            self.send_json(500, {"error": str(error)[-16_384:]})

    def log_message(self, message: str, *args: object) -> None:
        print(json.dumps({"event": "http", "message": message % args}), flush=True)


if __name__ == "__main__":
    os.chdir(ROOT)
    HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
