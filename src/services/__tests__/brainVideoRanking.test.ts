import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fallbackContext } from "../../context/GlobalDataContextTypes"
import { getVtSyncSnapshot } from "../../features/vt-sync-local"
import type { VtSyncSnapshot } from "../../features/vt-sync-local"
import { buildAIBrainContextSnapshot } from "../aiBrainCommandInterface"
import { buildBrainQuickActions } from "../aiBrainInitialInsights"
import {
 normalizeRateMetric,
 rateReliability,
 scoreVideoPerformance,
 videoRecencyWeight,
} from "../brain/videoPerformanceScore"

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

const NOW = Date.parse("2026-07-21T00:00:00.000Z")

type Seed = {
 id: string
 title: string
 publishedAt: string
 views: number
 retention: number
 format: "short" | "long"
}

const snapshotWith = (videos: Seed[]): VtSyncSnapshot => ({
 ...getVtSyncSnapshot(),
 source: "vt-sync",
 snapshotId: "ranking-fixture",
 capturedAt: "2026-07-21T00:00:00.000Z",
 channelId: "motion",
 channelName: "The Motion Visual History",
 channelDescription: "Animation, rotoscope and painting process videos.",
 videos: videos.map((video) => ({
  id: video.id,
  title: video.title,
  publishedAt: video.publishedAt,
  format: video.format,
  descriptionSnippet: "Animation process video.",
  tags: ["animation", "rotoscope"],
  topics: ["animation"],
  category: "animation",
  metrics: {
   views: video.views,
   watchTime: video.views * 2,
   subscribersGained: 0,
   revenue: 0,
   ctr: 4,
   averagePercentageViewed: video.retention,
  },
 })) as VtSyncSnapshot["videos"],
 syncManifest: {
  run_id: "run-motion",
  stop_reason: "completed",
  bundles_completed: [],
  bundles_failed: [],
  diagnostics: [],
 } as unknown as VtSyncSnapshot["syncManifest"],
})

// Mirrors the real channel that exposed the bug: the oldest, least-watched video
// carried a replay-inflated retention figure above 2,000%.
const OUTLIER: Seed = {
 id: "outlier",
 title: "NYC! New paintings for spring",
 publishedAt: "2023-03-22T21:47:00.000Z",
 views: 32,
 retention: 2166.98,
 format: "short",
}
const RECENT_STRONG: Seed = {
 id: "recent",
 title: "Trippy Shades",
 publishedAt: "2025-08-22T06:35:00.000Z",
 views: 580,
 retention: 886.02,
 format: "short",
}
const MID: Seed = {
 id: "mid",
 title: "Watch Here",
 publishedAt: "2025-07-16T21:31:00.000Z",
 views: 140,
 retention: 2020.43,
 format: "short",
}

describe("video performance scoring", () => {
 it("caps replay-inflated retention instead of letting it dominate", () => {
  expect(normalizeRateMetric(2166.98)).toBe(100)
  expect(normalizeRateMetric(886.02)).toBe(100)
  expect(normalizeRateMetric(0.42)).toBeCloseTo(42)
  expect(normalizeRateMetric(42)).toBe(42)
 })

 it("distrusts rate metrics that rest on almost no views", () => {
  expect(rateReliability(32)).toBeLessThan(0.2)
  expect(rateReliability(30000)).toBeGreaterThan(0.99)
  expect(rateReliability(0)).toBe(0)
 })

 it("favors recent work without erasing an all-time winner", () => {
  const fresh = videoRecencyWeight("2026-06-01T00:00:00.000Z", NOW)
  const oneYear = videoRecencyWeight("2025-07-21T00:00:00.000Z", NOW)
  const ancient = videoRecencyWeight("2019-01-01T00:00:00.000Z", NOW)

  expect(fresh).toBeGreaterThan(oneYear)
  expect(oneYear).toBeGreaterThan(ancient)
  expect(ancient).toBeGreaterThanOrEqual(0.25)
 })

 it("does not let a low-view retention outlier outrank a genuinely watched video", () => {
  const outlier = scoreVideoPerformance(
   { views: 32, watchTime: 64, retention: 2166.98, ctr: 4, publishedAt: OUTLIER.publishedAt },
   NOW,
  )
  const real = scoreVideoPerformance(
   { views: 580, watchTime: 1160, retention: 886.02, ctr: 4, publishedAt: RECENT_STRONG.publishedAt },
   NOW,
  )

  expect(real).toBeGreaterThan(outlier)
 })
})

describe("Brain top-video selection", () => {
 let storage: ReturnType<typeof createStorage>

 beforeEach(() => {
  storage = createStorage()
  vi.stubGlobal("localStorage", storage)
 })

 afterEach(() => {
  vi.unstubAllGlobals()
 })

 const contextFor = (videos: Seed[]) =>
  buildAIBrainContextSnapshot({
   brain: fallbackContext.brain,
   authState: fallbackContext.authState,
   channelConnection: fallbackContext.channelConnection,
   brainMemory: fallbackContext.getBrainMemory(),
   vtSyncSnapshot: snapshotWith(videos),
  })

 it("no longer crowns the oldest, least-watched video as the channel's best", () => {
  const snapshot = contextFor([OUTLIER, RECENT_STRONG, MID])

  expect(snapshot.evidencePack.topVideos[0].title).not.toBe(OUTLIER.title)
  expect(snapshot.evidencePack.topVideos[0].title).toBe(RECENT_STRONG.title)
 })

 it("never suggests cutting a Short out of a Short", () => {
  const snapshot = contextFor([RECENT_STRONG, MID, OUTLIER])
  const actionIds = buildBrainQuickActions(snapshot, null, 5).map((action) => action.id)

  expect(actionIds).not.toContain("short-from-top-performer")
  expect(actionIds).toContain("long-form-from-short")
 })

 it("still offers the Shorts cut when the top video is long-form", () => {
  const snapshot = contextFor([
   { ...RECENT_STRONG, format: "long" },
   { ...MID, format: "long" },
  ])
  const actionIds = buildBrainQuickActions(snapshot, null, 5).map((action) => action.id)

  expect(actionIds).toContain("short-from-top-performer")
  expect(actionIds).not.toContain("long-form-from-short")
 })
})
