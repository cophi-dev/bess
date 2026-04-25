import type { Metadata } from "next";
import { FadeIn } from "@/components/fade-in";

export const metadata: Metadata = {
  title: "Ressourcen",
  description:
    "Glossar, Quellen und praktische Hinweise zu BESS Revenue Stacking, Standortwirkung und Netzdienlichkeit.",
};

const posts = [
  "Warum reine Arbitrage fuer BESS oft nicht reicht",
  "Wie Standortwahl und Betriebsweise Redispatch beeinflussen",
  "PV-Mittagsladung und Peak-Entladung richtig einordnen",
  "Was 2.6 GW heute, Anschlusszusagen und NEP-Horizonte wirklich bedeuten",
  "Warum Speicherdauer, Leistung und Netzanschlusspunkt zusammengehoeren",
  "Wie Grid-forming-Faehigkeiten und Blindleistung zur Systemstabilitaet beitragen koennen",
];

const glossary = [
  ["BESS", "Battery Energy Storage System"],
  ["EPR", "Energy-to-Power Ratio; grob die Speicherdauer bei voller Leistung"],
  ["FCR", "Frequency Containment Reserve (Primaerregelung)"],
  ["aFRR", "Automatic Frequency Restoration Reserve (Sekundaerregelung)"],
  ["Redispatch", "Eingriffe zur Netzstabilisierung bei Engpaessen"],
  ["Blindleistung", "Spannungsstuetzende Leistung ohne Wirkarbeitstransport"],
  ["Momentanreserve", "Sehr schnelle Frequenzstuetzung im Stoerungsfall"],
  ["Grid-forming", "Netzbildende Wechselrichterlogik, die Spannung und Frequenz aktiv stuetzen kann"],
  ["Flexible Connection Agreement", "Netzanschluss mit definierten Einschraenkungen statt jederzeit voller Einspeise- oder Bezugsleistung"],
  ["MiSpeL", "Mischspeicherlogik zur klareren Behandlung gespeicherter Energie aus Netz und Erzeugungsanlage"],
  ["Saettigungseffekt", "Abnehmender Zusatznutzen bei regional ueberkonzentriertem Speicherzubau"],
];

const benchmarkFacts = [
  {
    label: "Bestand",
    value: "2.6 GW / 3.9 GWh",
    text: "Installierte Grossbatteriespeicher in Deutschland laut dena-Auswertung. Die Speicherdauer im Grosssegment tendiert Richtung etwa zwei Stunden.",
  },
  {
    label: "Pipeline",
    value: ">=5 GW / 10 GWh",
    text: "Im Marktstammdatenregister gemeldete Projekte bis 2030. Das ist ein Planungssignal, keine gesicherte Inbetriebnahme.",
  },
  {
    label: "Anschlussdruck",
    value: "80 GW+",
    text: "Auswertungen zeigen sehr hohe Anschlusszusagen und noch deutlich hoehere Anfragen. Mehrfachanfragen und fruehe Projektstaende muessen mitgedacht werden.",
  },
  {
    label: "Systemhorizont",
    value: "47-65 GW",
    text: "NEP-Orientierung fuer Grossbatterieleistung bis 2037. Fuer einzelne Projekte bleibt der lokale Netzkontext entscheidend.",
  },
];

const sourceGroups = [
  {
    title: "Primarquellen fuer Deutschland",
    links: [
      {
        href: "https://tennet-drupal.s3.eu-central-1.amazonaws.com/default/2025-08/QuoVadis3_Webversion.pdf",
        label: "TenneT Quo Vadis 3: Gross-Batteriespeicher (PDF)",
      },
      {
        href: "https://tennet.eu/quo-vadis-netzkarte",
        label: "TenneT Netzkarte und Anschlusskapazitaeten",
      },
      {
        href: "https://www.netzentwicklungsplan.de/nep-aktuell/netzentwicklungsplan-20372045-2023",
        label: "Netzentwicklungsplan Strom 2037/2045",
      },
    ],
  },
  {
    title: "Markt- und Betriebsdaten",
    links: [
      {
        href: "https://www.regelleistung.net/",
        label: "regelleistung.net",
      },
      {
        href: "https://transparency.entsoe.eu/",
        label: "ENTSO-E Transparency Platform",
      },
      {
        href: "https://www.smard.de/",
        label: "SMARD Strommarktdaten",
      },
    ],
  },
];

const carefulClaims = [
  "Anschlussanfragen sind kein Ausbaupfad. Fuer belastbare Aussagen immer zwischen Anfrage, Zusage, Genehmigung, Bau und Betrieb unterscheiden.",
  "Netzdienlichkeit ist kein Technologieetikett. Ein Speicher kann je nach Ort und Fahrplan helfen oder belasten.",
  "Vendor-Dokumente zu Sicherheit, Grid-forming oder Rechenzentren sind nuetzlich fuer Themenradar, sollten aber nicht als neutrale deutsche Marktstatistik gelesen werden.",
];

export default function ResourcesPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <FadeIn>
        <h1 className="text-4xl md:text-5xl">Ressourcen</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Glossar, Quellen, Kennzahlen und Caveats fuer BESS-Projekte in
          Deutschland. Die Detailerklaerungen stehen bei den
          Herausforderungen; diese Seite sammelt die Referenzen.
        </p>
      </FadeIn>

      <section className="mt-12 grid gap-5 md:grid-cols-2">
        <FadeIn className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Themen (kurz)</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Vertiefende Einordnung auf den Themenseiten; hier nur kompakte
            Leselisten.
          </p>
          <ul className="mt-4 space-y-3 text-text-secondary">
            {posts.map((post) => (
              <li key={post}>- {post}</li>
            ))}
          </ul>
        </FadeIn>
        <FadeIn delay={0.08} className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Glossar</h2>
          <div className="mt-4 space-y-3 text-sm">
            {glossary.map(([term, definition]) => (
              <p key={term} className="text-text-secondary">
                <span className="font-semibold text-text">{term}:</span> {definition}
              </p>
            ))}
          </div>
        </FadeIn>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2">
        {sourceGroups.map((group, index) => (
          <FadeIn key={group.title} delay={0.08 * index} className="rounded-card bg-background-alt p-7">
            <h2 className="text-2xl">{group.title}</h2>
            <div className="mt-4 flex flex-col gap-2 text-text-secondary">
              {group.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </FadeIn>
        ))}
      </section>

      <FadeIn delay={0.14} className="mt-8 rounded-card bg-surface p-7 shadow-card">
        <h2 className="text-2xl">Kennzahlen (dena, 02/2026)</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {benchmarkFacts.map((fact) => (
            <div key={fact.label} className="rounded-card bg-background-alt p-5">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-primary">{fact.label}</p>
              <p className="mt-2 text-2xl">{fact.value}</p>
              <p className="mt-2 text-sm text-text-secondary">{fact.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm text-text-secondary">
          Die Werte dienen der Einordnung und koennen sich mit Markt-,
          Regulierungs- und Netzentwicklung laufend veraendern.
        </p>
      </FadeIn>

      <FadeIn delay={0.18} className="mt-8 rounded-card border border-accent/25 bg-surface p-7 shadow-card">
        <h2 className="text-2xl">Caveats fuer belastbare BESS-Aussagen</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
          {carefulClaims.map((claim) => (
            <li key={claim}>- {claim}</li>
          ))}
        </ul>
      </FadeIn>

      <FadeIn delay={0.22} className="mt-8 rounded-card border border-accent/25 bg-surface p-6 shadow-card">
        <p className="text-sm font-medium uppercase tracking-[0.14em] text-accent">
          Quellen / Stand
        </p>
        <p className="mt-3 text-sm text-text-secondary">
          Stand der Einordnung: April 2026. Die statischen Kennzahlen basieren
          auf den recherchierten dena-, TenneT-/Frontier-, Quo-Vadis- und
          NREL-Unterlagen; laufende Marktwerte kommen separat aus Data und News.
        </p>
      </FadeIn>
    </div>
  );
}
