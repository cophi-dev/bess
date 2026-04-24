import Link from "next/link";
import { FadeIn } from "@/components/fade-in";

const valueCards = [
  {
    title: "Revenue Stacking",
    description:
      "Verstehen, wie mehrere Erlosstroeme gemeinsam wirtschaftliche BESS-Projekte tragen.",
  },
  {
    title: "German Market",
    description:
      "Fokus auf deutsche Realitaet: Volatilitaet, Redispatch, Regelleistung und Netzengpaesse.",
  },
  {
    title: "Educational",
    description:
      "Komplexe Marktlogik als klarer Lernpfad statt Blackbox-Modell oder Marketing-Slides.",
  },
  {
    title: "Free & Open",
    description:
      "Open-Source-Grundlage fuer Forschung, Weiterbildung und transparente Diskussion.",
  },
  {
    title: "Tagesupdate & Tagesthemen",
    description:
      "Taegliche Lektion plus die wichtigsten deutschen Marktthemen und regulatorischen Entwicklungen.",
  },
];

export default function HomePage() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "OpenAutobidder-DE",
    description:
      "Bildungsplattform zu Revenue Stacking fuer Batteriespeicher im deutschen Strommarkt.",
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
            Beyond Arbitrage
          </p>
          <h1 className="mt-4 text-4xl leading-tight md:text-6xl">
            Wie Batteriespeicher in Deutschland wirklich Geld verdienen
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-text-secondary">
            OpenAutobidder-DE erklaert Revenue Stacking mit echten Mechaniken aus
            dem Markt: Arbitrage, FCR, aFRR, Kapazitaetsverguetung und
            Netzengpass-Anreize.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/simulator"
              className="rounded-card bg-primary px-8 py-3 text-base font-medium text-white shadow-card transition hover:bg-primary/90"
            >
              Simulator ausprobieren
            </Link>
            <Link
              href="/revenue-stacking"
              className="rounded-card border border-primary/15 bg-surface px-8 py-3 text-base font-medium text-primary transition hover:border-primary/40"
            >
              Revenue Stacking verstehen
            </Link>
          </div>
        </FadeIn>
      </section>

      <section className="container-shell pb-16">
        <FadeIn className="mb-6 rounded-card border border-accent/35 bg-surface p-6 shadow-card">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">Tagesupdate</p>
          <h2 className="mt-2 text-2xl md:text-3xl">Lektion zuerst, aktuelle Tagesthemen direkt danach</h2>
          <p className="mt-2 text-sm text-text-secondary md:text-base">
            Das Tagesupdate verbindet Lernfortschritt mit der taeglichen Marktlage in Deutschland.
          </p>
          <Link
            href="/tagesupdate"
            className="mt-4 inline-block rounded-card bg-primary px-5 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            Tagesupdate oeffnen
          </Link>
        </FadeIn>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-5">
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
              {card.title.includes("Tagesupdate") && (
                <Link
                  href="/tagesupdate"
                  className="mt-4 inline-block text-sm font-medium text-primary underline decoration-primary/40 underline-offset-4 transition hover:decoration-primary"
                >
                  Zum Tagesupdate
                </Link>
              )}
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
              Mit OpenAutobidder-DE lernen Teams, Studierende und Entscheider,
              wie reale deutsche Speicher-Cases wirtschaftlich bewertet werden.
            </p>
            <p className="mt-3 text-sm text-text-secondary">
              Transparent, nachvollziehbar und offen fuer Diskussion.
            </p>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
