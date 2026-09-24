import { describe, expect, it } from "vitest"

import {
  filterDashboardWidgetSettings,
  getManageableDashboardWidgets,
  summarizeDashboardWidgetVisibility,
  type DashboardWidgetSettingsEntry,
} from "./dashboardWidgetSettingsModel"

const WIDGETS: DashboardWidgetSettingsEntry[] = [
  {
    id: "core-ready",
    title: "Core Ready",
    subtitle: "Primary summary",
    category: "core",
    releaseTier: "supported",
    status: "ready",
    defaultOrder: 2,
    headerColor: "#fff",
  },
  {
    id: "ai-preview",
    title: "AI Preview",
    subtitle: "Experimental helper",
    category: "ai",
    releaseTier: "preview",
    status: "prototype",
    defaultOrder: 1,
    headerColor: "#fff",
  },
  {
    id: "hidden",
    title: "Hidden",
    subtitle: "Do not manage",
    category: "system",
    releaseTier: "hidden",
    status: "ready",
    defaultOrder: 0,
    headerColor: "#fff",
  },
]

describe("dashboard widget settings model", () => {
  it("excludes hidden release-tier widgets and preserves default order", () => {
    expect(getManageableDashboardWidgets(WIDGETS).map((widget) => widget.id)).toEqual([
      "ai-preview",
      "core-ready",
    ])
  })

  it("filters by category and searchable copy", () => {
    const manageable = getManageableDashboardWidgets(WIDGETS)
    expect(filterDashboardWidgetSettings(manageable, "ai", "")).toHaveLength(1)
    expect(filterDashboardWidgetSettings(manageable, "all", "summary").map((widget) => widget.id)).toEqual([
      "core-ready",
    ])
  })

  it("reports visible and preview counts from the same manageable set", () => {
    expect(summarizeDashboardWidgetVisibility(getManageableDashboardWidgets(WIDGETS), ["ai-preview"])).toEqual({
      total: 2,
      visible: 1,
      preview: 1,
    })
  })
})
