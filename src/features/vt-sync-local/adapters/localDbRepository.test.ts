import "fake-indexeddb/auto"
import { afterEach, describe, expect, it } from "vitest"

import {
 VT_SYNC_LOCAL_DB_NAME,
 VT_SYNC_LOCAL_DB_VERSION,
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
import { clearVtSyncSavedTableData } from "./manualImports"

afterEach(async () => {
 await clearVtSyncLocalDb()
})

describe("VT Sync local IndexedDB repository", () => {
 it("creates the current schema with VT Sync-only stores", async () => {
  const db = await openVtSyncLocalDb()

  expect(db.name).toBe(VT_SYNC_LOCAL_DB_NAME)
  expect(db.version).toBe(VT_SYNC_LOCAL_DB_VERSION)
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

describe("dataset window identity (v2)", () => {
 const base = {
  runId: "run-1",
  channelId: "UC123",
  datasetId: "geography_country",
  phase: "segments",
  capturedAt: "2026-09-12T00:00:00.000Z",
  columns: ["country", "views"],
  source: "youtube_analytics_v2" as const,
 }

 it("keeps one record per window instead of overwriting", async () => {
  await replaceLatestVtSyncDatasetRawReport({
   ...base,
   window: "lifetime",
   rows: [{ country: "US", views: 1000 }],
  })
  await replaceLatestVtSyncDatasetRawReport({
   ...base,
   window: "28d",
   rows: [{ country: "US", views: 40 }],
  })

  const records = await listVtSyncDatasetRawReports()
  expect(records).toHaveLength(2)
  expect(records.find((r) => r.window === "lifetime")?.rows).toEqual([
   { country: "US", views: 1000 },
  ])
  expect(records.find((r) => r.window === "28d")?.rows).toEqual([
   { country: "US", views: 40 },
  ])
 })

 it("supersedes only the same window on a re-sync", async () => {
  await replaceLatestVtSyncDatasetRawReport({
   ...base,
   window: "lifetime",
   rows: [{ country: "US", views: 1000 }],
  })
  await replaceLatestVtSyncDatasetRawReport({
   ...base,
   window: "28d",
   rows: [{ country: "US", views: 40 }],
  })
  await replaceLatestVtSyncDatasetRawReport({
   ...base,
   window: "28d",
   rows: [{ country: "US", views: 55 }],
  })

  const records = await listVtSyncDatasetRawReports()
  expect(records).toHaveLength(2)
  expect(records.find((r) => r.window === "28d")?.rows).toEqual([
   { country: "US", views: 55 },
  ])
  expect(records.find((r) => r.window === "lifetime")?.rows).toEqual([
   { country: "US", views: 1000 },
  ])
 })

 it("defaults an untagged write to lifetime", async () => {
  await replaceLatestVtSyncDatasetRawReport({ ...base, rows: [{ country: "US" }] })
  const [record] = await listVtSyncDatasetRawReports()
  expect(record.window).toBe("lifetime")
 })

 it("keeps table rows per window too", async () => {
  await replaceLatestVtSyncDatasetTableRows({
   ...base,
   window: "lifetime",
   rows: [{ country: "US", views: 1000 }],
  })
  await replaceLatestVtSyncDatasetTableRows({
   ...base,
   window: "7d",
   rows: [{ country: "US", views: 9 }],
  })
  const records = await listVtSyncDatasetTableRows()
  expect(records).toHaveLength(2)
  expect(records.map((r) => r.window).sort()).toEqual(["7d", "lifetime"])
 })
})

describe("v1 -> v2 upgrade", () => {
 const deleteDatabase = (): Promise<void> =>
  new Promise((resolve, reject) => {
   const request = indexedDB.deleteDatabase(VT_SYNC_LOCAL_DB_NAME)
   request.onsuccess = () => resolve()
   request.onerror = () => reject(request.error)
   request.onblocked = () => resolve()
  })

 /**
  * Write a v1-shaped database directly, bypassing the current repository.
  * Earlier tests leave the database at the current version, so it has to be
  * removed before a v1 open is possible.
  */
 const seedV1Database = async (records: Array<Record<string, unknown>>): Promise<void> => {
  await deleteDatabase()
  return new Promise((resolve, reject) => {
   const request = indexedDB.open(VT_SYNC_LOCAL_DB_NAME, 1)
   request.onupgradeneeded = () => {
    const db = request.result
    Object.values(VT_SYNC_LOCAL_STORE_NAMES).forEach((storeName) => {
     if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, { keyPath: "id" })
     }
    })
   }
   request.onsuccess = () => {
    const db = request.result
    const tx = db.transaction(VT_SYNC_LOCAL_STORE_NAMES.datasetRawReports, "readwrite")
    const store = tx.objectStore(VT_SYNC_LOCAL_STORE_NAMES.datasetRawReports)
    records.forEach((record) => store.put(record))
    tx.oncomplete = () => {
     db.close()
     resolve()
    }
    tx.onerror = () => reject(tx.error)
   }
   request.onerror = () => reject(request.error)
  })
 }

 it("backfills pre-v2 records as lifetime without losing them", async () => {
  await seedV1Database([
   {
    // v1 id shape: no window segment.
    id: "latest_api::UC123::geography_country::raw",
    runId: "old-run",
    channelId: "UC123",
    datasetId: "geography_country",
    phase: "segments",
    capturedAt: "2026-09-01T00:00:00.000Z",
    columns: ["country", "views"],
    rows: [{ country: "US", views: 1234 }],
    source: "youtube_analytics_v2",
   },
  ])

  const db = await openVtSyncLocalDb()
  expect(db.version).toBe(2)

  const records = await listVtSyncDatasetRawReports()
  expect(records).toHaveLength(1)
  // The data survived the upgrade, now tagged as what it always was.
  expect(records[0].window).toBe("lifetime")
  expect(records[0].rows).toEqual([{ country: "US", views: 1234 }])
  // And it was re-keyed, so a later lifetime sync supersedes it rather than
  // sitting alongside it as a duplicate.
  expect(records[0].id).toBe("latest_api::UC123::geography_country::lifetime::raw")

  await replaceLatestVtSyncDatasetRawReport({
   runId: "new-run",
   channelId: "UC123",
   datasetId: "geography_country",
   window: "lifetime",
   phase: "segments",
   capturedAt: "2026-09-12T00:00:00.000Z",
   columns: ["country", "views"],
   rows: [{ country: "US", views: 9999 }],
   source: "youtube_analytics_v2",
  })

  const afterResync = await listVtSyncDatasetRawReports()
  expect(afterResync).toHaveLength(1)
  expect(afterResync[0].rows).toEqual([{ country: "US", views: 9999 }])
 })

})
