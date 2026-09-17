import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import {
 VT_SYNC_WINDOW_DATASET_FIELDS,
 isVtSyncWindowEmpty,
 projectVtSyncSnapshotToWindow,
} from "./windowProjection"
import type { VtSyncSnapshot } from "./contracts"

const snapshotWith = (overrides: Record<string, unknown>): VtSyncSnapshot => ({
 source: "vt-sync",
 snapshotId: "s1",
 capturedAt: "2026-09-17T00:00:00.000Z",
 videos: [],
 geography: [],
 devices: [],
 ...overrides,
} as unknown as VtSyncSnapshot)

describe("window projection", () => {
 it("returns lifetime untouched — the flat fields already are lifetime", () => {
  const snapshot = snapshotWith({ geography: [{ country: "US", views: 1000 }] })
  const { snapshot: out, coverage } = projectVtSyncSnapshotToWindow(snapshot, "lifetime")
  expect(out).toBe(snapshot)
  expect(coverage.isLifetime).toBe(true)
 })

 it("swaps a dataset's flat field for that window's rows", () => {
  const snapshot = snapshotWith({
   geography: [{ country: "US", views: 1000 }],
   datasetsByWindow: { "28d": { geography_country: [{ country: "US", views: 40 }] } },
  })
  const { snapshot: out, coverage } = projectVtSyncSnapshotToWindow(snapshot, "28d")
  expect((out as never as Record<string, unknown[]>).geography).toEqual([
   { country: "US", views: 40 },
  ])
  expect(coverage.present).toContain("geography_country")
 })

 it("EMPTIES an unsynced dataset rather than leaving lifetime rows under a window label", () => {
  // The regression that matters for charts: there is no column header to check,
  // so a silently redrawn lifetime series is indistinguishable from real data.
  const snapshot = snapshotWith({ geography: [{ country: "US", views: 1000 }] })
  const { snapshot: out, coverage } = projectVtSyncSnapshotToWindow(snapshot, "28d")
  expect((out as never as Record<string, unknown[]>).geography).toEqual([])
  expect(coverage.missing).toContain("geography_country")
 })

 it("never mutates the input snapshot", () => {
  const snapshot = snapshotWith({ geography: [{ country: "US", views: 1000 }] })
  projectVtSyncSnapshotToWindow(snapshot, "28d")
  expect((snapshot as never as Record<string, unknown[]>).geography).toEqual([
   { country: "US", views: 1000 },
  ])
 })

 it("projects per-video metrics from metricsByWindow", () => {
  const snapshot = snapshotWith({
   videos: [
    { id: "a", title: "A", metrics: { views: 5000 }, metricsByWindow: { "28d": { views: 120 } } },
    { id: "b", title: "B", metrics: { views: 900 } },
   ],
  })
  const { snapshot: out, coverage } = projectVtSyncSnapshotToWindow(snapshot, "28d")
  const videos = (out as never as { videos: Array<Record<string, never>> }).videos
  // Only the video with 28d data survives, carrying its 28d value.
  expect(videos).toHaveLength(1)
  expect(videos[0].metrics).toEqual({ views: 120 })
  expect(coverage.present).toContain("videos_analytics")
 })

 it("reports a completely unsynced window as empty", () => {
  const snapshot = snapshotWith({
   geography: [{ country: "US" }],
   videos: [{ id: "a", title: "A", metrics: {} }],
  })
  const { coverage } = projectVtSyncSnapshotToWindow(snapshot, "90d")
  expect(isVtSyncWindowEmpty(coverage)).toBe(true)
 })

 it("does not report empty when at least one dataset has rows", () => {
  const snapshot = snapshotWith({
   geography: [{ country: "US" }],
   datasetsByWindow: { "7d": { geography_country: [{ country: "US", views: 3 }] } },
  })
  const { coverage } = projectVtSyncSnapshotToWindow(snapshot, "7d")
  expect(isVtSyncWindowEmpty(coverage)).toBe(false)
 })
})

describe("dataset field map stays aligned with the engine", () => {
 const engineSource = readFileSync(
  new URL("./localSyncEngine.ts", import.meta.url),
  "utf8",
 )

 it("maps every segment category the engine writes", () => {
  // Drift here would leave a visual reading lifetime rows for a window the
  // engine did sync — silently, because nothing would error.
  const segmentBlock = engineSource.slice(
   engineSource.indexOf("const segmentRuns:"),
   engineSource.indexOf("for (const segmentWindow of aggregateWindows)"),
  )
  const pairs = segmentBlock
   .split("\n")
   .filter((line) => /^\s+\["/.test(line))
   .map((line) => line.match(/^\s+\["([a-z_]+)",\s*"([A-Za-z]+)"/))
   .filter(Boolean) as RegExpMatchArray[]

  expect(pairs.length).toBeGreaterThan(10)
  for (const [, categoryId, field] of pairs) {
   expect(VT_SYNC_WINDOW_DATASET_FIELDS[categoryId]).toBe(field)
  }
 })
})
