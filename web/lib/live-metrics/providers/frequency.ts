import { z } from "zod";
import type { ProviderMetricBundle } from "@/lib/live-metrics/schema";
import { parseNumeric, parseTimestamp, safeUrl } from "@/lib/live-metrics/provider-utils";

const TREND_POINTS_LIMIT = 48;

function normalizeFrequencyTrend(unixSeconds: unknown[], data: unknown[]) {
  const points: Array<{ asOf: string; value: number }> = [];
  const len = Math.min(unixSeconds.length, data.length);
  for (let index = 0; index < len; index += 1) {
    const raw = data[index];
    if (raw === null || raw === undefined) continue;
    points.push({
      asOf: parseTimestamp(unixSeconds[index]),
      value: parseNumeric(raw),
    });
  }
  return points.slice(-TREND_POINTS_LIMIT);
}

const FrequencyPayloadSchema = z.union([
  z.object({
    frequency: z.unknown(),
    timestamp: z.unknown().optional(),
  }),
  z.object({
    value: z.unknown(),
    timestamp: z.unknown().optional(),
  }),
  z.object({
    data: z
      .array(
        z.object({
          frequency: z.unknown().optional(),
          value: z.unknown().optional(),
          timestamp: z.unknown().optional(),
          datetime: z.unknown().optional(),
        }),
      )
      .min(1),
  }),
  z.object({
    unix_seconds: z.array(z.unknown()).min(1),
    data: z.array(z.unknown()).min(1),
  }),
]);

export async function fetchGridFrequency(): Promise<ProviderMetricBundle> {
  const frequencyUrl =
    safeUrl(process.env.LIVE_METRICS_FREQUENCY_URL) ??
    "https://api.energy-charts.info/frequency";
  const response = await fetch(frequencyUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Frequency provider failed: ${response.status}`);
  }
  const parsed = FrequencyPayloadSchema.parse(await response.json());
  let frequencyValue: unknown;
  let tsValue: unknown = Date.now();
  if ("data" in parsed) {
    if ("unix_seconds" in parsed) {
      frequencyValue = parsed.data[parsed.data.length - 1];
      tsValue = parsed.unix_seconds[parsed.unix_seconds.length - 1] ?? Date.now();
      return {
        provider: "grid_frequency",
        frequencyHz: parseNumeric(frequencyValue),
        asOf: parseTimestamp(tsValue),
        frequencyTrend: normalizeFrequencyTrend(parsed.unix_seconds, parsed.data),
      };
    }
    const last = parsed.data[parsed.data.length - 1];
    frequencyValue = last.frequency ?? last.value;
    tsValue = last.timestamp ?? last.datetime ?? Date.now();
  } else {
    frequencyValue = "frequency" in parsed ? parsed.frequency : parsed.value;
    tsValue = parsed.timestamp ?? Date.now();
  }
  return {
    provider: "grid_frequency",
    frequencyHz: parseNumeric(frequencyValue),
    asOf: parseTimestamp(tsValue),
  };
}

