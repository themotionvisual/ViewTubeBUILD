import { describe, expect, it } from "vitest"
import type { CanonicalIntelligenceEvidenceBundle } from "../../analytics-canon"
import { buildStatisticsIntelligence } from "../StatisticsIntelligence"

const bundle = (overrides: Partial<CanonicalIntelligenceEvidenceBundle> = {}): CanonicalIntelligenceEvidenceBundle => ({
 version: "vt-intelligence-evidence-v1",
 snapshotId: "snap-1",
 channelId: "channel-1",
 channelName: "Test",
 capturedAt: "2026-09-17T00:00:00.000Z",
 selectedWindow: "28d",
 generatedAt: "2026-09-17T00:00:00.000Z",
 coverage: { total: 1, available: 1, partial: 0, stale: 0, failed: 0, unavailable: 0, represented: 1 },
 datasets: [{
  id: "videos",
  label: "Videos",
  description: "Video metrics",
  categoryIds: ["video"],
  status: "available",
  rowCount: 2,
  updatedAt: "2026-09-17T00:00:00.000Z",
  sources: ["youtube_analytics_v2"],
  missingMetrics: [],
  columns: [],
  evidenceRefs: ["analytics:videos"],
  metrics: { views: { count: 2, sum: 300, average: 150, minimum: 100, maximum: 200 } },
  sampleRows: [],
 }],
 requestedSectionIds: [],
 omittedDatasetIds: [],
 contextText: "",
 ...overrides,
})

describe("buildStatisticsIntelligence", () => {
 it("derives deterministic summaries with provenance", () => {
  const result = buildStatisticsIntelligence(bundle())
  expect(result.confidence).toBe("high")
  expect(result.coverageRatio).toBe(1)
  expect(result.metrics[0]).toMatchObject({ metric: "views", sum: 300, average: 150, range: 100, evidenceRef: "analytics:videos" })
 })

 it("fails closed when evidence is absent", () => {
  const result = buildStatisticsIntelligence(bundle({
   coverage: { total: 1, available: 0, partial: 0, stale: 0, failed: 0, unavailable: 1, represented: 0 },
   datasets: [],
  }))
  expect(result.confidence).toBe("insufficient")
  expect(result.metrics).toHaveLength(0)
  expect(result.limitations).toContain("No deterministic metric summaries were available.")
 })
})
