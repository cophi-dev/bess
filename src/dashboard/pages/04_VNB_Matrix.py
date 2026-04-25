"""Interactive VNB decision matrix for BESS site screening."""

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path

import pandas as pd
import streamlit as st

PROJECT_SRC = Path(__file__).resolve().parents[2]
if str(PROJECT_SRC) not in sys.path:
    sys.path.insert(0, str(PROJECT_SRC))

from dashboard.theme import DESIGN_TOKENS, apply_design_theme, badge_html, render_education_footer


MARKET_OPTIONS = ["Stark", "Mittel", "Schwach"]
GRID_OPTIONS = ["Passend", "Kritisch"]


@dataclass(frozen=True)
class Quadrant:
    """Decision content for one matrix quadrant."""

    key: str
    title: str
    coordinates: str
    summary: str
    next_steps: tuple[str, ...]
    tone_class: str


QUADRANTS = {
    "priorisieren": Quadrant(
        key="priorisieren",
        title="Priorisieren",
        coordinates="Markt stark + Netz passend",
        summary=(
            "Der Standort zeigt ein belastbares Erlöspotenzial und der typische Fahrplan passt zur lokalen "
            "Netzlage. Für den VNB ist das ein Kandidat, der früh in die Detailprüfung gehen sollte."
        ),
        next_steps=(
            "Fahrplan gegen reale Engpassfenster prüfen.",
            "Anschlussvariante und Schutzkonzept priorisiert bewerten.",
            "Flexibilitäts- oder Redispatch-Nutzen vertraglich konkretisieren.",
        ),
        tone_class="oa-vnb-prioritize",
    ),
    "pruefen": Quadrant(
        key="pruefen",
        title="Prüfen",
        coordinates="Markt stark + Netz kritisch",
        summary=(
            "Die Marktseite ist attraktiv, aber der Fahrplan kann am Netzpunkt kritisch wirken. Der Case ist "
            "nicht automatisch schlecht, braucht aber belastbare Netzsimulation und klare Betriebsauflagen."
        ),
        next_steps=(
            "Weitere Netzsimulation mit Lade- und Entladefahrplan durchführen.",
            "Grenzwerte für Engpass-, Spannungs- und Strombelastung definieren.",
            "Betriebsfenster oder netzdienliche Nebenbedingungen mit dem Betreiber abstimmen.",
        ),
        tone_class="oa-vnb-review",
    ),
    "optionalitaet": Quadrant(
        key="optionalitaet",
        title="Optionalität",
        coordinates="Markt schwach + Netz passend",
        summary=(
            "Der direkte Markterlös trägt den Case noch nicht allein, der Standort kann aber netzdienliche "
            "Optionen eröffnen. Der Fokus liegt auf Flexibilitätsprodukten und langfristigem Systemnutzen."
        ),
        next_steps=(
            "Fahrplan auf lokale Entlastungswirkung prüfen.",
            "Flexibilitätsbedarf und mögliche VNB-Produkte quantifizieren.",
            "Case mit Förder-, Netz- oder Langfristvertragslogik erneut bewerten.",
        ),
        tone_class="oa-vnb-option",
    ),
    "zurueckstellen": Quadrant(
        key="zurueckstellen",
        title="Zurückstellen",
        coordinates="Markt schwach + Netz kritisch",
        summary=(
            "Weder das Erlöspotenzial noch die Netzwirkung sprechen aktuell für eine priorisierte Bearbeitung. "
            "Der Standort sollte erst nach veränderten Markt- oder Netzannahmen wieder aufgenommen werden."
        ),
        next_steps=(
            "Case dokumentieren und Annahmen transparent festhalten.",
            "Alternative Netzpunkte oder kleinere Anschlussleistung prüfen.",
            "Nach neuen Marktpreisen, Netzausbau oder Flexibilitätsbedarf erneut screenen.",
        ),
        tone_class="oa-vnb-defer",
    ),
}


def _active_quadrant_key(market: str, grid: str) -> str:
    """Map the selected axes to a 2x2 decision quadrant."""

    if market == "Stark" and grid == "Passend":
        return "priorisieren"
    if grid == "Kritisch" and market in {"Stark", "Mittel"}:
        return "pruefen"
    if grid == "Passend" and market in {"Mittel", "Schwach"}:
        return "optionalitaet"
    return "zurueckstellen"


def _numeric_column_max(dispatch: pd.DataFrame, column: str) -> float:
    """Return a finite max value for optional numeric dispatch columns."""

    if column not in dispatch.columns:
        return 0.0
    value = pd.to_numeric(dispatch[column], errors="coerce").max()
    return 0.0 if pd.isna(value) else float(value)


def _simulation_summary(result: object | None) -> dict[str, float | str | bool]:
    """Extract a compact, robust summary from the last simulator result."""

    if result is None or not hasattr(result, "dispatch"):
        return {"available": False}

    dispatch = result.dispatch
    if not isinstance(dispatch, pd.DataFrame) or dispatch.empty:
        return {"available": False}

    horizon_hours = max(float(len(dispatch)), 1.0)
    total_revenue = float(getattr(result, "total_revenue_eur", 0.0))
    annualized_revenue = total_revenue * 8760.0 / horizon_hours
    max_power_mw = float(
        max(
            _numeric_column_max(dispatch, "charge_mw"),
            _numeric_column_max(dispatch, "discharge_mw"),
            1.0,
        )
    )
    annualized_revenue_per_mw = annualized_revenue / max(max_power_mw, 1.0)

    if {"congestion_signal", "discharge_mw"}.issubset(dispatch.columns):
        discharged = dispatch["discharge_mw"].clip(lower=0.0)
        discharged_total = float(discharged.sum())
        if discharged_total > 0:
            congestion_alignment = float(
                (discharged * dispatch["congestion_signal"].clip(0.0, 1.0)).sum() / discharged_total
            )
        else:
            congestion_alignment = 0.0
        congestion_mean = float(dispatch["congestion_signal"].clip(0.0, 1.0).mean())
    else:
        congestion_alignment = 0.0
        congestion_mean = 0.0

    return {
        "available": True,
        "horizon_hours": horizon_hours,
        "total_revenue": total_revenue,
        "annualized_revenue": annualized_revenue,
        "annualized_revenue_per_mw": annualized_revenue_per_mw,
        "congestion_alignment": congestion_alignment,
        "congestion_mean": congestion_mean,
    }


def _market_from_summary(summary: dict[str, float | str | bool]) -> str:
    revenue_per_mw = float(summary.get("annualized_revenue_per_mw", 0.0))
    if revenue_per_mw >= 80_000:
        return "Stark"
    if revenue_per_mw >= 30_000:
        return "Mittel"
    return "Schwach"


def _grid_from_summary(summary: dict[str, float | str | bool]) -> str:
    congestion_alignment = float(summary.get("congestion_alignment", 0.0))
    return "Passend" if congestion_alignment >= 0.35 else "Kritisch"


def _use_current_simulation_result() -> None:
    summary = _simulation_summary(st.session_state.get("optimization_result"))
    if not summary.get("available"):
        return
    st.session_state.vnb_market_attractiveness = _market_from_summary(summary)
    st.session_state.vnb_grid_effect = _grid_from_summary(summary)
    st.session_state.vnb_last_synced_signature = _summary_signature(summary)


def _summary_signature(summary: dict[str, float | str | bool]) -> tuple[float, float, float] | None:
    """Return a small fingerprint so the matrix can react to changed simulator outputs."""

    if not summary.get("available"):
        return None
    return (
        round(float(summary.get("total_revenue", 0.0)), 2),
        round(float(summary.get("annualized_revenue_per_mw", 0.0)), 2),
        round(float(summary.get("congestion_alignment", 0.0)), 4),
    )


def _matrix_html(active_key: str, market: str) -> str:
    order = ["optionalitaet", "priorisieren", "zurueckstellen", "pruefen"]
    cells = []
    for key in order:
        quadrant = QUADRANTS[key]
        active_class = " oa-vnb-cell-active" if key == active_key else ""
        mittel_note = ""
        if market == "Mittel" and key == active_key:
            mittel_note = "<span class='oa-vnb-mittel-note'>Grenzfall: Markt mittel wird konservativ eingeordnet.</span>"
        cells.append(
            f"""
            <div class='oa-vnb-matrix-cell {quadrant.tone_class}{active_class}'>
                <p>{quadrant.coordinates}</p>
                <h3>{quadrant.title}</h3>
                <span>{quadrant.summary}</span>
                {mittel_note}
            </div>
            """
        )

    return f"""
    <section class='oa-vnb-matrix-card'>
        <div class='oa-vnb-axis-top'>
            <span>Markt schwach / mittel</span>
            <span>Markt stark</span>
        </div>
        <div class='oa-vnb-matrix-layout'>
            <div class='oa-vnb-axis-side'>
                <span>Netz passend</span>
                <span>Netz kritisch</span>
            </div>
            <div class='oa-vnb-matrix-grid'>
                {''.join(cells)}
            </div>
        </div>
        <p class='oa-vnb-axis-caption'>Aktive Auswahl: {QUADRANTS[active_key].title}</p>
    </section>
    """


def _page_styles() -> None:
    st.markdown(
        f"""
        <style>
            .oa-vnb-control-card,
            .oa-vnb-matrix-card,
            .oa-vnb-decision-card {{
                background: {DESIGN_TOKENS["card_background"]};
                border: 1px solid {DESIGN_TOKENS["card_border"]};
                border-radius: 20px;
                box-shadow: {DESIGN_TOKENS["shadow"]};
                padding: 1.25rem;
            }}

            .oa-vnb-control-card h2,
            .oa-vnb-decision-card h2 {{
                color: {DESIGN_TOKENS["primary"]};
                margin: 0 0 0.4rem 0;
            }}

            .oa-vnb-control-card p,
            .oa-vnb-decision-card p,
            .oa-vnb-decision-card li {{
                color: {DESIGN_TOKENS["text_secondary"]};
            }}

            .oa-vnb-matrix-card {{
                margin-top: 1.2rem;
            }}

            .oa-vnb-axis-top {{
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 0.75rem;
                margin-left: 7.5rem;
                margin-bottom: 0.55rem;
            }}

            .oa-vnb-axis-top span,
            .oa-vnb-axis-side span,
            .oa-vnb-axis-caption {{
                color: {DESIGN_TOKENS["text_secondary"]};
                font-size: 0.78rem;
                font-weight: 700;
                letter-spacing: 0.1em;
                text-transform: uppercase;
            }}

            .oa-vnb-matrix-layout {{
                display: grid;
                grid-template-columns: 6.75rem 1fr;
                gap: 0.75rem;
            }}

            .oa-vnb-axis-side {{
                display: grid;
                grid-template-rows: repeat(2, minmax(0, 1fr));
                gap: 0.75rem;
            }}

            .oa-vnb-axis-side span {{
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                border-radius: 14px;
                background: {DESIGN_TOKENS["secondary"]};
                border: 1px solid {DESIGN_TOKENS["card_border"]};
                padding: 0.75rem;
            }}

            .oa-vnb-matrix-grid {{
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 0.75rem;
            }}

            .oa-vnb-matrix-cell {{
                min-height: 13rem;
                border-radius: 17px;
                border: 1px solid color-mix(in srgb, {DESIGN_TOKENS["card_border"]} 75%, transparent);
                padding: 1.05rem;
                transition: all 0.18s ease;
            }}

            .oa-vnb-matrix-cell p {{
                color: {DESIGN_TOKENS["text_secondary"]};
                font-size: 0.75rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                margin: 0 0 0.55rem 0;
                text-transform: uppercase;
            }}

            .oa-vnb-matrix-cell h3 {{
                color: {DESIGN_TOKENS["primary"]};
                font-size: 1.45rem;
                margin: 0 0 0.55rem 0;
            }}

            .oa-vnb-matrix-cell span {{
                color: {DESIGN_TOKENS["text_secondary"]};
                font-size: 0.92rem;
                line-height: 1.6;
            }}

            .oa-vnb-prioritize {{
                background: color-mix(in srgb, {DESIGN_TOKENS["success"]} 16%, #FFFFFF);
            }}

            .oa-vnb-review {{
                background: color-mix(in srgb, {DESIGN_TOKENS["warning"]} 22%, #FFFFFF);
            }}

            .oa-vnb-option {{
                background: color-mix(in srgb, {DESIGN_TOKENS["highlight"]} 18%, #FFFFFF);
            }}

            .oa-vnb-defer {{
                background: color-mix(in srgb, {DESIGN_TOKENS["error"]} 10%, {DESIGN_TOKENS["secondary"]});
            }}

            .oa-vnb-cell-active {{
                border: 2px solid {DESIGN_TOKENS["primary"]};
                box-shadow: 0 14px 30px rgba(46, 74, 62, 0.18);
                transform: translateY(-2px);
            }}

            .oa-vnb-cell-active h3::before {{
                content: "Aktiv · ";
                color: {DESIGN_TOKENS["accent"]};
                font-family: Inter, system-ui, -apple-system, sans-serif;
                font-size: 0.82rem;
                font-weight: 700;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }}

            .oa-vnb-mittel-note {{
                display: block;
                margin-top: 0.7rem;
                color: {DESIGN_TOKENS["primary"]} !important;
                font-weight: 600;
            }}

            .oa-vnb-axis-caption {{
                margin: 0.85rem 0 0 7.5rem;
            }}

            .oa-vnb-decision-card {{
                margin-top: 1.2rem;
            }}

            .oa-vnb-decision-card ul {{
                margin: 0.8rem 0 0 1.2rem;
                padding: 0;
            }}

            @media (max-width: 900px) {{
                .oa-vnb-axis-top {{
                    margin-left: 0;
                }}

                .oa-vnb-matrix-layout {{
                    grid-template-columns: 1fr;
                }}

                .oa-vnb-axis-side {{
                    display: none;
                }}

                .oa-vnb-matrix-grid,
                .oa-vnb-axis-top {{
                    grid-template-columns: 1fr;
                }}

                .oa-vnb-axis-caption {{
                    margin-left: 0;
                }}
            }}
        </style>
        """,
        unsafe_allow_html=True,
    )


def _render_simulation_summary(summary: dict[str, float | str | bool]) -> None:
    st.subheader("Letzter Simulatorlauf")
    st.caption("Verbindet die Marktlogik aus dem Simulator mit einer einfachen VNB-Screening-Heuristik.")
    st.markdown(
        f"<div class='oa-badge-row'>{badge_html('Lernannahme / Sensitivity', 'assumption', 'Heuristik')}</div>",
        unsafe_allow_html=True,
    )
    if not summary.get("available"):
        st.info(
            "Noch kein Simulatorlauf in dieser Streamlit-Session gefunden. Du kannst die Matrix manuell nutzen "
            "oder zuerst auf der Simulator-Seite eine Optimierung starten."
        )
        return

    col_revenue, col_revenue_mw, col_congestion = st.columns(3)
    col_revenue.metric(
        "Expected revenue",
        f"{float(summary['total_revenue']):,.0f} EUR",
        help="Bruttoerlös im zuletzt optimierten Zeitraum aus dem Simulator.",
    )
    col_revenue_mw.metric(
        "Annualisiert pro MW",
        f"{float(summary['annualized_revenue_per_mw']):,.0f} EUR/MW/a",
        help="Einfache lineare Skalierung des letzten Laufs auf ein Jahr und die beobachtete maximale Leistung.",
    )
    col_congestion.metric(
        "Congestion signal",
        f"{float(summary['congestion_alignment']) * 100:,.0f}%",
        help=(
            "Anteil des Entladefahrplans, der mit dem Engpasssignal zusammenfällt. "
            "Höher wird hier als netzpassender gewertet."
        ),
    )
    st.caption(
        "Die automatische Einordnung ist eine Lernheuristik: Stark ab ca. 80.000 EUR/MW/a, Mittel ab "
        "ca. 30.000 EUR/MW/a, Passend ab ca. 35% congestion-aligned discharge."
    )


def main() -> None:
    """Render the interactive VNB decision matrix."""

    st.set_page_config(page_title="VNB Matrix | OpenAutobidder-DE", layout="wide")
    apply_design_theme(theme_mode="warm")
    _page_styles()
    st.session_state.setdefault("vnb_market_attractiveness", "Stark")
    st.session_state.setdefault("vnb_grid_effect", "Passend")
    st.session_state.setdefault("vnb_auto_sync", True)
    st.session_state.setdefault("vnb_last_synced_signature", None)

    st.markdown(
        """
        <section class='oa-header-shell'>
            <p class='oa-header-kicker'>VNB Decision Lens</p>
            <h1 class='oa-header-title'>VNB Decision Matrix – Marktattraktivität vs. Netzwirkung</h1>
            <p class='oa-header-subtitle'>
                Eine kompakte Entscheidungshilfe für Verteilnetzbetreiber: Marktpotenzial und lokale
                Netzwirkung gemeinsam bewerten, bevor ein BESS-Standort priorisiert wird.
            </p>
        </section>
        """,
        unsafe_allow_html=True,
    )

    summary = _simulation_summary(st.session_state.get("optimization_result"))
    summary_signature = _summary_signature(summary)
    if st.session_state.vnb_auto_sync and summary_signature != st.session_state.vnb_last_synced_signature:
        _use_current_simulation_result()
    _render_simulation_summary(summary)

    use_col, note_col = st.columns([1.1, 2.2])
    with use_col:
        st.toggle(
            "Auto-sync with simulator",
            key="vnb_auto_sync",
            disabled=not bool(summary.get("available")),
            help="Aktualisiert die Matrix automatisch, wenn sich der letzte Simulatorlauf aendert.",
        )
        st.button(
            "Use current simulation result",
            on_click=_use_current_simulation_result,
            disabled=not bool(summary.get("available")),
            width="stretch",
            help="Setzt Marktattraktivität und Netzwirkung aus dem letzten Optimierungslauf.",
        )
    with note_col:
        st.caption(
            "Auto-sync oder der Button uebersetzen den letzten Simulatorlauf in die Matrix. Fuer echte "
            "Anschlussentscheidungen muss der VNB die lokale Lastfluss- und Schutztechnikpruefung ergaenzen."
        )

    st.markdown(
        """
        <section class='oa-vnb-control-card'>
            <h2>Achsen bewerten</h2>
            <p>
                Wähle zuerst das Marktpotenzial und die lokale Netzwirkung. Die Matrix hebt danach den passenden
                Entscheidungspfad hervor. Die Auswahl ist bewusst einfach gehalten: Sie soll die Diskussion
                strukturieren, nicht die technische Netzprüfung ersetzen.
            </p>
        </section>
        """,
        unsafe_allow_html=True,
    )

    market_col, grid_col = st.columns(2)
    with market_col:
        st.markdown(
            f"<div class='oa-badge-row'>{badge_html('Lernannahme / Sensitivity', 'assumption')}</div>",
            unsafe_allow_html=True,
        )
        market = st.selectbox(
            "Marktattraktivität",
            options=MARKET_OPTIONS,
            key="vnb_market_attractiveness",
            help=(
                "Stark: robuste Erlöse aus Arbitrage und Revenue Stacking. Mittel: Grenzfall, der weitere "
                "Szenarien braucht. Schwach: Erlöse tragen den Standort noch nicht allein."
            ),
        )
    with grid_col:
        st.markdown(
            f"<div class='oa-badge-row'>{badge_html('Lernannahme / Sensitivity', 'assumption')}</div>",
            unsafe_allow_html=True,
        )
        grid = st.selectbox(
            "Netzwirkung",
            options=GRID_OPTIONS,
            key="vnb_grid_effect",
            help=(
                "Passend: Fahrplan entlastet oder nutzt bekannte Engpassfenster. Kritisch: Laden oder Entladen "
                "kann lokale Engpässe, Spannung oder Strombelastung verschärfen."
            ),
        )

    active_key = _active_quadrant_key(market, grid)
    active_quadrant = QUADRANTS[active_key]

    st.markdown(_matrix_html(active_key, market), unsafe_allow_html=True)

    st.markdown(
        f"""
        <section class='oa-vnb-decision-card'>
            <h2>{active_quadrant.title}</h2>
            <p><strong>{active_quadrant.coordinates}</strong></p>
            <p>{active_quadrant.summary}</p>
            <h3>Empfohlene nächste Schritte</h3>
            <ul>
                {''.join(f'<li>{step}</li>' for step in active_quadrant.next_steps)}
            </ul>
        </section>
        """,
        unsafe_allow_html=True,
    )

    with st.expander("Begriffe kurz erklärt"):
        st.markdown(
            """
            **Marktattraktivität** bewertet, ob der erwartete Speichererlös aus Arbitrage, Regelenergie,
            Kapazitätszahlungen und Engpassannahmen einen Standort wirtschaftlich tragen kann.

            **Netzwirkung** bewertet, ob der Fahrplan zur lokalen Netzsituation passt. Ein marktwirtschaftlich
            sinnvoller Fahrplan kann aus VNB-Sicht trotzdem kritisch sein, wenn er in Engpasszeiten zusätzlich
            belastet.

            **Mittel** ist bewusst kein eigener Quadrant. Die Matrix behandelt es als Grenzfall:
            bei kritischer Netzwirkung wird geprüft, bei passender Netzwirkung bleibt Optionalität erhalten.
            """
        )

    render_education_footer()


main()
