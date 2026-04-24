import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/fade-in";
import { NewsFeedView } from "@/components/news-feed-view";

export const metadata: Metadata = {
  title: "News",
  description:
    "Kuratierte Updates zu Markt, Regulierung und Technologie rund um BESS in Deutschland.",
};

const newsItems = [
  {
    title: "Marktupdate",
    text: "Wie Preisniveaus, Volatilitaet und Flexibilitaetsbedarf die BESS-Erlosstruktur veraendern.",
    href: "/daten",
    cta: "Zu den aktuellen Daten",
  },
  {
    title: "Regulatorik",
    text: "Welche Signale aus Netzregulierung und Systemplanung fuer neue Projekte relevant sind.",
    href: "/netzregulierung",
    cta: "Netzregulierung lesen",
  },
  {
    title: "Projektfokus",
    text: "Welche Kennzahlen fuer Entscheidungen jetzt priorisiert werden sollten.",
    href: "/mission",
    cta: "Mission und What now",
  },
];

export default function NewsPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <FadeIn className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl">News</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Diese Seite buendelt die wichtigsten Entwicklungen fuer den deutschen
          BESS-Kontext: Marktdynamik, Netzregulierung und operative Prioritaeten.
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

      <NewsFeedView />
    </div>
  );
}
