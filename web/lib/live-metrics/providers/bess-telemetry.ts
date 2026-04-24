import { z } from "zod";
import type { ProviderMetricBundle } from "@/lib/live-metrics/schema";
import { parseNumeric, parseTimestamp, safeUrl } from "@/lib/live-metrics/provider-utils";

const BessSocBlockSchema = z.object({
  pct: z.unknown(),
  asOf: z.unknown().optional(),
  simulated: z.unknown().optional(),
  availableDischargeMw: z.unknown().optional(),
  availableChargeMw: z.unknown().optional(),
});

const RemoteBessTelemetrySchema = z
  .object({
    bessSoc: BessSocBlockSchema.optional(),
    pct: z.unknown().optional(),
    asOf: z.unknown().optional(),
    simulated: z.unknown().optional(),
    availableDischargeMw: z.unknown().optional(),
    availableChargeMw: z.unknown().optional(),
  })
  .passthrough();

function emptyBundle(asOf: string): ProviderMetricBundle {
  return { provider: "bess_telemetry", asOf };
}

function buildBessSoc(
  partial: {
    pct: unknown;
    asOf: unknown;
    simulated: unknown;
    availableDischargeMw: unknown;
    availableChargeMw: unknown;
  },
  fallbackAsOf: string,
): NonNullable<ProviderMetricBundle["bessSoc"]> {
  const asOf = parseTimestamp(partial.asOf ?? fallbackAsOf);
  return {
    pct: Math.min(100, Math.max(0, parseNumeric(partial.pct))),
    asOf,
    simulated: typeof partial.simulated === "boolean" ? partial.simulated : undefined,
    availableDischargeMw:
      partial.availableDischargeMw !== undefined
        ? parseNumeric(partial.availableDischargeMw)
        : undefined,
    availableChargeMw:
      partial.availableChargeMw !== undefined ? parseNumeric(partial.availableChargeMw) : undefined,
  };
}

export async function fetchBessTelemetry(): Promise<ProviderMetricBundle> {
  const now = new Date().toISOString();
  const url = safeUrl(process.env.LIVE_METRICS_BESS_TELEMETRY_URL);
  if (!url) {
    return emptyBundle(now);
  }

  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      return emptyBundle(now);
    }
    const raw: unknown = await response.json();
    const parsed = RemoteBessTelemetrySchema.safeParse(raw);
    if (!parsed.success) {
      return emptyBundle(now);
    }
    const data = parsed.data;
    if (data.bessSoc) {
      const bundleAsOf = parseTimestamp(data.asOf ?? data.bessSoc.asOf ?? now);
      return {
        provider: "bess_telemetry",
        asOf: bundleAsOf,
        bessSoc: buildBessSoc(
          {
            pct: data.bessSoc.pct,
            asOf: data.bessSoc.asOf ?? data.asOf,
            simulated: data.bessSoc.simulated,
            availableDischargeMw: data.bessSoc.availableDischargeMw,
            availableChargeMw: data.bessSoc.availableChargeMw,
          },
          bundleAsOf,
        ),
      };
    }
    if (data.pct !== undefined) {
      const bundleAsOf = parseTimestamp(data.asOf ?? now);
      return {
        provider: "bess_telemetry",
        asOf: bundleAsOf,
        bessSoc: buildBessSoc(
          {
            pct: data.pct,
            asOf: data.asOf,
            simulated: data.simulated,
            availableDischargeMw: data.availableDischargeMw,
            availableChargeMw: data.availableChargeMw,
          },
          bundleAsOf,
        ),
      };
    }
    return emptyBundle(now);
  } catch {
    return emptyBundle(now);
  }
}
