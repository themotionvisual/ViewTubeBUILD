import { describe, expect, it } from "vitest"

import type { VtSyncSnapshot } from "./contracts"
import {
 getVtSyncSnapshotKeyForTable,
 getVtSyncTableIdForDataset,
 clearVtSyncTableDataFromSnapshot,
 mergeVtSyncManualImportsIntoSnapshot,
 mergeVtSyncPersistedApiRowsIntoSnapshot,
 mergeVtSyncSupplementalTableRows,
 manualImportRecordId,
 toVtSyncManualImportState,
 toVtSyncPersistedApiState,
 type VtSyncManualImportState,
 removeVtSyncTableFromImportState,
} from "./manualImports"
import { getVtSyncSnapshot } from "./snapshot"

const emptyImports = (): VtSyncManualImportState => ({ rowsByTableId: {}, capturedAtByTableId: {} })

const baseSnapshot = (): VtSyncSnapshot => getVtSyncSnapshot()

describe("VT-SYNC manual imports snapshot merge", () => {
 it("scopes persisted manual-import identities and hydration to one resolved channel", () => {
  expect(manualImportRecordId("videos", "channel-a")).toBe("manual_import::channel-a::videos")

  const records = [
   {
    id: "manual_import::channel-a::videos", runId: "manual_import::channel-a::videos", channelId: "channel-a",
    datasetId: "videos", phase: "manual_import", provenance: "csv" as const,
    capturedAt: "2026-08-24T00:00:00.000Z", rows: [{ id: "video-a" }],
   },
   {
    id: "manual_import::channel-b::videos", runId: "manual_import::channel-b::videos", channelId: "channel-b",
    datasetId: "videos", phase: "manual_import", provenance: "csv" as const,
    capturedAt: "2026-08-24T00:00:00.000Z", rows: [{ id: "video-b" }],
   },
   {
    id: "manual_import::videos", runId: "manual_import::videos",
    datasetId: "videos", phase: "manual_import", provenance: "csv" as const,
    capturedAt: "2026-08-24T00:00:00.000Z", rows: [{ id: "unscoped" }],
   },
  ]

  expect(toVtSyncManualImportState(records, "channel-a").rowsByTableId.videos).toEqual([{ id: "video-a" }])
  expect(toVtSyncManualImportState(records, null)).toEqual(emptyImports())
 })

 it("maps toolbox table ids to the primary snapshot key from the registry", () => {
  expect(getVtSyncSnapshotKeyForTable("videos")).toBe("videos")
  expect(getVtSyncSnapshotKeyForTable("traffic")).toBe("trafficSources")
  expect(getVtSyncSnapshotKeyForTable("traffic_day")).toBe("trafficByDay")
  expect(getVtSyncSnapshotKeyForTable("geography")).toBe("geography")
  expect(getVtSyncSnapshotKeyForTable("cities")).toBe("cities")
  expect(getVtSyncSnapshotKeyForTable("demographics")).toBe("demographics")
  expect(getVtSyncSnapshotKeyForTable("device_os")).toBe("deviceOs")
  expect(getVtSyncSnapshotKeyForTable("not-a-table")).toBeUndefined()
  expect(getVtSyncTableIdForDataset("traffic_overview")).toBe("traffic")
  expect(getVtSyncTableIdForDataset("search_terms")).toBe("traffic_detail_search_terms")
  expect(getVtSyncTableIdForDataset("ext_websites")).toBe("traffic_detail_ext_websites")
  expect(getVtSyncTableIdForDataset("geography_country")).toBe("geography")
  expect(getVtSyncTableIdForDataset("daily_metrics")).toBe("daily")
  expect(getVtSyncTableIdForDataset("not-a-dataset")).toBeUndefined()
 })

 it("clears only the selected table from snapshot and import state", () => {
  const snapshot = {
   ...baseSnapshot(),
   videos: [{ id: "video-a", title: "Video A", metrics: { views: 10 } }],
   retentions: [{ videoId: "video-a", elapsedVideoTimeRatio: 0.5, audienceWatchRatio: 0.7 }],
   datasetFreshness: {
    retentions: { phase: "retention", status: "synced" as const, rows: 1 },
    videos: { phase: "video_metadata", status: "synced" as const, rows: 1 },
   },
  }
  const clearedSnapshot = clearVtSyncTableDataFromSnapshot(snapshot, "retentions")
  const clearedImports = removeVtSyncTableFromImportState({
   rowsByTableId: { retentions: [{ videoId: "video-a" }], videos: [{ id: "video-a" }] },
   capturedAtByTableId: { retentions: "2026-08-22T00:00:00Z", videos: "2026-08-22T00:00:00Z" },
  }, "retentions")

  expect(clearedSnapshot.retentions).toEqual([])
  expect(clearedSnapshot.videos).toHaveLength(1)
  expect(clearedSnapshot.datasetFreshness?.retentions).toBeUndefined()
  expect(clearedSnapshot.datasetFreshness?.videos).toBeDefined()
  expect(clearedImports.rowsByTableId).toEqual({ videos: [{ id: "video-a" }] })
  expect(clearedImports.capturedAtByTableId).toEqual({ videos: "2026-08-22T00:00:00Z" })
 })

 it("normalizes a persisted traffic_overview CSV import before visual merging", () => {
  const imports = toVtSyncManualImportState([
   {
    id: "manual_import::traffic_overview",
    runId: "manual_import::traffic_overview",
    channelId: "channel-a",
    datasetId: "traffic_overview",
    phase: "manual_import",
    provenance: "csv",
    capturedAt: "2026-08-11T02:00:00.000Z",
    rows: [{ source: "SHORTS", views: 720189 }],
   },
  ], "channel-a")
  expect(imports.rowsByTableId.traffic).toEqual([{ source: "SHORTS", views: 720189 }])
  expect(imports.capturedAtByTableId.traffic).toBe("2026-08-11T02:00:00.000Z")
 })

 it("rehydrates compacted traffic detail rows from the newest persisted API dataset", () => {
  const persisted = toVtSyncPersistedApiState([
   {
    id: "old-search", runId: "old-search", datasetId: "search_terms", phase: "traffic_sync",
    provenance: "api", capturedAt: "2026-08-10T00:00:00.000Z", rows: [{ term: "old", views: 1 }],
   },
   {
    id: "new-search", runId: "new-search", datasetId: "search_terms", phase: "traffic_sync",
    provenance: "api", capturedAt: "2026-08-11T00:00:00.000Z", rows: [{ term: "Kentucky Derby", views: 8800 }],
   },
  ])
  const rehydrated = mergeVtSyncPersistedApiRowsIntoSnapshot(baseSnapshot(), persisted)
  expect(rehydrated.trafficDetails).toEqual([
   expect.objectContaining({ sourceType: "YT_SEARCH", detail: "Kentucky Derby", term: "Kentucky Derby", views: 8800 }),
  ])
  // Keep legacy visual consumers readable during the canonical-table migration.
  expect(rehydrated.searchTerms).toEqual([
   expect.objectContaining({ sourceType: "YT_SEARCH", term: "Kentucky Derby", views: 8800 }),
  ])
 })

 it("rehydrates every canonical traffic-detail source instead of letting the last dataset win", () => {
  const persisted = toVtSyncPersistedApiState([
   { id: "search", runId: "search", datasetId: "traffic_detail_search_terms", phase: "traffic_sync", provenance: "api", capturedAt: "2026-08-11T00:00:00.000Z", rows: [{ sourceType: "YT_SEARCH", detail: "Kentucky Derby", views: 88 }] },
   { id: "external", runId: "external", datasetId: "traffic_detail_ext_websites", phase: "traffic_sync", provenance: "api", capturedAt: "2026-08-11T00:01:00.000Z", rows: [{ sourceType: "EXT_URL", detail: "example.com", views: 12 }] },
  ])
  const rehydrated = mergeVtSyncPersistedApiRowsIntoSnapshot(baseSnapshot(), persisted)
  expect(rehydrated.trafficDetails).toEqual(expect.arrayContaining([
   expect.objectContaining({ sourceType: "YT_SEARCH", detail: "Kentucky Derby" }),
   expect.objectContaining({ sourceType: "EXT_URL", detail: "example.com" }),
  ]))
 })

 it("never rehydrates another channel's persisted API detail rows", () => {
  const persisted = toVtSyncPersistedApiState([
   {
    id: "channel-a-search", runId: "channel-a-search", channelId: "channel-a", datasetId: "search_terms", phase: "traffic_sync",
    provenance: "api", capturedAt: "2026-08-11T00:00:00.000Z", rows: [{ term: "wrong channel", views: 8800 }],
   },
   {
    id: "channel-b-search", runId: "channel-b-search", channelId: "channel-b", datasetId: "search_terms", phase: "traffic_sync",
    provenance: "api", capturedAt: "2026-08-10T00:00:00.000Z", rows: [{ term: "right channel", views: 1200 }],
   },
  ], "channel-b")
  const rehydrated = mergeVtSyncPersistedApiRowsIntoSnapshot(baseSnapshot(), persisted)
  expect(rehydrated.trafficDetails).toEqual([
   expect.objectContaining({ sourceType: "YT_SEARCH", detail: "right channel", term: "right channel", views: 1200 }),
  ])
 })

 it("does not replace detail rows already present in the live snapshot", () => {
  const snapshot = { ...baseSnapshot(), searchTerms: [{ term: "live", views: 100 }] }
  const rehydrated = mergeVtSyncPersistedApiRowsIntoSnapshot(snapshot, {
   rowsByTableId: { search: [{ term: "persisted", views: 8800 }] },
   capturedAtByTableId: { search: "2026-08-11T00:00:00.000Z" },
  })
  expect(rehydrated.searchTerms).toEqual([{ term: "live", views: 100 }])
 })

 it("restores the complete persisted video catalog over a compact boot preview", () => {
  const snapshot = {
   ...baseSnapshot(),
   videos: [{ id: "video-a", title: "Preview A", thumbnail: "a.jpg", publishedAt: "2026-08-01T00:00:00Z", format: "long", metrics: {} }],
   storageMetadata: {
    storageMode: "compact_preview" as const,
    isCompacted: true,
    fullRowCountByField: { videos: 3 },
    visiblePreviewRowCountByField: { videos: 1 },
   },
  }
  const rehydrated = mergeVtSyncPersistedApiRowsIntoSnapshot(snapshot, {
   rowsByTableId: {
    videos: [
     { id: "video-a", title: "Video A", thumbnail: "a.jpg", views: 100 },
     { id: "video-b", title: "Video B", thumbnail: "b.jpg", views: 200 },
     { id: "video-c", title: "Video C", thumbnail: "c.jpg", views: 300 },
    ],
   },
   capturedAtByTableId: { videos: "2026-08-13T18:00:00.000Z" },
  })

  expect(rehydrated.videos).toHaveLength(3)
  expect(rehydrated.videos[0]).toEqual(expect.objectContaining({ id: "video-a", title: "Video A", metrics: expect.objectContaining({ views: 100 }) }))
  expect(rehydrated.videos[2]).toEqual(expect.objectContaining({ id: "video-c", metrics: expect.objectContaining({ views: 300 }) }))
 })

 it("restores the complete Traffic x Day series over its compact preview", () => {
  const snapshot = {
   ...baseSnapshot(),
   trafficByDay: [
    { day: "2026-08-13", term: "YT_SEARCH", views: 10 },
    { day: "2026-08-12", term: "YT_SEARCH", views: 9 },
   ],
   storageMetadata: {
    storageMode: "compact_preview" as const,
    isCompacted: true,
    fullRowCountByField: { trafficByDay: 4 },
    visiblePreviewRowCountByField: { trafficByDay: 2 },
   },
  }
  const rehydrated = mergeVtSyncPersistedApiRowsIntoSnapshot(snapshot, {
   rowsByTableId: {
    traffic_day: [
     { day: "2026-08-13", term: "YT_SEARCH", views: 10 },
     { day: "2026-08-12", term: "YT_SEARCH", views: 9 },
     { day: "2026-08-11", term: "YT_SEARCH", views: 8 },
     { day: "2026-08-10", term: "YT_SEARCH", views: 7 },
    ],
   },
   capturedAtByTableId: { traffic_day: "2026-08-13T18:00:00.000Z" },
  })

  expect(rehydrated.trafficByDay).toHaveLength(4)
  expect(rehydrated.trafficByDay.at(-1)).toEqual(expect.objectContaining({ day: "2026-08-10", term: "YT_SEARCH" }))
 })

 it("restores a larger Monthly Stats dataset even when legacy compact metadata omitted the full count", () => {
  const preview = Array.from({ length: 24 }, (_, index) => ({
   date: `2024-${String(12 - (index % 12)).padStart(2, "0")}`,
   views: index + 1,
  }))
  const persistedRows = Array.from({ length: 43 }, (_, index) => ({
   month: `${2026 - Math.floor(index / 12)}-${String(12 - (index % 12)).padStart(2, "0")}`,
   views: 1000 - index,
  }))
  const snapshot = {
   ...baseSnapshot(),
   monthlyMetrics: preview,
   storageMetadata: {
    storageMode: "compact_preview" as const,
    isCompacted: true,
   },
  }

  const rehydrated = mergeVtSyncPersistedApiRowsIntoSnapshot(snapshot, {
   rowsByTableId: { monthly: persistedRows },
   capturedAtByTableId: { monthly: "2026-08-14T18:00:00.000Z" },
  })

  expect(rehydrated.monthlyMetrics).toHaveLength(43)
 })

 it("uses a saved Monthly Stats CSV as a supplement instead of reducing the API dataset", () => {
  const apiRows = Array.from({ length: 43 }, (_, index) => ({
   date: `${2026 - Math.floor(index / 12)}-${String(12 - (index % 12)).padStart(2, "0")}`,
   views: 1000 - index,
  }))
  const importedRows = apiRows.slice(0, 24).map((row, index) => ({
   month: row.date,
   views: 1,
   comments: index + 1,
  }))

  const merged = mergeVtSyncManualImportsIntoSnapshot({
   ...baseSnapshot(),
   monthlyMetrics: apiRows,
  }, {
   rowsByTableId: { monthly: importedRows },
   capturedAtByTableId: { monthly: "2026-08-14T18:00:00.000Z" },
  })

  expect(merged.monthlyMetrics).toHaveLength(43)
  expect(merged.monthlyMetrics[0]).toEqual(expect.objectContaining({ views: 1000, comments: 1 }))
 })

 it.each([
  ["daily", [{ date: "2026-08-01" }, { date: "2026-08-02" }, { date: "2026-08-03" }], [{ day: "2026-08-01", comments: 1 }]],
  ["cities", [{ country: "US", city: "New York" }, { country: "US", city: "Boston" }, { country: "CA", city: "Toronto" }], [{ country: "US", city: "New York", views: 10 }]],
  ["device_os", [{ deviceType: "MOBILE", operatingSystem: "ANDROID" }, { deviceType: "MOBILE", operatingSystem: "IOS" }, { deviceType: "COMPUTER", operatingSystem: "WINDOWS" }], [{ device: "MOBILE", os: "ANDROID", views: 10 }]],
  ["playlists", [{ playlistId: "a" }, { playlistId: "b" }, { playlistId: "c" }], [{ id: "a", title: "Imported title" }]],
 ] as const)("never reduces the %s canonical table when an import is shorter", (tableId, apiRows, importedRows) => {
  const merged = mergeVtSyncSupplementalTableRows(tableId, [...apiRows], [...importedRows])
  expect(merged).toHaveLength(apiRows.length)
 })

 it("never writes a Weekly Stats import into canonical Daily Stats", () => {
  const dailyMetrics = [
   { date: "2026-08-01", views: 10 },
   { date: "2026-08-02", views: 20 },
  ]
  const merged = mergeVtSyncManualImportsIntoSnapshot({
   ...baseSnapshot(),
   dailyMetrics,
  }, {
   rowsByTableId: { weekly: [{ dateRange: "Jul 27-Aug 2", views: 30 }] },
   capturedAtByTableId: { weekly: "2026-08-14T18:00:00.000Z" },
  })

  expect(merged.dailyMetrics).toEqual(dailyMetrics)
 })

 it("keeps traffic-detail rows with duplicate display titles when their raw identities differ", () => {
  const rows = mergeVtSyncSupplementalTableRows("traffic_detail_suggested_videos", [
   { sourceType: "RELATED_VIDEO", detail: "video-a", title: "Same title", views: 10 },
   { sourceType: "RELATED_VIDEO", detail: "video-b", title: "Same title", views: 20 },
  ], [
   { title: "Same title", sourceChannel: "Example Channel", videoUrl: "https://www.youtube.com/watch?v=video-a", comments: 1 },
  ])

  expect(rows).toHaveLength(2)
  expect(rows).toEqual(expect.arrayContaining([
   expect.objectContaining({ detail: "video-a", views: 10, comments: 1 }),
   expect.objectContaining({ detail: "video-b", views: 20 }),
  ]))
 })

 it("supplements Traffic x Day without replacing complete synced rows", () => {
  const snapshot = {
   ...baseSnapshot(),
   trafficByDay: [
    { day: "2026-08-13", term: "YT_SEARCH", views: 100, watchTime: 10 },
    { day: "2026-08-12", term: "EXT_URL", views: 80, watchTime: 8 },
   ],
  }
  const merged = mergeVtSyncManualImportsIntoSnapshot(snapshot, {
   rowsByTableId: {
    traffic_day: [
     { day: "2026-08-13", term: "YT_SEARCH", views: 1, likes: 3 },
     { day: "2026-08-11", term: "RELATED_VIDEO", views: 60 },
    ],
   },
   capturedAtByTableId: { traffic_day: "2026-08-14T18:00:00.000Z" },
  })

  expect(merged.trafficByDay).toHaveLength(3)
  expect(merged.trafficByDay).toEqual(expect.arrayContaining([
   expect.objectContaining({ day: "2026-08-13", term: "YT_SEARCH", views: 100, watchTime: 10, likes: 3 }),
   expect.objectContaining({ day: "2026-08-12", term: "EXT_URL", views: 80 }),
   expect.objectContaining({ day: "2026-08-11", term: "RELATED_VIDEO", views: 60 }),
  ]))
 })

 it("rehydrates the legacy monthly_api dataset into the sole Monthly Stats field", () => {
  const persisted = toVtSyncPersistedApiState([
   {
    id: "monthly-api", runId: "monthly-api", datasetId: "monthly_api", phase: "monthly_metrics",
    provenance: "api", capturedAt: "2026-08-13T18:00:00.000Z",
    rows: [{ month: "2026-07", views: 1200 }],
   },
  ])
  const rehydrated = mergeVtSyncPersistedApiRowsIntoSnapshot(baseSnapshot(), persisted)

  expect(persisted.rowsByTableId.monthly).toEqual([{ month: "2026-07", views: 1200 }])
  expect(rehydrated.monthlyMetrics).toEqual([
   expect.objectContaining({ date: "2026-07", month: "2026-07", views: 1200 }),
  ])
 })

 it("never lets persisted video rows replace a non-compacted live catalog", () => {
  const snapshot = {
   ...baseSnapshot(),
   videos: [{ id: "live-video", title: "Live", thumbnail: "live.jpg", publishedAt: "2026-08-01T00:00:00Z", format: "long", metrics: {} }],
   storageMetadata: { storageMode: "full" as const, isCompacted: false },
  }
  const rehydrated = mergeVtSyncPersistedApiRowsIntoSnapshot(snapshot, {
   rowsByTableId: { videos: [{ id: "persisted-video", title: "Persisted" }] },
   capturedAtByTableId: { videos: "2026-08-13T18:00:00.000Z" },
  })

  expect(rehydrated.videos).toEqual(snapshot.videos)
 })

 it("rehydrates a missing source without overwriting a different live detail source", () => {
  const snapshot = {
   ...baseSnapshot(),
   trafficDetails: [{ sourceType: "YT_SEARCH", detail: "live query", views: 100 }],
  }
  const rehydrated = mergeVtSyncPersistedApiRowsIntoSnapshot(snapshot, {
   rowsByTableId: {
    traffic_detail_search_terms: [{ term: "stale query", views: 99 }],
    traffic_detail_ext_websites: [{ term: "example.com", views: 12 }],
   },
   capturedAtByTableId: {
    traffic_detail_search_terms: "2026-08-11T00:00:00.000Z",
    traffic_detail_ext_websites: "2026-08-11T00:00:00.000Z",
   },
  })
  expect(rehydrated.trafficDetails).toEqual(expect.arrayContaining([
   expect.objectContaining({ sourceType: "YT_SEARCH", detail: "live query", views: 100 }),
   expect.objectContaining({ sourceType: "EXT_URL", detail: "example.com", views: 12 }),
  ]))
  expect(rehydrated.trafficDetails).not.toEqual(expect.arrayContaining([
   expect.objectContaining({ sourceType: "YT_SEARCH", detail: "stale query" }),
  ]))
 })

 it("returns the original snapshot when no imports are present", () => {
  const snapshot = baseSnapshot()
  const merged = mergeVtSyncManualImportsIntoSnapshot(snapshot, emptyImports())
  expect(merged).toBe(snapshot)
 })

 it("supplements the video catalog instead of replacing it with a smaller import", () => {
  const snapshot = {
   ...baseSnapshot(),
   videos: Array.from({ length: 100 }, (_, index) => ({
    id: `video-${index + 1}`,
    title: `API Video ${index + 1}`,
    metrics: { views: 10 },
   })),
  }
  const importedRows = Array.from({ length: 77 }, (_, index) => ({
   videoId: `video-${index + 1}`,
   title: `CSV Video ${index + 1}`,
   descriptionSnippet: `CSV description ${index + 1}`,
   views: 999,
  }))

  const merged = mergeVtSyncManualImportsIntoSnapshot(snapshot, {
   rowsByTableId: { videos: importedRows },
   capturedAtByTableId: { videos: "2026-08-14T20:00:00.000Z" },
  })

  expect(merged.videos).toHaveLength(100)
  expect(merged.videos[0]).toMatchObject({
   id: "video-1",
   title: "API Video 1",
   descriptionSnippet: "CSV description 1",
   metrics: { views: 10 },
  })
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
