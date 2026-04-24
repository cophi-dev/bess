import { z } from "zod";

const NumericValueSchema = z.union([z.number(), z.string()]);

export function parseNumeric(value: unknown): number {
  const parsed = NumericValueSchema.parse(value);
  const num = typeof parsed === "number" ? parsed : Number.parseFloat(parsed);
  if (!Number.isFinite(num)) {
    throw new Error("Expected finite numeric value.");
  }
  return num;
}

export function parseTimestamp(value: unknown): string {
  if (typeof value === "number") {
    const ts = value > 9_999_999_999 ? value : value * 1000;
    const iso = new Date(ts).toISOString();
    z.string().datetime().parse(iso);
    return iso;
  }
  if (typeof value === "string") {
    const iso = new Date(value).toISOString();
    z.string().datetime().parse(iso);
    return iso;
  }
  throw new Error("Expected timestamp string or unix epoch.");
}

export function safeUrl(raw: string | undefined): string | null {
  if (!raw || !raw.trim()) return null;
  try {
    return new URL(raw).toString();
  } catch {
    return null;
  }
}

