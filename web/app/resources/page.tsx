import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "Ressourcen",
  description:
    "Blog, Glossar, Datenquellen und Download-Guides fuer BESS Revenue Stacking.",
};

const posts = [
  "Warum reine Arbitrage fuer BESS oft nicht reicht",
  "FCR und aFRR kompakt erklaert fuer Projektteams",
  "So liest du Revenue-Breakdowns richtig",
];

const glossary = [
  ["BESS", "Battery Energy Storage System"],
  ["FCR", "Frequency Containment Reserve (Primaerregelung)"],
  ["aFRR", "Automatic Frequency Restoration Reserve (Sekundaerregelung)"],
  ["Redispatch", "Eingriffe zur Netzstabilisierung bei Engpaessen"],
];

export default function ResourcesPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <FadeIn>
        <h1 className="text-4xl md:text-5xl">Ressourcen</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Vertiefe dein Wissen mit Artikeln, Begriffen, Datenquellen und
          praktischen Leitfaeden.
        </p>
      </FadeIn>

      <section className="mt-12 grid gap-5 md:grid-cols-2">
        <FadeIn className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Blog (Platzhalter)</h2>
          <ul className="mt-4 space-y-3 text-text-secondary">
            {posts.map((post) => (
              <li key={post}>- {post}</li>
            ))}
          </ul>
        </FadeIn>
        <FadeIn delay={0.08} className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Glossar</h2>
          <div className="mt-4 space-y-3 text-sm">
            {glossary.map(([term, definition]) => (
              <p key={term} className="text-text-secondary">
                <span className="font-semibold text-text">{term}:</span> {definition}
              </p>
            ))}
          </div>
        </FadeIn>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        <FadeIn className="rounded-card bg-background-alt p-7">
          <h2 className="text-2xl">Datenquellen</h2>
          <div className="mt-4 flex flex-col gap-2 text-text-secondary">
            <a href="https://www.regelleistung.net/" target="_blank" rel="noreferrer" className="hover:text-primary">
              regelleistung.net
            </a>
            <a href="https://transparency.entsoe.eu/" target="_blank" rel="noreferrer" className="hover:text-primary">
              ENTSO-E Transparency Platform
            </a>
            <a href="https://www.smard.de/" target="_blank" rel="noreferrer" className="hover:text-primary">
              SMARD Strommarktdaten
            </a>
          </div>
        </FadeIn>
        <FadeIn delay={0.08} className="rounded-card bg-background-alt p-7">
          <h2 className="text-2xl">Downloads</h2>
          <div className="mt-4 flex flex-col gap-2 text-text-secondary">
            <a href="#" className="hover:text-primary">
              Guide: BESS Revenue Stacking Basics (PDF)
            </a>
            <a href="#" className="hover:text-primary">
              Checklist: Projektbewertung in DE (PDF)
            </a>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
