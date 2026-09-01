#!/usr/bin/env python3
"""Resolve selected points against the official ERA5-Land invariant orography.

ECMWF publishes the exact 0.1 degree geopotential field used by ERA5-Land as
an invariant NetCDF attachment. This script downloads that pinned artifact,
verifies its SHA-256, selects the nearest model-grid coordinate for every
planned climate point, and converts geopotential to elevation using standard
gravity (9.80665 m/s2).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import math
import os
import urllib.request
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import netCDF4
import numpy as np


DEFAULT_CONFIG = Path("data-config/methodology/era5-land-orography-v1.json")
DEFAULT_CACHE = Path("generated/intermediate/era5-invariants/era5-land-geopotential.nc")
GRID_TOLERANCE_DEGREES = 0.0500001


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--plan", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument("--cache", type=Path, default=DEFAULT_CACHE)
    parser.add_argument("--refresh", action="store_true")
    return parser.parse_args()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def download_verified(url: str, target: Path, expected_bytes: int, expected_sha256: str, refresh: bool) -> None:
    if (
        target.exists()
        and not refresh
        and target.stat().st_size == expected_bytes
        and sha256_file(target) == expected_sha256
    ):
        return
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_suffix(target.suffix + ".tmp")
    try:
        request = urllib.request.Request(url, headers={"User-Agent": "BestTimeToHike/1.0"})
        byte_length = 0
        with urllib.request.urlopen(request, timeout=120) as response, temporary.open("wb") as output:
            while block := response.read(1024 * 1024):
                byte_length += len(block)
                if byte_length > expected_bytes:
                    raise RuntimeError("ERA5_OROGRAPHY001 invariant download exceeds pinned byte length")
                output.write(block)
        if byte_length != expected_bytes:
            raise RuntimeError(
                "ERA5_OROGRAPHY001 invariant download byte-length mismatch: "
                f"expected {expected_bytes}, received {byte_length}"
            )
        actual_sha256 = sha256_file(temporary)
        if actual_sha256 != expected_sha256:
            raise RuntimeError(
                "ERA5_OROGRAPHY001 invariant download SHA-256 mismatch: "
                f"expected {expected_sha256}, received {actual_sha256}"
            )
        os.replace(temporary, target)
    finally:
        temporary.unlink(missing_ok=True)


def normalize_unit(value: str) -> str:
    return " ".join(value.strip().lower().replace("−", "-").split())


def normalize_longitude(value: float) -> float:
    normalized = value % 360
    return 0.0 if math.isclose(normalized, 360.0) else normalized


def display_longitude(value: float) -> float:
    return value - 360 if value > 180 else value


def nearest_index(values: np.ndarray, requested: float, circular: bool = False) -> int:
    numeric = np.asarray(values, dtype=np.float64).reshape(-1)
    if circular:
        requested = normalize_longitude(requested)
        differences = np.abs(((numeric - requested + 180) % 360) - 180)
    else:
        differences = np.abs(numeric - requested)
    return int(np.argmin(differences))


def extract_points(source: Path, entries: list[dict[str, Any]], gravity: float) -> list[dict[str, Any]]:
    with netCDF4.Dataset(source) as dataset:
        for coordinate in ("latitude", "longitude"):
            if coordinate not in dataset.variables:
                raise RuntimeError(f"ERA5_OROGRAPHY002 invariant file lacks {coordinate}")
        if "z" not in dataset.variables:
            raise RuntimeError("ERA5_OROGRAPHY002 invariant file lacks geopotential variable z")
        latitude = np.asarray(dataset.variables["latitude"][:], dtype=np.float64).reshape(-1)
        longitude = np.asarray(dataset.variables["longitude"][:], dtype=np.float64).reshape(-1)
        geopotential = dataset.variables["z"]
        unit = normalize_unit(str(getattr(geopotential, "units", "")))
        if unit not in {"m**2 s**-2", "m2 s-2", "m^2 s^-2"}:
            raise RuntimeError(f"ERA5_OROGRAPHY003 geopotential has unexpected unit {unit!r}")
        if geopotential.dimensions not in {
            ("time", "latitude", "longitude"),
            ("latitude", "longitude"),
        }:
            raise RuntimeError(
                "ERA5_OROGRAPHY002 unexpected geopotential dimensions: "
                + ",".join(geopotential.dimensions)
            )

        result: list[dict[str, Any]] = []
        for entry in entries:
            key = entry.get("key")
            requested_latitude = float(entry.get("lat"))
            requested_longitude = float(entry.get("lon"))
            if not isinstance(key, str) or not key:
                raise RuntimeError("ERA5_OROGRAPHY002 request-plan entry lacks a key")
            if not (-90 <= requested_latitude <= 90 and -180 <= requested_longitude <= 180):
                raise RuntimeError(f"ERA5_OROGRAPHY002 invalid requested location for {key}")
            latitude_index = nearest_index(latitude, requested_latitude)
            longitude_index = nearest_index(longitude, requested_longitude, circular=True)
            resolved_latitude = float(latitude[latitude_index])
            resolved_longitude_raw = float(longitude[longitude_index])
            latitude_offset = abs(resolved_latitude - requested_latitude)
            longitude_offset = abs(
                ((resolved_longitude_raw - normalize_longitude(requested_longitude) + 180) % 360) - 180
            )
            if latitude_offset > GRID_TOLERANCE_DEGREES or longitude_offset > GRID_TOLERANCE_DEGREES:
                raise RuntimeError(f"ERA5_OROGRAPHY002 no nearby 0.1 degree grid point for {key}")
            indexes = (0, latitude_index, longitude_index) if len(geopotential.dimensions) == 3 else (latitude_index, longitude_index)
            value = float(np.ma.filled(geopotential[indexes], np.nan))
            if not math.isfinite(value):
                raise RuntimeError(f"ERA5_OROGRAPHY003 non-finite geopotential for {key}")
            result.append(
                {
                    "key": key,
                    "requestedLocation": {"latitude": requested_latitude, "longitude": requested_longitude},
                    "resolvedLocation": {
                        "latitude": round(resolved_latitude, 10),
                        "longitude": round(display_longitude(resolved_longitude_raw), 10),
                    },
                    "geopotentialM2S2": round(value, 6),
                    "era5LandGridElevationM": round(value / gravity, 3),
                }
            )
    return result


def main() -> None:
    args = parse_args()
    config = json.loads(args.config.read_text(encoding="utf-8"))
    plan = json.loads(args.plan.read_text(encoding="utf-8"))
    entries = plan.get("entries")
    if not isinstance(entries, list) or not entries:
        raise RuntimeError("ERA5_OROGRAPHY002 request plan has no entries")
    expected_sha256 = str(config["downloadSha256"])
    expected_bytes = int(config["downloadBytes"])
    download_verified(str(config["downloadUrl"]), args.cache, expected_bytes, expected_sha256, args.refresh)
    gravity = float(config["conversion"]["standardGravityMS2"])
    if gravity != 9.80665:
        raise RuntimeError("ERA5_OROGRAPHY003 standard-gravity convention changed")
    points = extract_points(args.cache, entries, gravity)
    output = {
        "schemaVersion": 1,
        "sourceProduct": config["sourceProduct"],
        "sourceDocumentUrl": config["sourceDocumentUrl"],
        "downloadUrl": config["downloadUrl"],
        "downloadBytes": expected_bytes,
        "downloadSha256": expected_sha256,
        "retrievedAt": datetime.now(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
        "parameter": config["parameter"],
        "grid": config["grid"],
        "conversion": config["conversion"],
        "pointCount": len(points),
        "points": points,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    temporary = args.output.with_suffix(args.output.suffix + ".tmp")
    temporary.write_text(json.dumps(output, indent=2) + "\n", encoding="utf-8")
    os.replace(temporary, args.output)


if __name__ == "__main__":
    main()
