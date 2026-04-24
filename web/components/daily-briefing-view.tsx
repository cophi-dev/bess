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
    <div className="container-shell py-12 md:py-14">
      <FadeIn className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Tagesupdate Deutschland
        </p>
        <h1 className="mt-3 text-3xl leading-tight md:text-[2.6rem]">Tagesupdate auf einen Blick</h1>
        <p className="mt-3 text-base text-text-secondary md:text-lg">
          Kurz, klar, relevant.
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

          <section className="mt-10 rounded-card border border-accent/35 bg-surface p-8 shadow-card">
            <FadeIn>
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Tagesthemen</p>
              <h2 className="mt-3 text-3xl md:text-4xl">Heutige Marktthemen in Deutschland</h2>
              <p className="mt-3 text-text-secondary">
                Die wichtigsten Entwicklungen aus Markt und Regulierung, kompakt eingeordnet.
              </p>
            </FadeIn>
            <div className="mt-5 grid gap-4">
              {briefing.news.map((item, index) => (
                <FadeIn
                  key={`${item.headline}-${index}`}
                  delay={0.04 * (index + 1)}
                  className="rounded-card bg-background-alt p-7 shadow-card"
                >
                  <h3 className="text-2xl text-primary">{item.headline}</h3>
                  <p className="mt-3 text-text-secondary">{item.facts}</p>
                  <p className="mt-3 border-l-2 border-accent/50 pl-4 text-sm text-text-secondary">
                    {item.einordnung}
                  </p>
                </FadeIn>
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
              Vertiefe die Marktmechanik direkt mit Simulation und Revenue-Stacking-Lernpfad.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/simulator"
                className="rounded-card bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90"
              >
                Zum Simulator
              </Link>
              <Link
                href="/revenue-stacking"
                className="rounded-card border border-primary/15 bg-background-alt px-6 py-3 text-sm font-medium text-primary transition hover:border-primary/40"
              >
                Mehr zu Revenue Stacking
              </Link>
            </div>
          </FadeIn>
        </>
      )}
    </div>
  );
}
