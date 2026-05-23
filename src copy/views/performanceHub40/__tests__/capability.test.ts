import { describe, expect, it } from "vitest"
import { evaluateChartCapability40 } from "../capability"
import { CHART_SPECS_40 } from "../chartSpec40"
import type { CanonicalAnalyticsView } from "../../referenceStudio/useCanonicalAnalytics"

const analyticsMock = (overrides?: Partial<CanonicalAnalyticsView>): CanonicalAnalyticsView => ({
  rows: [],
  summary: {
    totals: {
      views: 1000,
      watchHours: 500,
      revenue: 100,
      subscribersGained: 20,
      likes: 100,
      comments: 40,
      shares: 12,
      impressions: 3000,
      engagedViews: 600,
    },
    averages: {
      ctr: 4.2,
      avd: 95,
      avp: 56,
      cpm: 0,
      rpm: 0,
      engagementRate: 0,
    },
    deltas: {},
    window: "28d",
    sourceMode: "api",
    rowCount: 0,
  } as any,
  topRows: [
    {
      id: "a",
      title: "A",
      format: "long-form",
      views: 1000,
      likes: 100,
      comments: 40,
      shares: 12,
      watchHours: 500,
      subscribers: 20,
      revenue: 100,
      ctr: 4.2,
      avp: 56,
    },
  ],
  formatBreakdown: [{ name: "long-form", value: 1000 }],
  timelineSeries: [{ date: "2026-04-01", views: 1000, watchHours: 500, revenue: 100, subscribers: 20 }],
  ...overrides,
})

describe("evaluateChartCapability40", () => {
  it("marks charts ready when hard/soft metrics exist", () => {
    const chart = CHART_SPECS_40.find((entry) => entry.id === "video-value-matrix")
    if (!chart) throw new Error("Missing chart")
    const status = evaluateChartCapability40(chart, analyticsMock())
    expect(status.readiness).toBe("ready")
  })

  it("marks limited when hard metrics exist but soft metrics missing", () => {
    const chart = CHART_SPECS_40.find((entry) => entry.id === "device-immersion-mini")
    if (!chart) throw new Error("Missing chart")
    const status = evaluateChartCapability40(chart, analyticsMock({ topRows: [] }))
    expect(status.readiness).toBe("unavailable")
  })

  it("marks unavailable when hard metrics are missing", () => {
    const chart = CHART_SPECS_40.find((entry) => entry.id === "views-revenue-dual")
    if (!chart) throw new Error("Missing chart")
    const status = evaluateChartCapability40(
      chart,
      analyticsMock({
        summary: {
          ...(analyticsMock().summary as any),
          totals: { ...(analyticsMock().summary as any).totals, views: 0 },
        } as any,
      }),
    )
    expect(status.readiness).toBe("unavailable")
  })
})

