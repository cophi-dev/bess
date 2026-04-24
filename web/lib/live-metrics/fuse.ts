import {
  LiveMetricsSchema,
  type LiveMetrics,
  type LiveMetricsQualityFlag,
  type MetricSource,
  type ProviderMetricBundle,
} from "@/lib/live-metrics/schema";

const STALE_MS = 90 * 60 * 1000;

function isStale(asOf: string): boolean {
  const ts = Date.parse(asOf);
  if (!Number.isFinite(ts)) return true;
  return Date.now() - ts > STALE_MS;
}

function addSource(
  sources: MetricSource[],
  provider: ProviderMetricBundle["provider"],
  metric: MetricSource["metric"],
  asOf: string,
) {
  sources.push({ provider, metric, asOf, stale: isStale(asOf) });
}

type FusedNumbers = {
  consumptionMw?: number;
  productionMw?: number;
  frequencyHz?: number;
  installedBessMw?: number;
  installedBessMwh?: number;
};

function pickLatest(bundles: ProviderMetricBundle[], metric: keyof FusedNumbers): ProviderMetricBundle | null {
  const candidates = bundles.filter((bundle) => typeof bundle[metric] === "number");
  if (candidates.length === 0) return null;
  return candidates.sort((a, b) => Date.parse(b.asOf) - Date.parse(a.asOf))[0];
}

export function fuseMetrics(bundles: ProviderMetricBundle[]): LiveMetrics {
  const qualityFlags = new Set<LiveMetricsQualityFlag>();
  const sources: MetricSource[] = [];
  const fused: FusedNumbers = {};

  const metrics: Array<{ key: keyof FusedNumbers; sourceMetric: MetricSource["metric"] }> = [
    { key: "consumptionMw", sourceMetric: "consumption_mw" },
    { key: "productionMw", sourceMetric: "production_mw" },
    { key: "frequencyHz", sourceMetric: "frequency_hz" },
    { key: "installedBessMw", sourceMetric: "installed_bess_mw" },
    { key: "installedBessMwh", sourceMetric: "installed_bess_mwh" },
  ];

  for (const metric of metrics) {
    const picked = pickLatest(bundles, metric.key);
    if (!picked) {
      qualityFlags.add("partial_data");
      continue;
    }
    fused[metric.key] = picked[metric.key] as number;
    addSource(sources, picked.provider, metric.sourceMetric, picked.asOf);
    if (isStale(picked.asOf)) {
      qualityFlags.add("stale_data");
    }
  }

  const generationMix =
    bundles
      .filter((bundle) => Array.isArray(bundle.generationMix) && bundle.generationMix.length > 0)
      .sort((a, b) => Date.parse(b.asOf) - Date.parse(a.asOf))[0]?.generationMix ?? [];

  const consumptionTrend =
    bundles
      .filter((bundle) => Array.isArray(bundle.consumptionTrend) && bundle.consumptionTrend.length > 0)
      .sort((a, b) => Date.parse(b.asOf) - Date.parse(a.asOf))[0]?.consumptionTrend ?? [];

  const productionTrend =
    bundles
      .filter((bundle) => Array.isArray(bundle.productionTrend) && bundle.productionTrend.length > 0)
      .sort((a, b) => Date.parse(b.asOf) - Date.parse(a.asOf))[0]?.productionTrend ?? [];

  const frequencyTrend =
    bundles
      .filter((bundle) => Array.isArray(bundle.frequencyTrend) && bundle.frequencyTrend.length > 0)
      .sort((a, b) => Date.parse(b.asOf) - Date.parse(a.asOf))[0]?.frequencyTrend ?? [];

  const latestBessSocBundle = bundles
    .filter((bundle) => bundle.bessSoc && Number.isFinite(bundle.bessSoc.pct))
    .sort((a, b) => Date.parse(b.asOf) - Date.parse(a.asOf))[0];
  const bessSoc = latestBessSocBundle?.bessSoc
    ? {
        ...latestBessSocBundle.bessSoc,
        stale: isStale(latestBessSocBundle.bessSoc.asOf),
        source: latestBessSocBundle.provider,
      }
    : undefined;
  if (bessSoc?.stale) {
    qualityFlags.add("stale_data");
  }
  if (bessSoc?.simulated) {
    qualityFlags.add("simulated_data");
  }

  const asOf = sources.length
    ? sources
        .map((src) => Date.parse(src.asOf))
        .sort((a, b) => b - a)[0]
    : Date.now();

  if (bundles.some((bundle) => bundle.provider === "bess_capacity")) {
    qualityFlags.add("derived_value");
  }

  const metricsPayload: LiveMetrics = LiveMetricsSchema.parse({
    consumptionMw: fused.consumptionMw ?? 0,
    productionMw: fused.productionMw ?? 0,
    frequencyHz: fused.frequencyHz ?? 50.0,
    installedBessMw: fused.installedBessMw ?? 0,
    installedBessMwh: fused.installedBessMwh ?? 0,
    generationMix,
    consumptionTrend,
    productionTrend,
    frequencyTrend,
    bessSoc,
    asOf: new Date(asOf).toISOString(),
    sources,
    qualityFlags: Array.from(qualityFlags),
  });

  return metricsPayload;
}

