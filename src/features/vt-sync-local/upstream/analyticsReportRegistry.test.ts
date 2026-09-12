import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import {
 createVtSyncCapabilityProbeRecord,
 VT_SYNC_ANALYTICS_REPORT_DEFINITIONS,
 VT_SYNC_ANALYTICS_REPORT_REGISTRY_VERSION,
 VT_SYNC_DETAIL_REPORT_CONTRACT_PAGE_SIZE,
 VT_SYNC_FROZEN_VISIBLE_DATASET_COUNT,
 VT_SYNC_VIDEO_ANALYTICS_CONTRACT_BATCH_SIZE,
} from "./analyticsReportRegistry"
import { VT_SYNC_SYNC_UNITS } from "./syncUnitRegistry"
import { VT_SYNC_VISIBLE_TABLE_DEFINITIONS } from "./tableRegistry"

const matrixPath = fileURLToPath(new URL("../../../../docs/analytics/youtube-analytics-dataset-expansion-matrix.csv", import.meta.url))
const matrixLines = readFileSync(matrixPath, "utf8").trim().split(/\r?\n/)
const matrixDatasetIds = matrixLines.slice(1).map((line) => line.slice(0, line.indexOf(",")))

describe("VT-SYNC analytics report registry v1", () => {
 it("freezes all 34 currently visible datasets exactly once", () => {
  const visibleIds = VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => table.id).sort()
  const contractIds = VT_SYNC_ANALYTICS_REPORT_DEFINITIONS.map((definition) => definition.tableId).sort()
  expect(visibleIds).toHaveLength(VT_SYNC_FROZEN_VISIBLE_DATASET_COUNT)
  expect(contractIds).toHaveLength(VT_SYNC_FROZEN_VISIBLE_DATASET_COUNT)
  expect(new Set(contractIds).size).toBe(contractIds.length)
  expect(contractIds).toEqual(visibleIds)
 })

 it("preserves each table's dataset and category ownership", () => {
  const tables = new Map(VT_SYNC_VISIBLE_TABLE_DEFINITIONS.map((table) => [table.id, table]))
  for (const definition of VT_SYNC_ANALYTICS_REPORT_DEFINITIONS) {
   const table = tables.get(definition.tableId)
   expect(table?.performanceHubDatasetId, definition.tableId).toBe(definition.datasetId)
   expect([...definition.categoryIds], definition.tableId).toEqual(table?.categoryIds)
   expect(definition.version).toBe(VT_SYNC_ANALYTICS_REPORT_REGISTRY_VERSION)
  }
 })

 it("keeps every declared controller owner aligned with its existing sync unit", () => {
  const units = new Map(VT_SYNC_SYNC_UNITS.map((unit) => [unit.id, unit]))
  for (const definition of VT_SYNC_ANALYTICS_REPORT_DEFINITIONS) {
   if (!definition.syncUnitId) continue
   const unit = units.get(definition.syncUnitId)
   expect(unit?.tableId, definition.tableId).toBe(definition.tableId)
   expect(
    definition.categoryIds.every((categoryId) => unit?.categoryIds.includes(categoryId)),
    definition.tableId,
   ).toBe(true)
  }
 })

 it("backs expansion references with unique rows in the checked-in matrix", () => {
  expect(matrixLines[0]).toBe("dataset_id,display_name,api,scope,current_state,target_state,dimensions_or_endpoint,required_filters,window_strategy,page_contract,availability,phase,notes")
  expect(matrixDatasetIds).toHaveLength(38)
  expect(new Set(matrixDatasetIds).size).toBe(matrixDatasetIds.length)
  for (const definition of VT_SYNC_ANALYTICS_REPORT_DEFINITIONS) {
   if (!definition.matrixDatasetId) continue
   expect(matrixDatasetIds, definition.tableId).toContain(definition.matrixDatasetId)
  }
 })

 it("freezes the existing safe batch and detail pagination contracts", () => {
  const videos = VT_SYNC_ANALYTICS_REPORT_DEFINITIONS.find((definition) => definition.tableId === "videos")
  expect(videos?.pagination).toEqual({ kind: "video_batch", batchSize: VT_SYNC_VIDEO_ANALYTICS_CONTRACT_BATCH_SIZE })
  const details = VT_SYNC_ANALYTICS_REPORT_DEFINITIONS.filter((definition) => definition.tableId.startsWith("traffic_detail_"))
  expect(details).toHaveLength(9)
  details.forEach((definition) => {
   expect(definition.pagination).toEqual({ kind: "detail", pageSize: VT_SYNC_DETAIL_REPORT_CONTRACT_PAGE_SIZE, requiresSort: true })
  })
 })

 it("records capability outcomes without accepting credential or raw-request fields", () => {
  const record = createVtSyncCapabilityProbeRecord({
   reportId: "playback_location_detail",
   outcome: "supported",
   observedAt: "2026-08-27T12:00:00.000Z",
   requestId: "probe-1",
   upstreamStatus: 200,
   channelFingerprint: "sha256:example",
  })
  expect(record).toEqual({
   registryVersion: 1,
   reportId: "playback_location_detail",
   outcome: "supported",
   observedAt: "2026-08-27T12:00:00.000Z",
   requestId: "probe-1",
   upstreamStatus: 200,
   channelFingerprint: "sha256:example",
  })
  expect(JSON.stringify(record)).not.toMatch(/token|cookie|authorization|filter|url|credential/i)
 })
})
