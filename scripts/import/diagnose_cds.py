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


DATASETS = {
    "era5_single_levels_timeseries": {
        "dataset": "reanalysis-era5-single-levels-timeseries",
        "request": {
            "variable": ["2m_temperature"],
            "location": {"longitude": -16.5, "latitude": 28.3},
            "date": ["2020-01-01/2020-01-01"],
            "data_format": "csv",
        },
    },
    "era5_land_timeseries": {
        "dataset": "reanalysis-era5-land-timeseries",
        "request": {
            "variable": ["2m_temperature"],
            "location": {"longitude": -16.5, "latitude": 28.3},
            "date": ["2020-01-01/2020-01-01"],
            "data_format": "netcdf",
        },
    },
}


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
        for name, specification in DATASETS.items():
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
            except Exception as error:  # noqa: BLE001 - diagnostic boundary
                results[name] = {
                    "ok": False,
                    "dataset": specification["dataset"],
                    "error": safe_error(error, token),
                }

    print(json.dumps({"credentialPresent": True, "results": results}, separators=(",", ":")))


if __name__ == "__main__":
    main()
