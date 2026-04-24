"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CHAT_WIDGET_STATE_EVENT, OPEN_CHAT_PREFILL_EVENT } from "@/components/chat-widget";

type FloatingCtaState = {
  text: string;
  top: number;
  left: number;
};

const MIN_SELECTION_LENGTH = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function shouldIgnoreSelection(selection: Selection) {
  if (selection.rangeCount === 0) return true;
  const range = selection.getRangeAt(0);
  const common = range.commonAncestorContainer;
  const element =
    common.nodeType === Node.ELEMENT_NODE ? (common as Element) : common.parentElement;
  if (!element) return true;

  if (
    element.closest("input, textarea, [contenteditable='true'], [data-chat-widget-root='true']")
  ) {
    return true;
  }
  return false;
}

function isChatOpen() {
  return document.body.dataset.chatWidgetOpen === "true";
}

export function TextSelectionExplainer() {
  const [ctaState, setCtaState] = useState<FloatingCtaState | null>(null);

  const hideCta = useCallback(() => {
    setCtaState(null);
  }, []);

  const updateSelection = useCallback(() => {
    if (isChatOpen()) {
      hideCta();
      return;
    }
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || shouldIgnoreSelection(selection)) {
      hideCta();
      return;
    }

    const text = selection.toString().trim().replace(/\s+/g, " ");
    if (text.length < MIN_SELECTION_LENGTH) {
      hideCta();
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      hideCta();
      return;
    }

    const buttonWidth = 132;
    const buttonHeight = 40;
    const margin = 12;
    const top = clamp(rect.bottom + margin, margin, window.innerHeight - buttonHeight - margin);
    const left = clamp(
      rect.left + rect.width / 2 - buttonWidth / 2,
      margin,
      window.innerWidth - buttonWidth - margin,
    );

    setCtaState({ text, top, left });
  }, [hideCta]);

  useEffect(() => {
    const onSelectionChange = () => {
      updateSelection();
    };
    const onMouseUp = () => {
      updateSelection();
    };
    const onKeyUp = () => {
      updateSelection();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest("[data-selection-explain-cta='true']")) {
        hideCta();
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") hideCta();
    };
    const onChatState = (event: Event) => {
      const customEvent = event as CustomEvent<{ open?: boolean }>;
      if (customEvent.detail?.open) {
        hideCta();
      }
    };

    document.addEventListener("selectionchange", onSelectionChange);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    window.addEventListener(CHAT_WIDGET_STATE_EVENT, onChatState as EventListener);

    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
      window.removeEventListener(CHAT_WIDGET_STATE_EVENT, onChatState as EventListener);
    };
  }, [hideCta, updateSelection]);

  const prompt = useMemo(() => {
    if (!ctaState) return "";
    return `Erklaere mir diesen Abschnitt einfach und praxisnah:\n\n"${ctaState.text}"`;
  }, [ctaState]);

  if (!ctaState) return null;

  return (
    <button
      type="button"
      data-selection-explain-cta="true"
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent<{ prompt: string }>(OPEN_CHAT_PREFILL_EVENT, {
            detail: { prompt },
          }),
        );
        window.getSelection()?.removeAllRanges();
        hideCta();
      }}
      className="fixed z-[70] rounded-card border border-primary/20 bg-surface px-4 py-2 text-sm font-medium text-primary shadow-[0_8px_20px_rgba(46,74,62,0.18)] ring-1 ring-accent/35 transition hover:border-primary/35 hover:bg-background-alt"
      style={{ top: ctaState.top, left: ctaState.left }}
      aria-label="Markierten Abschnitt im AI Chat erklaeren"
    >
      Erklaeren
    </button>
  );
}
