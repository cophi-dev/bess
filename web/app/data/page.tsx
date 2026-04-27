import type { Metadata } from "next";
import { DataLiveMetricsView } from "@/components/data-live-metrics-view";

export const metadata: Metadata = {
  title: "Data",
  description:
    "Live-Metriken und zentrale Key Metrics fuer den deutschen BESS-Markt.",
};

export default function DataPage() {
  return <DataLiveMetricsView />;
}
