import { describe, expect, it } from "vitest"
import { resolveVtSyncTableRowsForWindow } from "./tableData"
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
