"use client";

import { FormEvent, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  "Warum reicht Arbitrage oft nicht aus?",
  "Wie verdienen BESS mit FCR und aFRR?",
  "Welche Rolle spielen Netzengpaesse?",
];

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, ich bin dein AI Lernassistent fuer BESS Revenue Stacking in Deutschland.",
    },
  ]);

  const pageContext = useMemo(
    () =>
      "OpenAutobidder-DE erklaert Revenue Stacking fuer Batteriespeicher in Deutschland mit Fokus auf Arbitrage, FCR, aFRR, Kapazitaet und Netzengpass-Anreize.",
    [],
  );

  async function askQuestion(input: string) {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

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
          history: updatedMessages,
          pageContext,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data?.error === "string" ? data.error : "Antwort nicht verfuegbar.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            typeof data?.answer === "string" && data.answer.trim()
              ? data.answer
              : "Ich konnte gerade keine Antwort erzeugen. Bitte versuche es erneut.",
        },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Unerwarteter Fehler beim Chat.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void askQuestion(question);
  }

  return (
    <div className="fixed bottom-5 right-5 z-[60] md:bottom-7 md:right-7">
      {isOpen ? (
        <div className="mb-3 w-[min(92vw,420px)] rounded-card border border-primary/30 bg-surface p-4 shadow-[0_10px_28px_rgba(46,74,62,0.2)] ring-1 ring-accent/45">
          <div className="mb-3 flex items-center justify-between">
            <p className="flex items-center gap-2 font-medium text-primary">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_0_4px_rgba(201,168,108,0.24)]" />
              AI Lernassistent
            </p>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-card px-2 py-1 text-xs text-text-secondary hover:bg-background-alt"
            >
              Schliessen
            </button>
          </div>

          <div className="max-h-[320px] space-y-3 overflow-y-auto rounded-card bg-background p-3">
            {messages.map((msg, idx) => (
              <div
                key={`${msg.role}-${idx}`}
                className={`rounded-card px-3 py-2 text-sm ${
                  msg.role === "assistant"
                    ? "bg-white text-text shadow-sm"
                    : "ml-auto max-w-[88%] bg-primary text-white"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h4 className="mb-1 text-base font-semibold">{children}</h4>,
                      h2: ({ children }) => <h5 className="mb-1 text-sm font-semibold">{children}</h5>,
                      h3: ({ children }) => <h6 className="mb-1 text-sm font-semibold">{children}</h6>,
                      p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      code: ({ children }) => (
                        <code className="rounded bg-background-alt px-1 py-0.5 text-[0.82em]">{children}</code>
                      ),
                      table: ({ children }) => (
                        <div className="my-2 w-full overflow-x-auto rounded-card border border-primary/10">
                          <table className="min-w-[560px] border-collapse text-left text-xs md:text-sm">
                            {children}
                          </table>
                        </div>
                      ),
                      thead: ({ children }) => (
                        <thead className="bg-background-alt text-text">{children}</thead>
                      ),
                      tbody: ({ children }) => <tbody className="bg-white">{children}</tbody>,
                      tr: ({ children }) => (
                        <tr className="border-b border-primary/10 last:border-b-0">{children}</tr>
                      ),
                      th: ({ children }) => (
                        <th className="px-3 py-2 font-semibold whitespace-nowrap">{children}</th>
                      ),
                      td: ({ children }) => (
                        <td className="px-3 py-2 align-top text-text-secondary">{children}</td>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                ) : (
                  <p className="leading-relaxed">{msg.content}</p>
                )}
              </div>
            ))}
            {isLoading ? (
              <div className="rounded-card bg-white px-3 py-2 text-sm text-text-secondary shadow-sm">
                Antwort wird vorbereitet...
              </div>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="mt-3 space-y-3">
            <textarea
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="min-h-20 w-full rounded-card border border-primary/25 bg-background px-3 py-2 text-base outline-none focus:border-primary md:text-sm"
              placeholder="Frage zu BESS Revenue Stacking..."
            />
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setQuestion(prompt)}
                  className="rounded-card border border-primary/15 bg-white px-2 py-1 text-xs text-primary hover:border-primary/40"
                >
                  {prompt}
                </button>
              ))}
            </div>
            {error ? <p className="text-xs text-[#B85C38]">{error}</p> : null}
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-card bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {isLoading ? "Sende..." : "Senden"}
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full border text-2xl text-primary shadow-card transition hover:scale-[1.02] ${
          isOpen
            ? "border-accent/80 bg-accent ring-4 ring-accent/35"
            : "border-primary/20 bg-accent"
        }`}
        aria-label="AI Chat oeffnen"
      >
        {isOpen ? (
          <span className="pointer-events-none absolute inset-0 rounded-full border border-accent/70 animate-pulse" />
        ) : null}
        💬
      </button>
    </div>
  );
}
