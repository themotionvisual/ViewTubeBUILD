import "fake-indexeddb/auto"
import { afterEach, describe, expect, it } from "vitest"

import {
 VT_SYNC_LOCAL_DB_NAME,
 VT_SYNC_LOCAL_STORE_NAMES,
} from "./contracts"
import {
 buildVtSyncInventoryId,
 clearVtSyncLocalDb,
 deleteVtSyncDatasetTableRows,
 getVtSyncChannelIndex,
 getVtSyncKnownVideoIds,
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
} from "./localDbRepository"

afterEach(async () => {
 await clearVtSyncLocalDb()
})

describe("VT Sync local IndexedDB repository", () => {
 it("creates the v1 schema with VT Sync-only stores", async () => {
  const db = await openVtSyncLocalDb()

  expect(db.name).toBe(VT_SYNC_LOCAL_DB_NAME)
  expect(db.version).toBe(1)
  Object.values(VT_SYNC_LOCAL_STORE_NAMES).forEach((storeName) => {
   expect(db.objectStoreNames.contains(storeName)).toBe(true)
  })
  db.close()
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
