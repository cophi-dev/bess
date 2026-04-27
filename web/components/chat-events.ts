export const OPEN_CHAT_PREFILL_EVENT = "openautobidder:chat-prefill";
export const CHAT_WIDGET_STATE_EVENT = "openautobidder:chat-state";

export type ChatPrefillEventDetail = {
  prompt?: string;
  submit?: boolean;
};
