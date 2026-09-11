import { afterEach, describe, expect, it, vi } from "vitest"
import { createVideoPackage } from "./packageValidation"
import { createVideoPackageAutosave, createVideoPackageStore, videoPackageStoreKey, type VideoPackageStorage } from "./packageStore"

const scope = { channelId: "channel-1", projectId: "project-1" }

const memoryStorage = (): VideoPackageStorage & { data: Map<string, string> } => {
 const data = new Map<string, string>()
 return {
  data,
  getItem: (key) => data.get(key) ?? null,
  setItem: (key, value) => { data.set(key, value) },
  removeItem: (key) => { data.delete(key) },
 }
}

describe("video package store", () => {
 afterEach(() => vi.useRealTimers())

 it("persists packages inside their channel and project scope", () => {
  const storage = memoryStorage()
  const store = createVideoPackageStore(storage, () => "2026-09-11T12:00:00.000Z")
  const videoPackage = createVideoPackage({ ...scope, workingTitle: "Austerlitz", format: "long", id: "package-1", now: "2026-09-11T11:00:00.000Z" })
  store.upsert(scope, videoPackage)
  expect(store.get(scope, "package-1")).toEqual(videoPackage)
  expect(store.load({ channelId: "channel-1", projectId: "project-2" }).packages).toEqual([])
 })

 it("rejects cross-project writes", () => {
  const store = createVideoPackageStore(memoryStorage())
  const videoPackage = createVideoPackage({ ...scope, workingTitle: "Austerlitz", format: "long" })
  expect(() => store.upsert({ ...scope, projectId: "project-2" }, videoPackage)).toThrow(/ownership/)
 })

 it("migrates the legacy items envelope and writes version one", () => {
  const storage = memoryStorage()
  const videoPackage = createVideoPackage({ ...scope, workingTitle: "Austerlitz", format: "long" })
  const key = videoPackageStoreKey(scope)
  storage.setItem(key, JSON.stringify({ storeVersion: 0, items: [videoPackage] }))
  const result = createVideoPackageStore(storage, () => "2026-09-11T12:00:00.000Z").load(scope)
  expect(result.migrated).toBe(true)
  expect(JSON.parse(storage.getItem(key) || "{}").storeVersion).toBe(1)
 })

 it("quarantines corrupt data instead of losing the original payload", () => {
  const storage = memoryStorage()
  const key = videoPackageStoreKey(scope)
  storage.setItem(key, "{broken")
  const result = createVideoPackageStore(storage, () => "2026-09-11T12:00:00.000Z").load(scope)
  expect(result.packages).toEqual([])
  expect(storage.getItem(key)).toBeNull()
  expect(storage.getItem(result.recovery?.backupKey || "")).toBe("{broken")
 })

 it("debounces autosave and flushes the newest package", () => {
  vi.useFakeTimers()
  const save = vi.fn()
  const autosave = createVideoPackageAutosave(save, 250)
  const first = createVideoPackage({ ...scope, workingTitle: "First", format: "long", id: "package-1" })
  const latest = { ...first, identity: { ...first.identity, workingTitle: "Latest" } }
  autosave.schedule(first)
  autosave.schedule(latest)
  vi.advanceTimersByTime(249)
  expect(save).not.toHaveBeenCalled()
  vi.advanceTimersByTime(1)
  expect(save).toHaveBeenCalledOnce()
  expect(save).toHaveBeenCalledWith(latest)
 })
})
