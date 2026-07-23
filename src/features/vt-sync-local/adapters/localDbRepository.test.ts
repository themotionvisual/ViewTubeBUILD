import "fake-indexeddb/auto"
import { afterEach, describe, expect, it } from "vitest"

import {
 VT_SYNC_LOCAL_DB_NAME,
 VT_SYNC_LOCAL_STORE_NAMES,
} from "./contracts"
import {
 buildVtSyncInventoryId,
 clearVtSyncLocalDb,
 getVtSyncChannelIndex,
 getVtSyncKnownVideoIds,
 listVtSyncVideoInventory,
 openVtSyncLocalDb,
 putVtSyncChannelIndex,
 putVtSyncVideoInventoryRecords,
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
