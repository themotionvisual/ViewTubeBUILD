import { describe, expect, it } from "vitest"

import type { VtSyncSnapshot } from "./contracts"
import {
 getVtSyncSnapshotKeyForTable,
 mergeVtSyncManualImportsIntoSnapshot,
 type VtSyncManualImportState,
} from "./manualImports"
import { getVtSyncSnapshot } from "./snapshot"

const emptyImports = (): VtSyncManualImportState => ({ rowsByTableId: {}, capturedAtByTableId: {} })

const baseSnapshot = (): VtSyncSnapshot => getVtSyncSnapshot()

describe("VT-SYNC manual imports snapshot merge", () => {
 it("maps toolbox table ids to the primary snapshot key from the registry", () => {
  expect(getVtSyncSnapshotKeyForTable("videos")).toBe("videos")
  expect(getVtSyncSnapshotKeyForTable("traffic")).toBe("trafficSources")
  expect(getVtSyncSnapshotKeyForTable("traffic_day")).toBe("trafficByDay")
  expect(getVtSyncSnapshotKeyForTable("geography")).toBe("geography")
  expect(getVtSyncSnapshotKeyForTable("cities")).toBe("cities")
  expect(getVtSyncSnapshotKeyForTable("demographics")).toBe("demographics")
  expect(getVtSyncSnapshotKeyForTable("device_os")).toBe("deviceOs")
  expect(getVtSyncSnapshotKeyForTable("not-a-table")).toBeUndefined()
 })

 it("returns the original snapshot when no imports are present", () => {
  const snapshot = baseSnapshot()
  const merged = mergeVtSyncManualImportsIntoSnapshot(snapshot, emptyImports())
  expect(merged).toBe(snapshot)
 })

 it("merges imported traffic rows into the trafficSources array so the visuals adapter can render", () => {
  const snapshot = baseSnapshot()
  const imports: VtSyncManualImportState = {
   rowsByTableId: {
    traffic: [
     { source: "YT_SEARCH", views: 1200, watchTime: 400 },
     { source: "SUGGESTED_VIDEO", views: 800, watchTime: 220 },
    ],
   },
   capturedAtByTableId: { traffic: "2026-01-05T00:00:00.000Z" },
  }
  const merged = mergeVtSyncManualImportsIntoSnapshot(snapshot, imports)
  expect(merged.trafficSources).toHaveLength(2)
  expect(merged.trafficSources[0].source).toBe("YT_SEARCH")
  expect(merged.source).toBe("manual")
  expect(merged.capturedAt).toBe("2026-01-05T00:00:00.000Z")
 })

 it("reshapes flat video rows into VtSyncVideoItem so buildVideoMetrics finds numeric metrics", () => {
  const snapshot = baseSnapshot()
  const imports: VtSyncManualImportState = {
   rowsByTableId: {
    videos: [
     {
      videoId: "abc123",
      title: "Test video",
      views: "5,000",
      watchTime: 2400,
      revenue: 12.5,
     },
    ],
   },
   capturedAtByTableId: {},
  }
  const merged = mergeVtSyncManualImportsIntoSnapshot(snapshot, imports)
  expect(merged.videos).toHaveLength(1)
  const video = merged.videos[0]
  expect(video.id).toBe("abc123")
  expect(video.title).toBe("Test video")
  expect(video.metrics?.views).toBe(5000)
  expect(video.metrics?.watchTime).toBe(2400)
  expect(video.metrics?.revenue).toBe(12.5)
 })

 it("keeps the base snapshot source when it already carries synced data", () => {
  const snapshot: VtSyncSnapshot = { ...baseSnapshot(), source: "vt-sync" }
  const imports: VtSyncManualImportState = {
   rowsByTableId: { geography: [{ country: "US", views: 100 }] },
   capturedAtByTableId: {},
  }
  const merged = mergeVtSyncManualImportsIntoSnapshot(snapshot, imports)
  expect(merged.source).toBe("vt-sync")
  expect(merged.geography).toHaveLength(1)
 })
})
