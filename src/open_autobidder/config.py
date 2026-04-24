"""Configuration models for BESS, runtime, and optimization runs."""

from __future__ import annotations
import os

from pydantic import BaseModel, Field, field_validator


class BESSConfig(BaseModel):
    """
    Core BESS configuration for optimization.

    Defaults represent a Tesla Megapack 2XL-like setup:
    - Capacity: 3.9 MWh
    - Power: 1.95 MW
    - Round-trip efficiency: 92%
    """

    name: str = Field(default="Tesla Megapack 2XL")
    capacity_mwh: float = Field(default=3.9, gt=0, description="Usable energy capacity.")
    power_mw: float = Field(default=1.95, gt=0, description="Symmetric charge/discharge power.")
    rte: float = Field(default=0.92, gt=0, le=1, description="Round-trip efficiency (0..1).")
    soc_min_fraction: float = Field(default=0.1, ge=0, le=1)
    soc_max_fraction: float = Field(default=0.95, ge=0, le=1)
    initial_soc_fraction: float = Field(default=0.5, ge=0, le=1)
    final_soc_target_fraction: float = Field(
        default=0.5, ge=0, le=1, description="Target end-of-horizon state of charge."
    )
    timestep_hours: float = Field(default=1.0, gt=0, description="Optimization time step in hours.")

    @field_validator("soc_max_fraction")
    @classmethod
    def validate_soc_window(cls, v: float, info) -> float:
        """Ensure soc_max_fraction is strictly above soc_min_fraction."""
        soc_min = info.data.get("soc_min_fraction")
        if soc_min is not None and v <= soc_min:
            raise ValueError("soc_max_fraction must be greater than soc_min_fraction.")
        return v

    @field_validator("initial_soc_fraction", "final_soc_target_fraction")
    @classmethod
    def validate_soc_targets(cls, v: float, info) -> float:
        """Ensure SOC values sit inside the configured SOC window."""
        soc_min = info.data.get("soc_min_fraction")
        soc_max = info.data.get("soc_max_fraction")
        if soc_min is not None and v < soc_min:
            raise ValueError("SOC value must be >= soc_min_fraction.")
        if soc_max is not None and v > soc_max:
            raise ValueError("SOC value must be <= soc_max_fraction.")
        return v


class RunConfig(BaseModel):
    """Global run settings used by loaders and optimizer."""

    market_zone: str = Field(default="DE-LU")
    region_focus: str = Field(default="Northern Germany")
    currency: str = Field(default="EUR")
    default_fcr_availability_eur_mw_h: float = Field(default=5.0, ge=0)
    default_afrr_availability_eur_mw_h: float = Field(default=3.0, ge=0)
    default_afrr_utilization_eur_mwh: float = Field(default=35.0, ge=0)
    default_capacity_payment_eur_mw_h: float = Field(default=1.6, ge=0)


class DataRuntimeConfig(BaseModel):
    """Runtime data settings loaded from environment with safe defaults."""

    market_zone: str = Field(default="DE_LU", min_length=2)
    interval: str = Field(default="1h")

    @field_validator("market_zone")
    @classmethod
    def validate_market_zone(cls, v: str) -> str:
        normalized = v.strip().upper().replace("-", "_")
        if not normalized:
            raise ValueError("market_zone must not be empty.")
        return normalized

    @field_validator("interval")
    @classmethod
    def validate_interval(cls, v: str) -> str:
        normalized = v.strip().lower()
        if normalized not in {"1h"}:
            raise ValueError("Only hourly interval `1h` is supported in this MVP.")
        return normalized


def load_data_runtime_config() -> DataRuntimeConfig:
    """Load data runtime config from environment variables."""
    return DataRuntimeConfig(
        market_zone=os.getenv("OPENAUTOBIDDER_MARKET_ZONE", "DE_LU"),
        interval=os.getenv("OPENAUTOBIDDER_MARKET_INTERVAL", "1h"),
    )
