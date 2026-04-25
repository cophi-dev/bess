"""VNB Matrix page placeholder for the BESS Kompass educational app."""

from __future__ import annotations

import sys
from pathlib import Path

import streamlit as st

PROJECT_SRC = Path(__file__).resolve().parents[2]
if str(PROJECT_SRC) not in sys.path:
    sys.path.insert(0, str(PROJECT_SRC))

from dashboard.theme import apply_design_theme


def main() -> None:
    """Render the VNB Matrix placeholder."""
    st.set_page_config(page_title="VNB Matrix | OpenAutobidder-DE", layout="wide")
    apply_design_theme(theme_mode="warm")

    st.markdown(
        """
        <section class='oa-header-shell'>
            <p class='oa-header-kicker'>VNB Matrix</p>
            <h1 class='oa-header-title'>Grid Decision Lens</h1>
            <p class='oa-header-subtitle'>BESS Kompass – Educational Simulator</p>
        </section>
        """,
        unsafe_allow_html=True,
    )

    st.info("Placeholder: local-grid usefulness, market attractiveness, and VNB decision matrix will live here.")


main()
