import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const read = (name: string) =>
 readFileSync(new URL(`../${name}`, import.meta.url), "utf8")

describe("Algorithm Intelligence planning recovery", () => {
 it("preserves provenance for every recovered signal source", () => {
  const source = read("AlgorithmStrategyEngine.ts")
  expect(source).toContain('"channel_intelligence"')
  expect(source).toContain('"project"')
  expect(source).toContain('"priming_feedback"')
 })

 it("carries plan identity and evidence into priming handoffs", () => {
  const source = read("AlgorithmPrimingWorkflow.ts")
  expect(source).toContain("videoId: input.plan.videoId")
  expect(source).toContain("launchAt: input.plan.launchAt")
  expect(source).toContain("stepPayload: step.payload")
  expect(source).toContain("...input.plan.evidenceIds")
  expect(source).toContain("getReadyPrimingSteps")
  expect(source).toContain("step.dependsOn.every")
 })

 it("uses the canonical Algorithm Intelligence portfolio instead of reranking a parallel path", () => {
  const source = read("ChannelIntelligenceWorkflowPlanner.ts")
  expect(source).toContain("buildAlgorithmIntelligencePortfolio")
  expect(source).toContain("anomalies?: ExternalAnomalySignal[]")
  expect(source).toContain("opportunities?: OpportunityEvidence[]")
  expect(source).toContain("project?: AlgorithmProjectContext | null")
  expect(source).toContain("portfolio: AlgorithmIntelligencePortfolio")
  expect(source).toContain("primaryAlgorithmRecommendation: portfolio.primaryRecommendation")
  expect(source).not.toContain("buildChannelIntelligenceSnapshot")
  expect(source).not.toContain("rankAlgorithmRecommendations")
 })
})
