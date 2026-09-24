import { describe, expect, it, vi } from "vitest"
import type { AlgorithmIntelligenceEvent } from "../AlgorithmIntelligenceEventLedger"

const mocks = vi.hoisted(() => ({
 list: vi.fn(),
 record: vi.fn(),
}))

vi.mock("../AlgorithmIntelligenceEventLedger", () => ({
 listAlgorithmIntelligenceEvents: mocks.list,
 recordAlgorithmIntelligenceEvent: mocks.record,
}))

import { recordAlgorithmEvaluation } from "../AlgorithmEvaluationEngine"

const source: AlgorithmIntelligenceEvent = {
 id: "execution-1",
 channelId: "channel-1",
 kind: "RECOMMENDATION_EXECUTED",
 sourceSystem: "workflow",
 sourceId: "signal-1",
 parentEventIds: [],
 recommendationId: "recommendation-1",
 actionPacketId: "packet-1",
 workflowId: "workflow-1",
 traceId: "trace-1",
 outputRef: "response-1",
 evidenceIds: ["source-evidence"],
 confidence: "high",
 title: "Repackage",
 summary: "Test",
 evaluationTargets: [{
  metric: "ctr",
  direction: "increase",
  baselineValue: .04,
  minimumRelativeChange: .05,
  windowHours: 72,
 }],
 checkpointAt: 1_000,
 metadata: {},
 createdAt: 1,
}

describe("Algorithm measured-outcome attribution", () => {
 it("preserves Brain trace and output lineage into OUTCOME_MEASURED", () => {
  mocks.list.mockReturnValue([source])
  mocks.record.mockImplementation((input) => ({ id: input.id, ...input }))

  const result = recordAlgorithmEvaluation({
   sourceEventId: "execution-1",
   observations: [{
    metric: "ctr",
    value: .05,
    observedAt: 2_000,
    evidenceId: "measured-evidence",
   }],
   now: 2_000,
  })

  expect(result.evaluation.status).toBe("positive")
  expect(mocks.record).toHaveBeenCalledWith(expect.objectContaining({
   kind: "OUTCOME_MEASURED",
   parentEventIds: ["execution-1"],
   recommendationId: "recommendation-1",
   actionPacketId: "packet-1",
   workflowId: "workflow-1",
   traceId: "trace-1",
   outputRef: "response-1",
   evidenceIds: ["measured-evidence"],
  }))
 })
})
