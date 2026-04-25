import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/fade-in";
import { GridUsefulnessMatrix, RevenueStackVisual } from "@/components/insight-visuals";

export const metadata: Metadata = {
  title: "Herausforderungen",
  description:
    "Die zentralen Herausforderungen fuer BESS in Deutschland: Wirtschaftlichkeit, Netzregulierung, Revenue Stacking, Standortlogik und Entscheidungsrisiken.",
};

const challengeCards = [
  {
    title: "Wirtschaftlichkeit ist kein einzelner Spread",
    text: "Arbitrage bleibt wichtig, aber Verluste, Zyklen, Degradation, Regelleistung und Verfuegbarkeit entscheiden gemeinsam ueber den Case.",
  },
  {
    title: "Netzlogik ist lokal",
    text: "Ein Speicher kann entlasten oder Engpaesse verstaerken. Standort, Netzanschluss, Betriebsstrategie und lokale Netzsituation muessen zusammen bewertet werden.",
  },
  {
    title: "Revenue Stacking braucht Priorisierung",
    text: "FCR, aFRR, Kapazitaet, Arbitrage und Engpasslogik konkurrieren um dieselbe Batterieleistung. Der Stack muss technisch und vertraglich konsistent bleiben.",
  },
];

const revenueStreams = [
  {
    name: "FCR",
    text: "Primaerregelenergie verguetet schnelle, zuverlaessige Leistungsvorhaltung. Gebundene Leistung steht in dieser Zeit nicht frei fuer jeden Arbitrage-Trade bereit.",
  },
  {
    name: "aFRR",
    text: "Sekundaerregelung kombiniert Verfuegbarkeit und Aktivierungslogik. Sie kann Erloese stabilisieren, erhoeht aber Anforderungen an Prognose, Steuerung und SoC-Management.",
  },
  {
    name: "Arbitrage",
    text: "Preisgetriebenes Laden und Entladen nutzt Spreads, muss aber Wirkungsgrad, Zyklen, Degradation, Restkapazitaet und alternative Marktbindungen einpreisen.",
  },
  {
    name: "Kapazitaet und Engpass",
    text: "Verfuegbarkeit, unterbrechbare Anschluesse, Lageboni oder netzdienliche Proxy-Signale koennen Zusatznutzen stiften, ersetzen aber keine Standortpruefung.",
  },
];

const gridTrends = [
  "Kurzfristig koennen Regionen suedlich klassischer Nord-Sued-Engpaesse unter bestimmten Annahmen robuster fuer zusaetzliche Kapazitaeten sein.",
  "Mit fortschreitendem Netzausbau und klareren Anschlussregeln erweitert sich der Suchraum fuer netzvertraegliche Verortung.",
  "Clusterbildung in windstarken Nordregionen kann Redispatch-Kosten erhoehen, wenn viele Speicher identische Marktpreissignale verfolgen.",
  "BESS bleiben strategisch relevant, wenn Standortwahl, Speicherdauer und Betriebsweise gemeinsam optimiert werden.",
];

const marketInsights = [
  {
    title: "Markttiefe ist begrenzt",
    text: "Regelleistungsmaerkte koennen attraktive Bausteine sein, sind aber nicht beliebig tief. Je mehr Batteriespeicher dieselben Produkte bedienen, desto wichtiger werden Aktivierungsrisiken, Opportunitaetskosten und alternative Fahrplaene.",
  },
  {
    title: "Pipeline ist kein Bestand",
    text: "Anschlussanfragen und Zusagen zeigen Investitionsdruck, aber viele Projekte sind frueh, mehrfach angefragt oder noch nicht netztechnisch gesichert. Ein belastbarer Case braucht deshalb Reifegrad statt Schlagzeile.",
  },
  {
    title: "Systemkosten zaehlen",
    text: "Ein guter Speicher reduziert nicht nur Einkaufskosten im Marktmodell. Er sollte auch vermeiden, neue Engpaesse, Redispatch-Bedarf oder Netzanschlusskosten an anderer Stelle zu vergroessern.",
  },
];

const regulationTopics = [
  "Reifegradverfahren und transparente Anschlusskapazitaeten koennen helfen, knappe Netzanschlussressourcen nach Realisierungswahrscheinlichkeit zu sortieren.",
  "Flexible Connection Agreements, unterbrechbare Anschluesse und dynamischere Netzentgelte sind Instrumente, um Standort- und Betriebsanreize naeher an die Netzrealitaet zu bringen.",
  "Grid-forming-Faehigkeiten, Blindleistung und schnelle Regelbarkeit werden wichtiger, wenn leistungselektronische Anlagen klassische rotierende Momentanreserve verdraengen.",
];

const locationChecks = [
  ["Ort", "Liegt der Speicher vor oder hinter einem relevanten Engpass, nahe Erzeugung, Last oder einem belastbaren Netzanschlusspunkt?"],
  ["Dauer", "Passt die Speicherdauer zum Ziel: Minutenreserve, Tagesverschiebung, PV-Mittagsspitze oder laengere Knappheitsfenster?"],
  ["Fahrplan", "Folgt der Dispatch nur Preisen oder beruecksichtigt er Netzrestriktionen, SoC-Puffer und vertragliche Verfuegbarkeit?"],
  ["Stack", "Welche Leistung ist fuer FCR, aFRR, Arbitrage oder Engpassprodukte reserviert, und welche Konflikte entstehen daraus?"],
];

const challengeSources = [
  "dena Analyse Grossbatteriespeicher, 02/2026: Netzanschluss, Reifegradverfahren, Co-Location, MiSpeL, dynamischere Netzentgelte und GfM-Fragen.",
  "TenneT / Frontier Kurzpapier, 07.02.2025: Systemkosten, Markt- versus Netzsignale und Instrumente fuer systemdienliche Integration.",
  "TenneT Quo Vadis 3, 12/2024: regionale Standortwirkung in der TenneT-Regelzone unter definierten Modellannahmen.",
  "NREL Grid-Scale Battery Storage FAQ, Report 74426: Value Stacking, Nutzungskonflikte und Grundbegriffe zu BESS-Dienstleistungen.",
];

export default function HerausforderungenPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <FadeIn className="max-w-3xl">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
          Herausforderungen
        </p>
        <h1 className="mt-3 text-4xl md:text-5xl">
          BESS-Cases scheitern selten an der Batterie allein
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Die schwierigen Fragen liegen im Zusammenspiel aus Markt, Netz,
          Standort und Betrieb. Diese Seite buendelt die bisherigen Inhalte zu
          Wirtschaftlichkeit, Netzregulierung und Revenue Stacking in einem
          problemorientierten Lernrahmen - mit Quellen, Caveats und konkreten
          Prueffragen fuer Grossbatteriespeicher.
        </p>
      </FadeIn>

      <section className="mt-12 grid gap-5 md:grid-cols-3">
        {challengeCards.map((card, index) => (
          <FadeIn
            key={card.title}
            delay={index * 0.06}
            className="rounded-card bg-surface p-7 shadow-card"
          >
            <h2 className="text-2xl">{card.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              {card.text}
            </p>
          </FadeIn>
        ))}
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <FadeIn className="rounded-card border border-primary/15 bg-surface p-7 shadow-card md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Markt und Finanzen
          </p>
          <h2 className="mt-2 text-3xl">Arbitrage reicht als Erklaerung nicht</h2>
          <p className="mt-4 text-text-secondary">
            Grossbatteriespeicher vergueten sich in Deutschland typischerweise
            nicht nur ueber Kauf- und Verkaufsarbitrage. Entscheidend ist der
            echte Spread nach Wirkungsgrad, Batterieverschleiss, Zyklen,
            Prognoserisiko, SoC-Reserve und Bindung von Leistung an andere
            Maerkte.
          </p>
          <p className="mt-3 text-sm text-text-secondary">
            Deshalb trennt OpenAutobidder-DE Erloesstroeme sichtbar. Das macht
            Annahmen vergleichbar, macht Nutzungskonflikte sichtbar und
            garantiert keine konkrete Rendite.
          </p>
        </FadeIn>

        <FadeIn delay={0.08} className="rounded-card bg-background-alt p-7 md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Netz und Regulierung
          </p>
          <h2 className="mt-2 text-3xl">Systemnutzen haengt am Ort</h2>
          <p className="mt-4 text-text-secondary">
            Redispatch wird notwendig, wenn Erzeugung und Netzkapazitaet lokal
            nicht zusammenpassen. Regional konzentrierte Speicherleistung kann
            Engpaesse verstaerken, wenn Dispatch und Standort nicht zur
            Netzrealitaet passen.
          </p>
          <p className="mt-3 text-sm text-text-secondary">
            Netzregulierend ist ein BESS erst dann, wenn Produkt, Anschluss und
            Fahrweise gemeinsam gedacht werden.
          </p>
        </FadeIn>
      </section>

      <FadeIn delay={0.1} className="mt-8">
        <GridUsefulnessMatrix />
      </FadeIn>

      <section className="mt-12 rounded-card bg-surface p-7 shadow-card md:p-8">
        <FadeIn>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Markt, Pipeline und Systemkosten
          </p>
          <h2 className="mt-2 text-3xl">Die zentrale Frage ist nicht nur: lohnt es sich?</h2>
          <p className="mt-3 max-w-3xl text-text-secondary">
            Studien zu Grossbatteriespeichern verschieben den Blick von
            Einzelspreads zu Systemwirkung. Ein Projekt kann im Markt attraktiv
            aussehen und trotzdem lokal unguenstig sein, wenn es Engpaesse
            verstaerkt oder Anschlusskapazitaet ohne klare Realisierung bindet.
          </p>
        </FadeIn>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {marketInsights.map((insight, index) => (
            <FadeIn
              key={insight.title}
              delay={0.04 * (index + 1)}
              className="rounded-card bg-background-alt p-5"
            >
              <h3 className="text-xl text-primary">{insight.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{insight.text}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-card border border-accent/30 bg-surface p-7 shadow-card md:p-8">
        <FadeIn>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
            Revenue Stacking
          </p>
          <h2 className="mt-2 text-3xl">Der Stack ist eine Priorisierungsfrage</h2>
          <p className="mt-3 max-w-3xl text-text-secondary">
            Erfolgreiche BESS-Projekte kombinieren mehrere Erloesquellen. Die
            Herausforderung ist nicht die Liste der Maerkte, sondern die saubere
            Entscheidung, wann welche Leistung fuer welchen Zweck gebunden wird.
          </p>
        </FadeIn>
        <FadeIn delay={0.04} className="mt-6">
          <RevenueStackVisual />
        </FadeIn>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {revenueStreams.map((stream, index) => (
            <FadeIn
              key={stream.name}
              delay={0.04 * (index + 1)}
              className="rounded-card bg-background-alt p-5"
            >
              <h3 className="text-xl text-primary">{stream.name}</h3>
              <p className="mt-2 text-sm text-text-secondary">{stream.text}</p>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <FadeIn className="rounded-card bg-background-alt p-7 md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Standortpruefung
          </p>
          <h2 className="mt-2 text-3xl">Vier Fragen vor dem Anschlussantrag</h2>
          <div className="mt-5 space-y-4">
            {locationChecks.map(([label, text]) => (
              <div key={label}>
                <h3 className="text-lg text-primary">{label}</h3>
                <p className="mt-1 text-sm text-text-secondary">{text}</p>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="rounded-card border border-primary/15 bg-surface p-7 shadow-card md:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Regulierung in Bewegung
          </p>
          <h2 className="mt-2 text-3xl">Netzdienlichkeit braucht bessere Signale</h2>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-text-secondary">
            {regulationTopics.map((topic) => (
              <li key={topic}>- {topic}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-text-secondary">
            Viele Instrumente sind noch in Ausgestaltung oder Diskussion. Fuer
            Projektbewertungen zaehlt deshalb der jeweils aktuelle Rechts- und
            Netzanschlussstand.
          </p>
        </FadeIn>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <FadeIn className="rounded-card bg-background-alt p-7 md:p-8">
          <h2 className="text-3xl">Was das fuer Projekte bedeutet</h2>
          <ul className="mt-4 space-y-3 text-text-secondary">
            {gridTrends.map((trend) => (
              <li key={trend}>- {trend}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-text-secondary">
            Diese Einordnung ist ein Lernrahmen und ersetzt keine
            standortspezifische Netzanschluss-, Genehmigungs- oder
            Investitionspruefung.
          </p>
        </FadeIn>

        <FadeIn delay={0.08} className="rounded-card bg-surface p-7 shadow-card md:p-8">
          <h2 className="text-3xl">Naechste Schritte</h2>
          <p className="mt-3 text-text-secondary">
            Nach den Herausforderungen folgt die Datenlage: Verbrauch,
            Erzeugung, Netzfrequenz, installierte BESS-Leistung und taegliche
            Einordnung. Danach koennen Annahmen im Simulator getestet werden.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/data"
              className="rounded-card bg-primary px-6 py-3 text-center text-sm font-medium text-white transition hover:bg-primary/90"
            >
              Data ansehen
            </Link>
            <Link
              href="/simulator"
              className="rounded-card border border-primary/20 bg-surface px-6 py-3 text-center text-sm font-medium text-primary transition hover:border-primary/40"
            >
              Simulator starten
            </Link>
          </div>
        </FadeIn>
      </section>

      <FadeIn delay={0.14} className="mt-12 rounded-card border border-accent/25 bg-surface p-6 shadow-card">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
          Quellen / Stand
        </p>
        <ul className="mt-4 space-y-2 text-sm text-text-secondary">
          {challengeSources.map((source) => (
            <li key={source}>- {source}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-text-secondary">
          Stand der Einordnung: April 2026. Regionale Aussagen aus Quo Vadis
          gelten im Kontext der dortigen Modellannahmen und sind keine
          pauschale Standortempfehlung.
        </p>
      </FadeIn>
    </div>
  );
}
