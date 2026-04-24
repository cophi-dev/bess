"""Data loading utilities for sample and live market time series."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Literal

import numpy as np
import pandas as pd

from .data_ingestion import load_latest_data, load_sample_data, latest_data_timestamp
from .config import load_data_runtime_config

DataFrequency = Literal["1h"]


def generate_synthetic_market_data(
    start: str = "2025-01-01",
    periods: int = 24,
    freq: DataFrequency = "1h",
    seed: int = 42,
) -> pd.DataFrame:
    """
    Generate synthetic day-ahead price and wind generation data.

    The synthetic profile follows a stylized North Germany pattern:
    - lower prices at night
    - evening peak prices
    - variable wind generation with stronger nighttime contribution
    """
    rng = np.random.default_rng(seed=seed)
    idx = pd.date_range(start=start, periods=periods, freq=freq)
    hours = idx.hour.values

    base_price = 70 + 20 * np.sin((hours - 8) / 24 * 2 * np.pi) + 35 * np.sin((hours - 16) / 24 * np.pi)
    noise = rng.normal(0, 8, size=periods)
    day_ahead_price_eur_mwh = np.clip(base_price + noise, -50, 300)

    wind_profile = 6000 + 2000 * np.cos((hours - 2) / 24 * 2 * np.pi) + rng.normal(0, 400, size=periods)
    wind_generation_mw = np.clip(wind_profile, 500, None)

    congestion_signal = np.clip((wind_generation_mw - np.percentile(wind_generation_mw, 65)) / 2500, 0, 1)
    fcr_availability_eur_mw_h = np.clip(5 + rng.normal(0, 1.0, size=periods), 2.0, 10.0)
    afrr_availability_eur_mw_h = np.clip(3 + rng.normal(0, 1.2, size=periods), 0.5, 9.0)
    afrr_utilization_eur_mwh = np.clip(35 + rng.normal(0, 10, size=periods), 10, 90)
    afrr_activation_ratio = np.clip(0.18 + 0.22 * congestion_signal + rng.normal(0, 0.05, size=periods), 0.0, 1.0)
    capacity_payment_eur_mw_h = np.full(periods, 1.6)
    congestion_bonus_eur_mwh = np.clip(12 + 15 * congestion_signal, 8, 30)

    hours_arr = hours
    system_load_mw = 50000.0 + 10000.0 * np.sin((hours_arr - 8.0) / 24.0 * 2.0 * np.pi) + rng.normal(0, 400, size=periods)
    system_load_mw = np.clip(system_load_mw, 30000, None)

    return pd.DataFrame(
        {
            "timestamp": idx,
            "day_ahead_price_eur_mwh": day_ahead_price_eur_mwh,
            "wind_generation_mw": wind_generation_mw,
            "system_load_mw": system_load_mw,
            "fcr_availability_eur_mw_h": fcr_availability_eur_mw_h,
            "afrr_availability_eur_mw_h": afrr_availability_eur_mw_h,
            "afrr_utilization_eur_mwh": afrr_utilization_eur_mwh,
            "afrr_activation_ratio": afrr_activation_ratio,
            "capacity_payment_eur_mw_h": capacity_payment_eur_mw_h,
            "congestion_signal": congestion_signal,
            "congestion_bonus_eur_mwh": congestion_bonus_eur_mwh,
        }
    ).set_index("timestamp")


def load_smard_data(
    prices_csv_path: str | Path | None = None,
    generation_csv_path: str | Path | None = None,
    fallback_periods: int = 24,
) -> pd.DataFrame:
    """
    Load SMARD-style time series for optimization.

    Expected minimum schema:
    - prices CSV columns: `timestamp`, `day_ahead_price_eur_mwh`
    - generation CSV columns: `timestamp`, `wind_generation_mw`

    If CSV files are not available, synthetic data is returned.

    Real SMARD downloads can be sourced from:
    https://www.smard.de/ (Marktdaten herunterladen, CSV export)
    """
    if prices_csv_path is None or generation_csv_path is None:
        return generate_synthetic_market_data(periods=fallback_periods)

    prices_df = pd.read_csv(prices_csv_path, parse_dates=["timestamp"])
    generation_df = pd.read_csv(generation_csv_path, parse_dates=["timestamp"])

    required_prices_cols = {"timestamp", "day_ahead_price_eur_mwh"}
    required_gen_cols = {"timestamp", "wind_generation_mw"}

    missing_prices = required_prices_cols.difference(prices_df.columns)
    missing_gen = required_gen_cols.difference(generation_df.columns)
    if missing_prices:
        raise ValueError(f"Prices CSV missing columns: {sorted(missing_prices)}")
    if missing_gen:
        raise ValueError(f"Generation CSV missing columns: {sorted(missing_gen)}")

    merged = (
        prices_df[list(required_prices_cols)]
        .merge(generation_df[list(required_gen_cols)], on="timestamp", how="inner")
        .sort_values("timestamp")
        .set_index("timestamp")
    )
    if merged.empty:
        raise ValueError("Merged SMARD dataset is empty. Please check timestamp alignment.")
    return merged


@dataclass
class DataLoadResult:
    """Container with merged market data and provenance metadata."""

    market_data: pd.DataFrame
    source: str
    last_updated: datetime | None
    warning: str | None = None
    market_zone: str = "DE_LU"
    interval: str = "1h"


def _ensure_system_load_mw(market_data: pd.DataFrame) -> pd.DataFrame:
    """
    Ensure ``system_load_mw`` (total zone load, MW) exists; interpolate gaps after left-joins.

    When the column is fully missing, use a diurnal template so offline tests and old caches
    without load snapshots still get a displayable number.
    """
    out = market_data.copy()
    if "system_load_mw" not in out.columns:
        hours = out.index.hour
        out["system_load_mw"] = 48000.0 + 10000.0 * np.sin((np.asarray(hours) - 9.0) / 24.0 * 2.0 * np.pi)
    else:
        out["system_load_mw"] = pd.to_numeric(out["system_load_mw"], errors="coerce")
        if out["system_load_mw"].isna().any():
            out["system_load_mw"] = out["system_load_mw"].interpolate(limit_direction="both")
            if out["system_load_mw"].isna().any():
                out["system_load_mw"] = out["system_load_mw"].ffill().bfill()
        if out["system_load_mw"].isna().all():
            hours = out.index.hour
            out["system_load_mw"] = 48000.0 + 10000.0 * np.sin((np.asarray(hours) - 9.0) / 24.0 * 2.0 * np.pi)
    return out


def _merge_price_generation_load(
    prices_df: pd.DataFrame, generation_df: pd.DataFrame, load_df: pd.DataFrame | None
) -> pd.DataFrame:
    """Inner-join price and generation, then left-join load when present; fill load gaps."""
    merged = prices_df.join(generation_df, how="inner")
    if load_df is not None and not load_df.empty:
        common = merged.index.intersection(load_df.index)
        if len(common) == 0:
            # Time zones / grids misaligned: keep price+gen, synthesize load next.
            return _ensure_system_load_mw(merged)
        merged = merged.join(load_df, how="left")
    return _ensure_system_load_mw(merged)


def _ensure_revenue_stacking_columns(market_data: pd.DataFrame) -> pd.DataFrame:
    """Backfill optional stacking columns for sample/real datasets."""
    enriched = market_data.copy()
    defaults = {
        "fcr_availability_eur_mw_h": 5.0,
        "afrr_availability_eur_mw_h": 3.0,
        "afrr_utilization_eur_mwh": 35.0,
        "afrr_activation_ratio": 0.2,
        "capacity_payment_eur_mw_h": 1.6,
        "congestion_signal": 0.0,
        "congestion_bonus_eur_mwh": 10.0,
    }
    for column, default_value in defaults.items():
        if column not in enriched.columns:
            enriched[column] = default_value
    enriched["afrr_activation_ratio"] = enriched["afrr_activation_ratio"].clip(0.0, 1.0)
    enriched["congestion_signal"] = enriched["congestion_signal"].clip(0.0, 1.0)
    return enriched


def _coerce_recent_window(market_data: pd.DataFrame, periods: int) -> pd.DataFrame:
    if periods <= 0:
        raise ValueError("periods must be greater than 0.")
    if len(market_data) <= periods:
        return market_data
    return market_data.tail(periods)


def _validate_market_data_frame(market_data: pd.DataFrame) -> None:
    required = {"day_ahead_price_eur_mwh", "wind_generation_mw", "system_load_mw"}
    missing = required.difference(market_data.columns)
    if missing:
        raise ValueError(f"Merged market data missing required columns: {sorted(missing)}")
    if market_data.empty:
        raise ValueError("Merged market data is empty.")
    if not isinstance(market_data.index, pd.DatetimeIndex):
        raise ValueError("Merged market data index must be DatetimeIndex.")
    if not market_data.index.is_monotonic_increasing:
        raise ValueError("Merged market data index must be monotonic increasing.")
    if market_data[["day_ahead_price_eur_mwh", "wind_generation_mw", "system_load_mw"]].isna().any().any():
        raise ValueError("Merged market data has nulls in required columns.")


def load_market_data(periods: int = 24) -> DataLoadResult:
    """
    Load merged price + generation data.

    Priority:
    1) Latest cached ENTSO-E snapshots in ``data/processed``
    2) Checked-in sample dataset in ``data/processed/*_sample.csv``
    3) Synthetic fallback if local files are unavailable/corrupt
    """
    runtime = load_data_runtime_config()
    try:
        datasets = load_latest_data(fallback_to_sample=True)
        metadata = datasets.get("metadata", {}) if isinstance(datasets, dict) else {}
        source = str(metadata.get("source", "cached" if latest_data_timestamp() else "sample"))
        warning = None
        updated_at = latest_data_timestamp()
    except Exception as exc:
        market_data = generate_synthetic_market_data(periods=periods)
        return DataLoadResult(
            market_data=market_data,
            source="synthetic",
            last_updated=None,
            warning=f"Falling back to synthetic data because local data load failed: {exc}",
            market_zone=runtime.market_zone,
            interval=runtime.interval,
        )

    prices_df = datasets["prices"]  # type: ignore[index]
    generation_df = datasets["generation"]  # type: ignore[index]
    load_df: pd.DataFrame | None = datasets.get("load")  # type: ignore[union-attr]
    merged = _merge_price_generation_load(prices_df, generation_df, load_df)
    try:
        _validate_market_data_frame(merged)
    except Exception as exc:
        market_data = generate_synthetic_market_data(periods=periods)
        return DataLoadResult(
            market_data=market_data,
            source="synthetic",
            last_updated=None,
            warning=f"Merged local dataset invalid; using synthetic fallback: {exc}",
            market_zone=runtime.market_zone,
            interval=runtime.interval,
        )

    merged = _ensure_revenue_stacking_columns(_coerce_recent_window(merged, periods=periods))
    return DataLoadResult(
        market_data=merged,
        source=source,
        last_updated=updated_at,
        warning=warning,
        market_zone=str(metadata.get("market_zone", runtime.market_zone)),
        interval=str(metadata.get("interval", runtime.interval)),
    )


def load_market_data_for_mode(mode: Literal["sample", "real"] = "sample", periods: int = 24) -> DataLoadResult:
    """
    Load market data in explicit mode.

    - ``sample`` (default): always uses checked-in sample files first.
    - ``real``: uses latest cached ENTSO-E snapshots with sample/synthetic fallback.
    """
    runtime = load_data_runtime_config()
    if mode == "sample":
        try:
            datasets = load_sample_data()
            merged = _merge_price_generation_load(
                datasets["prices"],
                datasets["generation"],
                datasets.get("load"),
            )
            _validate_market_data_frame(merged)
            merged = _ensure_revenue_stacking_columns(_coerce_recent_window(merged, periods=periods))
            return DataLoadResult(
                market_data=merged,
                source="sample",
                last_updated=None,
                market_zone=runtime.market_zone,
                interval=runtime.interval,
            )
        except Exception as exc:
            market_data = generate_synthetic_market_data(periods=periods)
            return DataLoadResult(
                market_data=market_data,
                source="synthetic",
                last_updated=None,
                warning=f"Sample data unavailable; using synthetic fallback: {exc}",
                market_zone=runtime.market_zone,
                interval=runtime.interval,
            )

    return load_market_data(periods=periods)
