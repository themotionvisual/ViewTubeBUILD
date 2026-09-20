import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { readWindowedDataset, writeWindowedDataset } from "./localSyncEngine"
import type { VtSyncSnapshot } from "./contracts"

const engineSource = readFileSync(new URL("./localSyncEngine.ts", import.meta.url), "utf8")

const emptySnapshot = () => ({ geography: [] } as unknown as VtSyncSnapshot)

describe("windowed dataset storage on the snapshot", () => {
 it("keeps lifetime on the flat legacy field so existing readers are unaffected", () => {
  const next = writeWindowedDataset(
   emptySnapshot(),
   "lifetime",
   "geography",
   "geography_country",
   [{ country: "US", views: 1000 }],
  )
  expect((next as any).geography).toEqual([{ country: "US", views: 1000 }])
  expect(next.datasetsByWindow).toBeUndefined()
 })

 it("routes non-lifetime windows away from the flat field", () => {
  const seeded = writeWindowedDataset(
   emptySnapshot(),
   "lifetime",
   "geography",
   "geography_country",
   [{ country: "US", views: 1000 }],
  )
  const next = writeWindowedDataset(
   seeded,
   "28d",
   "geography",
   "geography_country",
   [{ country: "US", views: 40 }],
  )
  // The lifetime rows must survive a windowed write untouched.
  expect((next as any).geography).toEqual([{ country: "US", views: 1000 }])
  expect(next.datasetsByWindow?.["28d"]?.geography_country).toEqual([
   { country: "US", views: 40 },
  ])
 })

 it("keeps multiple windows side by side", () => {
  let snapshot = emptySnapshot()
  snapshot = writeWindowedDataset(snapshot, "28d", "geography", "geography_country", [{ country: "US", views: 40 }])
  snapshot = writeWindowedDataset(snapshot, "7d", "geography", "geography_country", [{ country: "US", views: 9 }])
  expect(Object.keys(snapshot.datasetsByWindow || {}).sort()).toEqual(["28d", "7d"])
  expect(snapshot.datasetsByWindow?.["28d"]?.geography_country).toEqual([{ country: "US", views: 40 }])
  expect(snapshot.datasetsByWindow?.["7d"]?.geography_country).toEqual([{ country: "US", views: 9 }])
 })

 it("does not let one dataset's windowed write clobber another's", () => {
  let snapshot = emptySnapshot()
  snapshot = writeWindowedDataset(snapshot, "28d", "geography", "geography_country", [{ country: "US" }])
  snapshot = writeWindowedDataset(snapshot, "28d", "devices", "device_type", [{ deviceType: "MOBILE" }])
  expect(snapshot.datasetsByWindow?.["28d"]?.geography_country).toEqual([{ country: "US" }])
  expect(snapshot.datasetsByWindow?.["28d"]?.device_type).toEqual([{ deviceType: "MOBILE" }])
 })

 it("reads back what it wrote, per window", () => {
  let snapshot = emptySnapshot()
  snapshot = writeWindowedDataset(snapshot, "lifetime", "geography", "geography_country", [{ country: "US", views: 1000 }])
  snapshot = writeWindowedDataset(snapshot, "28d", "geography", "geography_country", [{ country: "US", views: 40 }])
  expect(readWindowedDataset(snapshot, "lifetime", "geography", "geography_country"))
   .toEqual([{ country: "US", views: 1000 }])
  expect(readWindowedDataset(snapshot, "28d", "geography", "geography_country"))
   .toEqual([{ country: "US", views: 40 }])
 })

 it("reports an unsynced window as empty, which callers must not render as zero", () => {
  const snapshot = writeWindowedDataset(emptySnapshot(), "lifetime", "geography", "geography_country", [{ country: "US" }])
  expect(readWindowedDataset(snapshot, "90d", "geography", "geography_country")).toEqual([])
 })
})

describe("engine window-loop invariants", () => {
 it("defaults an unspecified run to lifetime only, but honors an explicit controller selection exactly", () => {
  expect(engineSource).toContain('selectedWindows === undefined')
  expect(engineSource).toContain('? ["lifetime"]')
  expect(engineSource).toContain(': [...new Set<VtSyncAnalyticsWindow>(selectedWindows)]')
 })

 it("does not silently reinsert lifetime after the user turns that window off", () => {
  expect(engineSource).not.toContain('["lifetime", ...selectedWindows]')
  expect(engineSource).toContain('const windows: VtSyncAnalyticsWindow[] = aggregateWindows')
 })

 it("fetches derived source history once even when lifetime output is turned off", () => {
  expect(engineSource).toContain('const isDerivedSource = VT_SYNC_DERIVED_WINDOW_CATEGORY_IDS.has(categoryId)')
  expect(engineSource).toContain('if (isDerivedSource && segmentWindow !== aggregateWindows[0]) continue')
  expect(engineSource).toContain('const storageWindow: VtSyncAnalyticsWindow = isDerivedSource ? "lifetime" : segmentWindow')
 })

 it("tags every windowed segment persistence with its window", () => {
  expect(engineSource).toContain('datasetId: categoryId, window: storageWindow')
  expect(engineSource).toContain('datasetId: "ads", window: adWindow')
  expect(engineSource).toContain('datasetId: "shares", window: shareWindow')
 })

 it("derives each window's start date from the shared resolver", () => {
  expect(engineSource).toContain("const segmentStartDate = vtSyncWindowStartDate(segmentWindow, channelStartDate)")
  expect(engineSource).not.toContain("daysAgo(Number(window.replace")
 })
})
