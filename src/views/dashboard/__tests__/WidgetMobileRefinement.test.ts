import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const shell = readFileSync(new URL("../WidgetShell.tsx", import.meta.url), "utf8")
const canvas = readFileSync(new URL("../DashboardCanvas.tsx", import.meta.url), "utf8")
const mobile = readFileSync(new URL("../widgetMobileContract.css", import.meta.url), "utf8")
const reference = readFileSync(new URL("../widgets/UIReferenceLibraryWidget.tsx", import.meta.url), "utf8")
const registry = readFileSync(new URL("../WidgetRegistryBase.ts", import.meta.url), "utf8")
const mobileControls = shell.slice(shell.indexOf('className={cn("widget-mobile-control-row"'))

describe("mobile widget control refinements", () => {
  it("uses expressive icon-only geometry controls and disables width changes on phones", () => {
    expect(shell).toContain("PanelTopOpen")
    expect(shell).toContain('aria-label="Decrease widget width"')
    expect(shell).toContain('aria-label="Increase widget width"')
    expect(shell).toContain('aria-label="Decrease widget height"')
    expect(shell).toContain('aria-label="Increase widget height"')
    expect(shell).toContain("widget-mobile-icon-pair")
    expect(mobileControls).not.toContain('>W−</button>')
    expect(mobileControls).not.toContain('>W+</button>')
    expect(mobileControls).not.toContain('>H−</button>')
    expect(mobileControls).not.toContain('>H+</button>')
    expect(shell).toMatch(/aria-label="Decrease widget width"[^>]*disabled/)
    expect(shell).toMatch(/aria-label="Increase widget width"[^>]*disabled/)
  })

  it("replaces mobile dragging with one-step move controls that preserve viewport position", () => {
    expect(shell).toContain('aria-label="Move widget up one position"')
    expect(shell).toContain('aria-label="Move widget down one position"')
    expect(shell).not.toContain('className="widget-mobile-square-control cursor-grab')
    expect(canvas).toContain("moveWidgetByStep")
    expect(canvas).toContain("getBoundingClientRect().top")
    expect(canvas).toContain("window.scrollBy")
  })

  it("keeps the mobile dashboard on the real viewport width after field QA exposed reclaim overshoot", () => {
    expect(mobile).not.toContain("--vt-mobile-reclaim-left")
    expect(mobile).not.toContain("--vt-mobile-reclaim-right")
    expect(mobile).toContain("width: 100%;")
    expect(mobile).toContain("max-width: 100%;")
    expect(mobile).toContain("margin-inline: 0;")
  })
})

describe("UI Reference Library paging", () => {
  it("renders one reference section at a time without an ALL mode", () => {
    expect(reference).not.toContain('| "all"')
    expect(reference).not.toContain('useState<ReferenceCategory>("all")')
    expect(reference).not.toContain('{ id: "all", label: "ALL" }')
    expect(reference).not.toContain('activeCategory === "all" ||')
    expect(reference).toContain("REFERENCE_CATEGORIES")
  })

  it("caps the reference library at the dashboard maximum height bucket", () => {
    const definition = registry.slice(registry.indexOf('id: "ui-reference-library"'), registry.indexOf('id: "video-autopsy"'))
    expect(definition).toContain('defaultHeight: "massive"')
    expect(definition).toContain('maxHeight: "massive"')
  })
})
