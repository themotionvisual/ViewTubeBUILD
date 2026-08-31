import { describe, expect, it } from "vitest"

import {
 describeWeeklySource,
 rollupDailyFromDaily,
 rollupMonthlyChannelWithSource,
 rollupWeeklyChannelWithSource,
} from "./dataBridge"

describe("Daily Stats channel rollups", () => {
 it("builds channel-wide weekly and monthly series from Daily Stats", () => {
  const dailyStats = [
   { date: "2026-08-03", views: 10, subscribersGained: 2, subscribersLost: 1, watchTime: 1 },
   { date: "2026-08-04", views: 20, subscribersGained: 3, subscribersLost: 1, watchTime: 2 },
  ]

  const weekly = rollupWeeklyChannelWithSource(dailyStats, 4)
  const monthly = rollupMonthlyChannelWithSource(dailyStats, 4)

  expect(weekly.source).toBe("daily_metrics")
  expect(weekly.weeks).toContainEqual(expect.objectContaining({ views: 30, subs: 3, watchMins_hrs: 3 }))
  expect(monthly.source).toBe("daily_metrics")
  expect(monthly.months).toContainEqual(expect.objectContaining({ views: 30, subs: 3, watchHrs: 3 }))
 })

 it("keeps the selected recent daily calendar window without inventing zero days", () => {
  const dailyStats = [
   { date: "2026-08-01", views: 10, watchTime: 1 },
   { date: "2026-08-10", views: 20, watchTime: 2 },
   { date: "2026-08-12", views: 30, watchTime: 3 },
  ]

  expect(rollupDailyFromDaily(dailyStats, 7)).toEqual([
   expect.objectContaining({ date: "2026-08-10", views: 20, watchHrs: 2 }),
   expect.objectContaining({ date: "2026-08-12", views: 30, watchHrs: 3 }),
  ])
 })

 it("prefers the direct Monthly Stats table when it is available", () => {
  const dailyStats = [{ date: "2026-08-03", views: 10 }]
  const monthlyStats = [{ date: "2026-08", views: 500, watchTime: 12 }]

  const result = rollupMonthlyChannelWithSource(dailyStats, monthlyStats, 3)

  expect(result.source).toBe("monthly_metrics")
  expect(result.months).toContainEqual(expect.objectContaining({ monthKey: "2026-08", views: 500, watchHrs: 12 }))
 })

 it("reports unavailable instead of borrowing another dataset", () => {
  expect(rollupWeeklyChannelWithSource([], 12)).toEqual({ source: "none", weeks: [] })
  expect(rollupMonthlyChannelWithSource([], 12)).toEqual({ source: "none", months: [] })
  expect(describeWeeklySource("none")).toBe("DAILY STATS UNAVAILABLE")
 })
})
