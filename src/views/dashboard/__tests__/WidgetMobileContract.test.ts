import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const mobileCss = readFileSync(new URL("../widgetMobileContract.css", import.meta.url), "utf8")
const barrierSource = readFileSync(new URL("../DashboardBarrier.tsx", import.meta.url), "utf8")
const primitiveSource = readFileSync(new URL("../WidgetPrimitives.tsx", import.meta.url), "utf8")
const variantCss = readFileSync(new URL("../widgetPrimitiveVariants.css", import.meta.url), "utf8")
const widgetSystemCss = readFileSync(new URL("../toolboxWidgetSystem.css", import.meta.url), "utf8")

describe("mobile widget geometry contract", () => {
  it("loads the phone contract after the canonical shell layers", () => {
    expect(barrierSource).toContain('import "./widgetScrollbar.css"')
    expect(barrierSource).toContain('import "./widgetMobileContract.css"')
    expect(barrierSource.indexOf("widgetMobileContract.css")).toBeGreaterThan(barrierSource.indexOf("widgetScrollbar.css"))
  })

  it("loads every shared stylesheet before the final phone contract and never from a lazy widget module", () => {
    const imports = [
      "widgetLayerOrder.css",
      "toolboxWidgetSystem.css",
      "widgetPrimitiveSystem.css",
      "widgetPrimitiveVariants.css",
      "widgetPrimitiveExactHeights.css",
      "widgetPrimitiveTones.css",
      "widgetMatrixPrimitives.css",
      "widgetControlOwnership.css",
      "widgetArchetypeResponsive.css",
      "widgetShellOwnership.css",
      "widgetScrollbar.css",
      "widgetMobileContract.css",
    ]
    for (const name of imports) expect(barrierSource).toContain(`import "./${name}"`)
    for (let index = 1; index < imports.length; index += 1) {
      expect(barrierSource.indexOf(imports[index])).toBeGreaterThan(barrierSource.indexOf(imports[index - 1]))
    }
    expect(primitiveSource).not.toContain('import "./widgetPrimitive')
    expect(primitiveSource).not.toContain('import "./widgetMatrixPrimitives.css"')
  })

  it("stacks reference-library comparison variants before split-left labels become unusable", () => {
    expect(variantCss).toContain("@container vt-widget (max-width: 420px)")
    expect(variantCss).toContain("grid-template-columns: minmax(0, 1fr);")
  })

  it("keeps Image Generator button geometry stable while adaptive 24px type fits the row", () => {
    expect(widgetSystemCss).toContain("@container vt-widget (max-width: 900px)")
    expect(widgetSystemCss).toContain("@container vt-widget (max-width: 560px)")
    expect(widgetSystemCss).toContain(".image-generator-style-grid")
    expect(widgetSystemCss).toContain("grid-template-columns: repeat(4, minmax(0, 1fr));")
    expect(widgetSystemCss).not.toContain(".image-generator-style-grid,\n  :where(.dashboard-barrier) .image-generator-send-grid {\n    grid-template-columns: repeat(2")
    expect(widgetSystemCss).toContain("--image-generator-copy-height:")
    expect(widgetSystemCss).toContain("resize: vertical;")
    expect(widgetSystemCss).toContain("height: var(--image-generator-copy-height) !important;")
    expect(widgetSystemCss).toContain("height: var(--image-generator-copy-height);")
  })

  it("keeps AI Journal categories at four columns on narrow widgets", () => {
    expect(widgetSystemCss).toContain("AI Journal keeps the four-column category matrix")
    expect(widgetSystemCss).toContain(".ai-journal-category-grid")
    expect(widgetSystemCss).toContain("grid-template-columns: repeat(4, minmax(0, 1fr));")
  })

  it("keeps header toggles visible in portrait widget headers", () => {
    expect(widgetSystemCss).toContain(".header-extra:has(.widget-header-toggle)")
    expect(widgetSystemCss).toContain("display: flex !important;")
    expect(widgetSystemCss).toContain(".vt-widget-header:has(.header-extra .widget-header-toggle)")
  })

  it("forces every phone widget to one complete dashboard row without mutating persisted width state", () => {
    expect(mobileCss).toContain("@media (max-width: 767px)")
    expect(mobileCss).toContain("grid-column: 1 / -1;")
    expect(mobileCss).toContain("width: 100%;")
    expect(mobileCss).toContain("min-width: 0;")
    expect(mobileCss).toContain("max-width: 100%;")
  })

  it.each([
    ["short", "150px"],
    ["medium", "250px"],
    ["tall", "350px"],
    ["xtall", "450px"],
    ["massive", "850px"],
  ])("keeps %s height deterministic at %s", (bucket, height) => {
    expect(mobileCss).toContain(`--vt-mobile-height-${bucket}: ${height};`)
    expect(mobileCss).toContain(`.vt-dash-cell.vt-height-${bucket}:not(.is-collapsed)`)
  })

  it("bounds content inside the height bucket and keeps overflow reachable", () => {
    expect(mobileCss).toContain("overflow-y: auto;")
    expect(mobileCss).toContain("overscroll-behavior: contain;")
    expect(mobileCss).toContain("-webkit-overflow-scrolling: touch;")
    expect(mobileCss).toContain("scrollbar-width: thin;")
  })

  it("disables width resize actions on phone while leaving height actions available", () => {
    expect(mobileCss).toContain(".widget-edit-resize-grid > :nth-child(1)")
    expect(mobileCss).toContain(".widget-edit-resize-grid > :nth-child(2)")
    expect(mobileCss).not.toContain(".widget-edit-resize-grid > :nth-child(3),")
    expect(mobileCss).not.toContain(".widget-edit-resize-grid > :nth-child(4)")
  })
})
