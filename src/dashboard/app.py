"""Streamlit dashboard for OpenAutobidder-DE dispatch optimization."""

from __future__ import annotations

import sys
from datetime import UTC
from pathlib import Path

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

# Ensure `src/` is importable when running `streamlit run src/dashboard/app.py`.
PROJECT_SRC = Path(__file__).resolve().parents[1]
if str(PROJECT_SRC) not in sys.path:
    sys.path.insert(0, str(PROJECT_SRC))

from open_autobidder.chat import (
    ChatRequestConfig,
    ask_about_dashboard,
    load_chat_settings,
)
from open_autobidder.config import BESSConfig
from open_autobidder.data_ingestion import update_local_data
from open_autobidder.data_loader import load_market_data_for_mode
from open_autobidder.optimizer import RevenueStackingConfig, optimize_bess_with_stacking
from dashboard.theme import DESIGN_TOKENS, apply_design_theme

I18N = {
    "en": {
        "title": "OpenAutobidder-DE",
        "subtitle": (
            "Educational multi-revenue BESS simulator for German markets. "
            "Explore how arbitrage, ancillary services, and availability payments stack into total battery revenue."
        ),
        "header_kicker": "Battery Dispatch Studio",
        "how_it_works": "How it works",
        "how_it_works_text": (
            "The optimizer schedules charging in lower-price hours and discharging in higher-price hours,\n"
            "while always respecting battery limits.\n\n"
            "- **Inputs:** Battery size, power ratio (C-rate), horizon, and data source.\n"
            "- **Optimization:** Hourly co-optimization of arbitrage and stacked revenues under battery constraints.\n"
            "- **Results:** Dispatch timeline, SOC path, and revenue breakdown by stream."
        ),
        "settings": "Simulation Settings",
        "settings_caption": "Choose battery assumptions and market-data scope for this run.",
        "interface_header": "Interface",
        "interface_caption": "Choose display preferences for this session.",
        "language": "Language",
        "theme": "Visual style",
        "theme_warm": "Warm",
        "cap_label": "Battery energy capacity (MWh)",
        "cap_help": "Total usable energy content of the battery. Larger capacity allows more energy shifting between low and high price periods.",
        "cap_caption": "Total energy the battery can store.",
        "crate_label": "Power-to-energy ratio (C-rate)",
        "crate_help": "Defines charging/discharging speed relative to capacity. Example: 0.5C means a full charge or discharge in about 2 hours.",
        "crate_caption": "Battery power speed: higher C-rate reacts faster to price moves.",
        "horizon_label": "Optimization horizon (days)",
        "horizon_help": "How many future days are optimized in one run. Longer horizons can reveal broader dispatch patterns.",
        "horizon_caption": "Planning window for the optimization.",
        "data_mode_label": "Data source mode",
        "data_mode_help": "'sample' uses bundled demo data. 'real' uses local ENTSO-E data and can refresh from API when available.",
        "data_mode_caption": "Market data source used for pricing inputs.",
        "update_btn": "Update Data Now",
        "update_caption": "Refresh local market data (for real mode when API access is configured).",
        "run_btn": "Run Optimization",
        "run_caption": "Run optimization and refresh KPIs, chart, and hourly table.",
        "kpi_header": "Key Indicators",
        "kpi_rev": "Total estimated revenue",
        "kpi_rev_help": "Expected gross revenue from all enabled streams across the selected horizon (before fees, taxes, and degradation costs).",
        "kpi_charge": "Average charge price",
        "kpi_charge_help": "Average day-ahead price in charge hours (when the battery buys energy).",
        "kpi_discharge": "Average discharge price",
        "kpi_discharge_help": "Average day-ahead price in discharge hours (when the battery sells energy).",
        "kpi_cycles": "Estimated equivalent full cycles",
        "kpi_cycles_help": "Approximate full-cycle throughput over the horizon. 1.0 means throughput equivalent to one full charge + discharge cycle.",
        "kpi_power": "Configured max battery power",
        "kpi_power_help": "Maximum charge or discharge rate derived from capacity and selected C-rate.",
        "stacking_header": "Revenue Stacking Assumptions",
        "stacking_caption": "Simple educational assumptions for ancillary and capacity revenues.",
        "fcr_toggle": "Enable FCR availability",
        "afrr_toggle": "Enable aFRR availability + utilization",
        "capacity_toggle": "Enable capacity payment",
        "congestion_toggle": "Enable congestion bonus",
        "fcr_rate_label": "FCR availability (EUR/MW/h)",
        "afrr_avail_label": "aFRR availability (EUR/MW/h)",
        "afrr_util_label": "aFRR utilization (EUR/MWh)",
        "afrr_activation_label": "aFRR activation ratio (0-1)",
        "capacity_rate_label": "Capacity payment (EUR/MW/h)",
        "capacity_share_label": "Contracted capacity share of power",
        "congestion_bonus_label": "Congestion bonus (EUR/MWh)",
        "revenue_breakdown_title": "Revenue Breakdown",
        "revenue_breakdown_caption": "Real BESS portfolios rarely rely on arbitrage alone. Revenue stacking improves utilization and risk balance across market regimes.",
        "stream_arbitrage": "Arbitrage",
        "stream_fcr": "FCR",
        "stream_afrr_availability": "aFRR availability",
        "stream_afrr_utilization": "aFRR utilization",
        "stream_capacity": "Capacity payment",
        "stream_congestion_bonus": "Congestion bonus",
        "chart_title": "Charge / Discharge Schedule and SOC",
        "chart_subtitle": "The dispatch profile is the central output of each run.",
        "charge_name": "Charge (MW)",
        "discharge_name": "Discharge (MW)",
        "soc_name": "SOC (MWh)",
        "x_title": "Time (hourly)",
        "y_title": "Battery Power (MW)",
        "y2_title": "State of Charge (MWh)",
        "legend": "Series",
        "reading_guide": "Reading guide: Positive bars = charging, negative bars = discharging, green line = SOC. Hover any timestamp for exact power, price, and step revenue values.",
        "table_title": "Hourly Dispatch Table",
        "table_caption": "Detailed hourly output: market price, battery action, SOC, and resulting step revenue.",
        "time": "Time",
        "charge_power": "Charge power",
        "discharge_power": "Discharge power",
        "price": "Price",
        "soc": "State of charge",
        "step_revenue": "Step revenue",
    },
    "de": {
        "title": "OpenAutobidder-DE",
        "subtitle": (
            "Lernorientierter Multi-Revenue-BESS-Simulator fuer den deutschen Markt. "
            "Zeigt, wie Arbitrage, Regelenergie und Verfuegbarkeitszahlungen gemeinsam den Batterieerloes bestimmen."
        ),
        "header_kicker": "Battery Dispatch Studio",
        "how_it_works": "So funktioniert es",
        "how_it_works_text": (
            "Die Optimierung plant Laden in guenstigeren Stunden und Entladen in teureren Stunden,\n"
            "wobei die Batteriegrenzen jederzeit eingehalten werden.\n\n"
            "- **Eingaben:** Batteriegroesse, C-Rate, Horizont und Datenquelle.\n"
            "- **Optimierung:** Stuendliche Ko-Optimierung von Arbitrage und Revenue-Stacking unter technischen Nebenbedingungen.\n"
            "- **Ergebnisse:** Dispatch-Zeitreihe, SOC-Verlauf und Revenue-Aufteilung pro Erlosstrom."
        ),
        "settings": "Simulationseinstellungen",
        "settings_caption": "Waehle Batterieannahmen und Datengrundlage fuer diesen Lauf.",
        "interface_header": "Interface",
        "interface_caption": "Anzeigeeinstellungen fuer diese Sitzung.",
        "language": "Sprache",
        "theme": "Design",
        "theme_warm": "Warm",
        "cap_label": "Batteriekapazitaet (MWh)",
        "cap_help": "Nutzbarer Energieinhalt der Batterie. Hoehere Kapazitaet erlaubt mehr Verschiebung zwischen niedrigen und hohen Preisen.",
        "cap_caption": "Gesamte speicherbare Energie der Batterie.",
        "crate_label": "Leistungs-Energie-Verhaeltnis (C-Rate)",
        "crate_help": "Legt die Lade-/Entladegeschwindigkeit relativ zur Kapazitaet fest. Beispiel: 0,5C entspricht voller Ladung oder Entladung in ca. 2 Stunden.",
        "crate_caption": "Leistungstempo der Batterie: hoehere C-Rate reagiert schneller auf Preisbewegungen.",
        "horizon_label": "Optimierungshorizont (Tage)",
        "horizon_help": "Anzahl der optimierten Zukunftstage pro Lauf. Laengere Horizonte zeigen uebergeordnete Muster.",
        "horizon_caption": "Planungsfenster der Optimierung.",
        "data_mode_label": "Datenmodus",
        "data_mode_help": "'sample' nutzt Beispieldaten. 'real' nutzt lokale ENTSO-E-Daten und kann mit API-Zugriff aktualisieren.",
        "data_mode_caption": "Quelle der Marktdaten fuer die Preisinputs.",
        "update_btn": "Daten jetzt aktualisieren",
        "update_caption": "Lokale Marktdaten aktualisieren (bei real-Modus und konfiguriertem API-Zugriff).",
        "run_btn": "Optimierung starten",
        "run_caption": "Optimierung ausfuehren und KPIs, Chart und Tabelle aktualisieren.",
        "kpi_header": "Kennzahlen",
        "kpi_rev": "Geschaetzter Gesamterloes",
        "kpi_rev_help": "Erwarteter Brutto-Gesamterloes aus allen aktivierten Erlosstroemen im gewaehlten Horizont (vor Gebuehren, Steuern und Degradationskosten).",
        "kpi_charge": "Durchschnittlicher Ladepreis",
        "kpi_charge_help": "Durchschnittlicher Day-Ahead-Preis in Lade-Stunden (wenn die Batterie Energie kauft).",
        "kpi_discharge": "Durchschnittlicher Entladepreis",
        "kpi_discharge_help": "Durchschnittlicher Day-Ahead-Preis in Entlade-Stunden (wenn die Batterie Energie verkauft).",
        "kpi_cycles": "Geschaetzte aequivalente Vollzyklen",
        "kpi_cycles_help": "Naeherungsweise Vollzyklus-Last im Horizont. 1,0 entspricht ungefaehr einem vollen Lade- plus Entladezyklus.",
        "kpi_power": "Konfigurierte Maximalleistung",
        "kpi_power_help": "Maximale Lade-/Entladeleistung aus Kapazitaet und gewaehlter C-Rate.",
        "stacking_header": "Revenue-Stacking-Annahmen",
        "stacking_caption": "Einfache Lernannahmen fuer Regelenergie- und Verfuegbarkeitserloese.",
        "fcr_toggle": "FCR-Verfuegbarkeit aktivieren",
        "afrr_toggle": "aFRR-Verfuegbarkeit + Aktivierung aktivieren",
        "capacity_toggle": "Kapazitaetszahlung aktivieren",
        "congestion_toggle": "Netzengpass-Bonus aktivieren",
        "fcr_rate_label": "FCR-Verfuegbarkeit (EUR/MW/h)",
        "afrr_avail_label": "aFRR-Verfuegbarkeit (EUR/MW/h)",
        "afrr_util_label": "aFRR-Aktivierungsverguetung (EUR/MWh)",
        "afrr_activation_label": "aFRR-Aktivierungsquote (0-1)",
        "capacity_rate_label": "Kapazitaetszahlung (EUR/MW/h)",
        "capacity_share_label": "Vertraglicher Leistungsanteil",
        "congestion_bonus_label": "Netzengpass-Bonus (EUR/MWh)",
        "revenue_breakdown_title": "Revenue-Aufteilung",
        "revenue_breakdown_caption": "Reale BESS-Betreiber verlassen sich selten nur auf Arbitrage. Revenue Stacking verbessert Auslastung und Risikobalance ueber verschiedene Marktphasen.",
        "stream_arbitrage": "Arbitrage",
        "stream_fcr": "FCR",
        "stream_afrr_availability": "aFRR-Verfuegbarkeit",
        "stream_afrr_utilization": "aFRR-Aktivierung",
        "stream_capacity": "Kapazitaetszahlung",
        "stream_congestion_bonus": "Netzengpass-Bonus",
        "chart_title": "Lade-/Entladeplan und SOC",
        "chart_subtitle": "Das Dispatch-Profil ist die zentrale Ausgabe jedes Laufs.",
        "charge_name": "Laden (MW)",
        "discharge_name": "Entladen (MW)",
        "soc_name": "SOC (MWh)",
        "x_title": "Zeit (stuendlich)",
        "y_title": "Batterieleistung (MW)",
        "y2_title": "Ladezustand (MWh)",
        "legend": "Reihen",
        "reading_guide": "Leseguide: Positive Balken = Laden, negative Balken = Entladen, gruene Linie = SOC. Hover zeigt exakte Werte je Zeitstempel.",
        "table_title": "Stuendliche Dispatch-Tabelle",
        "table_caption": "Detaillierter Stundenoutput: Marktpreis, Batterieaktion, SOC und resultierender Schritt-Erlos.",
        "time": "Zeit",
        "charge_power": "Ladeleistung",
        "discharge_power": "Entladeleistung",
        "price": "Preis",
        "soc": "Ladezustand",
        "step_revenue": "Schritt-Erlos",
    },
}


def _build_dashboard_context(
    dispatch: pd.DataFrame,
    total_revenue_eur: float,
    avg_charge_price_eur_mwh: float,
    avg_discharge_price_eur_mwh: float,
    power_mw: float,
    capacity_mwh: float,
    context_rows: int,
) -> str:
    """Build compact text context sent to the LLM assistant."""
    preview_cols = [
        "day_ahead_price_eur_mwh",
        "charge_mw",
        "discharge_mw",
        "soc_mwh",
        "step_revenue_eur",
    ]
    preview = dispatch[preview_cols].head(context_rows).to_csv(index=True)
    return (
        "OpenAutobidder-DE dashboard snapshot\n"
        f"- Horizon points: {len(dispatch)}\n"
        f"- BESS capacity_mwh: {capacity_mwh:.2f}\n"
        f"- BESS power_mw: {power_mw:.2f}\n"
        f"- Total revenue eur: {total_revenue_eur:.2f}\n"
        f"- Avg charge price eur/mwh: {avg_charge_price_eur_mwh:.2f}\n"
        f"- Avg discharge price eur/mwh: {avg_discharge_price_eur_mwh:.2f}\n"
        f"Timeseries preview (first {context_rows} rows):\n"
        f"{preview}"
    )


def main() -> None:
    """Render dashboard UI and optimization outputs."""
    st.set_page_config(page_title="OpenAutobidder-DE", layout="wide")
    if "ui_language" not in st.session_state:
        st.session_state.ui_language = "en"
    if "ui_theme" not in st.session_state:
        st.session_state.ui_theme = "warm"

    with st.sidebar.container(border=False):
        st.markdown(f"##### {I18N[st.session_state.ui_language]['interface_header']}")
        st.caption(I18N[st.session_state.ui_language]["interface_caption"])
        language = st.radio(
            I18N[st.session_state.ui_language]["language"],
            options=["en", "de"],
            index=0 if st.session_state.ui_language == "en" else 1,
            format_func=lambda option: "EN" if option == "en" else "DE",
            horizontal=True,
            key="ui_language_picker",
        )
        language_ui = I18N[language]
        st.caption(f"{language_ui['theme']}: {language_ui['theme_warm']}")
        theme = "warm"
    st.session_state.ui_language = language
    st.session_state.ui_theme = theme
    ui = I18N[language]
    active_tokens = DESIGN_TOKENS

    apply_design_theme(theme_mode="warm")
    st.markdown(
        (
            "<section class='oa-header-shell'>"
            f"<p class='oa-header-kicker'>{ui['header_kicker']}</p>"
            f"<h1 class='oa-header-title'>{ui['title']}</h1>"
            f"<p class='oa-header-subtitle'>{ui['subtitle']}</p>"
            "</section>"
        ),
        unsafe_allow_html=True,
    )

    with st.expander(ui["how_it_works"]):
        st.markdown(ui["how_it_works_text"])

    st.sidebar.header(ui["settings"])
    st.sidebar.caption(ui["settings_caption"])
    capacity_mwh = st.sidebar.slider(
        ui["cap_label"],
        min_value=2.0,
        max_value=40.0,
        value=3.9,
        step=0.1,
        help=ui["cap_help"],
    )
    st.sidebar.caption(ui["cap_caption"])
    power_ratio = st.sidebar.slider(
        ui["crate_label"],
        min_value=0.25,
        max_value=1.0,
        value=0.5,
        step=0.05,
        help=ui["crate_help"],
    )
    st.sidebar.caption(ui["crate_caption"])
    power_mw = capacity_mwh * power_ratio
    horizon_days = st.sidebar.selectbox(
        ui["horizon_label"],
        options=[1, 2, 7],
        index=0,
        help=ui["horizon_help"],
    )
    st.sidebar.caption(ui["horizon_caption"])
    data_mode = st.sidebar.selectbox(
        ui["data_mode_label"],
        options=["sample", "real"],
        index=0,
        help=ui["data_mode_help"],
    )
    st.sidebar.caption(ui["data_mode_caption"])
    st.sidebar.markdown(f"##### {ui['stacking_header']}")
    st.sidebar.caption(ui["stacking_caption"])
    enable_fcr = st.sidebar.toggle(ui["fcr_toggle"], value=True)
    enable_afrr = st.sidebar.toggle(ui["afrr_toggle"], value=True)
    enable_capacity_payment = st.sidebar.toggle(ui["capacity_toggle"], value=True)
    enable_congestion_bonus = st.sidebar.toggle(ui["congestion_toggle"], value=True)
    fcr_rate = st.sidebar.number_input(ui["fcr_rate_label"], min_value=0.0, value=5.0, step=0.5)
    afrr_avail_rate = st.sidebar.number_input(ui["afrr_avail_label"], min_value=0.0, value=3.0, step=0.5)
    afrr_util_rate = st.sidebar.number_input(ui["afrr_util_label"], min_value=0.0, value=35.0, step=1.0)
    afrr_activation_ratio = st.sidebar.slider(ui["afrr_activation_label"], min_value=0.0, max_value=1.0, value=0.2, step=0.05)
    capacity_rate = st.sidebar.number_input(ui["capacity_rate_label"], min_value=0.0, value=1.6, step=0.1)
    capacity_share = st.sidebar.slider(ui["capacity_share_label"], min_value=0.0, max_value=1.0, value=0.3, step=0.05)
    congestion_bonus = st.sidebar.number_input(ui["congestion_bonus_label"], min_value=0.0, value=12.0, step=1.0)
    update_clicked = st.sidebar.button(ui["update_btn"], width="stretch")
    st.sidebar.caption(ui["update_caption"])
    run_clicked = st.sidebar.button(ui["run_btn"], type="primary", width="stretch")
    st.sidebar.caption(ui["run_caption"])

    bess = BESSConfig(
        capacity_mwh=capacity_mwh,
        power_mw=power_mw,
    )

    if update_clicked:
        try:
            paths = update_local_data(days=max(horizon_days, 2))
            st.sidebar.success(f"Updated data: {paths['prices'].name}, {paths['generation'].name}")
        except Exception as exc:
            st.sidebar.warning(f"Live data update failed. Using cached/sample data. Details: {exc}")

    if "optimization_result" not in st.session_state:
        st.session_state.optimization_result = None
        st.session_state.market_data = None
        st.session_state.load_result = None
        st.session_state.optimization_signature = None

    optimization_signature = (
        capacity_mwh,
        power_ratio,
        horizon_days,
        data_mode,
        enable_fcr,
        enable_afrr,
        enable_capacity_payment,
        enable_congestion_bonus,
        fcr_rate,
        afrr_avail_rate,
        afrr_util_rate,
        afrr_activation_ratio,
        capacity_rate,
        capacity_share,
        congestion_bonus,
    )
    if (
        run_clicked
        or st.session_state.optimization_result is None
        or st.session_state.optimization_signature != optimization_signature
    ):
        load_result = load_market_data_for_mode(mode=data_mode, periods=horizon_days * 24)
        market_data = load_result.market_data
        market_data = market_data.copy()
        market_data["fcr_availability_eur_mw_h"] = fcr_rate
        market_data["afrr_availability_eur_mw_h"] = afrr_avail_rate
        market_data["afrr_utilization_eur_mwh"] = afrr_util_rate
        market_data["afrr_activation_ratio"] = afrr_activation_ratio
        market_data["capacity_payment_eur_mw_h"] = capacity_rate
        market_data["congestion_bonus_eur_mwh"] = congestion_bonus
        result = optimize_bess_with_stacking(
            market_data=market_data,
            bess=bess,
            stacking=RevenueStackingConfig(
                enable_fcr=enable_fcr,
                enable_afrr=enable_afrr,
                enable_capacity_payment=enable_capacity_payment,
                enable_congestion_bonus=enable_congestion_bonus,
                capacity_contract_share_of_power=capacity_share,
            ),
        )
        st.session_state.optimization_result = result
        st.session_state.market_data = market_data
        st.session_state.load_result = load_result
        st.session_state.optimization_signature = optimization_signature
    else:
        load_result = st.session_state.load_result
        market_data = st.session_state.market_data
        result = st.session_state.optimization_result

    source_label_map = {
        "cached": "Local ENTSO-E cache",
        "sample": "Bundled sample dataset",
        "synthetic": "Synthetic fallback",
    }
    source_label = source_label_map.get(load_result.source, load_result.source)
    if load_result.last_updated:
        updated_local = load_result.last_updated.astimezone(UTC).strftime("%Y-%m-%d %H:%M UTC")
        st.caption(f"Data source: {source_label} | Last update: {updated_local}")
    else:
        st.caption(f"Data source: {source_label} | Last update: not available")
    if load_result.warning:
        st.warning(load_result.warning)
    dispatch = result.dispatch
    revenue_breakdown = result.revenue_breakdown_eur or {"arbitrage": result.total_revenue_eur}

    st.markdown("<div class='oa-section-spacer'></div>", unsafe_allow_html=True)
    st.subheader(ui["kpi_header"])
    col1, col2, col3, col4, col5 = st.columns(5)
    col1.metric(
        ui["kpi_rev"],
        f"{result.total_revenue_eur:,.0f} EUR",
        help=ui["kpi_rev_help"],
    )
    col2.metric(
        ui["kpi_charge"],
        f"{result.avg_charge_price_eur_mwh:,.2f} EUR/MWh",
        help=ui["kpi_charge_help"],
    )
    col3.metric(
        ui["kpi_discharge"],
        f"{result.avg_discharge_price_eur_mwh:,.2f} EUR/MWh",
        help=ui["kpi_discharge_help"],
    )
    col4.metric(
        ui["kpi_cycles"],
        f"{result.estimated_cycles:,.2f}x",
        help=ui["kpi_cycles_help"],
    )
    col5.metric(
        ui["kpi_power"],
        f"{power_mw:,.2f} MW",
        help=ui["kpi_power_help"],
    )
    stream_name_map = {
        "arbitrage": ui["stream_arbitrage"],
        "fcr": ui["stream_fcr"],
        "afrr_availability": ui["stream_afrr_availability"],
        "afrr_utilization": ui["stream_afrr_utilization"],
        "capacity": ui["stream_capacity"],
        "congestion_bonus": ui["stream_congestion_bonus"],
    }
    non_zero_streams = [(k, v) for k, v in revenue_breakdown.items() if abs(v) > 1e-9]
    if non_zero_streams:
        kpi_cols = st.columns(len(non_zero_streams))
        for idx_stream, (stream_key, stream_value) in enumerate(non_zero_streams):
            kpi_cols[idx_stream].metric(stream_name_map.get(stream_key, stream_key), f"{stream_value:,.0f} EUR")

    st.subheader(ui["revenue_breakdown_title"])
    st.caption(ui["revenue_breakdown_caption"])
    breakdown_df = pd.DataFrame(
        {
            "stream": [stream_name_map.get(k, k) for k in revenue_breakdown.keys()],
            "value_eur": list(revenue_breakdown.values()),
        }
    )
    breakdown_df = breakdown_df[breakdown_df["value_eur"].abs() > 1e-9]
    if not breakdown_df.empty:
        breakdown_fig = go.Figure(
            data=[
                go.Pie(
                    labels=breakdown_df["stream"],
                    values=breakdown_df["value_eur"],
                    hole=0.45,
                    marker=dict(
                        colors=[
                            active_tokens["primary"],
                            active_tokens["accent"],
                            active_tokens["highlight"],
                            active_tokens["warning"],
                            "#6F826A",
                            "#B17A56",
                        ]
                    ),
                    textinfo="label+percent",
                )
            ]
        )
        breakdown_fig.update_layout(
            paper_bgcolor=active_tokens["background"],
            plot_bgcolor="rgba(255,255,255,0)",
            margin=dict(l=12, r=12, t=12, b=12),
            font=dict(color=active_tokens["text"]),
        )
        st.plotly_chart(breakdown_fig, width="stretch", config={"displaylogo": False})

    st.markdown(
        (
            "<section class='oa-hero-chart-intro'>"
            f"<h2>{ui['chart_title']}</h2>"
            f"<p>{ui['chart_subtitle']}</p>"
            "</section>"
        ),
        unsafe_allow_html=True,
    )

    chart_hover_data = dispatch[
        ["charge_mw", "discharge_mw", "soc_mwh", "day_ahead_price_eur_mwh", "step_revenue_eur"]
    ].to_numpy()

    fig = go.Figure()
    fig.add_trace(
        go.Bar(
            x=dispatch.index,
            y=dispatch["charge_mw"],
            name=ui["charge_name"],
            marker_color=active_tokens["highlight"],
            marker_line=dict(color="rgba(46, 74, 62, 0.45)", width=0.55),
            opacity=0.84,
            hovertemplate=(
                f"{ui['time']}: %{{x|%Y-%m-%d %H:%M}}<br>"
                f"{ui['charge_power']}: %{{customdata[0]:.2f}} MW<br>"
                f"{ui['discharge_power']}: %{{customdata[1]:.2f}} MW<br>"
                f"{ui['soc']}: %{{customdata[2]:.2f}} MWh<br>"
                f"{ui['price']}: %{{customdata[3]:.2f}} EUR/MWh<br>"
                f"{ui['step_revenue']}: %{{customdata[4]:.2f}} EUR"
                "<extra></extra>"
            ),
            customdata=chart_hover_data,
        )
    )
    fig.add_trace(
        go.Bar(
            x=dispatch.index,
            y=-dispatch["discharge_mw"],
            name=ui["discharge_name"],
            marker_color=active_tokens["warning"],
            marker_line=dict(color="rgba(76, 58, 26, 0.42)", width=0.55),
            opacity=0.76,
            hovertemplate=(
                f"{ui['time']}: %{{x|%Y-%m-%d %H:%M}}<br>"
                f"{ui['charge_power']}: %{{customdata[0]:.2f}} MW<br>"
                f"{ui['discharge_power']}: %{{customdata[1]:.2f}} MW<br>"
                f"{ui['soc']}: %{{customdata[2]:.2f}} MWh<br>"
                f"{ui['price']}: %{{customdata[3]:.2f}} EUR/MWh<br>"
                f"{ui['step_revenue']}: %{{customdata[4]:.2f}} EUR"
                "<extra></extra>"
            ),
            customdata=chart_hover_data,
        )
    )
    fig.add_trace(
        go.Scatter(
            x=dispatch.index,
            y=dispatch["soc_mwh"],
            name=ui["soc_name"],
            mode="lines",
            yaxis="y2",
            line=dict(color=active_tokens["primary"], width=3.3, shape="spline", smoothing=1.0),
            hovertemplate=(
                f"{ui['time']}: %{{x|%Y-%m-%d %H:%M}}<br>"
                f"{ui['charge_power']}: %{{customdata[0]:.2f}} MW<br>"
                f"{ui['discharge_power']}: %{{customdata[1]:.2f}} MW<br>"
                f"{ui['soc']}: %{{customdata[2]:.2f}} MWh<br>"
                f"{ui['price']}: %{{customdata[3]:.2f}} EUR/MWh<br>"
                f"{ui['step_revenue']}: %{{customdata[4]:.2f}} EUR"
                "<extra></extra>"
            ),
            customdata=chart_hover_data,
        )
    )
    fig.update_layout(
        barmode="relative",
        paper_bgcolor=active_tokens["background"],
        plot_bgcolor="rgba(255,255,255,0)",
        font=dict(color=active_tokens["text"]),
        margin=dict(l=12, r=12, t=18, b=30),
        hovermode="x unified",
        hoverlabel=dict(
            bgcolor=active_tokens["card_background"],
            bordercolor=active_tokens["card_border"],
            font=dict(color=active_tokens["text"], size=13),
            namelength=-1,
        ),
        xaxis_title=ui["x_title"],
        yaxis=dict(
            title=ui["y_title"],
            gridcolor="rgba(212, 199, 181, 0.36)",
            gridwidth=1,
            zeroline=True,
            zerolinecolor="rgba(212, 199, 181, 0.45)",
        ),
        yaxis2=dict(
            title=ui["y2_title"],
            overlaying="y",
            side="right",
            showgrid=False,
        ),
        xaxis=dict(
            gridcolor="rgba(212, 199, 181, 0.32)",
            gridwidth=1,
            zeroline=False,
            showspikes=True,
            spikemode="across",
            spikecolor="rgba(93, 93, 93, 0.28)",
            spikethickness=1,
        ),
        legend=dict(
            title=ui["legend"],
            orientation="h",
            yanchor="bottom",
            y=1.04,
            x=0,
            bgcolor="rgba(0,0,0,0)",
            bordercolor="rgba(231, 222, 209, 0.7)",
            borderwidth=0.5,
            font=dict(size=12.5),
        ),
    )
    st.plotly_chart(
        fig,
        width="stretch",
        config={
            "displaylogo": False,
            "modeBarButtonsToRemove": ["lasso2d", "select2d"],
        },
    )
    st.caption(ui["reading_guide"])

    st.subheader(ui["table_title"])
    st.caption(ui["table_caption"])
    dispatch_table = dispatch[
        [
            "day_ahead_price_eur_mwh",
            "charge_mw",
            "discharge_mw",
            "soc_mwh",
            "step_revenue_eur",
        ]
    ].rename(
        columns={
            "day_ahead_price_eur_mwh": f"{ui['price']} (EUR/MWh)",
            "charge_mw": f"{ui['charge_power']} (MW)",
            "discharge_mw": f"{ui['discharge_power']} (MW)",
            "soc_mwh": f"{ui['soc']} (MWh)",
            "step_revenue_eur": f"{ui['step_revenue']} (EUR)",
        }
    )
    st.dataframe(dispatch_table, width="stretch")

    st.divider()
    st.subheader("AI Assistant")
    settings = load_chat_settings()
    api_key_available = bool(settings.api_key)
    selected_model = settings.model or "grok-4.20-0309-non-reasoning"
    chat_timeout = 35
    context_rows = 18
    max_history_messages = 6
    temperature = 0.2

    if "chat_history" not in st.session_state:
        st.session_state.chat_history = []

    col_info, col_clear = st.columns([4, 1])
    with col_info:
        st.caption("The assistant answers questions using the current dashboard state and optimization outputs.")
    with col_clear:
        if st.button("Clear", width="stretch"):
            st.session_state.chat_history = []
            st.rerun()

    if not api_key_available:
        st.warning(
            "No chat API key found. Set OPENAUTOBIDDER_CHAT_API_KEY or XAI_API_KEY, then rerun Streamlit."
        )

    chat_button_text = active_tokens["primary"]
    chat_panel_text = active_tokens["text"]
    st.markdown(
        f"""
        <style>
        div[data-testid="stPopover"] {{
            position: fixed;
            right: 24px;
            bottom: 24px;
            z-index: 99999;
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
        }}
        div[data-testid="stPopover"] button {{
            width: 62px;
            height: 62px;
            border-radius: 9999px;
            border: 1px solid {active_tokens["card_border"]};
            background: color-mix(in srgb, {active_tokens["accent"]} 20%, #FFFFFF);
            color: {chat_button_text};
            font-size: 28px;
            line-height: 1;
            font-weight: 600;
            box-shadow: 0 12px 26px rgba(67, 55, 36, 0.16);
        }}
        div[data-testid="stPopover"] button:hover {{
            filter: brightness(1.03);
            transform: translateY(-1px);
        }}
        div[data-testid="stPopover"] button:focus {{
            outline: 2px solid {active_tokens["accent"]};
            outline-offset: 2px;
        }}
        div[data-testid="stPopoverBody"] {{
            background: {active_tokens["card_background"]};
            border: 1px solid {active_tokens["card_border"]};
            border-radius: 16px;
            min-width: 420px;
            max-width: min(92vw, 560px);
            box-shadow: 0 16px 32px rgba(67, 55, 36, 0.14);
            color: {chat_panel_text};
            line-height: 1.6;
        }}
        div[data-testid="stPopoverBody"] [data-testid="stMarkdownContainer"] p,
        div[data-testid="stPopoverBody"] [data-testid="stMarkdownContainer"] li,
        div[data-testid="stPopoverBody"] label,
        div[data-testid="stPopoverBody"] input {{
            color: {chat_panel_text} !important;
            font-size: 0.95rem;
        }}
        div[data-testid="stPopoverBody"] input {{
            min-height: 42px;
            border-radius: 10px !important;
            border: 1px solid {active_tokens["card_border"]} !important;
        }}
        @media (max-width: 900px) {{
            div[data-testid="stPopover"] {{
                right: 16px;
                bottom: 16px;
            }}
            div[data-testid="stPopoverBody"] {{
                min-width: min(92vw, 360px);
            }}
        }}
        </style>
        """,
        unsafe_allow_html=True,
    )

    with st.popover("💬"):
        st.caption("Ask about dispatch behavior, prices, KPIs, and optimization results.")
        for msg in st.session_state.chat_history:
            with st.chat_message(msg["role"]):
                st.markdown(msg["content"])

        with st.form("assistant_chat_form", clear_on_submit=True):
            prompt = st.text_input("Your question")
            send = st.form_submit_button("Send", type="primary")

        if send and prompt.strip():
            prompt = prompt.strip()
            st.session_state.chat_history.append({"role": "user", "content": prompt})
            with st.chat_message("user"):
                st.markdown(prompt)

            with st.chat_message("assistant"):
                if not api_key_available:
                    answer = (
                        "Chat is not configured yet. Please set OPENAUTOBIDDER_CHAT_API_KEY "
                        "(or XAI_API_KEY) and restart the app."
                    )
                    st.markdown(answer)
                else:
                    context = _build_dashboard_context(
                        dispatch=dispatch,
                        total_revenue_eur=result.total_revenue_eur,
                        avg_charge_price_eur_mwh=result.avg_charge_price_eur_mwh,
                        avg_discharge_price_eur_mwh=result.avg_discharge_price_eur_mwh,
                        power_mw=power_mw,
                        capacity_mwh=capacity_mwh,
                        context_rows=context_rows,
                    )
                    with st.status("Processing request...", expanded=False) as status:
                        status.write("Building compact dashboard context...")
                        status.write("Calling LLM API...")
                        try:
                            answer = ask_about_dashboard(
                                question=prompt,
                                dashboard_context=context,
                                chat_history=st.session_state.chat_history,
                                request_config=ChatRequestConfig(
                                    model=selected_model,
                                    timeout_seconds=chat_timeout,
                                    temperature=temperature,
                                    max_history_messages=max_history_messages,
                                ),
                            )
                            status.update(label="Response ready", state="complete")
                        except Exception as exc:
                            answer = f"Chat request failed: {exc}"
                            status.update(label="Request failed", state="error")
                    st.markdown(answer)
            st.session_state.chat_history.append({"role": "assistant", "content": answer})


if __name__ == "__main__":
    main()
