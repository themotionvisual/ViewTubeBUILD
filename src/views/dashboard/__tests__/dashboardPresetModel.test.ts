import { describe, expect, it } from "vitest"
import { resolveDashboardPresetVisibleIds } from "../dashboardPresetModel"

const widgets = [
  { id: "kpi-cluster", category: "core" },
  { id: "daily-oracle", category: "ai" },
  { id: "system-micro-stack", category: "system" },
  { id: "video-uploader", category: "creation" },
  { id: "shorts-multiplier", category: "creation" },
  { id: "traffic-sources", category: "analytics" },
  { id: "realtime-performance", category: "analytics" },
  { id: "community-post", category: "creation" },
] as const

describe("dashboard preset model", () => {
  it("keeps the focused command-center set concise and includes Settings", () => {
    const visible = resolveDashboardPresetVisibleIds(widgets, "focus")
    expect(visible).toContain("kpi-cluster")
    expect(visible).toContain("daily-oracle")
    expect(visible).toContain("system-micro-stack")
    expect(visible).toContain("realtime-performance")
    expect(visible).not.toContain("video-uploader")
  })

  it("shows creation widgets plus Settings for the creation preset", () => {
    expect(resolveDashboardPresetVisibleIds(widgets, "creation")).toEqual([
      "system-micro-stack",
      "video-uploader",
      "shorts-multiplier",
      "community-post",
    ])
  })

  it("shows analytics widgets plus Settings for the analytics preset", () => {
    expect(resolveDashboardPresetVisibleIds(widgets, "analytics")).toEqual([
      "system-micro-stack",
      "traffic-sources",
      "realtime-performance",
    ])
  })

  it("shows every registry widget for the all preset", () => {
    expect(resolveDashboardPresetVisibleIds(widgets, "all")).toEqual(widgets.map((widget) => widget.id))
  })
})
