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
 it("defaults an unspecified run to lifetime only, so quota is unchanged", () => {
  expect(engineSource).toContain('? [...new Set<VtSyncAnalyticsWindow>(["lifetime", ...selectedWindows])]')
  expect(engineSource).toContain(': ["lifetime"]')
 })

 it("always includes lifetime, because the flat snapshot fields alias it", () => {
  const match = engineSource.match(/const requestedWindows[^\n]*\n[^\n]*\n[^\n]*/)
  expect(match?.[0]).toContain('"lifetime"')
 })

 it("runs only the windows the budget plan allows", () => {
  expect(engineSource).toContain("const windowPlan = planVtSyncWindows({")
  expect(engineSource).toContain("const aggregateWindows = windowPlan.windows")
 })

 it("reports deferred windows as partial rather than dropping them silently", () => {
  expect(engineSource).toContain('phase: "window_budget"')
  expect(engineSource).toContain("deferredWindows,")
 })

 it("skips day/month-grained categories on non-lifetime windows", () => {
  // Class A: fetched once over lifetime, windows derived from its months.
  expect(engineSource).toContain(
   'if (segmentWindow !== "lifetime" && VT_SYNC_DERIVED_WINDOW_CATEGORY_IDS.has(categoryId)) continue',
  )
 })

 it("tags every windowed segment persistence with its window", () => {
  expect(engineSource).toContain('datasetId: categoryId, window: segmentWindow')
  expect(engineSource).toContain('datasetId: "ads", window: adWindow')
  expect(engineSource).toContain('datasetId: "shares", window: shareWindow')
 })

 it("derives each window's start date from one helper", () => {
  expect(engineSource).toContain("const segmentStartDate = vtSyncWindowStartDate(segmentWindow, channelStartDate)")
  expect(engineSource).not.toContain("daysAgo(Number(window.replace")
 })

 it("pairs the window start with the engine's own end date basis", () => {
  // reportEndDate() is daysAgo(1), a LOCAL date key. A UTC-derived start paired
  // with it yields a 6- or 8-day "7d" window depending on timezone and hour.
  // Both ends must come from the same basis: daysAgo(N) .. daysAgo(1) = N days.
  expect(engineSource).toContain("daysAgo(WINDOW_DAYS[window])")
  expect(engineSource).not.toContain("resolveWindowRange({ window }).startDate")
 })
})

describe("window length is exactly N days", () => {
 // Mirrors the engine's own arithmetic: start = daysAgo(N), end = daysAgo(1).
 const toLocalDateKey = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
 }
 const daysAgo = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return toLocalDateKey(date)
 }
 const inclusiveDays = (start: string, end: string) =>
  Math.round(
   (Date.parse(`${end}T00:00:00`) - Date.parse(`${start}T00:00:00`)) / 86_400_000,
  ) + 1

 it.each([7, 28, 90, 365])("covers exactly %i inclusive days", (days) => {
  expect(inclusiveDays(daysAgo(days), daysAgo(1))).toBe(days)
 })
})
