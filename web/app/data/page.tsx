import type { Metadata } from "next";
import { DailyBriefingView } from "@/components/daily-briefing-view";

export const metadata: Metadata = {
  title: "Data",
  description:
    "Live-Metriken, Tagesupdate und zentrale Key Metrics fuer den deutschen BESS-Markt.",
};

export default function DataPage() {
  return <DailyBriefingView />;
}
