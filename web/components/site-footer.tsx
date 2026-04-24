import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-primary/10 bg-background-alt">
      <div className="container-shell grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="font-semibold text-primary">OpenAutobidder-DE</p>
          <p className="mt-2 text-sm text-text-secondary">
            Bildungsplattform fuer Revenue Stacking im deutschen BESS-Markt.
          </p>
        </div>
        <div>
          <p className="font-semibold text-text">Schnellzugriff</p>
          <div className="mt-2 flex flex-col gap-2 text-sm text-text-secondary">
            <Link href="/revenue-stacking" className="hover:text-primary">
              Revenue Stacking verstehen
            </Link>
            <Link href="/german-market" className="hover:text-primary">
              Deutscher Markt 2026
            </Link>
            <Link href="/resources" className="hover:text-primary">
              Datenquellen und Glossar
            </Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-text">Projekt</p>
          <div className="mt-2 flex flex-col gap-2 text-sm text-text-secondary">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary"
            >
              GitHub Repository
            </a>
            <Link href="/about" className="hover:text-primary">
              Mission und Disclaimer
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
