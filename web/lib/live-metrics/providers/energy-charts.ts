import type { GenerationMixEntry, ProviderMetricBundle, TimeSeriesPoint } from "@/lib/live-metrics/schema";
import { parseNumeric, parseTimestamp, safeUrl } from "@/lib/live-metrics/provider-utils";

type PowerSeries = {
  name: string;
  data: unknown[];
};

type TotalPowerPayload = {
  unix_seconds: unknown[];
  production_types: PowerSeries[];
};

const EXCLUDED_FOR_PRODUCTION = new Set([
  "Load (incl. self-consumption)",
  "Residual load",
  "Renewable share of load",
  "Renewable share of generation",
  "Cross border electricity trading",
]);

function readLast(points: unknown[]): number {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    const value = points[index];
    if (value !== null && value !== undefined) {
      return parseNumeric(value);
    }
  }
  return 0;
}

const TREND_POINTS_LIMIT = 48;

function normalizeTrend(unixSeconds: unknown[], data: unknown[]): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const len = Math.min(unixSeconds.length, data.length);
  for (let index = 0; index < len; index += 1) {
    const ts = unixSeconds[index];
    const raw = data[index];
    if (raw === null || raw === undefined) continue;
    points.push({ asOf: parseTimestamp(ts), value: parseNumeric(raw) });
  }
  return points.slice(-TREND_POINTS_LIMIT);
}

function parseTotalPower(payload: unknown): {
  asOf: string;
  consumptionMw: number;
  productionMw: number;
  generationMix: GenerationMixEntry[];
  consumptionTrend: TimeSeriesPoint[];
  productionTrend: TimeSeriesPoint[];
} {
  const typed = payload as TotalPowerPayload;
  if (!Array.isArray(typed?.unix_seconds) || !Array.isArray(typed?.production_types)) {
    throw new Error("Unexpected total_power payload.");
  }
  const tsRaw = typed.unix_seconds[typed.unix_seconds.length - 1] ?? Date.now();
  const asOf = parseTimestamp(tsRaw);

  let consumptionMw = 0;
  let productionMw = 0;
  const generationMixRaw: Array<{ fuel: string; mw: number }> = [];
  const productionTrendMap = new Map<string, TimeSeriesPoint[]>();
  let consumptionTrend: TimeSeriesPoint[] = [];
  for (const series of typed.production_types) {
    const value = readLast(series.data ?? []);
    if (series.name === "Load (incl. self-consumption)") {
      consumptionMw = Math.max(0, value);
      consumptionTrend = normalizeTrend(typed.unix_seconds, series.data ?? []).map((point) => ({
        ...point,
        value: Math.max(0, point.value),
      }));
      continue;
    }
    if (!EXCLUDED_FOR_PRODUCTION.has(series.name)) {
      productionMw += Math.max(0, value);
      generationMixRaw.push({ fuel: series.name, mw: Math.max(0, value) });
      productionTrendMap.set(
        series.name,
        normalizeTrend(typed.unix_seconds, series.data ?? []).map((point) => ({
          ...point,
          value: Math.max(0, point.value),
        })),
      );
    }
  }

  const generationMix =
    productionMw > 0
      ? generationMixRaw
          .sort((a, b) => b.mw - a.mw)
          .map((entry) => ({
            fuel: entry.fuel,
            mw: entry.mw,
            sharePct: (entry.mw / productionMw) * 100,
          }))
      : [];

  const productionTrendAggregate = new Map<string, number>();
  for (const seriesPoints of productionTrendMap.values()) {
    for (const point of seriesPoints) {
      productionTrendAggregate.set(point.asOf, (productionTrendAggregate.get(point.asOf) ?? 0) + point.value);
    }
  }
  const productionTrend = Array.from(productionTrendAggregate.entries())
    .sort((a, b) => Date.parse(a[0]) - Date.parse(b[0]))
    .map(([asOf, value]) => ({ asOf, value }))
    .slice(-TREND_POINTS_LIMIT);

  return { asOf, consumptionMw, productionMw, generationMix, consumptionTrend, productionTrend };
}

export async function fetchEnergyChartsMetrics(): Promise<ProviderMetricBundle> {
  const consumptionUrl =
    safeUrl(process.env.LIVE_METRICS_CONSUMPTION_URL) ??
    "https://api.energy-charts.info/total_power?country=de";
  const response = await fetch(consumptionUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Energy Charts provider failed: ${response.status}`);
  }
  const parsed = parseTotalPower(await response.json());
  return {
    provider: "energy_charts",
    asOf: parsed.asOf,
    consumptionMw: parsed.consumptionMw,
    productionMw: parsed.productionMw,
    generationMix: parsed.generationMix,
    consumptionTrend: parsed.consumptionTrend,
    productionTrend: parsed.productionTrend,
  };
}

