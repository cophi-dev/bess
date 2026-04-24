import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://openautobidder.de"),
  title: {
    default: "OpenAutobidder-DE | BESS Revenue Stacking verstehen",
    template: "%s | OpenAutobidder-DE",
  },
  description:
    "Die Bildungsplattform fuer Batteriespeicher in Deutschland: Revenue Stacking mit Arbitrage, FCR, aFRR, Kapazitaet und Netzengpass-Boni.",
  openGraph: {
    title: "OpenAutobidder-DE",
    description:
      "Wie Batteriespeicher in Deutschland wirklich Geld verdienen - jenseits reiner Arbitrage.",
    type: "website",
    locale: "de_DE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
