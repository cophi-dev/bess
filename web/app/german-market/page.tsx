import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "German Market",
  description:
    "Ueberblick zum deutschen Energiesystem, Redispatch-Herausforderungen und BESS-Rolle.",
};

const trends = [
  "Mehr volatile Einspeisung aus Wind und PV erhoeht Flexibilitaetsbedarf.",
  "Redispatch-Kosten bleiben ein zentraler Effizienztreiber im Netzbetrieb.",
  "Regelleistungsmaerkte entwickeln sich in Richtung datengetriebener Co-Optimierung.",
  "BESS werden als systemdienliche Flexibilitaetsressource strategisch wichtiger.",
];

export default function GermanMarketPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <FadeIn className="max-w-3xl">
        <h1 className="text-4xl md:text-5xl">Der deutsche Marktkontext</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Deutschland braucht flexible Speicher, um erneuerbare Volatilitaet,
          lokale Netzengpaesse und steigende Redispatch-Anforderungen effizient
          zu managen.
        </p>
      </FadeIn>

      <section className="mt-12 grid gap-5 md:grid-cols-3">
        <FadeIn className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Energiesystem</h2>
          <p className="mt-3 text-text-secondary">
            Hoher Anteil erneuerbarer Energien trifft auf regionale Netzengpaesse
            und zeitweise starke Preisbewegungen.
          </p>
        </FadeIn>
        <FadeIn delay={0.06} className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Redispatch</h2>
          <p className="mt-3 text-text-secondary">
            Redispatch wird notwendig, wenn Erzeugung und Netzkapazitaet lokal
            nicht zusammenpassen. Flexible Speicher koennen entlasten.
          </p>
        </FadeIn>
        <FadeIn delay={0.12} className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Rolle von BESS</h2>
          <p className="mt-3 text-text-secondary">
            BESS verbinden Markterloese mit Systemnutzen: Frequenzhaltung,
            Lastverschiebung und netzdienliches Verhalten.
          </p>
        </FadeIn>
      </section>

      <FadeIn delay={0.18} className="mt-12 rounded-card bg-background-alt p-8">
        <h2 className="text-3xl">Ausblick 2026</h2>
        <ul className="mt-4 space-y-3 text-text-secondary">
          {trends.map((trend) => (
            <li key={trend}>- {trend}</li>
          ))}
        </ul>
      </FadeIn>
    </div>
  );
}
