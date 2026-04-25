import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-primary/10 bg-background-alt">
      <div className="container-shell grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="font-semibold text-primary">BESS Kompass</p>
          <p className="mt-2 text-sm text-text-secondary">
            Bildungsangebot zu Revenue Stacking im deutschen BESS-Markt. Das
            offene Simulationsmodell heisst OpenAutobidder-DE.
          </p>
        </div>
        <div>
          <p className="font-semibold text-text">Schnellzugriff</p>
          <div className="mt-2 flex flex-col gap-2 text-sm text-text-secondary">
            <Link href="/mission" className="hover:text-primary">
              Mission und Why BESS
            </Link>
            <Link href="/herausforderungen" className="hover:text-primary">
              Herausforderungen
            </Link>
            <Link href="/news" className="hover:text-primary">
              News
            </Link>
            <Link href="/data" className="hover:text-primary">
              Data und Live-KPIs
            </Link>
            <Link href="/simulator" className="hover:text-primary">
              Simulator starten
            </Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-text">Projekt</p>
          <div className="mt-2 flex flex-col gap-2 text-sm text-text-secondary">
            <a
              href="https://github.com/cophi-dev/bess"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary"
            >
              GitHub Repository
            </a>
            <Link href="/mission" className="hover:text-primary">
              BESS Kompass Journey
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-primary/10 py-4 text-center text-xs text-text-secondary">
        Nur zu Bildungszwecken. Keine Finanz- oder Handelsberatung.
      </div>
    </footer>
  );
}
