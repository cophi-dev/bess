"""Simulator page for OpenAutobidder-DE dispatch optimization."""

from __future__ import annotations

import sys
from datetime import UTC
from pathlib import Path

import pandas as pd
import plotly.graph_objects as go
import streamlit as st

# Ensure `src/` is importable when running `streamlit run src/dashboard/app.py`.
PROJECT_SRC = Path(__file__).resolve().parents[2]
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
            "BESS Kompass – Educational Simulator. "
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
        "battery_header": "Battery",
        "battery_caption": "Physical storage assumptions used by the optimizer.",
        "data_header": "Data",
        "data_caption": "Select the hourly market-data window behind this run.",
        "scenario_header": "Sensitivity",
        "scenario_caption_header": "Optional larger-pack comparison with the same C-rate.",
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
        "hero_header": "At a glance",
        "hero_window": "Horizon: {days} day(s) — {steps} hourly steps in this run.",
        "hero_installed": "Installed storage",
        "hero_power_sub": "{mw:.1f} MW at selected C-rate",
        "hero_zone_load": "Zone load (consumption proxy)",
        "hero_zone_sub": "Mean {gw:.1f} GW",
        "hero_bess_out": "Battery · discharged",
        "hero_bess_in": "{mwh:,.0f} MWh charged in-window",
        "hero_revenue": "Total revenue (gross)",
        "load_caption": "ENTSO-E actual system load, DE-LU. Hourly when published at sub-hourly resolution.",
        "kpi_economics_header": "Markets and economics",
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
        "scenario_label": "Extra storage to compare (MWh)",
        "scenario_help": "Optional second run: same C-rate, capacity increased by this amount.",
        "scenario_caption": "Larger pack scenario for sensitivity.",
        "scenario_row_title": "Sensitivity vs larger pack",
        "scenario_delta_rev": "Δ revenue",
        "scenario_delta_dis": "Δ discharged",
        "scenario_delta_cyc": "Δ equiv. cycles",
        "scenario_delta_rev_per_mwh": "Δ revenue / added MWh",
        "stacking_header": "Revenue Stacking Assumptions",
        "stacking_caption": "Simple educational assumptions for ancillary, capacity, and congestion revenues.",
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
        "congestion_signal_label": "Congestion signal intensity",
        "congestion_signal_help": "Multiplier for the derived/provided congestion signal. 0 disables the signal; 1 keeps the data-driven proxy; values above 1 stress-test stronger congestion windows.",
        "assumption_inputs_note": "Data-backed: day-ahead prices, wind/solar generation, and system load. Assumption-backed: FCR, aFRR, capacity payment, congestion bonus, and congestion intensity.",
        "provenance_data_source": "Data source",
        "provenance_scope": "Scope",
        "provenance_last_update": "Last update",
        "provenance_congestion_signal": "Congestion signal",
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
        "vnb_kicker": "DSO decision lens",
        "vnb_title": "Market strong is not enough: the dispatch must fit the local grid",
        "vnb_intro": (
            "This run provides the market and dispatch signal. A distribution system operator should "
            "combine it with local load-flow, congestion, voltage, and current checks before approving a grid node."
        ),
        "vnb_run_signal": "Current run signal",
        "vnb_run_signal_text": (
            "{revenue} EUR gross revenue in the selected horizon; roughly {annualized} EUR/year if scaled linearly. "
            "Use this as a learning signal, not a forecast."
        ),
        "vnb_market_title": "Market attractiveness",
        "vnb_market_label": "Price signal",
        "vnb_market_text": "Strong means robust expected annual revenue from arbitrage, FCR, aFRR, capacity, and congestion assumptions.",
        "vnb_grid_title": "Grid usefulness",
        "vnb_grid_label": "Local grid effect",
        "vnb_grid_text": "Suitable means the typical schedule relieves local constraints; critical means it can worsen congestion or redispatch.",
        "vnb_cell_prioritize_title": "Market strong, grid suitable",
        "vnb_cell_prioritize_label": "Prioritize",
        "vnb_cell_prioritize_text": "Price signal and grid relief point in the same direction.",
        "vnb_cell_review_title": "Market strong, grid critical",
        "vnb_cell_review_label": "Review",
        "vnb_cell_review_text": "Good revenue can still worsen congestion; require constraints or a redispatch contract.",
        "vnb_cell_option_title": "Market weak, grid suitable",
        "vnb_cell_option_label": "Optionality",
        "vnb_cell_option_text": "Grid value may need connection terms, flexibility products, or long-term contracts.",
        "vnb_cell_defer_title": "Market weak, grid critical",
        "vnb_cell_defer_label": "Defer",
        "vnb_cell_defer_text": "Neither the market signal nor the grid effect carries the case.",
        "vnb_vertical_axis": "Grid effect",
        "vnb_horizontal_axis": "Market attractiveness",
        "vnb_checklist_title": "Practical DSO check",
        "vnb_step_1": "Request an OpenAutobidder-DE run for the exact grid node: revenue stack and typical dispatch.",
        "vnb_step_2": "Run a grid simulation with this dispatch and compare against known congestion windows.",
        "vnb_step_3": "Estimate redispatch, voltage, and current-loading effects with and without the battery.",
        "vnb_step_4": "Score both axes and decide by the quadrant.",
        "vnb_reminder": "Reminder: a high market spread alone is never enough. The dispatch has to match the local grid situation.",
    },
    "de": {
        "title": "OpenAutobidder-DE",
        "subtitle": (
            "BESS Kompass – Educational Simulator. "
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
        "battery_header": "Batterie",
        "battery_caption": "Physikalische Speicherannahmen fuer die Optimierung.",
        "data_header": "Daten",
        "data_caption": "Waehle das stuendliche Marktdatenfenster fuer diesen Lauf.",
        "scenario_header": "Sensitivitaet",
        "scenario_caption_header": "Optionaler Vergleich mit groesserem Pack und gleicher C-Rate.",
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
        "hero_header": "Auf einen Blick",
        "hero_window": "Horizont: {days} Tag(e) — {steps} Stunden in diesem Lauf.",
        "hero_installed": "Installierter Speicher",
        "hero_power_sub": "{mw:.1f} MW bei gewaehlter C-Rate",
        "hero_zone_load": "Zonenlast (Verbrauchs-Proxy)",
        "hero_zone_sub": "Mittel {gw:.1f} GW",
        "hero_bess_out": "Batterie · entladen",
        "hero_bess_in": "{mwh:,.0f} MWh geladen im Fenster",
        "hero_revenue": "Gesamterloes (brutto)",
        "load_caption": "ENTSO-E tatsaechliche Systemlast, DE-LU. Stuendlich aggregiert, falls unterstuendig.",
        "kpi_economics_header": "Markt und Wirtschaft",
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
        "scenario_label": "Zusatz-Speicher zum Vergleich (MWh)",
        "scenario_help": "Optionaler zweiter Lauf: gleiche C-Rate, Kapazitaet um diesen Wert erhoeht.",
        "scenario_caption": "Groesserer Speicher: Sensitivitaet.",
        "scenario_row_title": "Sensitivitaet vs. groesseres Pack",
        "scenario_delta_rev": "Delta Erloes",
        "scenario_delta_dis": "Delta Entladung",
        "scenario_delta_cyc": "Delta Vollzyklen",
        "scenario_delta_rev_per_mwh": "Delta Erloes / Zusatz-MWh",
        "stacking_header": "Revenue-Stacking-Annahmen",
        "stacking_caption": "Einfache Lernannahmen fuer Regelenergie-, Kapazitaets- und Engpasserloese.",
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
        "congestion_signal_label": "Intensitaet des Engpasssignals",
        "congestion_signal_help": "Multiplikator fuer das abgeleitete oder gelieferte Engpasssignal. 0 deaktiviert das Signal; 1 nutzt den Daten-Proxy; Werte ueber 1 testen staerkere Engpassfenster.",
        "assumption_inputs_note": "Datenbasiert: Day-Ahead-Preise, Wind-/Solarerzeugung und Systemlast. Annahmebasiert: FCR, aFRR, Kapazitaetszahlung, Engpassbonus und Engpassintensitaet.",
        "provenance_data_source": "Datenquelle",
        "provenance_scope": "Scope",
        "provenance_last_update": "Letztes Update",
        "provenance_congestion_signal": "Engpasssignal",
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
        "vnb_kicker": "VNB-Entscheidungslogik",
        "vnb_title": "Markt stark reicht nicht: Der Fahrplan muss zur lokalen Netzlage passen",
        "vnb_intro": (
            "Dieser Lauf liefert das Markt- und Fahrplansignal. Ein Verteilnetzbetreiber sollte es "
            "mit Lastfluss, Engpasszeiten, Spannungsband und Strombelastung am konkreten Netzpunkt kombinieren."
        ),
        "vnb_run_signal": "Signal aus diesem Lauf",
        "vnb_run_signal_text": (
            "{revenue} EUR Bruttoerloes im gewaehlten Horizont; linear skaliert etwa {annualized} EUR/Jahr. "
            "Als Lernsignal lesen, nicht als Prognose."
        ),
        "vnb_market_title": "Marktattraktivitaet",
        "vnb_market_label": "Preissignal",
        "vnb_market_text": "Stark heisst: robuster erwarteter Jahreserloes aus Arbitrage, FCR, aFRR, Kapazitaet und Engpassannahmen.",
        "vnb_grid_title": "Netzdienlichkeit",
        "vnb_grid_label": "Lokale Netzwirkung",
        "vnb_grid_text": "Passend heisst: der typische Fahrplan entlastet den Netzpunkt; kritisch heisst: er kann Engpaesse oder Redispatch verstaerken.",
        "vnb_cell_prioritize_title": "Markt stark, Netz passend",
        "vnb_cell_prioritize_label": "Priorisieren",
        "vnb_cell_prioritize_text": "Preislogik und Netzentlastung zeigen in dieselbe Richtung.",
        "vnb_cell_review_title": "Markt stark, Netz kritisch",
        "vnb_cell_review_label": "Pruefen",
        "vnb_cell_review_text": "Guter Ertrag kann Engpaesse verschaerfen; nur mit Auflagen oder Redispatch-Vertrag zulassen.",
        "vnb_cell_option_title": "Markt schwach, Netz passend",
        "vnb_cell_option_label": "Optionalitaet",
        "vnb_cell_option_text": "Netznutzen kann ueber Anschlussbedingungen, Flexprodukte oder langfristige Vertraege entstehen.",
        "vnb_cell_defer_title": "Markt schwach, Netz kritisch",
        "vnb_cell_defer_label": "Zurueckstellen",
        "vnb_cell_defer_text": "Weder Ertragssignal noch Standortlogik tragen den Case.",
        "vnb_vertical_axis": "Netzwirkung",
        "vnb_horizontal_axis": "Marktattraktivitaet",
        "vnb_checklist_title": "Praktische VNB-Pruefung",
        "vnb_step_1": "OpenAutobidder-DE-Lauf fuer den exakten Netzpunkt anfordern: Revenue Stack und typischer Fahrplan.",
        "vnb_step_2": "Netzsimulation mit diesem Fahrplan rechnen und mit bekannten Engpasszeiten abgleichen.",
        "vnb_step_3": "Redispatch-, Spannungs- und Strombelastungswirkung mit und ohne Speicher schaetzen.",
        "vnb_step_4": "Beide Achsen bewerten und nach Quadrant entscheiden.",
        "vnb_reminder": "Merke: Ein hoher Markt-Spread allein reicht nie. Der Fahrplan muss zur lokalen Netzlage passen.",
    },
}


def _hero_snapshot_html(
    ui: dict[str, str],
    *,
    horizon_days: int,
    n_steps: int,
    capacity_mwh: float,
    power_mw: float,
    zone_load_mwh: float,
    mean_gw: float,
    discharged_mwh: float,
    charged_mwh: float,
    revenue_eur: float,
) -> str:
    return (
        f"<p class='oa-hero-window'>{ui['hero_window'].format(days=horizon_days, steps=n_steps)}</p>"
        "<div class='oa-hero-metric-row'>"
        f"<div class='oa-hero-tile'><div class='oa-hero-k'>{ui['hero_installed']}</div>"
        f"<div class='oa-hero-v'>{capacity_mwh:,.1f} MWh</div>"
        f"<div class='oa-hero-s'>{ui['hero_power_sub'].format(mw=power_mw)}</div></div>"
        f"<div class='oa-hero-tile'><div class='oa-hero-k'>{ui['hero_zone_load']}</div>"
        f"<div class='oa-hero-v'>{zone_load_mwh:,.0f} MWh</div>"
        f"<div class='oa-hero-s'>{ui['hero_zone_sub'].format(gw=mean_gw)}</div></div>"
        f"<div class='oa-hero-tile'><div class='oa-hero-k'>{ui['hero_bess_out']}</div>"
        f"<div class='oa-hero-v'>{discharged_mwh:,.1f} MWh</div>"
        f"<div class='oa-hero-s'>{ui['hero_bess_in'].format(mwh=charged_mwh)}</div></div>"
        f"<div class='oa-hero-tile'><div class='oa-hero-k'>{ui['hero_revenue']}</div>"
        f"<div class='oa-hero-v'>{revenue_eur:,.0f} EUR</div></div>"
        "</div>"
    )


def _scenario_delta_html(
    ui: dict[str, str],
    *,
    extra_mwh: float,
    delta_revenue: float,
    delta_discharged: float,
    delta_cycles: float,
    delta_revenue_per_mwh: float,
) -> str:
    return (
        f"<p class='oa-hero-window' style='font-weight:600'>{ui['scenario_row_title']} "
        f"(+{extra_mwh:,.1f} MWh)</p>"
        "<div class='oa-scenario-delta-row'>"
        f"<span><strong>{ui['scenario_delta_rev']}</strong> {delta_revenue:+,.0f} EUR</span>"
        f"<span><strong>{ui['scenario_delta_dis']}</strong> {delta_discharged:+,.1f} MWh</span>"
        f"<span><strong>{ui['scenario_delta_cyc']}</strong> {delta_cycles:+.2f}</span>"
        f"<span><strong>{ui['scenario_delta_rev_per_mwh']}</strong> {delta_revenue_per_mwh:+,.0f} EUR/MWh</span>"
        "</div>"
    )


def _provenance_badges_html(
    ui: dict[str, str],
    *,
    source_label: str,
    zone_interval: str,
    last_update: str,
    congestion_signal_source: str,
) -> str:
    items = [
        (ui["provenance_data_source"], source_label),
        (ui["provenance_scope"], zone_interval),
        (ui["provenance_last_update"], last_update),
        (ui["provenance_congestion_signal"], congestion_signal_source.replace("_", " ")),
    ]
    badges = "".join(
        (
            "<div class='oa-hero-tile'>"
            f"<div class='oa-hero-k'>{label}</div>"
            f"<div class='oa-hero-s' style='margin-top:0.25rem'>{value}</div>"
            "</div>"
        )
        for label, value in items
    )
    return f"<div class='oa-hero-metric-row'>{badges}</div>"


def _load_result_metadata(load_result: object, market_data: pd.DataFrame) -> dict[str, object]:
    """Return provenance fields even when older session-state objects lack new attributes."""
    congestion_signal_source = getattr(load_result, "congestion_signal_source", None)
    if not congestion_signal_source:
        congestion_signal_source = market_data.attrs.get(
            "congestion_signal_source",
            "available" if "congestion_signal" in market_data.columns else "unknown",
        )

    return {
        "source": getattr(load_result, "source", "unknown"),
        "market_zone": getattr(load_result, "market_zone", "DE_LU"),
        "interval": getattr(load_result, "interval", "1h"),
        "last_updated": getattr(load_result, "last_updated", None),
        "warning": getattr(load_result, "warning", None),
        "congestion_signal_source": str(congestion_signal_source),
    }


def _vnb_decision_html(
    ui: dict[str, str],
    *,
    total_revenue_eur: float,
    horizon_days: int,
) -> str:
    annualized_revenue = total_revenue_eur * 365.0 / max(float(horizon_days), 1.0)
    axis_cards = [
        (ui["vnb_market_label"], ui["vnb_market_title"], ui["vnb_market_text"]),
        (ui["vnb_grid_label"], ui["vnb_grid_title"], ui["vnb_grid_text"]),
    ]
    matrix_cells = [
        (
            "oa-vnb-cell-primary",
            ui["vnb_cell_prioritize_label"],
            ui["vnb_cell_prioritize_title"],
            ui["vnb_cell_prioritize_text"],
        ),
        (
            "oa-vnb-cell-warning",
            ui["vnb_cell_review_label"],
            ui["vnb_cell_review_title"],
            ui["vnb_cell_review_text"],
        ),
        (
            "oa-vnb-cell-highlight",
            ui["vnb_cell_option_label"],
            ui["vnb_cell_option_title"],
            ui["vnb_cell_option_text"],
        ),
        (
            "oa-vnb-cell-muted",
            ui["vnb_cell_defer_label"],
            ui["vnb_cell_defer_title"],
            ui["vnb_cell_defer_text"],
        ),
    ]
    checklist = [ui[f"vnb_step_{step}"] for step in range(1, 5)]
    axis_html = "".join(
        (
            "<div class='oa-vnb-axis-card'>"
            f"<p>{label}</p>"
            f"<h3>{title}</h3>"
            f"<span>{text}</span>"
            "</div>"
        )
        for label, title, text in axis_cards
    )
    cells_html = "".join(
        (
            f"<div class='oa-vnb-cell {tone}'>"
            f"<p>{label}</p>"
            f"<h3>{title}</h3>"
            f"<span>{text}</span>"
            "</div>"
        )
        for tone, label, title, text in matrix_cells
    )
    checklist_html = "".join(f"<li>{item}</li>" for item in checklist)
    run_signal = ui["vnb_run_signal_text"].format(
        revenue=f"{total_revenue_eur:,.0f}",
        annualized=f"{annualized_revenue:,.0f}",
    )
    return (
        "<section class='oa-vnb-section'>"
        f"<p class='oa-vnb-kicker'>{ui['vnb_kicker']}</p>"
        f"<h2>{ui['vnb_title']}</h2>"
        f"<p class='oa-vnb-intro'>{ui['vnb_intro']}</p>"
        "<div class='oa-vnb-axis-grid'>"
        f"<div class='oa-vnb-run'><p>{ui['vnb_run_signal']}</p><span>{run_signal}</span></div>"
        f"{axis_html}"
        "</div>"
        "<div class='oa-vnb-matrix-shell'>"
        f"<div class='oa-vnb-axis-vertical'>{ui['vnb_vertical_axis']}</div>"
        "<div class='oa-vnb-matrix'>"
        f"{cells_html}"
        f"<p class='oa-vnb-axis-horizontal'>{ui['vnb_horizontal_axis']}</p>"
        "</div>"
        "</div>"
        "<div class='oa-vnb-checklist'>"
        f"<h3>{ui['vnb_checklist_title']}</h3>"
        f"<ol>{checklist_html}</ol>"
        f"<p>{ui['vnb_reminder']}</p>"
        "</div>"
        "</section>"
    )


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
    st.sidebar.markdown(f"##### {ui['battery_header']}")
    st.sidebar.caption(ui["battery_caption"])
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

    st.sidebar.markdown(f"##### {ui['data_header']}")
    st.sidebar.caption(ui["data_caption"])
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
    update_clicked = st.sidebar.button(ui["update_btn"], width="stretch")
    st.sidebar.caption(ui["update_caption"])

    st.sidebar.markdown(f"##### {ui['scenario_header']}")
    st.sidebar.caption(ui["scenario_caption_header"])
    extra_storage_mwh = st.sidebar.slider(
        ui["scenario_label"],
        min_value=0.0,
        max_value=20.0,
        value=0.0,
        step=0.5,
        help=ui["scenario_help"],
    )
    st.sidebar.caption(ui["scenario_caption"])
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
    congestion_signal_multiplier = st.sidebar.slider(
        ui["congestion_signal_label"],
        min_value=0.0,
        max_value=2.0,
        value=1.0,
        step=0.1,
        help=ui["congestion_signal_help"],
    )
    run_clicked = st.sidebar.button(ui["run_btn"], type="primary", width="stretch")
    st.sidebar.caption(ui["run_caption"])

    bess = BESSConfig(
        capacity_mwh=capacity_mwh,
        power_mw=power_mw,
    )

    if update_clicked:
        try:
            paths = update_local_data(days=max(horizon_days, 2))
            st.sidebar.success(
                f"Updated: {paths['prices'].name}, {paths['generation'].name}, {paths['load'].name}"
            )
        except Exception as exc:
            st.sidebar.warning(f"Live data update failed. Using cached/sample data. Details: {exc}")

    if "optimization_result" not in st.session_state:
        st.session_state.optimization_result = None
        st.session_state.market_data = None
        st.session_state.load_result = None
        st.session_state.optimization_signature = None
    if "optimization_result_scenario" not in st.session_state:
        st.session_state.optimization_result_scenario = None

    stacking_cfg = RevenueStackingConfig(
        enable_fcr=enable_fcr,
        enable_afrr=enable_afrr,
        enable_capacity_payment=enable_capacity_payment,
        enable_congestion_bonus=enable_congestion_bonus,
        capacity_contract_share_of_power=capacity_share,
    )

    optimization_signature = (
        capacity_mwh,
        power_ratio,
        horizon_days,
        data_mode,
        extra_storage_mwh,
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
        congestion_signal_multiplier,
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
        market_data["congestion_signal"] = (
            market_data["congestion_signal"].clip(0.0, 1.0) * congestion_signal_multiplier
        ).clip(0.0, 1.0)
        result = optimize_bess_with_stacking(
            market_data=market_data,
            bess=bess,
            stacking=stacking_cfg,
        )
        st.session_state.optimization_result = result
        st.session_state.market_data = market_data
        st.session_state.load_result = load_result
        st.session_state.optimization_signature = optimization_signature
        if extra_storage_mwh > 1e-6:
            cap2 = capacity_mwh + extra_storage_mwh
            bess_sc = BESSConfig(
                capacity_mwh=cap2,
                power_mw=cap2 * power_ratio,
            )
            st.session_state.optimization_result_scenario = optimize_bess_with_stacking(
                market_data=market_data,
                bess=bess_sc,
                stacking=stacking_cfg,
            )
        else:
            st.session_state.optimization_result_scenario = None
    else:
        load_result = st.session_state.load_result
        market_data = st.session_state.market_data
        result = st.session_state.optimization_result

    result_scenario = st.session_state.optimization_result_scenario

    load_metadata = _load_result_metadata(load_result, market_data)
    source_label_map = {
        "cached": "Local ENTSO-E cache",
        "sample": "Bundled sample dataset",
        "synthetic": "Synthetic fallback",
    }
    source = str(load_metadata["source"])
    source_label = source_label_map.get(source, source)
    zone_interval = f"{load_metadata['market_zone']} @ {load_metadata['interval']}"
    last_updated = load_metadata["last_updated"]
    if hasattr(last_updated, "astimezone"):
        updated_local = last_updated.astimezone(UTC).strftime("%Y-%m-%d %H:%M UTC")
    elif last_updated:
        updated_local = str(last_updated)
    else:
        updated_local = "not available"
    st.markdown(
        _provenance_badges_html(
            ui,
            source_label=source_label,
            zone_interval=zone_interval,
            last_update=updated_local,
            congestion_signal_source=str(load_metadata["congestion_signal_source"]),
        ),
        unsafe_allow_html=True,
    )
    st.caption(ui["assumption_inputs_note"])
    if load_metadata["warning"]:
        st.warning(f"Fallback context: {load_metadata['warning']}")
    dispatch = result.dispatch
    revenue_breakdown = result.revenue_breakdown_eur or {"arbitrage": result.total_revenue_eur}

    dt_h = float(bess.timestep_hours)
    zone_load_mwh = float((market_data["system_load_mw"] * dt_h).sum())
    mean_gw = float(market_data["system_load_mw"].mean()) / 1000.0
    n_steps = len(market_data)

    st.markdown("<div class='oa-section-spacer'></div>", unsafe_allow_html=True)
    st.subheader(ui["hero_header"])
    st.markdown(
        _hero_snapshot_html(
            ui,
            horizon_days=horizon_days,
            n_steps=n_steps,
            capacity_mwh=capacity_mwh,
            power_mw=power_mw,
            zone_load_mwh=zone_load_mwh,
            mean_gw=mean_gw,
            discharged_mwh=result.discharged_energy_mwh,
            charged_mwh=result.charged_energy_mwh,
            revenue_eur=result.total_revenue_eur,
        ),
        unsafe_allow_html=True,
    )
    st.caption(ui["load_caption"])
    if result_scenario is not None and extra_storage_mwh > 1e-6:
        delta_revenue = result_scenario.total_revenue_eur - result.total_revenue_eur
        st.markdown(
            _scenario_delta_html(
                ui,
                extra_mwh=extra_storage_mwh,
                delta_revenue=delta_revenue,
                delta_discharged=result_scenario.discharged_energy_mwh - result.discharged_energy_mwh,
                delta_cycles=result_scenario.estimated_cycles - result.estimated_cycles,
                delta_revenue_per_mwh=delta_revenue / extra_storage_mwh,
            ),
            unsafe_allow_html=True,
        )

    st.markdown(
        _vnb_decision_html(
            ui,
            total_revenue_eur=result.total_revenue_eur,
            horizon_days=horizon_days,
        ),
        unsafe_allow_html=True,
    )

    st.subheader(ui["kpi_economics_header"])
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
