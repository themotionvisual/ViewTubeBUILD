import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, it, expect, vi } from "vitest"
import { CreatorCommandCenterWidget } from "../CreatorCommandCenterWidget"

const mockWidget: any = {
  id: "daily-oracle",
  title: "Daily Command Center",
  subtitle: "Oracle-powered daily priorities, ranked actions, and Brain feedback loop",
  category: "ai",
  defaultSize: "third",
  minSize: "quarter",
  maxSize: "full",
  defaultHeight: "xtall",
  minHeight: "short",
  maxHeight: "xtall",
  headerColor: "#FA618A",
  iconRailColor: "#FFFFFF",
  dependency: ["none"],
  status: "ready",
}

const mockInstance: any = {
  id: "daily-oracle",
  widgetId: "daily-oracle",
  size: "third",
  height: "xtall",
  collapsed: false,
}

const mockData: any = {
  rawMetrics: {
    subsTotal: 12500,
    subscribers28d: 450,
    views28d: 82000,
    revenue28d: 1240,
    watchHours28d: 380,
  },
  statBlocks28d: [
    { label: "Views (28d)", value: "82.0K" },
    { label: "Subscribers", value: "12.5K" },
    { label: "Estimated revenue", value: "$1,240" },
  ],
  canonicalRows: [
    { title: "Epic Medieval Battle Tactics", views: 25000, uploadDate: new Date(Date.now() - 3 * 86400000).toISOString() },
    { title: "Top 5 Knights Who Changed History Forever", views: 18000, uploadDate: new Date(Date.now() - 6 * 86400000).toISOString() },
  ],
}

describe("CreatorCommandCenterWidget", () => {
  it("renders 3-tab system (1. TODAY, 2. ACTIONS, 3. BRAIN) and default TODAY view", () => {
    const html = renderToStaticMarkup(
      <CreatorCommandCenterWidget
        widget={mockWidget}
        instance={mockInstance}
        editMode={false}
        onToggleCollapse={vi.fn()}
        onCycleSize={vi.fn()}
        onCycleHeight={vi.fn()}
        onRemove={vi.fn()}
        data={mockData}
      />
    )

    // Header & Shell
    expect(html).toContain("Daily Command Center")
    expect(html).toContain("TODAY")
    expect(html).toContain("ACTIONS")
    expect(html).toContain("BRAIN")

    // Zone A: Overnight deltas
    expect(html).toContain("Overnight Channel Signals")
    expect(html).toContain("Views")
    expect(html).toContain("Subscribers")
    expect(html).toContain("Watch Time")
    expect(html).toContain("Revenue")

    // Zone B: Oracle strategy priorities
    expect(html).toContain("Oracle Strategy Focus")
    expect(html).toContain("AI Prioritized")
    expect(html).toContain("Target Goal:")

    // Zone C: Goals
    expect(html).toContain("Active Growth Goals")
    expect(html).toContain("VIEWS")
    expect(html).toContain("SUBSCRIBERS")
    expect(html).toContain("REVENUE")
    expect(html).toContain("WATCHTIME")
  })

  it("computes momentum priority when recent uploads exist", () => {
    const html = renderToStaticMarkup(
      <CreatorCommandCenterWidget
        widget={mockWidget}
        instance={mockInstance}
        editMode={false}
        onToggleCollapse={vi.fn()}
        onCycleSize={vi.fn()}
        onCycleHeight={vi.fn()}
        onRemove={vi.fn()}
        data={mockData}
      />
    )

    expect(html).toContain("Upload Cadence Active")
    expect(html).toContain("Double down on top retention format")
  })

  it("computes cadence warning when no recent uploads exist", () => {
    const staleData = {
      ...mockData,
      canonicalRows: [
        { title: "Old video", views: 100, uploadDate: new Date(Date.now() - 30 * 86400000).toISOString() },
      ],
    }

    const html = renderToStaticMarkup(
      <CreatorCommandCenterWidget
        widget={mockWidget}
        instance={mockInstance}
        editMode={false}
        onToggleCollapse={vi.fn()}
        onCycleSize={vi.fn()}
        onCycleHeight={vi.fn()}
        onRemove={vi.fn()}
        data={staleData}
      />
    )

    expect(html).toContain("Cadence Warning: No upload in 14 days")
    expect(html).toContain("Impression distribution decays sharply")
  })
})
