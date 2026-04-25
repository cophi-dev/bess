"""Mission page for the BESS Kompass educational app."""

from __future__ import annotations

import sys
from pathlib import Path

import streamlit as st

PROJECT_SRC = Path(__file__).resolve().parents[2]
if str(PROJECT_SRC) not in sys.path:
    sys.path.insert(0, str(PROJECT_SRC))

from dashboard.theme import render_education_footer, apply_design_theme


def main() -> None:
    """Render the project mission and vision."""
    st.set_page_config(page_title="Mission | OpenAutobidder-DE", layout="wide")
    apply_design_theme(theme_mode="warm")

    st.markdown(
        """
        <section class='oa-header-shell'>
            <p class='oa-header-kicker'>Mission</p>
            <h1 class='oa-header-title'>OpenAutobidder-DE</h1>
            <p class='oa-header-subtitle'>BESS Kompass – Educational Simulator</p>
        </section>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(
        """
        **OpenAutobidder-DE** is an inspectable learning simulator for grid-scale battery
        energy storage in Germany. It helps teams, students, and decision-makers understand
        why storage value comes from a stack of market signals rather than from arbitrage alone.

        The vision for **BESS Kompass** is orientation first: explain the market context,
        make data assumptions visible, let users run the open model, and connect the dispatch
        result back to practical distribution-grid decisions.
        """
    )

    col_market, col_model, col_grid = st.columns(3)
    with col_market:
        st.markdown("### Market Learning")
        st.write("Understand prices, availability payments, congestion signals, and revenue stacking.")
    with col_model:
        st.markdown("### Open Model")
        st.write("Keep the optimizer transparent so assumptions and constraints can be inspected.")
    with col_grid:
        st.markdown("### Grid Context")
        st.write("Frame market-strong dispatch against local grid usefulness and constraints.")

    render_education_footer()


main()
