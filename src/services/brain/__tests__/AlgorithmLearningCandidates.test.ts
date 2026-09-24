import { beforeEach, describe, expect, it, vi } from "vitest"
import type { AlgorithmIntelligenceEvent } from "../AlgorithmIntelligenceEventLedger"

const mocks = vi.hoisted(() => ({
 list: vi.fn(),
 record: vi.fn(),
}))

vi.mock("../AlgorithmIntelligenceEventLedger", () => ({
 listAlgorithmIntelligenceEvents: mocks.list,
 recordAlgorithmIntelligenceEvent: mocks.record,
}))

import {
 deriveAlgorithmLearningCandidates,
 recordAlgorithmLearningCandidates,
} from "../AlgorithmLearningCandidates"

const measured = (
 id: string,
 status: "positive" | "negative" | "neutral" | "mixed" | "insufficient_data",
 overrides: Partial<AlgorithmIntelligenceEvent> = {},
): AlgorithmIntelligenceEvent => ({
 id,
 channelId: "channel-1",
 kind: "OUTCOME_MEASURED",
 sourceSystem: "evaluation",
 sourceId: "execution-1",
 parentEventIds: ["execution-1"],
 recommendationId: "recommendation:packaging:repackage",
 traceId: `trace-${id}`,
 outputRef: `response-${id}`,
 evidenceIds: [`evidence-${id}`],
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
   evidenceIds: [`evidence-${id}`],
   explanation: status,
   evaluatedAt: 1,
  },
 },
 createdAt: 1,
 ...overrides,
})

beforeEach(() => {
 vi.clearAllMocks()
 mocks.record.mockImplementation((input) => ({
  id: input.id,
  parentEventIds: input.parentEventIds || [],
  evidenceIds: input.evidenceIds || [],
  evaluationTargets: [],
  metadata: input.metadata || {},
  createdAt: 1,
  ...input,
 }))
})

describe("AlgorithmLearningCandidates governance", () => {
 it("does not count insufficient measurement as a decisive repeated outcome", () => {
  mocks.list.mockReturnValue([
   measured("positive-1", "positive"),
   measured("positive-2", "positive"),
   measured("insufficient-1", "insufficient_data"),
  ])

  const [candidate] = deriveAlgorithmLearningCandidates("channel-1")

  expect(candidate.sampleSize).toBe(3)
  expect(candidate.decisiveSampleSize).toBe(2)
  expect(candidate.status).toBe("insufficient_evidence")
 })

 it("creates a candidate after three decisive outcomes at a two-thirds positive rate", () => {
  mocks.list.mockReturnValue([
   measured("positive-1", "positive"),
   measured("positive-2", "positive"),
   measured("negative-1", "negative"),
  ])

  const [candidate] = deriveAlgorithmLearningCandidates("channel-1")

  expect(candidate.decisiveSampleSize).toBe(3)
  expect(candidate.positiveRate).toBeCloseTo(2 / 3)
  expect(candidate.status).toBe("candidate")
  expect(candidate.confidence).toBe("medium")
 })

 it("preserves trace and output provenance from every measured source event", () => {
  mocks.list.mockReturnValue([
   measured("positive-1", "positive"),
   measured("positive-2", "positive"),
   measured("positive-3", "positive"),
  ])

  const [candidate] = deriveAlgorithmLearningCandidates("channel-1")

  expect(candidate.traceIds).toEqual([
   "trace-positive-1",
   "trace-positive-2",
   "trace-positive-3",
  ])
  expect(candidate.outputRefs).toEqual([
   "response-positive-1",
   "response-positive-2",
   "response-positive-3",
  ])
  expect(candidate.evidenceIds).toEqual([
   "evidence-positive-1",
   "evidence-positive-2",
   "evidence-positive-3",
  ])
 })

 it("writes candidate provenance into the existing Algorithm learning event", () => {
  mocks.list.mockReturnValue([
   measured("positive-1", "positive"),
   measured("positive-2", "positive"),
   measured("positive-3", "positive"),
  ])

  recordAlgorithmLearningCandidates("channel-1")

  expect(mocks.record).toHaveBeenCalledWith(expect.objectContaining({
   kind: "LEARNING_CANDIDATE_CREATED",
   metadata: expect.objectContaining({
    candidate: expect.objectContaining({
     traceIds: expect.arrayContaining(["trace-positive-1", "trace-positive-2", "trace-positive-3"]),
     outputRefs: expect.arrayContaining(["response-positive-1", "response-positive-2", "response-positive-3"]),
    }),
   }),
  }))
 })
})
