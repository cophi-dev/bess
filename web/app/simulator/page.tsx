import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "Simulator",
  description:
    "Interaktiver Lern-Simulator fuer BESS Revenue Stacking im deutschen Markt.",
};

export default function SimulatorPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <FadeIn className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl">Der Simulator</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Dieses Tool ist ein Lerninstrument, kein Trading-System. Es zeigt,
          wie unterschiedliche Erlosstroeme in einem BESS-Portfolio kombiniert
          werden koennen.
        </p>
      </FadeIn>

      <FadeIn
        delay={0.08}
        className="mt-10 rounded-card border border-primary/10 bg-surface p-8 shadow-card"
      >
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl">OpenAutobidder-DE Streamlit App</h2>
            <p className="mt-2 text-text-secondary">
              Oeffne den bestehenden Simulator in einem neuen Tab. Embedding in
              diese Seite folgt als naechster Schritt.
            </p>
          </div>
          <a
            href="https://example.com/openautobidder-simulator"
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-fit rounded-card bg-primary px-6 py-3 font-medium text-white transition hover:bg-primary/90"
          >
            Streamlit Simulator oeffnen
          </a>
        </div>
      </FadeIn>

      <FadeIn
        delay={0.14}
        className="mt-8 rounded-card bg-background-alt p-5 md:p-8"
      >
        <div className="aspect-video rounded-card border border-dashed border-primary/25 bg-surface p-6">
          <p className="text-sm uppercase tracking-[0.12em] text-accent">
            Preview Placeholder
          </p>
          <p className="mt-3 max-w-2xl text-text-secondary">
            Hier kann ein Screenshot oder ein spaeteres iframe-Embed der
            Streamlit-UI angezeigt werden. Der Bereich ist bereits responsive
            vorbereitet.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.2} className="mt-10">
        <Link href="/revenue-stacking" className="text-primary underline-offset-4 hover:underline">
          Erst die Marktlogik verstehen
        </Link>
      </FadeIn>
    </div>
  );
}
