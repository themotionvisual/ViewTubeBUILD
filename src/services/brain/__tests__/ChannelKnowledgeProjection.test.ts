import { describe, expect, it } from "vitest"
import type {
 BrainMemoryClaim,
 ChannelKnowledgeModel,
} from "../../../types"
import {
 buildChannelKnowledgeProjection,
 retrieveChannelKnowledge,
 type ChannelKnowledgeLearningInput,
} from "../ChannelKnowledgeProjection"

const claim = (overrides: Partial<BrainMemoryClaim> = {}): BrainMemoryClaim => ({
 id: "claim-1",
 channelId: "channel-1",
 scope: "creator",
 category: "preference",
 value: "Prefer concise titles with one strong historical subject.",
 evidence: ["creator:preference:1"],
 confidence: "high",
 source: "copilot",
 createdAt: "2026-09-01T00:00:00.000Z",
 updatedAt: "2026-09-20T00:00:00.000Z",
 validFrom: "2026-09-01T00:00:00.000Z",
 validTo: null,
 confirmationState: "explicit",
 status: "active",
 learningEntryIds: ["learning-1"],
 ...overrides,

 it("deduplicates equivalent durable and model knowledge while preserving all provenance", () => {
  const projection = buildChannelKnowledgeProjection({
   channelId: "channel-1",
   claims: [claim({
    id: "durable-title-rule",
    value: "Prefer concise titles with one strong historical subject.",
    evidence: ["creator:preference:1"],
    confirmationState: "explicit",
    confidence: "high",
   })],
   knowledgeModel: model({
    creatorCommunication: [{
     id: "model-title-rule",
     label: "Title preference",
     summary: "Prefer concise titles with one strong historical subject.",
     confidence: "medium",
     evidenceIds: ["model:observation:1"],
    }],
   }),
   learningCandidates: [],
   now: "2026-09-24T00:00:00.000Z",
  })

  const retrieved = retrieveChannelKnowledge(projection, {
   query: "concise historical titles",
   limit: 5,
  })

  expect(retrieved.records).toHaveLength(1)
  expect(retrieved.records[0]).toMatchObject({
   id: "durable-title-rule",
   source: "brain_memory_claim",
   confirmationState: "explicit",
  })
  expect(retrieved.records[0].evidenceRefs).toEqual([
   "creator:preference:1",
   "model:observation:1",
  ])
  expect(retrieved.records[0].metadata).toMatchObject({
   mergedRecordIds: ["durable-title-rule", "model-title-rule"],
  })
 })

 it("uses canonical source authority before retrieval-score tie breaking for duplicate statements", () => {
  const projection = buildChannelKnowledgeProjection({
   channelId: "channel-1",
   claims: [claim({
    id: "confirmed-pattern",
    scope: "channel",
    category: "channel_fact",
    value: "Napoleon battle videos perform best with a named character in the promise.",
    confirmationState: "confirmed",
    confidence: "medium",
    evidence: ["creator:confirmed:1"],
   })],
   knowledgeModel: model({
    successDrivers: [{
     id: "model-pattern",
     label: "Packaging pattern",
     summary: "Napoleon battle videos perform best with a named character in the promise.",
     confidence: "high",
     evidenceIds: ["model:pattern:1", "model:pattern:2"],
    }],
   }),
   learningCandidates: [],
   now: "2026-09-24T00:00:00.000Z",
  })

  const retrieved = retrieveChannelKnowledge(projection, {
   query: "named character Napoleon battle promise",
  })

  expect(retrieved.records[0].id).toBe("confirmed-pattern")
  expect(retrieved.records[0].evidenceRefs).toEqual([
   "creator:confirmed:1",
   "model:pattern:1",
   "model:pattern:2",
  ])
 })

 it("keeps contradictions separate even when their normalized statement matches an ordinary record", () => {
  const statement = "Character-led thumbnails are the strongest packaging pattern."
  const projection = buildChannelKnowledgeProjection({
   channelId: "channel-1",
   claims: [claim({
    id: "active-pattern",
    value: statement,
    evidence: ["creator:visual:2"],
   })],
   knowledgeModel: model({
    contradictions: [{
     id: "contradiction-same-text",
     label: "Visual contradiction",
     summary: statement,
     confidence: "medium",
     evidenceIds: ["outcome:contradiction:1"],
    }],
   }),
   learningCandidates: [],
   now: "2026-09-24T00:00:00.000Z",
  })

  const retrieved = retrieveChannelKnowledge(projection, {
   query: "character thumbnails packaging",
  })

  expect(retrieved.records).toHaveLength(1)
  expect(retrieved.contradictions).toHaveLength(1)
  expect(retrieved.records[0].id).toBe("active-pattern")
  expect(retrieved.contradictions[0].id).toBe("contradiction-same-text")
 })

 it("applies the result limit after deduplication so duplicates do not consume retrieval slots", () => {
  const projection = buildChannelKnowledgeProjection({
   channelId: "channel-1",
   claims: [
    claim({ id: "claim-a", value: "Use concise Napoleon titles.", evidence: ["a"] }),
    claim({ id: "claim-b", value: "Use a clear first-frame battle image.", evidence: ["b"] }),
   ],
   knowledgeModel: model({
    creatorCommunication: [{
     id: "duplicate-a",
     label: "Title preference",
     summary: "Use concise Napoleon titles.",
     confidence: "medium",
     evidenceIds: ["a2"],
    }],
   }),
   learningCandidates: [],
   now: "2026-09-24T00:00:00.000Z",
  })

  const retrieved = retrieveChannelKnowledge(projection, {
   query: "Napoleon titles battle image",
   limit: 2,
  })

  expect(retrieved.records.map((record) => record.id)).toEqual(
   expect.arrayContaining(["claim-a", "claim-b"]),
  )
  expect(retrieved.records).toHaveLength(2)
 })
})

const model = (overrides: Partial<ChannelKnowledgeModel> = {}): ChannelKnowledgeModel => ({
 id: "knowledge-1",
 runId: "run-1",
 channelId: "channel-1",
 createdAt: "2026-09-01T00:00:00.000Z",
 updatedAt: "2026-09-20T00:00:00.000Z",
 niche: [],
 contentFormats: [],
 audience: [],
 visualIdentity: [],
 creatorCommunication: [],
 growthOpportunities: [],
 contradictions: [],
 summary: "Channel knowledge",
 confidence: "high",
 ...overrides,
})

const candidate = (
 overrides: Partial<ChannelKnowledgeLearningInput> = {},
): ChannelKnowledgeLearningInput => ({
 id: "candidate-1",
 channelId: "channel-1",
 statement: "Character-led battle packaging has repeated positive measured outcomes.",
 confidence: "medium",
 evidenceIds: ["outcome-1", "outcome-2", "outcome-3"],
 sampleSize: 3,
 reviewDecision: "approve_for_profile_review",
 ...overrides,
})

describe("ChannelKnowledgeProjection", () => {
 it("projects explicit creator preferences without losing provenance", () => {
  const result = buildChannelKnowledgeProjection({
   channelId: "channel-1",
   claims: [claim()],
   knowledgeModel: null,
   learningCandidates: [],
   now: "2026-09-24T00:00:00.000Z",
  })

  expect(result.records[0]).toMatchObject({
   knowledgeClass: "CREATOR_PREFERENCE",
   lifecycleState: "active",
   confirmationState: "explicit",
   evidenceRefs: ["creator:preference:1"],
  })
 })

 it("keeps expired performance knowledge out of active retrieval rather than treating it as current truth", () => {
  const projection = buildChannelKnowledgeProjection({
   channelId: "channel-1",
   claims: [claim({
    id: "analytics-1",
    scope: "analytics",
    category: "analytics_insight",
    value: "Browse traffic was unusually strong.",
    validTo: "2026-09-10T00:00:00.000Z",
   })],
   knowledgeModel: null,
   learningCandidates: [],
   now: "2026-09-24T00:00:00.000Z",
  })

  expect(projection.records[0].lifecycleState).toBe("stale")
  expect(retrieveChannelKnowledge(projection, { query: "browse traffic" }).records).toHaveLength(0)
 })

 it("preserves supersession links and excludes superseded claims from active retrieval", () => {
  const projection = buildChannelKnowledgeProjection({
   channelId: "channel-1",
   claims: [claim({
    status: "superseded",
    supersededByClaimId: "claim-2",
   })],
   knowledgeModel: null,
   learningCandidates: [],
   now: "2026-09-24T00:00:00.000Z",
  })

  expect(projection.records[0]).toMatchObject({
   lifecycleState: "superseded",
   supersededById: "claim-2",
  })
  expect(retrieveChannelKnowledge(projection, { query: "concise titles" }).records).toHaveLength(0)
 })

 it("never treats governance approval alone as validated learning", () => {
  const projection = buildChannelKnowledgeProjection({
   channelId: "channel-1",
   claims: [],
   knowledgeModel: null,
   learningCandidates: [candidate()],
   now: "2026-09-24T00:00:00.000Z",
  })

  expect(projection.records[0]).toMatchObject({
   knowledgeClass: "LEARNING_CANDIDATE",
   lifecycleState: "candidate",
  })
  expect(projection.records[0].knowledgeClass).not.toBe("VALIDATED_LEARNING")
 })

 it("projects rejected learning explicitly instead of deleting the historical decision", () => {
  const projection = buildChannelKnowledgeProjection({
   channelId: "channel-1",
   claims: [],
   knowledgeModel: null,
   learningCandidates: [candidate({ reviewDecision: "reject" })],
   now: "2026-09-24T00:00:00.000Z",
  })

  expect(projection.records[0]).toMatchObject({
   knowledgeClass: "REJECTED_LEARNING",
   lifecycleState: "rejected",
  })
 })

 it("surfaces model contradictions and ranks task-relevant current knowledge first", () => {
  const projection = buildChannelKnowledgeProjection({
   channelId: "channel-1",
   claims: [
    claim({
     id: "specific",
     value: "Use character-led thumbnail composition for Napoleon battle videos.",
     evidence: ["creator:visual:1"],
    }),
    claim({
     id: "generic",
     value: "The creator likes history videos.",
     confidence: "medium",
     evidence: ["creator:topic:1"],
    }),
   ],
   knowledgeModel: model({
    contradictions: [{
     id: "contradiction-1",
     label: "Thumbnail contradiction",
     summary: "Recent measured evidence does not consistently support character-led thumbnails.",
     confidence: "medium",
     evidenceIds: ["outcome-9"],
    }],
   }),
   learningCandidates: [],
   now: "2026-09-24T00:00:00.000Z",
  })

  expect(projection.records.some((record) => record.contradiction)).toBe(true)
  const retrieved = retrieveChannelKnowledge(projection, {
   query: "Napoleon character thumbnail",
   limit: 5,
  })
  expect(retrieved.records[0].id).toBe("specific")
  expect(retrieved.contradictions).toHaveLength(1)
 })
})
