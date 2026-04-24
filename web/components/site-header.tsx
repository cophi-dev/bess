"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Ueberblick" },
  { href: "/tagesupdate", label: "Tagesupdate" },
  { href: "/simulator", label: "Simulator" },
  { href: "/revenue-stacking", label: "Lernpfad" },
  { href: "/resources", label: "Ressourcen" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="truncate text-base font-semibold tracking-tight text-primary md:text-lg">
          OpenAutobidder-DE
        </Link>

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-card px-3 py-2 transition-colors ${
                  active
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-text-secondary hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center md:flex">
          <Link
            href="/simulator"
            className="rounded-card bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            Simulator starten
          </Link>
        </div>

        <Link
          href="/tagesupdate"
          className="rounded-card border border-primary/15 bg-surface px-3 py-2 text-xs font-medium text-primary transition hover:border-primary/40 md:hidden"
        >
          Tagesupdate
        </Link>
      </div>
    </header>
  );
}
