import Link from "next/link";
import { FadeIn } from "@/components/fade-in";

const valueCards = [
  {
    title: "Energiewende braucht Flexibilitaet",
    description:
      "BESS schafft den Puffer zwischen volatiler Erzeugung und stabilem Verbrauch - genau dort, wo das Netz heute unter Druck steht.",
  },
  {
    title: "BESS ist Infrastruktur, nicht nur Asset",
    description:
      "Der groesste Hebel entsteht, wenn Speicher wirtschaftlich betrieben und gleichzeitig systemdienlich positioniert werden.",
  },
  {
    title: "Entscheidungen brauchen Transparenz",
    description:
      "BESS Kompass verbindet Mission, Regulierung und Daten, damit aus Komplexitaet konkrete Prioritaeten werden.",
  },
  {
    title: "Jetzt handeln, nicht spaeter",
    description:
      "Wer heute die richtigen Kennzahlen verfolgt, reduziert Risiko und beschleunigt tragfaehige Speicherprojekte.",
  },
];

export default function HomePage() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "BESS Kompass",
    description:
      "Bildungsangebot zu Revenue Stacking fuer Batteriespeicher im deutschen Strommarkt, mit dem offenen Modell OpenAutobidder-DE.",
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
            Ohne BESS gelingt die Energiewende nicht verlässlich
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            <span className="text-text">BESS Kompass</span> fuehrt durch Revenue
            Stacking, Netzlogik und operative Priorisierung. Wir machen sichtbar,
            warum Speicher in Deutschland jetzt essenziell sind - fuer
            Versorgungssicherheit, erneuerbare Integration und wirtschaftliche
            Skalierung.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/daten"
              className="rounded-card bg-primary px-8 py-3 text-base font-medium text-white shadow-card transition hover:bg-primary/90"
            >
              Jetzt zu Daten und KPIs
            </Link>
            <Link
              href="/netzregulierung"
              className="rounded-card border border-primary/15 bg-surface px-8 py-3 text-base font-medium text-primary transition hover:border-primary/40"
            >
              Netzregulierung
            </Link>
          </div>
          <p className="mx-auto mt-6 max-w-lg text-sm text-text-secondary">
            Nächster Schritt:{" "}
            <Link
              href="/simulator"
              className="font-medium text-primary underline decoration-primary/40 underline-offset-4 hover:decoration-primary"
            >
              OpenAutobidder-DE im Simulator testen
            </Link>
            {" "}wenn du Szenarien durchspielen willst.
          </p>
        </FadeIn>
      </section>

      <section className="container-shell pb-16">
        <FadeIn className="mb-6 rounded-card border border-primary/15 bg-surface p-6 shadow-card">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
            What now
          </p>
          <h2 className="mt-2 text-2xl md:text-3xl">
            Was wir jetzt priorisieren sollten
          </h2>
          <p className="mt-2 text-sm text-text-secondary md:text-base">
            Mission heisst jetzt: schnell lernen, sauber priorisieren, dann
            umsetzen. Drei Leitlinien sind entscheidend: verteilte Standortlogik
            statt Clusterdruck, datengetriebene Dispatch-Entscheidungen statt
            Bauchgefuehl und klare Trennung zwischen Lernmodell und finaler
            Investitionspruefung.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            <li>- Kurzfristig: Live-KPIs als gemeinsame Entscheidungsbasis etablieren.</li>
            <li>- Mittelfristig: Standort- und Dispatch-Logik gemeinsam optimieren.</li>
            <li>- Laufend: Annahmen transparent halten und Szenarien testen.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/daten"
              className="rounded-card bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
            >
              Live-Daten starten
            </Link>
            <Link
              href="/simulator"
              className="rounded-card border border-primary/15 bg-surface px-5 py-2 text-sm font-medium text-primary transition hover:border-primary/40"
            >
              Szenarien simulieren
            </Link>
          </div>
        </FadeIn>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <FadeIn className="rounded-card bg-surface p-6 shadow-card">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-primary">dena 2026</p>
            <p className="mt-2 text-3xl">2.6 GW / 3.9 GWh</p>
            <p className="mt-2 text-sm text-text-secondary">
              Installierte Grossbatteriespeicher in Deutschland laut dena.
            </p>
          </FadeIn>
          <FadeIn delay={0.06} className="rounded-card bg-surface p-6 shadow-card">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-primary">Bis 2030 (MaStR)</p>
            <p className="mt-2 text-3xl">ab 5 GW / 10 GWh</p>
            <p className="mt-2 text-sm text-text-secondary">
              Bereits gemeldete Projekte mit signifikanter Ausbauwirkung.
            </p>
          </FadeIn>
          <FadeIn delay={0.12} className="rounded-card bg-surface p-6 shadow-card">
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-primary">Anschlussdruck</p>
            <p className="mt-2 text-3xl">80 GW Zusagen</p>
            <p className="mt-2 text-sm text-text-secondary">
              Bei gleichzeitig deutlich hoeheren Anfragen - starkes Signal fuer
              Anschluss- und Steuerungsbedarf.
            </p>
          </FadeIn>
        </div>

        <FadeIn className="mb-6 rounded-card border border-accent/35 bg-surface p-6 shadow-card">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Daten</p>
          <h2 className="mt-2 text-2xl md:text-3xl">Echtzeitlage und Key Metrics direkt im Blick</h2>
          <p className="mt-2 text-sm text-text-secondary md:text-base">
            Die Datenseite verbindet taegliche Marktlage mit handlungsrelevanten
            Kennzahlen fuer den deutschen BESS-Kontext - fuer Entscheidungen in
            Wochen, nicht in Quartalen.
          </p>
          <Link
            href="/daten"
            className="mt-4 inline-block rounded-card bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            Daten oeffnen
          </Link>
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

      <section className="bg-background-alt py-16 md:py-20">
        <div className="container-shell grid gap-8 md:grid-cols-2">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl">Warum das wichtig ist</h2>
            <p className="mt-4 leading-relaxed text-text-secondary">
              Viele BESS-Modelle unterschaetzen die Realitaet: Projekte werden
              nicht nur ueber Preis-Arbitrage finanziert, sondern ueber ein
              intelligentes Zusammenspiel mehrerer Erloesquellen.
            </p>
          </FadeIn>
          <FadeIn delay={0.08} className="rounded-card bg-surface p-8 shadow-card">
            <p className="text-lg text-text">
              Mit BESS Kompass (Modell: OpenAutobidder-DE) lernen Teams,
              Studierende und Entscheider, wie reale deutsche Speicher-Cases
              wirtschaftlich bewertet werden.
            </p>
            <p className="mt-3 text-sm text-text-secondary">
              Transparent, nachvollziehbar und offen fuer Diskussion - ohne
              Anspruch auf standortscharfe Anschlusszusage.
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
