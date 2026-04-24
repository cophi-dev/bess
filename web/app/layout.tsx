import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ChatWidget } from "@/components/chat-widget";
import { TextSelectionExplainer } from "@/components/text-selection-explainer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bess-pi.vercel.app"),
  title: {
    default: "BESS Kompass | Revenue Stacking im deutschen Strommarkt",
    template: "%s | BESS Kompass",
  },
  description:
    "BESS Kompass erklaert, wie Grossspeicher in Deutschland wirtschaftlich und netzbewusst gedacht werden: Revenue Stacking, Standortwirkung und Systemdienstleistungen. Offenes Modell: OpenAutobidder-DE.",
  openGraph: {
    title: "BESS Kompass",
    description:
      "Lernen mit Marktlogik und Standortwirkung zuerst: Wie Batteriespeicher in Deutschland jenseits reiner Arbitrage bewertet werden. OpenAutobidder-DE als transparentes Modell.",
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
        <TextSelectionExplainer />
        <ChatWidget />
      </body>
    </html>
  );
}
