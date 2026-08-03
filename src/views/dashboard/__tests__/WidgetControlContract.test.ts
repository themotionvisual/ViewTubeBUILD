import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const widgetSystemCss = readFileSync(
  new URL("../toolboxWidgetSystem.css", import.meta.url),
  "utf8",
)

describe("dashboard widget control rhythm", () => {
  it("defines one desktop and mobile geometry plus one control text treatment", () => {
    expect(widgetSystemCss).toContain("--widget-control-height: 36px;")
    expect(widgetSystemCss).toContain("--widget-control-height-mobile: 44px;")
    expect(widgetSystemCss).toContain("--widget-control-font-size: 12px;")
    expect(widgetSystemCss).toContain("--widget-control-font-weight: 900;")
    expect(widgetSystemCss).toContain("--widget-control-line-height: 1;")
  })

  it.each([
    ".dashboard-barrier .vt-widget-body .vt-button",
    ".dashboard-barrier .vt-widget-body .vt-select",
    ".dashboard-barrier .vt-widget-body .vt-dropdown-trigger",
    ".dashboard-barrier .vt-widget-body .widget-select-trigger",
    ".dashboard-barrier .vt-widget-body .vt-tab-button",
    ".dashboard-barrier .vt-widget-body .vt-tab-btn",
    ".dashboard-barrier .vt-widget-body .widget-step-tabs > button",
  ])("routes %s through the canonical body-control rule", (selector) => {
    expect(widgetSystemCss).toContain(selector)
  })

  it("gives portalled dropdown options the same fallback geometry and type", () => {
    expect(widgetSystemCss).toContain("min-height: var(--widget-control-height, 36px) !important;")
    expect(widgetSystemCss).toContain("font-size: var(--widget-control-font-size, 12px) !important;")
  })
})
