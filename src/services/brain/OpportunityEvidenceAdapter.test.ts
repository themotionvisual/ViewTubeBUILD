import { describe, expect, it } from "vitest"
import type { AIBrainEvidencePack } from "../../types"
import { buildOpportunityEvidenceFromBrainPack } from "./OpportunityEvidenceAdapter"

const pack = (): AIBrainEvidencePack => ({
 promptVersion: "brain-chat-v2",
 intent: "strategy",
 channelId: "channel-a",
 channelName: "History Workshop",
 channelDescription: null,
 capturedAt: "2026-09-25T12:00:00.000Z",
 dataStatus: "ready",
 topVideos: [
  {
   id: "video-top",
   evidenceId: "ev-top",
   title: "Cavalry Explained",
   publishedAt: "2026-09-01T12:00:00.000Z",
   format: "long",
   descriptionSnippet: null,
   tags: ["cavalry"],
   metrics: { views: 1000, watchTime: 100, subscribers: 20, revenue: null, ctr: 6, averagePercentageViewed: 55, likes: 40, comments: 8 },
  },
 ],
 recentVideos: [
  {
   id: "video-recent",
   evidenceId: "ev-recent",
   title: "Artillery Explained",
   publishedAt: "2026-09-20T12:00:00.000Z",
   format: "long",
   descriptionSnippet: null,
   tags: ["artillery"],
   metrics: { views: 500, watchTime: null, subscribers: null, revenue: null, ctr: null, averagePercentageViewed: null, likes: null, comments: null },
  },
 ],
 searchTerms: [],
 trafficSources: [],
 items: [],
 availableMetrics: ["views", "watchTime", "subscribers", "ctr", "averagePercentageViewed"],
 missingInputs: [],
 evidenceIds: ["ev-top", "ev-recent"],
 transcriptRouteRequired: false,
})

describe("OpportunityEvidenceAdapter", () => {
 it("derives bounded channel-scoped opportunities from canonical Brain evidence", () => {
  const result = buildOpportunityEvidenceFromBrainPack({
   channelId: "channel-a",
   evidencePack: pack(),
   now: new Date("2026-09-25T12:00:00.000Z"),
  })

  expect(result).toHaveLength(2)
  expect(result[0]).toMatchObject({
   channelId: "channel-a",
   kind: "catalog_gap",
   evidenceIds: ["ev-top"],
  })
  expect(result.every((item) => item.confidence >= 0 && item.confidence <= 100)).toBe(true)
  expect(result.every((item) => item.impactScore >= 0 && item.impactScore <= 100)).toBe(true)
 })

 it("deduplicates videos present in both top and recent evidence", () => {
  const evidencePack = pack()
  evidencePack.recentVideos.push(evidencePack.topVideos[0])

  const result = buildOpportunityEvidenceFromBrainPack({
   channelId: "channel-a",
   evidencePack,
   now: new Date("2026-09-25T12:00:00.000Z"),
  })

  expect(result.filter((item) => item.videoId === "video-top")).toHaveLength(1)
 })

 it("refuses cross-channel evidence instead of relabeling it", () => {
  const evidencePack = pack()
  evidencePack.channelId = "channel-b"

  expect(buildOpportunityEvidenceFromBrainPack({
   channelId: "channel-a",
   evidencePack,
  })).toEqual([])
 })

 it("returns no invented opportunity when evidence is missing", () => {
  const evidencePack = pack()
  evidencePack.dataStatus = "missing"
  evidencePack.topVideos = []
  evidencePack.recentVideos = []

  expect(buildOpportunityEvidenceFromBrainPack({
   channelId: "channel-a",
   evidencePack,
  })).toEqual([])
 })
})
