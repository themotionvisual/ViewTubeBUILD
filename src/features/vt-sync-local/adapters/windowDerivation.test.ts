import { describe, expect, it } from "vitest"
import {
 aggregateRowsForWindow,
 deriveVtSyncWindowRows,
 filterRowsToRange,
 readRowDateKey,
} from "./windowDerivation"

const day = (date: string, extra: Record<string, unknown> = {}) => ({
 date,
 views: 100,
 watchTime: 10,
 ...extra,
})

describe("readRowDateKey", () => {
 it("accepts the date, day and month shapes the engine stores", () => {
  expect(readRowDateKey({ date: "2026-07-01" })).toBe("2026-07-01")
  expect(readRowDateKey({ day: "2026-07-01" })).toBe("2026-07-01")
  expect(readRowDateKey({ month: "2026-07" })).toBe("2026-07")
  expect(readRowDateKey({})).toBe("")
 })
})

describe("filterRowsToRange", () => {
 const rows = [day("2026-07-01"), day("2026-07-15"), day("2026-07-31")]

 it("is inclusive on both ends", () => {
  expect(filterRowsToRange(rows, "2026-07-01", "2026-07-15")).toHaveLength(2)
 })

 it("excludes rows outside the range", () => {
  expect(filterRowsToRange(rows, "2026-07-10", "2026-07-20")).toHaveLength(1)
 })

 it("drops rows with no usable date key", () => {
  expect(filterRowsToRange([{ views: 5 }], "2026-07-01", "2026-07-31")).toHaveLength(0)
 })

 it("includes a month row when the month overlaps the range", () => {
  expect(filterRowsToRange([{ month: "2026-07", views: 1 }], "2026-07-10", "2026-07-20"))
   .toHaveLength(1)
 })
})

describe("aggregateRowsForWindow", () => {
 it("sums additive metrics", () => {
  const out = aggregateRowsForWindow([
   day("2026-07-01", { views: 100, likes: 5 }),
   day("2026-07-02", { views: 250, likes: 7 }),
  ])
  expect(out.views).toBe(350)
  expect(out.likes).toBe(12)
 })

 it("recomputes a rate from aggregated components, not by averaging rates", () => {
  // Averaging the daily CPMs would give 30; the true period CPM is 20, because
  // the cheap day carried far more impressions.
  const out = aggregateRowsForWindow([
   day("2026-07-01", { grossRevenue: 10, adImpressions: 1000, cpm: 10 }),
   day("2026-07-02", { grossRevenue: 10, adImpressions: 0, cpm: 50 }),
  ])
  expect(out.grossRevenue).toBe(20)
  expect(out.adImpressions).toBe(1000)
  expect(out.cpm).toBe(20)
 })

 it("derives average view duration from totals", () => {
  const out = aggregateRowsForWindow([
   day("2026-07-01", { views: 100, watchTime: 10 }),
   day("2026-07-02", { views: 100, watchTime: 10 }),
  ])
  // 20 hours over 200 views = 360s each
  expect(out.avgViewDuration).toBeCloseTo(360)
 })

 it("derives net subscribers from gained and lost", () => {
  const out = aggregateRowsForWindow([
   day("2026-07-01", { subscribersGained: 10, subscribersLost: 3 }),
   day("2026-07-02", { subscribersGained: 5, subscribersLost: 1 }),
  ])
  expect(out.netSubscribers).toBe(11)
 })

 it("leaves a metric undefined rather than zero when no row carries it", () => {
  const out = aggregateRowsForWindow([{ date: "2026-07-01", views: 10 }])
  expect(out.likes).toBeUndefined()
  expect(out.grossRevenue).toBeUndefined()
 })

 it("returns an empty aggregate for no rows", () => {
  expect(aggregateRowsForWindow([])).toEqual({})
 })
})

describe("deriveVtSyncWindowRows", () => {
 const rows = [
  day("2026-07-10", { views: 10 }),
  day("2026-07-14", { views: 20 }),
  day("2026-07-20", { views: 40 }),
 ]

 it("produces one undimensioned aggregate row tagged with its window", () => {
  const [derived] = deriveVtSyncWindowRows({
   rows,
   window: "7d",
   startDate: "2026-07-08",
   endDate: "2026-07-14",
  })
  expect(derived.views).toBe(30)
  expect(derived.window).toBe("7d")
  expect(derived.sourceRowCount).toBe(2)
 })

 it("returns [] for a window with no coverage — missing is not zero", () => {
  expect(deriveVtSyncWindowRows({
   rows,
   window: "7d",
   startDate: "2025-01-01",
   endDate: "2025-01-07",
  })).toEqual([])
 })

 it("groups a day x dimension dataset into windowed dimension rows", () => {
  const trafficByDay = [
   { date: "2026-07-10", trafficSource: "YT_SEARCH", views: 10 },
   { date: "2026-07-11", trafficSource: "YT_SEARCH", views: 15 },
   { date: "2026-07-11", trafficSource: "SUGGESTED", views: 7 },
   { date: "2026-07-30", trafficSource: "YT_SEARCH", views: 999 },
  ]
  const derived = deriveVtSyncWindowRows({
   rows: trafficByDay,
   window: "28d",
   startDate: "2026-07-01",
   endDate: "2026-07-14",
   groupBy: "trafficSource",
  })
  const search = derived.find((r) => r.trafficSource === "YT_SEARCH")
  const suggested = derived.find((r) => r.trafficSource === "SUGGESTED")
  expect(derived).toHaveLength(2)
  expect(search?.views).toBe(25)
  expect(suggested?.views).toBe(7)
 })

 it("skips rows whose group key is blank", () => {
  const derived = deriveVtSyncWindowRows({
   rows: [{ date: "2026-07-10", trafficSource: "", views: 5 }],
   window: "28d",
   startDate: "2026-07-01",
   endDate: "2026-07-14",
   groupBy: "trafficSource",
  })
  expect(derived).toEqual([])
 })
})
