"use client";

import { useCallback, useEffect, useState } from "react";
import { FadeIn } from "@/components/fade-in";

type BriefingNewsItem = {
  headline: string;
  facts: string;
  einordnung: string;
};

type BriefingResponse = {
  briefing?: {
    date: string;
    news: BriefingNewsItem[];
  };
  error?: string;
  cached?: boolean;
  generatedAt?: string;
};

export function NewsFeedView() {
  const [news, setNews] = useState<BriefingNewsItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [isCachedResult, setIsCachedResult] = useState<boolean | null>(null);
  const [newsDate, setNewsDate] = useState<string | null>(null);

  const loadNews = useCallback(async (options?: { usePost?: boolean; firstLoad?: boolean }) => {
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
        throw new Error(json.error || "News-Feed konnte nicht geladen werden.");
      }

      setNews(json.briefing.news);
      setNewsDate(json.briefing.date);
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
    void loadNews({ firstLoad: true });
  }, [loadNews]);

  return (
    <section className="mt-10 rounded-card border border-accent/35 bg-surface p-8 shadow-card">
      <FadeIn>
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Tagesthemen</p>
        <h2 className="mt-3 text-3xl md:text-4xl">Heutige Marktthemen in Deutschland</h2>
        <p className="mt-3 text-text-secondary">
          Live-News aus Markt und Regulierung, kompakt eingeordnet fuer den BESS-Kontext.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm text-text-secondary">
          <span className="inline-flex items-center gap-1">
            <span>Stand</span>
            <strong className="text-text">{newsDate || "wird geladen ..."}</strong>
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
            onClick={() => void loadNews({ usePost: true })}
            disabled={loading || refreshing}
            className="rounded-card border border-primary/15 bg-background-alt px-4 py-1.5 text-xs font-medium text-primary transition hover:border-primary/30 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
          >
            {refreshing ? "Wird neu generiert ..." : "News-Feed neu generieren"}
          </button>
        </div>
      </FadeIn>

      {loading && <p className="mt-5 text-text-secondary">News-Feed wird geladen ...</p>}

      {error && (
        <div className="mt-5 rounded-card border border-error/30 bg-background-alt p-5">
          <p className="text-error">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="mt-5 grid gap-4">
          {news.map((item, index) => (
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
      )}
    </section>
  );
}
