import { describe, expect, it } from "vitest"
import type { CanonicalIntelligenceEvidenceBundle } from "../../analytics-canon"
import { buildBrainEvidenceQuality } from "../BrainEvidenceQuality"

const evidenceBundle = (
 overrides: Partial<CanonicalIntelligenceEvidenceBundle> = {},
): CanonicalIntelligenceEvidenceBundle => ({
 version: "vt-intelligence-evidence-v1",
 snapshotId: "snapshot-1",
 channelId: "channel-1",
 channelName: "Test Channel",
 capturedAt: "2026-09-24T12:00:00.000Z",
 selectedWindow: "28d",
 generatedAt: "2026-09-24T12:00:00.000Z",
 coverage: {
  total: 2,
  available: 1,
  partial: 0,
  stale: 0,
  failed: 0,
  unavailable: 1,
  represented: 2,
 },
 datasets: [
  {
   id: "videos",
   label: "Videos",
   description: "Video evidence",
   categoryIds: ["video"],
   status: "available",
   rowCount: 3,
   updatedAt: "2026-09-24T11:00:00.000Z",
   sources: ["youtube_analytics_v2"],
   missingMetrics: [],
   columns: [],
   evidenceRefs: ["snapshot-1:videos:1"],
   metrics: {
    views: { count: 3, sum: 600, average: 200, minimum: 100, maximum: 300 },
   },
   sampleRows: [],
  },
  {
   id: "revenue",
   label: "Revenue",
   description: "Revenue evidence",
   categoryIds: ["revenue"],
   status: "unavailable",
   rowCount: 0,
   updatedAt: "2026-09-24T11:00:00.000Z",
   sources: ["youtube_analytics_v2"],
   missingMetrics: ["estimatedRevenue"],
   columns: [],
   evidenceRefs: [],
   metrics: {},
   sampleRows: [],
  },
 ],
 requestedSectionIds: [],
 omittedDatasetIds: [],
 contextText: "",
 ...overrides,
})

describe("buildBrainEvidenceQuality", () => {
 it("computes usable coverage from dataset states instead of represented catalog entries", () => {
  const result = buildBrainEvidenceQuality(evidenceBundle(), { expectedChannelId: "channel-1" })

  expect(result.coverageRatio).toBe(0.5)
  expect(result.confidence).toBe("medium")
  expect(result.scopeMatch).toBe("exact")
 })

 it("keeps unavailable evidence explicitly missing rather than manufacturing a zero-valued observation", () => {
  const result = buildBrainEvidenceQuality(evidenceBundle())

  expect(result.datasets.find((dataset) => dataset.datasetId === "revenue")).toMatchObject({
   epistemicState: "MISSING",
   evidenceRefs: [],
   missingMetrics: ["estimatedRevenue"],
  })
 })

 it("marks stale evidence as stale and lowers evidence confidence", () => {
  const input = evidenceBundle({
   coverage: { total: 2, available: 1, partial: 0, stale: 1, failed: 0, unavailable: 0, represented: 2 },
   datasets: evidenceBundle().datasets.map((dataset) =>
    dataset.id === "revenue"
     ? { ...dataset, status: "stale", rowCount: 1, evidenceRefs: ["snapshot-1:revenue:1"] }
     : dataset),
  })

  const result = buildBrainEvidenceQuality(input)

  expect(result.datasets.find((dataset) => dataset.datasetId === "revenue")?.epistemicState).toBe("STALE")
  expect(result.confidence).not.toBe("high")
 })

 it("fails closed when the evidence channel does not match the requested channel", () => {
  const result = buildBrainEvidenceQuality(evidenceBundle(), { expectedChannelId: "channel-2" })

  expect(result.scopeMatch).toBe("mismatch")
  expect(result.confidence).toBe("insufficient")
  expect(result.limitations).toContain("Canonical evidence belongs to a different channel than the active Brain task.")
 })
})
