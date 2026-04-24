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
  "Was 2.6 GW heute und >=5 GW bis 2030 fuer Projektbewertung bedeuten",
];

const glossary = [
  ["BESS", "Battery Energy Storage System"],
  ["FCR", "Frequency Containment Reserve (Primaerregelung)"],
  ["aFRR", "Automatic Frequency Restoration Reserve (Sekundaerregelung)"],
  ["Redispatch", "Eingriffe zur Netzstabilisierung bei Engpaessen"],
  ["Blindleistung", "Spannungsstuetzende Leistung ohne Wirkarbeitstransport"],
  ["Momentanreserve", "Sehr schnelle Frequenzstuetzung im Stoerungsfall"],
  ["Saettigungseffekt", "Abnehmender Zusatznutzen bei regional ueberkonzentriertem Speicherzubau"],
];

export default function ResourcesPage() {
  return (
    <div className="container-shell py-16 md:py-20">
      <FadeIn>
        <h1 className="text-4xl md:text-5xl">Ressourcen</h1>
        <p className="mt-4 text-lg text-text-secondary">
          Glossar, kompakte Themenlisten, Datenquellen und praktische Hinweise
          - Erklaerungen im Detail finden sich im Lernpfad und unter Markt.
        </p>
      </FadeIn>

      <section className="mt-12 grid gap-5 md:grid-cols-2">
        <FadeIn className="rounded-card bg-surface p-7 shadow-card">
          <h2 className="text-2xl">Themen (kurz)</h2>
          <p className="mt-2 text-sm text-text-secondary">
            Feste Lerninhalte im Lernpfad; hier nur kompakte Leselisten.
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
        <FadeIn className="rounded-card bg-background-alt p-7">
          <h2 className="text-2xl">Datenquellen</h2>
          <div className="mt-4 flex flex-col gap-2 text-text-secondary">
            <a href="https://tennet-drupal.s3.eu-central-1.amazonaws.com/default/2025-08/QuoVadis3_Webversion.pdf" target="_blank" rel="noreferrer" className="hover:text-primary">
              TenneT Quo Vadis: Gross-Batteriespeicher (PDF)
            </a>
            <a href="https://tennet.eu/quo-vadis-netzkarte" target="_blank" rel="noreferrer" className="hover:text-primary">
              TenneT Netzkarte und Anschlusskapazitaeten
            </a>
            <a href="https://www.regelleistung.net/" target="_blank" rel="noreferrer" className="hover:text-primary">
              regelleistung.net
            </a>
            <a href="https://transparency.entsoe.eu/" target="_blank" rel="noreferrer" className="hover:text-primary">
              ENTSO-E Transparency Platform
            </a>
            <a href="https://www.smard.de/" target="_blank" rel="noreferrer" className="hover:text-primary">
              SMARD Strommarktdaten
            </a>
          </div>
        </FadeIn>
        <FadeIn delay={0.08} className="rounded-card bg-background-alt p-7">
          <h2 className="text-2xl">Vertiefung</h2>
          <div className="mt-4 flex flex-col gap-2 text-text-secondary">
            <a href="https://www.netzentwicklungsplan.de/nep-aktuell/netzentwicklungsplan-20372045-2023" target="_blank" rel="noreferrer" className="hover:text-primary">
              Netzentwicklungsplan Strom 2037/2045 (NEP)
            </a>
            <a href="https://www.smard.de/" target="_blank" rel="noreferrer" className="hover:text-primary">
              SMARD Marktdaten
            </a>
          </div>
        </FadeIn>
      </section>

      <FadeIn delay={0.14} className="mt-8 rounded-card bg-surface p-7 shadow-card">
        <h2 className="text-2xl">Kennzahlen (dena, 02/2026)</h2>
        <ul className="mt-4 space-y-3 text-text-secondary">
          <li>- Installiert: 2.6 GW Leistung und 3.9 GWh Kapazitaet in Deutschland.</li>
          <li>- Gemeldete Projekte bis 2030 (MaStR): mindestens 5 GW und 10 GWh.</li>
          <li>- Markt- und Netzdruck: rund 80 GW Anschlusszusagen, sehr hohe Anfragevolumina.</li>
          <li>- NEP-Orientierung 2037: 47 bis 65 GW Grossbatterieleistung als Systemhorizont.</li>
        </ul>
        <p className="mt-4 text-sm text-text-secondary">
          Die Werte dienen der Einordnung und koennen sich mit Markt-,
          Regulierungs- und Netzentwicklung laufend veraendern.
        </p>
      </FadeIn>
    </div>
  );
}
