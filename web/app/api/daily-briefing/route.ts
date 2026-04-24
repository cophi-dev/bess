import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

type OpenAIChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const DEFAULT_BASE_URL = "https://api.x.ai/v1/chat/completions";
const DEFAULT_MODEL = "grok-4.20-0309-non-reasoning";
const BRIEFING_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const SYSTEM_PROMPT = `Du bist ein deutscher Experte für Battery Energy Storage Systems (BESS) mit dem Schwerpunkt, komplexe Themen klar und verständlich zu erklären.
Deine tägliche Aufgabe: Erstelle ein kurzes, strukturiertes und lehrreiches Briefing mit starkem Fokus auf Deutschland.
Wichtige Regeln:

Die Lektion steht immer am Anfang und erklärt einen konkreten Aspekt des Themas verständlich und fundiert.
Danach folgen aktuelle News und regulatorische/politische Insights (stark Deutschland-fokussiert).
Halte den gesamten Output knapp und übersichtlich (max. 650–750 Wörter).
Verwende klare Überschriften, kurze Absätze und eine professionelle, sachliche Sprache.

Erwünschte Ausgabe-Struktur (genau so einhalten und als JSON zurückgeben):
{
"date": "24. April 2026",
"lesson": {
"title": "Titel der Lektion",
"content": "8–12 Sätze Erklärung..."
},
"news": [
{
"headline": "Kurze Headline",
"facts": "1–2 Sätze Fakten",
"einordnung": "Kurze Einordnung"
}
],
"insights": ["Punkt 1", "Punkt 2", "Punkt 3", "Punkt 4"]
}
Priorisiere deutsche Quellen und regulatorische Themen (BNetzA, TenneT, Reifegradverfahren, Netzentgelte etc.).`;

const BriefingSchema = z.object({
  date: z.string().trim().min(4).max(80),
  lesson: z.object({
    title: z.string().trim().min(3).max(160),
    content: z.string().trim().min(20).max(6000),
  }),
  news: z
    .array(
      z.object({
        headline: z.string().trim().min(3).max(200),
        facts: z.string().trim().min(5).max(1200),
        einordnung: z.string().trim().min(5).max(1200),
      }),
    )
    .min(1)
    .max(8),
  insights: z.array(z.string().trim().min(2).max(300)).min(3).max(8),
});

type Briefing = z.infer<typeof BriefingSchema>;

type BriefingCache = {
  briefing: Briefing;
  generatedAt: string;
  expiresAt: number;
};

let briefingCache: BriefingCache | null = null;

function loadRootEnvMap(): Record<string, string> {
  const rootEnvPath = resolve(process.cwd(), "..", ".env");
  if (!existsSync(rootEnvPath)) return {};

  const envMap: Record<string, string> = {};
  const raw = readFileSync(rootEnvPath, "utf-8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    const value = rest.join("=").trim().replace(/^["']|["']$/g, "");
    if (key.trim()) envMap[key.trim()] = value;
  }
  return envMap;
}

function loadServerChatConfig() {
  const rootEnv = loadRootEnvMap();
  const get = (key: string) => process.env[key] || rootEnv[key];

  const apiKey =
    get("OPENAUTOBIDDER_WEB_CHAT_API_KEY") ||
    get("OPENAUTOBIDDER_CHAT_API_KEY") ||
    get("XAI_API_KEY") ||
    get("GEMINI_API_KEY");

  const baseUrl =
    get("OPENAUTOBIDDER_WEB_CHAT_BASE_URL") ||
    get("OPENAUTOBIDDER_CHAT_BASE_URL") ||
    DEFAULT_BASE_URL;

  const model =
    get("OPENAUTOBIDDER_WEB_CHAT_MODEL") ||
    get("OPENAUTOBIDDER_CHAT_MODEL") ||
    DEFAULT_MODEL;

  const temperatureRaw =
    get("OPENAUTOBIDDER_WEB_CHAT_TEMPERATURE") ||
    get("OPENAUTOBIDDER_CHAT_TEMPERATURE") ||
    "0.2";
  const temperature = Number.parseFloat(temperatureRaw);

  return {
    apiKey,
    baseUrl,
    model,
    temperature: Number.isFinite(temperature) ? temperature : 0.2,
  };
}

function parseAssistantContent(payload: unknown): string {
  const schema = z.object({
    choices: z.array(
      z.object({
        message: z.object({
          content: z.string().min(1),
        }),
      }),
    ),
  });

  const parsed = schema.safeParse(payload);
  if (!parsed.success || parsed.data.choices.length === 0) {
    throw new Error("Antwort konnte nicht gelesen werden.");
  }

  return parsed.data.choices[0].message.content;
}

function parseBriefingFromAssistant(content: string) {
  const cleaned = content
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsedJson = JSON.parse(cleaned);
  const parsedBriefing = BriefingSchema.safeParse(parsedJson);
  if (!parsedBriefing.success) {
    throw new Error("Briefing-Antwort hat nicht das erwartete JSON-Format.");
  }
  return parsedBriefing.data;
}

function isCacheValid(cache: BriefingCache | null) {
  return Boolean(cache && Date.now() < cache.expiresAt);
}

function createBriefingResponse(payload: { briefing: Briefing; generatedAt: string; cached: boolean }) {
  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "public, max-age=0, s-maxage=21600, stale-while-revalidate=3600",
    },
  });
}

async function generateBriefing(forceRefresh = false) {
  if (!forceRefresh && isCacheValid(briefingCache)) {
    return createBriefingResponse({
      briefing: briefingCache!.briefing,
      generatedAt: briefingCache!.generatedAt,
      cached: true,
    });
  }

  const { apiKey, baseUrl, model, temperature } = loadServerChatConfig();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Daily Briefing ist noch nicht konfiguriert. Setze OPENAUTOBIDDER_WEB_CHAT_API_KEY.",
      },
      { status: 503 },
    );
  }

  const messages: OpenAIChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content:
        "Erstelle jetzt das Tagesbriefing und gib ausschließlich gueltiges JSON gemaess der vorgegebenen Struktur zurueck.",
    },
  ];

  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature,
      messages,
    }),
    cache: "no-store",
  });

  const json = await response.json();
  if (!response.ok) {
    const message =
      typeof json?.error?.message === "string"
        ? json.error.message
        : "Unbekannter Provider-Fehler";
    return NextResponse.json({ error: `Provider-Fehler: ${message}` }, { status: response.status });
  }

  const answer = parseAssistantContent(json);
  try {
    const briefing = parseBriefingFromAssistant(answer);
    const generatedAt = new Date().toISOString();
    briefingCache = {
      briefing,
      generatedAt,
      expiresAt: Date.now() + BRIEFING_CACHE_TTL_MS,
    };
    return createBriefingResponse({ briefing, generatedAt, cached: false });
  } catch {
    return NextResponse.json(
      { error: "Provider-Antwort konnte nicht als Briefing-JSON verarbeitet werden." },
      { status: 502 },
    );
  }
}

export async function GET() {
  try {
    return await generateBriefing(false);
  } catch {
    return NextResponse.json(
      { error: "Daily-Briefing-Anfrage fehlgeschlagen. Bitte erneut versuchen." },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    return await generateBriefing(true);
  } catch {
    return NextResponse.json(
      { error: "Daily-Briefing-Aktualisierung fehlgeschlagen. Bitte erneut versuchen." },
      { status: 500 },
    );
  }
}
