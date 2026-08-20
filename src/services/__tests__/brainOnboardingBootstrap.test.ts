import { describe, expect, it } from "vitest"
import { getVtSyncSnapshot } from "../../features/vt-sync-local"
import {
 buildBrainEvidenceFingerprint,
 buildBrainOnboardingArtifactsForTest,
 rankChannelEvidenceVideos,
} from "../brain/OnboardingBootstrap"

describe("Brain onboarding bootstrap channel profiling", () => {
 const cacheForChannel = (videoCount: number) => ({
  channelId: "creator-channel",
  profile: {
   id: "creator-channel",
   title: "Studio Strategy Channel",
   description: "A channel about YouTube growth, creator strategy, editing workflow, and SEO packaging.",
   keywords: "youtube growth creator strategy seo thumbnails retention",
   statistics: {
    videoCount,
    viewCount: 900000,
    subscriberCount: 12000,
   },
  },
  videos: Array.from({ length: videoCount }, (_, index) => ({
   videoId: `video-${index + 1}`,
   title:
    index % 3 === 0
     ? `YouTube SEO strategy for creators ${index + 1}`
     : index % 3 === 1
      ? `Thumbnail packaging and retention breakdown ${index + 1}`
      : `Creator workflow planning system ${index + 1}`,
   description: "A practical breakdown of creator growth, search strategy, retention, and packaging decisions.",
   tags: index % 2 === 0 ? ["YouTube SEO", "creator growth", "retention"] : ["thumbnail strategy", "content planning"],
   categoryName: "Education",
   format: index % 5 === 0 ? "short" : "long",
   publishedAt: `2026-06-${String((index % 28) + 1).padStart(2, "0")}T12:00:00.000Z`,
   viewCount: index === 2 ? 300000 : 1000 + index,
   metrics: {
    views: index === 2 ? 300000 : 1000 + index,
    watchTime: index === 2 ? 8000 : 25 + index,
    subscribersGained: index === 2 ? 1400 : 2,
   },
  })),
 })

 it("builds a dynamic profile from the connected channel video count, not an account-specific constant", () => {
  const cache = cacheForChannel(27)
  const artifacts = buildBrainOnboardingArtifactsForTest(cache)

  expect(artifacts.evidencePacket.sourceCounts.videos).toBe(27)
  expect(artifacts.knowledgeModel.summary).toContain("27 videos")
  expect(artifacts.toolContextPack.contextBlock).toContain("creator")
  expect(artifacts.knowledgeModel.niche[0]?.summary).toMatch(/youtube|creator|seo|strategy/i)
 })

 it("uses VT-SYNC video metadata when it is richer than the legacy cache", () => {
  const vtSyncSnapshot = getVtSyncSnapshot({
   source: "vt-sync",
   snapshotId: "vt-sync-rich-snapshot",
   channelName: "Different Creator",
   videos: [
    {
     id: "vt-1",
     title: "Ceramic glaze testing for handmade pottery",
     descriptionSnippet: "Detailed pottery glaze experiments and kiln notes.",
     tags: ["pottery", "ceramics", "glaze testing"],
     category: "Howto & Style",
     metrics: { views: 45000, watchTime: 1200 },
    },
    {
     id: "vt-2",
     title: "Wheel throwing bowl form tutorial",
     descriptionSnippet: "A ceramics studio workflow for throwing bowls.",
     tags: ["pottery", "wheel throwing", "ceramics"],
     category: "Howto & Style",
     metrics: { views: 25000 },
    },
   ],
  })

  const artifacts = buildBrainOnboardingArtifactsForTest({ channelId: "ceramics" }, vtSyncSnapshot)

  expect(artifacts.evidencePacket.sourceCounts.videos).toBe(2)
  expect(artifacts.knowledgeModel.niche[0]?.summary).toMatch(/pottery|ceramics|glaze/i)
  expect(artifacts.knowledgeModel.evidenceFingerprint).toContain("vt-sync-rich-snapshot")
 })

 it("ranks top performers ahead of archive rows for evidence selection", () => {
  const cache = cacheForChannel(12)
  const ranked = rankChannelEvidenceVideos(cache.videos as any, 6)

  expect(ranked[0]?.videoId).toBe("video-3")
  expect(ranked[0]?.title).toContain("Creator workflow")
 })

 it("changes the evidence fingerprint when richer account data arrives", () => {
  const first = buildBrainEvidenceFingerprint(cacheForChannel(3), getVtSyncSnapshot({ source: "vt-sync", snapshotId: "run-a", videos: [] }))
  const second = buildBrainEvidenceFingerprint(cacheForChannel(4), getVtSyncSnapshot({ source: "vt-sync", snapshotId: "run-b", videos: [] }))

  expect(first).not.toBe(second)
  expect(first).toContain("3")
  expect(second).toContain("4")
 })
})
