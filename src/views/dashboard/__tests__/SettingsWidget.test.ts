import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { DASHBOARD_WIDGET_BY_ID } from "../WidgetRegistry"
import { DASHBOARD_WIDGET_RENDERER_KEYS } from "../WidgetRenderer"

const renderer = readFileSync(new URL("../WidgetRendererBase.tsx", import.meta.url), "utf8")
const widget = readFileSync(new URL("../widgets/SettingsWidget.tsx", import.meta.url), "utf8")
const css = readFileSync(new URL("../widgets/SettingsWidget.css", import.meta.url), "utf8")

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
  })

  it("distinguishes disconnected, never-synced, stale and current data states", () => {
    expect(widget).toContain("DISCONNECTED")
    expect(widget).toContain("NEVER SYNCED")
    expect(widget).toContain("STALE")
    expect(widget).toContain("CURRENT")
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

  it("keeps Settings supported and vertically resizable", () => {
    const definition = DASHBOARD_WIDGET_BY_ID["system-micro-stack"]
    expect(definition?.releaseTier).toBe("supported")
    expect(definition?.supportedHeights.length).toBeGreaterThan(1)
  })
})
