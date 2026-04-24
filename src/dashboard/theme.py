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
        </style>
        """,
        unsafe_allow_html=True,
    )
