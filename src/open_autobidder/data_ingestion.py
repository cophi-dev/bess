"""Automatic market data ingestion from ENTSO-E."""

from __future__ import annotations

import logging
import os
from datetime import UTC, datetime
from pathlib import Path

import pandas as pd
import typer
from entsoe import EntsoePandasClient

LOGGER = logging.getLogger(__name__)
APP = typer.Typer(help="ENTSO-E data ingestion CLI for OpenAutobidder-DE.")
COUNTRY_CODE = "DE_LU"
ENTSOE_TOKEN_ENV = "ENTSOE_API_TOKEN"
PROCESSED_DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "processed"
SAMPLE_DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "sample"
SAMPLE_PRICES_PATH = SAMPLE_DATA_DIR / "prices_sample.csv"
SAMPLE_GENERATION_PATH = SAMPLE_DATA_DIR / "generation_sample.csv"


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
    df.index.name = "timestamp"
    return df


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


def fetch_recent_prices(days: int = 7) -> pd.DataFrame:
    """
    Fetch day-ahead prices for Germany (DE-LU bidding zone) from ENTSO-E.

    Returns a dataframe indexed by timestamp with column:
    - day_ahead_price_eur_mwh
    """
    client = _get_entsoe_client()
    start, end = _time_window(days=days)
    series = client.query_day_ahead_prices(country_code=COUNTRY_CODE, start=start, end=end)
    prices_df = series.to_frame(name="day_ahead_price_eur_mwh")
    return _standardize_index(prices_df)


def fetch_recent_generation(days: int = 7) -> pd.DataFrame:
    """
    Fetch wind and solar generation for Germany (DE-LU bidding zone) from ENTSO-E.

    Returns a dataframe indexed by timestamp with columns:
    - wind_generation_mw
    - solar_generation_mw
    """
    client = _get_entsoe_client()
    start, end = _time_window(days=days)
    raw_generation = client.query_generation(country_code=COUNTRY_CODE, start=start, end=end)
    generation_df = raw_generation.to_frame() if isinstance(raw_generation, pd.Series) else raw_generation
    generation_df = _standardize_index(generation_df)
    return _select_generation_columns(generation_df)


def _save_snapshot(df: pd.DataFrame, dataset_name: str, timestamp_utc: datetime) -> Path:
    PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)
    stamp = timestamp_utc.strftime("%Y%m%dT%H%M%SZ")
    output_path = PROCESSED_DATA_DIR / f"{dataset_name}_{stamp}.parquet"
    df.to_parquet(output_path)
    return output_path


def _latest_file(pattern: str) -> Path:
    candidates = sorted(PROCESSED_DATA_DIR.glob(pattern), key=lambda p: p.stat().st_mtime, reverse=True)
    if not candidates:
        raise FileNotFoundError(
            f"No cached files found in `{PROCESSED_DATA_DIR}` for pattern `{pattern}`. "
            "Run `python -m open_autobidder.data_ingestion update` first."
        )
    return candidates[0]


def _read_frame(path: Path) -> pd.DataFrame:
    if path.suffix == ".parquet":
        frame = pd.read_parquet(path)
    else:
        frame = pd.read_csv(path, parse_dates=["timestamp"]).set_index("timestamp")
    return _standardize_index(frame)


def update_local_data(days: int = 7) -> dict[str, Path]:
    """
    Download recent ENTSO-E prices/generation and cache snapshots as Parquet.
    """
    fetched_at = datetime.now(UTC)
    prices_df = fetch_recent_prices(days=days)
    generation_df = fetch_recent_generation(days=days)

    prices_path = _save_snapshot(prices_df, "prices", fetched_at)
    generation_path = _save_snapshot(generation_df, "generation", fetched_at)

    LOGGER.info("Saved prices to %s", prices_path)
    LOGGER.info("Saved generation to %s", generation_path)
    return {"prices": prices_path, "generation": generation_path}


def load_sample_data() -> dict[str, pd.DataFrame]:
    """
    Load checked-in sample dataset used when live API updates are unavailable.
    """
    if not SAMPLE_PRICES_PATH.exists() or not SAMPLE_GENERATION_PATH.exists():
        raise FileNotFoundError(
            "Sample dataset is missing. Expected files: "
            f"`{SAMPLE_PRICES_PATH}` and `{SAMPLE_GENERATION_PATH}`."
        )
    return {
        "prices": _read_frame(SAMPLE_PRICES_PATH),
        "generation": _read_frame(SAMPLE_GENERATION_PATH),
    }


def load_latest_data(fallback_to_sample: bool = True) -> dict[str, pd.DataFrame]:
    """
    Load the most recent cached prices/generation data.

    If no cached snapshots are available and ``fallback_to_sample`` is true,
    checked-in sample CSV data is returned.
    """
    try:
        latest_prices = _latest_file("prices_*.parquet")
        latest_generation = _latest_file("generation_*.parquet")
    except FileNotFoundError:
        if fallback_to_sample:
            return load_sample_data()
        raise

    return {
        "prices": _read_frame(latest_prices),
        "generation": _read_frame(latest_generation),
    }


def latest_data_timestamp() -> datetime | None:
    """
    Return UTC timestamp of the newest cached snapshot, if available.
    """
    try:
        latest_prices = _latest_file("prices_*.parquet")
    except FileNotFoundError:
        return None
    return datetime.fromtimestamp(latest_prices.stat().st_mtime, tz=UTC)


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


def main() -> None:
    APP()


if __name__ == "__main__":
    main()
