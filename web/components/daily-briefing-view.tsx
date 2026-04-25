"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { FadeIn } from "@/components/fade-in";

type Briefing = {
  date: string;
  lesson: {
    title: string;
    content: string;
  };
  news: Array<{
    headline: string;
    facts: string;
    einordnung: string;
  }>;
  insights: string[];
};

type BriefingResponse = {
  briefing?: Briefing;
  error?: string;
  cached?: boolean;
  generatedAt?: string;
};

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

function splitParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function latestAndPreviousDelta(points: Array<{ value: number }>): { latest: number; deltaPct: number | null } | null {
  if (points.length < 2) return null;
  const latest = points[points.length - 1].value;
  const previous = points[0].value;
  if (previous === 0) return { latest, deltaPct: null };
  return { latest, deltaPct: ((latest - previous) / previous) * 100 };
}

export function DailyBriefingView() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isCachedResult, setIsCachedResult] = useState<boolean | null>(null);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetricsPayload | null>(null);
  const [liveUpdatedAt, setLiveUpdatedAt] = useState<string | null>(null);
  const [isLiveCached, setIsLiveCached] = useState<boolean | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [extraBessMw, setExtraBessMw] = useState<number>(500);

  const loadBriefing = useCallback(async (options?: { usePost?: boolean; firstLoad?: boolean }) => {
    const usePost = options?.usePost ?? false;
    const firstLoad = options?.firstLoad ?? false;
    if (firstLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/daily-briefing", {
        method: usePost ? "POST" : "GET",
        headers: { "Content-Type": "application/json" },
        cache: usePost ? "no-store" : "default",
      });
      const json = (await response.json()) as BriefingResponse;
      if (!response.ok || !json.briefing) {
        throw new Error(json.error || "Briefing konnte nicht geladen werden.");
      }
      setBriefing(json.briefing);
      setIsCachedResult(Boolean(json.cached));
      const sourceDate = json.generatedAt ? new Date(json.generatedAt) : new Date();
      setUpdatedAt(sourceDate.toLocaleString("de-DE", { dateStyle: "long", timeStyle: "short" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler beim Laden.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadBriefing({ firstLoad: true });
  }, [loadBriefing]);

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
        <h1 className="mt-3 text-3xl leading-tight md:text-[2.6rem]">Live-KPIs und Tagesupdate</h1>
        <p className="mt-3 text-base text-text-secondary md:text-lg">
          Verbrauch, Erzeugung, Netzfrequenz, installierte BESS-Leistung und
          taegliche Einordnung fuer den deutschen Markt.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <span>Stand</span>
            <strong className="text-text">{briefing?.date || "wird geladen ..."}</strong>
          </span>
          <span className="h-3 w-px bg-primary/15" aria-hidden="true" />
          <span className="inline-flex items-center gap-1">
            <span>Update</span>
            <strong className="text-text">{updatedAt || "wird geladen ..."}</strong>
          </span>
          <span className="h-3 w-px bg-primary/15" aria-hidden="true" />
          <span className="inline-flex items-center gap-1">
            <span>Status</span>
            <strong className="text-text">
              {isCachedResult === null ? "wird geladen ..." : isCachedResult ? "Cache" : "Live"}
            </strong>
          </span>
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => void loadBriefing({ usePost: true })}
            disabled={loading || refreshing}
            className="rounded-card border border-primary/15 bg-background-alt px-4 py-1.5 text-xs font-medium text-primary transition hover:border-primary/30 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
          >
            {refreshing ? "Wird neu generiert ..." : "Jetzt neu generieren"}
          </button>
        </div>
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

      {loading && (
        <FadeIn delay={0.05} className="mt-8 rounded-card bg-surface p-7 shadow-card">
          <p className="text-text-secondary">Das Tagesbriefing wird geladen ...</p>
        </FadeIn>
      )}

      {error && (
        <FadeIn delay={0.05} className="mt-8 rounded-card border border-error/30 bg-surface p-7 shadow-card">
          <p className="text-error">{error}</p>
        </FadeIn>
      )}

      {briefing && !loading && !error && (
        <>
          <section className="mt-8 rounded-card bg-background-alt p-8 shadow-card">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Lektion</p>
            <h2 className="mt-3 text-3xl md:text-4xl">{briefing.lesson.title}</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-text-secondary md:text-lg">
              {splitParagraphs(briefing.lesson.content).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <FadeIn>
              <h2 className="text-3xl">Wichtige Insights</h2>
            </FadeIn>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {briefing.insights.map((insight, index) => (
                <FadeIn
                  key={`${insight}-${index}`}
                  delay={0.04 * (index + 1)}
                  className="rounded-card bg-surface p-5 shadow-card"
                >
                  <p className="text-text-secondary">{insight}</p>
                </FadeIn>
              ))}
            </div>
          </section>

          <FadeIn delay={0.2} className="mt-12 rounded-card bg-surface p-7 shadow-card">
            <h2 className="text-2xl">Nächster Schritt</h2>
            <p className="mt-3 text-text-secondary">
              Vertiefe die Marktmechanik direkt mit Simulation und den wichtigsten Herausforderungen.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/simulator"
                className="rounded-card bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
              >
                Zum Simulator
              </Link>
              <Link
                href="/herausforderungen"
                className="rounded-card border border-primary/15 bg-background-alt px-6 py-3 text-sm font-medium text-primary transition hover:border-primary/40"
              >
                Herausforderungen verstehen
              </Link>
            </div>
          </FadeIn>
        </>
      )}
    </div>
  );
}
