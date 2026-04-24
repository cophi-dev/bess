from __future__ import annotations

import pandas as pd

from open_autobidder import data_loader


def _base_frames() -> tuple[pd.DataFrame, pd.DataFrame]:
    idx = pd.date_range("2026-01-01", periods=4, freq="1h", tz="Europe/Brussels")
    prices = pd.DataFrame({"day_ahead_price_eur_mwh": [50.0, 60.0, 70.0, 80.0]}, index=idx)
    generation = pd.DataFrame({"wind_generation_mw": [1200.0, 1300.0, 1100.0, 1000.0]}, index=idx)
    return prices, generation


def test_load_market_data_uses_cached_metadata(monkeypatch) -> None:
    prices, generation = _base_frames()

    monkeypatch.setattr(
        data_loader,
        "load_latest_data",
        lambda fallback_to_sample=True: {
            "prices": prices,
            "generation": generation,
            "metadata": {"market_zone": "DE_LU", "interval": "1h", "source": "cached"},
        },
    )
    monkeypatch.setattr(data_loader, "latest_data_timestamp", lambda: None)

    result = data_loader.load_market_data(periods=3)
    assert result.source == "cached"
    assert result.market_zone == "DE_LU"
    assert result.interval == "1h"
    assert len(result.market_data) == 3


def test_load_market_data_falls_back_to_synthetic_on_invalid_merge(monkeypatch) -> None:
    idx = pd.date_range("2026-01-01", periods=3, freq="1h", tz="Europe/Brussels")
    prices = pd.DataFrame({"day_ahead_price_eur_mwh": [10.0, None, 30.0]}, index=idx)
    generation = pd.DataFrame({"wind_generation_mw": [1000.0, 900.0, 800.0]}, index=idx)
    monkeypatch.setattr(
        data_loader,
        "load_latest_data",
        lambda fallback_to_sample=True: {"prices": prices, "generation": generation, "metadata": {}},
    )
    monkeypatch.setattr(data_loader, "latest_data_timestamp", lambda: None)

    result = data_loader.load_market_data(periods=3)
    assert result.source == "synthetic"
    assert result.warning is not None
    assert "invalid" in result.warning.lower()


def test_real_mode_handles_ingestion_failure_with_fallback(monkeypatch) -> None:
    monkeypatch.setattr(data_loader, "load_latest_data", lambda fallback_to_sample=True: (_ for _ in ()).throw(RuntimeError("boom")))
    result = data_loader.load_market_data_for_mode(mode="real", periods=24)
    assert result.source == "synthetic"
    assert result.warning is not None
