import type { GenerationMixEntry, ProviderMetricBundle, TimeSeriesPoint } from "@/lib/live-metrics/schema";
import { parseTimestamp } from "@/lib/live-metrics/provider-utils";

const SMARD_BASE = "https://www.smard.de/app/chart_data";
const REGION = "DE";
const RES = "quarterhour";

const CONSUMPTION_FILTER = 410;
const TREND_POINTS_LIMIT = 48;

const PRODUCTION_FILTERS: readonly number[] = [
  1223, 1224, 1225, 1226, 1227, 1228, 4066, 4067, 4068, 4069, 4070, 4071,
];

const FUEL_LABEL: Record<number, string> = {
  1223: "Braunkohle",
  1224: "Kernenergie",
  1225: "Wind offshore",
  1226: "Wasserkraft",
  1227: "Sonstige konventionell",
  1228: "Sonstige erneuerbar",
  4066: "Biomasse",
  4067: "Wind onshore",
  4068: "Photovoltaik",
  4069: "Steinkohle",
  4070: "Pumpspeicher (Erzeugung)",
  4071: "Erdgas",
};

type SmardIndexResponse = {
  timestamps: number[];
};

type SmardSeriesResponse = {
  series: [number, number | null | undefined][];
};

function seriesToMap(rows: [number, number | null | undefined][]): Map<number, number> {
  const m = new Map<number, number>();
  for (const row of rows) {
    const t = row[0];
    const v = row[1];
    if (v === null || v === undefined) continue;
    if (typeof t !== "number" || !Number.isFinite(t)) continue;
    m.set(t, v);
  }
  return m;
}

function buildTrends(
  loadSeries: [number, number | null | undefined][],
  productionMaps: Map<number, number>[],
): { consumptionTrend: TimeSeriesPoint[]; productionTrend: TimeSeriesPoint[]; asOf: string } {
  const nonNull = loadSeries
    .filter((row) => row[1] !== null && row[1] !== undefined && Number.isFinite(row[0]))
    .map((row) => [row[0] as number, row[1] as number] as [number, number]);
  const slice = nonNull.slice(-TREND_POINTS_LIMIT);
  if (slice.length === 0) {
    return { consumptionTrend: [], productionTrend: [], asOf: new Date().toISOString() };
  }
  const consumptionTrend: TimeSeriesPoint[] = [];
  const productionTrend: TimeSeriesPoint[] = [];
  for (const [ts, load] of slice) {
    const asOf = parseTimestamp(ts);
    consumptionTrend.push({ asOf, value: Math.max(0, load) });
    let g = 0;
    for (const pmap of productionMaps) {
      g += pmap.get(ts) ?? 0;
    }
    productionTrend.push({ asOf, value: Math.max(0, g) });
  }
  const asOf = parseTimestamp(slice[slice.length - 1][0]);
  return { consumptionTrend, productionTrend, asOf };
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`SMARD request failed: ${response.status} ${url}`);
  }
  return (await response.json()) as T;
}

export async function fetchSmardDeMetrics(): Promise<ProviderMetricBundle> {
  const index = await getJson<SmardIndexResponse>(
    `${SMARD_BASE}/${CONSUMPTION_FILTER}/${REGION}/index_${RES}.json`,
  );
  const tsList = index.timestamps;
  if (!tsList || tsList.length === 0) {
    throw new Error("SMARD index returned no timestamps.");
  }
  const chunk = tsList[tsList.length - 1];
  if (!Number.isFinite(chunk)) {
    throw new Error("SMARD index: invalid chunk timestamp.");
  }

  const loadUrl = `${SMARD_BASE}/${CONSUMPTION_FILTER}/${REGION}/${CONSUMPTION_FILTER}_${REGION}_${RES}_${chunk}.json`;
  const loadJson = await getJson<SmardSeriesResponse>(loadUrl);
  const loadRows = loadJson.series;
  if (!Array.isArray(loadRows) || loadRows.length === 0) {
    throw new Error("SMARD load series empty.");
  }
  const nonNullLoad = loadRows
    .filter((row) => row[1] !== null && row[1] !== undefined && Number.isFinite(row[0]))
    .map((row) => [row[0] as number, row[1] as number] as [number, number]);
  const last = nonNullLoad[nonNullLoad.length - 1];
  if (!last) {
    throw new Error("SMARD: no last load value.");
  }
  const [targetTs, consumptionMw] = last;

  const filterUrls = PRODUCTION_FILTERS.map(
    (f) => `${SMARD_BASE}/${f}/${REGION}/${f}_${REGION}_${RES}_${chunk}.json`,
  );
  const filterResponses = await Promise.all(
    filterUrls.map((u) => getJson<SmardSeriesResponse>(u).catch((): null => null)),
  );

  const productionByFilter: Array<{
    id: number;
    label: string;
    mw: number;
    map: Map<number, number>;
  }> = [];

  for (let i = 0; i < PRODUCTION_FILTERS.length; i += 1) {
    const id = PRODUCTION_FILTERS[i];
    const j = filterResponses[i];
    const m = j ? seriesToMap(j.series) : new Map<number, number>();
    const raw = m.get(targetTs) ?? 0;
    const mw = Math.max(0, raw);
    productionByFilter.push({
      id,
      label: FUEL_LABEL[id] ?? `Filter ${id}`,
      mw,
      map: m,
    });
  }

  let productionMw = 0;
  for (const p of productionByFilter) {
    productionMw += p.mw;
  }

  const productionMaps = productionByFilter.map((p) => p.map);
  const { consumptionTrend, productionTrend, asOf } = buildTrends(loadRows, productionMaps);

  const generationMix: GenerationMixEntry[] =
    productionMw > 0
      ? productionByFilter
          .map((p) => ({
            fuel: p.label,
            mw: p.mw,
            sharePct: (p.mw / productionMw) * 100,
          }))
          .filter((e) => e.mw > 0)
      : [];

  return {
    provider: "smard_de",
    asOf,
    consumptionMw: Math.max(0, consumptionMw),
    productionMw: Math.max(0, productionMw),
    generationMix,
    consumptionTrend,
    productionTrend,
  };
}
