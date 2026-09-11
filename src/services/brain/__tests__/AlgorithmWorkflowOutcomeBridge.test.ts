import { beforeEach, describe, expect, it, vi } from "vitest"

const event = {
 id: "algorithm-event:1",
 channelId: "channel-1",
 kind: "RECOMMENDATION_EXECUTED" as const,
 sourceSystem: "workflow" as const,
 sourceId: "signal-1",
 parentEventIds: [],
 recommendationId: "recommendation-1",
 actionPacketId: "packet-1",
 workflowId: "workflow-1",
 evidenceIds: [],
 confidence: "high" as const,
 title: "Inspect analytics",
 summary: "Inspect the affected analytics context.",
 evaluationTargets: [{ metric: "diagnosis_complete", direction: "inspect" as const, windowHours: 24 }],
 checkpointAt: 1_000,
 metadata: {},
 createdAt: 0,
}

const listAlgorithmIntelligenceEvents = vi.fn(() => [event])
const findAlgorithmEventByActionPacket = vi.fn(() => event)
const processAlgorithmEvaluation = vi.fn(() => ({
 evaluation: { status: "neutral" },
 recorded: { id: "measured-1" },
 learningEvents: [],
}))

vi.mock("../AlgorithmIntelligenceEventLedger", () => ({
 listAlgorithmIntelligenceEvents,
 findAlgorithmEventByActionPacket,
}))

vi.mock("../BrainEvaluationLoop", () => ({
 processAlgorithmEvaluation,
}))

import { recordAlgorithmWorkflowOutcome } from "../AlgorithmWorkflowOutcomeBridge"

describe("AlgorithmWorkflowOutcomeBridge", () => {
 beforeEach(() => {
  listAlgorithmIntelligenceEvents.mockClear()
  findAlgorithmEventByActionPacket.mockClear()
  processAlgorithmEvaluation.mockClear()
  findAlgorithmEventByActionPacket.mockReturnValue(event)
 })

 it("can satisfy a declared workflow-native completion target", () => {
  const result = recordAlgorithmWorkflowOutcome({
   channelId: "channel-1",
   actionPacketId: "packet-1",
   status: "completed",
   completedAt: 2_000,
   evidenceIds: ["outcome-1"],
  })
  expect(result.status).toBe("evaluated")
  expect(processAlgorithmEvaluation).toHaveBeenCalledOnce()
  expect(processAlgorithmEvaluation.mock.calls[0][0].observations).toEqual([
   expect.objectContaining({ metric: "diagnosis_complete", value: 1 }),
  ])
 })

 it("does not let workflow completion satisfy analytics targets", () => {
  findAlgorithmEventByActionPacket.mockReturnValue({
   ...event,
   evaluationTargets: [
    { metric: "ctr", direction: "increase", windowHours: 72 },
    { metric: "watch_quality", direction: "hold", windowHours: 72 },
   ],
  })
  const result = recordAlgorithmWorkflowOutcome({
   channelId: "channel-1",
   actionPacketId: "packet-1",
   status: "completed",
  })
  expect(result.status).toBe("no_workflow_target")
  expect(processAlgorithmEvaluation).not.toHaveBeenCalled()
 })

 it("does not evaluate non-terminal workflow states", () => {
  const result = recordAlgorithmWorkflowOutcome({
   channelId: "channel-1",
   actionPacketId: "packet-1",
   status: "opened",
  })
  expect(result.status).toBe("non_terminal")
  expect(processAlgorithmEvaluation).not.toHaveBeenCalled()
 })

 it("returns unattributed when no Algorithm event owns the workflow", () => {
  findAlgorithmEventByActionPacket.mockReturnValue(null)
  const result = recordAlgorithmWorkflowOutcome({
   channelId: "channel-1",
   actionPacketId: "missing-packet",
   status: "completed",
  })
  expect(result.status).toBe("unattributed")
  expect(processAlgorithmEvaluation).not.toHaveBeenCalled()
 })
})
