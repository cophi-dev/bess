import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "Netzregulierung",
  description:
    "Warum BESS fuer Netzstabilitaet, Redispatch-Entlastung und die Integration erneuerbarer Energien in Deutschland essenziell sind.",
};

const trends = [
  "Kurzfristig (2026) sind Regionen suedlich klassischer Nord-Sued-Engpaesse oft robuster fuer zusaetzliche Kapazitaeten.",
  "Mit fortschreitendem Netzausbau (2030+) erweitert sich der Suchraum fuer netzvertraegliche Verortung.",
  "Clusterbildung in windstarken Nordregionen kann unter aktuellem Marktdesign Redispatch-Kosten erhoehen.",
  "BESS bleiben strategisch relevant, wenn Standortwahl und Betriebsweise gemeinsam gedacht werden.",
];

export default function GermanMarketPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <FadeIn className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl">Netzregulierung und BESS</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Deutschland braucht flexible Speicher, um erneuerbare Volatilitaet,
          lokale Netzengpaesse und steigende Redispatch-Anforderungen effizient
          zu managen. Gleichzeitig zeigt sich: Nicht nur die Technologie, sondern
          auch der Ort und das Fahrprofil entscheiden ueber den Systemnutzen.
        </p>
      </FadeIn>

      <section className="mt-12 grid gap-5 md:grid-cols-3">
        <FadeIn className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Energiesystem</h2>
          <p className="mt-3 text-text-secondary">
            Hoher Anteil erneuerbarer Energien trifft auf regionale Netzengpaesse
            und zeitweise starke Preisbewegungen. Batterien reagieren darauf
            schnell, aber nicht immer automatisch netzdienlich.
          </p>
        </FadeIn>
        <FadeIn delay={0.06} className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Redispatch</h2>
          <p className="mt-3 text-text-secondary">
            Redispatch wird notwendig, wenn Erzeugung und Netzkapazitaet lokal
            nicht zusammenpassen. Regional konzentrierte Speicherleistung kann
            Engpaesse aber auch verstaerken, wenn Dispatch und Standort nicht
            zusammenpassen.
          </p>
        </FadeIn>
        <FadeIn delay={0.12} className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Rolle von BESS</h2>
          <p className="mt-3 text-text-secondary">
            BESS verbinden Markterloese mit Systemnutzen: Frequenzhaltung,
            Lastverschiebung, Blindleistungsfaehigkeit und netzdienliches
            Verhalten unter klaren Rahmenbedingungen.
          </p>
        </FadeIn>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-3">
        <FadeIn className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Status heute</h2>
          <p className="mt-3 text-text-secondary">
            dena nennt fuer Deutschland aktuell rund 2.6 GW installierte
            Grossbatterieleistung bei 3.9 GWh Kapazitaet.
          </p>
        </FadeIn>
        <FadeIn delay={0.06} className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Pipeline 2030</h2>
          <p className="mt-3 text-text-secondary">
            Im Marktstammdatenregister sind mindestens 5 GW und 10 GWh bis 2030
            hinterlegt - der Ausbau bleibt hochdynamisch.
          </p>
        </FadeIn>
        <FadeIn delay={0.12} className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Anschlussrealitaet</h2>
          <p className="mt-3 text-text-secondary">
            Gleichzeitig berichten Auswertungen von rund 80 GW Zusagen und
            Anschlussanfragen in sehr grosser Groessenordnung. Das erklaert den
            Druck auf Netzkapazitaeten und Priorisierung.
          </p>
        </FadeIn>
      </section>

      <FadeIn delay={0.18} className="mt-12 rounded-card bg-background-alt p-8">
        <h2 className="text-3xl">Was das fuer 2026 und 2030+ bedeutet</h2>
        <ul className="mt-4 space-y-3 text-text-secondary">
          {trends.map((trend) => (
            <li key={trend}>- {trend}</li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-text-secondary">
          Diese Einordnung ist ein Lernrahmen. Sie zeigt Tendenzen unter
          bestimmten Annahmen und ersetzt keine standortspezifische
          Netzanschluss- oder Investitionspruefung. Zahlenstand: dena Analyse
          02/2026.
        </p>
      </FadeIn>
    </div>
  );
}
