#!/usr/bin/env python3
"""Download one ERA5-Land point and convert it to canonical gzipped JSON Lines.

The CDS time-series product already de-accumulates total precipitation. This
script deliberately preserves it as an incremental hourly value.
"""

from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import math
import os
import shutil
import tempfile
import zipfile
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import cdsapi
import netCDF4
import numpy as np


DATASET = "reanalysis-era5-land-timeseries"
NETCDF_NEGATIVE_ARTIFACT_FLOOR_M = -1e-6
VARIABLES = [
    "2m_temperature",
    "2m_dewpoint_temperature",
    "10m_u_component_of_wind",
    "10m_v_component_of_wind",
    "total_precipitation",
    "snow_cover",
    "snow_depth",
]
ALIASES = {
    "temperatureK": {"t2m", "2m_temperature"},
    "dewpointK": {"d2m", "2m_dewpoint_temperature"},
    "windUMs": {"u10", "10m_u_component_of_wind"},
    "windVMs": {"v10", "10m_v_component_of_wind"},
    "precipitationM": {"tp", "total_precipitation"},
    "snowCover": {"snowc", "snow_cover"},
    # ERA5-Land's physical snow height is the ECMWF `sde` parameter (metres).
    # `sd` is a different parameter expressed as metres of water equivalent.
    "snowDepthM": {"sde", "snow_depth"},
}
EXPECTED_UNITS = {
    "temperatureK": {"k", "kelvin"},
    "dewpointK": {"k", "kelvin"},
    "windUMs": {"m s**-1", "m s-1", "m s^-1", "m/s"},
    "windVMs": {"m s**-1", "m s-1", "m s^-1", "m/s"},
    "precipitationM": {"m", "metre", "meter"},
    "snowCover": {"%", "1", "(0 - 1)", "0-1", "fraction"},
    "snowDepthM": {"m", "metre", "meter"},
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lat", type=float, required=True)
    parser.add_argument("--lon", type=float, required=True)
    parser.add_argument("--start-date", required=True)
    parser.add_argument("--end-date", required=True)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--metadata", type=Path, required=True)
    return parser.parse_args()


def normalize_unit(value: str) -> str:
    return " ".join(value.strip().lower().replace("−", "-").split())


def find_logical_name(variable_name: str) -> str | None:
    for logical_name, aliases in ALIASES.items():
        if variable_name in aliases:
            return logical_name
    return None


def time_values(dataset: netCDF4.Dataset) -> list[datetime]:
    name = "valid_time" if "valid_time" in dataset.variables else "time"
    if name not in dataset.variables:
        raise RuntimeError("ERA5_FORMAT001 no valid_time/time coordinate")
    variable = dataset.variables[name]
    converted = netCDF4.num2date(
        variable[:],
        units=variable.units,
        calendar=getattr(variable, "calendar", "standard"),
        only_use_cftime_datetimes=False,
    )
    result: list[datetime] = []
    for value in np.asarray(converted).reshape(-1):
        result.append(datetime(value.year, value.month, value.day, value.hour, value.minute, value.second, tzinfo=UTC))
    return result


def finite_or_none(value: Any) -> float | None:
    numeric = float(value)
    return numeric if math.isfinite(numeric) else None


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def extract_download(download: Path, directory: Path) -> list[Path]:
    if zipfile.is_zipfile(download):
        with zipfile.ZipFile(download) as archive:
            unsafe = [name for name in archive.namelist() if Path(name).is_absolute() or ".." in Path(name).parts]
            if unsafe:
                raise RuntimeError("ERA5_FORMAT001 unsafe path in CDS archive")
            archive.extractall(directory)
        files = sorted(directory.rglob("*.nc"))
    else:
        target = directory / "era5.nc"
        shutil.copyfile(download, target)
        files = [target]
    if not files:
        raise RuntimeError("ERA5_FORMAT001 CDS response contains no NetCDF files")
    return files


def read_netcdf_files(paths: list[Path]) -> tuple[list[datetime], dict[str, np.ndarray], dict[str, dict[str, str]], dict[str, float | None]]:
    reference_times: list[datetime] | None = None
    arrays: dict[str, np.ndarray] = {}
    metadata: dict[str, dict[str, str]] = {}
    resolved = {"latitude": None, "longitude": None}

    for path in paths:
        with netCDF4.Dataset(path) as dataset:
            current_times = time_values(dataset)
            for coordinate in ("latitude", "longitude"):
                if coordinate in dataset.variables:
                    values = np.asarray(dataset.variables[coordinate][:]).reshape(-1)
                    if values.size:
                        resolved[coordinate] = finite_or_none(values[0])
            for variable_name, variable in dataset.variables.items():
                logical_name = find_logical_name(variable_name)
                if logical_name is None:
                    continue
                if logical_name in arrays:
                    raise RuntimeError(f"ERA5_FORMAT001 duplicate variable {logical_name}")
                unit = normalize_unit(str(getattr(variable, "units", "")))
                if unit not in EXPECTED_UNITS[logical_name]:
                    raise RuntimeError(f"ERA5_UNIT001 {logical_name} has unexpected unit {unit!r}")
                values = np.ma.filled(variable[:], np.nan)
                values = np.asarray(values, dtype=np.float64).squeeze()
                if values.ndim != 1 or values.shape[0] != len(current_times):
                    raise RuntimeError(f"ERA5_FORMAT001 {logical_name} is not a one-dimensional hourly series")
                if reference_times is None:
                    reference_times = current_times
                elif current_times != reference_times:
                    raise RuntimeError(f"ERA5_TIME001 timestamp mismatch for {logical_name}")
                arrays[logical_name] = values
                metadata[logical_name] = {
                    "netcdfVariable": variable_name,
                    "unit": str(getattr(variable, "units", "")),
                    "longName": str(getattr(variable, "long_name", "")),
                }

    missing = sorted(set(ALIASES) - set(arrays))
    if missing:
        raise RuntimeError(f"ERA5_FORMAT001 missing required variables: {', '.join(missing)}")
    if reference_times is None:
        raise RuntimeError("ERA5_TIME001 no time coordinate found")
    return reference_times, arrays, metadata, resolved


def validate_series(
    times: list[datetime], arrays: dict[str, np.ndarray], start_date: str, end_date: str
) -> dict[str, Any]:
    expected_start = datetime.fromisoformat(start_date).replace(tzinfo=UTC)
    expected_end = datetime.fromisoformat(end_date).replace(tzinfo=UTC, hour=23)
    if times[0] != expected_start or times[-1] != expected_end:
        raise RuntimeError(f"ERA5_TIME001 response covers {times[0].isoformat()} to {times[-1].isoformat()}")
    for index, value in enumerate(times):
        if value.minute or value.second or value.microsecond:
            raise RuntimeError(f"ERA5_TIME001 non-hourly timestamp at index {index}")
        if index and (value - times[index - 1]).total_seconds() != 3600:
            raise RuntimeError(f"ERA5_TIME001 non-contiguous timestamp at index {index}")
    precipitation = arrays["precipitationM"]
    finite_precipitation = precipitation[np.isfinite(precipitation)]
    minimum_precipitation = float(np.min(finite_precipitation)) if finite_precipitation.size else None
    negative_indexes = np.flatnonzero(np.isfinite(precipitation) & (precipitation < 0))
    if minimum_precipitation is not None and minimum_precipitation < NETCDF_NEGATIVE_ARTIFACT_FLOOR_M:
        sample_indexes = negative_indexes[:3]
        samples = ", ".join(
            f"{times[int(index)].isoformat()}={precipitation[int(index)]:.12g}m"
            for index in sample_indexes
        )
        raise RuntimeError(
            "ERA5_PREC001 de-accumulated precipitation contains material negative values: "
            f"minimum={minimum_precipitation:.12g}m, "
            f"count={negative_indexes.size}, samples=[{samples}]"
        )
    precipitation[negative_indexes] = 0
    snow_cover = arrays["snowCover"]
    finite_snow = snow_cover[np.isfinite(snow_cover)]
    if finite_snow.size and (float(np.min(finite_snow)) < 0 or float(np.max(finite_snow)) > 1.000001):
        raise RuntimeError("ERA5_SNOW001 snow cover is not represented as a 0..1 fraction")
    snow_depth = arrays["snowDepthM"]
    finite_snow_depth = snow_depth[np.isfinite(snow_depth)]
    minimum_snow_depth = float(np.min(finite_snow_depth)) if finite_snow_depth.size else None
    negative_snow_depth_indexes = np.flatnonzero(np.isfinite(snow_depth) & (snow_depth < 0))
    if minimum_snow_depth is not None and minimum_snow_depth < NETCDF_NEGATIVE_ARTIFACT_FLOOR_M:
        sample_indexes = negative_snow_depth_indexes[:3]
        samples = ", ".join(
            f"{times[int(index)].isoformat()}={snow_depth[int(index)]:.12g}m"
            for index in sample_indexes
        )
        raise RuntimeError(
            "ERA5_SNOW001 snow depth contains negative values: "
            f"minimum={minimum_snow_depth:.12g}m, "
            f"count={negative_snow_depth_indexes.size}, samples=[{samples}]"
        )
    snow_depth[negative_snow_depth_indexes] = 0
    return {
        "precipitation": {
            "policy": "CLAMP_SMALL_NEGATIVE_NETCDF_ARTIFACTS_TO_ZERO",
            "artifactFloorM": NETCDF_NEGATIVE_ARTIFACT_FLOOR_M,
            "clampedValueCount": int(negative_indexes.size),
            "minimumOriginalValueM": minimum_precipitation,
        },
        "snowDepth": {
            "policy": "CLAMP_SMALL_NEGATIVE_NETCDF_ARTIFACTS_TO_ZERO",
            "artifactFloorM": NETCDF_NEGATIVE_ARTIFACT_FLOOR_M,
            "clampedValueCount": int(negative_snow_depth_indexes.size),
            "minimumOriginalValueM": minimum_snow_depth,
        },
    }


def write_observations(path: Path, times: list[datetime], arrays: dict[str, np.ndarray]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    with gzip.open(temporary, "wt", encoding="utf-8", newline="\n") as stream:
        for index, timestamp in enumerate(times):
            record = {
                "utcInstant": timestamp.strftime("%Y-%m-%dT%H:00:00.000Z"),
                **{name: finite_or_none(values[index]) for name, values in arrays.items()},
            }
            stream.write(json.dumps(record, separators=(",", ":"), allow_nan=False))
            stream.write("\n")
    os.replace(temporary, path)


def main() -> None:
    args = parse_args()
    token = (os.environ.get("CDSAPI_KEY") or "").strip()
    if not token:
        raise RuntimeError("BLOCKED_OPERATOR_SECRET: CDSAPI_KEY is not set")
    request = {
        "variable": VARIABLES,
        "location": {"longitude": args.lon, "latitude": args.lat},
        "date": [f"{args.start_date}/{args.end_date}"],
        "data_format": "netcdf",
    }
    with tempfile.TemporaryDirectory(prefix="bth-era5-") as temporary_directory:
        directory = Path(temporary_directory)
        download = directory / "response.zip"
        client = cdsapi.Client(url="https://cds.climate.copernicus.eu/api", key=token)
        client.retrieve(DATASET, request, str(download))
        archive_hash = sha256_file(download)
        files = extract_download(download, directory / "netcdf")
        times, arrays, variable_metadata, resolved = read_netcdf_files(files)
        quality = validate_series(times, arrays, args.start_date, args.end_date)
        write_observations(args.output, times, arrays)

    args.metadata.parent.mkdir(parents=True, exist_ok=True)
    metadata = {
        "schemaVersion": 1,
        "dataset": DATASET,
        "datasetDoi": "10.24381/ee82e357",
        "request": request,
        "precipitationSemantics": "INCREMENTAL_PER_TIMESTEP_M",
        "precipitationQuality": quality["precipitation"],
        "snowCoverSemantics": "FRACTION_0_TO_1",
        "snowDepthQuality": quality["snowDepth"],
        "observationCount": len(times),
        "firstUtcInstant": times[0].strftime("%Y-%m-%dT%H:00:00.000Z"),
        "lastUtcInstant": times[-1].strftime("%Y-%m-%dT%H:00:00.000Z"),
        "resolvedLocation": resolved,
        "variables": variable_metadata,
        "downloadSha256": archive_hash,
        "retrievedAt": datetime.now(UTC).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
    }
    temporary_metadata = args.metadata.with_suffix(args.metadata.suffix + ".tmp")
    temporary_metadata.write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    os.replace(temporary_metadata, args.metadata)


if __name__ == "__main__":
    main()
