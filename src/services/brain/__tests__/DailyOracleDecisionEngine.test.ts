import { describe, expect, it } from "vitest"
import type { CreatorGrowthContext } from "../../../types"
import { buildDailyOraclePlan } from "../DailyOracleDecisionEngine"

const growth = (overrides: Partial<CreatorGrowthContext> = {}): CreatorGrowthContext => ({
 profileConfidenceScore: 82,
 currentGoal: "Reach 10K subscribers with a repeatable history series.",
 inferredNiche: "History",
 contentPillars: ["Napoleonic history"],
 topPerformerPatterns: ["Eyewitness battle stories consistently outperform generic history uploads."],
 audiencePromise: "Specific primary-source storytelling.",
 memoryChanges: [],
 newUploadFitChecklist: [],
 dailyOracleActions: ["Turn the strongest profile lane into one repeatable upload idea."],
 journalProfileUpdates: [],
 goalAwareRecommendations: [],
 seoOpportunityQueue: [],
 unresolvedQuestions: [],
 recentConversationFacts: [],
 capabilities: [],
 ...overrides,
})

describe("DailyOracleDecisionEngine", () => {
 it("prioritizes a stale publishing cadence when the last upload is old", () => {
  const plan = buildDailyOraclePlan({
   growth: growth(),
   focusMetric: "views",
   evidence: {
    recentUploadCount14d: 0,
    daysSinceLatestUpload: 24,
    readySources: 4,
    totalSources: 5,
    channelConnected: true,
   },
  })

  expect(plan.primary.id).toBe("cadence-restart")
  expect(plan.primary.evidence).toContain("24 days ago")
  expect(plan.evidenceCoverage).toBe(80)
 })

 it("uses Brain patterns and keeps quick wins distinct from the primary move", () => {
  const plan = buildDailyOraclePlan({
   growth: growth(),
   focusMetric: "subscribers",
   evidence: {
    recentUploadCount14d: 3,
    daysSinceLatestUpload: 4,
    readySources: 5,
    totalSources: 5,
    channelConnected: true,
   },
  })

  expect([plan.primary.id, ...plan.quickWins.map((item) => item.id)]).toContain("repeat-pattern")
  expect(new Set(plan.quickWins.map((item) => item.id)).size).toBe(plan.quickWins.length)
  expect(plan.quickWins.every((item) => item.id !== plan.primary.id)).toBe(true)
 })

 it("returns metric-specific focus tasks and honest disconnected provenance", () => {
  const plan = buildDailyOraclePlan({
   growth: growth({ profileConfidenceScore: 30, topPerformerPatterns: [] }),
   focusMetric: "watch-time",
   evidence: {
    recentUploadCount14d: 0,
    daysSinceLatestUpload: null,
    readySources: 0,
    totalSources: 4,
    channelConnected: false,
   },
  })

  expect(plan.focusTasks).toHaveLength(3)
  expect(plan.focusTasks.every((item) => item.metric === "watch-time")).toBe(true)
  expect(plan.sourceLabel).toContain("channel not connected")
  expect(plan.quickWins.some((item) => item.id === "brain-context")).toBe(true)
 })
})
