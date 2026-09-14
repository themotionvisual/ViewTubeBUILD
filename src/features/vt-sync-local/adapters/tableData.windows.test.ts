import { describe, expect, it } from "vitest"
import {
 resolveVtSyncTableRowsForWindow,
 vtSyncTableWindowCapability,
} from "./tableData"
import { VT_SYNC_TABLE_DEFINITIONS } from "../upstream/tableRegistry"
import { DEFAULT_VT_SYNC_PRIVACY_FILTERS } from "./privacyPolicy"
import type { VtSyncSnapshot } from "./contracts"
import { resolveWindowRange } from "../../../services/analytics/windows"

const findVtSyncTable = (id: string) => {
 const table = VT_SYNC_TABLE_DEFINITIONS.find((entry) => entry.id === id)
 if (!table) throw new Error(`Unknown table id in test fixture: ${id}`)
 return table
}

const snapshotWith = (overrides: Partial<VtSyncSnapshot>): VtSyncSnapshot => ({
 source: "vt-sync",
 snapshotId: "s1",
 capturedAt: "2026-09-14T00:00:00.000Z",
 videos: [],
 dailyMetrics: [],
 monthlyMetrics: [],
 trafficSources: [],
 trafficDetails: [],
 searchTerms: [],
 demographics: [],
 geography: [],
 devices: [],
 operatingSystems: [],
 deviceOs: [],
 trafficByDay: [],
 playbackLocations: [],
 ...overrides,
} as unknown as VtSyncSnapshot)

describe("table rows per window", () => {
 it("returns the stored lifetime rows unchanged for lifetime", () => {
  const table = findVtSyncTable("geography")
  const snapshot = snapshotWith({ geography: [{ country: "US", views: 1000 }] })
  const result = resolveVtSyncTableRowsForWindow(snapshot, table, "lifetime", DEFAULT_VT_SYNC_PRIVACY_FILTERS)
  expect(result.source).toBe("lifetime")
  expect(result.rows.length).toBeGreaterThan(0)
 })

 it("reports not_synced — never lifetime rows — for an unsynced window", () => {
  // The regression that matters: asking for 28d must not quietly hand back
  // lifetime numbers under a 28d heading.
  const table = findVtSyncTable("geography")
  const snapshot = snapshotWith({ geography: [{ country: "US", views: 1000 }] })
  const result = resolveVtSyncTableRowsForWindow(snapshot, table, "28d", DEFAULT_VT_SYNC_PRIVACY_FILTERS)
  expect(result.source).toBe("not_synced")
  expect(result.rows).toEqual([])
 })

 it("reads real windowed rows when the engine has synced them", () => {
  const table = findVtSyncTable("geography")
  const snapshot = snapshotWith({
   geography: [{ country: "US", views: 1000 }],
   datasetsByWindow: { "28d": { geography_country: [{ country: "US", views: 40 }] } },
  })
  const result = resolveVtSyncTableRowsForWindow(snapshot, table, "28d", DEFAULT_VT_SYNC_PRIVACY_FILTERS)
  expect(result.source).toBe("window_exact")
  expect(result.rows).toHaveLength(1)
  expect(result.rows[0].views).toBe(40)
 })

 it("does not leak one window's rows into another", () => {
  const table = findVtSyncTable("geography")
  const snapshot = snapshotWith({
   geography: [{ country: "US", views: 1000 }],
   datasetsByWindow: { "28d": { geography_country: [{ country: "US", views: 40 }] } },
  })
  expect(resolveVtSyncTableRowsForWindow(snapshot, table, "7d", DEFAULT_VT_SYNC_PRIVACY_FILTERS).source).toBe("not_synced")
  expect(resolveVtSyncTableRowsForWindow(snapshot, table, "90d", DEFAULT_VT_SYNC_PRIVACY_FILTERS).rows).toEqual([])
 })

 it("derives a daily table's window by filtering stored history, at no API cost", () => {
  const range = resolveWindowRange({ window: "7d" })
  const inside = range.endDate
  const outside = "2020-01-01"
  const table = findVtSyncTable("daily")
  const snapshot = snapshotWith({
   dailyMetrics: [
    { date: inside, views: 10 },
    { date: outside, views: 9999 },
   ] as never,
  })
  const result = resolveVtSyncTableRowsForWindow(snapshot, table, "7d", DEFAULT_VT_SYNC_PRIVACY_FILTERS)
  expect(result.source).toBe("derived")
  expect(result.rows).toHaveLength(1)
  expect(result.rows[0].views).toBe(10)
 })

 it("selects the matching row for the pre-windowed channel totals table", () => {
  const table = findVtSyncTable("channel_totals")
  const snapshot = snapshotWith({
   channelTotals: {
    lifetime: { views: 1000 },
    "28d": { views: 40 },
   } as never,
  })
  const result = resolveVtSyncTableRowsForWindow(snapshot, table, "28d", DEFAULT_VT_SYNC_PRIVACY_FILTERS)
  expect(result.source).toBe("window_exact")
  expect(result.rows).toHaveLength(1)
  expect(String(result.rows[0].window)).toContain("28d")
 })
})


describe("window capability is honest about what a re-sync can fix", () => {
 it("classifies a lifetime-only dataset as such, not as merely unsynced", () => {
  // The distinction matters: "not synced" tells the user to re-sync, which for
  // these tables could never work. Only datasets the engine actually loops per
  // window may report not_synced.
  // retention is in the unwindowed set: one request per video, deliberately narrow.
  const table = findVtSyncTable("retentions")
  expect(vtSyncTableWindowCapability(table)).toBe("lifetime_only")
  const result = resolveVtSyncTableRowsForWindow(
   snapshotWith({}), table, "28d", DEFAULT_VT_SYNC_PRIVACY_FILTERS,
  )
  expect(result.source).toBe("lifetime_only")
  expect(result.rows).toEqual([])
 })

 it("reads per-video windowed metrics from the video itself", () => {
  const table = findVtSyncTable("videos")
  expect(vtSyncTableWindowCapability(table)).toBe("video_window")
  const snapshot = snapshotWith({
   videos: [
    {
     id: "windowed",
     title: "Windowed",
     publishedAt: "2024-01-01T00:00:00Z",
     metrics: { views: 5000 },
     metricsByWindow: { "28d": { views: 120 } },
    },
    { id: "lifetime-only", title: "Lifetime only", publishedAt: "2024-01-01T00:00:00Z", metrics: { views: 900 } },
   ] as never,
  })
  const result = resolveVtSyncTableRowsForWindow(
   snapshot, table, "28d", DEFAULT_VT_SYNC_PRIVACY_FILTERS,
  )
  expect(result.source).toBe("window_exact")
  // Only the video with 28d data appears, carrying its 28d value — never the
  // lifetime figure, and never the video that has no 28d data at all.
  expect(result.rows).toHaveLength(1)
  expect(result.rows[0].views).toBe(120)
 })

 it("reports not_synced for videos when no window pass has run", () => {
  const table = findVtSyncTable("videos")
  const snapshot = snapshotWith({
   videos: [{ id: "v", title: "t", publishedAt: "2024-01-01T00:00:00Z", metrics: { views: 900 } }] as never,
  })
  const result = resolveVtSyncTableRowsForWindow(
   snapshot, table, "28d", DEFAULT_VT_SYNC_PRIVACY_FILTERS,
  )
  expect(result.source).toBe("not_synced")
  expect(result.rows).toEqual([])
 })

 it("classifies a window-fetchable dataset as fetched", () => {
  expect(vtSyncTableWindowCapability(findVtSyncTable("geography"))).toBe("fetched")
 })

 it("classifies day-grained and week-rollup tables as derivable", () => {
  expect(vtSyncTableWindowCapability(findVtSyncTable("daily"))).toBe("date_filtered")
  expect(vtSyncTableWindowCapability(findVtSyncTable("weekly"))).toBe("week_rollup")
 })
})

describe("weekly rollup", () => {
 it("returns rows for a window instead of always being empty", () => {
  // Week keys are "2026-W38" and never compare inside a YYYY-MM-DD range, so
  // filtering week rows directly always produced nothing. The buckets must be
  // rebuilt from the window's daily rows.
  const range = resolveWindowRange({ window: "28d" })
  const table = findVtSyncTable("weekly")
  const snapshot = snapshotWith({
   dailyMetrics: [
    { date: range.endDate, views: 10, watchTime: 1 },
    { date: "2019-01-01", views: 9999, watchTime: 99 },
   ] as never,
  })
  const result = resolveVtSyncTableRowsForWindow(
   snapshot, table, "28d", DEFAULT_VT_SYNC_PRIVACY_FILTERS,
  )
  expect(result.source).toBe("derived")
  expect(result.rows.length).toBeGreaterThan(0)
  // The 2019 row is outside the window and must not be rolled up.
  const totalViews = result.rows.reduce(
   (sum, row) => sum + (typeof row.views === "number" ? row.views : 0), 0,
  )
  expect(totalViews).toBe(10)
 })
})

describe("derived grain labelling", () => {
 it("marks month-grained derivation, which covers more than the window names", () => {
  const table = findVtSyncTable("monthly")
  const snapshot = snapshotWith({
   monthlyMetrics: [{ month: new Date().toISOString().slice(0, 7), views: 5 }] as never,
  })
  const result = resolveVtSyncTableRowsForWindow(
   snapshot, table, "7d", DEFAULT_VT_SYNC_PRIVACY_FILTERS,
  )
  if (result.source === "derived") expect(result.derivedGrain).toBe("month")
 })

 it("marks day-grained derivation as day", () => {
  const range = resolveWindowRange({ window: "7d" })
  const table = findVtSyncTable("daily")
  const snapshot = snapshotWith({
   dailyMetrics: [{ date: range.endDate, views: 3 }] as never,
  })
  const result = resolveVtSyncTableRowsForWindow(
   snapshot, table, "7d", DEFAULT_VT_SYNC_PRIVACY_FILTERS,
  )
  expect(result.derivedGrain).toBe("day")
 })
})
