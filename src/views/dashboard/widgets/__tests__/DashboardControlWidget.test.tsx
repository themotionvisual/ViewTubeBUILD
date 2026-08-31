import React from "react"
import { describe, expect, it, vi } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { DashboardControlWidget } from "../DashboardControlWidget"
import { DASHBOARD_WIDGET_BY_ID } from "../../WidgetRegistry"

describe("DashboardControlWidget", () => {
  const mockWidget = DASHBOARD_WIDGET_BY_ID["dashboard-controls"] || {
    id: "dashboard-controls",
    title: "Dashboard Controls",
    subtitle: "Layout management, widget picker, preset configs, and backup tools",
    category: "system",
    defaultSize: "half",
    defaultHeight: "tall",
    minSize: "third",
    maxSize: "full",
    minHeight: "medium",
    maxHeight: "xtall",
    color: "#FA618A",
    borderColor: "#000",
    shadowColor: "#000",
    defaultOrder: 0,
    supportedSizes: ["third", "half", "full"],
    supportedHeights: ["medium", "tall", "xtall"],
    supportedDimensions: [{ size: "half", height: "tall" }],
    defaultVisible: true,
    releaseTier: "ga",
    dependencies: ["none"],
    status: "ready",
  }

  const mockInstance = {
    collapsed: false,
    size: "half" as const,
    height: "tall" as const,
  }

  it("renders layout controls and tab toggle correctly", () => {
    const html = renderToStaticMarkup(
      <DashboardControlWidget
        widget={mockWidget}
        instance={mockInstance}
        editMode={false}
        onToggleCollapse={vi.fn()}
        onCycleSize={vi.fn()}
        onCycleHeight={vi.fn()}
        onRemove={vi.fn()}
      />
    )

    expect(html).toContain("Dashboard Controls")
    expect(html).toContain("Layout")
    expect(html).toContain("Widgets")
    expect(html).toContain("Presets")
    expect(html).toContain("Rearrange Mode")
    expect(html).toContain("Layout Lock")
    expect(html).toContain("Add Widgets")
    expect(html).toContain("Export JSON")
    expect(html).toContain("Import JSON")
    expect(html).toContain("Reset to Factory Layout")
  })
})
