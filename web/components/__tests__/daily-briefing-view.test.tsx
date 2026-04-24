import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type React from "react";
import { DailyBriefingView } from "@/components/daily-briefing-view";

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

const briefingPayload = {
  briefing: {
    date: "24. April 2026",
    lesson: { title: "Test Lesson", content: "One.\n\nTwo." },
    news: [{ headline: "Headline", facts: "Facts", einordnung: "Einordnung" }],
    insights: ["Insight 1", "Insight 2", "Insight 3"],
  },
  cached: false,
  generatedAt: new Date().toISOString(),
};

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

describe("DailyBriefingView", () => {
  beforeEach(() => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => briefingPayload,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => livePayload,
      } as Response)
      .mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => briefingPayload,
      } as Response);
  });

  it("renders live metrics and recalculates impact slider", async () => {
    render(<DailyBriefingView />);

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
});

