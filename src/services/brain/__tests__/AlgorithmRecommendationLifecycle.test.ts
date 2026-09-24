import { beforeEach, describe, expect, it, vi } from "vitest"
import type { AlgorithmRecommendation } from "../AlgorithmStrategyEngine"

const mocks = vi.hoisted(() => ({
 handoff: vi.fn(),
 record: vi.fn(),
 attach: vi.fn(),
}))

vi.mock("../BrainSuperToolBridge", () => ({
 createBrainSuperToolHandoff: mocks.handoff,
}))
vi.mock("../AlgorithmIntelligenceEventLedger", () => ({
 recordAlgorithmIntelligenceEvent: mocks.record,
}))
vi.mock("../AlgorithmMonitoringSchedule", () => ({
 attachAlgorithmMonitoringSchedule: mocks.attach,
}))

import {
 createAlgorithmRecommendationHandoff,
 evaluationTargetsForAlgorithmRecommendation,
} from "../AlgorithmWorkflowRecipes"

const recommendation = (
 overrides: Partial<AlgorithmRecommendation> = {},
): AlgorithmRecommendation => ({
 id: "recommendation-1",
 channelId: "channel-1",
 signalId: "signal-1",
 signalOrigin: "anomaly",
 command: "REPACKAGE",
 title: "REPACKAGE: test video",
 rationale: "Packaging weakened while watch quality held.",
 confidence: "high",
 score: 88,
 evidenceIds: ["evidence-1"],
 targetToolId: "packaging-lab-pro",
 checkpoint: "Compare CTR and watch quality after the intervention.",
 guardrails: ["Change one packaging variable at a time."],
 payload: { videoId: "video-1" },
 ...overrides,
})

beforeEach(() => {
 vi.clearAllMocks()
 mocks.handoff.mockResolvedValue({
  packet: { id: "packet-1" },
  chain: { id: "workflow-1" },
  recordId: "generation-1",
 })
 mocks.record.mockImplementation((input) => ({
  id: input.id || "algorithm-event-1",
  parentEventIds: input.parentEventIds || [],
  evidenceIds: input.evidenceIds || [],
  evaluationTargets: input.evaluationTargets || [],
  metadata: input.metadata || {},
  createdAt: 100,
  ...input,
 }))
 mocks.attach.mockImplementation((event) => event)
})

describe("Algorithm recommendation lifecycle writer", () => {
 it("uses the existing Phase 6 deterministic evaluation-target policy", () => {
  expect(evaluationTargetsForAlgorithmRecommendation(recommendation())).toEqual([
   { metric: "ctr", direction: "increase", minimumRelativeChange: .05, windowHours: 72 },
   { metric: "watch_quality", direction: "hold", minimumRelativeChange: .05, windowHours: 72 },
  ])
  expect(evaluationTargetsForAlgorithmRecommendation(recommendation({
   command: "INSPECT",
   targetToolId: "cinematic-analytics-lab",
  }))).toEqual([
   { metric: "diagnosis_complete", direction: "inspect", windowHours: 24 },
  ])
 })

 it("records an executed recommendation with action/workflow and Brain trace lineage", async () => {
  const result = await createAlgorithmRecommendationHandoff({
   recommendation: recommendation(),
   projectId: "project-1",
   traceId: "trace-1",
   outputRef: "response-1",
  })

  expect(mocks.handoff).toHaveBeenCalledWith(expect.objectContaining({
   channelId: "channel-1",
   traceId: "trace-1",
   outputRef: "response-1",
  }))
  expect(mocks.record).toHaveBeenCalledWith(expect.objectContaining({
   kind: "RECOMMENDATION_EXECUTED",
   recommendationId: "recommendation-1",
   actionPacketId: "packet-1",
   workflowId: "workflow-1",
   traceId: "trace-1",
   outputRef: "response-1",
   evaluationTargets: expect.arrayContaining([
    expect.objectContaining({ metric: "ctr", direction: "increase" }),
   ]),
  }))
  expect(mocks.attach).toHaveBeenCalledTimes(1)
  expect(result).toMatchObject({
   status: "handoff_created",
   event: expect.objectContaining({ traceId: "trace-1", outputRef: "response-1" }),
  })
 })

 it("records HOLD as a monitored recommendation without fabricating a handoff", async () => {
  const result = await createAlgorithmRecommendationHandoff({
   recommendation: recommendation({
    command: "HOLD",
    targetToolId: null,
   }),
   traceId: "trace-hold",
   outputRef: "response-hold",
  })

  expect(mocks.handoff).not.toHaveBeenCalled()
  expect(mocks.record).toHaveBeenCalledWith(expect.objectContaining({
   kind: "RECOMMENDATION_CREATED",
   traceId: "trace-hold",
   outputRef: "response-hold",
  }))
  expect(result.status).toBe("hold")
 })
})
