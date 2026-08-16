import { readFileSync, readdirSync } from "node:fs"
import { describe, expect, it } from "vitest"

const widgetSystemCss = readFileSync(
  new URL("../toolboxWidgetSystem.css", import.meta.url),
  "utf8",
)
const widgetScrollbarCss = readFileSync(
  new URL("../widgetScrollbar.css", import.meta.url),
  "utf8",
)
const dailyOracleSource = readFileSync(new URL("../widgets/DailyOracleWidget.tsx", import.meta.url), "utf8")
const aiJournalSource = readFileSync(new URL("../widgets/AIJournalWidget.tsx", import.meta.url), "utf8")
const imageGeneratorSource = readFileSync(new URL("../widgets/ImageGeneratorWidget.tsx", import.meta.url), "utf8")
const dataEditSource = readFileSync(new URL("../widgets/DataEditWidget.tsx", import.meta.url), "utf8")
const keywordEngineSource = readFileSync(new URL("../widgets/KeywordEngineWidget.tsx", import.meta.url), "utf8")
const commentResponderSource = readFileSync(new URL("../widgets/CommentReplyWidget.tsx", import.meta.url), "utf8")
const widgetRendererSource = readFileSync(new URL("../WidgetRenderer.tsx", import.meta.url), "utf8")

describe("dashboard widget control rhythm", () => {
  it("defines one desktop and mobile geometry plus one control text treatment", () => {
    expect(widgetSystemCss).toContain("--widget-control-height: 32px;")
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
    expect(widgetSystemCss).toContain("min-height: var(--widget-control-height);")
    expect(widgetSystemCss).toContain("font-size: var(--widget-control-font-size, 12px) !important;")
  })
})

describe("dashboard widget scrollbar contract", () => {
  it("uses one spectrum-aware viewport-map geometry", () => {
    expect(widgetScrollbarCss).toContain("--widget-scroll-lane: 21px;")
    expect(widgetScrollbarCss).toContain("--widget-scroll-visual-width: 18px;")
    expect(widgetScrollbarCss).toContain("--widget-scroll-edge: 3px;")
    expect(widgetScrollbarCss).toContain("--widget-scroll-fill: color-mix(in srgb, var(--widget-color) 75%, transparent);")
    expect(widgetScrollbarCss).toContain("--widget-scroll-ink: var(--widget-border);")
    expect(widgetScrollbarCss).toContain(".dashboard-barrier .widget-scroll-controller")
    expect(widgetScrollbarCss).toContain(".dashboard-barrier .widget-scroll-visual")
    expect(widgetScrollbarCss).toContain(".dashboard-barrier .widget-scroll-segment")
    expect(widgetScrollbarCss).toContain("width: 44px;")
    expect(widgetScrollbarCss).toContain("background: #fff;")
    expect(widgetScrollbarCss).toContain("border: 2px solid var(--widget-scroll-ink);")
  })

  it("hides native desktop chrome but preserves native forced-colors behavior", () => {
    expect(widgetScrollbarCss).toContain("scrollbar-width: none;")
    expect(widgetScrollbarCss).toContain(".widget-scroll-viewport::-webkit-scrollbar")
    expect(widgetScrollbarCss).not.toContain("scrollbar-gutter: stable;")
    expect(widgetScrollbarCss).toContain("@media (forced-colors: active)")
    expect(widgetScrollbarCss).toContain("scrollbar-width: auto;")
    expect(widgetScrollbarCss).toContain("@media (pointer: coarse), (max-width: 767px)")
  })

  it("keeps shell scrolling and full-bleed geometry out of widget-local implementations", () => {
    const widgetsUrl = new URL("../widgets/", import.meta.url)
    const sources = readdirSync(widgetsUrl)
      .filter((file) => file.endsWith(".tsx"))
      .map((file) => [file, readFileSync(new URL(file, widgetsUrl), "utf8")] as const)
    sources.push(["WidgetRenderer.tsx", readFileSync(new URL("../WidgetRenderer.tsx", import.meta.url), "utf8")])

    const forbidden = [
      /::-webkit-scrollbar/,
      /scrollbar-width/,
      /overflow-y-auto/,
      /overflowY:\s*["']auto["']/,
      /marginLeft:\s*["']-10px["']/,
      /width:\s*["']calc\(100% \+ 20px\)["']/,
    ]

    for (const [file, source] of sources) {
      for (const pattern of forbidden) expect(source, `${file} contains ${pattern}`).not.toMatch(pattern)
    }
  })
})

describe("widget uniformity migrations", () => {
  it("removes the Daily Oracle promotional heading and upgrade row", () => {
    expect(dailyOracleSource).not.toContain("Strategic Priorities")
    expect(dailyOracleSource).not.toContain("Upgrade for Oracle AI")
  })

  it("routes redesigned controls through shared primitives and classes", () => {
    expect(aiJournalSource).toContain("ai-journal-category-grid")
    expect(aiJournalSource).toContain("ai-journal-card")
    expect(imageGeneratorSource).toContain("headerContent={templateToggle}")
    expect(imageGeneratorSource).toContain("image-generator-style-grid")
    expect(imageGeneratorSource).toContain("image-generator-copy-grid")
    expect(imageGeneratorSource).toContain("image-generator-preview")
    expect(dataEditSource).toContain('aria-label="Search published videos"')
    expect(dataEditSource).toContain('className="vt-input"')
    expect(dataEditSource).toContain("<WidgetSplitButton")
    expect(keywordEngineSource).toContain("keyword-engine-bar-fill")
    expect(widgetRendererSource).toContain("channel-overview-main")
    expect(commentResponderSource).toContain('enabled={tab === "history"}')
    expect(commentResponderSource).toContain("comment-responder-footer-actions")
    expect(dailyOracleSource).toContain("daily-oracle-list")
    expect(dailyOracleSource).not.toContain("<WidgetScrollArea")
  })
})
