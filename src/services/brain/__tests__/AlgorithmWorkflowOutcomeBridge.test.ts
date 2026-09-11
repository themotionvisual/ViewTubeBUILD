import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
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
 return {
  event,
  listAlgorithmIntelligenceEvents: vi.fn(() => [event]),
  findAlgorithmEventByActionPacket: vi.fn(() => event),
  processAlgorithmEvaluation: vi.fn(() => ({
   evaluation: { status: "neutral" },
   recorded: { id: "measured-1" },
   learningEvents: [],
  })),
 }
})

vi.mock("../AlgorithmIntelligenceEventLedger", () => ({
 listAlgorithmIntelligenceEvents: mocks.listAlgorithmIntelligenceEvents,
 findAlgorithmEventByActionPacket: mocks.findAlgorithmEventByActionPacket,
}))

vi.mock("../BrainEvaluationLoop", () => ({
 processAlgorithmEvaluation: mocks.processAlgorithmEvaluation,
}))

import { recordAlgorithmWorkflowOutcome } from "../AlgorithmWorkflowOutcomeBridge"

describe("AlgorithmWorkflowOutcomeBridge", () => {
 beforeEach(() => {
  mocks.listAlgorithmIntelligenceEvents.mockClear()
  mocks.findAlgorithmEventByActionPacket.mockClear()
  mocks.processAlgorithmEvaluation.mockClear()
  mocks.findAlgorithmEventByActionPacket.mockReturnValue(mocks.event)
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
  expect(mocks.processAlgorithmEvaluation).toHaveBeenCalledOnce()
  expect(mocks.processAlgorithmEvaluation.mock.calls[0][0].observations).toEqual([
   expect.objectContaining({ metric: "diagnosis_complete", value: 1 }),
  ])
 })

 it("does not let workflow completion satisfy analytics targets", () => {
  mocks.findAlgorithmEventByActionPacket.mockReturnValue({
   ...mocks.event,
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
  expect(mocks.processAlgorithmEvaluation).not.toHaveBeenCalled()
 })

 it("does not evaluate non-terminal workflow states", () => {
  const result = recordAlgorithmWorkflowOutcome({
   channelId: "channel-1",
   actionPacketId: "packet-1",
   status: "opened",
  })
  expect(result.status).toBe("non_terminal")
  expect(mocks.processAlgorithmEvaluation).not.toHaveBeenCalled()
 })

 it("returns unattributed when no Algorithm event owns the workflow", () => {
  mocks.findAlgorithmEventByActionPacket.mockReturnValue(null)
  const result = recordAlgorithmWorkflowOutcome({
   channelId: "channel-1",
   actionPacketId: "missing-packet",
   status: "completed",
  })
  expect(result.status).toBe("unattributed")
  expect(mocks.processAlgorithmEvaluation).not.toHaveBeenCalled()
 })
})
