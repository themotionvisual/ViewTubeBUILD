import { afterEach, describe, expect, it, vi } from "vitest"

import {
 VT_SYNC_LOCAL_SNAPSHOT_KEY,
 type VtSyncSnapshot,
} from "./contracts"
import {
 getVtSyncSnapshotVersion,
 saveVtSyncSnapshot,
 subscribeToVtSyncSnapshot,
} from "./snapshot"
import { normalizeVtSyncSnapshot } from "./snapshot"

afterEach(() => {
 vi.unstubAllGlobals()
})

describe("VT-SYNC snapshot subscriptions", () => {
 it("notifies live consumers after a checkpoint is available in memory", () => {
  const storage = new Map<string, string>()
  const dispatchEvent = vi.fn()
  vi.stubGlobal("CustomEvent", class {
   type: string
   init?: unknown
   constructor(type: string, init?: unknown) {
    this.type = type
    this.init = init
   }
  })
  vi.stubGlobal("window", {
   localStorage: {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
   },
   dispatchEvent,
  })
  const listener = vi.fn()
  const startingVersion = getVtSyncSnapshotVersion()
  const unsubscribe = subscribeToVtSyncSnapshot(listener)

  saveVtSyncSnapshot(normalizeVtSyncSnapshot({
   channelName: "Checkpoint Channel",
   videos: [{ id: "video-a", title: "Ready metadata", format: "long", metrics: {} }],
  }))

  expect(getVtSyncSnapshotVersion()).toBe(startingVersion + 1)
  expect(listener).toHaveBeenCalledOnce()
  expect(dispatchEvent).toHaveBeenCalledOnce()
  const persisted = JSON.parse(storage.get(VT_SYNC_LOCAL_SNAPSHOT_KEY) || "{}") as VtSyncSnapshot
  expect(persisted.videos).toEqual([])
  expect(persisted.storageMetadata).toMatchObject({
   storageMode: "manifest_only",
   manifestOnly: true,
   fullRowCountByField: expect.objectContaining({ videos: 1 }),
  })
  unsubscribe()
 })
})
