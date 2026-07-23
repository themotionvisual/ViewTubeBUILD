import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fallbackContext } from "../../context/GlobalDataContextTypes"
import {
 AI_BRAIN_INTAKE_QUESTIONS,
 dismissAiBrainIntake,
 hasCompletedAiBrainContext,
 loadAiBrainContext,
 saveAiBrainContext,
 shouldShowAiBrainIntake,
} from "../aiBrainContext"
import {
 buildAIBrainContextSnapshot,
 formatCreatorBrainResponse,
} from "../aiBrainCommandInterface"
import {
 INITIAL_CREATOR_INSIGHT_DEFINITIONS,
 buildInitialCreatorInsights,
} from "../aiBrainInitialInsights"
import {
 buildBrainAudienceEvidencePacket,
 selectBrainAudienceEvidenceTargets,
} from "../brain/AudienceEvidenceCollector"

const createStorage = () => {
 const store = new Map<string, string>()
 return {
  getItem: vi.fn((key: string) => store.get(key) || null),
  setItem: vi.fn((key: string, value: string) => {
   store.set(key, value)
  }),
  removeItem: vi.fn((key: string) => {
   store.delete(key)
  }),
  clear: vi.fn(() => {
   store.clear()
  }),
 }
}

describe("AI Brain creator intelligence rebuild", () => {
 let storage: ReturnType<typeof createStorage>

 beforeEach(() => {
  storage = createStorage()
  vi.stubGlobal("localStorage", storage)
 })

 afterEach(() => {
  vi.unstubAllGlobals()
 })

 it("migrates the old three-field context into the ten-question creator profile shape", () => {
  storage.setItem("vt_ai_brain_context_v1", JSON.stringify({
   whatNext: "Grow long-form views",
   primaryGoal: "views",
   audienceNiche: "military history animation",
   completedAt: "2026-07-16T00:00:00.000Z",
  }))

  const context = loadAiBrainContext()

  expect(AI_BRAIN_INTAKE_QUESTIONS).toHaveLength(10)
  expect(context.version).toBe(2)
  expect(context.mainTopicFocus).toBe("military history animation")
  expect(context.successDefinition).toBe("Grow long-form views")
  expect(context.oneMonthGoals.map((goal) => goal.metric)).toContain("watch_hours")
 })

 it("supports skippable first-login intake and completion state", () => {
  storage.setItem("vt_signup_email", "creator@example.com")

  expect(shouldShowAiBrainIntake(true)).toBe(true)
  dismissAiBrainIntake()
  expect(shouldShowAiBrainIntake(true)).toBe(false)

  saveAiBrainContext({
   channelDescription: "I make cinematic history videos.",
   mainTopicFocus: "history animation",
   mainYoutubeGoal: "Increase subscribers from long-form videos.",
  })

  expect(hasCompletedAiBrainContext()).toBe(true)
  expect(shouldShowAiBrainIntake(true)).toBe(false)
 })

 it("selects quota-aware audience evidence targets by long, Shorts, and recent winners", () => {
  const targets = selectBrainAudienceEvidenceTargets([
   { videoId: "long-a", title: "Long A", format: "long", views: 1000, publishedAt: "2026-06-01" },
   { videoId: "long-b", title: "Long B", format: "long", views: 900, publishedAt: "2026-05-01" },
   { videoId: "long-c", title: "Long C", format: "long", views: 800, publishedAt: "2025-01-01" },
   { videoId: "long-d", title: "Long D", format: "long", views: 700, publishedAt: "2026-07-01" },
   { videoId: "short-a", title: "Short A", format: "shorts", views: 600, publishedAt: "2026-06-02" },
   { videoId: "short-b", title: "Short B", format: "short", views: 500, publishedAt: "2026-07-02" },
   { videoId: "short-c", title: "Short C", isShort: true, views: 400, publishedAt: "2025-01-02" },
   { videoId: "short-d", title: "Short D", durationSeconds: 45, views: 300, publishedAt: "2026-07-03" },
  ], new Date("2026-07-16T00:00:00.000Z"))

  expect(targets.map((target) => target.videoId)).toEqual(expect.arrayContaining(["long-a", "long-b", "long-c", "short-a", "short-b", "short-c"]))
  expect(targets.length).toBeLessThanOrEqual(10)

  const packet = buildBrainAudienceEvidencePacket({ channelId: "c1", videos: targets, commentThreadsPerVideoCap: 20, activityCap: 20 })
  expect(packet.coverage.commentThreadsPerVideoCap).toBe(20)
  expect(packet.coverage.activityCap).toBe(20)
 })

 it("defines the full 30-insight opening library and returns creator-facing starter insights", () => {
  const snapshot = buildAIBrainContextSnapshot({
   brain: fallbackContext.brain,
   authState: fallbackContext.authState,
   channelConnection: fallbackContext.channelConnection,
   brainMemory: fallbackContext.getBrainMemory(),
  })

  const insights = buildInitialCreatorInsights(snapshot, "What is my best video?")

  expect(INITIAL_CREATOR_INSIGHT_DEFINITIONS).toHaveLength(30)
  expect(insights.length).toBeGreaterThan(0)
  expect(insights.flatMap((insight) => insight.modules).map((module) => module.title).join(" ")).not.toMatch(/Profile Confidence|What The Brain Learned|SEO Queue/)
 })

 it("formats creator chat without internal labels or technical failure language", () => {
  const snapshot = buildAIBrainContextSnapshot({
   brain: fallbackContext.brain,
   authState: fallbackContext.authState,
   channelConnection: fallbackContext.channelConnection,
   brainMemory: fallbackContext.getBrainMemory(),
  })

  const response = formatCreatorBrainResponse("VT-SYNC failed. **Finding:** Use a SEO queue.", snapshot, {
   requestText: "Help me improve my title and thumbnail.",
  })

  expect(response.modules?.map((module) => module.title)).toContain("Title/Thumbnail Test")
  expect(`${response.body} ${response.modules?.map((module) => `${module.title} ${module.body}`).join(" ")}`).not.toMatch(/VT-SYNC|failed|Profile Confidence|What The Brain Learned|SEO Queue|\*\*|`/)
 })
})
