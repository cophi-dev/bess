import { z } from "zod";
import type { ProviderMetricBundle } from "@/lib/live-metrics/schema";
import { parseNumeric, parseTimestamp, safeUrl } from "@/lib/live-metrics/provider-utils";

const RemoteBessPayloadSchema = z.object({
  installedBessMw: z.unknown(),
  installedBessMwh: z.unknown(),
  asOf: z.unknown().optional(),
});

function fallbackBessMetrics(): ProviderMetricBundle {
  const installedBessMw = Number.parseFloat(process.env.LIVE_METRICS_BESS_FALLBACK_MW ?? "2600");
  const installedBessMwh = Number.parseFloat(process.env.LIVE_METRICS_BESS_FALLBACK_MWH ?? "3900");
  return {
    provider: "bess_capacity",
    installedBessMw: Number.isFinite(installedBessMw) ? installedBessMw : 2600,
    installedBessMwh: Number.isFinite(installedBessMwh) ? installedBessMwh : 3900,
    asOf: new Date().toISOString(),
  };
}

export async function fetchBessCapacity(): Promise<ProviderMetricBundle> {
  const url = safeUrl(process.env.LIVE_METRICS_BESS_CAPACITY_URL);
  if (!url) {
    return fallbackBessMetrics();
  }
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    return fallbackBessMetrics();
  }
  const parsed = RemoteBessPayloadSchema.safeParse(await response.json());
  if (!parsed.success) {
    return fallbackBessMetrics();
  }
  return {
    provider: "bess_capacity",
    installedBessMw: parseNumeric(parsed.data.installedBessMw),
    installedBessMwh: parseNumeric(parsed.data.installedBessMwh),
    asOf: parseTimestamp(parsed.data.asOf ?? Date.now()),
  };
}

