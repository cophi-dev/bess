"""Real MaStR data page for the BESS Kompass educational app."""

from __future__ import annotations

import sys
from pathlib import Path

import pandas as pd
import plotly.express as px
import streamlit as st

PROJECT_SRC = Path(__file__).resolve().parents[2]
if str(PROJECT_SRC) not in sys.path:
    sys.path.insert(0, str(PROJECT_SRC))

from dashboard.theme import DESIGN_TOKENS, apply_design_theme, badge_html, render_education_footer
from open_autobidder.mastr import load_mastr_bess_stats


def _section(stats: pd.DataFrame, name: str) -> pd.DataFrame:
    """Return one sorted stat section from the processed MaStR Parquet file."""

    return stats.loc[stats["section"] == name].sort_values("sort_order").copy()


def _summary_value(summary: pd.DataFrame, label: str) -> float:
    match = summary.loc[summary["label"] == label, "value"]
    if match.empty:
        raise ValueError(f"Missing MaStR summary row: {label}")
    return float(match.iloc[0])


def _plot_layout(fig) -> None:
    """Apply DESIGN.md chart styling."""

    fig.update_layout(
        paper_bgcolor=DESIGN_TOKENS["background"],
        plot_bgcolor="rgba(255,255,255,0)",
        font=dict(color=DESIGN_TOKENS["text"]),
        margin=dict(l=12, r=12, t=42, b=28),
        hoverlabel=dict(
            bgcolor=DESIGN_TOKENS["card_background"],
            bordercolor=DESIGN_TOKENS["card_border"],
            font=dict(color=DESIGN_TOKENS["text"]),
        ),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="left",
            x=0,
            bgcolor="rgba(0,0,0,0)",
        ),
    )


def main() -> None:
    """Render the German MaStR BESS data page."""

    st.set_page_config(page_title="Data | OpenAutobidder-DE", layout="wide")
    apply_design_theme(theme_mode="warm")
    stats = load_mastr_bess_stats()
    summary = _section(stats, "summary")
    epr_distribution = _section(stats, "epr_distribution")
    bundesland_top5 = _section(stats, "bundesland_top5")
    segments = _section(stats, "segment")

    total_capacity_mwh = _summary_value(summary, "Total installed storage capacity")
    total_power_mw = _summary_value(summary, "Total installed storage power")
    registered_systems = _summary_value(summary, "Registered BESS units")
    average_epr_h = _summary_value(summary, "Average energy-to-power ratio")

    st.markdown(
        """
        <section class='oa-header-shell'>
            <p class='oa-header-kicker'>Real Data · Germany</p>
            <h1 class='oa-header-title'>Real BESS Data from Germany – Marktstammdatenregister (MaStR)</h1>
            <p class='oa-header-subtitle'>
                A compact educational view of registered German battery storage systems:
                installed capacity, power, storage duration, regional additions, and segment mix.
            </p>
        </section>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(
        (
            "<div class='oa-badge-row'>"
            f"{badge_html('Real Data – MaStR', 'real', 'Bundesnetzagentur aggregates')}"
            "</div>"
            "<div class='oa-education-note'>"
            "Diese Seite zeigt reale, verarbeitete MaStR-Aggregate. Die Werte dienen zur Einordnung: "
            "Wie gross ist der deutsche Batteriespeicherbestand, welche Dauerklassen dominieren, "
            "und welche Groessenordnungen sind fuer Simulationen plausibel?"
            "</div>"
        ),
        unsafe_allow_html=True,
    )

    col_capacity, col_power, col_systems, col_epr = st.columns(4)
    col_capacity.metric(
        "Total Capacity",
        f"{total_capacity_mwh / 1000:,.2f} GWh",
        help="Usable storage capacity registered for German battery storage systems.",
    )
    col_power.metric(
        "Total Power",
        f"{total_power_mw / 1000:,.2f} GW",
        help="Registered net nominal power of German battery storage systems.",
    )
    col_systems.metric(
        "Number of Systems",
        f"{registered_systems / 1_000_000:,.1f} million",
        help="Rounded count of registered BESS units. Home storage dominates the unit count.",
    )
    col_epr.metric(
        "Average EPR",
        f"{average_epr_h:,.2f} h",
        help="Energy-to-power ratio: MWh divided by MW. It approximates storage duration at full power.",
    )

    st.markdown(
        """
        ### How to read this real-data page
        The MaStR is Germany's official registry for generation, storage, and energy-system units.
        For batteries, three numbers matter most: **MWh** says how much energy can be stored,
        **MW** says how fast the system can charge or discharge, and **EPR** connects both as
        a simple duration signal. A 20 MWh / 10 MW battery is a 2 hour system.
        """
    )

    st.markdown("<div class='oa-section-spacer'></div>", unsafe_allow_html=True)
    chart_left, chart_right = st.columns([1.25, 1.0])
    with chart_left:
        st.markdown(
            f"<div class='oa-badge-row'>{badge_html('Real Data – MaStR', 'real')}</div>",
            unsafe_allow_html=True,
        )
        state_fig = px.bar(
            bundesland_top5,
            x="label",
            y="capacity_mwh",
            color="label",
            title="Capacity Additions by Bundesland · Top 5 in Q1 2026",
            labels={"label": "Bundesland", "capacity_mwh": "Capacity (MWh)"},
            color_discrete_sequence=[
                DESIGN_TOKENS["primary"],
                DESIGN_TOKENS["highlight"],
                DESIGN_TOKENS["accent"],
                "#6F826A",
                "#B17A56",
            ],
            custom_data=["power_mw", "systems", "notes"],
        )
        state_fig.update_traces(
            hovertemplate=(
                "<b>%{x}</b><br>"
                "Capacity: %{y:,.1f} MWh<br>"
                "Power: %{customdata[0]:,.1f} MW<br>"
                "Systems: %{customdata[1]:,.0f}<br>"
                "%{customdata[2]}<extra></extra>"
            )
        )
        _plot_layout(state_fig)
        st.plotly_chart(state_fig, width="stretch", config={"displaylogo": False})
        st.caption("Real Data – MaStR: Bundesland chart shows Q1 2026 newly commissioned capacity, not cumulative stock.")

    with chart_right:
        st.markdown(
            f"<div class='oa-badge-row'>{badge_html('Real Data – MaStR', 'real')}</div>",
            unsafe_allow_html=True,
        )
        epr_fig = px.bar(
            epr_distribution,
            x="label",
            y="share_pct",
            color="label",
            title="Distribution by Storage Duration (EPR)",
            labels={"label": "EPR bucket", "share_pct": "Capacity share (%)"},
            color_discrete_sequence=[DESIGN_TOKENS["highlight"], DESIGN_TOKENS["accent"], DESIGN_TOKENS["primary"]],
            custom_data=["capacity_mwh", "notes"],
        )
        epr_fig.update_traces(
            hovertemplate=(
                "<b>%{x}</b><br>"
                "Capacity share: %{y:,.1f}%<br>"
                "Capacity: %{customdata[0]:,.0f} MWh<br>"
                "%{customdata[1]}<extra></extra>"
            )
        )
        _plot_layout(epr_fig)
        st.plotly_chart(epr_fig, width="stretch", config={"displaylogo": False})
        st.caption("Real Data – MaStR: packaged EPR buckets are segment-derived; raw MaStR processing can produce exact unit-level buckets.")

    segments_chart = segments.copy()
    segments_chart["systems_display"] = segments_chart["systems"].apply(
        lambda value: "not separately reported" if pd.isna(value) else f"{value:,.0f}"
    )
    pie_fig = px.pie(
        segments_chart,
        names="label",
        values="capacity_mwh",
        title="Home vs Commercial vs Large-scale Storage",
        hole=0.45,
        color_discrete_sequence=[DESIGN_TOKENS["highlight"], DESIGN_TOKENS["accent"], DESIGN_TOKENS["primary"]],
        custom_data=["share_pct", "systems_display", "notes"],
    )
    pie_fig.update_traces(
        textinfo="label+percent",
        hovertemplate=(
            "<b>%{label}</b><br>"
            "Capacity: %{value:,.0f} MWh<br>"
            "Share: %{customdata[0]:,.1f}%<br>"
            "Systems: %{customdata[1]}<br>"
            "%{customdata[2]}<extra></extra>"
        ),
    )
    _plot_layout(pie_fig)
    st.markdown(
        f"<div class='oa-badge-row'>{badge_html('Real Data – MaStR', 'real')}</div>",
        unsafe_allow_html=True,
    )
    st.plotly_chart(pie_fig, width="stretch", config={"displaylogo": False})

    st.markdown(
        """
        ### Why this matters for simulation
        Germany's registered battery fleet is mostly small home storage by count, while large-scale
        projects contribute a growing share of capacity. For market dispatch simulations, the **EPR**
        is the useful bridge: it tells you whether a battery is built for short services, daily price
        shifting, or longer congestion and balancing use cases.
        """
    )

    st.info("Source: Bundesnetzagentur – MaStR, Stand April 2026")
    render_education_footer()


main()
