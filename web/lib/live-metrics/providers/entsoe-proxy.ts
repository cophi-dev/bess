import { z } from "zod";
import type { ProviderMetricBundle } from "@/lib/live-metrics/schema";
import { parseNumeric, parseTimestamp, safeUrl } from "@/lib/live-metrics/provider-utils";

const EntsoeProxySchema = z.object({
  consumptionMw: z.unknown().optional(),
  productionMw: z.unknown().optional(),
  asOf: z.unknown(),
});

export async function fetchEntsoeProxyMetrics(): Promise<ProviderMetricBundle | null> {
  const url = safeUrl(process.env.LIVE_METRICS_ENTSOE_PROXY_URL);
  if (!url) return null;

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`ENTSO-E proxy provider failed: ${response.status}`);
  }
  const parsed = EntsoeProxySchema.parse(await response.json());
  return {
    provider: "entsoe_proxy",
    asOf: parseTimestamp(parsed.asOf),
    consumptionMw:
      parsed.consumptionMw === undefined ? undefined : parseNumeric(parsed.consumptionMw),
    productionMw:
      parsed.productionMw === undefined ? undefined : parseNumeric(parsed.productionMw),
  };
}

