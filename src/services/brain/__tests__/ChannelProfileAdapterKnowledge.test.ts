import { describe, expect, it } from "vitest"
import type { BrainMemoryClaim, ChannelKnowledgeModel } from "../../../types"
import {
 buildChannelKnowledgeContextFromProfile,
 type BrainChannelProfileBundle,
} from "../ChannelProfileAdapter"

const claim = (overrides: Partial<BrainMemoryClaim> = {}): BrainMemoryClaim => ({
 id: "claim-1",
 channelId: "channel-1",
 scope: "creator",
 category: "preference",
 value: "Use direct subject-first Napoleon titles.",
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
})

const knowledgeModel = (): ChannelKnowledgeModel => ({
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
 contradictions: [{
  id: "contradiction-1",
  label: "Title contradiction",
  summary: "Recent measured outcomes do not consistently support question-led titles.",
  confidence: "medium",
  evidenceIds: ["outcome-9"],
 }],
 summary: "Channel knowledge",
 confidence: "high",
})

const profile = (
 overrides: Partial<BrainChannelProfileBundle> = {},
): BrainChannelProfileBundle => ({
 channelId: "channel-1",
 personalizationEnabled: true,
 analyticsEnabled: true,
 knowledgeModel: knowledgeModel(),
 toolContextPack: null,
 evidencePacket: null,
 nicheKnowledge: null,
 memoryClaims: [claim()],
 loadedAt: "2026-09-24T00:00:00.000Z",
 ...overrides,
})

describe("ChannelProfileAdapter Channel Knowledge", () => {
 it("retrieves task-relevant channel knowledge with provenance and contradictions", () => {
  const result = buildChannelKnowledgeContextFromProfile({
   profile: profile(),
   query: "Napoleon title packaging",
   limit: 6,
  })

  expect(result).not.toBeNull()
  expect(result?.records[0]).toMatchObject({
   id: "claim-1",
   knowledgeClass: "CREATOR_PREFERENCE",
   evidenceRefs: ["creator:preference:1"],
  })
  expect(result?.contradictions[0]).toMatchObject({
   id: "contradiction-1",
   contradiction: true,
   evidenceRefs: ["outcome-9"],
  })
 })

 it("returns no durable context when creator personalization is disabled", () => {
  const result = buildChannelKnowledgeContextFromProfile({
   profile: profile({
    personalizationEnabled: false,
    memoryClaims: [],
    knowledgeModel: null,
   }),
   query: "titles",
  })

  expect(result).toBeNull()
 })

 it("never returns knowledge from a different channel", () => {
  const result = buildChannelKnowledgeContextFromProfile({
   profile: profile({
    channelId: "channel-2",
    memoryClaims: [claim({ channelId: "channel-1" })],
    knowledgeModel: null,
   }),
   query: "Napoleon titles",
  })

  expect(result?.records).toHaveLength(0)
 })
})
