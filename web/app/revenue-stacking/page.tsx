import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "Revenue Stacking",
  description:
    "Arbitrage, Systemdienstleistungen und Betriebsmuster klar erklaert - inklusive Wirkung auf Netzdienlichkeit.",
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
          Erlosstroeme. Diese Seite zeigt die Bausteine und typische
          Betriebsmuster in einfacher Sprache.
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

      <FadeIn delay={0.24} className="mt-8 rounded-card bg-surface p-8 shadow-card">
        <h2 className="text-3xl">Typisches Betriebsmuster im Tagesverlauf</h2>
        <p className="mt-3 text-text-secondary">
          In vielen Marktphasen werden Batterien um PV-Mittagsstunden geladen
          und in Morgen- bzw. Abendspitzen entladen. Das erhoeht den Wert aus
          Preis-Spreads, kann aber je nach Standort unterschiedlich auf
          Engpaesse wirken.
        </p>
      </FadeIn>

      <FadeIn delay={0.28} className="mt-8 rounded-card bg-background-alt p-8">
        <h2 className="text-3xl">Wann Value Stack nicht netzdienlich wird</h2>
        <ul className="mt-4 space-y-3 text-text-secondary">
          <li>- Wenn viele Speicher regional gebuendelt identische Signale verfolgen.</li>
          <li>- Wenn Einspeisung aus Batterien zeitgleich mit bereits hoher Windlast auf Engpassachsen trifft.</li>
          <li>- Wenn Marktanreize ohne lokale Netzsignale gefahren werden.</li>
        </ul>
        <p className="mt-4 text-sm text-text-secondary">
          Deshalb betrachten wir Revenue Stacking immer zusammen mit
          Standortlogik und Systemwirkung - nicht isoliert.
        </p>
      </FadeIn>
    </div>
  );
}
