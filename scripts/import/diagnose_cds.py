#!/usr/bin/env python3
"""Verify one CDS credential against the two ERA5 time-series products.

The diagnostic intentionally downloads only one variable for one day. It never
prints the credential and returns a compact JSON result suitable for Workflow
status output.
"""

from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path

import cdsapi
import netCDF4
import numpy as np

from download_era5 import extract_download


DEFAULT_LOCATIONS = [
    {"name": "madeira-32p7-m17p1", "lat": 32.7, "lon": -17.1},
    {"name": "madeira-32p8-m16p9", "lat": 32.8, "lon": -16.9},
    {"name": "madeira-32p8-m17p0", "lat": 32.8, "lon": -17.0},
    {"name": "madeira-32p7-m17p0", "lat": 32.7, "lon": -17.0},
    {"name": "madeira-32p8-m17p1", "lat": 32.8, "lon": -17.1},
    {"name": "madeira-32p7-m16p9", "lat": 32.7, "lon": -16.9},
]


def diagnostic_locations() -> list[dict[str, object]]:
    raw = os.environ.get("BTH_CDS_DIAGNOSTIC_LOCATIONS", "")
    if not raw:
        return DEFAULT_LOCATIONS
    values = json.loads(raw)
    if not isinstance(values, list) or len(values) > 20:
        raise RuntimeError("invalid CDS diagnostic locations")
    names: set[str] = set()
    for value in values:
        if not isinstance(value, dict):
            raise RuntimeError("invalid CDS diagnostic location")
        name, latitude, longitude = value.get("name"), value.get("lat"), value.get("lon")
        if (
            not isinstance(name, str)
            or not name.replace("-", "").isalnum()
            or name in names
            or not isinstance(latitude, (int, float))
            or not -90 <= latitude <= 90
            or not isinstance(longitude, (int, float))
            or not -180 <= longitude <= 180
        ):
            raise RuntimeError("invalid CDS diagnostic location")
        names.add(name)
    return values


def datasets() -> dict[str, dict[str, object]]:
    values: dict[str, dict[str, object]] = {
        "era5_single_levels_timeseries": {
            "dataset": "reanalysis-era5-single-levels-timeseries",
            "request": {
                "variable": ["2m_temperature"],
                "location": {"longitude": -16.5, "latitude": 28.3},
                "date": ["2020-01-01/2020-01-01"],
                "data_format": "csv",
            },
        },
    }
    for location in diagnostic_locations():
        values[str(location["name"])] = {
            "dataset": "reanalysis-era5-land-timeseries",
            "request": {
                "variable": ["2m_temperature"],
                "location": {"longitude": location["lon"], "latitude": location["lat"]},
                "date": ["2020-01-01/2020-01-01"],
                "data_format": "netcdf",
            },
        }
    return values


def safe_error(error: Exception, token: str) -> str:
    message = str(error).replace(token, "[redacted]")
    return " ".join(message.split())[-2_000:]


def main() -> None:
    token = (os.environ.get("CDSAPI_KEY") or "").strip()
    if not token:
        raise RuntimeError("BLOCKED_OPERATOR_SECRET: CDSAPI_KEY is not configured")

    results: dict[str, object] = {}
    with tempfile.TemporaryDirectory(prefix="bth-cds-diagnostic-") as directory:
        root = Path(directory)
        for name, specification in datasets().items():
            output = root / f"{name}.download"
            try:
                client = cdsapi.Client(
                    url="https://cds.climate.copernicus.eu/api",
                    key=token,
                    retry_max=1,
                    timeout=180,
                    quiet=True,
                )
                client.retrieve(
                    str(specification["dataset"]),
                    dict(specification["request"]),
                    str(output),
                )
                results[name] = {
                    "ok": True,
                    "dataset": specification["dataset"],
                    "downloadBytes": output.stat().st_size,
                }
                if name != "era5_single_levels_timeseries":
                    files = extract_download(output, root / f"{name}_netcdf")
                    non_missing = 0
                    resolved = {"latitude": None, "longitude": None}
                    variable_name = None
                    unit = None
                    for path in files:
                        with netCDF4.Dataset(path) as dataset:
                            for coordinate in resolved:
                                if coordinate in dataset.variables:
                                    values = np.asarray(dataset.variables[coordinate][:]).reshape(-1)
                                    if values.size:
                                        resolved[coordinate] = float(values[0])
                            for candidate in ("t2m", "2m_temperature"):
                                if candidate in dataset.variables:
                                    variable = dataset.variables[candidate]
                                    variable_name = candidate
                                    unit = str(getattr(variable, "units", ""))
                                    values = np.asarray(np.ma.filled(variable[:], np.nan), dtype=np.float64)
                                    non_missing += int(np.isfinite(values).sum())
                    results[name] = {
                        "ok": True,
                        "dataset": specification["dataset"],
                        "resolvedLocation": resolved,
                        "temperature": {
                            "variable": variable_name,
                            "unit": unit,
                            "nonMissingCount": non_missing,
                        },
                    }
            except Exception as error:  # noqa: BLE001 - diagnostic boundary
                results[name] = {
                    "ok": False,
                    "dataset": specification["dataset"],
                    "error": safe_error(error, token),
                }

    print(json.dumps({"credentialPresent": True, "results": results}, separators=(",", ":")))


if __name__ == "__main__":
    main()
