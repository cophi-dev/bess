from __future__ import annotations

import pytest
import pandas as pd

from open_autobidder.config import BESSConfig
from open_autobidder.optimizer import RevenueStackingConfig, optimize_bess_with_stacking


def _market_frame() -> pd.DataFrame:
    idx = pd.date_range("2026-01-01", periods=8, freq="1h", tz="Europe/Brussels")
    return pd.DataFrame(
        {
            "day_ahead_price_eur_mwh": [30.0, 20.0, 10.0, 85.0, 95.0, 70.0, 25.0, 60.0],
            "fcr_availability_eur_mw_h": [4.0, 4.5, 4.0, 3.0, 3.0, 3.5, 4.0, 4.0],
            "afrr_availability_eur_mw_h": [2.0, 2.5, 2.0, 1.5, 1.0, 2.0, 2.5, 2.0],
            "afrr_utilization_eur_mwh": [30.0, 32.0, 35.0, 40.0, 45.0, 38.0, 34.0, 30.0],
            "afrr_activation_ratio": [0.1, 0.2, 0.25, 0.15, 0.1, 0.2, 0.25, 0.2],
            "capacity_payment_eur_mw_h": [1.5] * 8,
            "congestion_signal": [0.0, 0.0, 0.3, 0.7, 1.0, 0.5, 0.0, 0.2],
            "congestion_bonus_eur_mwh": [12.0] * 8,
        },
        index=idx,
    )


def test_stacking_optimizer_respects_physical_limits() -> None:
    bess = BESSConfig(capacity_mwh=4.0, power_mw=2.0)
    result = optimize_bess_with_stacking(_market_frame(), bess)
    dispatch = result.dispatch

    combined_power = (
        dispatch["charge_mw"]
        + dispatch["discharge_mw"]
        + dispatch["reserve_fcr_mw"]
        + dispatch["reserve_afrr_mw"]
    )
    assert combined_power.max() <= bess.power_mw + 1e-6
    assert dispatch["soc_mwh"].min() >= (bess.capacity_mwh * bess.soc_min_fraction) - 1e-6
    assert dispatch["soc_mwh"].max() <= (bess.capacity_mwh * bess.soc_max_fraction) + 1e-6


def test_revenue_breakdown_sums_to_total_revenue() -> None:
    result = optimize_bess_with_stacking(_market_frame(), BESSConfig(capacity_mwh=4.0, power_mw=2.0))
    assert result.revenue_breakdown_eur is not None

    breakdown_total = sum(result.revenue_breakdown_eur.values())
    assert breakdown_total == pytest.approx(result.total_revenue_eur)
    assert result.dispatch["step_revenue_eur"].sum() == pytest.approx(result.total_revenue_eur)


def test_disabled_revenue_streams_contribute_zero() -> None:
    result = optimize_bess_with_stacking(
        _market_frame(),
        BESSConfig(capacity_mwh=4.0, power_mw=2.0),
        RevenueStackingConfig(
            enable_fcr=False,
            enable_afrr=False,
            enable_capacity_payment=False,
            enable_congestion_bonus=False,
        ),
    )

    assert result.revenue_breakdown_eur is not None
    assert result.revenue_breakdown_eur["fcr"] == pytest.approx(0.0)
    assert result.revenue_breakdown_eur["afrr_availability"] == pytest.approx(0.0)
    assert result.revenue_breakdown_eur["afrr_utilization"] == pytest.approx(0.0)
    assert result.revenue_breakdown_eur["capacity"] == pytest.approx(0.0)
    assert result.revenue_breakdown_eur["congestion_bonus"] == pytest.approx(0.0)
