"""Linear optimization models for BESS arbitrage and revenue stacking."""

from __future__ import annotations

from dataclasses import dataclass
from math import sqrt

import pandas as pd
import pulp

from .config import BESSConfig


@dataclass
class OptimizationResult:
    """Container for optimized dispatch and KPI outputs."""

    dispatch: pd.DataFrame
    total_revenue_eur: float
    avg_charge_price_eur_mwh: float
    avg_discharge_price_eur_mwh: float
    charged_energy_mwh: float
    discharged_energy_mwh: float
    estimated_cycles: float
    revenue_breakdown_eur: dict[str, float] | None = None
    assumptions_summary: str = ""


def optimize_arbitrage(
    market_data: pd.DataFrame,
    bess: BESSConfig,
) -> OptimizationResult:
    """
    Maximize BESS arbitrage revenue using linear programming.

    Required market_data columns:
    - day_ahead_price_eur_mwh

    Model formulation:
    - Decision vars per time step: charge_mw, discharge_mw, soc_mwh
    - Objective: maximize sum(price * discharged_energy - price * charged_energy)
    - Constraints:
      - charge/discharge power limits
      - SOC transition with split efficiencies
      - SOC min/max bounds
      - fixed start and target end SOC
    """
    if "day_ahead_price_eur_mwh" not in market_data.columns:
        raise ValueError("market_data must include column 'day_ahead_price_eur_mwh'.")
    if market_data.empty:
        raise ValueError("market_data must not be empty.")

    prices = market_data["day_ahead_price_eur_mwh"].astype(float).tolist()
    n_steps = len(prices)
    dt = bess.timestep_hours

    charge_eff = sqrt(bess.rte)
    discharge_eff = sqrt(bess.rte)

    soc_min = bess.capacity_mwh * bess.soc_min_fraction
    soc_max = bess.capacity_mwh * bess.soc_max_fraction
    soc_start = bess.capacity_mwh * bess.initial_soc_fraction
    soc_end_target = bess.capacity_mwh * bess.final_soc_target_fraction

    problem = pulp.LpProblem("bess_arbitrage", pulp.LpMaximize)
    idx = range(n_steps)

    charge = pulp.LpVariable.dicts("charge_mw", idx, lowBound=0, upBound=bess.power_mw, cat="Continuous")
    discharge = pulp.LpVariable.dicts(
        "discharge_mw", idx, lowBound=0, upBound=bess.power_mw, cat="Continuous"
    )
    soc = pulp.LpVariable.dicts("soc_mwh", range(n_steps + 1), lowBound=soc_min, upBound=soc_max, cat="Continuous")

    problem += soc[0] == soc_start
    for t in idx:
        problem += (
            soc[t + 1]
            == soc[t] + charge[t] * charge_eff * dt - (discharge[t] / discharge_eff) * dt
        )
    problem += soc[n_steps] == soc_end_target

    objective_terms = [
        prices[t] * (discharge[t] * dt) - prices[t] * (charge[t] * dt)
        for t in idx
    ]
    problem += pulp.lpSum(objective_terms)

    solve_status = problem.solve(pulp.PULP_CBC_CMD(msg=False))
    if pulp.LpStatus[solve_status] != "Optimal":
        raise RuntimeError(f"Optimization failed with status: {pulp.LpStatus[solve_status]}")

    dispatch = market_data.copy()
    dispatch["charge_mw"] = [charge[t].value() or 0.0 for t in idx]
    dispatch["discharge_mw"] = [discharge[t].value() or 0.0 for t in idx]
    dispatch["soc_mwh"] = [soc[t + 1].value() or 0.0 for t in idx]
    dispatch["net_power_mw"] = dispatch["discharge_mw"] - dispatch["charge_mw"]
    dispatch["step_revenue_eur"] = (
        dispatch["day_ahead_price_eur_mwh"] * (dispatch["discharge_mw"] - dispatch["charge_mw"]) * dt
    )

    charged_energy = (dispatch["charge_mw"] * dt).sum()
    discharged_energy = (dispatch["discharge_mw"] * dt).sum()
    charge_cost = (dispatch["day_ahead_price_eur_mwh"] * dispatch["charge_mw"] * dt).sum()
    discharge_revenue = (dispatch["day_ahead_price_eur_mwh"] * dispatch["discharge_mw"] * dt).sum()

    avg_charge_price = charge_cost / charged_energy if charged_energy > 0 else 0.0
    avg_discharge_price = discharge_revenue / discharged_energy if discharged_energy > 0 else 0.0
    estimated_cycles = discharged_energy / bess.capacity_mwh if bess.capacity_mwh > 0 else 0.0

    return OptimizationResult(
        dispatch=dispatch,
        total_revenue_eur=float(dispatch["step_revenue_eur"].sum()),
        avg_charge_price_eur_mwh=float(avg_charge_price),
        avg_discharge_price_eur_mwh=float(avg_discharge_price),
        charged_energy_mwh=float(charged_energy),
        discharged_energy_mwh=float(discharged_energy),
        estimated_cycles=float(estimated_cycles),
        revenue_breakdown_eur={"arbitrage": float(dispatch["step_revenue_eur"].sum())},
        assumptions_summary=_format_assumptions_summary(
            market_data=market_data,
            bess=bess,
            enabled_streams=["day-ahead arbitrage"],
        ),
    )


@dataclass
class RevenueStackingConfig:
    """Assumptions for simplified ancillary/capacity/congestion revenue stacking."""

    enable_fcr: bool = True
    enable_afrr: bool = True
    enable_capacity_payment: bool = True
    enable_congestion_bonus: bool = True
    capacity_contract_share_of_power: float = 0.3


def _column_or_default(
    market_data: pd.DataFrame, column: str, default_value: float
) -> pd.Series:
    if column in market_data.columns:
        return market_data[column].astype(float)
    return pd.Series(default_value, index=market_data.index, dtype=float)


def _format_assumptions_summary(
    *,
    market_data: pd.DataFrame,
    bess: BESSConfig,
    enabled_streams: list[str],
    capacity_contract_share: float | None = None,
) -> str:
    """Create a concise, user-facing summary of the current optimization assumptions."""

    epr_hours = bess.capacity_mwh / bess.power_mw if bess.power_mw > 0 else 0.0
    horizon_hours = len(market_data) * bess.timestep_hours
    soc_window = f"{bess.soc_min_fraction:.0%}-{bess.soc_max_fraction:.0%}"
    stream_text = ", ".join(enabled_streams) if enabled_streams else "day-ahead arbitrage only"
    capacity_text = (
        f" Capacity payment uses {capacity_contract_share:.0%} of configured MW."
        if capacity_contract_share is not None
        else ""
    )
    return (
        f"Run assumptions: {bess.capacity_mwh:.1f} MWh / {bess.power_mw:.1f} MW "
        f"({epr_hours:.1f}h EPR), {horizon_hours:.0f}h horizon, hourly timestep, "
        f"{bess.rte:.0%} round-trip efficiency, SOC window {soc_window}, "
        f"start/end SOC {bess.initial_soc_fraction:.0%}/{bess.final_soc_target_fraction:.0%}. "
        f"Enabled revenue streams: {stream_text}.{capacity_text} "
        "FCR, aFRR, capacity, and congestion values are educational assumptions unless backed by input data."
    )


def optimize_bess_with_stacking(
    market_data: pd.DataFrame,
    bess: BESSConfig,
    stacking: RevenueStackingConfig | None = None,
) -> OptimizationResult:
    """
    Optimize BESS dispatch with stacked revenue streams.

    Revenue streams:
    - Day-ahead arbitrage (same physical core as optimize_arbitrage)
    - FCR availability payment (EUR/MW/h)
    - aFRR availability + utilization payment (EUR/MW/h and activation-adjusted EUR/MWh)
    - Capacity/availability payment based on contracted power share (EUR/MW/h)
    - Optional congestion bonus on discharge during congestion signal windows
    """
    if "day_ahead_price_eur_mwh" not in market_data.columns:
        raise ValueError("market_data must include column 'day_ahead_price_eur_mwh'.")
    if market_data.empty:
        raise ValueError("market_data must not be empty.")

    stacking = stacking or RevenueStackingConfig()
    dt = bess.timestep_hours
    n_steps = len(market_data)
    idx = range(n_steps)

    prices = market_data["day_ahead_price_eur_mwh"].astype(float).tolist()
    fcr_availability_eur_mw_h = _column_or_default(market_data, "fcr_availability_eur_mw_h", 0.0).tolist()
    afrr_availability_eur_mw_h = _column_or_default(market_data, "afrr_availability_eur_mw_h", 0.0).tolist()
    afrr_utilization_eur_mwh = _column_or_default(market_data, "afrr_utilization_eur_mwh", 0.0).tolist()
    afrr_activation_ratio = _column_or_default(market_data, "afrr_activation_ratio", 0.0).clip(0.0, 1.0).tolist()
    capacity_payment_eur_mw_h = _column_or_default(market_data, "capacity_payment_eur_mw_h", 0.0).tolist()
    congestion_bonus_eur_mwh = _column_or_default(market_data, "congestion_bonus_eur_mwh", 0.0).tolist()
    congestion_signal = _column_or_default(market_data, "congestion_signal", 0.0).clip(0.0, 1.0).tolist()

    charge_eff = sqrt(bess.rte)
    discharge_eff = sqrt(bess.rte)
    soc_min = bess.capacity_mwh * bess.soc_min_fraction
    soc_max = bess.capacity_mwh * bess.soc_max_fraction
    soc_start = bess.capacity_mwh * bess.initial_soc_fraction
    soc_end_target = bess.capacity_mwh * bess.final_soc_target_fraction

    problem = pulp.LpProblem("bess_revenue_stacking", pulp.LpMaximize)

    charge = pulp.LpVariable.dicts("charge_mw", idx, lowBound=0, upBound=bess.power_mw, cat="Continuous")
    discharge = pulp.LpVariable.dicts("discharge_mw", idx, lowBound=0, upBound=bess.power_mw, cat="Continuous")
    reserve_fcr = pulp.LpVariable.dicts("reserve_fcr_mw", idx, lowBound=0, upBound=bess.power_mw, cat="Continuous")
    reserve_afrr = pulp.LpVariable.dicts("reserve_afrr_mw", idx, lowBound=0, upBound=bess.power_mw, cat="Continuous")
    soc = pulp.LpVariable.dicts("soc_mwh", range(n_steps + 1), lowBound=soc_min, upBound=soc_max, cat="Continuous")

    contracted_capacity_mw = bess.power_mw * max(0.0, min(1.0, stacking.capacity_contract_share_of_power))

    problem += soc[0] == soc_start
    for t in idx:
        problem += soc[t + 1] == soc[t] + charge[t] * charge_eff * dt - (discharge[t] / discharge_eff) * dt
        # Shared inverter limit across energy dispatch and reserve commitments.
        problem += charge[t] + discharge[t] + reserve_fcr[t] + reserve_afrr[t] <= bess.power_mw
        # Reserve must be physically deliverable for one full time step.
        problem += soc[t] - soc_min >= (reserve_fcr[t] + reserve_afrr[t]) * dt
        problem += soc_max - soc[t] >= (reserve_fcr[t] + reserve_afrr[t]) * dt
    problem += soc[n_steps] == soc_end_target

    objective_terms = []
    for t in idx:
        arbitrage_term = prices[t] * (discharge[t] - charge[t]) * dt
        fcr_term = reserve_fcr[t] * fcr_availability_eur_mw_h[t] * dt if stacking.enable_fcr else 0.0
        afrr_avail_term = reserve_afrr[t] * afrr_availability_eur_mw_h[t] * dt if stacking.enable_afrr else 0.0
        afrr_util_term = (
            reserve_afrr[t] * afrr_activation_ratio[t] * afrr_utilization_eur_mwh[t] * dt
            if stacking.enable_afrr
            else 0.0
        )
        capacity_term = (
            contracted_capacity_mw * capacity_payment_eur_mw_h[t] * dt if stacking.enable_capacity_payment else 0.0
        )
        congestion_term = (
            discharge[t] * congestion_signal[t] * congestion_bonus_eur_mwh[t] * dt
            if stacking.enable_congestion_bonus
            else 0.0
        )
        objective_terms.append(
            arbitrage_term + fcr_term + afrr_avail_term + afrr_util_term + capacity_term + congestion_term
        )
    problem += pulp.lpSum(objective_terms)

    solve_status = problem.solve(pulp.PULP_CBC_CMD(msg=False))
    if pulp.LpStatus[solve_status] != "Optimal":
        raise RuntimeError(f"Optimization failed with status: {pulp.LpStatus[solve_status]}")

    dispatch = market_data.copy()
    dispatch["charge_mw"] = [charge[t].value() or 0.0 for t in idx]
    dispatch["discharge_mw"] = [discharge[t].value() or 0.0 for t in idx]
    dispatch["reserve_fcr_mw"] = [reserve_fcr[t].value() or 0.0 for t in idx]
    dispatch["reserve_afrr_mw"] = [reserve_afrr[t].value() or 0.0 for t in idx]
    dispatch["soc_mwh"] = [soc[t + 1].value() or 0.0 for t in idx]
    dispatch["net_power_mw"] = dispatch["discharge_mw"] - dispatch["charge_mw"]

    dispatch["arbitrage_revenue_eur"] = dispatch["day_ahead_price_eur_mwh"] * dispatch["net_power_mw"] * dt
    dispatch["fcr_revenue_eur"] = (
        dispatch["reserve_fcr_mw"] * dispatch["fcr_availability_eur_mw_h"] * dt if stacking.enable_fcr else 0.0
    )
    dispatch["afrr_availability_revenue_eur"] = (
        dispatch["reserve_afrr_mw"] * dispatch["afrr_availability_eur_mw_h"] * dt if stacking.enable_afrr else 0.0
    )
    dispatch["afrr_utilization_revenue_eur"] = (
        dispatch["reserve_afrr_mw"]
        * dispatch["afrr_activation_ratio"]
        * dispatch["afrr_utilization_eur_mwh"]
        * dt
        if stacking.enable_afrr
        else 0.0
    )
    dispatch["capacity_revenue_eur"] = (
        contracted_capacity_mw * dispatch["capacity_payment_eur_mw_h"] * dt if stacking.enable_capacity_payment else 0.0
    )
    dispatch["congestion_bonus_revenue_eur"] = (
        dispatch["discharge_mw"] * dispatch["congestion_signal"] * dispatch["congestion_bonus_eur_mwh"] * dt
        if stacking.enable_congestion_bonus
        else 0.0
    )
    dispatch["step_revenue_eur"] = (
        dispatch["arbitrage_revenue_eur"]
        + dispatch["fcr_revenue_eur"]
        + dispatch["afrr_availability_revenue_eur"]
        + dispatch["afrr_utilization_revenue_eur"]
        + dispatch["capacity_revenue_eur"]
        + dispatch["congestion_bonus_revenue_eur"]
    )

    charged_energy = float((dispatch["charge_mw"] * dt).sum())
    discharged_energy = float((dispatch["discharge_mw"] * dt).sum())
    charge_cost = float((dispatch["day_ahead_price_eur_mwh"] * dispatch["charge_mw"] * dt).sum())
    discharge_revenue = float((dispatch["day_ahead_price_eur_mwh"] * dispatch["discharge_mw"] * dt).sum())
    avg_charge_price = charge_cost / charged_energy if charged_energy > 0 else 0.0
    avg_discharge_price = discharge_revenue / discharged_energy if discharged_energy > 0 else 0.0
    estimated_cycles = discharged_energy / bess.capacity_mwh if bess.capacity_mwh > 0 else 0.0

    revenue_breakdown = {
        "arbitrage": float(dispatch["arbitrage_revenue_eur"].sum()),
        "fcr": float(dispatch["fcr_revenue_eur"].sum()),
        "afrr_availability": float(dispatch["afrr_availability_revenue_eur"].sum()),
        "afrr_utilization": float(dispatch["afrr_utilization_revenue_eur"].sum()),
        "capacity": float(dispatch["capacity_revenue_eur"].sum()),
        "congestion_bonus": float(dispatch["congestion_bonus_revenue_eur"].sum()),
    }
    enabled_streams = ["day-ahead arbitrage"]
    if stacking.enable_fcr:
        enabled_streams.append("FCR availability")
    if stacking.enable_afrr:
        enabled_streams.append("aFRR availability + activation")
    if stacking.enable_capacity_payment:
        enabled_streams.append("capacity availability")
    if stacking.enable_congestion_bonus:
        enabled_streams.append("congestion proxy bonus")

    return OptimizationResult(
        dispatch=dispatch,
        total_revenue_eur=float(dispatch["step_revenue_eur"].sum()),
        avg_charge_price_eur_mwh=float(avg_charge_price),
        avg_discharge_price_eur_mwh=float(avg_discharge_price),
        charged_energy_mwh=charged_energy,
        discharged_energy_mwh=discharged_energy,
        estimated_cycles=float(estimated_cycles),
        revenue_breakdown_eur=revenue_breakdown,
        assumptions_summary=_format_assumptions_summary(
            market_data=market_data,
            bess=bess,
            enabled_streams=enabled_streams,
            capacity_contract_share=contracted_capacity_mw / bess.power_mw if bess.power_mw > 0 else 0.0,
        ),
    )
