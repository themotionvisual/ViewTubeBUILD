import { describe, expect, it } from "vitest"
import { DASHBOARD_WIDGET_BY_ID } from "../WidgetRegistry"
import {
  buildDefaultDashboardLayout,
  revealRedesignedDashboardWidgets,
} from "../storage"

const REDESIGNED_WIDGET_IDS = [
  "daily-oracle",
  "brain-hub",
  "flight-check",
  "next-best-action",
  "anomaly-radar",
  "opportunity-radar",
  "content-pipeline",
  "audience-requests",
  "video-asset-engine",
  "video-director",
] as const

describe("redesigned dashboard widget visibility", () => {
  it("registers every redesigned widget as a rendered dashboard owner", () => {
    for (const id of REDESIGNED_WIDGET_IDS) {
      expect(DASHBOARD_WIDGET_BY_ID[id], id).toBeTruthy()
      expect(DASHBOARD_WIDGET_BY_ID[id]?.status, id).toBe("ready")
      expect(DASHBOARD_WIDGET_BY_ID[id]?.releaseTier, id).not.toBe("hidden")
    }
  })

  it("shows every redesigned widget in a fresh dashboard layout", () => {
    const layout = buildDefaultDashboardLayout()
    for (const id of REDESIGNED_WIDGET_IDS) {
      expect(layout.order, id).toContain(id)
      expect(layout.hidden, id).not.toContain(id)
    }
  })

  it("reveals redesigned widgets even when an older saved layout hid them", () => {
    const layout = buildDefaultDashboardLayout()
    const hidden = [...layout.hidden, ...REDESIGNED_WIDGET_IDS]
    const migrated = revealRedesignedDashboardWidgets({ ...layout, hidden })

    for (const id of REDESIGNED_WIDGET_IDS) {
      expect(migrated.hidden, id).not.toContain(id)
    }
  })
})
