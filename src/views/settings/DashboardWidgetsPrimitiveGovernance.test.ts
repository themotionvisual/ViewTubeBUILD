import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const source = readFileSync(new URL("./DashboardWidgetsSettingsSection.tsx", import.meta.url), "utf8")

describe("Dashboard Widgets Settings primitive governance", () => {
  it("uses canonical settings primitives instead of bespoke widget cards", () => {
    expect(source).toContain("SubToolbox")
    expect(source).toContain("SubToolboxSettingsSwitch")
    expect(source).toContain("SubToolboxStatusBadge")
    expect(source).toContain("StudioSearchInput")
    expect(source).not.toContain("rounded-[20px]")
    expect(source).not.toContain("xl:grid-cols-3")
    expect(source).not.toContain("buttonClass")
  })

  it("keeps visibility management separate from dashboard rendering", () => {
    expect(source).toContain("DASHBOARD_WIDGET_REGISTRY")
    expect(source).not.toContain("WidgetRenderer")
    expect(source).not.toContain("ResponsiveContainer")
  })
})
