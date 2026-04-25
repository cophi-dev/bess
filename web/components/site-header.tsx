"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/mission", label: "Mission" },
  { href: "/herausforderungen", label: "Herausforderungen" },
  { href: "/news", label: "News" },
  { href: "/data", label: "Data" },
  { href: "/simulator", label: "Simulator" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-primary/10 bg-background/95 backdrop-blur">
      <div className="container-shell flex h-16 items-center justify-between gap-4">
        <Link href="/" className="truncate text-base font-semibold tracking-tight text-primary md:text-lg">
          BESS Kompass
        </Link>

        <nav className="hidden max-w-[min(100%,52rem)] flex-wrap items-center justify-end gap-0.5 text-sm lg:flex">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href === "/mission" && pathname === "/") ||
              pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-card px-2.5 py-2 transition-colors lg:px-3 ${
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

        <div className="hidden items-center lg:flex">
          <Link
            href="/data"
            className="rounded-card bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90"
          >
            Live-Data
          </Link>
        </div>

        <details className="group relative z-50 lg:hidden">
          <summary className="list-none cursor-pointer rounded-card border border-primary/15 bg-surface px-3 py-2 text-xs font-medium text-primary transition hover:border-primary/40 [&::-webkit-details-marker]:hidden">
            Menue
          </summary>
          <nav className="absolute right-0 top-full mt-1 flex min-w-[12rem] flex-col gap-0.5 rounded-card border border-primary/10 bg-surface/98 p-2 shadow-card backdrop-blur">
            {navItems.map((item) => {
              const active =
                pathname === item.href ||
                (item.href === "/mission" && pathname === "/") ||
                pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm transition-colors ${
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-text-secondary hover:bg-background-alt hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </details>
      </div>
    </header>
  );
}
