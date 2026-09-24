import { describe, expect, it } from "vitest"
import type { BrainTaskProfile } from "../BrainTaskProfileRegistry"
import { resolveBrainContextPlan } from "../BrainContextResolver"

const task = (overrides: Partial<BrainTaskProfile> = {}): BrainTaskProfile => ({
 id: "strategy",
 intent: "strategy",
 answerMode: "strategy_brief",
 requestedCount: 3,
 explicitSubject: null,
 ...overrides,
})

describe("BrainContextResolver", () => {
 it("derives deterministic context requirements from the resolved task and capabilities", () => {
  const plan = resolveBrainContextPlan({
   taskProfile: task(),
   capabilityIds: [
    "statistics-intelligence",
    "algorithm-intelligence",
    "channel-profile",
    "niche-knowledge",
   ],
   channelId: "channel-1",
   projectId: "project-1",
   personalizationEnabled: true,
   analyticsEnabled: true,
   algorithmEnabled: true,
   timelyRequest: false,
  })

  expect(plan.requires).toMatchObject({
   canonicalAnalytics: true,
   statistics: true,
   audience: false,
   algorithm: true,
   channelKnowledge: true,
   nicheKnowledge: true,
   currentResearch: false,
   projectContext: true,
  })
  expect(plan.omissions).toEqual([])
 })

 it("enables audience context only for audience work with usable analytics", () => {
  const plan = resolveBrainContextPlan({
   taskProfile: task({ id: "audience", intent: "audience", answerMode: "audience_insight" }),
   capabilityIds: ["statistics-intelligence", "audience-promise"],
   channelId: "channel-1",
   projectId: null,
   personalizationEnabled: true,
   analyticsEnabled: true,
   algorithmEnabled: false,
   timelyRequest: false,
  })

  expect(plan.requires.statistics).toBe(true)
  expect(plan.requires.audience).toBe(true)
  expect(plan.budget.maximumCharacters).toBeGreaterThanOrEqual(26_000)
 })

 it("fails closed on private analytics and durable knowledge when creator controls disable them", () => {
  const plan = resolveBrainContextPlan({
   taskProfile: task({ id: "analytics", intent: "analytics", answerMode: "analytics_diagnosis" }),
   capabilityIds: ["statistics-intelligence", "algorithm-intelligence", "channel-profile"],
   channelId: "channel-1",
   projectId: "project-1",
   personalizationEnabled: false,
   analyticsEnabled: false,
   algorithmEnabled: true,
   timelyRequest: false,
  })

  expect(plan.requires.canonicalAnalytics).toBe(false)
  expect(plan.requires.statistics).toBe(false)
  expect(plan.requires.algorithm).toBe(false)
  expect(plan.requires.channelKnowledge).toBe(false)
  expect(plan.omissions).toEqual(expect.arrayContaining([
   "analytics_disabled",
   "personalization_disabled",
  ]))
 })

 it("records missing channel scope as an explicit omission", () => {
  const plan = resolveBrainContextPlan({
   taskProfile: task(),
   capabilityIds: ["statistics-intelligence", "channel-profile"],
   channelId: null,
   projectId: null,
   personalizationEnabled: true,
   analyticsEnabled: true,
   algorithmEnabled: true,
   timelyRequest: false,
  })

  expect(plan.requires.statistics).toBe(false)
  expect(plan.requires.channelKnowledge).toBe(false)
  expect(plan.omissions).toContain("channel_scope_missing")
 })

 it("carries output requirements for creator asset generation", () => {
  const plan = resolveBrainContextPlan({
   taskProfile: task({
    id: "creator_asset_draft",
    intent: "content_generation",
    answerMode: "creator_asset_draft",
    assetKind: "title",
    requestedCount: 5,
    explicitSubject: "Napoleon at Austerlitz",
   }),
   capabilityIds: ["content-generation", "niche-knowledge"],
   channelId: "channel-1",
   projectId: null,
   personalizationEnabled: true,
   analyticsEnabled: true,
   algorithmEnabled: false,
   timelyRequest: true,
  })

  expect(plan.requestedOutputs).toEqual(["title"])
  expect(plan.requestedCount).toBe(5)
  expect(plan.explicitSubject).toBe("Napoleon at Austerlitz")
  expect(plan.requires.currentResearch).toBe(true)
  expect(plan.budget.channelKnowledgeRecords).toBeGreaterThan(0)
 })
})
