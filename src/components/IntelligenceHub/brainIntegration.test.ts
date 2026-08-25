import { beforeEach, describe, expect, it, vi } from "vitest"

const brainMocks = vi.hoisted(() => ({
 initializeBrain: vi.fn(),
 consultBrain: vi.fn(),
 getLatestChannelKnowledgeModelDB: vi.fn(),
 getLatestToolContextPackDB: vi.fn(),
 saveChannelKnowledgeModelDB: vi.fn(),
 saveGenerationRecordDB: vi.fn(),
 saveToolContextPackDB: vi.fn(),
}))

vi.mock("../../services/brain", () => brainMocks)

import type { CanonicalIntelligenceEvidenceBundle } from "../../services/analytics-canon"
import type { UltimateChannelReport } from "./types"
import { loadIntelligenceBrainContext, persistIntelligenceBrainArtifacts } from "./brainIntegration"

const evidence = {
 version: "vt-intelligence-evidence-v1",
 snapshotId: "snapshot-a",
 channelId: "channel-a",
 channelName: "Channel A",
 capturedAt: "2026-08-24T12:00:00.000Z",
 selectedWindow: "28d",
 generatedAt: "2026-08-24T12:00:01.000Z",
 coverage: { total: 34, available: 1, partial: 0, stale: 0, failed: 0, unavailable: 33, represented: 34 },
 datasets: [{ id: "videos", evidenceRefs: ["snapshot-a:videos:1"] }],
 requestedSectionIds: [],
 omittedDatasetIds: [],
 contextText: "real evidence",
} as unknown as CanonicalIntelligenceEvidenceBundle

const report = {
 meta: {
  generationId: "generation-a",
  generatedAt: "2026-08-24T12:00:02.000Z",
  dataSources: ["vt-sync"],
  contextMode: "auto",
  analysisMode: "channel",
  promptPackVersion: "v1",
  authoritativeSurface: "/analytics",
  channelId: "channel-a",
  snapshotId: "snapshot-a",
  datasetCoverage: evidence.coverage,
  omittedDatasetIds: [],
  aliases: [],
  diagnostics: { modelRecoveryApplied: false, missingSectionsRecovered: false, warningCount: 0 },
 },
 executiveSummary: "Evidence-backed summary",
 blocks: [],
 actionPlan: [],
 riskFlags: [],
 channelKnowledge: { id: "knowledge-a" },
 toolContextPack: { id: "context-a" },
} as unknown as UltimateChannelReport

describe("Intelligence Hub Brain integration", () => {
 beforeEach(() => {
  vi.clearAllMocks()
  brainMocks.initializeBrain.mockResolvedValue(undefined)
  brainMocks.consultBrain.mockResolvedValue({
   identityAndAspirations: "Build authority",
   contentDNA: "Documentary",
   performanceLedger: "Stable",
   futureStateMap: "Grow retention",
   learnedPreferences: "Concise",
  })
  brainMocks.getLatestChannelKnowledgeModelDB.mockResolvedValue(null)
  brainMocks.getLatestToolContextPackDB.mockResolvedValue(null)
  brainMocks.saveChannelKnowledgeModelDB.mockResolvedValue(undefined)
  brainMocks.saveGenerationRecordDB.mockResolvedValue(undefined)
  brainMocks.saveToolContextPackDB.mockResolvedValue(undefined)
 })

 it("consults the canonical Brain for the current channel", async () => {
  const context = await loadIntelligenceBrainContext("channel-a")
  expect(brainMocks.consultBrain).toHaveBeenCalledWith("intelligence-hub", { channelId: "channel-a", surface: "/analytics" })
  expect(context.contextText).toContain("Build authority")
 })

 it("persists generation, knowledge, and tool context with one channel scope", async () => {
  const result = await persistIntelligenceBrainArtifacts(report, evidence, "brain context")
  expect(result.status).toBe("persisted")
  expect(brainMocks.saveGenerationRecordDB).toHaveBeenCalledWith(expect.objectContaining({ channelId: "channel-a", id: "generation-a" }))
  expect(brainMocks.saveChannelKnowledgeModelDB).toHaveBeenCalled()
  expect(brainMocks.saveToolContextPackDB).toHaveBeenCalled()
 })

 it("rejects a write when the report snapshot no longer matches", async () => {
  const mismatched = { ...report, meta: { ...report.meta, snapshotId: "snapshot-b" } }
  const result = await persistIntelligenceBrainArtifacts(mismatched, evidence, "brain context")
  expect(result.status).toBe("failed")
  expect(brainMocks.saveGenerationRecordDB).not.toHaveBeenCalled()
 })

 it("rejects all Brain writes for an unusable failed report", async () => {
  const failed = { ...report, meta: { ...report.meta, overallStatus: "failed" as const } }
  const result = await persistIntelligenceBrainArtifacts(failed, evidence, "brain context")
  expect(result.status).toBe("failed")
  expect(brainMocks.saveGenerationRecordDB).not.toHaveBeenCalled()
  expect(brainMocks.saveChannelKnowledgeModelDB).not.toHaveBeenCalled()
  expect(brainMocks.saveToolContextPackDB).not.toHaveBeenCalled()
 })

 it("cancels before any Brain write when the generation signal is aborted", async () => {
  const controller = new AbortController()
  controller.abort()
  await expect(persistIntelligenceBrainArtifacts(report, evidence, "brain context", controller.signal)).rejects.toMatchObject({ name: "AbortError" })
  expect(brainMocks.saveGenerationRecordDB).not.toHaveBeenCalled()
 })
})
