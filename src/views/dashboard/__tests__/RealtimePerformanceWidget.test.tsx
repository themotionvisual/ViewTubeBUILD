import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { DASHBOARD_WIDGET_BY_ID } from "../WidgetRegistry"
import { RealtimePerformanceWidget } from "../widgets/RealtimePerformanceWidget"

describe("RealtimePerformanceWidget", () => {
 it("keeps the 48 hour and 60 minute range switch in the widget header", () => {
  const markup = renderToStaticMarkup(
   <RealtimePerformanceWidget
    widget={DASHBOARD_WIDGET_BY_ID["realtime-performance"]}
    instance={{ collapsed: false, size: "quarter", height: "medium" }}
    editMode={false}
    onToggleCollapse={() => {}}
    onCycleSize={() => {}}
    onDecSize={() => {}}
    onCycleHeight={() => {}}
    onDecHeight={() => {}}
    onRemove={() => {}}
    data={{}}
   />,
  )

  expect(markup).toContain("48 hr")
  expect(markup).toContain("60 mn")
  expect(markup).toContain('class="widget-header-toggle"')
  expect(markup).toContain('aria-label="Realtime view range"')
  expect(markup).toContain("border:2px solid var(--widget-border, #000)")
  expect(markup).toContain("color:var(--widget-border, #000)")
  expect(markup).toContain('class="realtime-bar"')
  expect(markup).toContain('class="realtime-bar-fill"')
 })
})
