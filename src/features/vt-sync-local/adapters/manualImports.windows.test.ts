import { describe, expect, it } from "vitest"
import { toVtSyncPersistedApiState } from "./manualImports"
import type { VtSyncDatasetTableRowsRecord } from "./contracts"

const record = (
 overrides: Partial<VtSyncDatasetTableRowsRecord>,
): VtSyncDatasetTableRowsRecord => ({
 id: "r",
 runId: "run",
 channelId: "UC1",
 datasetId: "geography_country",
 phase: "segments",
 capturedAt: "2026-09-14T00:00:00.000Z",
 rows: [{ country: "US", views: 1 }],
 provenance: "api",
 ...overrides,
} as VtSyncDatasetTableRowsRecord)

describe("persisted API hydration ignores windowed records", () => {
 it("never lets a windowed record hydrate the lifetime snapshot fields", () => {
  // A windowed record always has a LATER capturedAt than the lifetime pass
  // that preceded it in the same run, so a newest-wins rule would publish
  // 28-day rows as lifetime data to every table and visual.
  const state = toVtSyncPersistedApiState([
   record({
    id: "lifetime",
    window: "lifetime",
    capturedAt: "2026-09-14T00:00:00.000Z",
    rows: [{ country: "US", views: 1000 }],
   }),
   record({
    id: "w28",
    window: "28d",
    capturedAt: "2026-09-14T00:05:00.000Z",
    rows: [{ country: "US", views: 40 }],
   }),
  ], "UC1")

  const rows = Object.values(state.rowsByTableId)[0] as Array<Record<string, unknown>>
  expect(rows).toEqual([{ country: "US", views: 1000 }])
 })

 it("treats an untagged legacy record as lifetime", () => {
  const state = toVtSyncPersistedApiState([
   record({ id: "legacy", rows: [{ country: "US", views: 7 }] }),
  ], "UC1")
  expect(Object.keys(state.rowsByTableId).length).toBe(1)
 })

 it("hydrates nothing when only windowed records exist", () => {
  const state = toVtSyncPersistedApiState([
   record({ id: "w7", window: "7d" }),
  ], "UC1")
  expect(state.rowsByTableId).toEqual({})
 })
})
