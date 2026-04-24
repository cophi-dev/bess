import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "About",
  description:
    "Mission, Transparenz und Mitmachen: BESS-Faelle wirtschaftlich und systemisch bewerten.",
};

export default function AboutPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <FadeIn className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl">Unsere Mission</h1>
        <p className="mt-4 text-lg text-text-secondary">
          BESS Kompass macht Batteriespeicher im deutschen Markt verstaendlich:
          als Geschaeftsmodell und als Teil eines belastbaren Stromsystems.
        </p>
      </FadeIn>

      <section className="mt-12 grid gap-5 md:grid-cols-2">
        <FadeIn className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Transparenz statt Blackbox</h2>
          <p className="mt-3 text-text-secondary">
            Wir zeigen klar, welche Annahmen, Daten und Vereinfachungen im
            Modell stecken. Ziel ist Lernen, nicht Marketing - inklusive
            Grenzen der Uebertragbarkeit auf konkrete Einzelprojekte.
          </p>
        </FadeIn>
        <FadeIn delay={0.08} className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Mitmachen</h2>
          <p className="mt-3 text-text-secondary">
            Contributions sind willkommen: Modellverbesserungen, Marktdaten,
            Dokumentation und didaktische Inhalte.
          </p>
          <a
            href="https://github.com/cophi-dev/bess"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-primary hover:underline"
          >
            Zum GitHub Projekt
          </a>
        </FadeIn>
      </section>

      <FadeIn delay={0.16} className="mt-8 rounded-card bg-background-alt p-7">
        <h2 className="text-3xl">Disclaimer</h2>
        <p className="mt-3 text-text-secondary">
          Dieses Projekt ist ein Educational Tool. Es stellt keine Finanz-,
          Investitions- oder Handelsberatung dar und ersetzt keine
          standortspezifische Netzanschlusspruefung.
        </p>
      </FadeIn>
    </div>
  );
}
