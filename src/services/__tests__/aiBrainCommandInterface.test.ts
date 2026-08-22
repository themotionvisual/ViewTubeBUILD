import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fallbackContext } from "../../context/GlobalDataContextTypes"
import { getVtSyncSnapshot } from "../../features/vt-sync-local"
import { buildBrainOnboardingArtifactsForTest } from "../brain/OnboardingBootstrap"
import {
 buildAIBrainContextSnapshot,
 buildAIBrainSystemPrompt,
 buildBrainLearningQuestions,
 buildCreatorBrainPromptCards,
 buildVtSyncDiagnosticsSummary,
 formatCreatorBrainResponse,
 buildCreatorBrainLocalFallback,
 listCreatorFacingBrainRoutes,
 queueAIBrainReviewedAction,
 resolveAIBrainToolRoute,
 sanitizeCreatorBrainMarkdown,
} from "../aiBrainCommandInterface"
import {
 buildCreatorGrowthContext,
 formatCreatorGrowthModules,
 sanitizeCreatorFacingBrainCopy,
} from "../aiBrainConversationStore"

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

describe("aiBrainCommandInterface", () => {
 let storage: ReturnType<typeof createStorage>

 beforeEach(() => {
  storage = createStorage()
  vi.stubGlobal("localStorage", storage)
  vi.stubGlobal("window", { localStorage: storage })
 })

 afterEach(() => {
  vi.unstubAllGlobals()
 })

 it("classifies missing VT-SYNC diagnostics without converting unknown rows to zero", () => {
  const diagnostics = buildVtSyncDiagnosticsSummary(null)

  expect(diagnostics.status).toBe("missing")
  expect(diagnostics.totalRows).toBeNull()
  expect(diagnostics.warnings).toContain("No VT-SYNC sync manifest is loaded.")
 })

 it("treats completed bundles with failed metrics as partial diagnostics", () => {
  const diagnostics = buildVtSyncDiagnosticsSummary({
   run_id: "run-1",
   started_at: "2026-07-14T00:00:00.000Z",
   completed_at: "2026-07-14T00:01:00.000Z",
   stop_reason: "completed",
   bundles_completed: [
    {
     bundle_id: "daily_history",
     rows_written: 12,
     metrics_failed: ["cardClicks"],
    },
   ],
   bundles_failed: [],
   diagnostics: [],
  })

  expect(diagnostics.status).toBe("partial")
  expect(diagnostics.partialBundles).toBe(1)
  expect(diagnostics.totalRows).toBe(12)
 })

 it("builds a unified Brain context snapshot from Brain, command, generation, workflow, and VT-SYNC sources", () => {
  const vtSyncSnapshot = getVtSyncSnapshot({
   source: "vt-sync",
   snapshotId: "snapshot-1",
   capturedAt: "2026-07-14T00:00:00.000Z",
   channelName: "Test Channel",
   videos: [
    {
     id: "video-1",
     title: "Video 1",
     metrics: { views: 100 },
    },
   ],
   syncManifest: {
    run_id: "run-1",
    started_at: "2026-07-14T00:00:00.000Z",
    completed_at: "2026-07-14T00:01:00.000Z",
    stop_reason: "completed",
    bundles_completed: [{ bundle_id: "video_metadata", rows_written: 1 }],
    bundles_failed: [],
    diagnostics: [],
   },
  })

  const snapshot = buildAIBrainContextSnapshot({
   brain: {
    ...fallbackContext.brain,
    coreConcept: "Build better creator tools",
    targetNiche: "YouTube strategy",
    journalEntries: [{ id: "j1" } as any],
   },
   authState: {
    ...fallbackContext.authState,
    channelName: "Test Channel",
    totalViews: null,
   },
   channelConnection: {
    ...fallbackContext.channelConnection,
    isConnected: true,
   },
   brainMemory: fallbackContext.getBrainMemory(),
   vtSyncSnapshot,
   now: new Date("2026-07-14T00:02:00.000Z"),
  })

  expect(snapshot.route).toBe("/ai-brain")
  expect(snapshot.channel.label).toBe("Test Channel")
  expect(snapshot.channel.totalViews).toBeNull()
  expect(snapshot.brain.journalEntries).toBe(1)
  expect(snapshot.vtSync.videos).toBe(1)
  expect(snapshot.vtSync.diagnostics.status).toBe("complete")
  expect(snapshot.tools.every((tool) => !tool.route.startsWith("/data-transparency"))).toBe(true)
 })

 it("builds the runtime system prompt through the imported assistant registry", () => {
  const prompt = buildAIBrainSystemPrompt({
   brain: fallbackContext.brain,
   authState: fallbackContext.authState,
   channelConnection: fallbackContext.channelConnection,
   brainMemory: fallbackContext.getBrainMemory(),
  })

  expect(prompt).toContain("ViewTube Copilot")
  expect(prompt).toContain("ASSISTANT SYSTEM REGISTRY")
 })

 it("resolves AI Brain tool routes through the reviewed command route helper", () => {
  expect(resolveAIBrainToolRoute("brain-command-center", "cmd-1").route).toBe(
   "/data-transparency?internalTool=brain-command-center&commandActionId=cmd-1",
  )
 })

 it("queues reviewed assistant handoffs without direct mutation flags", async () => {
  const handoff = await queueAIBrainReviewedAction({
   request: "analyze my channel stats and route this",
   response: "Open Cinematic Analytics Lab.",
  })

  expect(handoff.reviewOnly).toBe(true)
  expect(handoff.action.source).toBe("assistant")
  expect(handoff.action.assistantRequest).toBe("analyze my channel stats and route this")
  expect(handoff.route).toContain("commandActionId=")
  expect((handoff.action as any).autoExecute).toBeUndefined()
  expect((handoff.action as any).directMutation).toBeUndefined()
 })

 it("builds creator-facing prompt cards and routes only to public live app surfaces", () => {
  const prompts = buildCreatorBrainPromptCards()
  const routes = listCreatorFacingBrainRoutes()

  expect(prompts.some((prompt) => prompt.label === "Analyze Channel Niche")).toBe(true)
  expect(prompts.some((prompt) => prompt.label === "SEO Script Drafter")).toBe(true)
  expect(prompts.some((prompt) => prompt.label === "Best Video Autopsy")).toBe(true)
  expect(prompts.some((prompt) => prompt.label === "Run Daily Oracle")).toBe(true)
  expect(routes.length).toBeGreaterThan(0)
  expect(routes.every((route) => route.route.startsWith("/data-transparency") === false)).toBe(true)
 })

 it("sanitizes markdown-looking model output and formats a creator response", () => {
  const cleaned = sanitizeCreatorBrainMarkdown("**Finding:** Use `BRAIN_COMMAND_CENTER` for this.")
  expect(cleaned).not.toContain("**")
  expect(cleaned).not.toContain("`")
  expect(cleaned).toContain("brain command center")
  expect(sanitizeCreatorFacingBrainCopy("VT-SYNC sync bundle failed through the API")).not.toMatch(/VT-SYNC|sync bundle|failed|API/i)

  const snapshot = buildAIBrainContextSnapshot({
   brain: fallbackContext.brain,
   authState: fallbackContext.authState,
   channelConnection: fallbackContext.channelConnection,
   brainMemory: fallbackContext.getBrainMemory(),
   now: new Date("2026-07-14T00:02:00.000Z"),
  })
  const response = formatCreatorBrainResponse("**Finding:** Improve your SEO title and test a clearer hook.", snapshot)
  expect(response.headline).toBe("SEO and Keyword Plan")
  expect(response.keyInsight).not.toContain("**")
  expect(response.modules?.length).toBeGreaterThan(0)
  expect(response.modules?.map((module) => module.title)).toContain("Title/Thumbnail Test")
  expect(response.modules?.map((module) => module.body).join(" ")).not.toMatch(/VT-SYNC|sync bundle|API|failed/i)
  expect(response.modules?.map((module) => module.title).join(" ")).not.toMatch(/Profile Confidence|What The Brain Learned|SEO Queue/i)
 })

 it("builds distinct local fallback answers for Daily Oracle and best-video requests", () => {
  const vtSyncSnapshot = getVtSyncSnapshot({
   source: "vt-sync",
   snapshotId: "fallback-variety",
   videos: [
    {
     id: "best-1",
     title: "Alder Animation Breakdown",
     metrics: { views: 250000 },
     tags: ["alder", "animation"],
    },
    {
     id: "best-2",
     title: "Spline History Scene",
     metrics: { views: 90000 },
     tags: ["spline", "history"],
    },
   ],
  })
  const snapshot = buildAIBrainContextSnapshot({
   brain: fallbackContext.brain,
   authState: fallbackContext.authState,
   channelConnection: fallbackContext.channelConnection,
   brainMemory: fallbackContext.getBrainMemory(),
   vtSyncSnapshot,
   now: new Date("2026-07-14T00:02:00.000Z"),
  })

  const oracleText = buildCreatorBrainLocalFallback("Run my Daily Oracle and give me one priority, one quick win, and one measurable action for today.", snapshot)
  const bestVideoText = buildCreatorBrainLocalFallback("whats my best video?", snapshot)
  const oracle = formatCreatorBrainResponse(oracleText, snapshot, { requestText: "Run my Daily Oracle and give me one priority, one quick win, and one measurable action for today." })
  const bestVideo = formatCreatorBrainResponse(bestVideoText, snapshot, { requestText: "whats my best video?" })

  expect(oracle.headline).toBe("Goal Coach")
  expect(bestVideo.headline).toBe("Analytics Diagnosis")
  expect(oracle.modules?.map((module) => module.title)).toEqual(["Daily Priority", "Quick Win", "Measurable Action"])
  expect(bestVideo.modules?.map((module) => module.title)).toContain("Best Video Autopsy")
  expect(bestVideo.body).toContain("Alder Animation Breakdown")
  expect(`${oracle.body} ${bestVideo.body}`).not.toMatch(/I could not finish|Try asking for one specific goal/i)
 })

 it("builds creator growth context with the requested Brain capabilities", () => {
  const snapshot = buildAIBrainContextSnapshot({
   brain: fallbackContext.brain,
   authState: fallbackContext.authState,
   channelConnection: fallbackContext.channelConnection,
   brainMemory: fallbackContext.getBrainMemory(),
   now: new Date("2026-07-14T00:02:00.000Z"),
  })
  const response = formatCreatorBrainResponse("Improve my title and thumbnail for more views.", snapshot)
  const growthContext = buildCreatorGrowthContext(snapshot, [], [])
  const modules = formatCreatorGrowthModules(response, growthContext)
  const capabilityIds = growthContext.capabilities.map((capability) => capability.id)

  expect(capabilityIds).toEqual(expect.arrayContaining([
   "profile_confidence",
   "creator_confirmation",
   "top_performer_patterns",
   "audience_promise",
   "memory_change_log",
   "new_upload_fit",
   "daily_oracle",
   "journal_profile_updates",
   "goal_aware_recommendations",
   "seo_opportunity_queue",
  ]))
  expect(modules.map((module) => module.title)).toEqual(expect.arrayContaining(["What To Do Next", "Title/Thumbnail Test"]))
  expect(modules.map((module) => module.title).join(" ")).not.toMatch(/Profile Confidence|SEO Queue|What The Brain Learned|Best Next Action|Growth Read|Content Opportunity/i)
 })

 it("caps Brain learning questions at two creator-facing questions", () => {
  const snapshot = buildAIBrainContextSnapshot({
   brain: fallbackContext.brain,
   authState: fallbackContext.authState,
   channelConnection: fallbackContext.channelConnection,
   brainMemory: {
    ...fallbackContext.getBrainMemory(),
    contentDNA: "",
   },
   now: new Date("2026-07-14T00:02:00.000Z"),
  })

  const questions = buildBrainLearningQuestions(snapshot)
  expect(questions.length).toBeLessThanOrEqual(2)
  expect(questions[0]?.question).toMatch(/channel|result|videos/i)
 })

 it("uses inferred channel profiles before asking generic niche onboarding questions", () => {
  const onboarding = buildBrainOnboardingArtifactsForTest({
   channelId: "creator-channel",
   profile: {
    id: "creator-channel",
    description: "YouTube education, SEO strategy, thumbnails, and creator growth.",
    keywords: "youtube seo thumbnails creator growth",
   },
   videos: [
    {
     videoId: "v1",
     title: "YouTube SEO tutorial for small creators",
     description: "Search strategy and packaging advice for YouTube channels.",
     tags: ["youtube seo", "creator growth"],
     categoryName: "Education",
     viewCount: 12000,
    },
    {
     videoId: "v2",
     title: "Thumbnail strategy for higher retention",
     description: "Packaging and audience promise breakdown.",
     tags: ["thumbnail strategy", "retention"],
     categoryName: "Education",
     viewCount: 22000,
    },
   ],
  })
  const vtSyncSnapshot = getVtSyncSnapshot({
   source: "vt-sync",
   snapshotId: "creator-snapshot",
   videos: [
    { id: "v1", title: "YouTube SEO tutorial for small creators", metrics: { views: 12000 } },
    { id: "v2", title: "Thumbnail strategy for higher retention", metrics: { views: 22000 } },
   ],
  })

  const snapshot = buildAIBrainContextSnapshot({
   brain: fallbackContext.brain,
   authState: fallbackContext.authState,
   channelConnection: {
    ...fallbackContext.channelConnection,
    isConnected: true,
   },
   brainMemory: fallbackContext.getBrainMemory(),
   vtSyncSnapshot,
   brainOnboardingSnapshot: onboarding,
   now: new Date("2026-07-14T00:02:00.000Z"),
  })
  const questions = buildBrainLearningQuestions(snapshot)
  const response = formatCreatorBrainResponse("Build an SEO keyword plan for my next upload.", snapshot)

  expect(snapshot.inferredProfile.videoCount).toBe(2)
  expect(snapshot.inferredProfile.niche).toMatch(/youtube|creator|thumbnail|seo/i)
  expect(questions[0]?.question).toContain("I’m seeing your strongest lanes")
  expect(questions[0]?.question).not.toContain("What niche name would you actually use")
 expect(response.modules?.map((module) => module.title)).toContain("Title/Thumbnail Test")
 expect(response.learningSummary).toContain("channel evidence")
 })

 it("builds a concrete fallback niche from VT-SYNC when persisted bootstrap data has not loaded", () => {
  const vtSyncSnapshot = getVtSyncSnapshot({
   source: "vt-sync",
   snapshotId: "fallback-profile",
   channelDescription: "Restoration projects, history videos, vintage repair, and cinematic rebuild stories.",
   videos: [
    {
     id: "r1",
     title: "Abandoned motorcycle restoration with full engine rebuild",
     descriptionSnippet: "A cinematic restoration project bringing a vintage motorcycle back to life.",
     tags: ["restoration", "vintage repair", "motorcycle rebuild"],
     category: "Autos & Vehicles",
     metrics: { views: 900000, watchTime: 45000 },
    },
    {
     id: "r2",
     title: "Historic tool restoration and rust removal process",
     descriptionSnippet: "Satisfying antique tool restoration with workshop repair steps.",
     tags: ["restoration", "antique tools", "rust removal"],
     category: "Howto & Style",
     metrics: { views: 420000 },
    },
    {
     id: "r3",
     title: "Vintage machine repair documentary",
     descriptionSnippet: "Workshop story about restoring an old machine.",
     tags: ["vintage repair", "restoration documentary"],
     category: "Education",
     metrics: { views: 310000 },
    },
   ],
   syncManifest: {
    run_id: "fallback-run",
    started_at: "2026-07-14T00:00:00.000Z",
    completed_at: "2026-07-14T00:01:00.000Z",
    stop_reason: "completed",
    bundles_completed: [{ bundle_id: "video_metadata", rows_written: 3 }],
    bundles_failed: [],
    diagnostics: [],
   },
  })

  const snapshot = buildAIBrainContextSnapshot({
   brain: fallbackContext.brain,
   authState: fallbackContext.authState,
   channelConnection: {
    ...fallbackContext.channelConnection,
    isConnected: true,
   },
   brainMemory: fallbackContext.getBrainMemory(),
   vtSyncSnapshot,
   now: new Date("2026-07-14T00:02:00.000Z"),
  })
  const questions = buildBrainLearningQuestions(snapshot)
  const response = formatCreatorBrainResponse(
   'To identify your niche, we must look past the 3 videos and focus on the "signal".',
   snapshot,
  )

  expect(snapshot.inferredProfile.niche).toMatch(/restoration|vintage|repair/i)
  expect(snapshot.inferredProfile.topicClusters.join(" ")).toMatch(/restoration|repair/i)
  expect(questions[0]?.question).toContain("I’m seeing your strongest lanes")
  expect(questions[0]?.question).not.toContain("What niche name would you actually use")
  expect(response.keyInsight).toMatch(/clearest current niche/i)
  expect(response.keyInsight).toMatch(/restoration|vintage|repair/i)
  expect(response.modules?.map((module) => module.title)).toContain("Repeat This Pattern")
 })
})
