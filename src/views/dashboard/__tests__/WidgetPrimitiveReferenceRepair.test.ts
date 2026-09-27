import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const fieldCss = readFileSync(new URL("../widgetFieldAndVideoRepair.css", import.meta.url), "utf8")
const variantsCss = readFileSync(new URL("../widgetPrimitiveVariants.css", import.meta.url), "utf8")
const matrixCss = readFileSync(new URL("../widgetMatrixPrimitives.css", import.meta.url), "utf8")
const compoundCss = readFileSync(new URL("../widgetCompoundPrimitives.css", import.meta.url), "utf8")
const exactCss = readFileSync(new URL("../widgetPrimitiveExactHeights.css", import.meta.url), "utf8")
const toolboxCss = readFileSync(new URL("../toolboxWidgetSystem.css", import.meta.url), "utf8")
const extensionSource = readFileSync(new URL("../WidgetPrimitiveExtensions.tsx", import.meta.url), "utf8")
const referenceSource = readFileSync(new URL("../widgets/UIReferenceLibraryWidget.tsx", import.meta.url), "utf8")

describe("canonical widget field states", () => {
  it("uses a light palette tint at rest and a white glowing focus surface for input, textarea and split search", () => {
    expect(fieldCss).toContain("background: color-mix(in srgb, var(--widget-color) 8%, white) !important")
    expect(fieldCss).toContain("background: #fff !important")
    expect(fieldCss).toContain("0 0 0 3px var(--widget-field-focus-ring)")
    expect(fieldCss).toContain("0 0 16px 2px var(--widget-field-focus-glow)")
    expect(matrixCss).toContain("background: color-mix(in srgb, var(--widget-color, #34cdea) 8%, white)")
    expect(matrixCss).toContain("background: #fff !important")
    expect(variantsCss).not.toContain("background: color-mix(in srgb, var(--widget-color, #fff) 18%, white) !important")
  })

  it("keeps the split-search divider on exactly the same resting/focus stroke as the outside border", () => {
    expect(fieldCss).toContain("border-inline-end-color: var(--widget-field-rest-stroke)")
    expect(fieldCss).toContain("border-inline-end-color: var(--widget-field-focus-border)")
  })
})

describe("video split-left selector geometry", () => {
  it("keeps the portalled menu exactly the trigger width and uses the canonical default search field", () => {
    expect(extensionSource).not.toContain("VIDEO_MENU_MIN_WIDTH")
    expect(extensionSource).toContain("const width=rect.width")
    expect(extensionSource).toContain('height={height} tone="default"')
    expect(extensionSource).not.toContain('widget-video-select-menu-search-row" height={height} tone="primary"')
  })

  it("lets the open menu search span the full menu without clipping or private zero-border focus styling", () => {
    expect(fieldCss).toContain(".widget-video-select-menu.is-portalled .widget-video-select-search")
    expect(fieldCss).toContain("padding: 0")
    expect(variantsCss).not.toContain(".widget-video-select.is-open .widget-video-select-menu-search-row:focus-within {\n  border: 0")
  })
})

describe("reference compound geometry and ink", () => {
  it("rounds data/calendar grids with the canonical widget component radius", () => {
    expect(compoundCss).toContain(".widget-data-grid{")
    expect(compoundCss).toContain("border-radius:var(--widget-control-radius,8px)")
    expect(compoundCss).toContain(".widget-calendar-grid{")
  })

  it("keeps checklist, grids, mini video modules, section bars and preview state on VT ink", () => {
    for (const selector of [
      ".widget-section-band",
      ".widget-data-grid",
      ".widget-checklist-progress-row",
      ".widget-calendar-grid",
      ".widget-video-mini-card",
      ".widget-preview-state",
    ]) expect(compoundCss).toContain(selector)
    expect(compoundCss).toContain("color:var(--vt-ink")
    expect(compoundCss).not.toMatch(/(?:color|border-color):\s*(?:#000(?:000)?\b|black\b)/i)
  })
})

describe("UI Reference Library restoration", () => {
  it("restores sections 6 through 8 and removes the detached section 9 header-control page", () => {
    expect(referenceSource).toContain('id: "navigation", label: "NAV"')
    expect(referenceSource).toContain('id: "states", label: "STATES"')
    expect(referenceSource).toContain('id: "header-modules", label: "HEADER MODULES"')
    expect(referenceSource).toContain('sectionHeading("6. Navigation"')
    expect(referenceSource).toContain('sectionHeading("7. Metrics + States"')
    expect(referenceSource).toContain('sectionHeading("8. Header Controls in Modules"')
    expect(referenceSource).not.toContain('sectionHeading("9. Header Controls"')
  })

  it("keeps header controls demonstrated inside real module headers", () => {
    expect(referenceSource).toContain('title="Channel Overview"')
    expect(referenceSource).toContain('title="Comment Responder"')
    expect(referenceSource).toContain('title="Publishing Workflow"')
    expect(referenceSource).toContain('title="Auto Chapters"')
    expect(referenceSource).toContain('title="Embed Permission"')
  })

  it("uses a compact editable-tag treatment rather than the full disclosure geometry", () => {
    expect(referenceSource).toContain("widget-reference-editable-tags")
    expect(variantsCss).toContain(".widget-reference-editable-tags .widget-control-disclosure summary")
    expect(variantsCss).toContain("height: 24px")
  })
})

describe("badge, toast and media-frame repair", () => {
  it("gives larger badge heights proportionally stronger text", () => {
    expect(exactCss).toContain(".vt-spectrum-badge.is-height-24")
    expect(exactCss).toContain("font-size:18px")
    expect(exactCss).toContain(".vt-spectrum-badge.is-height-32")
    expect(exactCss).toContain("font-size:24px")
    expect(exactCss).toContain(".vt-spectrum-badge.is-height-38")
    expect(exactCss).toContain("font-size:30px")
  })

  it("defines spectrum ink for toasts as well as split-left and fill badges", () => {
    expect(matrixCss).toContain('.widget-toast[class*="is-spectrum-"]')
    expect(matrixCss).toContain("--widget-spectrum-ink: color-mix")
    expect(matrixCss).toContain("--widget-toast-ink: var(--widget-spectrum-ink)")
  })

  it("uses real 1:1 and 16:9 media frames with integrated compact actions", () => {
    expect(toolboxCss).toContain(".widget-media-upload.is-aspect-square .widget-media-upload-frame")
    expect(toolboxCss).toContain("aspect-ratio: 1 / 1")
    expect(toolboxCss).toContain(".widget-media-upload.is-aspect-video .widget-media-upload-frame")
    expect(toolboxCss).toContain("aspect-ratio: 16 / 9")
    expect(toolboxCss).toContain("position: absolute")
  })
})
