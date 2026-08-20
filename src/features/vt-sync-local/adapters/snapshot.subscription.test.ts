import { afterEach, describe, expect, it, vi } from "vitest"

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
   constructor(public type: string, public init?: unknown) {}
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
  unsubscribe()
 })
})
