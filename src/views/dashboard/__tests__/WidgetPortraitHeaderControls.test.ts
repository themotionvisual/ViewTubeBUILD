import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const shell = readFileSync(new URL("../WidgetShell.tsx", import.meta.url), "utf8")
const mobile = readFileSync(new URL("../widgetMobileContract.css", import.meta.url), "utf8")
const shellCss = readFileSync(new URL("../widgetShellOwnership.css", import.meta.url), "utf8")
const canvas = readFileSync(new URL("../DashboardCanvas.tsx", import.meta.url), "utf8")

describe("portrait widget header control deck", () => {
  it("uses one portrait menu trigger and a dedicated extended control row", () => {
    expect(shell).toContain("widget-mobile-controls-trigger")
    expect(shell).toContain("widget-mobile-control-row")
    expect(shell).toContain('aria-label={`${mobileControlsOpen?"Close":"Open"} widget controls for')
    expect(shell).toContain("Decrease widget width")
    expect(shell).toContain("Increase widget width")
    expect(shell).toContain("Decrease widget height")
    expect(shell).toContain("Increase widget height")
    expect(shell).toContain("Widget information")
    expect(shell).toContain("Drag to reorder")
    expect(shell).toContain("Hide widget")
  })

  it("keeps the portrait top row clear until the control deck is opened", () => {
    expect(mobile).toContain(".widget-mobile-controls-trigger")
    expect(mobile).toContain(".widget-mobile-control-row")
    expect(mobile).toContain("background: var(--widget-color")
  })

  it("reclaims the app-shell phone padding for a wider centered widget canvas", () => {
    expect(mobile).toContain("--vt-mobile-widget-gutter: 4px")
    expect(mobile).toContain("width: calc(100% + 24px)")
    expect(mobile).toContain("margin-inline: -12px")
  })

  it("collapses only the canvas region while the header remains fixed", () => {
    expect(shellCss).toContain("grid-template-rows:1fr")
    expect(shellCss).toContain("grid-template-rows:0fr")
    expect(shellCss).not.toContain("opacity:0")
    expect(canvas).not.toContain("<motion.div ref={setNodeRef} layout")
    expect(canvas).not.toContain("useReducedMotion")
  })
})
