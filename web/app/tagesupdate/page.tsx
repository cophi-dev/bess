import type { Metadata } from "next";
import { DailyBriefingView } from "@/components/daily-briefing-view";

export const metadata: Metadata = {
  title: "Daten",
  description:
    "Echtzeitdaten und zentrale Key Metrics fuer den deutschen BESS-Markt im taeglichen Ueberblick.",
};

export default function TagesupdatePage() {
  return <DailyBriefingView />;
}
