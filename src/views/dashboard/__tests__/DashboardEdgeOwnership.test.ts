import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const barrier = readFileSync(new URL("../DashboardBarrier.tsx", import.meta.url), "utf8")
const shellCss = readFileSync(new URL("../widgetShellOwnership.css", import.meta.url), "utf8")
const scrollCss = readFileSync(new URL("../widgetScrollbar.css", import.meta.url), "utf8")
const shell = readFileSync(new URL("../WidgetShell.tsx", import.meta.url), "utf8")
const mobileCss = readFileSync(new URL("../widgetMobileContract.css", import.meta.url), "utf8")
const canvas = readFileSync(new URL("../DashboardCanvas.tsx", import.meta.url), "utf8")

describe("dashboard edge and collapsed-control ownership", () => {
  it("does not paint-contain the dashboard where shadows and glows need to escape", () => {
    expect(barrier).not.toContain('contain:"layout style paint"')
    expect(barrier).toContain('contain:"layout style"')
  })

  it("reclaims only the parent dashboard canvas on phones while scroll content stays canonical", () => {
    expect(scrollCss).not.toContain("width: calc(100% + (2 * var(--widget-shadow-clearance)))")
    expect(scrollCss).not.toContain("margin-inline: calc(-1 * var(--widget-shadow-clearance))")
    expect(canvas).toContain("dashboard-canvas-inner")
    expect(mobileCss).toContain("--vt-mobile-canvas-reclaim-right")
    expect(mobileCss).toContain("width: calc(100% + var(--vt-mobile-canvas-reclaim-right))")
    expect(mobileCss).toContain("--vt-widget-edge-safe: 0px")
  })

  it("keeps the mobile control deck outside the collapsing canvas", () => {
    const controlsIndex = shell.indexOf('className={cn("widget-mobile-control-row"')
    const collapseIndex = shell.indexOf('className={cn("vt-widget-collapse-region"')
    expect(controlsIndex).toBeGreaterThan(-1)
    expect(collapseIndex).toBeGreaterThan(-1)
    expect(controlsIndex).toBeLessThan(collapseIndex)
  })

  it("lets open-widget shadows and focus glows reach the content edge", () => {
    expect(shellCss).toContain(".vt-widget-content")
    expect(shellCss).toContain("overflow:visible")
    expect(shellCss).toContain(".vt-widget-collapse-region.is-closed .vt-widget-collapse-inner")
    expect(shellCss).toContain("overflow:hidden")
  })
})
