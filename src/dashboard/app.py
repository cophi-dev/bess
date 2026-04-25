"""Main entry point for the OpenAutobidder-DE Streamlit app."""

from __future__ import annotations

import sys
from pathlib import Path

import streamlit as st

# Ensure `src/` is importable when running `streamlit run src/dashboard/app.py`.
PROJECT_SRC = Path(__file__).resolve().parents[1]
if str(PROJECT_SRC) not in sys.path:
    sys.path.insert(0, str(PROJECT_SRC))

from dashboard.theme import apply_design_theme, render_education_footer


PAGES = [
    ("Mission", "pages/01_Mission.py", "Project vision and educational framing."),
    ("Data", "pages/02_Data.py", "Market-data sources and quality notes."),
    ("Simulator", "pages/03_Simulator.py", "Run optimization, charts, KPIs, and revenue breakdown."),
    ("VNB Matrix", "pages/04_VNB_Matrix.py", "Grid-operator decision lens."),
]


def main() -> None:
    """Render the landing page; Streamlit exposes page files in the sidebar."""
    st.set_page_config(page_title="OpenAutobidder-DE", layout="wide")
    apply_design_theme(theme_mode="warm")

    st.sidebar.markdown("### BESS Kompass")
    st.sidebar.caption("Navigate the educational app.")
    st.sidebar.page_link("app.py", label="Home")
    for title, path, _ in PAGES:
        st.sidebar.page_link(path, label=title)
    st.sidebar.markdown("---")
    for title, _, description in PAGES:
        st.sidebar.markdown(f"**{title}**")
        st.sidebar.caption(description)

    st.markdown(
        """
        <section class='oa-header-shell'>
            <p class='oa-header-kicker'>BESS Kompass</p>
            <h1 class='oa-header-title'>OpenAutobidder-DE</h1>
            <p class='oa-header-subtitle'>BESS Kompass – Educational Simulator</p>
        </section>
        """,
        unsafe_allow_html=True,
    )

    st.markdown(
        """
        Welcome to the educational Streamlit version of **BESS Kompass**. The app now uses
        Streamlit's native multi-page structure so concepts, data context, simulation, and
        grid-operator framing can evolve independently.
        """
    )

    col_mission, col_data, col_simulator, col_vnb = st.columns(4)
    cards = [
        (col_mission, "01", "Mission", "Why OpenAutobidder-DE exists and how it supports transparent BESS learning."),
        (col_data, "02", "Data", "Real MaStR context for German BESS capacity, power, and storage duration."),
        (col_simulator, "03", "Simulator", "Current optimizer workflow with settings, KPIs, charts, and revenue stack."),
        (col_vnb, "04", "VNB Matrix", "Local-grid decision lens for market attractiveness and grid impact."),
    ]
    for column, number, title, body in cards:
        with column:
            st.markdown(
                f"""
                <div class='oa-hero-tile'>
                    <div class='oa-hero-k'>{number}</div>
                    <div class='oa-hero-v'>{title}</div>
                    <div class='oa-hero-s'>{body}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

    st.info("Open the Simulator page from the sidebar to run the existing optimization workflow.")
    render_education_footer()


if __name__ == "__main__":
    main()
