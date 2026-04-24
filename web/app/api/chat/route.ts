import { NextResponse } from "next/server";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const ChatRequestSchema = z.object({
  question: z.string().min(1).max(2000),
  history: z.array(MessageSchema).max(12).optional().default([]),
  pageContext: z.string().max(3000).optional().default(""),
});

type OpenAIChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const DEFAULT_BASE_URL = "https://api.x.ai/v1/chat/completions";
const DEFAULT_MODEL = "grok-4.20-0309-non-reasoning";
const MAX_HISTORY_MESSAGES = 6;

function loadRootEnvMap(): Record<string, string> {
  // Support local development from monorepo root `.env`.
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedBody = ChatRequestSchema.safeParse(body);
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Ungueltige Anfrage. Bitte Frage erneut senden." },
        { status: 400 },
      );
    }

    const { apiKey, baseUrl, model, temperature } = loadServerChatConfig();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "AI Chat ist noch nicht konfiguriert. Setze OPENAUTOBIDDER_WEB_CHAT_API_KEY.",
        },
        { status: 503 },
      );
    }

    const { question, history, pageContext } = parsedBody.data;
    const systemPrompt =
      "Du bist OpenAutobidder-DE Copilot. Erklaere Revenue Stacking fuer Batteriespeicher in Deutschland klar, knapp, praxisnah und transparent. Bevorzuge kurze Abschnitte und Bulletpoints; nutze Tabellen nur wenn wirklich noetig und halte sie kompakt.";

    const messages: OpenAIChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-MAX_HISTORY_MESSAGES),
      {
        role: "user",
        content: `Seitenkontext:\n${pageContext}\n\nFrage:\n${question}`,
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
    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json(
      { error: "Chat-Anfrage fehlgeschlagen. Bitte erneut versuchen." },
      { status: 500 },
    );
  }
}
