import React from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { WidgetShell } from "../WidgetShell"
import type { WidgetDefinition, WidgetInstanceState } from "../types"

const widget: WidgetDefinition = {
 id: "test-widget",
 title: "Test Widget",
 subtitle: "Test",
 category: "system",
 defaultSize: "half",
 minSize: "quarter",
 maxSize: "full",
 defaultHeight: "medium",
 minHeight: "short",
 maxHeight: "tall",
 headerColor: "#FFDA47",
 iconRailColor: "#FFFFFF",
 dependency: ["none"],
 status: "ready",
 rendererKey: "test-widget",
 releaseTier: "supported",
 defaultVisible: true,
 defaultOrder: 0,
 supportedSizes: ["quarter", "half", "full"],
 supportedHeights: ["short", "medium", "tall"],
 supportedDimensions: [{ size: "half", height: "medium" }],
 responsiveMode: "container",
}

const instance: WidgetInstanceState = {
 collapsed: false,
 size: "half",
 height: "medium",
}

const renderShell = (
 contentLayout?: "inset" | "flush",
 instanceOverride: Partial<WidgetInstanceState> = {},
 helpContent?: React.ReactNode,
) => renderToStaticMarkup(
 <WidgetShell
  widget={widget}
  instance={{ ...instance, ...instanceOverride }}
  editMode={false}
  canEdit={false}
  contentLayout={contentLayout}
  helpContent={helpContent}
 >
  <div>Content</div>
 </WidgetShell>,
)

describe("WidgetShell content layout", () => {
 it("keeps the existing inset body as the safe default", () => {
  expect(renderShell()).toContain('class="vt-widget-body"')
 })

 it("offers an explicit flush body for modules that own their internal spacing", () => {
  expect(renderShell("flush")).toContain('class="vt-widget-body vt-widget-body--flush"')
 })

 it("renders a collapsed widget as a header-only region", () => {
  const markup = renderShell(undefined, { collapsed: true })

  expect(markup).toContain('class="vt-widget is-collapsed"')
  expect(markup).toContain('aria-expanded="false"')
 expect(markup).not.toContain("Content")
 })

 it("places explanatory guides in the question-mark information region, outside the widget body", () => {
  const markup = renderShell(undefined, {}, <section data-testid="guide">How it works</section>)
  const guideIndex = markup.indexOf('data-testid="guide"')

  expect(markup).toContain('class="widget-help-guide"')
  expect(guideIndex).toBeGreaterThan(markup.indexOf('class="widget-subtitle'))
  expect(guideIndex).toBeLessThan(markup.indexOf('class="vt-widget-content"'))
 })
})
