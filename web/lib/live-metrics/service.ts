import type { LiveMetrics, ProviderMetricBundle } from "@/lib/live-metrics/schema";
import { fuseMetrics } from "@/lib/live-metrics/fuse";
import { fetchBessCapacity } from "@/lib/live-metrics/providers/bess-capacity";
import { fetchBessTelemetry } from "@/lib/live-metrics/providers/bess-telemetry";
import { fetchEnergyChartsMetrics } from "@/lib/live-metrics/providers/energy-charts";
import { fetchEntsoeProxyMetrics } from "@/lib/live-metrics/providers/entsoe-proxy";
import { fetchGridFrequency } from "@/lib/live-metrics/providers/frequency";
import { fetchSmardDeMetrics } from "@/lib/live-metrics/providers/smard-de";

const DEFAULT_CACHE_MS = 60 * 60 * 1000;
const DEFAULT_PROVIDER_TIMEOUT_MS = 25_000;

type CacheState = {
  metrics: LiveMetrics;
  generatedAt: string;
  expiresAt: number;
};

let cacheState: CacheState | null = null;

function cacheDurationMs(): number {
  const raw = Number.parseInt(process.env.LIVE_METRICS_CACHE_SECONDS ?? "3600", 10);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_CACHE_MS;
  return raw * 1000;
}

function enabled(flag: string | undefined, defaultValue = true): boolean {
  if (!flag) return defaultValue;
  return !["0", "false", "off", "no"].includes(flag.toLowerCase());
}

function providerTimeoutMs(): number {
  const raw = Number.parseInt(process.env.LIVE_METRICS_PROVIDER_TIMEOUT_MS ?? "25000", 10);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_PROVIDER_TIMEOUT_MS;
  return raw;
}

async function withTimeout<T>(label: string, task: Promise<T>): Promise<T> {
  const timeout = providerTimeoutMs();
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeout}ms`));
    }, timeout);
    task
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function getLiveMetrics(forceRefresh = false): Promise<{
  metrics: LiveMetrics;
  cached: boolean;
  generatedAt: string;
}> {
  if (!forceRefresh && cacheState && Date.now() < cacheState.expiresAt) {
    return { metrics: cacheState.metrics, cached: true, generatedAt: cacheState.generatedAt };
  }

  const tasks: Array<Promise<unknown>> = [];
  if (enabled(process.env.LIVE_METRICS_ENABLE_SMARD_DE, true)) {
    tasks.push(withTimeout("smard_de", fetchSmardDeMetrics()));
  }
  if (enabled(process.env.LIVE_METRICS_ENABLE_ENERGY_CHARTS, true)) {
    tasks.push(withTimeout("energy_charts", fetchEnergyChartsMetrics()));
  }
  if (enabled(process.env.LIVE_METRICS_ENABLE_ENTSOE_PROXY, true)) {
    tasks.push(withTimeout("entsoe_proxy", fetchEntsoeProxyMetrics()));
  }
  if (enabled(process.env.LIVE_METRICS_ENABLE_FREQUENCY, true)) {
    tasks.push(withTimeout("grid_frequency", fetchGridFrequency()));
  }
  if (enabled(process.env.LIVE_METRICS_ENABLE_BESS, true)) {
    tasks.push(withTimeout("bess_capacity", fetchBessCapacity()));
  }
  if (enabled(process.env.LIVE_METRICS_ENABLE_BESS_TELEMETRY, true)) {
    tasks.push(withTimeout("bess_telemetry", fetchBessTelemetry()));
  }

  const results = await Promise.allSettled(tasks);
  const bundles = results
    .filter((result): result is PromiseFulfilledResult<unknown> => result.status === "fulfilled")
    .map((result) => result.value)
    .filter((value): value is ProviderMetricBundle => {
      if (value === null || value === undefined) return false;
      const bundle = value as ProviderMetricBundle;
      return typeof bundle.provider === "string" && typeof bundle.asOf === "string";
    });

  if (bundles.length === 0) {
    throw new Error("No live-metrics provider returned usable data.");
  }

  const metrics = fuseMetrics(bundles);
  const generatedAt = new Date().toISOString();
  cacheState = {
    metrics,
    generatedAt,
    expiresAt: Date.now() + cacheDurationMs(),
  };
  return { metrics, cached: false, generatedAt };
}

