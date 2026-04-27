import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { OPEN_CHAT_PREFILL_EVENT, type ChatPrefillEventDetail } from "@/components/chat-events";
import { DataLiveMetricsView } from "@/components/data-live-metrics-view";

jest.mock("next/link", () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

jest.mock("@/components/fade-in", () => ({
  FadeIn: Object.assign(({ children }: { children: React.ReactNode }) => <div>{children}</div>, {
    displayName: "MockFadeIn",
  }),
}));

const livePayload = {
  metrics: {
    consumptionMw: 61000,
    productionMw: 58000,
    frequencyHz: 49.995,
    installedBessMw: 2600,
    installedBessMwh: 3900,
    generationMix: [
      { fuel: "Wind onshore", mw: 20000, sharePct: 34.5 },
      { fuel: "Solar", mw: 18000, sharePct: 31.0 },
    ],
    consumptionTrend: [
      { asOf: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), value: 58000 },
      { asOf: new Date().toISOString(), value: 61000 },
    ],
    productionTrend: [
      { asOf: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), value: 54000 },
      { asOf: new Date().toISOString(), value: 58000 },
    ],
    frequencyTrend: [
      { asOf: new Date(Date.now() - 60 * 60 * 1000).toISOString(), value: 50.0 },
      { asOf: new Date().toISOString(), value: 49.995 },
    ],
    asOf: new Date().toISOString(),
    sources: [],
    qualityFlags: [],
  },
  cached: false,
  generatedAt: new Date().toISOString(),
};

describe("DataLiveMetricsView", () => {
  beforeEach(() => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => livePayload,
      } as Response)
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => livePayload,
      } as Response);
  });

  it("renders live metrics and recalculates impact slider", async () => {
    render(<DataLiveMetricsView />);

    await waitFor(() => {
      expect(screen.getByText("49.995 Hz")).toBeInTheDocument();
    });
    expect(screen.getByText("Live-Metriken Deutschland")).toBeInTheDocument();
    expect(screen.getByText("61.0 GW")).toBeInTheDocument();
    expect(screen.getByText("Strommix aktuell")).toBeInTheDocument();
    expect(screen.getByText(/Nicht verfuegbar \(keine Telemetriequelle konfiguriert\)/i)).toBeInTheDocument();

    const slider = screen.getByLabelText(/Zusaetzliche BESS-Leistung/i);
    fireEvent.change(slider, { target: { value: "1000" } });

    expect(screen.getByText(/1000 MW/)).toBeInTheDocument();
  });

  it("opens the AI chat with current and 24h analysis prompts", async () => {
    const chatEvents: Array<CustomEvent<ChatPrefillEventDetail>> = [];
    const onChatPrefill = (event: Event) => {
      chatEvents.push(event as CustomEvent<ChatPrefillEventDetail>);
    };
    window.addEventListener(OPEN_CHAT_PREFILL_EVENT, onChatPrefill);

    render(<DataLiveMetricsView />);

    await waitFor(() => {
      expect(screen.getByText("49.995 Hz")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Aktuelle Lage analysieren" }));
    fireEvent.click(screen.getByRole("button", { name: "Analyse 24h" }));

    window.removeEventListener(OPEN_CHAT_PREFILL_EVENT, onChatPrefill);

    expect(chatEvents).toHaveLength(2);
    expect(chatEvents[0].detail).toEqual(
      expect.objectContaining({
        submit: true,
        prompt: expect.stringContaining("grid-stabilisierendes Verhalten"),
      }),
    );
    expect(chatEvents[0].detail.prompt).toContain("Verbrauch: 61.0 GW");
    expect(chatEvents[1].detail.prompt).toContain("vergangenen 24 Stunden");
    expect(chatEvents[1].detail.prompt).toContain("Engpaesse/Redispatch mindern");
  });
});
