import { fetchSmardDeMetrics } from "@/lib/live-metrics/providers/smard-de";

describe("fetchSmardDeMetrics", () => {
  it("merges index, load, and one generation series", async () => {
    const chunk = 1_000_000_000_000;
    const t0 = chunk + 1000;
    const t1 = chunk + 2000;
    const load = {
      series: [
        [t0, 100.0] as [number, number],
        [t1, 200.0] as [number, number],
      ],
    };
    const genLignite = { series: [[t0, 20.0] as [number, number], [t1, 30.0] as [number, number]] };
    const allZero = { series: [[t0, 0.0] as [number, number], [t1, 0.0] as [number, number]] };

    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const u = String(input);
      if (u.includes("/410/DE/index_")) {
        return { ok: true, status: 200, json: async () => ({ timestamps: [chunk] }) } as Response;
      }
      if (u.includes("/410/DE/410_DE_")) {
        return { ok: true, status: 200, json: async () => load } as Response;
      }
      if (u.includes("/1223/DE/1223_DE_")) {
        return { ok: true, status: 200, json: async () => genLignite } as Response;
      }
      return { ok: true, status: 200, json: async () => allZero } as Response;
    }) as jest.Mock;

    const bundle = await fetchSmardDeMetrics();
    expect(bundle.provider).toBe("smard_de");
    expect(bundle.consumptionMw).toBe(200.0);
    expect(bundle.productionMw).toBe(30.0);
    expect(bundle.generationMix.length).toBe(1);
    expect(bundle.consumptionTrend.length).toBe(2);
  });
});
