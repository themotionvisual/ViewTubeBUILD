import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { DASHBOARD_WIDGET_BY_ID } from "../WidgetRegistry"
import { DASHBOARD_WIDGET_RENDERER_KEYS } from "../WidgetRenderer"

const renderer = readFileSync(new URL("../WidgetRendererBase.tsx", import.meta.url), "utf8")
const widget = readFileSync(new URL("../widgets/SettingsWidget.tsx", import.meta.url), "utf8")
const css = readFileSync(new URL("../widgets/SettingsWidget.css", import.meta.url), "utf8")
const shell = readFileSync(new URL("../WidgetShell.tsx", import.meta.url), "utf8")
const previewFixtures = readFileSync(new URL("../widgetPreviewFixtures.ts", import.meta.url), "utf8")

describe("Settings dashboard control switchboard", () => {
  it("owns Settings in a dedicated lazy widget instead of the inline base renderer", () => {
    expect(renderer).toContain('"system-micro-stack": React.lazy(() => import("./widgets/SettingsWidget")')
    expect(renderer).not.toContain('if (widget.id === "system-micro-stack")')
    expect(DASHBOARD_WIDGET_RENDERER_KEYS.has("system-micro-stack")).toBe(true)
  })

  it("provides the four control-room pages from the living master plan", () => {
    expect(widget).toContain('"dashboard"')
    expect(widget).toContain('"data"')
    expect(widget).toContain('"ai"')
    expect(widget).toContain('"account"')
    expect(widget).toContain("DASHBOARD")
    expect(widget).toContain("DATA")
    expect(widget).toContain("AI")
    expect(widget).toContain("ACCOUNT")
    expect(widget).toContain("WidgetHeaderStepper")
  })

  it("retains existing settings actions while exposing current dashboard state", () => {
    expect(widget).toContain("SHOW ALL WIDGETS")
    expect(widget).toContain("DASHBOARD CONTROLS")
    expect(widget).toContain("SYNC NOW")
    expect(widget).toContain("CONNECT")
    expect(widget).toContain("BILLING")
    expect(widget).toContain("USER GUIDE")
    expect(widget).toContain("REGISTERED")
    expect(widget).toContain("FOCUS")
    expect(widget).toContain("CREATION")
    expect(widget).toContain("ANALYTICS")
    expect(widget).toContain("EXPORT")
    expect(widget).toContain("IMPORT")
    expect(widget).toContain("RESET LAYOUT")
    expect(widget).toContain("CONFIRM RESET")
    expect(widget).toContain("CANCEL RESET")
    expect(widget).toContain("LAYOUT LOCK")
  })

  it("distinguishes disconnected, never-synced, stale and current data states", () => {
    expect(widget).toContain("DISCONNECTED")
    expect(widget).toContain("NEVER SYNCED")
    expect(widget).toContain("STALE")
    expect(widget).toContain("CURRENT")
    expect(widget).toContain("ERROR")
    expect(widget).toContain("SOURCE HEALTH")
    expect(widget).toContain("DATA SOURCE ISSUE")
  })

  it("shows an honest generic preview when no channel is connected", () => {
    expect(widget).toContain("WidgetPreviewState")
    expect(widget).toContain("SETTINGS_DATA_PREVIEW_ITEMS")
    expect(widget).toContain("SETTINGS_AI_PREVIEW_ITEMS")
    expect(previewFixtures).toContain("EXAMPLE CHANNEL")
    expect(previewFixtures).toContain("EXAMPLE ANALYTICS")
    expect(widget).toContain("Connect to personalize")
    expect(previewFixtures).toContain("EXAMPLE EVIDENCE")
    expect(previewFixtures).toContain("EXAMPLE ADVICE")
    expect(previewFixtures).toContain("EXAMPLE PROJECT CONTEXT")
    expect(widget).toContain('aria-label="Settings data preview"')
    expect(widget).toContain('aria-label="Settings AI preview"')
  })

  it("defines compact, standard and wide container layouts for Settings", () => {
    expect(css).toContain("@container vt-widget (max-width:420px)")
    expect(css).toContain("@container vt-widget (min-width:421px) and (max-width:760px)")
    expect(css).toContain("@container vt-widget (min-width:761px)")
    expect(css).toContain(".settings-switchboard-preview-grid")
    expect(css).toContain(".settings-switchboard-issue")
  })

  it("uses canonical account and entitlement owners rather than the legacy plan cache", () => {
    expect(widget).toContain("useUnifiedAccount")
    expect(widget).toContain("getCurrentEntitlement")
    expect(widget).not.toContain("vt_last_plan")
  })

  it("uses canonical widget primitives and no authored black styling", () => {
    expect(widget).toContain("WidgetSizedButton")
    expect(widget).toContain("WidgetToggleSwitch")
    expect(widget).toContain("WidgetBadge")
    expect(widget).toContain("WidgetProgressBar")
    expect(widget).not.toContain('border: "2px solid #000"')
    expect(widget).not.toContain('background: "#fff"')
    expect(css).not.toContain("#000")
  })

  it("removes the old Settings-only shell injection now that Settings owns its controls", () => {
    expect(shell).not.toContain('widget.id==="system-micro-stack"')
    expect(shell).not.toContain("handleShowAllWidgets")
  })

  it("keeps Settings supported and vertically resizable", () => {
    const definition = DASHBOARD_WIDGET_BY_ID["system-micro-stack"]
    expect(definition?.releaseTier).toBe("supported")
    expect(definition?.supportedHeights.length).toBeGreaterThan(1)
  })
})
