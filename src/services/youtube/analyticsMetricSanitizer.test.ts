import { describe, expect, it } from "vitest"
import { sanitizeAnalyticsMetrics } from "./analyticsMetricSanitizer"

describe("analytics metric sanitizer", () => {
  it("removes video reach metrics from dimensionless channel totals", () => {
    expect(sanitizeAnalyticsMetrics([
      "views",
      "videoThumbnailImpressions",
      "videoThumbnailImpressionsClickRate",
    ], { scope: "channel" })).toEqual({
      allowed: ["views"],
      skipped: [
        { metric: "videoThumbnailImpressions", reason: "requires_video_dimension" },
        { metric: "videoThumbnailImpressionsClickRate", reason: "requires_video_dimension" },
      ],
    })
  })

  it("preserves video reach metrics for channel-owned top-video reports", () => {
    expect(sanitizeAnalyticsMetrics([
      "videoThumbnailImpressions",
      "videoThumbnailImpressionsClickRate",
    ], { scope: "channel", dimensions: ["video"] }).allowed).toEqual([
      "videoThumbnailImpressions",
      "videoThumbnailImpressionsClickRate",
    ])
  })

  it("deduplicates metrics without changing their order", () => {
    expect(sanitizeAnalyticsMetrics(["views", "likes", "views"], {
      scope: "channel",
      dimensions: "day",
    }).allowed).toEqual(["views", "likes"])
  })
})
