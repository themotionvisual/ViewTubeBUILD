import { describe, expect, it } from "vitest"
import {
  applyDashboardVisibilityChanges,
  buildDashboardMiniLayout,
  canResizeDashboardWidget,
  dashboardSizeColumnSpan,
  getDashboardResizedInstance,
  getDashboardMoveTarget,
  moveDashboardWidgetOrder,
} from "../dashboardMiniLayout"
import type { DashboardLayoutState, DashboardSizeBucket, WidgetInstanceState } from "../types"

const instance = (
  size: DashboardSizeBucket,
  collapsed = false,
): WidgetInstanceState => ({
  collapsed,
  size,
  height: "medium",
})

const createLayout = (
  order: string[],
  sizes: DashboardSizeBucket[],
  hidden: string[] = [],
  locked = false,
): DashboardLayoutState => ({
  schemaVersion: 10,
  locked,
  order,
  hidden,
  instances: Object.fromEntries(order.map((id, index) => [id, instance(sizes[index] || "quarter")])),
})

describe("dashboard miniature layout geometry", () => {
  it("maps every dashboard width bucket to its canonical 24-column span", () => {
    expect([
      "eighth",
      "sixth",
      "quarter",
      "companion",
      "third",
      "between",
      "half",
      "two-thirds",
      "three-quarters",
      "full",
    ].map((size) => dashboardSizeColumnSpan(size as DashboardSizeBucket))).toEqual([
      3, 4, 6, 7, 8, 10, 12, 16, 18, 24,
    ])
  })

  it("packs thirds and full-width widgets into the same rows as the dashboard canvas", () => {
    const layout = createLayout(
      ["kpi-cluster", "community-post", "comment-replier", "dashboard-controls"],
      ["third", "third", "third", "full"],
    )

    const geometry = buildDashboardMiniLayout(layout)

    expect(geometry.rows.map((row) => row.map((item) => [item.widgetId, item.columnStart, item.columnSpan]))).toEqual([
      [
        ["kpi-cluster", 0, 8],
        ["community-post", 8, 8],
        ["comment-replier", 16, 8],
      ],
      [["dashboard-controls", 0, 24]],
    ])
  })

  it("targets horizontal neighbors and the nearest horizontal center in adjacent rows", () => {
    const layout = createLayout(
      ["kpi-cluster", "community-post", "comment-replier", "dashboard-controls", "brain-hub"],
      ["third", "third", "third", "half", "half"],
    )

    expect(getDashboardMoveTarget(layout, "community-post", "left")).toBe("kpi-cluster")
    expect(getDashboardMoveTarget(layout, "community-post", "right")).toBe("comment-replier")
    expect(getDashboardMoveTarget(layout, "comment-replier", "down")).toBe("brain-hub")
    expect(getDashboardMoveTarget(layout, "brain-hub", "up")).toBe("comment-replier")
  })

  it("moves visible widgets without losing hidden widgets or changing the storage schema", () => {
    const layout = createLayout(
      ["kpi-cluster", "community-post", "comment-replier", "dashboard-controls"],
      ["half", "half", "half", "half"],
      ["dashboard-controls"],
    )

    expect(moveDashboardWidgetOrder(layout, "community-post", "left")).toEqual([
      "community-post",
      "kpi-cluster",
      "comment-replier",
      "dashboard-controls",
    ])
    expect(layout.schemaVersion).toBe(10)
  })

  it("applies staged visibility changes atomically without changing widget order", () => {
    const layout = createLayout(
      ["kpi-cluster", "community-post", "comment-replier", "dashboard-controls"],
      ["quarter", "quarter", "quarter", "quarter"],
      ["comment-replier"],
    )

    const updated = applyDashboardVisibilityChanges(layout, {
      "community-post": true,
      "comment-replier": false,
    })

    expect(updated.order).toEqual(layout.order)
    expect(updated.hidden).toEqual(["community-post"])
    expect(layout.hidden).toEqual(["comment-replier"])
  })

  it("does not move widgets when the layout is locked or a destination does not exist", () => {
    const locked = createLayout(
      ["kpi-cluster", "community-post"],
      ["half", "half"],
      [],
      true,
    )
    const unlocked = { ...locked, locked: false }

    expect(moveDashboardWidgetOrder(locked, "community-post", "left")).toBe(locked.order)
    expect(moveDashboardWidgetOrder(unlocked, "kpi-cluster", "left")).toBe(unlocked.order)
  })

  it("resizes through supported width and height buckets without wrapping at the bounds", () => {
    const widgetId = "community-post"
    const current = instance("third")

    expect(getDashboardResizedInstance(widgetId, current, "wider").size).toBe("between")
    expect(getDashboardResizedInstance(widgetId, current, "thinner").size).toBe("companion")
    expect(getDashboardResizedInstance(widgetId, current, "taller").height).toBe("tall")
    expect(getDashboardResizedInstance(widgetId, current, "shorter").height).toBe("short")

    const maximum = { ...current, size: "full" as const, height: "colossal" as const }
    expect(canResizeDashboardWidget(widgetId, maximum, "wider")).toBe(false)
    expect(canResizeDashboardWidget(widgetId, maximum, "taller")).toBe(false)
    expect(getDashboardResizedInstance(widgetId, maximum, "wider")).toBe(maximum)
    expect(getDashboardResizedInstance(widgetId, maximum, "taller")).toBe(maximum)
  })
})
