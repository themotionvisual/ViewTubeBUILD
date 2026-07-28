import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fallbackContext } from "../../context/GlobalDataContextTypes"
import { getVtSyncSnapshot } from "../../features/vt-sync-local"
import {
 buildAIBrainContextSnapshot,
 formatCreatorBrainResponse,
} from "../aiBrainCommandInterface"
import { buildBrainQuickActions } from "../aiBrainInitialInsights"
import type { VtSyncSnapshot } from "../../features/vt-sync-local"

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

type VideoSeed = {
 id: string
 title: string
 tags: string[]
 views: number
}

const syncedSnapshot = (input: {
 channelId: string
 channelName: string
 channelDescription: string
 videos: VideoSeed[]
 searchTerms: string[]
}): VtSyncSnapshot => ({
 ...getVtSyncSnapshot(),
 source: "vt-sync",
 snapshotId: `snapshot-${input.channelId}`,
 capturedAt: "2026-07-16T00:00:00.000Z",
 channelId: input.channelId,
 channelName: input.channelName,
 channelDescription: input.channelDescription,
 videos: input.videos.map((video, index) => ({
  id: video.id,
  title: video.title,
  publishedAt: `2026-0${(index % 9) + 1}-01T00:00:00.000Z`,
  format: "long",
  descriptionSnippet: input.channelDescription,
  tags: video.tags,
  topics: video.tags,
  category: video.tags[0],
  metrics: {
   views: video.views,
   watchTime: video.views * 3,
   subscribersGained: Math.round(video.views / 100),
   revenue: video.views / 500,
   ctr: 5,
   averagePercentageViewed: 42,
  },
 })) as VtSyncSnapshot["videos"],
 searchTerms: input.searchTerms.map((term, index) => ({
  term,
  views: 900 - index * 100,
 })) as VtSyncSnapshot["searchTerms"],
 syncManifest: {
  run_id: `run-${input.channelId}`,
  stop_reason: "completed",
  bundles_completed: [],
  bundles_failed: [],
  diagnostics: [],
 } as unknown as VtSyncSnapshot["syncManifest"],
})

const contextFor = (vtSyncSnapshot?: VtSyncSnapshot) =>
 buildAIBrainContextSnapshot({
  brain: fallbackContext.brain,
  authState: fallbackContext.authState,
  channelConnection: fallbackContext.channelConnection,
  brainMemory: fallbackContext.getBrainMemory(),
  vtSyncSnapshot,
 })

const FORGE = {
 channelId: "forge",
 channelName: "Forge and Fire",
 channelDescription: "Blacksmithing restoration builds and anvil repair walkthroughs.",
 videos: [
  { id: "f1", title: "Restoring a Rusted Victorian Anvil", tags: ["blacksmithing", "restoration"], views: 480000 },
  { id: "f2", title: "Forging a Damascus Chef Knife", tags: ["blacksmithing", "damascus"], views: 210000 },
  { id: "f3", title: "Building a Propane Forge", tags: ["blacksmithing", "forge"], views: 90000 },
 ],
 searchTerms: ["how to restore an anvil", "damascus steel tutorial"],
}

const ORBIT = {
 channelId: "orbit",
 channelName: "Orbit Lab",
 channelDescription: "Astrophotography gear reviews and deep sky imaging tutorials.",
 videos: [
  { id: "o1", title: "Photographing the Andromeda Galaxy", tags: ["astrophotography", "deepsky"], views: 350000 },
  { id: "o2", title: "Best Star Tracker Under 500", tags: ["astrophotography", "gear"], views: 160000 },
  { id: "o3", title: "Stacking Images in Siril", tags: ["astrophotography", "editing"], views: 70000 },
 ],
 searchTerms: ["astrophotography for beginners", "star tracker review"],
}

describe("Brain personalization and autonomous intent routing", () => {
 let storage: ReturnType<typeof createStorage>

 beforeEach(() => {
  storage = createStorage()
  vi.stubGlobal("localStorage", storage)
 })

 afterEach(() => {
  vi.unstubAllGlobals()
 })

 it("picks the approach from the question, with no mode selected by the creator", () => {
  const snapshot = contextFor(syncedSnapshot(FORGE))

  const analytics = formatCreatorBrainResponse("Here is a read of the channel.", snapshot, {
   requestText: "Why did my views drop this month?",
  })
  const revenue = formatCreatorBrainResponse("Here is a read of the channel.", snapshot, {
   requestText: "How do I improve revenue and RPM?",
  })

  expect(analytics.mode).toBe("analytics_diagnosis")
  expect(revenue.mode).toBe("revenue_levers")

  const analyticsTitles = analytics.modules?.map((module) => module.title) || []
  const revenueTitles = revenue.modules?.map((module) => module.title) || []
  expect(analyticsTitles).toContain("Why This Is Happening")
  expect(revenueTitles).toContain("Revenue Lever")
  expect(analyticsTitles).not.toEqual(revenueTitles)

  // An analytics answer carries the ranked video evidence it stands on, built
  // from the channel's real top videos rather than prose.
  const evidence = analytics.modules?.find((module) => module.id === "video-evidence-ranking")
  expect(evidence?.data?.items?.[0]?.title).toBe("Restoring a Rusted Victorian Anvil")
  expect(evidence?.data?.items?.[0]?.detail).toMatch(/views/)
 })

 it("binds what it says to the creator's own channel, not a reusable template", () => {
  const forge = contextFor(syncedSnapshot(FORGE))
  const orbit = contextFor(syncedSnapshot(ORBIT))

  const forgeText = buildBrainQuickActions(forge)
   .map((action) => `${action.title} ${action.body}`)
   .join(" ")
  const orbitText = buildBrainQuickActions(orbit)
   .map((action) => `${action.title} ${action.body}`)
   .join(" ")

  expect(forgeText).toContain("Restoring a Rusted Victorian Anvil")
  expect(orbitText).toContain("Photographing the Andromeda Galaxy")

  // Two different channels must not receive the same words back.
  expect(forgeText).not.toEqual(orbitText)
  expect(forgeText).not.toContain("Andromeda")
  expect(orbitText).not.toContain("Anvil")
 })

 it("surfaces only actions whose evidence exists, ranked by result-to-effort", () => {
  const forge = contextFor(syncedSnapshot(FORGE))
  const actions = buildBrainQuickActions(forge, null, 3)

  expect(actions.length).toBeGreaterThan(0)
  actions.forEach((action) => {
   expect(action.effort).toBeGreaterThanOrEqual(1)
   expect(action.effort).toBeLessThanOrEqual(5)
   expect(action.reward).toBeGreaterThanOrEqual(1)
   expect(action.reward).toBeLessThanOrEqual(5)
  })

  const ratios = actions.map((action) => action.reward / action.effort)
  expect(ratios).toEqual([...ratios].sort((left, right) => right - left))
 })

 it("grounds a would-be generic answer in the creator's real evidence", () => {
  const snapshot = contextFor(syncedSnapshot(FORGE))

  // A model reply that mentions none of the channel's specifics.
  const response = formatCreatorBrainResponse(
   "Focus on strong hooks and consistent uploads to grow your channel.",
   snapshot,
   { requestText: "How do I grow?" },
  )

  const text = `${response.keyInsight} ${response.body}`
  // The floor injects a reference to the channel's strongest real signal.
  expect(text).toContain("Restoring a Rusted Victorian Anvil")
 })

 it("does not double-anchor an answer that already cites the channel", () => {
  const snapshot = contextFor(syncedSnapshot(FORGE))
  const response = formatCreatorBrainResponse(
   'Your video "Restoring a Rusted Victorian Anvil" shows the pattern to repeat.',
   snapshot,
   { requestText: "What worked?" },
  )

  const mentions = (response.body.match(/Restoring a Rusted Victorian Anvil/g) || []).length
  expect(mentions).toBe(1)
 })

 it("names what is missing instead of inventing specifics for an empty channel", () => {
  const empty = contextFor()
  const actions = buildBrainQuickActions(empty, null, 3)
  const text = actions.map((action) => `${action.title} ${action.body}`).join(" ")

  expect(actions.length).toBeGreaterThan(0)
  // No fabricated performance claims when there is nothing to stand on.
  expect(text).not.toMatch(/\d{3,} views/)
  expect(text).toMatch(/who your videos are for|matters most right now/i)
  expect(empty.evidencePack.missingInputs.length).toBeGreaterThan(0)
 })

 it("keeps internal and failure language out of creator-facing answers", () => {
  const snapshot = contextFor(syncedSnapshot(FORGE))
  const response = formatCreatorBrainResponse("VT-SYNC failed. **Finding:** check the manifest.", snapshot, {
   requestText: "What should I publish next?",
  })

  const allText = `${response.body} ${response.keyInsight} ${(response.modules || [])
   .map((module) => `${module.title} ${module.body}`)
   .join(" ")}`

  expect(allText).not.toMatch(/VT-SYNC|manifest|IndexedDB|localStorage|\*\*/)
 })
})
