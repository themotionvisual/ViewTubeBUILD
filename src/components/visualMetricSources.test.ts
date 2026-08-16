import { describe, expect, it } from "vitest"
import {
 buildChannelProgressBuckets,
 buildRelativeChannelProgressHeights,
 buildRelativeChannelProgressSeries,
 buildFormatDominanceContentTypeTotals,
 resolveChannelProgressDailyMetricValue,
} from "./visualMetricSources"

describe("VT-SYNC visual metric source helpers", () => {
 it("always divides Channel Progress windows into 24 stable periods", () => {
  const buckets = buildChannelProgressBuckets([
   { timestamp: 0, value: 2 },
   { timestamp: 50, value: 3 },
   { timestamp: 100, value: 5 },
  ], 0, 100, 24)

  expect(buckets).toHaveLength(24)
  expect(buckets.reduce((sum, bucket) => sum + bucket.periodAmount, 0)).toBe(10)
  expect(buckets[0].hasData).toBe(true)
 expect(buckets[23].hasData).toBe(true)
 })

 it("normalizes each Channel Progress window to a visible 3-100 relative scale", () => {
  const heights = buildRelativeChannelProgressHeights([0, 10, 20, 100])

  expect(heights[0]).toBe(3)
  expect(heights[3]).toBe(100)
  expect(heights[1]).toBeGreaterThan(3)
  expect(heights[1]).toBeLessThan(heights[2])
  expect(heights[2]).toBeLessThan(100)
 })

 it("keeps all 24 empty Channel Progress periods visible without changing raw values", () => {
  const rawValues = Array.from({ length: 24 }, () => 0)
  const heights = buildRelativeChannelProgressHeights(rawValues)

  expect(heights).toHaveLength(24)
  expect(heights.every((height) => height === 3)).toBe(true)
  expect(rawValues.every((value) => value === 0)).toBe(true)
 })

 it("normalizes multi-metric bars and cumulative lines without changing raw values", () => {
  const series = buildRelativeChannelProgressSeries([2, 8, 10])

  expect(series.map((point) => point.rawPeriod)).toEqual([2, 8, 10])
  expect(series.map((point) => point.rawCumulative)).toEqual([2, 10, 20])
  expect(series[2].barPercent).toBe(100)
  expect(series[2].linePercent).toBe(100)
  expect(series[0].barPercent).toBeGreaterThanOrEqual(3)
  expect(series[0].linePercent).toBeGreaterThanOrEqual(3)
 })

 it("preserves signed raw adjustments while clamping only chart geometry", () => {
  const series = buildRelativeChannelProgressSeries([10, -4, 3])

  expect(series.map((point) => point.rawPeriod)).toEqual([10, -4, 3])
  expect(series.map((point) => point.rawCumulative)).toEqual([10, 6, 9])
  expect(series.every((point) => point.barPercent >= 3 && point.linePercent >= 3)).toBe(true)
 })

 it("reads Channel Progress metrics from normalized Daily rows", () => {
  const row = {
   views: 125,
   subscribersGained: 4,
   revenue: 8.5,
   watchTime: 2.25,
  }

  expect(resolveChannelProgressDailyMetricValue(row, "views")).toBe(125)
  expect(resolveChannelProgressDailyMetricValue(row, "subscribersGained")).toBe(4)
  expect(resolveChannelProgressDailyMetricValue(row, "revenue")).toBe(8.5)
  expect(resolveChannelProgressDailyMetricValue(row, "watchHours")).toBe(2.25)
  expect(resolveChannelProgressDailyMetricValue(row, "videoCount")).toBeUndefined()
 })

 it("converts raw daily minutes only when normalized watch hours are absent", () => {
  expect(resolveChannelProgressDailyMetricValue({ estimatedMinutesWatched: 150 }, "watchHours")).toBe(2.5)
  expect(resolveChannelProgressDailyMetricValue({}, "watchHours")).toBeUndefined()
 })

 it("uses Creator Content Type rows for every Format Dominance metric", () => {
  const totals = buildFormatDominanceContentTypeTotals([
   { creatorContentType: "SHORTS", views: 100, watchTime: 5, revenue: 7, subscribersGained: 3 },
   { creatorContentType: "VIDEO_ON_DEMAND", views: 250, watchTime: 20, revenue: 30, subscribersGained: 8 },
  ])

  expect(totals.views).toEqual({ shorts: 100, long: 250 })
  expect(totals.watchHours).toEqual({ shorts: 5, long: 20 })
  expect(totals.revenue).toEqual({ shorts: 7, long: 30 })
  expect(totals.subscribersGained).toEqual({ shorts: 3, long: 8 })
 })

 it("preserves legitimate zeroes and leaves unavailable metrics missing", () => {
  const totals = buildFormatDominanceContentTypeTotals([
   { creatorContentType: "SHORTS", views: 0 },
  ])

  expect(totals.views.shorts).toBe(0)
  expect(totals.revenue.shorts).toBeUndefined()
 })
})
