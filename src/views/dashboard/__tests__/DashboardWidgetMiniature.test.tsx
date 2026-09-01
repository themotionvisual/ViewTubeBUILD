import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"
import { DashboardWidgetMiniature } from "../DashboardWidgetMiniature"
import { DASHBOARD_WIDGET_BY_ID } from "../WidgetRegistry"
import { resolveDashboardSpectrum } from "../spectrum"

describe("DashboardWidgetMiniature", () => {
  it("renders the split-left header and all ten dashboard controls", () => {
    const widget = DASHBOARD_WIDGET_BY_ID["community-post"]
    expect(widget).toBeTruthy()

    const html = renderToStaticMarkup(
      <DashboardWidgetMiniature
        widget={widget}
        instance={{ collapsed: false, size: "third", height: "tall" }}
        placement={{
          widgetId: widget.id,
          row: 0,
          columnStart: 8,
          columnSpan: 8,
          center: 12,
        }}
        palette={resolveDashboardSpectrum(2)}
        hidden={false}
        locked={false}
        moveTargets={{
          up: "kpi-cluster",
          right: "comment-replier",
          left: "kpi-cluster",
          down: "dashboard-controls",
        }}
        resizeAvailability={{ wider: true, thinner: true, taller: true, shorter: true }}
        onToggleVisibility={vi.fn()}
        onToggleCollapse={vi.fn()}
        onMove={vi.fn()}
        onResize={vi.fn()}
      />,
    )

    expect(html).toContain("dashboard-widget-miniature-header")
    expect(html).toContain("dashboard-widget-miniature-icon")
    expect(html).toContain("Community Post")
    expect(html).toContain("grid-column:span 8")
    expect(html).toContain("aria-label=\"Hide Community Post\"")
    expect(html).toContain("aria-label=\"Collapse Community Post\"")
    expect(html).toContain("aria-label=\"Wider Community Post\"")
    expect(html).toContain("aria-label=\"Thinner Community Post\"")
    expect(html).toContain("aria-label=\"Taller Community Post\"")
    expect(html).toContain("aria-label=\"Shorter Community Post\"")
    expect(html).toContain("aria-label=\"Move Community Post up\"")
    expect(html).toContain("aria-label=\"Move Community Post right\"")
    expect(html).toContain("aria-label=\"Move Community Post left\"")
    expect(html).toContain("aria-label=\"Move Community Post down\"")
  })

  it("keeps hidden and filtered state explicit without changing proportional span", () => {
    const widget = DASHBOARD_WIDGET_BY_ID["community-post"]
    const html = renderToStaticMarkup(
      <DashboardWidgetMiniature
        widget={widget}
        instance={{ collapsed: true, size: "half", height: "medium" }}
        placement={{
          widgetId: widget.id,
          row: 0,
          columnStart: 0,
          columnSpan: 12,
          center: 6,
        }}
        palette={resolveDashboardSpectrum(1)}
        hidden
        locked
        filteredOut
        moveTargets={{ up: null, right: null, left: null, down: null }}
        resizeAvailability={{ wider: true, thinner: true, taller: true, shorter: true }}
        onToggleVisibility={vi.fn()}
        onToggleCollapse={vi.fn()}
        onMove={vi.fn()}
        onResize={vi.fn()}
      />,
    )

    expect(html).toContain("grid-column:span 12")
    expect(html).toContain("data-collapsed=\"true\"")
    expect(html).toContain("data-visibility=\"hidden\"")
    expect(html).toContain("data-filtered-out=\"true\"")
    expect(html).toContain("aria-label=\"Show Community Post\"")
    expect(html.match(/disabled=""/g)).toHaveLength(8)
  })
})
