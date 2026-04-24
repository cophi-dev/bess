"use client";

import { FormEvent, useMemo, useState } from "react";
import { FadeIn } from "@/components/fade-in";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  "Warum reicht Arbitrage allein oft nicht aus?",
  "Wie unterscheiden sich FCR und aFRR fuer BESS?",
  "Welche Rolle spielen Netzengpaesse in Deutschland?",
];

export function HomeAiChat() {
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ich bin dein AI Lernassistent fuer Revenue Stacking. Frag mich alles zu BESS-Erloeslogik in Deutschland.",
    },
  ]);

  const pageContext = useMemo(
    () =>
      "OpenAutobidder-DE ist eine Bildungsplattform fuer BESS in Deutschland mit Fokus auf Revenue Stacking: Arbitrage, FCR, aFRR, Kapazitaet und Netzengpass-Anreize.",
    [],
  );

  async function askQuestion(input: string) {
    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    setError(null);
    const userMessage: ChatMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: trimmed,
          history: updatedMessages.filter((msg) => msg.role !== "assistant" || msg.content.length > 0),
          pageContext,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Antwort nicht verfuegbar.");
      }

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          typeof data?.answer === "string" && data.answer.trim().length > 0
            ? data.answer
            : "Ich konnte gerade keine Antwort erzeugen. Bitte versuche es erneut.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (requestError) {
      const errorText =
        requestError instanceof Error ? requestError.message : "Unerwarteter Fehler beim Chat.";
      setError(errorText);
    } finally {
      setIsLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void askQuestion(question);
  }

  return (
    <section className="bg-background-alt py-16 md:py-20">
      <div className="container-shell">
        <FadeIn className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            AI Lernassistent
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl">
            Stelle Fragen zu Revenue Stacking in Deutschland
          </h2>
          <p className="mt-4 text-text-secondary">
            Direkt auf der Startseite erklaert der Assistent Zusammenhaenge aus
            Arbitrage, Regelleistung und netzdienlichem Betrieb.
          </p>
        </FadeIn>

        <FadeIn delay={0.06} className="mx-auto mt-8 max-w-3xl rounded-card bg-surface p-6 shadow-card md:p-8">
          <div className="max-h-[360px] space-y-4 overflow-y-auto rounded-card border border-primary/10 bg-background p-4">
            {messages.map((msg, index) => (
              <div
                key={`${msg.role}-${index}`}
                className={`rounded-card px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "assistant"
                    ? "bg-white text-text shadow-sm"
                    : "ml-auto max-w-[90%] bg-primary text-white"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading ? (
              <div className="rounded-card bg-white px-4 py-3 text-sm text-text-secondary shadow-sm">
                Antwort wird vorbereitet...
              </div>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-3">
            <label htmlFor="home-ai-question" className="text-sm font-medium text-text">
              Deine Frage
            </label>
            <textarea
              id="home-ai-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="min-h-24 rounded-card border border-primary/20 bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
              placeholder="z. B. Warum kann aFRR in manchen Szenarien den groesseren Hebel bringen als reine Arbitrage?"
            />
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuestion(prompt)}
                  className="rounded-card border border-primary/15 bg-white px-3 py-2 text-xs text-primary hover:border-primary/40"
                >
                  {prompt}
                </button>
              ))}
            </div>
            {error ? <p className="text-sm text-[#B85C38]">{error}</p> : null}
            <button
              type="submit"
              disabled={isLoading}
              className="w-fit rounded-card bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Sende..." : "Frage senden"}
            </button>
          </form>
        </FadeIn>
      </div>
    </section>
  );
}
