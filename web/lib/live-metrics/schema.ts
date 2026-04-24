import { z } from "zod";

export const ProviderNameSchema = z.enum([
  "energy_charts",
  "entsoe_proxy",
  "smard_de",
  "grid_frequency",
  "bess_capacity",
  "bess_telemetry",
]);

const GenerationMixEntrySchema = z.object({
  fuel: z.string().min(1),
  mw: z.number().finite().nonnegative(),
  sharePct: z.number().finite().min(0).max(100),
});

const TimeSeriesPointSchema = z.object({
  asOf: z.string().datetime(),
  value: z.number().finite(),
});

const BessSocSchema = z.object({
  pct: z.number().finite().min(0).max(100),
  asOf: z.string().datetime(),
  stale: z.boolean(),
  simulated: z.boolean().optional(),
  source: ProviderNameSchema,
  availableDischargeMw: z.number().finite().nonnegative().optional(),
  availableChargeMw: z.number().finite().nonnegative().optional(),
});

export const MetricSourceSchema = z.object({
  provider: ProviderNameSchema,
  metric: z.enum([
    "consumption_mw",
    "production_mw",
    "frequency_hz",
    "installed_bess_mw",
    "installed_bess_mwh",
  ]),
  asOf: z.string().datetime(),
  stale: z.boolean(),
});

export const LiveMetricsQualityFlagSchema = z.enum([
  "partial_data",
  "stale_data",
  "provider_fallback",
  "derived_value",
  "simulated_data",
]);

export const LiveMetricsSchema = z.object({
  consumptionMw: z.number().finite().nonnegative(),
  productionMw: z.number().finite().nonnegative(),
  frequencyHz: z.number().finite().min(45).max(55),
  installedBessMw: z.number().finite().nonnegative(),
  installedBessMwh: z.number().finite().nonnegative(),
  generationMix: z.array(GenerationMixEntrySchema),
  consumptionTrend: z.array(TimeSeriesPointSchema),
  productionTrend: z.array(TimeSeriesPointSchema),
  frequencyTrend: z.array(TimeSeriesPointSchema),
  bessSoc: BessSocSchema.optional(),
  asOf: z.string().datetime(),
  sources: z.array(MetricSourceSchema).min(1),
  qualityFlags: z.array(LiveMetricsQualityFlagSchema),
});

export const LiveMetricsResponseSchema = z.object({
  metrics: LiveMetricsSchema,
  cached: z.boolean(),
  generatedAt: z.string().datetime(),
});

export type ProviderName = z.infer<typeof ProviderNameSchema>;
export type MetricSource = z.infer<typeof MetricSourceSchema>;
export type LiveMetricsQualityFlag = z.infer<typeof LiveMetricsQualityFlagSchema>;
export type LiveMetrics = z.infer<typeof LiveMetricsSchema>;
export type LiveMetricsResponse = z.infer<typeof LiveMetricsResponseSchema>;
export type GenerationMixEntry = z.infer<typeof GenerationMixEntrySchema>;
export type TimeSeriesPoint = z.infer<typeof TimeSeriesPointSchema>;
export type BessSoc = z.infer<typeof BessSocSchema>;

export type ProviderMetricBundle = {
  consumptionMw?: number;
  productionMw?: number;
  frequencyHz?: number;
  installedBessMw?: number;
  installedBessMwh?: number;
  generationMix?: GenerationMixEntry[];
  consumptionTrend?: TimeSeriesPoint[];
  productionTrend?: TimeSeriesPoint[];
  frequencyTrend?: TimeSeriesPoint[];
  bessSoc?: Omit<BessSoc, "stale" | "source">;
  asOf: string;
  provider: ProviderName;
};

