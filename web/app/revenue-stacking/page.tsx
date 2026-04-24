import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "Revenue Stacking",
  description:
    "Arbitrage, FCR, aFRR, Kapazitaet und Netzengpass-Boni klar erklaert.",
};

const streams = [
  {
    name: "FCR",
    text: "Primarregelenergie verguetet schnelle, zuverlaessige Leistungsvorhaltung und stabilisiert Frequenzabweichungen.",
  },
  {
    name: "aFRR",
    text: "Sekundaerregelung kombiniert Verfuegbarkeit und Aktivierungslogik und kann Erloese jenseits Day-Ahead schaffen.",
  },
  {
    name: "Kapazitaet",
    text: "Verfuegbarkeitsorientierte Zahlungen reduzieren die Abhaengigkeit von kurzfristiger Preisvolatilitaet.",
  },
  {
    name: "Arbitrage",
    text: "Preisgetriebenes Laden und Entladen bleibt wichtig, aber selten allein ausreichend fuer stabile Wirtschaftlichkeit.",
  },
  {
    name: "Netzengpass",
    text: "Bei lokalen Engpaessen kann flexible Speicherleistung systemische Entlastung und Zusatznutzen stiften.",
  },
];

export default function RevenueStackingPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <FadeIn className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl">Revenue Stacking verstehen</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Erfolgreiche BESS-Projekte in Deutschland kombinieren mehrere
          Erlosstroeme. Diese Seite zeigt die Bausteine in einfacher Sprache.
        </p>
      </FadeIn>

      <section className="mt-12 grid gap-4">
        {streams.map((item, index) => (
          <FadeIn key={item.name} delay={index * 0.04}>
            <details className="rounded-card bg-surface p-6 shadow-card open:border open:border-primary/20">
              <summary className="cursor-pointer text-xl text-primary">
                {item.name}
              </summary>
              <p className="mt-3 text-text-secondary">{item.text}</p>
            </details>
          </FadeIn>
        ))}
      </section>

      <FadeIn delay={0.2} className="mt-12 rounded-card bg-background-alt p-8">
        <h2 className="text-3xl">Typischer Revenue-Mix (Deutschland)</h2>
        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm text-text-secondary">
              <span>Regelleistung (FCR + aFRR)</span>
              <span>45%</span>
            </div>
            <div className="h-3 rounded-full bg-surface">
              <div className="h-3 w-[45%] rounded-full bg-primary" />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm text-text-secondary">
              <span>Arbitrage</span>
              <span>30%</span>
            </div>
            <div className="h-3 rounded-full bg-surface">
              <div className="h-3 w-[30%] rounded-full bg-accent" />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm text-text-secondary">
              <span>Kapazitaet + Netzengpass-Bonus</span>
              <span>25%</span>
            </div>
            <div className="h-3 rounded-full bg-surface">
              <div className="h-3 w-[25%] rounded-full bg-highlight" />
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
