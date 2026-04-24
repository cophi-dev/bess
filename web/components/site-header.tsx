"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Start" },
  { href: "/simulator", label: "Simulator" },
  { href: "/revenue-stacking", label: "Revenue Stacking" },
  { href: "/german-market", label: "German Market" },
  { href: "/resources", label: "Ressourcen" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-primary">
          OpenAutobidder-DE
        </Link>
        <nav className="hidden gap-5 text-sm md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors ${
                  active ? "text-primary" : "text-text-secondary hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/simulator"
          className="rounded-card bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
        >
          Jetzt testen
        </Link>
      </div>
    </header>
  );
}
