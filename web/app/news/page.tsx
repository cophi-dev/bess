import type { Metadata } from "next";
import Link from "next/link";
import { DailyBriefingView } from "@/components/daily-briefing-view";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "News",
  description:
    "Tagesbriefing, kuratierte Updates und Einordnung zu Markt, Regulierung und Technologie rund um BESS in Deutschland.",
};

const newsItems = [
  {
    title: "Tagesbriefing",
    text: "Die kompakte Lage fuer heute: was passiert ist, warum es fuer Speicher relevant ist und was du als Naechstes pruefen solltest.",
    href: "#tagesbriefing",
    cta: "Briefing lesen",
  },
  {
    title: "Live-KPIs",
    text: "Verbrauch, Erzeugung, Netzfrequenz und installierte BESS-Leistung bleiben als operative Datenbasis auf Data.",
    href: "/data",
    cta: "Live-Daten ansehen",
  },
  {
    title: "Kontext",
    text: "Markt-, Netz- und Standortfragen einordnen, bevor Simulationen oder Projektannahmen vertieft werden.",
    href: "/herausforderungen",
    cta: "Kontext verstehen",
  },
];

export default function NewsPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <FadeIn className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          News
        </p>
        <h1 className="text-4xl md:text-5xl">News</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Der zentrale Anlaufpunkt fuer neue Entwicklungen im deutschen BESS-Kontext:
          Tagesbriefing, Marktnachrichten, Einordnung und direkte Wege zu Live-Daten
          und Simulation.
        </p>
      </FadeIn>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {newsItems.map((item, index) => (
          <FadeIn
            key={item.title}
            delay={index * 0.06}
            className="rounded-card bg-surface p-7 shadow-card"
          >
            <h2 className="text-2xl">{item.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              {item.text}
            </p>
            <Link
              href={item.href}
              className="mt-5 inline-block text-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary"
            >
              {item.cta}
            </Link>
          </FadeIn>
        ))}
      </section>

      <DailyBriefingView />
    </div>
  );
}
