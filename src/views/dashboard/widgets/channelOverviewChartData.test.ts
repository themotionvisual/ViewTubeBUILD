import { describe, expect, it } from "vitest"
import type { OverviewChartData } from "./channelOverviewChartData"
import { overviewSlices, overviewTraffic } from "./channelOverviewChartData"

const fixture: OverviewChartData = {
 capturedAt: "2026-09-24T00:00:00Z",
 devices: [{ deviceType: "MOBILE", views: 30 }, { deviceType: "COMPUTER", views: 10 }],
 subscriptionStatuses: [{ status: "SUBSCRIBED", views: 60 }, { status: "UNSUBSCRIBED", views: 40 }],
 datasetsByWindow: { "28d": { device_type: [{ deviceType: "MOBILE", views: 9 }, { deviceType: "COMPUTER", views: 1 }], subscription_status: [{ status: "SUBSCRIBED", views: 2 }, { status: "UNSUBSCRIBED", views: 8 }] } },
 trafficByDay: [
  { day: "2026-09-21", term: "YT_SEARCH", views: 3 },
  { day: "2026-09-21", term: "BROWSE", views: 1 },
  { day: "2026-09-22", term: "YT_SEARCH", views: 2 },
  { day: "2026-09-22", term: "BROWSE", views: 2 },
  { day: "2026-09-24", term: "YT_SEARCH", views: 999 }, // incomplete today
 ],
}

describe("Channel Overview composition", () => {
 it("uses matching window aggregates and does not substitute lifetime for an unsupported window", () => {
  expect(overviewSlices(fixture, "devices", 28)[0].share).toBe(90)
  expect(overviewSlices(fixture, "devices", 99999)[0].share).toBe(75)
  expect(overviewSlices(fixture, "audience", 14)).toEqual([])
 })

 it("uses dated counts to normalize traffic share and excludes incomplete dates", () => {
  const result = overviewTraffic(fixture, 7, new Date("2026-09-24T10:00:00Z"))
  expect(result.points).toHaveLength(2)
  expect(result.points.map((point) => point.shares.YT_SEARCH)).toEqual([75, 50])
  result.points.forEach((point) => expect(Object.values(point.shares).reduce((sum, value) => sum + value, 0)).toBeCloseTo(100))
 })

 it("does not present a truncated local preview as a complete time series", () => {
  const compact = { ...fixture, storageMetadata: { storageMode: "compact_preview" as const, isCompacted: true, fullRowCountByField: { trafficByDay: 100 }, visiblePreviewRowCountByField: { trafficByDay: 2 } } }
  expect(overviewTraffic(compact, 28).partial).toBe(true)
  expect(overviewTraffic(compact, 28).points).toEqual([])
 })
})
