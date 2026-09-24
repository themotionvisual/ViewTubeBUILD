import { describe, expect, it } from "vitest"
import type { BrainTrace } from "../BrainTrace"
import type { BrainOutcomeRecord } from "../BrainOutcomeLedger"
import type { AlgorithmIntelligenceEvent } from "../AlgorithmIntelligenceEventLedger"
import {
 buildBrainOutcomeEvaluation,
 readBrainOutcomeEvaluation,
} from "../BrainOutcomeEvaluation"

const trace = (overrides: Partial<BrainTrace> = {}): BrainTrace => ({
 id: "trace-1",
 channelId: "channel-1",
 kind: "question",
 createdAt: "2026-09-24T12:00:00.000Z",
 completedAt: "2026-09-24T12:00:01.000Z",
 status: "complete",
 intent: "strategy",
 taskProfileId: "strategy",
 capabilitiesInvoked: ["channel-profile"],
 evidence: { requested: ["channel_knowledge"], returned: ["evidence-1"], missing: [] },
 context: { tokensEstimated: 500, sectionsIncluded: ["channel_knowledge"], sectionsDropped: [] },
 claims: { fabricated: [], unverifiedDerived: [] },
 promptVersions: { orchestrator: "brain-orchestrator-v2" },
 grades: { answerQuality: 82 },
 repairAttempts: 0,
 outputRef: "response-1",
 ...overrides,
})

const outcome = (
 kind: BrainOutcomeRecord["outcome"],
 overrides: Partial<BrainOutcomeRecord> = {},
): BrainOutcomeRecord => ({
 id: `outcome-${kind}`,
 channelId: "channel-1",
 sourceToolId: "brain-command-center",
 targetToolId: null,
 traceId: "trace-1",
 outputRef: "response-1",
 outcome: kind,
 summary: kind,
 evidence: [],
 confidence: "high",
 createdAt: 1,
 ...overrides,
})

describe("BrainOutcomeEvaluation", () => {
 it("treats creator acceptance as a creator decision, not measured performance success", () => {
  const result = buildBrainOutcomeEvaluation({
   trace: trace(),
   outcomes: [outcome("accepted")],
  })

  expect(result.creatorDecision).toBe("positive")
  expect(result.creatorOutcomeKinds).toEqual(["accepted"])
  expect(result.performanceState).toBe("not_measured")
  expect(result.overallState).toBe("creator_positive_unmeasured")
  expect(result.learningDisposition).toBe("hold_for_measurement")
 })

 it("treats correction as stronger corrective feedback without calling the recommendation a performance failure", () => {
  const result = buildBrainOutcomeEvaluation({
   trace: trace(),
   outcomes: [outcome("corrected")],
  })

  expect(result.creatorDecision).toBe("corrective")
  expect(result.performanceState).toBe("not_measured")
  expect(result.overallState).toBe("creator_corrective_unmeasured")
  expect(result.learningDisposition).toBe("candidate_correction")
 })

 it("marks conflicting creator decisions as mixed", () => {
  const result = buildBrainOutcomeEvaluation({
   trace: trace(),
   outcomes: [
    outcome("accepted", { id: "accepted-1", createdAt: 1 }),
    outcome("rejected", { id: "rejected-1", createdAt: 2 }),
   ],
  })

  expect(result.creatorDecision).toBe("mixed")
  expect(result.overallState).toBe("creator_mixed_unmeasured")
  expect(result.outcomeIds).toEqual(["accepted-1", "rejected-1"])
 })

 it("stays pending when no attributed creator outcome exists", () => {
  const result = buildBrainOutcomeEvaluation({
   trace: trace(),
   outcomes: [],
  })

  expect(result.creatorDecision).toBe("pending")
  expect(result.overallState).toBe("pending")
  expect(result.learningDisposition).toBe("hold")
 })

 it("ignores outcomes that do not match both trace and output refs", () => {
  const result = buildBrainOutcomeEvaluation({
   trace: trace(),
   outcomes: [
    outcome("accepted", { traceId: "trace-other" }),
    outcome("rejected", { outputRef: "response-other" }),
   ],
  })

  expect(result.creatorDecision).toBe("pending")
  expect(result.outcomeIds).toEqual([])
 })

 it("joins canonical trace and outcomes through injectable readers", () => {
  const result = readBrainOutcomeEvaluation("trace-1", {
   listBrainTraces: () => [trace()],
   listBrainOutcomesForTrace: () => [outcome("completed")],
  })

  expect(result).toMatchObject({
   traceId: "trace-1",
   outputRef: "response-1",
   creatorDecision: "positive",
   performanceState: "not_measured",
  })
 })

 it("returns null rather than inventing an evaluation when the trace is missing", () => {
  const result = readBrainOutcomeEvaluation("missing", {
   listBrainTraces: () => [],
   listBrainOutcomesForTrace: () => [],
  })

  expect(result).toBeNull()
 })

 const measuredEvent = (
  status: "positive" | "neutral" | "negative" | "mixed" | "insufficient_data",
  overrides: Partial<AlgorithmIntelligenceEvent> = {},
 ): AlgorithmIntelligenceEvent => ({
  id: `measured-${status}`,
  channelId: "channel-1",
  kind: "OUTCOME_MEASURED",
  sourceSystem: "evaluation",
  sourceId: "execution-1",
  parentEventIds: ["execution-1"],
  recommendationId: "recommendation-1",
  traceId: "trace-1",
  outputRef: "response-1",
  evidenceIds: ["metric-evidence-1"],
  confidence: status === "insufficient_data" ? "low" : "high",
  title: "Measured outcome",
  summary: status,
  evaluationTargets: [],
  metadata: {
   evaluation: {
    eventId: "execution-1",
    channelId: "channel-1",
    status,
    confidence: status === "insufficient_data" ? "low" : "high",
    targetResults: [],
    evidenceIds: ["metric-evidence-1"],
    explanation: status,
    evaluatedAt: 2,
   },
  },
  createdAt: 2,
  ...overrides,
 })

 it("combines creator acceptance with positive measured performance without treating either as the other", () => {
  const result = buildBrainOutcomeEvaluation({
   trace: trace(),
   outcomes: [outcome("accepted")],
   measuredEvents: [measuredEvent("positive")],
  })

  expect(result.creatorDecision).toBe("positive")
  expect(result.performanceState).toBe("positive")
  expect(result.creatorPerformanceAlignment).toBe("aligned")
  expect(result.measuredEventIds).toEqual(["measured-positive"])
  expect(result.performanceEvidenceRefs).toEqual(["metric-evidence-1"])
  expect(result.learningDisposition).toBe("measured_observation")
 })

 it("surfaces disagreement when creator acceptance is followed by negative measured performance", () => {
  const result = buildBrainOutcomeEvaluation({
   trace: trace(),
   outcomes: [outcome("accepted")],
   measuredEvents: [measuredEvent("negative")],
  })

  expect(result.creatorDecision).toBe("positive")
  expect(result.performanceState).toBe("negative")
  expect(result.creatorPerformanceAlignment).toBe("conflicted")
  expect(result.learningDisposition).toBe("measured_observation")
 })

 it("keeps insufficient measurement distinct from negative performance", () => {
  const result = buildBrainOutcomeEvaluation({
   trace: trace(),
   outcomes: [outcome("completed")],
   measuredEvents: [measuredEvent("insufficient_data")],
  })

  expect(result.performanceState).toBe("insufficient_data")
  expect(result.creatorPerformanceAlignment).toBe("unknown")
  expect(result.learningDisposition).toBe("insufficient_measurement")
 })

 it("combines conflicting measured results as mixed instead of selecting a convenient winner", () => {
  const result = buildBrainOutcomeEvaluation({
   trace: trace(),
   outcomes: [outcome("accepted")],
   measuredEvents: [
    measuredEvent("positive", { id: "measured-a" }),
    measuredEvent("negative", { id: "measured-b" }),
   ],
  })

  expect(result.performanceState).toBe("mixed")
  expect(result.creatorPerformanceAlignment).toBe("not_applicable")
  expect(result.measuredEventIds).toEqual(["measured-a", "measured-b"])
 })

 it("ignores measured events that do not match both the Brain trace and output ref", () => {
  const result = buildBrainOutcomeEvaluation({
   trace: trace(),
   outcomes: [outcome("accepted")],
   measuredEvents: [
    measuredEvent("positive", { traceId: "trace-other" }),
    measuredEvent("negative", { outputRef: "response-other" }),
   ],
  })

  expect(result.performanceState).toBe("not_measured")
  expect(result.measuredEventIds).toEqual([])
 })

 it("reads measured Algorithm outcomes from the canonical event ledger source", () => {
  const result = readBrainOutcomeEvaluation("trace-1", {
   listBrainTraces: () => [trace()],
   listBrainOutcomesForTrace: () => [outcome("accepted")],
   listAlgorithmIntelligenceEvents: () => [measuredEvent("positive")],
  })

  expect(result).toMatchObject({
   creatorDecision: "positive",
   performanceState: "positive",
   creatorPerformanceAlignment: "aligned",
  })
 })

})
