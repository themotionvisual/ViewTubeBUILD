import { describe, expect, it } from "vitest"
import { normalizeVtSyncSnapshot } from "../../features/vt-sync-local/adapters/snapshot"
import { VT_SYNC_VISIBLE_TABLE_DEFINITIONS } from "../../features/vt-sync-local/upstream/tableRegistry"
import {
 CANONICAL_INTELLIGENCE_DATASET_COUNT,
 buildCanonicalIntelligenceEvidence,
 getCanonicalIntelligenceDatasetCatalog,
} from "./intelligenceEvidence"

const snapshot = normalizeVtSyncSnapshot({
 source: "vt-sync",
 snapshotId: "snapshot-34",
 capturedAt: "2026-08-24T12:00:00.000Z",
 channelId: "channel-a",
 channelName: "Channel A",
 selectedTimeWindow: "28d",
 videos: [{ id: "video-1", title: "Real row", metrics: { views: 0, impressions: 100 } }],
 dailyMetrics: [{ date: "2026-08-23", views: 0, impressions: 100 }],
 datasetFreshness: {
  videos: { status: "synced", source: "current_run", rows: 1, updatedAt: "2026-08-24T12:00:00.000Z" },
  daily: { status: "partial", source: "manual_import", rows: 1, missingMetrics: ["ctr"] },
  revenue: { status: "failed", source: "previous_snapshot", rows: 0 },
 },
})

describe("canonical intelligence evidence", () => {
 it("represents every active VT-SYNC dataset exactly once", () => {
  const catalog = getCanonicalIntelligenceDatasetCatalog(snapshot, 1)
  expect(VT_SYNC_VISIBLE_TABLE_DEFINITIONS).toHaveLength(CANONICAL_INTELLIGENCE_DATASET_COUNT)
  expect(catalog).toHaveLength(CANONICAL_INTELLIGENCE_DATASET_COUNT)
  expect(new Set(catalog.map((dataset) => dataset.id)).size).toBe(CANONICAL_INTELLIGENCE_DATASET_COUNT)
 })

 it("preserves zero values and distinguishes unavailable, partial, and failed datasets", () => {
  const catalog = getCanonicalIntelligenceDatasetCatalog(snapshot, 1)
  const videos = catalog.find((dataset) => dataset.id === "videos")!
  const daily = catalog.find((dataset) => dataset.id === "daily")!
  const revenue = catalog.find((dataset) => dataset.id === "revenue")!
  expect(videos.status).toBe("available")
  expect(videos.sampleRows[0].views).toBe(0)
  expect(daily.status).toBe("partial")
  expect(daily.sources).toContain("manual_import")
  expect(daily.missingMetrics).toContain("ctr")
  expect(revenue.status).toBe("failed")
  expect(catalog.find((dataset) => dataset.id === "ads")?.status).toBe("unavailable")
 })

 it("pins channel and snapshot identity and bounds report context", () => {
  const evidence = buildCanonicalIntelligenceEvidence(snapshot, {
   sectionIds: ["executive-summary"],
   maximumRowsPerDataset: 1,
   maximumCharacters: 1_600,
  })
  expect(evidence.snapshotId).toBe("snapshot-34")
  expect(evidence.channelId).toBe("channel-a")
  expect(evidence.coverage.total).toBe(CANONICAL_INTELLIGENCE_DATASET_COUNT)
  expect(evidence.coverage.represented).toBe(CANONICAL_INTELLIGENCE_DATASET_COUNT)
  expect(evidence.contextText.length).toBeLessThanOrEqual(1_600)
  expect(evidence.contextText).toContain("DATASET videos")
  expect(evidence.contextText).not.toContain("DATASET revenue")
 })
})
