import "fake-indexeddb/auto"
import { describe, expect, it, vi } from "vitest"
import { fallbackContext } from "../../context/GlobalDataContextTypes"
import { getVtSyncSnapshot } from "../../features/vt-sync-local"
import { buildAIBrainContextSnapshot } from "../aiBrainCommandInterface"
import { buildCreatorGrowthContext, resumeAIBrainThread } from "../aiBrainConversationStore"
import { runBrainTurn, validateBrainResponse } from "../brain/BrainOrchestrator"

const makeSnapshot = () => buildAIBrainContextSnapshot({
 brain: fallbackContext.brain,
 authState: { ...fallbackContext.authState, channelName: "History Workshop" },
 channelConnection: { ...fallbackContext.channelConnection, isConnected: true },
 brainMemory: fallbackContext.getBrainMemory(),
 vtSyncSnapshot: getVtSyncSnapshot({
  source: "vt-sync",
  snapshotId: "orchestrator-snapshot",
  channelName: "History Workshop",
  videos: [
   { id: "best", title: "Napoleon's Cavalry Explained", tags: ["napoleon", "military", "history"], metrics: { views: 120000 } },
   { id: "recent", title: "How Napoleonic Artillery Worked", tags: ["napoleonic", "history"], metrics: { views: 42000 } },
  ],
 }),
 now: new Date("2026-07-22T12:00:00.000Z"),
})

const nicheProfile = {
 id: "niche-test",
 channelId: "orchestrator-channel",
 canonicalNiche: "Napoleonic military history",
 evidenceFingerprint: "orchestrator-snapshot",
 createdAt: "2026-07-22T12:00:00.000Z",
 updatedAt: "2026-07-22T12:00:00.000Z",
 evergreenExpiresAt: "2026-08-22T12:00:00.000Z",
 summary: "Napoleonic military history covers campaigns, tactics, armies, and political consequences.",
 terminology: ["Napoleonic Wars"],
 majorSubtopics: ["Cavalry", "Artillery"],
 adjacentTopics: [],
 audienceQuestions: [],
 sources: [],
 status: "ready" as const,
}

describe("BrainOrchestrator", () => {
 it("persists one structured, channel-specific turn through the governed pipeline", async () => {
  const snapshot = makeSnapshot()
  const growthContext = buildCreatorGrowthContext(snapshot, [], [])
  const result = await runBrainTurn({
   channelId: "orchestrator-channel",
   userText: "What should my next video be?",
   snapshot,
   growthContext,
   systemPrompt: "Help the creator make a stronger next video.",
   allowModel: true,
   nicheResolver: vi.fn(async () => nicheProfile),
   modelGenerator: vi.fn(async () => ({
    headline: "Build the artillery follow-up",
    keyInsight: "Napoleon's Cavalry Explained proves that specific military systems are your strongest viewer promise.",
    body: "Create an artillery follow-up that keeps the same explanatory structure and makes the contrast visible in the title and thumbnail.",
    mode: "video_idea_sprint",
    modules: [
     { title: "Repeat this pattern", body: "Use Napoleon's Cavalry Explained as the structural control and change the military system to artillery.", tone: "green", kind: "recommendation_stack" },
     { title: "Packaging test", body: "Test a cavalry versus artillery contrast against a single-system explainer.", tone: "yellow", kind: "packaging_board" },
    ],
    actions: ["Outline the artillery follow-up.", "Draft two title promises."],
   })),
  })
  const restored = await resumeAIBrainThread("orchestrator-channel")

  expect(result.turn.status).toBe("complete")
  expect(result.modules).toHaveLength(2)
  expect(result.capabilities.length).toBeLessThanOrEqual(8)
  expect(result.contextBudget.maximumCharacters).toBe(24000)
  expect(restored.turns.at(-1)?.id).toBe(result.turn.id)
 })

 it("repairs a repeated generic model answer with an evidence-backed fallback", async () => {
  const snapshot = makeSnapshot()
  const growthContext = buildCreatorGrowthContext(snapshot, [], [])
  const repeatedTurn = {
   id: "prior-turn",
   threadId: "prior-thread",
   channelId: "repeat-channel",
   createdAt: "2026-07-22T11:00:00.000Z",
   status: "complete" as const,
   userText: "Help",
   assistantText: "Try making a better video. Focus on quality and consistency.",
   answerModules: [],
   questionAnswers: [],
   learningEntryIds: [],
  }
  const result = await runBrainTurn({
   channelId: "repeat-channel",
   userText: "What is my best video?",
   snapshot,
   growthContext,
   systemPrompt: "Use channel evidence.",
   recentTurns: [repeatedTurn],
   allowModel: true,
   nicheResolver: vi.fn(async () => nicheProfile),
   modelGenerator: vi.fn(async () => ({
    headline: "General advice",
    keyInsight: "Try making a better video.",
    body: "Try making a better video. Focus on quality and consistency.",
    mode: "strategy_brief",
    modules: [
     { title: "Next step", body: "Try making a better video.", tone: "white", kind: "recommendation_stack" },
     { title: "Plan", body: "Focus on quality and consistency.", tone: "white", kind: "recommendation_stack" },
    ],
    actions: [],
   })),
  })

  expect(result.repaired).toBe(true)
  expect(result.response.keyInsight).toMatch(/Napoleon|Cavalry/i)
  expect(result.turn.status).toBe("fallback")
 })

 it("rejects unsupported numbers and high similarity", () => {
  const snapshot = makeSnapshot()
  const response = {
   id: "response",
   mode: "analytics_diagnosis" as const,
   body: "Your CTR is 83% and revenue is 999999 dollars.",
   evidenceIds: [],
   headline: "Analytics read",
   keyInsight: "Your CTR is 83% and revenue is 999999 dollars.",
   evidenceChips: [],
   modules: [],
   actions: [],
   learningSummary: "",
   questions: [],
   confidence: "high" as const,
  }
  const evaluation = validateBrainResponse({ response, snapshot })

  expect(evaluation.passed).toBe(false)
  expect(evaluation.unsupportedNumbers).toEqual(expect.arrayContaining(["83%", "999999"]))
 })
})
