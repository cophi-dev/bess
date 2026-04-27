"use client";

import { useCallback, useEffect, useState } from "react";
import { FadeIn } from "@/components/fade-in";

type LiveMetricSource = {
  provider: string;
  metric: string;
  asOf: string;
  stale: boolean;
};

type LiveMetricsPayload = {
  consumptionMw: number;
  productionMw: number;
  frequencyHz: number;
  installedBessMw: number;
  installedBessMwh: number;
  generationMix: Array<{ fuel: string; mw: number; sharePct: number }>;
  consumptionTrend: Array<{ asOf: string; value: number }>;
  productionTrend: Array<{ asOf: string; value: number }>;
  frequencyTrend: Array<{ asOf: string; value: number }>;
  bessSoc?: {
    pct: number;
    asOf: string;
    stale: boolean;
    simulated?: boolean;
    source: string;
    availableDischargeMw?: number;
    availableChargeMw?: number;
  };
  asOf: string;
  sources: LiveMetricSource[];
  qualityFlags: string[];
};

type LiveMetricsResponse = {
  metrics?: LiveMetricsPayload;
  cached?: boolean;
  generatedAt?: string;
  error?: string;
};

function latestAndPreviousDelta(points: Array<{ value: number }>): { latest: number; deltaPct: number | null } | null {
  if (points.length < 2) return null;
  const latest = points[points.length - 1].value;
  const previous = points[0].value;
  if (previous === 0) return { latest, deltaPct: null };
  return { latest, deltaPct: ((latest - previous) / previous) * 100 };
}

export function DataLiveMetricsView() {
  const [liveMetrics, setLiveMetrics] = useState<LiveMetricsPayload | null>(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<string | null>(null);
  const [isLiveCached, setIsLiveCached] = useState<boolean | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [extraBessMw, setExtraBessMw] = useState<number>(500);

  const loadLiveMetrics = useCallback(async () => {
    setLiveError(null);
    try {
      const response = await fetch("/api/live-metrics", { cache: "no-store" });
      const json = (await response.json()) as LiveMetricsResponse;
      if (!response.ok || !json.metrics) {
        throw new Error(json.error || "Live-Metriken konnten nicht geladen werden.");
      }
      setLiveMetrics(json.metrics);
      setIsLiveCached(Boolean(json.cached));
      const sourceDate = json.generatedAt ? new Date(json.generatedAt) : new Date();
      setLiveUpdatedAt(sourceDate.toLocaleString("de-DE", { dateStyle: "long", timeStyle: "short" }));
    } catch (err) {
      setLiveError(err instanceof Error ? err.message : "Unbekannter Fehler bei Live-Metriken.");
    }
  }, []);

  useEffect(() => {
    void loadLiveMetrics();
  }, [loadLiveMetrics]);

  const estimatedExtraBessMwh = extraBessMw * 2;
  const peakShavingMw = Math.min(extraBessMw * 0.72, liveMetrics?.consumptionMw ?? 0);
  const renewableAbsorptionMwh = estimatedExtraBessMwh * 0.61;
  const balancingStressReliefPct =
    liveMetrics && liveMetrics.consumptionMw > 0
      ? Math.min(12, (peakShavingMw / liveMetrics.consumptionMw) * 100 * 1.8)
      : 0;

  return (
    <div className="container-shell py-12 md:py-14">
      <FadeIn className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Data
        </p>
        <h1 className="mt-3 text-3xl leading-tight md:text-[2.6rem]">Live-KPIs fuer den deutschen BESS-Markt</h1>
        <p className="mt-3 text-base text-text-secondary md:text-lg">
          Verbrauch, Erzeugung, Netzfrequenz und installierte BESS-Leistung als kompakte operative Lage.
          Das Tagesbriefing ist jetzt auf der News-Seite gebuendelt.
        </p>
      </FadeIn>

      <FadeIn delay={0.03} className="mt-8 rounded-card border border-primary/15 bg-surface p-7 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">Live-Metriken Deutschland</p>
            <p className="mt-1 text-sm text-text-secondary">
              Stundliche Sicht auf Verbrauch, Erzeugung, Netzfrequenz und installierte BESS-Leistung.
            </p>
          </div>
          <div className="text-xs text-text-secondary">
            {liveUpdatedAt ? `Update: ${liveUpdatedAt}` : "Update: wird geladen ..."} ·{" "}
            {isLiveCached === null ? "Status: wird geladen ..." : isLiveCached ? "Status: Cache" : "Status: Live"}
          </div>
        </div>
        {liveError && <p className="mt-3 text-sm text-error">{liveError}</p>}
        {!liveError && !liveMetrics && <p className="mt-3 text-sm text-text-secondary">Live-Daten werden geladen ...</p>}
        {liveMetrics && (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-4">
              <div className="rounded-card bg-background-alt p-4">
                <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">Verbrauch</p>
                <p className="mt-1 text-2xl text-primary">{(liveMetrics.consumptionMw / 1000).toFixed(1)} GW</p>
              </div>
              <div className="rounded-card bg-background-alt p-4">
                <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">Erzeugung</p>
                <p className="mt-1 text-2xl text-primary">{(liveMetrics.productionMw / 1000).toFixed(1)} GW</p>
              </div>
              <div className="rounded-card bg-background-alt p-4">
                <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">Netzfrequenz</p>
                <p className="mt-1 text-2xl text-primary">{liveMetrics.frequencyHz.toFixed(3)} Hz</p>
              </div>
              <div className="rounded-card bg-background-alt p-4">
                <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">Installierte BESS</p>
                <p className="mt-1 text-2xl text-primary">
                  {(liveMetrics.installedBessMw / 1000).toFixed(2)} GW / {(liveMetrics.installedBessMwh / 1000).toFixed(2)} GWh
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-card bg-background-alt p-4">
                <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">24h Lasttrend</p>
                <p className="mt-1 text-xl text-primary">
                  {(() => {
                    const trend = latestAndPreviousDelta(liveMetrics.consumptionTrend);
                    if (!trend || trend.deltaPct === null) return "n/a";
                    return `${trend.deltaPct >= 0 ? "+" : ""}${trend.deltaPct.toFixed(1)} %`;
                  })()}
                </p>
              </div>
              <div className="rounded-card bg-background-alt p-4">
                <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">24h Erzeugungstrend</p>
                <p className="mt-1 text-xl text-primary">
                  {(() => {
                    const trend = latestAndPreviousDelta(liveMetrics.productionTrend);
                    if (!trend || trend.deltaPct === null) return "n/a";
                    return `${trend.deltaPct >= 0 ? "+" : ""}${trend.deltaPct.toFixed(1)} %`;
                  })()}
                </p>
              </div>
              <div className="rounded-card bg-background-alt p-4">
                <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">SoC (Echtdaten)</p>
                {liveMetrics.bessSoc ? (
                  <>
                    <p className="mt-1 text-xl text-primary">{liveMetrics.bessSoc.pct.toFixed(1)} %</p>
                    <p className="mt-1 text-xs text-text-secondary">
                      {liveMetrics.bessSoc.simulated
                        ? "Status: simuliert"
                        : liveMetrics.bessSoc.stale
                          ? "Status: stale"
                          : "Status: live"}{" "}
                      · Quelle: {liveMetrics.bessSoc.source}
                    </p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-text-secondary">Nicht verfuegbar (keine Telemetriequelle konfiguriert)</p>
                )}
              </div>
            </div>
            {liveMetrics.generationMix.length > 0 && (
              <div className="mt-4 rounded-card bg-background-alt p-4">
                <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">Strommix aktuell</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {liveMetrics.generationMix.slice(0, 8).map((entry) => (
                    <div key={entry.fuel} className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">{entry.fuel}</span>
                      <span className="font-medium text-text">
                        {(entry.mw / 1000).toFixed(1)} GW · {entry.sharePct.toFixed(1)} %
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {liveMetrics.qualityFlags.length > 0 && (
              <p className="mt-3 text-xs text-text-secondary">
                Datenhinweise: {liveMetrics.qualityFlags.join(", ")}
              </p>
            )}
          </>
        )}
      </FadeIn>

      <FadeIn delay={0.04} className="mt-6 rounded-card border border-accent/35 bg-background-alt p-7 shadow-card">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Mehr BESS - Was waere wenn?</p>
        <h2 className="mt-2 text-2xl md:text-3xl">Heuristische Impact-Schaetzung fuer zusaetzlichen Speicher</h2>
        <p className="mt-2 text-sm text-text-secondary">
          Vereinfachtes Lernmodell auf Basis der aktuellen Live-Metriken, keine Betriebsprognose.
        </p>
        <div className="mt-4">
          <label htmlFor="extra-bess-mw" className="text-sm font-medium text-text">
            Zusaetzliche BESS-Leistung: {extraBessMw} MW (abgeleitet: {estimatedExtraBessMwh} MWh bei 2h-Dauer)
          </label>
          <input
            id="extra-bess-mw"
            type="range"
            min={100}
            max={5000}
            step={100}
            value={extraBessMw}
            onChange={(event) => setExtraBessMw(Number.parseInt(event.target.value, 10))}
            className="mt-2 w-full accent-primary"
          />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-card bg-surface p-4">
            <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">Geschaetzte Peak-Entlastung</p>
            <p className="mt-1 text-2xl text-primary">{peakShavingMw.toFixed(0)} MW</p>
          </div>
          <div className="rounded-card bg-surface p-4">
            <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">Erhoehte RES-Aufnahme</p>
            <p className="mt-1 text-2xl text-primary">{renewableAbsorptionMwh.toFixed(0)} MWh</p>
          </div>
          <div className="rounded-card bg-surface p-4">
            <p className="text-xs uppercase tracking-[0.11em] text-text-secondary">Balancing-Stress-Proxy</p>
            <p className="mt-1 text-2xl text-primary">-{balancingStressReliefPct.toFixed(2)} %</p>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
