"""Shared dashboard theming based on DESIGN.md tokens."""

from __future__ import annotations

import streamlit as st

DESIGN_TOKENS = {
    "primary": "#2E4A3E",
    "secondary": "#F1EDE5",
    "accent": "#C9A86C",
    "highlight": "#8B9A7D",
    "background": "#F9F6F0",
    "text": "#2C2C2C",
    "text_secondary": "#5C5C5C",
    "success": "#4A7C59",
    "warning": "#C9A86C",
    "error": "#B85C38",
    "card_border": "#E7DED1",
    "card_background": "#FFFFFF",
    "shadow": "0 8px 24px rgba(52, 42, 26, 0.08)",
}


def badge_html(label: str, variant: str, detail: str | None = None) -> str:
    """Return a shared data/assumption badge using the DESIGN.md palette."""

    detail_html = f"<span>{detail}</span>" if detail else ""
    return f"<span class='oa-badge oa-badge-{variant}'>{label}{detail_html}</span>"


def render_education_footer() -> None:
    """Render the shared educational disclaimer required on every page."""

    st.markdown(
        (
            "<div class='oa-education-footer'>"
            "Dies ist ein Bildungswerkzeug fuer BESS-Markt- und Netzverstaendnis. "
            "Keine Handels-, Investitions- oder Netzanschlussberatung; Ergebnisse sind vereinfachte Modell- und Lernannahmen."
            "</div>"
        ),
        unsafe_allow_html=True,
    )


def apply_design_theme(theme_mode: str = "warm") -> None:
    """Apply shared dashboard styles from DESIGN.md tokens."""
    tokens = DESIGN_TOKENS
    st.markdown(
        f"""
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700&display=swap');

            :root {{
                --oa-primary: {tokens["primary"]};
                --oa-secondary: {tokens["secondary"]};
                --oa-accent: {tokens["accent"]};
                --oa-highlight: {tokens["highlight"]};
                --oa-background: {tokens["background"]};
                --oa-text: {tokens["text"]};
                --oa-text-secondary: {tokens["text_secondary"]};
                --oa-success: {tokens["success"]};
                --oa-warning: {tokens["warning"]};
                --oa-error: {tokens["error"]};
                --oa-card-border: {tokens["card_border"]};
                --oa-card-background: {tokens["card_background"]};
                --oa-shadow: {tokens["shadow"]};
            }}

            html, body, [class*="css"] {{
                background-color: var(--oa-background);
                color: var(--oa-text);
                font-family: Inter, system-ui, -apple-system, sans-serif;
                line-height: 1.65;
            }}

            .stApp,
            div[data-testid="stAppViewContainer"],
            section[data-testid="stMain"],
            div[data-testid="stMainBlockContainer"] {{
                background-color: var(--oa-background);
                color: var(--oa-text);
            }}

            div[data-testid="stMainBlockContainer"] {{
                max-width: 1420px;
                padding-top: 3.6rem;
                padding-bottom: 5rem;
                padding-left: 3rem;
                padding-right: 3rem;
            }}

            header[data-testid="stHeader"],
            div[data-testid="stToolbar"] {{
                background: var(--oa-background);
            }}

            div[data-testid="stBottomBlockContainer"] {{
                background: var(--oa-background);
                border-top: 1px solid var(--oa-card-border);
            }}

            h1, h2, h3, h4, h5, h6, p, label, span, div, small {{
                color: var(--oa-text);
            }}

            h1, h2, h3 {{
                font-family: "Playfair Display", Georgia, serif;
                letter-spacing: 0.01em;
                line-height: 1.25;
            }}

            p, label, span, div, small, li {{
                font-family: Inter, system-ui, -apple-system, sans-serif;
            }}

            .stCaption {{
                color: var(--oa-text-secondary);
            }}

            section[data-testid="stSidebar"] {{
                background-color: var(--oa-secondary);
                border-right: 1px solid var(--oa-card-border);
                padding-top: 1.2rem;
                min-width: 280px !important;
                max-width: 280px !important;
            }}

            section[data-testid="stSidebar"] > div {{
                width: 280px !important;
            }}

            section[data-testid="stSidebar"] div[data-testid="stSidebarContent"] {{
                padding-left: 1.2rem;
                padding-right: 1.2rem;
            }}

            section[data-testid="stSidebar"] div[data-testid="stVerticalBlockBorderWrapper"] {{
                border: none;
                background: transparent;
                border-radius: 0;
                box-shadow: none;
            }}

            section[data-testid="stSidebar"] div[role="radiogroup"] {{
                gap: 0.35rem;
            }}

            section[data-testid="stSidebar"] div[role="radiogroup"] > label {{
                background: color-mix(in srgb, var(--oa-card-background) 78%, transparent);
                border: 1px solid var(--oa-card-border);
                border-radius: 999px;
                padding: 0.35rem 0.82rem;
            }}

            section[data-testid="stSidebar"] div[role="radiogroup"] > label:hover {{
                border-color: color-mix(in srgb, var(--oa-primary) 40%, var(--oa-card-border));
            }}

            section[data-testid="stSidebar"] div[role="radiogroup"] > label:has(input:checked) {{
                background: color-mix(in srgb, var(--oa-primary) 14%, var(--oa-card-background));
                border-color: color-mix(in srgb, var(--oa-primary) 55%, var(--oa-card-border));
            }}

            div[data-testid="stMetric"] {{
                background: var(--oa-card-background);
                border: 1px solid var(--oa-card-border);
                border-radius: 18px;
                padding: 18px 20px;
                box-shadow: 0 8px 22px rgba(52, 42, 26, 0.06);
            }}

            div[data-testid="stMetricLabel"] p {{
                letter-spacing: 0.01em;
            }}

            div[data-testid="stMetricValue"] {{
                font-family: "Playfair Display", Georgia, serif;
                font-weight: 600;
            }}

            .stButton > button {{
                border-radius: 14px;
                border: 1px solid color-mix(in srgb, var(--oa-accent) 55%, var(--oa-card-border));
                background: color-mix(in srgb, var(--oa-accent) 14%, var(--oa-card-background));
                color: var(--oa-primary);
                font-weight: 600;
                min-height: 2.8rem;
                transition: all 0.18s ease;
            }}

            .stButton > button:hover {{
                border-color: var(--oa-accent);
                background: color-mix(in srgb, var(--oa-accent) 20%, var(--oa-card-background));
                box-shadow: 0 4px 14px rgba(104, 81, 43, 0.16);
            }}

            .stTextInput input,
            .stTextArea textarea,
            .stSelectbox div[data-baseweb="select"] > div {{
                background-color: var(--oa-card-background);
                color: var(--oa-text);
                border: 1px solid var(--oa-card-border);
                border-radius: 13px;
            }}

            /* Explicit chat styling: bubbles, input, and markdown content */
            div[data-testid="stChatMessage"] {{
                background: var(--oa-card-background);
                border: 1px solid var(--oa-card-border);
                border-radius: 14px;
                padding: 10px 12px;
            }}

            div[data-testid="stChatMessageContent"] p,
            div[data-testid="stChatMessageContent"] li,
            div[data-testid="stChatMessageContent"] span,
            div[data-testid="stChatMessageContent"] code {{
                color: var(--oa-text) !important;
            }}

            div[data-testid="stChatInput"] {{
                background: var(--oa-card-background) !important;
                border: 1px solid var(--oa-card-border) !important;
                border-radius: 14px !important;
                padding: 0.2rem 0.45rem !important;
            }}

            div[data-testid="stChatInput"] textarea {{
                background-color: var(--oa-card-background) !important;
                color: var(--oa-text) !important;
                border: none !important;
                box-shadow: none !important;
            }}

            div[data-testid="stPopoverBody"] {{
                background: var(--oa-card-background);
                border: 1px solid var(--oa-card-border);
                border-radius: 14px;
                box-shadow: var(--oa-shadow);
            }}

            div[data-testid="stChatInput"] button {{
                border-radius: 12px !important;
                border: 1px solid var(--oa-card-border) !important;
                background: color-mix(in srgb, var(--oa-accent) 18%, var(--oa-card-background)) !important;
                color: var(--oa-primary) !important;
            }}

            div[data-testid="stExpander"] {{
                background: var(--oa-card-background);
                border: 1px solid var(--oa-card-border);
                border-radius: 18px;
                box-shadow: 0 6px 20px rgba(52, 42, 26, 0.05);
            }}

            div[data-testid="stAlert"] {{
                border-radius: 14px;
                border: 1px solid var(--oa-card-border);
            }}

            .oa-header-shell {{
                margin-bottom: 2.1rem;
                padding: 0.25rem 0 0.5rem 0;
            }}

            .oa-header-kicker {{
                color: var(--oa-text-secondary);
                text-transform: uppercase;
                letter-spacing: 0.12em;
                font-size: 0.74rem;
                margin-bottom: 0.8rem;
                font-weight: 500;
            }}

            .oa-header-title {{
                margin: 0;
                color: var(--oa-primary);
                font-size: clamp(2.2rem, 3.4vw, 3.5rem);
                line-height: 1.1;
            }}

            .oa-header-subtitle {{
                margin-top: 1rem;
                max-width: 74ch;
                color: var(--oa-text-secondary);
                font-size: 1.05rem;
                line-height: 1.8;
            }}

            .oa-section-spacer {{
                margin-top: 2.2rem;
                margin-bottom: 1.1rem;
            }}

            .oa-badge-row {{
                display: flex;
                flex-wrap: wrap;
                gap: 0.55rem;
                align-items: center;
                margin: 0.35rem 0 0.8rem 0;
            }}

            .oa-badge {{
                display: inline-flex;
                align-items: center;
                gap: 0.35rem;
                width: fit-content;
                border-radius: 999px;
                padding: 0.26rem 0.68rem;
                font-size: 0.74rem;
                font-weight: 700;
                letter-spacing: 0.06em;
                text-transform: uppercase;
                border: 1px solid transparent;
                line-height: 1.25;
            }}

            .oa-badge span {{
                color: inherit;
                font-weight: 500;
                letter-spacing: 0;
                text-transform: none;
            }}

            .oa-badge-real {{
                color: var(--oa-success);
                background: color-mix(in srgb, var(--oa-success) 13%, var(--oa-card-background));
                border-color: color-mix(in srgb, var(--oa-success) 42%, var(--oa-card-border));
            }}

            .oa-badge-assumption {{
                color: #7A5A1F;
                background: color-mix(in srgb, var(--oa-warning) 20%, var(--oa-card-background));
                border-color: color-mix(in srgb, var(--oa-warning) 58%, var(--oa-card-border));
            }}

            .oa-education-note {{
                margin: 0.6rem 0 1rem 0;
                padding: 0.85rem 1rem;
                border-radius: 14px;
                color: var(--oa-text-secondary);
                background: color-mix(in srgb, var(--oa-secondary) 72%, var(--oa-card-background));
                border: 1px solid var(--oa-card-border);
                font-size: 0.92rem;
                line-height: 1.6;
            }}

            .oa-education-footer {{
                margin-top: 2.8rem;
                padding: 1rem 1.1rem;
                border-top: 1px solid var(--oa-card-border);
                color: var(--oa-text-secondary);
                font-size: 0.88rem;
                text-align: center;
            }}

            .oa-hero-metric-row {{
                display: flex;
                flex-wrap: wrap;
                gap: 1.05rem;
                margin: 0.2rem 0 1.6rem 0;
            }}
            .oa-hero-tile {{
                flex: 1 1 200px;
                min-width: 160px;
                background: var(--oa-card-background);
                border: 1px solid var(--oa-card-border);
                border-radius: 18px;
                padding: 1.25rem 1.4rem 1.35rem 1.4rem;
                box-shadow: 0 8px 22px rgba(52, 42, 26, 0.06);
            }}
            .oa-hero-tile .oa-hero-k {{
                text-transform: uppercase;
                letter-spacing: 0.1em;
                font-size: 0.72rem;
                font-weight: 600;
                color: var(--oa-text-secondary);
            }}
            .oa-hero-tile .oa-hero-v {{
                margin-top: 0.5rem;
                font-family: "Playfair Display", Georgia, serif;
                font-size: clamp(1.75rem, 2.5vw, 2.5rem);
                font-weight: 600;
                color: var(--oa-primary);
                line-height: 1.1;
            }}
            .oa-hero-tile .oa-hero-s {{
                margin-top: 0.4rem;
                font-size: 0.88rem;
                color: var(--oa-text-secondary);
            }}
            .oa-scenario-delta-row {{
                display: flex;
                flex-wrap: wrap;
                gap: 0.75rem 1.5rem;
                margin: -0.4rem 0 1.2rem 0;
                padding: 0.9rem 1.1rem;
                border-radius: 14px;
                background: color-mix(in srgb, var(--oa-highlight) 10%, var(--oa-card-background));
                border: 1px solid var(--oa-card-border);
                font-size: 0.95rem;
            }}
            .oa-scenario-delta-row span {{
                color: var(--oa-text);
            }}
            .oa-hero-window {{
                margin: 0.1rem 0 0.5rem 0;
                color: var(--oa-text-secondary);
                font-size: 0.92rem;
            }}

            .oa-vnb-section {{
                margin: 2.2rem 0 1.8rem 0;
                padding: 1.45rem;
                background: var(--oa-card-background);
                border: 1px solid var(--oa-card-border);
                border-radius: 20px;
                box-shadow: var(--oa-shadow);
            }}

            .oa-vnb-kicker,
            .oa-vnb-axis-card p,
            .oa-vnb-run p,
            .oa-vnb-cell p,
            .oa-vnb-axis-horizontal,
            .oa-vnb-axis-vertical {{
                text-transform: uppercase;
                letter-spacing: 0.12em;
                font-size: 0.72rem;
                font-weight: 700;
            }}

            .oa-vnb-kicker {{
                color: var(--oa-primary);
                margin: 0 0 0.45rem 0;
            }}

            .oa-vnb-section h2 {{
                margin: 0;
                color: var(--oa-primary);
                font-size: clamp(1.75rem, 2.25vw, 2.35rem);
            }}

            .oa-vnb-intro {{
                max-width: 78ch;
                margin: 0.8rem 0 0 0;
                color: var(--oa-text-secondary);
            }}

            .oa-vnb-axis-grid {{
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 0.95rem;
                margin-top: 1.2rem;
            }}

            .oa-vnb-run,
            .oa-vnb-axis-card {{
                border-radius: 16px;
                border: 1px solid var(--oa-card-border);
                background: color-mix(in srgb, var(--oa-secondary) 72%, var(--oa-card-background));
                padding: 1rem;
            }}

            .oa-vnb-run p,
            .oa-vnb-axis-card p {{
                margin: 0 0 0.45rem 0;
                color: var(--oa-accent);
            }}

            .oa-vnb-axis-card h3 {{
                margin: 0;
                color: var(--oa-primary);
                font-size: 1.25rem;
            }}

            .oa-vnb-run span,
            .oa-vnb-axis-card span,
            .oa-vnb-cell span {{
                color: var(--oa-text-secondary);
                font-size: 0.92rem;
                line-height: 1.6;
            }}

            .oa-vnb-matrix-shell {{
                display: grid;
                grid-template-columns: 2.2rem 1fr;
                gap: 0.75rem;
                align-items: stretch;
                margin-top: 1.15rem;
            }}

            .oa-vnb-axis-vertical {{
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--oa-text-secondary);
                writing-mode: vertical-rl;
                transform: rotate(180deg);
            }}

            .oa-vnb-matrix {{
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 0.75rem;
            }}

            .oa-vnb-cell {{
                min-height: 10.5rem;
                border-radius: 16px;
                padding: 1rem;
                border: 1px solid color-mix(in srgb, var(--oa-card-border) 72%, transparent);
            }}

            .oa-vnb-cell p {{
                margin: 0 0 0.45rem 0;
            }}

            .oa-vnb-cell h3 {{
                margin: 0 0 0.5rem 0;
                font-size: 1.25rem;
                line-height: 1.25;
            }}

            .oa-vnb-cell-primary {{
                background: var(--oa-primary);
                color: #FFFFFF;
            }}

            .oa-vnb-cell-primary h3,
            .oa-vnb-cell-primary p,
            .oa-vnb-cell-primary span {{
                color: #FFFFFF !important;
            }}

            .oa-vnb-cell-warning {{
                background: color-mix(in srgb, var(--oa-accent) 25%, var(--oa-card-background));
            }}

            .oa-vnb-cell-highlight {{
                background: color-mix(in srgb, var(--oa-highlight) 25%, var(--oa-card-background));
            }}

            .oa-vnb-cell-muted {{
                background: var(--oa-secondary);
            }}

            .oa-vnb-axis-horizontal {{
                grid-column: 1 / -1;
                margin: 0.15rem 0 0 0;
                text-align: center;
                color: var(--oa-text-secondary);
            }}

            .oa-vnb-checklist {{
                margin-top: 1.15rem;
                border-radius: 16px;
                border: 1px solid color-mix(in srgb, var(--oa-accent) 35%, var(--oa-card-border));
                background: color-mix(in srgb, var(--oa-card-background) 88%, var(--oa-secondary));
                padding: 1rem 1.15rem;
            }}

            .oa-vnb-checklist h3 {{
                margin: 0;
                color: var(--oa-primary);
                font-size: 1.35rem;
            }}

            .oa-vnb-checklist ol {{
                margin: 0.75rem 0 0 1.25rem;
                padding: 0;
                color: var(--oa-text-secondary);
            }}

            .oa-vnb-checklist li {{
                margin-top: 0.45rem;
                color: var(--oa-text-secondary);
            }}

            .oa-vnb-checklist p {{
                margin: 0.95rem 0 0 0;
                padding: 0.8rem 0.9rem;
                border-radius: 12px;
                background: var(--oa-secondary);
                color: var(--oa-primary);
                font-weight: 600;
            }}

            .oa-hero-chart-intro {{
                margin-top: 2.8rem;
                margin-bottom: 0.7rem;
            }}

            .oa-hero-chart-intro h2 {{
                margin-bottom: 0.35rem;
                font-size: clamp(1.7rem, 2.2vw, 2.35rem);
                color: var(--oa-primary);
            }}

            .oa-hero-chart-intro p {{
                margin: 0;
                color: var(--oa-text-secondary);
            }}

            div[data-testid="stPlotlyChart"] {{
                background: transparent !important;
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin-top: 0.6rem;
                margin-bottom: 0.7rem;
            }}

            @media (max-width: 1200px) {{
                div[data-testid="stMainBlockContainer"] {{
                    padding-left: 1.8rem;
                    padding-right: 1.8rem;
                }}
            }}

            @media (max-width: 900px) {{
                .oa-vnb-axis-grid,
                .oa-vnb-matrix {{
                    grid-template-columns: 1fr;
                }}

                .oa-vnb-matrix-shell {{
                    grid-template-columns: 1fr;
                }}

                .oa-vnb-axis-vertical {{
                    display: none;
                }}
            }}
        </style>
        """,
        unsafe_allow_html=True,
    )
