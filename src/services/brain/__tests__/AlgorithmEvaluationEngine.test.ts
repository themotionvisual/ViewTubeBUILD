import { describe, expect, it } from "vitest"
import { evaluateAlgorithmEvent } from "../AlgorithmEvaluationEngine"
import type { AlgorithmIntelligenceEvent } from "../AlgorithmIntelligenceEventLedger"
import type { MetricComparisonContext } from "../../analytics-canon"

const comparisonContext = (
 overrides: Partial<MetricComparisonContext> = {},
): MetricComparisonContext => ({
 metricKey: "ctr",
 unit: "percent",
 entityScope: "video",
 formatScope: "long",
 window: "28d",
 aggregation: "snapshot",
 coverage: 1,
 availability: "available",
 ...overrides,
})

const event = (overrides: Partial<AlgorithmIntelligenceEvent> = {}): AlgorithmIntelligenceEvent => ({
 id: "algorithm-event:test",
 channelId: "channel-1",
 kind: "RECOMMENDATION_EXECUTED",
 sourceSystem: "workflow",
 sourceId: "signal-1",
 parentEventIds: [],
 recommendationId: "recommendation-1",
 evidenceIds: [],
 confidence: "high",
 title: "Test recommendation",
 summary: "Test",
 evaluationTargets: [
  { metric: "ctr", direction: "increase", baselineValue: 0.04, minimumRelativeChange: 0.05, windowHours: 72 },
 ],
 checkpointAt: 1_000,
 metadata: {},
 createdAt: 0,
 ...overrides,
})

describe("AlgorithmEvaluationEngine", () => {
 it("keeps an evaluation pending before its checkpoint", () => {
  const result = evaluateAlgorithmEvent({
   event: event(),
   observations: [{ metric: "ctr", value: 0.05, observedAt: 500 }],
   now: 500,
  })
  expect(result.status).toBe("pending")
 })

 it("marks a recommendation positive when its measured target is met", () => {
  const result = evaluateAlgorithmEvent({
   event: event(),
   observations: [{ metric: "ctr", value: 0.045, observedAt: 2_000, evidenceId: "evidence-1" }],
   now: 2_000,
  })
  expect(result.status).toBe("positive")
  expect(result.targetResults[0].status).toBe("met")
  expect(result.evidenceIds).toContain("evidence-1")
 })

 it("marks a recommendation negative when its measured target is missed", () => {
  const result = evaluateAlgorithmEvent({
   event: event(),
   observations: [{ metric: "ctr", value: 0.039, observedAt: 2_000 }],
   now: 2_000,
  })
  expect(result.status).toBe("negative")
  expect(result.targetResults[0].status).toBe("missed")
 })

 it("rejects semantically incomparable baseline/current evidence before calculating an outcome", () => {
  const result = evaluateAlgorithmEvent({
   event: event({
    evaluationTargets: [{
     metric: "ctr",
     direction: "increase",
     baselineValue: 4,
     minimumRelativeChange: 0.05,
     baselineComparisonContext: comparisonContext({ window: "28d" }),
    }],
   }),
   observations: [{
    metric: "ctr",
    value: 5,
    observedAt: 2_000,
    evidenceId: "evidence-current",
    comparisonContext: comparisonContext({ window: "90d" }),
   }],
   now: 2_000,
  })

  expect(result.status).toBe("insufficient_data")
  expect(result.targetResults[0].status).toBe("unavailable")
  expect(result.targetResults[0].comparability?.comparable).toBe(false)
  expect(result.targetResults[0].comparability?.reasons).toContainEqual(
   expect.objectContaining({ code: "window_mismatch" }),
  )
 })

 it("allows comparable canonical baseline/current evidence to be evaluated normally", () => {
  const context = comparisonContext()
  const result = evaluateAlgorithmEvent({
   event: event({
    evaluationTargets: [{
     metric: "ctr",
     direction: "increase",
     baselineValue: 4,
     minimumRelativeChange: 0.05,
     baselineComparisonContext: context,
    }],
   }),
   observations: [{
    metric: "ctr",
    value: 5,
    observedAt: 2_000,
    evidenceId: "evidence-current",
    comparisonContext: context,
   }],
   now: 2_000,
  })

  expect(result.status).toBe("positive")
  expect(result.targetResults[0].status).toBe("met")
  expect(result.targetResults[0].comparability).toEqual({ comparable: true, reasons: [] })
 })

 it("returns insufficient data rather than inventing an outcome", () => {
  const result = evaluateAlgorithmEvent({ event: event(), observations: [], now: 2_000 })
  expect(result.status).toBe("insufficient_data")
  expect(result.confidence).toBe("low")
 })

 it("can report mixed outcomes across multiple targets", () => {
  const result = evaluateAlgorithmEvent({
   event: event({
    evaluationTargets: [
     { metric: "ctr", direction: "increase", baselineValue: 0.04, minimumRelativeChange: 0.05 },
     { metric: "watch_quality", direction: "hold", baselineValue: 0.60, minimumRelativeChange: 0.05 },
    ],
   }),
   observations: [
    { metric: "ctr", value: 0.05, observedAt: 2_000 },
    { metric: "watch_quality", value: 0.50, observedAt: 2_000 },
   ],
   now: 2_000,
  })
  expect(result.status).toBe("mixed")
 })
})
