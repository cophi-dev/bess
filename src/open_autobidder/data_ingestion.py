"""Automatic market data ingestion from ENTSO-E."""

from __future__ import annotations

import json
import logging
import os
from datetime import UTC, datetime
from pathlib import Path

import numpy as np
import pandas as pd
import typer
from entsoe import EntsoePandasClient

from .config import DataRuntimeConfig, load_data_runtime_config

LOGGER = logging.getLogger(__name__)
APP = typer.Typer(help="ENTSO-E data ingestion CLI for OpenAutobidder-DE.")
ENTSOE_TOKEN_ENV = "ENTSOE_API_TOKEN"
PROCESSED_DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "processed"
SAMPLE_DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "sample"
SAMPLE_PRICES_PATH = SAMPLE_DATA_DIR / "prices_sample.csv"
SAMPLE_GENERATION_PATH = SAMPLE_DATA_DIR / "generation_sample.csv"
SAMPLE_LOAD_PATH = SAMPLE_DATA_DIR / "load_sample.csv"


def _get_entsoe_client() -> EntsoePandasClient:
    api_token = os.getenv(ENTSOE_TOKEN_ENV)
    if not api_token:
        raise RuntimeError(
            f"Missing ENTSO-E token. Please set the `{ENTSOE_TOKEN_ENV}` environment variable."
        )
    return EntsoePandasClient(api_key=api_token)


def _time_window(days: int) -> tuple[pd.Timestamp, pd.Timestamp]:
    if days <= 0:
        raise ValueError("days must be greater than 0.")
    end = pd.Timestamp.now(tz="Europe/Brussels")
    start = end - pd.Timedelta(days=days)
    return start, end


def _standardize_index(df: pd.DataFrame) -> pd.DataFrame:
    if not isinstance(df.index, pd.DatetimeIndex):
        raise ValueError("Expected a DatetimeIndex from ENTSO-E response.")
    if df.index.tz is None:
        df.index = df.index.tz_localize("Europe/Brussels")
    df = df.sort_index()
    if not df.index.is_monotonic_increasing:
        raise ValueError("Timestamp index must be monotonic increasing after sort.")
    df.index.name = "timestamp"
    return df


def _validate_expected_columns(df: pd.DataFrame, required_columns: set[str], dataset_name: str) -> None:
    missing = required_columns.difference(df.columns)
    if missing:
        raise ValueError(f"{dataset_name} response missing required columns: {sorted(missing)}")
    if df.empty:
        raise ValueError(f"{dataset_name} response is empty.")


def _select_generation_columns(generation_df: pd.DataFrame) -> pd.DataFrame:
    if generation_df.empty:
        return pd.DataFrame(index=generation_df.index)

    if isinstance(generation_df.columns, pd.MultiIndex):
        flattened = []
        for col in generation_df.columns:
            labels = [str(part) for part in col if part not in (None, "")]
            flattened.append(" | ".join(labels))
        generation_df = generation_df.copy()
        generation_df.columns = flattened

    wind_cols = [col for col in generation_df.columns if "wind" in str(col).lower()]
    solar_cols = [col for col in generation_df.columns if "solar" in str(col).lower()]

    selected: dict[str, pd.Series] = {}
    if wind_cols:
        selected["wind_generation_mw"] = generation_df[wind_cols].sum(axis=1, min_count=1)
    if solar_cols:
        selected["solar_generation_mw"] = generation_df[solar_cols].sum(axis=1, min_count=1)

    if not selected:
        raise ValueError("Could not identify wind/solar columns in ENTSO-E generation response.")

    return pd.DataFrame(selected, index=generation_df.index)


def _normalize_market_zone(market_zone: str) -> str:
    return market_zone.strip().upper().replace("-", "_")


def fetch_recent_prices(days: int = 7, market_zone: str = "DE_LU") -> pd.DataFrame:
    """
    Fetch day-ahead prices for Germany (DE-LU bidding zone) from ENTSO-E.

    Returns a dataframe indexed by timestamp with column:
    - day_ahead_price_eur_mwh
    """
    client = _get_entsoe_client()
    start, end = _time_window(days=days)
    series = client.query_day_ahead_prices(country_code=_normalize_market_zone(market_zone), start=start, end=end)
    prices_df = series.to_frame(name="day_ahead_price_eur_mwh")
    prices_df = _standardize_index(prices_df)
    _validate_expected_columns(prices_df, {"day_ahead_price_eur_mwh"}, "prices")
    return prices_df


def fetch_recent_generation(days: int = 7, market_zone: str = "DE_LU") -> pd.DataFrame:
    """
    Fetch wind and solar generation for Germany (DE-LU bidding zone) from ENTSO-E.

    Returns a dataframe indexed by timestamp with columns:
    - wind_generation_mw
    - solar_generation_mw
    """
    client = _get_entsoe_client()
    start, end = _time_window(days=days)
    raw_generation = client.query_generation(country_code=_normalize_market_zone(market_zone), start=start, end=end)
    generation_df = raw_generation.to_frame() if isinstance(raw_generation, pd.Series) else raw_generation
    generation_df = _standardize_index(generation_df)
    generation_df = _select_generation_columns(generation_df)
    _validate_expected_columns(generation_df, {"wind_generation_mw", "solar_generation_mw"}, "generation")
    return generation_df


def _aggregate_load_to_hourly_mw(load_df: pd.DataFrame) -> pd.DataFrame:
    """
    Resample system load to hourly mean (MW) so it aligns with day-ahead hourly prices.

    ENTSO-E actual load is often 15-minute; we use one value per hour for the merge.
    """
    if load_df.empty:
        raise ValueError("load response is empty.")
    if isinstance(load_df.columns, pd.MultiIndex):
        load_df = load_df.copy()
        load_df.columns = ["_".join(str(p) for p in c if p) for c in load_df.columns]
    if len(load_df.columns) == 1:
        load_series = load_df.iloc[:, 0].astype(float)
    else:
        load_series = load_df.astype(float).sum(axis=1, min_count=1)
    hourly = load_series.to_frame(name="system_load_mw")
    hourly = hourly.resample("1h", label="right", closed="right").mean()
    hourly = _standardize_index(hourly)
    if hourly["system_load_mw"].isna().any():
        hourly["system_load_mw"] = hourly["system_load_mw"].interpolate(limit_direction="both")
    _validate_expected_columns(hourly, {"system_load_mw"}, "load")
    return hourly


def fetch_recent_load(days: int = 7, market_zone: str = "DE_LU") -> pd.DataFrame:
    """
    Fetch total actual system load for the bidding zone from ENTSO-E.

    Returns a dataframe indexed by timestamp (hourly) with column:
    - system_load_mw
    """
    client = _get_entsoe_client()
    start, end = _time_window(days=days)
    load_df = client.query_load(country_code=_normalize_market_zone(market_zone), start=start, end=end)
    if isinstance(load_df, pd.Series):
        load_df = load_df.to_frame(name="system_load_mw")
    load_df = _standardize_index(load_df)
    return _aggregate_load_to_hourly_mw(load_df)


def _save_snapshot(df: pd.DataFrame, dataset_name: str, timestamp_utc: datetime, metadata: dict[str, str]) -> Path:
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    stamp = timestamp_utc.strftime("%Y%m%dT%H%M%SZ")
    output_path = PROCESSED_DATA_DIR / f"{dataset_name}_{stamp}.parquet"
    df.to_parquet(output_path)
    meta_path = PROCESSED_DATA_DIR / f"{dataset_name}_{stamp}.meta.json"
    meta_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    return output_path


def _latest_file(pattern: str) -> Path:
    candidates = sorted(PROCESSED_DATA_DIR.glob(pattern), key=lambda p: p.stat().st_mtime, reverse=True)
    if not candidates:
        raise FileNotFoundError(
            f"No cached files found in `{PROCESSED_DATA_DIR}` for pattern `{pattern}`. "
            "Run `python -m open_autobidder.data_ingestion update` first."
        )
    return candidates[0]


def _optional_latest_file(pattern: str) -> Path | None:
    try:
        return _latest_file(pattern)
    except FileNotFoundError:
        return None


def _read_frame(path: Path) -> pd.DataFrame:
    if path.suffix == ".parquet":
        frame = pd.read_parquet(path)
    else:
        frame = pd.read_csv(path, parse_dates=["timestamp"]).set_index("timestamp")
    return _standardize_index(frame)


def _load_snapshot_metadata(parquet_path: Path) -> dict[str, str]:
    meta_path = parquet_path.with_suffix(".meta.json")
    if not meta_path.exists():
        return {}
    try:
        raw = json.loads(meta_path.read_text(encoding="utf-8"))
        if not isinstance(raw, dict):
            return {}
        return {str(k): str(v) for k, v in raw.items()}
    except Exception:
        return {}


def update_local_data(days: int = 7, runtime_config: DataRuntimeConfig | None = None) -> dict[str, Path]:
    """
    Download recent ENTSO-E prices, generation, and system load; cache snapshots as Parquet.
    """
    runtime = runtime_config or load_data_runtime_config()
    fetched_at = datetime.now(UTC)
    prices_df = fetch_recent_prices(days=days, market_zone=runtime.market_zone)
    generation_df = fetch_recent_generation(days=days, market_zone=runtime.market_zone)
    load_df = fetch_recent_load(days=days, market_zone=runtime.market_zone)

    snapshot_metadata = {
        "market_zone": runtime.market_zone,
        "interval": runtime.interval,
        "fetched_at_utc": fetched_at.isoformat(),
    }

    prices_path = _save_snapshot(prices_df, "prices", fetched_at, metadata=snapshot_metadata)
    generation_path = _save_snapshot(generation_df, "generation", fetched_at, metadata=snapshot_metadata)
    load_path = _save_snapshot(load_df, "load", fetched_at, metadata=snapshot_metadata)

    LOGGER.info("Saved prices to %s", prices_path)
    LOGGER.info("Saved generation to %s", generation_path)
    LOGGER.info("Saved load to %s", load_path)
    return {"prices": prices_path, "generation": generation_path, "load": load_path}


def _sample_load_from_prices_timestamps(prices: pd.DataFrame) -> pd.DataFrame:
    """Hourly placeholder load (MW) aligned to sample price index when no load file exists."""
    idx = prices.index
    hours = idx.hour
    # Stylized diurnal load (~45–70 GW) in megawatts
    base = 48000.0 + 10000.0 * np.sin((np.asarray(hours) - 9.0) / 24.0 * 2.0 * np.pi)
    return pd.DataFrame({"system_load_mw": base}, index=idx)


def load_sample_data() -> dict[str, pd.DataFrame]:
    """
    Load checked-in sample dataset used when live API updates are unavailable.
    """
    if not SAMPLE_PRICES_PATH.exists() or not SAMPLE_GENERATION_PATH.exists():
        raise FileNotFoundError(
            "Sample dataset is missing. Expected files: "
            f"`{SAMPLE_PRICES_PATH}` and `{SAMPLE_GENERATION_PATH}`."
        )
    prices = _read_frame(SAMPLE_PRICES_PATH)
    out: dict[str, pd.DataFrame] = {
        "prices": prices,
        "generation": _read_frame(SAMPLE_GENERATION_PATH),
    }
    if SAMPLE_LOAD_PATH.exists():
        out["load"] = _read_frame(SAMPLE_LOAD_PATH)
    else:
        out["load"] = _sample_load_from_prices_timestamps(prices)
    return out


def load_latest_data(fallback_to_sample: bool = True) -> dict[str, pd.DataFrame | dict[str, str]]:
    """
    Load the most recent cached prices, generation, and (when present) system load.

    If no cached snapshots are available and ``fallback_to_sample`` is true,
    checked-in sample CSV data is returned. Older installs may have only
    ``prices`` and ``generation`` parquet; ``load`` is then omitted and the
    data loader backfills a synthetic load column.
    """
    try:
        latest_prices = _latest_file("prices_*.parquet")
        latest_generation = _latest_file("generation_*.parquet")
    except FileNotFoundError:
        if fallback_to_sample:
            sample = load_sample_data()
            runtime = load_data_runtime_config()
            meta = {
                "market_zone": runtime.market_zone,
                "interval": runtime.interval,
                "source": "sample",
            }
            if "load" in sample:
                meta["load_path"] = str(SAMPLE_LOAD_PATH) if SAMPLE_LOAD_PATH.exists() else "synthetic"
            return {
                "prices": sample["prices"],
                "generation": sample["generation"],
                "load": sample["load"],
                "metadata": meta,
            }
        raise

    latest_load = _optional_latest_file("load_*.parquet")
    metadata = _load_snapshot_metadata(latest_prices) or _load_snapshot_metadata(latest_generation) or (
        _load_snapshot_metadata(latest_load) if latest_load else {}
    )
    runtime = load_data_runtime_config()
    metadata = {
        "market_zone": metadata.get("market_zone", runtime.market_zone),
        "interval": metadata.get("interval", runtime.interval),
        "source": "cached",
        "prices_path": str(latest_prices),
        "generation_path": str(latest_generation),
    }
    if latest_load:
        metadata["load_path"] = str(latest_load)
    out: dict[str, pd.DataFrame | dict[str, str]] = {
        "prices": _read_frame(latest_prices),
        "generation": _read_frame(latest_generation),
        "metadata": metadata,  # type: ignore[dict-item]
    }
    if latest_load is not None:
        out["load"] = _read_frame(latest_load)  # type: ignore[assignment]
    return out


def latest_data_timestamp() -> datetime | None:
    """
    Return UTC timestamp of the newest cached snapshot, if available.
    """
    mts: list[float] = []
    for pattern in ("prices_*.parquet", "generation_*.parquet", "load_*.parquet"):
        p = _optional_latest_file(pattern)
        if p is not None:
            mts.append(p.stat().st_mtime)
    if not mts:
        return None
    return datetime.fromtimestamp(max(mts), tz=UTC)


@APP.callback()
def cli() -> None:
    """Manage ENTSO-E ingestion and local cache updates."""


@APP.command("update")
def update_command(
    days: int = typer.Option(7, "--days", min=1, help="How many recent days to fetch from ENTSO-E."),
) -> None:
    """CLI command to refresh local cached market data."""
    try:
        paths = update_local_data(days=days)
    except Exception as exc:  # pragma: no cover - cli guard
        typer.echo(f"Data update failed: {exc}", err=True)
        raise typer.Exit(code=1) from exc

    typer.echo(f"Saved prices: {paths['prices']}")
    typer.echo(f"Saved generation: {paths['generation']}")
    typer.echo(f"Saved load: {paths['load']}")


def main() -> None:
    APP()


if __name__ == "__main__":
    main()
