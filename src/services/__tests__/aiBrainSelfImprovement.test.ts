import "fake-indexeddb/auto"
import { describe, expect, it } from "vitest"
import {
 buildAIBrainReflectionTrace,
 captureAIBrainLearningEvent,
 classifyAIBrainLearningEvent,
 listAIBrainLearningEntries,
 listAIBrainSkillResources,
 promoteAIBrainLearning,
 scoreAIBrainAnswerUsefulness,
} from "../aiBrainSelfImprovement"
import {
 listActiveBrainMemoryClaims,
 promoteBrainClaim,
 undoBrainMemoryClaim,
} from "../brain/BrainMemoryClaims"

describe("aiBrainSelfImprovement", () => {
 it("classifies creator corrections, sync failures, goals, and content style learnings", () => {
  expect(classifyAIBrainLearningEvent({ text: "Actually, that is wrong about my niche." })).toBe("correction")
  expect(classifyAIBrainLearningEvent({ source: "vt_sync", text: "8 sync bundles failed" })).toBe("sync_observation")
  expect(classifyAIBrainLearningEvent({ text: "My goal is more revenue this month" })).toBe("creator_goal")
  expect(classifyAIBrainLearningEvent({ text: "My editing style should feel fast and premium" })).toBe("content_style")
 })

 it("persists learning entries with self-reflecting traces", async () => {
  const channelId = `channel-${Date.now()}-persist`
  const entry = await captureAIBrainLearningEvent({
   channelId,
   source: "copilot",
   summary: "Creator wants a calmer publishing workflow",
   detail: "The creator prefers fewer uploads with stronger packaging.",
   category: "creator_goal",
   confidence: "high",
   evidence: ["Copilot conversation"],
  })
  const entries = await listAIBrainLearningEntries({ channelId })

  expect(entries[0]?.id).toBe(entry.id)
  expect(entries[0]?.reflectionTrace?.steps.map((step) => step.id)).toContain("contradiction_check")
  expect(entries[0]?.reflectionTrace?.overallConfidence).toBeDefined()
 })

 it("blocks correction and negative feedback from immediate durable promotion", async () => {
  const channelId = `channel-${Date.now()}-correction`
  const correction = await captureAIBrainLearningEvent({
   channelId,
   source: "feedback",
   summary: "Creator marked Copilot answer as inaccurate",
   detail: "The answer guessed a channel fact without evidence.",
   category: "correction",
   confidence: "high",
   evidence: ["Answer feedback"],
  })
  const candidate = await promoteAIBrainLearning(correction)

  expect(candidate.allowed).toBe(false)
  expect(candidate.blockedBy).toContain("feedback_requires_confirmation")
 })

 it("allows high-confidence positive creator learnings to become promotion candidates", async () => {
  const channelId = `channel-${Date.now()}-promotion`
  const entry = await captureAIBrainLearningEvent({
   channelId,
   source: "journal",
   summary: "Creator wants cinematic educational videos",
   detail: "The channel style should combine premium visuals with practical teaching.",
   category: "content_style",
   confidence: "high",
   evidence: ["AI Journal"],
  })
  const candidate = await promoteAIBrainLearning(entry)

  expect(candidate.allowed).toBe(true)
  expect(candidate.blockedBy).toEqual([])
  const claims = await listActiveBrainMemoryClaims(channelId)
  expect(claims.some((claim) => claim.value.includes("cinematic educational videos"))).toBe(true)
 })

 it("deduplicates recurring learning evidence and supports governed claim undo", async () => {
  const channelId = `channel-${Date.now()}-recurrence`
  const first = await captureAIBrainLearningEvent({
   channelId,
   source: "copilot",
   summary: "Creator prefers documentary pacing",
   detail: "Use measured narration and visual evidence.",
   category: "content_style",
   confidence: "medium",
   evidence: ["Conversation one"],
  })
  const recurring = await captureAIBrainLearningEvent({
   channelId,
   source: "journal",
   summary: "Creator prefers documentary pacing",
   detail: "Use measured narration and visual evidence.",
   category: "content_style",
   confidence: "high",
   evidence: ["AI Journal"],
  })
  const promoted = await promoteBrainClaim(recurring)

  expect(recurring.id).toBe(first.id)
  expect(recurring.recurrenceCount).toBe(2)
  expect(recurring.evidence).toEqual(expect.arrayContaining(["Conversation one", "AI Journal"]))
  expect(promoted.claim?.status).toBe("active")

  const undone = await undoBrainMemoryClaim(promoted.claim!.id)
  expect(undone?.status).toBe("undone")
  expect(await listActiveBrainMemoryClaims(channelId)).toHaveLength(0)
 })

 it("exposes runtime skill resources and answer quality scoring", () => {
  const resources = listAIBrainSkillResources()
  const trace = buildAIBrainReflectionTrace({
   id: "learning-1",
   channelId: null,
   category: "answer_quality",
   source: "feedback",
   summary: "Answer was too generic",
   detail: "Needs channel-specific evidence.",
   evidence: [],
   confidence: "medium",
   status: "captured",
   createdAt: "2026-07-15T00:00:00.000Z",
   updatedAt: "2026-07-15T00:00:00.000Z",
   recurrenceCount: 1,
   relatedEntryIds: [],
  })

  expect(resources.map((resource) => resource.sourceSkill)).toContain("self-reflecting-chain")
  expect(trace.steps.some((step) => step.decision === "ask_user" || step.decision === "hold")).toBe(true)
  expect(scoreAIBrainAnswerUsefulness({ response: "**bad** `format`", feedback: "inaccurate" })).toBeLessThan(30)
 })
})
