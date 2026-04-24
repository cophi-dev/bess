import { fuseMetrics } from "@/lib/live-metrics/fuse";
import type { ProviderMetricBundle } from "@/lib/live-metrics/schema";

function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

describe("fuseMetrics", () => {
  it("picks latest values and records sources", () => {
    const bundles: ProviderMetricBundle[] = [
      {
        provider: "energy_charts",
        asOf: isoMinutesAgo(12),
        consumptionMw: 61500,
        productionMw: 60200,
      },
      {
        provider: "grid_frequency",
        asOf: isoMinutesAgo(1),
        frequencyHz: 49.992,
      },
      {
        provider: "bess_capacity",
        asOf: isoMinutesAgo(10),
        installedBessMw: 2600,
        installedBessMwh: 3900,
      },
    ];

    const fused = fuseMetrics(bundles);

    expect(fused.consumptionMw).toBe(61500);
    expect(fused.productionMw).toBe(60200);
    expect(fused.frequencyHz).toBeCloseTo(49.992, 3);
    expect(fused.installedBessMw).toBe(2600);
    expect(fused.sources.length).toBeGreaterThanOrEqual(5);
    expect(fused.generationMix.length).toBe(0);
    expect(fused.consumptionTrend.length).toBe(0);
  });

  it("adds partial data flag for missing metrics", () => {
    const bundles: ProviderMetricBundle[] = [
      {
        provider: "grid_frequency",
        asOf: isoMinutesAgo(2),
        frequencyHz: 50.01,
      },
    ];
    const fused = fuseMetrics(bundles);
    expect(fused.qualityFlags).toContain("partial_data");
    expect(fused.frequencyHz).toBeCloseTo(50.01, 2);
  });

  it("keeps SoC optional when missing", () => {
    const fused = fuseMetrics([
      {
        provider: "energy_charts",
        asOf: isoMinutesAgo(5),
        consumptionMw: 50000,
        productionMw: 49000,
      },
    ]);
    expect(fused.bessSoc).toBeUndefined();
  });

  it("flags stale SoC telemetry", () => {
    const fused = fuseMetrics([
      {
        provider: "bess_telemetry",
        asOf: isoMinutesAgo(120),
        bessSoc: {
          pct: 63.5,
          asOf: isoMinutesAgo(120),
        },
      },
      {
        provider: "grid_frequency",
        asOf: isoMinutesAgo(1),
        frequencyHz: 49.99,
      },
    ]);
    expect(fused.bessSoc?.stale).toBe(true);
    expect(fused.qualityFlags).toContain("stale_data");
  });
});

