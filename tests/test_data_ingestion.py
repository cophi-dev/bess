from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path

import pandas as pd
import pytest

from open_autobidder import data_ingestion
from open_autobidder.config import DataRuntimeConfig


def test_standardize_index_sorts_and_names_timestamp() -> None:
    idx = pd.to_datetime(["2026-01-02 01:00", "2026-01-02 00:00"]).tz_localize("Europe/Brussels")
    frame = pd.DataFrame({"x": [1.0, 2.0]}, index=idx)
    out = data_ingestion._standardize_index(frame)
    assert out.index.name == "timestamp"
    assert out.index.is_monotonic_increasing


def test_validate_expected_columns_raises_on_missing() -> None:
    frame = pd.DataFrame({"a": [1.0]})
    with pytest.raises(ValueError, match="missing required columns"):
        data_ingestion._validate_expected_columns(frame, {"day_ahead_price_eur_mwh"}, "prices")


def test_update_local_data_writes_metadata(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    processed_dir = tmp_path / "processed"
    processed_dir.mkdir()
    monkeypatch.setattr(data_ingestion, "PROCESSED_DATA_DIR", processed_dir)

    idx = pd.date_range("2026-01-01", periods=3, freq="1h", tz="Europe/Brussels")
    prices = pd.DataFrame({"day_ahead_price_eur_mwh": [70.0, 71.0, 72.0]}, index=idx)
    generation = pd.DataFrame(
        {"wind_generation_mw": [1000.0, 1100.0, 1200.0], "solar_generation_mw": [100.0, 120.0, 140.0]},
        index=idx,
    )
    load = pd.DataFrame({"system_load_mw": [52000.0, 53000.0, 54000.0]}, index=idx)
    monkeypatch.setattr(data_ingestion, "fetch_recent_prices", lambda days, market_zone: prices)
    monkeypatch.setattr(data_ingestion, "fetch_recent_generation", lambda days, market_zone: generation)
    monkeypatch.setattr(data_ingestion, "fetch_recent_load", lambda days, market_zone: load)

    runtime = DataRuntimeConfig(market_zone="DE_LU", interval="1h")
    paths = data_ingestion.update_local_data(days=2, runtime_config=runtime)
    assert "load" in paths

    prices_meta = paths["prices"].with_suffix(".meta.json")
    assert prices_meta.exists()
    meta = data_ingestion._load_snapshot_metadata(paths["prices"])
    assert meta["market_zone"] == "DE_LU"
    assert meta["interval"] == "1h"
    assert datetime.fromisoformat(meta["fetched_at_utc"]).tzinfo == UTC
