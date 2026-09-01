from __future__ import annotations

import hashlib
import importlib.util
import tempfile
import unittest
from pathlib import Path

import netCDF4
import numpy as np


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts/import/download_era5_land_orography.py"
SPEC = importlib.util.spec_from_file_location("download_era5_land_orography", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class Era5LandOrographyTest(unittest.TestCase):
    def write_source(self, path: Path, unit: str = "m**2 s**-2") -> None:
        with netCDF4.Dataset(path, "w") as dataset:
            dataset.createDimension("time", 1)
            dataset.createDimension("latitude", 2)
            dataset.createDimension("longitude", 3)
            dataset.createVariable("time", "i4", ("time",))[:] = [0]
            dataset.createVariable("latitude", "f8", ("latitude",))[:] = [1.0, 0.0]
            dataset.createVariable("longitude", "f8", ("longitude",))[:] = [0.0, 0.1, 359.9]
            geopotential = dataset.createVariable("z", "f8", ("time", "latitude", "longitude"))
            geopotential.units = unit
            geopotential[:] = np.array([[[98.0665, 196.133, 294.1995], [980.665, 1961.33, 2941.995]]])

    def test_extracts_nearest_grid_point_and_converts_with_standard_gravity(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "orography.nc"
            self.write_source(source)
            points = MODULE.extract_points(
                source,
                [
                    {"key": "one", "lat": 1.0, "lon": -0.1},
                    {"key": "two", "lat": 0.0, "lon": 0.1},
                ],
                9.80665,
            )
        self.assertEqual(points[0]["resolvedLocation"], {"latitude": 1.0, "longitude": -0.1})
        self.assertAlmostEqual(points[0]["era5LandGridElevationM"], 30.0)
        self.assertAlmostEqual(points[1]["era5LandGridElevationM"], 200.0)

    def test_rejects_an_unexpected_geopotential_unit(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / "orography.nc"
            self.write_source(source, "m")
            with self.assertRaisesRegex(RuntimeError, "unexpected unit"):
                MODULE.extract_points(source, [{"key": "one", "lat": 0.0, "lon": 0.0}], 9.80665)

    def test_verified_cache_is_reused_without_network_access(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "cached.nc"
            target.write_bytes(b"pinned invariant")
            expected = hashlib.sha256(target.read_bytes()).hexdigest()
            MODULE.download_verified("https://invalid.example.test/never-requested", target, len(target.read_bytes()), expected, False)
            self.assertEqual(target.read_bytes(), b"pinned invariant")


if __name__ == "__main__":
    unittest.main()
