import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/fade-in";
import { GridUsefulnessMatrix } from "@/components/insight-visuals";

export const metadata: Metadata = {
  title: "Simulator",
  description:
    "Praktischer Schritt nach Mission, Herausforderungen und Data: OpenAutobidder-DE (Streamlit) fuer Szenarien und Revenue Stacking im deutschen Markt.",
};

const assumptionCards = [
  {
    title: "Dauer und Leistung",
    text: "Ein Szenario sollte Leistung, Kapazitaet und Speicherdauer gemeinsam betrachten. Zwei Stunden EPR verhalten sich anders als vier Stunden, selbst wenn die MW-Zahl gleich aussieht.",
  },
  {
    title: "Stacking-Konflikte",
    text: "FCR, aFRR, Arbitrage und Engpasslogik nutzen dieselbe Batterie. Reservierte Leistung, SoC-Puffer und Aktivierungen reduzieren die Freiheit fuer andere Erloesquellen.",
  },
  {
    title: "Netz statt nur Preis",
    text: "Preisgetriebener Dispatch kann lokal helfen oder schaden. Simulationen sind aussagekraeftiger, wenn Standortannahmen und Netzrestriktionen offen benannt werden.",
  },
];

const simulatorQuestions = [
  "Welche Speicherdauer wird modelliert, und passt sie zum untersuchten Marktprodukt?",
  "Wie werden Wirkungsgrad, Zyklen, Degradation und Mindest-SoC beruecksichtigt?",
  "Welche Leistung ist fuer Regelleistung reserviert und steht nicht fuer Arbitrage bereit?",
  "Welche Annahmen sind echte Daten, welche sind Sensitivitaeten oder pauschale Lernwerte?",
];

const simulatorSources = [
  "NREL Grid-Scale Battery Storage FAQ, Report 74426: Begriffe zu Leistung, Energie, Speicherdauer und Value Stacking.",
  "TenneT / Frontier Kurzpapier, 07.02.2025: Nutzungskonflikte zwischen Markt- und Netzsignalen.",
  "TenneT Quo Vadis 3, 12/2024: Standort- und EPR-Annahmen als zentrale Modellparameter.",
];

const capabilityCards = [
  {
    title: "Datenbasiert",
    text: "Day-Ahead-Preise, Wind-/Solarerzeugung und Systemlast kommen aus Beispieldaten, lokalem ENTSO-E-Cache oder einem klar markierten synthetischen Fallback.",
  },
  {
    title: "Annahmebasiert",
    text: "FCR, aFRR, Kapazitaetszahlungen und Engpassbonus sind Lernannahmen. Sie zeigen Nutzungskonflikte, aber ersetzen keine echten Gebote, Vertraege oder Standortpruefung.",
  },
  {
    title: "Optimiert",
    text: "Das Python-Modell waehlt stuendlich Laden, Entladen, Reserveleistung und SoC unter Batteriegrenzen. Es liefert Plausibilitaet, keine Renditegarantie.",
  },
];

const vnbAxisCards = [
  {
    title: "Marktattraktivitaet",
    label: "Preissignal",
    text: "Stark heisst: hoher erwarteter Jahreserloes aus Arbitrage, FCR, aFRR, Kapazitaets- und Engpassannahmen. Schwach heisst: niedriger, unsicherer oder bereits gesaettigter Ertrag.",
  },
  {
    title: "Netzdienlichkeit",
    label: "Lokale Netzwirkung",
    text: "Passend heisst: der typische Fahrplan entlastet den Netzpunkt. Kritisch heisst: Laden oder Entladen faellt in lokale Engpasszeiten und kann Redispatch-Kosten erhoehen.",
  },
];

const vnbChecklist = [
  "OpenAutobidder-DE-Simulation fuer den exakten Netzpunkt liefern lassen: Jahreserloes, Revenue Stack und typischer Fahrplan.",
  "Historische und Forward-Preise, FCR/aFRR-Erwartungen und Kapazitaetsannahmen gegenpruefen.",
  "Lastfluss- oder Netzsimulation mit genau diesem BESS-Fahrplan rechnen.",
  "Fahrplan mit bekannten Engpasszeiten, Spannungsband und Strombelastung am Netzpunkt abgleichen.",
  "Redispatch- und Engpasskosten mit und ohne Speicher vergleichen und den Quadranten bestimmen.",
];

export default function SimulatorPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <FadeIn className="max-w-3xl">
        <p className="text-sm font-medium text-primary">
          <Link
            href="/mission"
            className="underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary"
          >
            Mission
          </Link>{" "}
          dann{" "}
          <Link
            href="/herausforderungen"
            className="underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary"
          >
            Herausforderungen
          </Link>{" "}
          und{" "}
          <Link
            href="/data"
            className="underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary"
          >
            Data
          </Link>{" "}
          zuerst — der Simulator ist der naechste, praktische Schritt.
        </p>
        <h1 className="mt-4 text-4xl md:text-5xl">Der Simulator</h1>
        <p className="mt-4 text-lg text-text-secondary">
          <span className="text-text">OpenAutobidder-DE</span> in Streamlit: ein
          Lerninstrument, kein Trading-System. Oben: wenige, klare physikalische
          Kennzahlen (Zonenlast, installierte Kapazitaet, Batterie-Entladung),
          optional ein groesserer Speicher als Sensitivitaet. Darunter:
          Wirtschaftskennzahlen, Zeitverlaeufe und Revenue Stacking. Ziel ist
          nicht eine Renditezahl, sondern ein besseres Gefuehl fuer Annahmen,
          Konflikte und Sensitivitaeten.
        </p>
      </FadeIn>

      <section className="mt-10 grid gap-5 md:grid-cols-3">
        {assumptionCards.map((card, index) => (
          <FadeIn
            key={card.title}
            delay={0.05 * index}
            className="rounded-card bg-surface p-6 shadow-card"
          >
            <h2 className="text-2xl">{card.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{card.text}</p>
          </FadeIn>
        ))}
      </section>

      <section className="mt-12 rounded-card border border-primary/10 bg-background-alt p-7 shadow-card md:p-8">
        <FadeIn>
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            VNB-Entscheidung
          </p>
          <h2 className="mt-2 text-3xl">
            So entscheidet ein Verteilnetzbetreiber: Markt stark und Netz passend
          </h2>
          <p className="mt-3 max-w-3xl text-text-secondary">
            Der Simulator liefert nur eine Achse nicht allein: Marktattraktivitaet
            und der resultierende Fahrplan. Fuer eine belastbare VNB-Sicht muss
            dieser Fahrplan gegen die lokale Netzlage gelegt werden.
          </p>
        </FadeIn>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {vnbAxisCards.map((card, index) => (
            <FadeIn
              key={card.title}
              delay={0.04 * (index + 1)}
              className="rounded-card bg-surface p-5 shadow-card"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                {card.label}
              </p>
              <h3 className="mt-2 text-2xl text-primary">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">{card.text}</p>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.1} className="mt-6">
          <GridUsefulnessMatrix
            kicker="VNB-Matrix"
            title="Preis und Netz muessen zusammenpassen"
            description="Jeder geplante Speicher landet in einem Quadranten: priorisieren, pruefen, optional attraktiv machen oder zurueckstellen."
            source="OpenAutobidder-DE Lernmodell, TenneT Systemkostenperspektive und Netzwirkungslogik; Stand April 2026"
          />
        </FadeIn>

        <FadeIn delay={0.14} className="mt-6 rounded-card border border-accent/25 bg-surface p-6">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
            Praktische Pruefkette
          </p>
          <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-text-secondary">
            {vnbChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <p className="mt-5 rounded-card bg-background-alt p-4 text-sm font-medium text-primary">
            Merke: Ein hoher Markt-Spread allein reicht nie. Entscheidend ist,
            ob der Fahrplan zur lokalen Netzlage passt.
          </p>
        </FadeIn>
      </section>

      <FadeIn delay={0.12} className="mt-8 rounded-card border border-primary/15 bg-background-alt p-7">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
          Vor dem Modelllauf
        </p>
        <h2 className="mt-2 text-3xl">Vier Fragen, die jede Simulation braucht</h2>
        <ul className="mt-5 space-y-3 text-sm leading-relaxed text-text-secondary">
          {simulatorQuestions.map((question) => (
            <li key={question}>- {question}</li>
          ))}
        </ul>
      </FadeIn>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        {capabilityCards.map((card, index) => (
          <FadeIn
            key={card.title}
            delay={0.14 + 0.04 * index}
            className="rounded-card border border-primary/10 bg-surface p-6 shadow-card"
          >
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
              {card.title}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">{card.text}</p>
          </FadeIn>
        ))}
      </section>

      <FadeIn
        delay={0.16}
        className="mt-10 rounded-card border border-primary/10 bg-surface p-8 shadow-card"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl">OpenAutobidder-DE (Streamlit)</h2>
            <p className="mt-2 text-text-secondary">
              Die eigentliche Optimierung laeuft in der Python-Streamlit-App. Den
              Tab bevorzugen, falls das Embed blockiert; einige Hoster setzen
              X-Frame-Options. Ergebnisse als Lern- und Plausibilitaetscheck
              lesen, nicht als Handels- oder Investitionsempfehlung.
            </p>
          </div>
          <a
            href="https://bess-pi.streamlit.app"
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit rounded-card bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary/90"
          >
            Streamlit Simulator oeffnen
          </a>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} className="mt-8 overflow-hidden rounded-card border border-primary/10 bg-surface">
        <p className="px-4 pt-4 text-sm text-text-secondary">
          Live-Preview (iframe). Funktioniert nur, wenn streamlit.app Embedding erlaubt.
        </p>
        <iframe
          title="OpenAutobidder-DE Streamlit Dashboard"
          src="https://bess-pi.streamlit.app?embedded=true"
          className="min-h-[720px] w-full border-0"
          allow="clipboard-read; clipboard-write"
        />
      </FadeIn>

      <section className="mt-10 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <FadeIn delay={0.24} className="rounded-card bg-background-alt p-7">
          <h2 className="text-2xl">Was der Simulator gut kann</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Er macht Annahmen sichtbar: Batteriegroesse, C-Rate, Datenmodus,
            Dispatch-Zeitreihe, SoC, Vollzyklen und Revenue-Aufteilung. Damit
            eignet er sich fuer Lernen, Sensitivitaeten und gemeinsame
            Diskussionen ueber Nutzungskonflikte zwischen Arbitrage, Reserve,
            Kapazitaet und Engpasslogik.
          </p>
        </FadeIn>
        <FadeIn delay={0.28} className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Was danach offen bleibt</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-secondary">
            Netzentgelte, Steuern, Degradation, Intraday- und Imbalance-Maerkte,
            standortspezifische Netzanschlussbedingungen, Genehmigung,
            Vermarktungsvertraege, Batteriegarantien und aktuelle regulatorische
            Vorgaben muessen ausserhalb des Lernmodells geprueft werden.
          </p>
        </FadeIn>
      </section>

      <FadeIn delay={0.32} className="mt-8 rounded-card border border-accent/25 bg-surface p-6 shadow-card">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
          Quellen / Stand
        </p>
        <ul className="mt-4 space-y-2 text-sm text-text-secondary">
          {simulatorSources.map((source) => (
            <li key={source}>- {source}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-text-secondary">
          Stand der Einordnung: April 2026. Der Simulator ist ein
          Bildungswerkzeug und ersetzt keine standortspezifische Due Diligence.
        </p>
      </FadeIn>

      <FadeIn delay={0.36} className="mt-10">
        <p className="text-sm text-text-secondary">
          Zurueck zur Mission:{" "}
          <Link
            href="/mission"
            className="font-medium text-primary underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary"
          >
            Why BESS und What now
          </Link>
        </p>
      </FadeIn>
    </div>
  );
}
