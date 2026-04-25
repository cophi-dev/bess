import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/fade-in";
import { PipelineRealityVisual } from "@/components/insight-visuals";

export const metadata: Metadata = {
  title: "Mission",
  description:
    "Warum BESS Kompass Batteriespeicher in Deutschland erklaert: Mission, Zielgruppen, Markt- und Netzkontext sowie das offene Modell OpenAutobidder-DE.",
};

const valueCards = [
  {
    title: "Energiewende braucht Flexibilitaet",
    description:
      "BESS verschiebt Energie von Stunden mit Ueberschuss in Stunden mit Knappheit und kann dadurch Marktpreise, Netzengpaesse und Systemstabilitaet zusammen adressieren.",
  },
  {
    title: "BESS ist Infrastruktur",
    description:
      "Der groesste Hebel entsteht nicht allein im Trading, sondern wenn Speicherleistung am richtigen Netzpunkt, mit passender Dauer und klarer Betriebslogik geplant wird.",
  },
  {
    title: "Entscheidungen brauchen Transparenz",
    description:
      "Hohe Anschlussanfragen zeigen Dynamik, aber keine gesicherte Realisierung. Deshalb muessen Annahmen, Quellen und Grenzen sichtbar bleiben.",
  },
  {
    title: "Transparenz vor Investition",
    description:
      "Das offene Modell hilft, Dispatch- und Revenue-Stacking-Annahmen frueh zu testen, bevor Projektteams in standortspezifische Due-Diligence gehen.",
  },
];

const journey = [
  {
    step: "1",
    title: "Mission verstehen",
    text: "Warum Grossspeicher fuer Versorgungssicherheit, erneuerbare Integration und wirtschaftliche Skalierung zentral werden.",
  },
  {
    step: "2",
    title: "Herausforderungen einordnen",
    text: "Welche Markt-, Netz- und Standortfragen einen BESS-Case praegen.",
  },
  {
    step: "3",
    title: "Data pruefen",
    text: "Welche Live-KPIs und taeglichen Signale gerade wichtig sind.",
  },
  {
    step: "4",
    title: "Simulator nutzen",
    text: "Wie OpenAutobidder-DE Annahmen zu Revenue Stacking und Dispatch testbar macht.",
  },
];

const systemRoles = [
  {
    title: "Leistung ist nicht Energie",
    text: "Ein 100-MW-Speicher mit zwei Stunden Dauer kann andere Fragen beantworten als ein Vier-Stunden-System. Leistung, Kapazitaet und Dauer gehoeren deshalb immer zusammen.",
  },
  {
    title: "Marktwert braucht Netzkontext",
    text: "Preisgetriebener Dispatch ist nicht automatisch netzdienlich. Systemnutzen entsteht, wenn Standort, Anschluss und Fahrplan zur lokalen Netzsituation passen.",
  },
  {
    title: "Stabilitaet wird technischer",
    text: "Mit mehr leistungselektronisch gekoppelter Erzeugung werden schnelle Regelung, Blindleistung und netzbildende Faehigkeiten wichtiger als reine Energieverschiebung.",
  },
];

const missionSources = [
  "dena Analyse Grossbatteriespeicher, 02/2026: installierter Bestand, Projektpipeline, Netzanschluss- und Regulierungsfragen.",
  "TenneT / Frontier Kurzpapier, 07.02.2025: Systemkostenperspektive und Grenzen rein marktgetriebenen Speichereinsatzes.",
  "NREL Grid-Scale Battery Storage FAQ, Report 74426: Grundlagen zu Leistung, Energie, Speicherdauer und Value Stacking.",
];

export default function MissionPage() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BESS Kompass",
    description:
      "Orientierungsangebot zu Revenue Stacking fuer Batteriespeicher im deutschen Strommarkt, mit dem offenen Modell OpenAutobidder-DE.",
    url: "https://bess-pi.vercel.app",
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      <section className="container-shell py-20 md:py-28">
        <FadeIn className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Mission
          </p>
          <h1 className="mt-4 text-4xl leading-tight md:text-6xl">
            Ohne BESS gelingt die Energiewende nicht verlaesslich
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            <span className="text-text">BESS Kompass</span> fuehrt Teams,
            Studierende und Entscheider durch die Frage, wie Grossspeicher in
            Deutschland wirtschaftlich, netzbewusst und transparent bewertet
            werden koennen - vom ersten Marktbild bis zur pruefbaren Simulation.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/herausforderungen"
              className="rounded-card bg-primary px-8 py-3 text-base font-medium text-white shadow-card transition hover:bg-primary/90"
            >
              Herausforderungen verstehen
            </Link>
            <Link
              href="/data"
              className="rounded-card border border-primary/15 bg-surface px-8 py-3 text-base font-medium text-primary transition hover:border-primary/40"
            >
              Data und KPIs ansehen
            </Link>
          </div>
          <p className="mx-auto mt-6 max-w-lg text-sm text-text-secondary">
            Praktischer Schritt danach:{" "}
            <Link
              href="/simulator"
              className="font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              OpenAutobidder-DE im Simulator testen
            </Link>
            .
          </p>
        </FadeIn>
      </section>

      <section className="container-shell pb-16">
        <FadeIn className="mb-6 rounded-card border border-primary/15 bg-surface p-6 shadow-card">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            What now
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl">
            Erst einordnen, dann priorisieren, dann simulieren
          </h2>
          <p className="mt-2 text-sm text-text-secondary md:text-base">
            Die Mission ist kein abstraktes Statement. Sie uebersetzt
            Netzrealitaet, Marktlogik und offene Modellierung in eine klare
            Reihenfolge: Problem verstehen, Datenlage pruefen, Annahmen testen.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            <li>- Kurzfristig: Live-KPIs als gemeinsame Entscheidungsbasis etablieren.</li>
            <li>- Mittelfristig: Standort, Speicherdauer und Dispatch-Logik gemeinsam optimieren.</li>
            <li>- Laufend: Quellen, Annahmen und Szenarien transparent halten.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/data"
              className="rounded-card bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
            >
              Data starten
            </Link>
            <Link
              href="/simulator"
              className="rounded-card border border-primary/15 bg-surface px-5 py-2 text-sm font-medium text-primary transition hover:border-primary/40"
            >
              Szenarien simulieren
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="mb-6">
          <PipelineRealityVisual />
        </FadeIn>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {valueCards.map((card, index) => (
            <FadeIn
              key={card.title}
              delay={index * 0.06}
              className="rounded-card bg-surface p-7 shadow-card"
            >
              <h3 className="text-2xl">{card.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {card.description}
              </p>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="container-shell pb-16">
        <FadeIn className="rounded-card border border-primary/10 bg-surface p-7 shadow-card md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Warum das mehr ist als ein Markttrend
          </p>
          <h2 className="mt-2 text-3xl">BESS verbindet Energie, Leistung und Netzqualitaet</h2>
          <p className="mt-4 max-w-3xl text-text-secondary">
            Grossbatterien werden oft ueber Arbitrage erklaert. Fuer die
            Energiewende ist der breitere Blick wichtiger: Speicher koennen
            kurzfristige Flexibilitaet bereitstellen, Regelleistung erbringen,
            lokale Engpaesse beeinflussen und kuenftig technische
            Systemdienstleistungen staerker mitpraegen.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {systemRoles.map((role, index) => (
              <FadeIn
                key={role.title}
                delay={0.04 * (index + 1)}
                className="rounded-card bg-background-alt p-5"
              >
                <h3 className="text-xl text-primary">{role.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{role.text}</p>
              </FadeIn>
            ))}
          </div>
        </FadeIn>
      </section>

      <section className="bg-background-alt py-16 md:py-20">
        <div className="container-shell grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl">Die empfohlene Einordnung</h2>
            <p className="mt-4 leading-relaxed text-text-secondary">
              BESS Kompass ordnet Markt, Netz und Standortlogik ein, bevor
              Annahmen simuliert werden. OpenAutobidder-DE ist das offene
              Modell, mit dem diese Annahmen sichtbar werden.
            </p>
          </FadeIn>
          <div className="grid gap-4">
            {journey.map((item, index) => (
              <FadeIn
                key={item.title}
                delay={index * 0.05}
                className="rounded-card bg-surface p-5 shadow-card"
              >
                <div className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-xl">{item.title}</h3>
                    <p className="mt-1 text-sm text-text-secondary">{item.text}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell pt-14">
        <FadeIn className="rounded-card border border-accent/25 bg-surface p-6 shadow-card">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
            Quellen / Stand
          </p>
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            {missionSources.map((source) => (
              <li key={source}>- {source}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-text-secondary">
            Stand der Einordnung: April 2026. Zahlen zu Pipeline und Anschluss
            beschreiben Markt- und Netzsignale, nicht automatisch realisierte
            Speicherleistung.
          </p>
        </FadeIn>
      </section>
    </div>
  );
}
