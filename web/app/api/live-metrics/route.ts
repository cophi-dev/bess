import { NextResponse } from "next/server";
import { LiveMetricsResponseSchema } from "@/lib/live-metrics/schema";
import { getLiveMetrics } from "@/lib/live-metrics/service";

function responseHeaders() {
  return {
    "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=900",
  };
}

async function handle(forceRefresh: boolean) {
  const payload = await getLiveMetrics(forceRefresh);
  const parsed = LiveMetricsResponseSchema.parse(payload);
  return NextResponse.json(parsed, { headers: responseHeaders() });
}

export async function GET() {
  try {
    return await handle(false);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Live metrics request failed.",
      },
      { status: 502, headers: responseHeaders() },
    );
  }
}

export async function POST() {
  try {
    return await handle(true);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Live metrics refresh failed.",
      },
      { status: 502, headers: responseHeaders() },
    );
  }
}

