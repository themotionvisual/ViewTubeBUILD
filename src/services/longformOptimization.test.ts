import { describe, expect, it } from "vitest"
import {
  buildLongformOptimizationContext,
  rankLongformOptimizationCandidates,
  type LongformOptimizationVideoInput,
} from "./longformOptimization"

const videos: LongformOptimizationVideoInput[] = [
  {
    videoId: "top",
    title: "Top longform",
    format: "long",
    durationSec: 1200,
    views: 120000,
    revenue: 900,
    likes: 6400,
    comments: 810,
    watchTimeHours: 22000,
  },
  {
    videoId: "second",
    title: "Second longform",
    format: "long",
    durationSec: 900,
    views: 84000,
    revenue: 620,
    likes: 4900,
    comments: 540,
    watchTimeHours: 14000,
  },
  {
    videoId: "short",
    title: "Short",
    format: "shorts",
    durationSec: 42,
    views: 900000,
    revenue: 200,
    likes: 30000,
    comments: 2200,
    watchTimeHours: 9000,
  },
]

describe("longform optimization backend", () => {
  it("ranks top-performing longform videos first and excludes Shorts", () => {
    const ranked = rankLongformOptimizationCandidates(videos)
    expect(ranked.map((video) => video.videoId)).toEqual(["top", "second"])
    expect(ranked[0].priorityScore).toBeGreaterThan(ranked[1].priorityScore)
  })

  it("preserves full current-video understanding inputs and creator A/B/C choices", () => {
    const context = buildLongformOptimizationContext({
      ...videos[0],
      description: "Current description",
      tags: ["napoleon", "history"],
      transcript: "Current transcript body",
      thumbnailUrl: "https://example.test/thumb.jpg",
      thumbnailAnalysis: {
        status: "ready",
        concept: "Napoleon centered against battlefield smoke",
        style: "cinematic history",
      },
      categoryId: "27",
      playlistIds: ["pl-1"],
    }, {
      titleAbc: true,
      thumbnailAbc: false,
    })

    expect(context.currentMetadata.title).toBe("Top longform")
    expect(context.currentMetadata.description).toBe("Current description")
    expect(context.currentMetadata.tags).toEqual(["napoleon", "history"])
    expect(context.transcript).toContain("Current transcript")
    expect(context.thumbnail.url).toContain("thumb.jpg")
    expect(context.thumbnail.analysis?.concept).toContain("Napoleon")
    expect(context.experiment).toEqual({ titleAbc: true, thumbnailAbc: false })
    expect(context.integrationTargets).toEqual(expect.arrayContaining(["thumbnail-studio", "video-manager", "ai-brain"]))
  })
})
