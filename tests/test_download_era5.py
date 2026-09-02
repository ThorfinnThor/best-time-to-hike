from __future__ import annotations

import gzip
import hashlib
import importlib.util
import tempfile
import unittest
from datetime import UTC, datetime, timedelta
from pathlib import Path

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts/import/download_era5.py"
SPEC = importlib.util.spec_from_file_location("download_era5", MODULE_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class Era5DownloadImporterTest(unittest.TestCase):
    def test_snow_cover_percent_is_normalized_to_fraction(self) -> None:
        values, normalization = MODULE.canonicalize_values("snowCover", "%", np.array([0.0, 25.0, 100.0]))
        np.testing.assert_allclose(values, [0.0, 0.25, 1.0])
        self.assertEqual(normalization, "PERCENT_TO_FRACTION")

    def test_negative_artifact_floor_is_inclusive_and_material_values_fail(self) -> None:
        times = [datetime(2020, 1, 1, tzinfo=UTC) + timedelta(hours=index) for index in range(24)]
        arrays = self.arrays(24)
        arrays["precipitationM"][0] = -1e-6
        arrays["snowDepthM"][0] = -1e-6
        quality = MODULE.validate_series(times, arrays, "2020-01-01", "2020-01-01")
        self.assertEqual(arrays["precipitationM"][0], 0)
        self.assertEqual(arrays["snowDepthM"][0], 0)
        self.assertEqual(quality["precipitation"]["clampedValueCount"], 1)
        self.assertEqual(quality["snowDepth"]["clampedValueCount"], 1)

        material = self.arrays(24)
        material["precipitationM"][0] = -1.000001e-6
        with self.assertRaisesRegex(RuntimeError, "material negative"):
            MODULE.validate_series(times, material, "2020-01-01", "2020-01-01")

    def test_canonical_gzip_output_is_deterministic_and_timestamp_free(self) -> None:
        times = [datetime(2020, 1, 1, tzinfo=UTC), datetime(2020, 1, 1, 1, tzinfo=UTC)]
        arrays = self.arrays(2)
        with tempfile.TemporaryDirectory() as directory:
            first = Path(directory) / "first.ndjson.gz"
            second = Path(directory) / "second.ndjson.gz"
            MODULE.write_observations(first, times, arrays)
            MODULE.write_observations(second, times, arrays)
            self.assertEqual(hashlib.sha256(first.read_bytes()).hexdigest(), hashlib.sha256(second.read_bytes()).hexdigest())
            self.assertEqual(int.from_bytes(first.read_bytes()[4:8], "little"), 0)
            with gzip.open(first, "rt", encoding="utf-8") as stream:
                self.assertEqual(len(stream.readlines()), 2)

    @staticmethod
    def arrays(length: int) -> dict[str, np.ndarray]:
        return {
            "temperatureK": np.full(length, 280.0),
            "dewpointK": np.full(length, 275.0),
            "windUMs": np.full(length, 1.0),
            "windVMs": np.full(length, 2.0),
            "precipitationM": np.zeros(length),
            "snowCover": np.zeros(length),
            "snowDepthM": np.zeros(length),
        }


if __name__ == "__main__":
    unittest.main()
