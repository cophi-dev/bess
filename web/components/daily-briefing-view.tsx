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

function splitParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function DailyBriefingView() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isCachedResult, setIsCachedResult] = useState<boolean | null>(null);

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

  return (
    <section id="tagesbriefing" className="mt-10 rounded-card border border-accent/35 bg-surface p-7 shadow-card md:p-8">
      <FadeIn>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Tagesbriefing</p>
            <h2 className="mt-3 text-3xl md:text-4xl">Was heute fuer BESS in Deutschland wichtig ist</h2>
            <p className="mt-3 text-text-secondary">
              Taegliche Marktthemen, eine kurze Lern-Einordnung und konkrete naechste Schritte an einem Ort.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadBriefing({ usePost: true })}
            disabled={loading || refreshing}
            className="rounded-card border border-primary/15 bg-background-alt px-4 py-2 text-xs font-medium text-primary transition hover:border-primary/30 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
          >
            {refreshing ? "Wird neu generiert ..." : "Briefing neu generieren"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-secondary md:text-sm">
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
      </FadeIn>

      {loading && (
        <FadeIn delay={0.05} className="mt-6 rounded-card bg-background-alt p-5">
          <p className="text-text-secondary">Das Tagesbriefing wird geladen ...</p>
        </FadeIn>
      )}

      {error && (
        <FadeIn delay={0.05} className="mt-6 rounded-card border border-error/30 bg-background-alt p-5">
          <p className="text-error">{error}</p>
        </FadeIn>
      )}

      {briefing && !loading && !error && (
        <>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-card bg-background-alt p-6 md:p-7">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Lektion des Tages</p>
              <h3 className="mt-3 text-2xl md:text-3xl">{briefing.lesson.title}</h3>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-text-secondary">
                {splitParagraphs(briefing.lesson.content).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>

            <section className="rounded-card border border-primary/10 bg-background-alt p-6 md:p-7">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">Wichtige Insights</p>
              <div className="mt-4 grid gap-3">
                {briefing.insights.map((insight, index) => (
                  <FadeIn
                    key={`${insight}-${index}`}
                    delay={0.04 * (index + 1)}
                    className="rounded-card bg-surface p-4 shadow-card"
                  >
                    <p className="text-sm leading-relaxed text-text-secondary">{insight}</p>
                  </FadeIn>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Tagesthemen</p>
                <h3 className="mt-2 text-2xl md:text-3xl">Aktuelle Nachrichten und Einordnung</h3>
              </div>
              <Link
                href="/data"
                className="text-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary"
              >
                Live-KPIs ansehen
              </Link>
            </div>
            <div className="mt-5 grid gap-4">
              {briefing.news.map((item, index) => (
                <FadeIn
                  key={`${item.headline}-${index}`}
                  delay={0.04 * (index + 1)}
                  className="rounded-card bg-background-alt p-6 shadow-card"
                >
                  <h4 className="text-2xl text-primary">{item.headline}</h4>
                  <p className="mt-3 text-text-secondary">{item.facts}</p>
                  <p className="mt-3 border-l-2 border-accent/50 pl-4 text-sm leading-relaxed text-text-secondary">
                    {item.einordnung}
                  </p>
                </FadeIn>
              ))}
            </div>
          </section>

          <FadeIn delay={0.2} className="mt-8 rounded-card border border-primary/10 bg-background-alt p-7">
            <h2 className="text-2xl">Nächster Schritt</h2>
            <p className="mt-3 text-text-secondary">
              Vertiefe die Marktmechanik direkt mit Simulation, Live-Daten und den wichtigsten Herausforderungen.
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
              <Link
                href="/data"
                className="rounded-card border border-primary/15 bg-surface px-6 py-3 text-sm font-medium text-primary transition hover:border-primary/40"
              >
                Live-Daten pruefen
              </Link>
            </div>
          </FadeIn>
        </>
      )}
    </section>
  );
}
