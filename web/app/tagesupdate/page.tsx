import type { Metadata } from "next";
import { DailyBriefingView } from "@/components/daily-briefing-view";

export const metadata: Metadata = {
  title: "Tagesupdate",
  description: "Taegliches BESS-Briefing mit Lektion, News und Insights fuer Deutschland.",
};

export default function TagesupdatePage() {
  return <DailyBriefingView />;
}
