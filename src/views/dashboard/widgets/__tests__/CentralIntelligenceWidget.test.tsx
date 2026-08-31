import React from "react"
import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { CentralIntelligenceWidget } from "../CentralIntelligenceWidget"
import { DASHBOARD_WIDGET_BY_ID } from "../../WidgetRegistry"

describe("CentralIntelligenceWidget", () => {
  const mockWidget = DASHBOARD_WIDGET_BY_ID["brain-hub"] || {
    id: "brain-hub",
    title: "Central Intelligence Hub",
    subtitle: "Ask AI, Creator Journal, Brain OS & Strategy Prompts",
    category: "ai",
    defaultSize: "half",
    defaultHeight: "xtall",
    minSize: "quarter",
    maxSize: "full",
    minHeight: "short",
    maxHeight: "xtall",
    color: "#40C6E9",
    borderColor: "#000",
    shadowColor: "#000",
    defaultOrder: 0,
    supportedSizes: ["third", "half", "full"],
    supportedHeights: ["medium", "tall", "xtall"],
    supportedDimensions: [{ size: "half", height: "xtall" }],
    defaultVisible: true,
    releaseTier: "ga",
    dependencies: ["none"],
    status: "ready",
  }

  const mockInstance = {
    collapsed: false,
    size: "half" as const,
    height: "xtall" as const,
  }

  const mockData = {
    statBlocks28d: [
      { label: "Views", value: "142,500" },
      { label: "Subscribers", value: "+1,240" },
    ],
    canonicalRows: [
      { title: "Top Video 1", views: "50,000" },
    ],
    brain: {
      recentMetrics: { currentSubscribers: 12400 },
    },
  }

  it("renders with 4 tabs (Ask AI, Journal, Brain OS, Prompts) and default Ask AI view", () => {
    const html = renderToStaticMarkup(
      <CentralIntelligenceWidget
        widget={mockWidget}
        instance={mockInstance}
        editMode={false}
        data={mockData}
        defaultTab="ask"
        onToggleCollapse={vi.fn()}
        onCycleSize={vi.fn()}
        onCycleHeight={vi.fn()}
        onRemove={vi.fn()}
      />
    )

    expect(html).toContain("Central Intelligence")
    expect(html).toContain("Ask AI")
    expect(html).toContain("Journal")
    expect(html).toContain("Brain OS")
    expect(html).toContain("Prompts")
    expect(html).toContain("Strategy Shortcuts")
  })

  it("renders Brain OS tab with memory quadrants and OODA directive", () => {
    const html = renderToStaticMarkup(
      <CentralIntelligenceWidget
        widget={mockWidget}
        instance={mockInstance}
        editMode={false}
        data={mockData}
        defaultTab="memory"
        onToggleCollapse={vi.fn()}
        onCycleSize={vi.fn()}
        onCycleHeight={vi.fn()}
        onRemove={vi.fn()}
      />
    )

    expect(html).toContain("Identity &amp; Mission")
    expect(html).toContain("Content DNA")
    expect(html).toContain("Performance Ledger")
    expect(html).toContain("Future State Map")
    expect(html).toContain("Reflect")
  })

  it("renders Strategy Prompts tab with prompt library", () => {
    const html = renderToStaticMarkup(
      <CentralIntelligenceWidget
        widget={mockWidget}
        instance={mockInstance}
        editMode={false}
        data={mockData}
        defaultTab="prompts"
        onToggleCollapse={vi.fn()}
        onCycleSize={vi.fn()}
        onCycleHeight={vi.fn()}
        onRemove={vi.fn()}
      />
    )

    expect(html).toContain("Curated Strategy Prompts")
    expect(html).toContain("Full Content Audit")
    expect(html).toContain("Niche Differentiation")
    expect(html).toContain("Custom Strategy Prompt")
  })
})
