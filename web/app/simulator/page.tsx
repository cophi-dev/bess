import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "Simulator",
  description:
    "Praktischer Schritt nach Mission, Netzregulierung und Daten: OpenAutobidder-DE (Streamlit) fuer Szenarien und Revenue Stacking im deutschen Markt.",
};

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
          und{" "}
          <Link
            href="/netzregulierung"
            className="underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary"
          >
            Netzregulierung
          </Link>{" "}
          sowie{" "}
          <Link
            href="/daten"
            className="underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary"
          >
            Daten
          </Link>{" "}
          zuerst — der Simulator ist der naechste, praktische Schritt.
        </p>
        <h1 className="mt-4 text-4xl md:text-5xl">Der Simulator</h1>
        <p className="mt-4 text-lg text-text-secondary">
          <span className="text-text">OpenAutobidder-DE</span> in Streamlit: ein
          Lerninstrument, kein Trading-System. Oben: wenige, klare physikalische
          Kennzahlen (Zonenlast, installierte Kapazitaet, Batterie-Entladung),
          optional ein groesserer Speicher als Sensitivitaet. Darunter:
          Wirtschaftskennzahlen, Zeitverlaeufe und Revenue-Stacking.
        </p>
      </FadeIn>

      <FadeIn
        delay={0.08}
        className="mt-10 rounded-card border border-primary/10 bg-surface p-8 shadow-card"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl">OpenAutobidder-DE (Streamlit)</h2>
            <p className="mt-2 text-text-secondary">
              Die eigentliche Optimierung laeuft in der Python-Streamlit-App. Den
              Tab bevorzugen, falls das Embed blockiert; einige Hoster setzen
              X-Frame-Options.
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

      <FadeIn delay={0.14} className="mt-8 overflow-hidden rounded-card border border-primary/10 bg-surface">
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

      <FadeIn delay={0.2} className="mt-10">
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
