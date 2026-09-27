// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest"
import {
  enrichLongformVideoWithThumbnailAnalysis,
  type LongformOptimizationVideoInput,
} from "./longformOptimization"

const video: LongformOptimizationVideoInput = {
  videoId: "video-1",
  title: "Napoleon at Austerlitz",
  thumbnailUrl: "data:image/png;base64,ZmFrZQ==",
  views: 1000,
}

describe("Longform Optimizer thumbnail enrichment", () => {
  it("requests vision when the current thumbnail has no ready analysis", async () => {
    const analyzeThumbnail = vi.fn().mockResolvedValue({
      analysis: {
        status: "ready",
        concept: "Napoleon on the battlefield",
        style: "cinematic",
        evidenceId: "asset-vision-1",
      },
      record: { id: "asset-vision-1" },
    })

    const enriched = await enrichLongformVideoWithThumbnailAnalysis({
      channelId: "channel-1",
      video,
      allowModel: true,
      analyzeThumbnail,
    })

    expect(analyzeThumbnail).toHaveBeenCalledOnce()
    expect(enriched.thumbnailAnalysis?.status).toBe("ready")
    expect(enriched.thumbnailAnalysis?.evidenceId).toBe("asset-vision-1")
  })

  it("reuses current ready thumbnail evidence instead of rescanning", async () => {
    const analyzeThumbnail = vi.fn()
    const enriched = await enrichLongformVideoWithThumbnailAnalysis({
      channelId: "channel-1",
      allowModel: true,
      video: {
        ...video,
        thumbnailAnalysis: {
          status: "ready",
          concept: "Existing analysis",
          evidenceId: "existing-1",
        },
      },
      analyzeThumbnail,
    })

    expect(analyzeThumbnail).not.toHaveBeenCalled()
    expect(enriched.thumbnailAnalysis?.evidenceId).toBe("existing-1")
  })

  it("fails soft when thumbnail vision cannot be resolved", async () => {
    const analyzeThumbnail = vi.fn().mockRejectedValue(new Error("CORS"))
    const enriched = await enrichLongformVideoWithThumbnailAnalysis({
      channelId: "channel-1",
      video,
      allowModel: true,
      analyzeThumbnail,
    })

    expect(enriched.thumbnailAnalysis).toBeUndefined()
  })
})
