import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "Wirtschaftlichkeit",
  description:
    "BESS-Wirtschaftlichkeit: Arbitrage, Spreads und netzregulierende Preisvorteile im deutschen Strommarkt – bildungsorientiert erklaert.",
};

export default function WirtschaftlichkeitPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <FadeIn className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          Finanzen
        </p>
        <h1 className="mt-2 text-4xl md:text-5xl">Wirtschaftlichkeit von BESS</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Grossbatteriespeicher vergueten sich in Deutschland typischerweise nicht
          nur ueber reine Kauf- und Verkaufsarbitrage. Netz- und
          systemrelevante Maerkte, Verfuegbarkeit und lokalen Kontext
          (Engpaesse, Anschluss) praegen Preise – und damit die finanzielle
          Logik des Betriebs.
        </p>
        <p className="mt-3 text-sm text-text-secondary">
          Diese Seite fasst die Bausteine fuer Lern- und Szenarien ab. Sie ist
          keine Anlageberatung; konkrete Projekte brauchen eigenstaendige
          Due-Diligence.
        </p>
      </FadeIn>

      <section className="mt-12 space-y-4">
        <FadeIn>
          <div className="rounded-card border border-primary/15 bg-surface p-6 shadow-card md:p-8">
            <h2 className="text-2xl text-primary md:text-3xl">Arbitrage und Spreads</h2>
            <p className="mt-3 text-text-secondary">
              Arbitrage bezeichnet hier das bewusste Laden, wenn
              Strom/Position guenstig ist, und Entladen, wenn der erwartete
              Verkaufs- oder Einspeisewert hoch genug ist – oft orientiert an
              Day-Ahead- und Intraday-Signalen. Entscheidend ist nicht nur
              &quot;hoch runter niedrig&quot;, sondern <strong className="text-text">Spread</strong>, Zyklen,
              Verluste (Wirkungsgrad, Degradation) und Bindung von Leistung an
              andere Maerkte.
            </p>
            <p className="mt-3 text-sm text-text-secondary">
              Viele reale Faelle zeigen: Arbitrage bleibt ein Kernelement, reicht
              aber allein selten, um Wirtschaftlichkeit dauerhaft abzusichern –
              u. a. weil Preisvolatilitaet wechselt und zusaetzliche Erloesstroeme
              gebunden werden.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.04}>
          <div className="rounded-card border border-primary/15 bg-background-alt p-6 shadow-card md:p-8">
            <h2 className="text-2xl text-primary md:text-3xl">
              Netzregulierende Preisvorteile
            </h2>
            <p className="mt-3 text-text-secondary">
              &quot;Netzregulierend&quot; heisst: Der Betrieb traegt zur Stabilitaet
              des Systems oder zur Entlastung kritischer Netzbereiche bei. Im
              Preisbild tritt das sichtbar in
              <strong className="text-text"> Systemdienstleistungen</strong> (u. a. FCR, aFRR) mit
              separaten Auktions- und Leistungspreisen, in
              <strong className="text-text"> Sektorkopplungs-</strong> und
              Ausbauanreizen, und dort, wo
              <strong className="text-text"> Engpass- und Redispatch-Logik</strong> lokal
              spuerbar macht, wo Wirkung sinnvoll entfaltet werden kann. Ein
              BESS, das dort gezielt Leistung vorhaelt oder entlastet, kann
              (je nach Regelwerk, Standort und Produkte) zusaetzlichen
              wirtschaftlichen Raum eroeffnen – statt nur Spot-Preisen zu
              folgen.
            </p>
            <p className="mt-3 text-sm text-text-secondary">
              Genau trennt man im Projekt: welche Einnahmen von welchem Markt
              stammen, und welche technischen/vertraglichen Einschraenkungen
              gelten (z. B. Vorrang fuer Regelleistung).
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.08}>
          <div className="rounded-card bg-surface p-6 shadow-card md:p-8">
            <h2 className="text-2xl text-primary md:text-3xl">Kombinierter Erloes-Stack</h2>
            <p className="mt-3 text-text-secondary">
              In der Praxis wird Arbitrage haeufig mit
              <strong className="text-text"> Regelleistung</strong>,
              <strong className="text-text"> Kapazitaets-/Verfuegbarkeitslogik</strong> und
              ggf. <strong className="text-text">Kongestion- oder
              Lageboni</strong> (Proxy fuer netzdienliches Verhalten) zu einem
              Erloes-Stack verbunden. Risiken: Marktphase, Batterieverschleiss,
              Restriktionen am Netzanschluss, Konkurrenz im gleichen Markt, und
              Aenderungen bei Netzentgelten bzw. Regulierung.
            </p>
            <p className="mt-3 text-sm text-text-secondary">
              Das Lernmodell <span className="font-medium text-text">OpenAutobidder-DE</span> im
              Simulator trennt diese Stroeme sichtbar – gut, um
              Annahmen zu vergleichen, nicht um eine konkrete Rendite
              &quot;zu garantieren&quot;.
            </p>
          </div>
        </FadeIn>
      </section>

      <FadeIn className="mt-12" delay={0.12}>
        <div className="flex flex-col gap-4 rounded-card border border-accent/30 bg-background-alt p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl md:text-2xl">Naechste Schritte</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Kennzahlen ansehen oder Szenarien im offenen Modell testen.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/daten"
              className="rounded-card bg-primary px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-primary/90"
            >
              Live-Daten
            </Link>
            <Link
              href="/simulator"
              className="rounded-card border border-primary/20 bg-surface px-6 py-3 text-center text-sm font-medium text-primary transition hover:border-primary/40"
            >
              Simulator
            </Link>
            <Link
              href="/revenue-stacking"
              className="rounded-card border border-primary/20 bg-surface px-6 py-3 text-center text-sm font-medium text-primary transition hover:border-primary/40"
            >
              Revenue Stacking
            </Link>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
