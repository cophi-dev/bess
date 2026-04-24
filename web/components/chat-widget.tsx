"use client";

import { FormEvent, KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const OPEN_CHAT_PREFILL_EVENT = "openautobidder:chat-prefill";
export const CHAT_WIDGET_STATE_EVENT = "openautobidder:chat-state";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const quickPrompts = [
  "Warum reicht Arbitrage oft nicht aus?",
  "Wie verdienen BESS mit FCR und aFRR?",
  "Welche Rolle spielen Netzengpaesse?",
];

function ChatHeader({
  isFullscreen,
  onClose,
  onToggleFullscreen,
}: {
  isFullscreen: boolean;
  onClose: () => void;
  onToggleFullscreen: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-primary/10 px-5 py-4">
      <p className="flex items-center gap-2 font-medium text-primary">
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
        AI Lernassistent
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="hidden rounded-card px-2 py-1 text-xs text-text-secondary transition hover:bg-background-alt hover:text-text md:inline-flex"
          aria-label={isFullscreen ? "Vollbild verlassen" : "Vollbild"}
        >
          {isFullscreen ? "Fenster" : "Vollbild"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-card px-2 py-1 text-xs text-text-secondary transition hover:bg-background-alt hover:text-text"
        >
          Schliessen
        </button>
      </div>
    </div>
  );
}

function ChatMessageList({
  isLoading,
  messages,
  viewportRef,
}: {
  isLoading: boolean;
  messages: ChatMessage[];
  viewportRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={viewportRef}
      className="flex-1 space-y-3 overflow-y-auto bg-background px-4 py-4 md:px-5"
      aria-live="polite"
    >
      {messages.map((msg, idx) => (
        <div
          key={`${msg.role}-${idx}`}
          className={`max-w-[92%] rounded-card px-3.5 py-2.5 text-sm ${
            msg.role === "assistant"
              ? "bg-surface text-text shadow-[0_2px_10px_rgba(46,74,62,0.07)]"
              : "ml-auto bg-primary text-white"
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
                    <table className="min-w-[520px] border-collapse text-left text-xs md:text-sm">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-background-alt text-text">{children}</thead>,
                tbody: ({ children }) => <tbody className="bg-white">{children}</tbody>,
                tr: ({ children }) => <tr className="border-b border-primary/10 last:border-b-0">{children}</tr>,
                th: ({ children }) => <th className="px-3 py-2 font-semibold whitespace-nowrap">{children}</th>,
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
        <div className="max-w-[92%] rounded-card bg-surface px-3.5 py-2.5 text-sm text-text-secondary shadow-[0_2px_10px_rgba(46,74,62,0.07)]">
          Antwort wird vorbereitet...
        </div>
      ) : null}
    </div>
  );
}

function ChatComposer({
  error,
  isLoading,
  onChangeQuestion,
  onPickPrompt,
  onSubmit,
  question,
  showQuickPrompts,
  textareaRef,
}: {
  error: string | null;
  isLoading: boolean;
  onChangeQuestion: (value: string) => void;
  onPickPrompt: (prompt: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  question: string;
  showQuickPrompts: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const onTextareaKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const form = event.currentTarget.form;
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3 border-t border-primary/10 bg-surface px-4 py-4 md:px-5">
      <textarea
        ref={textareaRef}
        value={question}
        onChange={(event) => onChangeQuestion(event.target.value)}
        onKeyDown={onTextareaKeyDown}
        className="min-h-24 w-full rounded-card border border-primary/20 bg-background px-3 py-2 text-sm leading-relaxed outline-none transition focus:border-primary"
        placeholder="Frage zu BESS Revenue Stacking..."
      />
      {showQuickPrompts ? (
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onPickPrompt(prompt)}
              className="rounded-card border border-primary/15 bg-background px-2.5 py-1 text-xs text-primary transition hover:border-primary/35"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="text-xs text-error">{error}</p> : null}
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-card bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? "Sende..." : "Senden"}
      </button>
    </form>
  );
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
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
  const messageViewportRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasUserMessage = useMemo(
    () => messages.some((message) => message.role === "user"),
    [messages],
  );
  const showQuickPrompts = !hasUserMessage;

  useEffect(() => {
    const handlePrefillEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt?: string }>;
      const prompt = customEvent.detail?.prompt?.trim();
      if (!prompt) return;
      setIsOpen(true);
      setQuestion(prompt);
      setError(null);
    };

    window.addEventListener(OPEN_CHAT_PREFILL_EVENT, handlePrefillEvent as EventListener);
    return () => {
      window.removeEventListener(OPEN_CHAT_PREFILL_EVENT, handlePrefillEvent as EventListener);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setIsMobileViewport(media.matches);
      if (media.matches) {
        setIsFullscreen(false);
      }
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    document.body.dataset.chatWidgetOpen = isOpen ? "true" : "false";
    window.dispatchEvent(
      new CustomEvent<{ open: boolean }>(CHAT_WIDGET_STATE_EVENT, {
        detail: { open: isOpen },
      }),
    );
    return () => {
      delete document.body.dataset.chatWidgetOpen;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isMobileViewport) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileViewport, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    textareaRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!messageViewportRef.current) return;
    const latestMessage = messages[messages.length - 1];
    if (!isLoading && latestMessage?.role !== "assistant") return;
    messageViewportRef.current.scrollTo({
      top: messageViewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isLoading, messages]);

  useEffect(() => {
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, []);

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

  const panelClassName = isMobileViewport
    ? "absolute inset-3 flex min-h-0 flex-col overflow-hidden rounded-card border border-primary/15 bg-surface shadow-[0_12px_30px_rgba(46,74,62,0.16)]"
    : isFullscreen
      ? "fixed inset-5 flex min-h-0 flex-col overflow-hidden rounded-card border border-primary/15 bg-surface shadow-[0_12px_30px_rgba(46,74,62,0.16)]"
      : "fixed right-0 top-16 flex h-[calc(100vh-4rem)] w-[460px] min-h-0 flex-col overflow-hidden border-l border-primary/15 bg-surface shadow-[-8px_0_24px_rgba(46,74,62,0.12)]";

  return (
    <div
      data-chat-widget-root="true"
      className="fixed bottom-4 right-4 z-[60] md:bottom-7 md:right-7"
    >
      {isOpen ? (
        <div className="fixed inset-0 z-[65]">
          <div
            className="absolute inset-0 bg-[rgba(44,44,44,0.28)] md:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-label="AI Lernassistent"
            className={panelClassName}
          >
            <ChatHeader
              isFullscreen={isFullscreen}
              onClose={() => setIsOpen(false)}
              onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
            />
            <ChatMessageList
              isLoading={isLoading}
              messages={messages}
              viewportRef={messageViewportRef}
            />
            <ChatComposer
              error={error}
              isLoading={isLoading}
              onChangeQuestion={setQuestion}
              onPickPrompt={setQuestion}
              onSubmit={onSubmit}
              question={question}
              showQuickPrompts={showQuickPrompts}
              textareaRef={textareaRef}
            />
          </section>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative flex h-14 w-14 items-center justify-center rounded-full border text-sm font-semibold text-primary shadow-card transition hover:scale-[1.02] ${
          isOpen ? "border-primary/40 bg-background-alt" : "border-primary/20 bg-accent"
        } ${isOpen && !isMobileViewport ? "md:hidden" : ""}`}
        aria-label={isOpen ? "AI Chat schliessen" : "AI Chat oeffnen"}
      >
        AI
      </button>
    </div>
  );
}
