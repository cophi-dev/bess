import { getLiveMetrics } from "@/lib/live-metrics/service";

describe("getLiveMetrics", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    process.env = { ...envBackup };
    process.env.LIVE_METRICS_ENABLE_ENTSOE_PROXY = "false";
    process.env.LIVE_METRICS_ENABLE_BESS_TELEMETRY = "false";
    process.env.LIVE_METRICS_ENABLE_SMARD_DE = "false";
    process.env.LIVE_METRICS_BESS_CAPACITY_URL = "https://example.com/bess.json";
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("energy-charts.info/total_power")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            unix_seconds: [Math.floor(Date.now() / 1000)],
            production_types: [
              { name: "Load (incl. self-consumption)", data: [61000] },
              { name: "Wind onshore", data: [20000] },
              { name: "Solar", data: [18000] },
              { name: "Fossil gas", data: [21000] },
            ],
          }),
        } as Response;
      }
      if (url.includes("energy-charts.info/frequency")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            unix_seconds: [Math.floor(Date.now() / 1000)],
            data: [50.01],
          }),
        } as Response;
      }
      if (url.includes("example.com/bess.json")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            installedBessMw: 2600,
            installedBessMwh: 3900,
            asOf: new Date().toISOString(),
          }),
        } as Response;
      }
      return { ok: false, status: 404, json: async () => ({}) } as Response;
    }) as jest.Mock;
  });

  afterAll(() => {
    process.env = envBackup;
  });

  it("returns normalized metrics", async () => {
    const data = await getLiveMetrics(true);
    expect(data.cached).toBe(false);
    expect(data.metrics.consumptionMw).toBe(61000);
    expect(data.metrics.productionMw).toBe(59000);
    expect(data.metrics.frequencyHz).toBeGreaterThan(49.5);
    expect(data.metrics.installedBessMw).toBe(2600);
    expect(data.metrics.generationMix.length).toBeGreaterThan(0);
    expect(data.metrics.consumptionTrend.length).toBeGreaterThan(0);
    expect(data.metrics.bessSoc).toBeUndefined();
  });
});

