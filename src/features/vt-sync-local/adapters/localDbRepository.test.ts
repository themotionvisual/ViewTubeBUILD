import "fake-indexeddb/auto"
import { afterEach, describe, expect, it } from "vitest"

import {
 VT_SYNC_LOCAL_DB_NAME,
 VT_SYNC_LOCAL_DB_VERSION,
 VT_SYNC_LOCAL_INDEX_NAMES,
 VT_SYNC_LOCAL_STORE_NAMES,
} from "./contracts"
import {
 buildVtSyncInventoryId,
 clearVtSyncLocalDb,
 deleteVtSyncDatasetTableRows,
 getVtSyncChannelIndex,
 getVtSyncKnownVideoIds,
 getVtSyncPackedStorageDiagnostics,
 listVtSyncDatasetRawReports,
 listVtSyncDatasetTableRows,
 listVtSyncSyncRuns,
 listVtSyncVideoInventory,
 openVtSyncLocalDb,
 putVtSyncChannelIndex,
 putVtSyncDatasetRawReport,
 putVtSyncDatasetTableRows,
 putVtSyncVideoInventoryRecords,
 replaceLatestVtSyncDatasetRawReport,
 replaceLatestVtSyncDatasetTableRows,
 replaceLatestVtSyncSyncRun,
 upsertLatestVtSyncDatasetTableRows,
} from "./localDbRepository"
import { clearVtSyncSavedTableData } from "./manualImports"

afterEach(async () => {
 await clearVtSyncLocalDb()
})

describe("VT Sync local IndexedDB repository", () => {
 it("creates the indexed compact schema for large canonical datasets", async () => {
  const db = await openVtSyncLocalDb()

  expect(db.name).toBe(VT_SYNC_LOCAL_DB_NAME)
  expect(db.version).toBe(VT_SYNC_LOCAL_DB_VERSION)
  Object.values(VT_SYNC_LOCAL_STORE_NAMES).forEach((storeName) => {
   expect(db.objectStoreNames.contains(storeName)).toBe(true)
  })
  const tx = db.transaction([
   VT_SYNC_LOCAL_STORE_NAMES.datasetChunks,
   VT_SYNC_LOCAL_STORE_NAMES.videoInventory,
   VT_SYNC_LOCAL_STORE_NAMES.videoDimensions,
  ], "readonly")
  expect(tx.objectStore(VT_SYNC_LOCAL_STORE_NAMES.datasetChunks).indexNames.contains(VT_SYNC_LOCAL_INDEX_NAMES.chunksByRecord)).toBe(true)
  expect(tx.objectStore(VT_SYNC_LOCAL_STORE_NAMES.datasetChunks).indexNames.contains(VT_SYNC_LOCAL_INDEX_NAMES.chunksByGeneration)).toBe(true)
  expect(tx.objectStore(VT_SYNC_LOCAL_STORE_NAMES.videoInventory).indexNames.contains(VT_SYNC_LOCAL_INDEX_NAMES.recordsByChannel)).toBe(true)
  expect(tx.objectStore(VT_SYNC_LOCAL_STORE_NAMES.videoDimensions).indexNames.contains(VT_SYNC_LOCAL_INDEX_NAMES.recordsByChannel)).toBe(true)
  db.close()
 })

 it("persists thousands of days and tens of thousands of combination rows without truncation", async () => {
  const days = Array.from({ length: 5_000 }, (_, index) => {
   const date = new Date(Date.UTC(2000, 0, index + 1)).toISOString().slice(0, 10)
   return { date, views: index, watchTime: index / 3, estimatedRevenue: index / 100 }
  })
  const trafficByDay = Array.from({ length: 60_000 }, (_, index) => {
   const dayIndex = Math.floor(index / 24)
   return {
    term: `SOURCE_${index % 24}`,
    day: days[dayIndex].date,
    views: index,
    engagedViews: index - (index % 7),
    watchTime: index / 10,
    averageViewDuration: 75 + (index % 30),
    averageViewPercentage: 50 + (index % 40),
    comments: index % 19,
    likes: index % 101,
    shares: index % 11,
    subscribersGained: index % 13,
    estimatedRevenue: index / 1_000,
   }
  })

  await putVtSyncDatasetTableRows({
   id: "large-daily",
   runId: "large-run",
   channelId: "large-channel",
   datasetId: "daily",
   phase: "daily_history",
   capturedAt: "2026-08-31T23:50:00.000Z",
   rows: days,
   provenance: "api",
  })
  await putVtSyncDatasetTableRows({
   id: "large-traffic-day",
   runId: "large-run",
   channelId: "large-channel",
   datasetId: "traffic_day",
   phase: "traffic_day",
   capturedAt: "2026-08-31T23:50:00.000Z",
   rows: trafficByDay,
   provenance: "api",
  })

  const records = await listVtSyncDatasetTableRows()
  expect(records.find((record) => record.id === "large-daily")?.rows).toEqual(days)
  expect(records.find((record) => record.id === "large-traffic-day")?.rows).toEqual(trafficByDay)
  expect(await getVtSyncPackedStorageDiagnostics()).toEqual(expect.arrayContaining([
   expect.objectContaining({ id: "large-daily", rowCount: 5_000, generationHealth: "verified" }),
   expect.objectContaining({ id: "large-traffic-day", rowCount: 60_000, generationHealth: "verified" }),
  ]))
 }, 30_000)

 it("persists channel-scoped table rows as a lossless packed generation", async () => {
  const rows = Array.from({ length: 80 }, (_, index) => ({
   date: `2026-06-${String((index % 28) + 1).padStart(2, "0")}`,
   views: 1_000 + index,
   watchTime: index === 3 ? null : 200.5 + index,
   metricProvenance: { views: "youtube_analytics_v2", watchTime: "youtube_analytics_v2" },
  }))
  await putVtSyncDatasetTableRows({
   id: "channel-a-daily",
   runId: "run-a",
   channelId: "channel-a",
   datasetId: "daily",
   phase: "daily_history",
   capturedAt: "2026-08-29T12:00:00.000Z",
   rows,
   provenance: "api",
  })

  expect(await listVtSyncDatasetTableRows()).toEqual([
   expect.objectContaining({ id: "channel-a-daily", rows }),
  ])
  expect(await getVtSyncPackedStorageDiagnostics()).toEqual([
   expect.objectContaining({
    channelId: "channel-a",
    datasetId: "daily",
    rowCount: 80,
    generationHealth: "verified",
   }),
  ])
 })

 it("persists and clears stable per-table manual CSV records", async () => {
  await putVtSyncDatasetTableRows({
   id: "manual_import::creator",
   runId: "manual_import::creator",
   datasetId: "creator",
   phase: "manual_import",
   capturedAt: "2026-07-28T08:00:00.000Z",
   rows: [{ term: "Shorts", views: 12 }],
   provenance: "csv",
   filenames: ["formats-a.csv", "formats-b.csv"],
  })

  expect(await listVtSyncDatasetTableRows()).toEqual([
   expect.objectContaining({
    id: "manual_import::creator",
    datasetId: "creator",
    filenames: ["formats-a.csv", "formats-b.csv"],
    rows: [{ term: "Shorts", views: 12 }],
   }),
  ])

  await deleteVtSyncDatasetTableRows("manual_import::creator")
  expect(await listVtSyncDatasetTableRows()).toEqual([])
 })

 it("clears every saved representation for one table without touching other tables", async () => {
  await Promise.all([
   putVtSyncDatasetTableRows({
    id: "manual_import::retentions", runId: "manual-retention", channelId: "channel-a", datasetId: "retentions", phase: "manual_import",
    capturedAt: "2026-08-22T00:00:00Z", rows: [{ videoId: "a" }], provenance: "csv",
   }),
   putVtSyncDatasetTableRows({
    id: "manual_import::legacy-retention", runId: "legacy-retention", channelId: "channel-a", datasetId: "retention", phase: "manual_import",
    capturedAt: "2026-08-21T00:00:00Z", rows: [{ videoId: "legacy" }], provenance: "csv",
   }),
   putVtSyncDatasetTableRows({
    id: "api-retention", runId: "api-retention", channelId: "channel-a", datasetId: "retentions", phase: "retention",
    capturedAt: "2026-08-22T00:00:00Z", rows: [{ videoId: "api" }], provenance: "api",
   }),
   putVtSyncDatasetTableRows({
    id: "api-videos", runId: "api-videos", channelId: "channel-a", datasetId: "videos", phase: "video_metadata",
    capturedAt: "2026-08-22T00:00:00Z", rows: [{ id: "video-a" }], provenance: "api",
   }),
   putVtSyncDatasetTableRows({
    id: "channel-b-retention", runId: "channel-b-retention", channelId: "channel-b", datasetId: "retentions", phase: "retention",
    capturedAt: "2026-08-22T00:00:00Z", rows: [{ videoId: "channel-b" }], provenance: "api",
   }),
   putVtSyncDatasetTableRows({
    id: "unscoped-retention", runId: "unscoped-retention", datasetId: "retentions", phase: "manual_import",
    capturedAt: "2026-08-22T00:00:00Z", rows: [{ videoId: "unscoped" }], provenance: "csv",
   }),
   putVtSyncDatasetRawReport({
    id: "raw-retention", runId: "raw-retention", channelId: "channel-a", datasetId: "retentions", phase: "retention",
    capturedAt: "2026-08-22T00:00:00Z", columns: ["videoId"], rows: [{ videoId: "raw" }], source: "youtube_analytics_v2",
   }),
  ])

  const result = await clearVtSyncSavedTableData("retentions", "channel-a")
  expect(result).toMatchObject({ tableRecordsDeleted: 3, rawRecordsDeleted: 1 })
  expect((await listVtSyncDatasetTableRows()).map((record) => record.id).sort()).toEqual([
   "api-videos",
   "channel-b-retention",
   "unscoped-retention",
  ])
  expect(await listVtSyncDatasetRawReports()).toEqual([])
 })

 it("keeps only the latest API dataset for each channel while preserving CSV and other channels", async () => {
  await putVtSyncDatasetTableRows({
   id: "legacy-a", runId: "run-a-1", channelId: "channel-a", datasetId: "videos", phase: "video_metadata",
   capturedAt: "2026-08-12T00:00:00.000Z", rows: [{ id: "old" }], provenance: "api",
  })
  await putVtSyncDatasetTableRows({
   id: "manual_import::videos", runId: "manual_import::videos", channelId: "channel-a", datasetId: "videos", phase: "manual_import",
   capturedAt: "2026-08-12T00:00:00.000Z", rows: [{ id: "csv" }], provenance: "csv",
  })
  await putVtSyncDatasetTableRows({
   id: "channel-b", runId: "run-b", channelId: "channel-b", datasetId: "videos", phase: "video_metadata",
   capturedAt: "2026-08-12T00:00:00.000Z", rows: [{ id: "other-channel" }], provenance: "api",
  })

  await replaceLatestVtSyncDatasetTableRows({
   runId: "run-a-2", channelId: "channel-a", datasetId: "videos", phase: "video_metadata",
   capturedAt: "2026-08-13T00:00:00.000Z", rows: [{ id: "new" }],
  })
  await replaceLatestVtSyncDatasetTableRows({
   runId: "run-a-3", channelId: "channel-a", datasetId: "videos", phase: "videos_analytics",
   capturedAt: "2026-08-13T01:00:00.000Z", rows: [{ id: "newest" }],
  })

  const records = await listVtSyncDatasetTableRows()
  expect(records.filter((record) => record.channelId === "channel-a" && record.provenance === "api")).toEqual([
   expect.objectContaining({ runId: "run-a-3", rows: [{ id: "newest" }] }),
  ])
  expect(records).toEqual(expect.arrayContaining([
   expect.objectContaining({ id: "manual_import::videos", provenance: "csv" }),
   expect.objectContaining({ id: "channel-b", channelId: "channel-b" }),
  ]))
 })

 it("supplementally upserts startup rows without deleting history or private analytics", async () => {
  await replaceLatestVtSyncDatasetTableRows({
   runId: "full-sync", channelId: "channel-a", datasetId: "daily", phase: "daily_history",
   capturedAt: "2026-08-28T00:00:00Z",
   rows: [
    { date: "2026-08-27", views: 100, watchTime: 40, revenue: 5 },
    { date: "2026-08-26", views: 90, watchTime: 35, revenue: 4 },
   ],
  })
  await upsertLatestVtSyncDatasetTableRows({
   runId: "bootstrap", channelId: "channel-a", datasetId: "daily", phase: "initial_channel_bootstrap",
   capturedAt: "2026-08-29T00:00:00Z",
   rows: [{ date: "2026-08-27", views: 105 }],
  })

  const record = (await listVtSyncDatasetTableRows()).find((candidate) => candidate.datasetId === "daily")
  expect(record?.rows).toEqual([
   { date: "2026-08-27", views: 105, watchTime: 40, revenue: 5 },
   { date: "2026-08-26", views: 90, watchTime: 35, revenue: 4 },
  ])
 })

 it("replaces raw diagnostics and sync-run history only after a new record exists", async () => {
  await putVtSyncDatasetRawReport({
   id: "local-import-daily", runId: "local-import-daily", datasetId: "daily", phase: "manual_import",
   capturedAt: "2026-08-11T00:00:00.000Z", columns: ["day"], rows: [{ day: "csv" }], source: "local_import",
  })
  await replaceLatestVtSyncDatasetRawReport({
   runId: "raw-1", channelId: "channel-a", datasetId: "daily", phase: "daily_metrics",
   capturedAt: "2026-08-12T00:00:00.000Z", columns: ["day"], rows: [{ day: "2026-08-12" }], source: "youtube_analytics_v2",
  })
  await replaceLatestVtSyncDatasetRawReport({
   runId: "raw-2", channelId: "channel-a", datasetId: "daily", phase: "daily_metrics",
   capturedAt: "2026-08-13T00:00:00.000Z", columns: ["day"], rows: [{ day: "2026-08-13" }], source: "youtube_analytics_v2",
  })
  expect(await listVtSyncDatasetRawReports()).toEqual(expect.arrayContaining([
   expect.objectContaining({ runId: "raw-2", channelId: "channel-a" }),
   expect.objectContaining({ id: "local-import-daily", source: "local_import" }),
  ]))

  const run = (id: string, channelId: string) => ({
   id, channelId, startedAt: "2026-08-13T00:00:00.000Z", phase: "uploads_inventory", status: "complete" as const,
   rowsRead: 1, rowsWritten: 1,
  })
  await replaceLatestVtSyncSyncRun(run("run-a-1", "channel-a"))
  await replaceLatestVtSyncSyncRun(run("run-b-1", "channel-b"))
  await replaceLatestVtSyncSyncRun(run("run-a-2", "channel-a"))
  expect((await listVtSyncSyncRuns()).map((entry) => entry.id).sort()).toEqual(["run-a-2", "run-b-1"])
 })

 it("stores channel inventory by channel-scoped video IDs", async () => {
  await putVtSyncChannelIndex({
   id: "channel-a",
   channelId: "channel-a",
   uploadsPlaylistId: "uploads-a",
   title: "Channel A",
   firstSyncedAt: "2026-07-06T00:00:00.000Z",
   lastInventorySyncedAt: "2026-07-06T00:00:00.000Z",
   knownVideoCount: 2,
  })
  await putVtSyncVideoInventoryRecords([
   {
    id: buildVtSyncInventoryId("channel-a", "video-1"),
    channelId: "channel-a",
    videoId: "video-1",
    uploadsPlaylistId: "uploads-a",
    firstSeenAt: "2026-07-06T00:00:00.000Z",
    lastSeenAt: "2026-07-06T00:00:00.000Z",
    firstInventoryRunId: "run-1",
    lastInventoryRunId: "run-1",
   },
   {
    id: buildVtSyncInventoryId("channel-a", "video-2"),
    channelId: "channel-a",
    videoId: "video-2",
    uploadsPlaylistId: "uploads-a",
    firstSeenAt: "2026-07-06T00:00:00.000Z",
    lastSeenAt: "2026-07-06T00:00:00.000Z",
    firstInventoryRunId: "run-1",
    lastInventoryRunId: "run-1",
   },
  ])

  expect(await getVtSyncChannelIndex("channel-a")).toMatchObject({
   channelId: "channel-a",
   uploadsPlaylistId: "uploads-a",
   knownVideoCount: 2,
  })
  expect(await listVtSyncVideoInventory("channel-a")).toHaveLength(2)
  expect(Array.from(await getVtSyncKnownVideoIds("channel-a")).sort()).toEqual(["video-1", "video-2"])
 })

 it("keeps separate channel inventories isolated", async () => {
  await putVtSyncVideoInventoryRecords([
   {
    id: buildVtSyncInventoryId("channel-a", "shared-video"),
    channelId: "channel-a",
    videoId: "shared-video",
    uploadsPlaylistId: "uploads-a",
    firstSeenAt: "2026-07-06T00:00:00.000Z",
    lastSeenAt: "2026-07-06T00:00:00.000Z",
    firstInventoryRunId: "run-a",
    lastInventoryRunId: "run-a",
   },
   {
    id: buildVtSyncInventoryId("channel-b", "shared-video"),
    channelId: "channel-b",
    videoId: "shared-video",
    uploadsPlaylistId: "uploads-b",
    firstSeenAt: "2026-07-06T00:00:00.000Z",
    lastSeenAt: "2026-07-06T00:00:00.000Z",
    firstInventoryRunId: "run-b",
    lastInventoryRunId: "run-b",
   },
  ])

  expect(await listVtSyncVideoInventory("channel-a")).toEqual([
   expect.objectContaining({ channelId: "channel-a", videoId: "shared-video" }),
  ])
  expect(await listVtSyncVideoInventory("channel-b")).toEqual([
   expect.objectContaining({ channelId: "channel-b", videoId: "shared-video" }),
  ])
 })
})
