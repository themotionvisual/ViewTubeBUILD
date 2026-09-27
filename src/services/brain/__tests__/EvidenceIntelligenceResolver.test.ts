import { describe, expect, it, vi } from "vitest"
import {
 resolveEvidenceIntelligence,
 type EvidenceIntelligenceResolverDependencies,
} from "../EvidenceIntelligenceResolver"

const canonicalEvidence = {
 snapshotId: "snapshot-1",
 channelId: "channel-1",
 selectedWindow: "28d",
 datasets: [],
 coverage: { total: 0 },
 omittedDatasetIds: [],
} as any

const evidenceQuality = {
 version: "vt-brain-evidence-quality-v1",
 scopeMatch: "exact",
 confidence: "high",
 coverageRatio: 1,
} as any

const statisticsIntelligence = {
 confidence: "high",
 selectedWindow: "28d",
 metrics: [],
 limitations: [],
} as any

const audienceIntelligence = {
 confidence: "medium",
 selectedWindow: "28d",
 signals: [],
 missingEvidence: [],
 evidenceBoundary: [],
} as any

const opportunities = [{
 id: "opportunity-1",
 kind: "emerging_search",
 channelId: "channel-1",
 confidence: 0.8,
 impactScore: 0.7,
 evidenceIds: ["evidence-1"],
}] as any

describe("EvidenceIntelligenceResolver", () => {
 it("builds one runtime evidence envelope from one canonical analytics snapshot", () => {
  const deps: EvidenceIntelligenceResolverDependencies = {
   getCanonicalEvidence: vi.fn(() => canonicalEvidence),
   buildQuality: vi.fn(() => evidenceQuality),
   buildStatistics: vi.fn(() => statisticsIntelligence),
   buildAudience: vi.fn(() => audienceIntelligence),
   buildOpportunities: vi.fn(() => opportunities),
  }

  const result = resolveEvidenceIntelligence({
   channelId: "channel-1",
   includeAudience: true,
   includeOpportunities: true,
   brainEvidencePack: { topVideos: [], searchTerms: [], trafficSources: [] } as any,
  }, deps)

  expect(result.version).toBe("vt-evidence-intelligence-v1")
  expect(result.canonicalEvidence).toBe(canonicalEvidence)
  expect(result.evidenceQuality).toBe(evidenceQuality)
  expect(result.statisticsIntelligence).toBe(statisticsIntelligence)
  expect(result.audienceIntelligence).toBe(audienceIntelligence)
  expect(result.opportunityEvidence).toBe(opportunities)
  expect(result.scopeUsable).toBe(true)
  expect(deps.getCanonicalEvidence).toHaveBeenCalledTimes(1)
 })

 it("blocks canonical analytics-derived specialists when evidence belongs to another channel", () => {
  const deps: EvidenceIntelligenceResolverDependencies = {
   getCanonicalEvidence: vi.fn(() => canonicalEvidence),
   buildQuality: vi.fn(() => ({ ...evidenceQuality, scopeMatch: "mismatch", confidence: "insufficient" }) as any),
   buildStatistics: vi.fn(() => statisticsIntelligence),
   buildAudience: vi.fn(() => audienceIntelligence),
   buildOpportunities: vi.fn(() => opportunities),
  }

  const result = resolveEvidenceIntelligence({
   channelId: "channel-2",
   includeAudience: true,
   includeOpportunities: true,
   brainEvidencePack: { topVideos: [], searchTerms: [], trafficSources: [] } as any,
  }, deps)

  expect(result.scopeUsable).toBe(false)
  expect(result.statisticsIntelligence).toBeNull()
  expect(result.audienceIntelligence).toBeNull()
  expect(result.opportunityEvidence).toBe(opportunities)
 })

 it("does not build optional audience or opportunity projections when the task does not request them", () => {
  const deps: EvidenceIntelligenceResolverDependencies = {
   getCanonicalEvidence: vi.fn(() => canonicalEvidence),
   buildQuality: vi.fn(() => evidenceQuality),
   buildStatistics: vi.fn(() => statisticsIntelligence),
   buildAudience: vi.fn(() => audienceIntelligence),
   buildOpportunities: vi.fn(() => opportunities),
  }

  const result = resolveEvidenceIntelligence({
   channelId: "channel-1",
   includeAudience: false,
   includeOpportunities: false,
  }, deps)

  expect(result.audienceIntelligence).toBeNull()
  expect(result.opportunityEvidence).toEqual([])
  expect(deps.buildAudience).not.toHaveBeenCalled()
  expect(deps.buildOpportunities).not.toHaveBeenCalled()
 })
})
