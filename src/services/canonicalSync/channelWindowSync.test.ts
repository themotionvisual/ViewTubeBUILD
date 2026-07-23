import { describe, expect, it } from "vitest"
import { resolveChannelPeriodRange } from "./channelWindowSync"
import { sumLastTwoCompleteDaysViews } from "./channelDailySync"
import type { CanonicalChannelDailyRow } from "./contracts"

describe("initial channel bootstrap date boundaries", () => {
 it("builds inclusive nonoverlapping current and previous ranges", () => {
  const endDate = new Date("2026-07-15T00:00:00Z")
  expect(resolveChannelPeriodRange({ window: "7d", period: "current", endDate })).toEqual({
   startDate: "2026-07-09",
   endDate: "2026-07-15",
   coverage: "complete",
  })
  expect(resolveChannelPeriodRange({ window: "7d", period: "previous", endDate })).toEqual({
   startDate: "2026-07-02",
   endDate: "2026-07-08",
   coverage: "complete",
  })
 })

 it("marks a comparison partial when the channel did not yet exist", () => {
  expect(resolveChannelPeriodRange({
   window: "7d",
   period: "previous",
   endDate: new Date("2026-07-15T00:00:00Z"),
   channelPublishedAt: "2026-07-12",
  })).toEqual({
   startDate: "2026-07-12",
   endDate: "2026-07-08",
   coverage: "partial",
  })
 })
})

describe("last two complete days KPI", () => {
 const row = (date: string, views: number | null): CanonicalChannelDailyRow => ({
  channelId: "channel-1",
  date,
  metrics: { views },
  metricMeta: {},
  syncedAt: "2026-07-16T00:00:00Z",
 })

 it("sums the latest two complete rows without using realtime data", () => {
  expect(sumLastTwoCompleteDaysViews([
   row("2026-07-13", 10),
   row("2026-07-15", 30),
   row("2026-07-14", 20),
  ])).toBe(50)
 })

 it("preserves missing coverage rather than manufacturing zero", () => {
  expect(sumLastTwoCompleteDaysViews([row("2026-07-15", 30)])).toBeNull()
  expect(sumLastTwoCompleteDaysViews([
   row("2026-07-15", 30),
   row("2026-07-14", null),
  ])).toBeNull()
 })
})
